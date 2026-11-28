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
    `Что нужно вывезти: ${order.details || "не указано"}`,
    `Предварительная стоимость: ${order.price_estimate || "уточнить"}`,
    `Фотографии: ${Array.isArray(order.photos) ? order.photos.length : 0}`,
    "",
    "Нажмите кнопку, чтобы взять заказ. Контакты клиента откроются только первому исполнителю.",
  ].join("\n");
}

async function getReviews(_req, res) {
  try {
    const rows = await supabase(
      "/rest/v1/reviews?select=id,name,rating,text,created_at&order=created_at.desc&limit=100",
    );
    const reviews = (rows || []).map((row) => ({
      id: String(row.id),
      name: row.name,
      date: new Date(row.created_at).toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" }),
      rating: Number(row.rating),
      text: row.text,
    }));
    return json(res, 200, { reviews });
  } catch (error) {
    console.error("Reviews loading failed:", error.message);
    return json(res, 500, { error: "Не удалось загрузить отзывы." });
  }
}

async function createReview(req, res) {
  let input;
  try {
    input = await readJson(req, 8_000);
  } catch {
    return json(res, 400, { error: "Некорректные данные отзыва." });
  }

  const name = String(input.name || "").trim();
  const reviewText = String(input.text || "").trim();
  const rating = Number(input.rating);
  if (name.length < 2 || name.length > 70 ||
      reviewText.length < 10 || reviewText.length > 1000 ||
      !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json(res, 400, { error: "Проверьте имя, оценку и текст отзыва." });
  }

  try {
    const rows = await supabase("/rest/v1/reviews", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ name, rating, text: reviewText }),
    });
    const row = rows?.[0];
    if (!row) throw new Error("Database did not return the created review");
    const review = {
      id: String(row.id),
      name: row.name,
      date: new Date(row.created_at).toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" }),
      rating: Number(row.rating),
      text: row.text,
    };
    return json(res, 201, { ok: true, review });
  } catch (error) {
    console.error("Review creation failed:", error.message);
    return json(res, 500, { error: "Не удалось сохранить отзыв." });
  }
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
  const details = String(input.details || "").trim();
  const price_estimate = String(input.priceEstimate || "").trim();

  if (customer_name.length < 2 || customer_name.length > 70 ||
      phone.replace(/\D/g, "").length !== 11 ||
      address.length > 300 || service.length < 2 || service.length > 200 ||
      volume.length > 200 || details.length < 3 || details.length > 2000 || price_estimate.length > 100) {
    return json(res, 400, { error: "Проверьте имя, телефон и услугу." });
  }

  try {
    const rows = await supabase("/rest/v1/orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        customer_name, phone, address, service,
        volume: volume || null,
        details,
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
      error: `Ошибка сохранения заявки: ${String(error.message || "Unknown error").slice(0, 500)}`,
    });
  }
}



async function getOrderSession(userId) {
  const rows = await supabase(
    `/rest/v1/telegram_order_sessions?telegram_user_id=eq.${encodeURIComponent(userId)}&select=*`,
  );
  return rows?.[0] || null;
}

async function saveOrderSession(userId, chatId, step, data) {
  await supabase("/rest/v1/telegram_order_sessions?on_conflict=telegram_user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      telegram_user_id: userId,
      chat_id: chatId,
      step,
      data,
      updated_at: new Date().toISOString(),
    }),
  });
}

