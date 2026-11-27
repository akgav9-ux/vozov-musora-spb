import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DIST = path.join(__dirname, "dist");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function json(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(data));
}

async function readJson(req, limit = 32_000) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw new Error("BODY_TOO_LARGE");
  }
  return body ? JSON.parse(body) : {};
}

async function supabase(pathname, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing");
  const response = await fetch(new URL(pathname, url), {
    ...options,
    headers: {
      apikey: key,
      ...(key.startsWith("sb_secret_") ? {} : { authorization: `Bearer ${key}` }),
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : null;
}

async function telegram(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram bot token is not configured");
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.description || "Telegram API error");
  return result.result;
}

function orderText(order) {
  return [
    "🆕 НОВАЯ ЗАЯВКА",
    `Номер: #${order.id}`,
    `Услуга: ${order.service}`,
    `Объём: ${order.volume || "не указан"}`,
    `Предварительная стоимость: ${order.price_estimate || "уточнить"}`,
    "",
    "Нажмите кнопку, чтобы взять заказ. Контакты клиента откроются только первому исполнителю.",
  ].join("\n");
}

async function createOrder(req, res) {
  let input;
  try {
    input = await readJson(req);
  } catch {
    return json(res, 400, { error: "Некорректные данные формы." });
  }
  const customer_name = String(input.name || "").trim();
  const phone = String(input.phone || "").trim();
  const address = String(input.address || "").trim();
  const service = String(input.service || "").trim();
  const volume = String(input.volume || "").trim();
  const price_estimate = String(input.priceEstimate || "").trim();

  if (customer_name.length < 2 || customer_name.length > 70 ||
      phone.replace(/\D/g, "").length !== 11 ||
      address.length > 300 || service.length < 2 || service.length > 200 ||
      volume.length > 100 || price_estimate.length > 100) {
    return json(res, 400, { error: "Проверьте имя, телефон и услугу." });
  }

  try {
    const rows = await supabase("/rest/v1/orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        customer_name, phone, address, service,
        volume: volume || null,
        price_estimate: price_estimate || null,
      }),
    });
    const order = rows?.[0];
    if (!order) throw new Error("Database did not return the created order");

    let telegramSent = false;
    const groupId = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (groupId && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const message = await telegram("sendMessage", {
          chat_id: groupId,
          text: orderText(order),
          reply_markup: {
            inline_keyboard: [[{ text: "ВЗЯТЬ ЗАКАЗ", callback_data: `claim:${order.id}` }]],
          },
        });
        telegramSent = true;
        await supabase(`/rest/v1/orders?id=eq.${order.id}`, {
          method: "PATCH",
          body: JSON.stringify({ telegram_message_id: message.message_id }),
        });
      } catch (error) {
        console.error("Telegram notification failed:", error.message);
      }
    }
    return json(res, 201, { ok: true, orderId: order.id, telegramSent });
  } catch (error) {
    console.error("Order creation failed:", error.message);
    return json(res, 500, {
      error: "Не удалось принять заявку. Попробуйте ещё раз или позвоните диспетчеру.",
      diagnostic: String(error.message || "Unknown error").slice(0, 500),
    });
  }
}