async function deleteOrderSession(userId) {
  await supabase(`/rest/v1/telegram_order_sessions?telegram_user_id=eq.${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

async function startTelegramOrder(message) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const data = {
    customer_name: "",
    phone: "",
    address: "",
    service: "",
    volume: "",
    details: "",
    price_estimate: "",
    photos: [],
  };
  await saveOrderSession(userId, chatId, "name", data);
  await telegram("sendMessage", {
    chat_id: chatId,
    text: "📝 Создадим заявку на вывоз мусора.\\n\\n1/8. Как вас зовут?",
    reply_markup: { keyboard: [[{ text: "❌ Отменить заявку" }]], resize_keyboard: true },
  });
}

async function sendOrderSummary(chatId, userId, data) {
  await saveOrderSession(userId, chatId, "confirm", data);
  await telegram("sendMessage", {
    chat_id: chatId,
    text: [
      "📋 ПРОВЕРЬТЕ ЗАЯВКУ",
      "",
      `Имя: ${data.customer_name}`,
      `Телефон: ${data.phone}`,
      `Адрес: ${data.address}`,
      `Услуга: ${data.service}`,
      `Объём: ${data.volume || "не указан"}`,
      `Что нужно вывезти: ${data.details}`,
      `Предварительная стоимость: ${data.price_estimate || "уточнить"}`,
      `Фотографии: ${data.photos?.length || 0} из 5`,
      "",
      "Если всё верно, нажмите «Отправить заявку».",
    ].join("\\n"),
    reply_markup: {
      inline_keyboard: [[
        { text: "✅ Отправить заявку", callback_data: "bot_order_submit" },
        { text: "❌ Отменить", callback_data: "bot_order_cancel" },
      ]],
    },
  });
}

async function finishTelegramOrder(callback) {
  const userId = callback.from.id;
  const session = await getOrderSession(userId);
  if (!session || session.step !== "confirm") {
    await telegram("answerCallbackQuery", { callback_query_id: callback.id, text: "Заявка не найдена. Начните заново командой /order." , show_alert: true });
    return;
  }
  const data = session.data || {};
  const rows = await supabase("/rest/v1/orders", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      customer_name: data.customer_name,
      phone: data.phone,
      address: data.address,
      service: data.service,
      volume: data.volume || null,
      details: data.details,
      price_estimate: data.price_estimate || null,
      photos: data.photos || [],
    }),
  });
  const order = rows?.[0];
  if (!order) throw new Error("Database did not return the created Telegram order");

  const groupId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!groupId) throw new Error("TELEGRAM_GROUP_CHAT_ID is not configured");

  const photos = Array.isArray(data.photos) ? data.photos.slice(0, 5) : [];
  if (photos.length === 1) {
    await telegram("sendPhoto", { chat_id: groupId, photo: photos[0], caption: `📷 Фото к заявке #${order.id}` });
  } else if (photos.length > 1) {
    await telegram("sendMediaGroup", {
      chat_id: groupId,
      media: photos.map((fileId, index) => ({
        type: "photo",
        media: fileId,
        ...(index === 0 ? { caption: `📷 Фотографии к заявке #${order.id}` } : {}),
      })),
    });
  }
  const groupMessage = await telegram("sendMessage", {
    chat_id: groupId,
    text: orderText(order),
    reply_markup: {
      inline_keyboard: [[{ text: "ВЗЯТЬ ЗАКАЗ", callback_data: `claim:${order.id}` }]],
    },
  });
  await supabase(`/rest/v1/orders?id=eq.${order.id}`, {
    method: "PATCH",
    body: JSON.stringify({ telegram_message_id: groupMessage.message_id }),
  });
  await deleteOrderSession(userId);
  await telegram("answerCallbackQuery", { callback_query_id: callback.id, text: "Заявка отправлена!" });
  await telegram("sendMessage", {
    chat_id: callback.message.chat.id,
    text: `✅ Заявка #${order.id} отправлена диспетчеру. Мы свяжемся с вами.`,
    reply_markup: {
      keyboard: [[{ text: "📝 Создать заявку" }, { text: "📞 Связаться с диспетчером" }]],
      resize_keyboard: true,
    },
  });
}

async function handleTelegramOrderMessage(message, suppliedPhone = "") {
  const userId = message.from?.id;
  const chatId = message.chat?.id;
  if (!userId || !chatId || message.chat.type !== "private") return false;

  const text = String(message.text || "").trim();
  if (text === "/start" || text.startsWith("/start ")) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "Здравствуйте! Здесь можно оформить заявку на вывоз мусора, мебели или демонтаж. Нажмите кнопку ниже.",
      reply_markup: { keyboard: [[{ text: "📝 Создать заявку" }]], resize_keyboard: true },
    });
    return true;
  }
  if (text === "/order" || text.startsWith("/order@") || text === "📝 Создать заявку") {
    await startTelegramOrder(message);
    return true;
  }
  if (text === "❌ Отменить заявку") {
    await deleteOrderSession(userId);
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "Заявка отменена. Чтобы создать новую, нажмите «Создать заявку».",
      reply_markup: { keyboard: [[{ text: "📝 Создать заявку" }]], resize_keyboard: true },
    });
    return true;
  }

  const session = await getOrderSession(userId);
  if (!session) return false;
  const data = session.data || {};
  const value = suppliedPhone || text;

  if (session.step === "name") {
    if (value.length < 2 || value.length > 70) {
      await telegram("sendMessage", { chat_id: chatId, text: "Введите имя (от 2 до 70 символов)." });
      return true;
    }
    data.customer_name = value;
    await saveOrderSession(userId, chatId, "phone", data);
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "2/8. Отправьте номер телефона или нажмите кнопку ниже.",
      reply_markup: { keyboard: [[{ text: "📱 Отправить номер телефона", request_contact: true }], [{ text: "❌ Отменить заявку" }]], resize_keyboard: true },
    });
    return true;
  }
  if (session.step === "phone") {
    const digits = value.replace(/\\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      await telegram("sendMessage", { chat_id: chatId, text: "Введите корректный номер телефона или отправьте свой контакт кнопкой." });
      return true;
    }
    data.phone = value;
    await saveOrderSession(userId, chatId, "address", data);
    await telegram("sendMessage", { chat_id: chatId, text: "3/8. Укажите адрес, откуда нужно вывезти мусор." });
    return true;
  }
  if (session.step === "address") {
    if (value.length < 4 || value.length > 300) {
      await telegram("sendMessage", { chat_id: chatId, text: "Укажите адрес подробнее." });
      return true;
    }
    data.address = value;
    await saveOrderSession(userId, chatId, "service", data);
    await telegram("sendMessage", { chat_id: chatId, text: "4/8. Какая услуга нужна? Например: строительный мусор, мебель, бытовой мусор, демонтаж." });
    return true;
  }
  if (session.step === "service") {
    if (value.length < 2 || value.length > 200) {
      await telegram("sendMessage", { chat_id: chatId, text: "Напишите, какая услуга нужна." });
      return true;
    }
    data.service = value;
    await saveOrderSession(userId, chatId, "volume", data);
    await telegram("sendMessage", { chat_id: chatId, text: "5/8. Укажите объём работ: количество мешков, кубометры, мебель или размер контейнера." });
    return true;
  }
  if (session.step === "volume") {
    if (value.length > 200) {
      await telegram("sendMessage", { chat_id: chatId, text: "Слишком длинный ответ. Укажите объём короче." });
      return true;
    }
    data.volume = value;
    await saveOrderSession(userId, chatId, "details", data);
    await telegram("sendMessage", { chat_id: chatId, text: "6/8. Подробно расскажите, что именно нужно вывезти и откуда (этаж, лифт, погрузка)." });
    return true;
  }
  if (session.step === "details") {
    if (value.length < 3 || value.length > 2000) {
      await telegram("sendMessage", { chat_id: chatId, text: "Добавьте немного подробностей (от 3 символов)." });
      return true;
    }
    data.details = value;
    await saveOrderSession(userId, chatId, "price", data);
    await telegram("sendMessage", { chat_id: chatId, text: "7/8. Укажите предварительную стоимость, если уже знаете. Если нет — напишите «уточнить»." });
    return true;
  }
  if (session.step === "price") {
    if (value.length > 100) {
      await telegram("sendMessage", { chat_id: chatId, text: "Укажите стоимость короче." });
      return true;
    }
    data.price_estimate = value.toLowerCase() === "уточнить" ? "" : value;
    await saveOrderSession(userId, chatId, "photos", data);
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "8/8. Пришлите до 5 фотографий объёма работ. Можно отправить несколько фото по очереди. Когда закончите, нажмите «Готово». Если фото нет — нажмите «Без фото».",
      reply_markup: { inline_keyboard: [[{ text: "✅ Готово", callback_data: "bot_photos_done" }, { text: "Пропустить фото", callback_data: "bot_photos_skip" }]] },
    });
    return true;
  }
  if (session.step === "photos") {
    if (Array.isArray(message.photo) && message.photo.length) {
      if ((data.photos || []).length >= 5) {
        await telegram("sendMessage", { chat_id: chatId, text: "Можно добавить максимум 5 фотографий. Нажмите «Готово»." });
        return true;
      }
      data.photos = [...(data.photos || []), message.photo[message.photo.length - 1].file_id].slice(0, 5);
      await saveOrderSession(userId, chatId, "photos", data);
      await telegram("sendMessage", {
        chat_id: chatId,
        text: `Фото добавлено: ${data.photos.length}/5. Отправьте ещё или нажмите «Готово».`,
        reply_markup: { inline_keyboard: [[{ text: "✅ Готово", callback_data: "bot_photos_done" }]] },
      });
      return true;
    }
    await telegram("sendMessage", { chat_id: chatId, text: "Пришлите фотографию или нажмите «Готово» / «Пропустить фото»." });
    return true;
  }
  if (session.step === "confirm") {
    await telegram("sendMessage", { chat_id: chatId, text: "Проверьте заявку выше и нажмите «Отправить заявку» или «Отменить»." });
    return true;
  }
  return false;
}