async function handleTelegramUpdate(update) {
  if (update.message?.text === "/chatid" || update.message?.text?.startsWith("/chatid@")) {
    await telegram("sendMessage", {
      chat_id: update.message.chat.id,
      text: `ID этого чата: ${update.message.chat.id}`,
      reply_to_message_id: update.message.message_id,
    });
    return;
  }

  const callback = update.callback_query;
  if (!callback?.data?.startsWith("claim:")) return;
  const orderId = callback.data.slice(6);
  const executorId = callback.from.id;
  const username = callback.from.username ? `@${callback.from.username}` : [callback.from.first_name, callback.from.last_name].filter(Boolean).join(" ");
  try {
    const claimed = await supabase(
      `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&claimed_by_telegram_id=is.null&status=eq.new`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "claimed",
          claimed_by_telegram_id: executorId,
          claimed_by_username: username,
          updated_at: new Date().toISOString(),
        }),
      },
    );
    if (!claimed?.length) {
      await telegram("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Этот заказ уже забрал другой исполнитель.",
        show_alert: true,
      });
      return;
    }
    try {
      await telegram("sendMessage", {
        chat_id: executorId,
        text: [
          `✅ Вы забрали заказ #${orderId}`,
          `Услуга: ${claimed[0].service}`,
          `Имя клиента: ${claimed[0].customer_name}`,
          `Телефон: ${claimed[0].phone}`,
          `Адрес: ${claimed[0].address || "не указан"}`,
          `Объём: ${claimed[0].volume || "не указан"}`,
          `Цена: ${claimed[0].price_estimate || "уточнить у диспетчера"}`,
          "",
          "Свяжитесь с диспетчером для подтверждения заказа.",
        ].join("\n"),
      });
    } catch (dmError) {
      await supabase(
        `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&claimed_by_telegram_id=eq.${executorId}&status=eq.claimed`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "new",
            claimed_by_telegram_id: null,
            claimed_by_username: null,
            updated_at: new Date().toISOString(),
          }),
        },
      );
      await telegram("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Сначала откройте @VozovMusoraSPB247_bot и нажмите START. Затем снова возьмите заказ.",
        show_alert: true,
      });
      return;
    }
    await telegram("answerCallbackQuery", { callback_query_id: callback.id, text: "Заказ закреплён! Контакты отправлены вам в личные сообщения." });
    const message = callback.message;
    if (message) {
      await telegram("editMessageText", {
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: `✅ ЗАКАЗ #${orderId} ВЗЯТ\nИсполнитель: ${username}\nКонтакты клиента отправлены исполнителю в личные сообщения.`,
      });
    }
  } catch (error) {
    console.error("Claim callback failed:", error.message);
    await telegram("answerCallbackQuery", {
      callback_query_id: callback.id,
      text: "Не удалось закрепить заказ. Сообщите диспетчеру.",
      show_alert: true,
    });
  }
}

async function serveStatic(req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const file = path.resolve(DIST, "." + requested);
  if (!file.startsWith(DIST + path.sep) && file !== path.join(DIST, "index.html")) {
    return json(res, 403, { error: "Forbidden" });
  }
  try {
    const stat = await fs.promises.stat(file);
    if (!stat.isFile()) throw new Error("Not a file");
    res.writeHead(200, {
      "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "cache-control": path.extname(file) === ".html" ? "no-cache" : "public, max-age=86400",
    });
    fs.createReadStream(file).pipe(res);
  } catch {
    if (!path.extname(pathname)) {
      try {
        const html = await fs.promises.readFile(path.join(DIST, "index.html"));
        res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-cache" });
        res.end(html);
        return;
      } catch {}
    }
    json(res, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") return json(res, 200, { ok: true });
  if (req.method === "POST" && req.url === "/api/orders") return createOrder(req, res);
  if (req.method === "POST" && req.url === "/api/telegram/webhook") {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!expected || req.headers["x-telegram-bot-api-secret-token"] !== expected) {
      return json(res, 401, { error: "Unauthorized" });
    }
    try {
      const update = await readJson(req);
      await handleTelegramUpdate(update);
      return json(res, 200, { ok: true });
    } catch (error) {
      console.error("Telegram webhook failed:", error.message);
      return json(res, 200, { ok: true });
    }
  }
  if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
  return json(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`Vozov app server listening on 0.0.0.0:${PORT}`);
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookUrl && webhookSecret && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      await telegram("setWebhook", {
        url: webhookUrl,
        secret_token: webhookSecret,
        allowed_updates: ["message", "callback_query"],
      });
      console.log("Telegram webhook configured.");
    } catch (error) {
      console.error("Telegram webhook setup failed:", error.message);
    }
  }
});