async function handleTelegramOrderCallback(callback) {
  if (!["bot_photos_done", "bot_photos_skip", "bot_order_submit", "bot_order_cancel"].includes(callback.data)) return false;
  const userId = callback.from.id;
  if (callback.data === "bot_order_cancel") {
    await deleteOrderSession(userId);
    await telegram("answerCallbackQuery", { callback_query_id: callback.id, text: "Заявка отменена." });
    await telegram("sendMessage", { chat_id: callback.message.chat.id, text: "Заявка отменена. Для новой заявки нажмите /order." });
    return true;
  }
  if (callback.data === "bot_order_submit") {
    await finishTelegramOrder(callback);
    return true;
  }
  const session = await getOrderSession(userId);
  if (!session || session.step !== "photos") {
    await telegram("answerCallbackQuery", { callback_query_id: callback.id, text: "Этап заявки не найден.", show_alert: true });
    return true;
  }
  await sendOrderSummary(session.chat_id, userId, session.data || {});
  await telegram("answerCallbackQuery", { callback_query_id: callback.id, text: "Проверьте заявку." });
  return true;
}

async function handleTelegramUpdate(update) {
  const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (update.message?.contact) {
    const contact = update.message.contact;
    const senderId = update.message.from?.id;
    const session = senderId ? await getOrderSession(senderId) : null;
    if (session?.step === "phone" && contact.user_id === senderId) {
      await handleTelegramOrderMessage(update.message, contact.phone_number);
      return;
    }
    if (adminId && senderId && contact.user_id === senderId) {
      await telegram("sendMessage", {
        chat_id: adminId,
        text: [
          "📞 ИСПОЛНИТЕЛЬ ПОДЕЛИЛСЯ НОМЕРОМ",
          `Имя: ${[update.message.from.first_name, update.message.from.last_name].filter(Boolean).join(" ") || "не указано"}`,
          `Telegram: ${update.message.from.username ? "@" + update.message.from.username : "username не указан"}`,
          `Telegram ID: ${senderId}`,
          `Телефон: ${contact.phone_number}`,
        ].join("\\n"),
      });
      await telegram("sendMessage", { chat_id: senderId, text: "Спасибо! Ваш номер передан диспетчеру." });
    }
    return;
  }

  if (update.message?.text === "/chatid" || update.message?.text?.startsWith("/chatid@")) {
    await telegram("sendMessage", {
      chat_id: update.message.chat.id,
      text: `ID этого чата: ${update.message.chat.id}`,
      reply_to_message_id: update.message.message_id,
    });
    return;
  }

  if (update.message && await handleTelegramOrderMessage(update.message)) return;

  const callback = update.callback_query;
  if (!callback) return;
  if (await handleTelegramOrderCallback(callback)) return;
  if (!callback.data?.startsWith("claim:")) return;

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
          `Что нужно вывезти: ${claimed[0].details || "не указано"}`,
          `Цена: ${claimed[0].price_estimate || "уточнить у диспетчера"}`,
          "",
          "Свяжитесь с диспетчером для подтверждения заказа.",
          "Чтобы диспетчер мог связаться с вами, при желании отправьте свой номер кнопкой ниже.",
        ].join("\\n"),
        reply_markup: {
          keyboard: [[{ text: "📞 Отправить мой номер диспетчеру", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
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
    if (adminId) {
      try {
        await telegram("sendMessage", {
          chat_id: adminId,
          text: [
            `🔔 ИСПОЛНИТЕЛЬ ВЗЯЛ ЗАКАЗ #${orderId}`,
            `Исполнитель: ${username}`,
            `Telegram ID: ${executorId}`,
            `Telegram: ${callback.from.username ? "https://t.me/" + callback.from.username : "username не указан"}`,
            `Услуга: ${claimed[0].service}`,
            `Адрес: ${claimed[0].address || "не указан"}`,
            `Объём: ${claimed[0].volume || "не указан"}`,
            `Что нужно вывезти: ${claimed[0].details || "не указано"}`,
            `Цена: ${claimed[0].price_estimate || "уточнить"}`,
            "Телефон исполнителя: ожидается — исполнитель может отправить его кнопкой в личном чате с ботом.",
          ].join("\\n"),
        });
      } catch (adminError) {
        console.error("Admin notification failed:", adminError.message);
      }
    }
    await telegram("answerCallbackQuery", { callback_query_id: callback.id, text: "Заказ закреплён! Контакты отправлены вам в личные сообщения." });
    const message = callback.message;
    if (message) {
      await telegram("editMessageText", {
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: `✅ ЗАКАЗ #${orderId} ВЗЯТ\\nИсполнитель: ${username}\\nКонтакты клиента отправлены исполнителю в личные сообщения.`,
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
  if (req.method === "GET" && req.url === "/api/reviews") return getReviews(req, res);
  if (req.method === "POST" && req.url === "/api/reviews") return createReview(req, res);
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
