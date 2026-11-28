import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Box,
  Check,
  CheckCheck,
  ChevronDown,
  LockKeyhole,
  MapPin,
  Menu,
  Phone,
  Play,
  Send,
  ShieldCheck,
  Star,
  Timer,
  X,
} from "lucide-react";
import Modal from "./components/Modal";
import {
  RecycleMark,
  ServiceIcon,
  TelegramIcon,
  VkIcon,
  WhatsAppIcon,
} from "./components/Icons";
import {
  formatPhone,
  initialReviews,
  money,
  prices,
  services,
  whatsappUrl,
  type Review,
} from "./data";

interface Quote {
  address: string;
  type: string;
  volume: string;
  phone: string;
  details: string;
  price: number;
}

type ModalState =
  | { type: "request"; service?: string; quote?: Quote; volume?: string }
  | { type: "service"; id: string }
  | { type: "about" | "prices" | "reviews" | "privacy" | "sitemap" }
  | null;

const benefits = [
  "Быстрая подача машины",
  "Честные цены без скрытых платежей",
  "Опытные грузчики и водители",
  "Аккуратная работа",
  "Вывоз на полигоны СПб и области",
];

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#home"
      aria-label="ВывозМусора СПб - на главную"
    >
      <span className="brand-mark">
        <RecycleMark />
      </span>
      <span className="brand-name">
        ВывозМусора<span>СПб</span>
      </span>
    </a>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="check-item">
      <span className="check-icon">
        <Check strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.55, ease: [0.2, 0.65, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <span className="stars" role="img" aria-label={`Оценка ${rating} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} fill={i < rating ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="review-card">
      <div className="review-top">
        {review.avatar ? (
          <img
            src={`/images/${review.avatar}`}
            alt=""
            className="review-avatar"
            loading="lazy"
          />
        ) : (
          <span className="review-avatar avatar-initials">
            {review.name
              .split(" ")
              .map((name) => name[0])
              .slice(0, 2)
              .join("")}
          </span>
        )}
        <div>
          <h3>{review.name}</h3>
          <time>{review.date}</time>
          <Stars rating={review.rating} />
        </div>
      </div>
      <p>{review.text}</p>
    </article>
  );
}

function Calculator({ onRequest }: { onRequest: (quote: Quote) => void }) {
  const [address, setAddress] = useState("");
  const [type, setType] = useState("construction");
  const [material, setMaterial] = useState("");
  const [volume, setVolume] = useState("");
  const [quantity, setQuantity] = useState("");
  const [floor, setFloor] = useState("");
  const [lift, setLift] = useState("");
  const [loaders, setLoaders] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);

  const typeNames: Record<string, string> = {
    construction: "Строительный мусор", household: "Бытовой мусор",
    furniture: "Мебель и техника", demolition: "Демонтаж", container: "Заказ контейнера",
  };

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length !== 11) {
      setPhoneError(true);
      return;
    }
    const detailLines = [
      "Категория: " + typeNames[type],
      material ? "Что вывозим / материал: " + material : "",
      quantity ? "Количество: " + quantity : "",
      volume ? "Контейнер: " + volume + " м³" : "",
      floor ? "Этаж: " + floor : "",
      lift ? "Лифт: " + lift : "",
      loaders ? "Грузчики: " + loaders : "",
    ].filter(Boolean);
    setQuote({
      address, type, volume: quantity || (volume ? "Контейнер " + volume + " м³" : "Объём уточняется"),
      phone, details: detailLines.join("\n"), price: 0,
    });
  };

  return (
    <div className="calculator" id="calculator">
      {quote ? (
        <motion.div className="quote-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} aria-live="polite">
          <span className="result-check"><CheckCheck /></span>
          <h3>Данные для расчёта готовы</h3>
          <p>Диспетчер уточнит стоимость по объёму, весу и условиям погрузки.</p>
          <strong className="quote-price">Индивидуальный расчёт</strong>
          <p className="quote-address"><MapPin size={15} />{quote.address}</p>
          <button className="button button-yellow" onClick={() => onRequest(quote)}>Продолжить оформление <ArrowRight /></button>
          <button className="text-button" onClick={() => setQuote(null)}>Изменить данные</button>
          <small>Никаких неподтверждённых цен — согласуем стоимость до начала работ.</small>
        </motion.div>
      ) : (
        <>
          <div className="calculator-title"><Timer /><h3>Рассчитайте стоимость<br />за 1 минуту</h3></div>
          <form onSubmit={calculate} className="calculator-form">
            <label className="input-wrap"><MapPin />
              <input aria-label="Адрес" placeholder="Адрес вывоза в СПб или области" required minLength={5}
                value={address} onChange={(event) => setAddress(event.target.value)} autoComplete="street-address" />
            </label>
            <label className="input-wrap select-wrap"><Box />
              <select aria-label="Тип услуги" value={type} onChange={(event) => { setType(event.target.value); setMaterial(""); setVolume(""); setQuantity(""); }}>
                <option value="construction">Строительный мусор</option><option value="household">Бытовой мусор</option>
                <option value="furniture">Мебель и техника</option><option value="demolition">Демонтаж</option>
                <option value="container">Заказ контейнера / ПУХТО</option>
              </select><ChevronDown className="select-chevron" />
            </label>
            {type === "construction" && <>
              <label className="input-wrap select-wrap"><Box />
                <select aria-label="Материал" required value={material} onChange={(event) => setMaterial(event.target.value)}>
                  <option value="">Выберите материал</option><option>Кирпич и бетон</option><option>Плитка и штукатурка</option>
                  <option>Дерево</option><option>Гипсокартон</option><option>Смешанный строительный мусор</option><option>Другое</option>
                </select><ChevronDown className="select-chevron" />
              </label>
              <label className="input-wrap"><BarChart3 /><input required placeholder="Объём или количество мешков" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
            </>}
            {type === "household" && <>
              <label className="input-wrap select-wrap"><Box />
                <select value={material} required aria-label="Вид бытового мусора" onChange={(event) => setMaterial(event.target.value)}>
                  <option value="">Что нужно вывезти?</option><option>Мешки с бытовым мусором</option><option>Коробки и старые вещи</option>
                  <option>Смешанный бытовой мусор</option><option>Другое</option>
                </select><ChevronDown className="select-chevron" />
              </label>
              <label className="input-wrap"><BarChart3 /><input required placeholder="Количество мешков / коробок или м³" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
            </>}
            {type === "furniture" && <>
              <label className="input-wrap select-wrap"><Box />
                <select value={material} required aria-label="Мебель или техника" onChange={(event) => setMaterial(event.target.value)}>
                  <option value="">Выберите предмет</option><option>Диван</option><option>Кресло</option><option>Шкаф</option>
                  <option>Кровать / матрас</option><option>Стол / стулья</option><option>Холодильник</option>
                  <option>Стиральная машина</option><option>Плита / духовка</option><option>Несколько предметов / другое</option>
                </select><ChevronDown className="select-chevron" />
              </label>
              <label className="input-wrap"><BarChart3 /><input required placeholder="Количество предметов" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
            </>}
            {type === "demolition" && <>
              <label className="input-wrap select-wrap"><Box />
                <select value={material} required aria-label="Что демонтировать" onChange={(event) => setMaterial(event.target.value)}>
                  <option value="">Что нужно демонтировать?</option><option>Перегородки / стены</option><option>Полы / стяжка</option>
                  <option>Плитка / сантехника</option><option>Старая мебель / встроенные конструкции</option>
                  <option>Комплексный демонтаж</option><option>Другое</option>
                </select><ChevronDown className="select-chevron" />
              </label>
              <label className="input-wrap"><BarChart3 /><input required placeholder="Площадь или объём работ (м² / м³)" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
            </>}
            {type === "container" && <>
              <label className="input-wrap select-wrap"><BarChart3 />
                <select required value={volume} aria-label="Объём контейнера" onChange={(event) => setVolume(event.target.value)}>
                  <option value="">Объём контейнера</option>{["6","8","12","14","20","27"].map((v) => <option key={v} value={v}>{v} м³</option>)}
                </select><ChevronDown className="select-chevron" />
              </label>
              <label className="input-wrap"><Box /><input placeholder="Что будет загружаться в контейнер?" value={material} onChange={(event) => setMaterial(event.target.value)} required /></label>
            </>}
            <label className="input-wrap"><BarChart3 /><input placeholder="Этаж (если вынос не нужен — 0)" value={floor} onChange={(event) => setFloor(event.target.value)} /></label>
            <label className="input-wrap select-wrap"><Box />
              <select aria-label="Лифт" value={lift} onChange={(event) => setLift(event.target.value)}>
                <option value="">Наличие лифта</option><option>Грузовой лифт</option><option>Пассажирский лифт</option>
                <option>Лифта нет</option><option>Не требуется вынос</option>
              </select><ChevronDown className="select-chevron" />
            </label>
            <label className="input-wrap select-wrap"><Box />
              <select aria-label="Грузчики" value={loaders} onChange={(event) => setLoaders(event.target.value)}>
                <option value="">Нужны ли грузчики?</option><option>Да, нужны</option>
                <option>Нет, погрузим самостоятельно</option><option>Нужна консультация</option>
              </select><ChevronDown className="select-chevron" />
            </label>
            <label className={`input-wrap ${phoneError ? "input-error" : ""}`}><Phone />
              <input aria-label="Телефон" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+7 (___) ___-__-__"
                value={phone} aria-invalid={phoneError} onChange={(event) => { setPhone(formatPhone(event.target.value)); setPhoneError(false); }} />
            </label>
            {phoneError && <span className="field-error">Введите номер полностью: 11 цифр</span>}
            <button type="submit" className="button button-yellow calculator-submit">Подготовить заявку <ArrowRight /></button>
          </form>
          <p className="data-safe"><LockKeyhole /> Диспетчер уточнит стоимость до начала работ</p>
        </>
      )}
    </div>
  );
}

function RequestForm({
  service: initialService = "",
  quote,
  volume,
}: {
  service?: string;
  quote?: Quote;
  volume?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(quote?.phone || "");
  const [address, setAddress] = useState(quote?.address || "");
  const [volumeText, setVolumeText] = useState(
    quote?.volume || prices.find((price) => price.volume === volume)?.title || "",
  );
  const [details, setDetails] = useState(quote?.details || "");
  const [service, setService] = useState(initialService);
  const [phoneError, setPhoneError] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [telegramSent, setTelegramSent] = useState(false);
  const selectedVolume = prices.find(
    (price) => price.volume === (quote?.volume || volume),
  );
  const selectedService = services.find((item) => item.id === service);
  const serviceName = selectedService?.title || "Вывоз мусора";
  const estimateLabel = quote
    ? "Стоимость уточнит диспетчер"
    : selectedVolume
      ? `от ${money(Math.max(2000, selectedVolume.price))} ₽`
      : selectedService?.price === "Индивидуальный расчёт"
        ? "Индивидуальный расчёт"
        : selectedService?.price || "Стоимость уточнит диспетчер";
  const message = `Здравствуйте! Хочу заказать услугу: ${serviceName}.\nИмя: ${name}.\nТелефон: ${phone}.\nАдрес: ${address || "уточню у диспетчера"}.\nПримерный объём: ${volumeText || "не указан"}.\nЧто именно нужно вывезти: ${details || "не указано"}.${quote ? `\nПредварительный расчёт: от ${money(quote.price)} ₽.` : ""}`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length !== 11) {
      setPhoneError(true);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          service: serviceName,
          volume: volumeText,
          details,
          priceEstimate: estimateLabel,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось отправить заявку.");
      setTelegramSent(Boolean(result.telegramSent));
      setReady(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ошибка отправки. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  if (ready)
    return (
      <motion.div
        className="request-ready"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        aria-live="polite"
      >
        <span className="large-check">
          <CheckCheck />
        </span>
        <h3>{name}, ваша заявка готова!</h3>
        <p>
          {telegramSent
            ? "Заявка передана диспетчеру. Мы свяжемся с вами, уточним детали и согласуем время подачи машины."
            : "Заявка сохранена. Если вам нужно срочно оформить вывоз, позвоните диспетчеру по указанному ниже номеру."}
        </p>
        <div className="request-summary">
          <span>{serviceName}</span>
          {address && (
            <span>
              <MapPin size={16} />
              {address}
            </span>
          )}
          {volumeText && <span>Примерный объём: {volumeText}</span>}
          {details && <span>Что вывезти: {details}</span>}
          <span>
            <Phone size={16} />
            {phone}
          </span>
          <strong>Стоимость: {estimateLabel}</strong>
        </div>
        <a
          className="button button-yellow"
          href={whatsappUrl(message)}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon /> Отправить в WhatsApp <ArrowRight />
        </a>
        <button className="text-button" onClick={() => setReady(false)}>
          Изменить заявку
        </button>
        <small>
          Или позвоните: <a href="tel:+79673448484">+7 (967) 344-84-84</a>
        </small>
      </motion.div>
    );

  return (
    <form className="request-form" onSubmit={submit}>
      <p className="modal-intro">
        Расскажите, что нужно вывезти. Подберём машину и подготовим заявку для
        диспетчера.
      </p>
      <div className="selected-order">
        <Box size={19} />
        <span>Предварительная стоимость</span>
        <strong>{estimateLabel}</strong>
      </div>
      <p className="form-note">
        Цена пока не рассчитывается автоматически: диспетчер уточнит вес, объём, расстояние и условия погрузки и согласует стоимость заранее.
      </p>
      <label>
        Ваше имя
        <input
          placeholder="Как к вам обращаться?"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="given-name"
          required
          minLength={2}
          maxLength={70}
        />
      </label>
      <label>
        Номер телефона
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          required
          value={phone}
          aria-invalid={phoneError}
          onChange={(event) => {
            setPhone(formatPhone(event.target.value));
            setPhoneError(false);
          }}
        />
        {phoneError && (
          <span className="field-error">Укажите полный номер телефона</span>
        )}
      </label>
      <label>
        Услуга
        <select
          aria-label="Услуга"
          value={service}
          onChange={(event) => setService(event.target.value)}
          required
        >
          <option value="" disabled>
            Выберите услугу
          </option>
          {services.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Адрес в Санкт-Петербурге или области
        <input
          placeholder="Улица, дом"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          autoComplete="street-address"
        />
      </label>
      <label>
        Примерный объём или количество
        <input
          placeholder="Например: 10 мешков, 1 холодильник, 2 м³"
          value={volumeText}
          onChange={(event) => setVolumeText(event.target.value)}
          maxLength={200}
        />
      </label>
      <label>
        Что именно нужно вывезти? Укажите подробности
        <textarea
          placeholder="Например: старый двухкамерный холодильник; или пианино со 2-го этажа; или строительный мусор в 15 мешках. Укажите этаж, наличие лифта, разборку и другие важные детали."
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          rows={4}
          maxLength={2000}
          required
        />
      </label>
      <label className="consent">
        <input type="checkbox" required defaultChecked />
        <span>
          Согласен на обработку персональных данных для подготовки и исполнения
          заявки.
        </span>
      </label>
      {submitError && <p className="field-error" role="alert">{submitError}</p>}
      <button className="button button-yellow" type="submit" disabled={submitting}>
        {submitting ? "Отправляем заявку..." : "Отправить заявку"} <ArrowRight />
      </button>
      <p className="form-note">
        <LockKeyhole size={13} /> Без предоплаты. Стоимость согласуем заранее.
      </p>
    </form>
  );
}

function AboutContent({ onRequest }: { onRequest: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Вы оставляете заявку",
      text: "Сообщите адрес, тип мусора и примерный объём. Мы подберём машину и сразу назовём предварительную стоимость.",
      image: "hero-truck.jpg",
    },
    {
      title: "Мы берём работу на себя",
      text: "Бригада приедет в согласованное время, аккуратно вынесет и погрузит мусор. Вам не нужно искать грузчиков отдельно.",
      image: "workers.jpg",
    },
    {
      title: "Чистота без лишних хлопот",
      text: "Отвезём отходы на официальный полигон, а после погрузки наведём порядок. Вы принимаете работу и оплачиваете услугу.",
      image: "demolition.jpg",
    },
  ];
  return (
    <div className="about-content">
      <div className="about-image">
        <AnimatePresence mode="wait">
          <motion.img
            key={step}
            src={`/images/${steps[step].image}`}
            alt={steps[step].title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        <span>0{step + 1} / 03</span>
      </div>
      <div className="about-step">
        <p className="eyebrow">ПРОСТО. ПОНЯТНО. ВОВРЕМЯ.</p>
        <h3>{steps[step].title}</h3>
        <p>{steps[step].text}</p>
      </div>
      <div className="about-controls">
        <button
          className="round-button"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          aria-label="Предыдущий шаг"
        >
          <ArrowLeft />
        </button>
        <div className="step-dots">
          {steps.map((_, index) => (
            <button
              key={index}
              className={index === step ? "active" : ""}
              aria-label={`Шаг ${index + 1}`}
              onClick={() => setStep(index)}
            />
          ))}
        </div>
        <button
          className="round-button"
          disabled={step === 2}
          onClick={() => setStep(step + 1)}
          aria-label="Следующий шаг"
        >
          <ArrowRight />
        </button>
      </div>
      <button className="button button-yellow" onClick={onRequest}>
        Оставить заявку <ArrowRight />
      </button>
    </div>
  );
}

function ReviewsContent({
  reviews,
  onAdd,
}: {
  reviews: Review[];
  onAdd: (review: Review) => void;
}) {
  const [writing, setWriting] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [order, setOrder] = useState("new");
  const [added, setAdded] = useState(false);
  const dateNumber = (date: string) =>
    Number(date.split(".").reverse().join(""));
  const averageRating =
    reviews.reduce((total, review) => total + review.rating, 0) /
    reviews.length;
  const sortedReviews = [...reviews].sort((a, b) =>
    order === "new"
      ? dateNumber(b.date) - dateNumber(a.date)
      : dateNumber(a.date) - dateNumber(b.date),
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onAdd({
      id: `local-${Date.now()}`,
      name: name.trim(),
      date: new Date().toLocaleDateString("ru-RU"),
      rating,
      text: text.trim(),
    });
    setWriting(false);
    setAdded(true);
    setName("");
    setText("");
    setRating(5);
  };

  return (
    <div className="all-reviews">
      <div className="reviews-toolbar">
        <p>
          <strong>{averageRating.toFixed(1).replace(".", ",")}</strong>
          <Stars rating={Math.round(averageRating)} />
          <span>{reviews.length} отзывов</span>
        </p>
        <button
          className="button button-outline"
          onClick={() => {
            setWriting(!writing);
            setAdded(false);
          }}
        >
          {writing ? "Отменить" : "Оставить отзыв"}
        </button>
      </div>
      {added && (
        <p className="review-added" role="status">
          <Check size={18} /> Спасибо! Ваш отзыв сохранён в этом браузере.
        </p>
      )}
      {writing && (
        <form className="review-form request-form" onSubmit={submit}>
          <label>
            Ваше имя
            <input
              placeholder="Имя и фамилия"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={70}
            />
          </label>
          <fieldset>
            <legend>Ваша оценка</legend>
            <div className="rating-input">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  aria-label={`Поставить ${i + 1} из 5`}
                  aria-pressed={rating === i + 1}
                >
                  <Star fill={i < rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            Ваш отзыв
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              required
              minLength={10}
              maxLength={1000}
              placeholder="Расскажите, как прошла работа"
              rows={3}
            />
          </label>
          <button className="button button-yellow" type="submit">
            Опубликовать отзыв <Send size={18} />
          </button>
        </form>
      )}
      <label className="review-sort">
        Сначала{" "}
        <select
          aria-label="Сортировка отзывов"
          value={order}
          onChange={(event) => setOrder(event.target.value)}
        >
          <option value="new">новые</option>
          <option value="old">старые</option>
        </select>
      </label>
      <div className="modal-review-grid">
        {sortedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}


const vehiclePrices = [
  { group: "Газели", name: "Газель · 1 м³", capacity: "до 500 кг · погрузка 1 ч", price: 4000, loaders: "1 этаж: +500 ₽ · 2 этаж / лифт: +800 ₽ · этаж без лифта: +300 ₽" },
  { group: "Газели", name: "Газель · 3 м³", capacity: "до 1 т · погрузка 1 ч", price: 5000, loaders: "1 этаж: +1 200 ₽ · 2 этаж / лифт: +1 700 ₽ · этаж без лифта: +700 ₽" },
  { group: "Газели", name: "Газель · 6 м³", capacity: "до 1,5 т · погрузка 1 ч", price: 7000, loaders: "1 этаж: +1 700 ₽ · 2 этаж / лифт: +2 200 ₽ · этаж без лифта: +1 000 ₽" },
  { group: "Газели", name: "Газель · 9 м³", capacity: "до 2 т · погрузка 1 ч", price: 10000, loaders: "1 этаж: +2 000 ₽ · 2 этаж / лифт: +3 000 ₽ · этаж без лифта: +1 000 ₽" },
  { group: "Газели", name: "Газель · 12 м³", capacity: "до 3 т · погрузка 1 ч", price: 12500, loaders: "1 этаж: +2 500 ₽ · 2 этаж / лифт: +3 500 ₽ · этаж без лифта: +1 500 ₽" },
  { group: "Газели", name: "Газель · 16 м³", capacity: "до 3 т · погрузка 1 ч", price: 16000, loaders: "1 этаж: +2 700 ₽ · 2 этаж / лифт: +4 500 ₽ · этаж без лифта: +2 000 ₽" },
  { group: "BAW Fenix и FOTON", name: "BAW Fenix · 10 м³", capacity: "до 3 т · погрузка 1 ч", price: 15000, loaders: "Грузчики (с земли): +5 500 ₽" },
  { group: "BAW Fenix и FOTON", name: "BAW Fenix · 12 м³", capacity: "до 4 т · погрузка 1 ч", price: 16000, loaders: "Грузчики (с земли): +5 500 ₽" },
  { group: "BAW Fenix и FOTON", name: "BAW Fenix · 16 м³", capacity: "до 4,5 т · погрузка 1 ч", price: 17500, loaders: "Грузчики (с земли): +5 500 ₽" },
  { group: "BAW Fenix и FOTON", name: "FOTON · 10 м³", capacity: "до 3 т · погрузка 1 ч", price: 15000, loaders: "Грузчики (с земли): +5 500 ₽" },
  { group: "BAW Fenix и FOTON", name: "FOTON · 16 м³", capacity: "до 4,5 т · погрузка 1 ч", price: 17500, loaders: "Грузчики (с земли): +5 500 ₽" },
  { group: "Контейнеры и пухто", name: "Двухрамник для перегруза · 6 м³", capacity: "до 3,5 т · погрузка 30 мин", price: 10500, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Камаз с пухто · 6 м³", capacity: "до 3,5 т · погрузка 1 ч", price: 19500, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Камаз с пухто · 10 м³", capacity: "до 4 т · погрузка 1 ч", price: 21000, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Камаз с пухто · 10 м³", capacity: "до 10 т · погрузка 1 ч", price: 23000, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Пересыпать пухто · 14 м³", capacity: "до 3 т · погрузка 30 мин", price: 20000, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Камаз с пухто под погрузку · 14 м³", capacity: "до 6 т · погрузка 2 ч", price: 22000, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Пухто на базе Камаза · 20 м³", capacity: "до 10 т · погрузка 3 ч", price: 28500, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Пухто на базе Камаза · 27 м³", capacity: "до 10 т · погрузка 3 ч", price: 30500, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Пухто Мамонт / FAW · 27 м³", capacity: "до 20 т · погрузка 3 ч", price: 33000, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Контейнеры и пухто", name: "Пухто на базе FAW · 36 м³", capacity: "до 20 т · погрузка 3 ч", price: 41000, loaders: "Без грузчиков · самостоятельная загрузка в контейнер" },
  { group: "Самосвалы", name: "Самосвал · 18 м³", capacity: "до 25 т · погрузка 2 ч", price: 26000, loaders: "Для сыпучих грузов · без грузчиков" },
  { group: "Самосвалы", name: "Самосвал · 20 м³", capacity: "до 35 т · погрузка 2 ч", price: 27000, loaders: "Для сыпучих грузов · без грузчиков" },
];

function PricePage() {
  const groups = [...new Set(vehiclePrices.map((item) => item.group))];
  return (
    <main className="standalone-prices">
      <header className="standalone-prices-header">
        <a className="brand" href="/">
          <span className="brand-mark"><RecycleMark /></span>
          <span className="brand-name">ВывозМусора<span>СПб</span></span>
        </a>
        <a className="button button-outline" href="/"> <ArrowLeft /> На главную</a>
      </header>
      <section className="standalone-prices-content">
        <p className="eyebrow">ВЫВОЗ МУСОРА · САНКТ-ПЕТЕРБУРГ И ОБЛАСТЬ</p>
        <h1>Смета и цены на вывоз</h1>
        <p className="standalone-prices-lead">Выберите подходящую технику. Указана базовая стоимость подачи и вывоза; дополнительные работы и условия погрузки согласуются при оформлении заказа.</p>
        {groups.map((group) => (
          <section className="vehicle-price-group" key={group}>
            <h2>{group}</h2>
            <div className="vehicle-price-list">
              {vehiclePrices.filter((item) => item.group === group).map((item, index) => (
                <article className="vehicle-price-card" key={item.name + item.capacity + index}>
                  <div className="vehicle-price-main">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.capacity}</p>
                    </div>
                    <strong>{money(item.price)} ₽</strong>
                  </div>
                  <p className="vehicle-price-loaders">{item.loaders}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
        <p className="standalone-prices-note"><ShieldCheck /> Цены указаны по действующей смете. Итоговая стоимость может зависеть от фактического объёма, состава отходов, адреса и условий погрузки. Все изменения согласуются с заказчиком заранее.</p>
        <a className="button button-yellow standalone-prices-cta" href="/#prices">Вернуться на сайт <ArrowRight /></a>
      </section>
    </main>
  );
}

export default function App() {
  const [modal, setModal] = useState<ModalState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem("spb-reviews") || "[]",
      );
      const valid = Array.isArray(saved)
        ? saved.filter(
            (item): item is Review =>
              typeof item?.id === "string" &&
              typeof item?.name === "string" &&
              typeof item?.text === "string" &&
              /^\d{2}\.\d{2}\.\d{4}$/.test(item?.date) &&
              Number.isInteger(item?.rating) &&
              item.rating >= 1 &&
              item.rating <= 5,
          )
        : [];
      return [...valid, ...initialReviews];
    } catch {
      return initialReviews;
    }
  });
  const reduceMotion = useReducedMotion();
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!servicesOpen) return;
    const dismiss = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".nav-services"))
        setServicesOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setServicesOpen(false);
    };
    document.addEventListener("click", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [servicesOpen]);

  const openRequest = (service?: string, volume?: string) => {
    setMenuOpen(false);
    setModal({ type: "request", service, volume });
  };
  const openService = (id: string) => {
    setServicesOpen(false);
    setMenuOpen(false);
    setModal({ type: "service", id });
  };
  const navigate = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };
  const addReview = (review: Review) => {
    const updated = [review, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(
        "spb-reviews",
        JSON.stringify(updated.filter((item) => item.id.startsWith("local-"))),
      );
    } catch {
      /* Reviews remain available for this visit without local storage. */
    }
  };

  const navLinks = (
    <>
      <a href="#prices" onClick={navigate}>
        Цены
      </a>
      <a href="#about" onClick={navigate}>
        О компании
      </a>
      <a href="#reviews" onClick={navigate}>
        Отзывы
      </a>
      <a href="#contacts" onClick={navigate}>
        Контакты
      </a>
    </>
  );

  let modalTitle = "";
  let modalContent: ReactNode = null;
  if (modal?.type === "request") {
    modalTitle = "Оставить заявку";
    modalContent = (
      <RequestForm
        key={`${modal.service}-${modal.volume}`}
        service={modal.service}
        quote={modal.quote}
        volume={modal.volume}
      />
    );
  }
  if (modal?.type === "about") {
    modalTitle = "Как мы работаем";
    modalContent = <AboutContent onRequest={() => openRequest()} />;
  }
  if (modal?.type === "service") {
    const service = services.find((item) => item.id === modal.id)!;
    modalTitle = service.title;
    modalContent = (
      <div className="service-detail">
        {service.id === "demolition" ? (
          <img
            className="service-detail-image"
            src="/images/demolition.jpg"
            alt="Демонтаж здания экскаватором"
          />
        ) : (
          <span className="service-detail-icon">
            <ServiceIcon name={service.icon} />
          </span>
        )}
        <p>{service.description}</p>
        <ul className="check-list">
          {service.includes.map((item) => (
            <CheckItem key={item}>{item}</CheckItem>
          ))}
        </ul>
        <div className="service-detail-price">
          <span>Стоимость услуги</span>
          <strong>{service.price}</strong>
        </div>
        <button
          className="button button-yellow"
          onClick={() => openRequest(service.id)}
        >
          Заказать услугу <ArrowRight />
        </button>
        <small>Точную цену согласуем до начала работ.</small>
      </div>
    );
  }
  if (modal?.type === "prices") {
    modalTitle = "Прозрачные цены";
    modalContent = (
      <div className="full-prices">
        <p className="modal-intro">
          Выберите подходящий объём. В стоимость включены подача машины и вывоз
          на официальный полигон.
        </p>
        {prices.map((item) => (
          <div className="price-table-row" key={item.id}>
            <img src={`/images/${item.image}`} alt="" />
            <div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </div>
            <strong>от {money(item.price)} ₽</strong>
            <button
              className="round-button"
              aria-label={`Заказать: ${item.title}`}
              onClick={() =>
                openRequest(
                  item.id === "loaders"
                    ? "loaders"
                    : item.id === "bags"
                      ? "bags"
                      : "container",
                  item.volume,
                )
              }
            >
              <ArrowRight />
            </button>
          </div>
        ))}
        <p className="price-disclaimer">
          <ShieldCheck /> Без скрытых платежей. Вынос, демонтаж и работа за
          пределами КАД рассчитываются отдельно и согласуются заранее.
        </p>
        <button
          className="button button-yellow"
          onClick={() => {
            closeModal();
            const calculator = document.getElementById("calculator");
            calculator?.scrollIntoView({ behavior: "smooth", block: "center" });
            calculator?.querySelector("input")?.focus({ preventScroll: true });
          }}
        >
          Рассчитать мой объём <ArrowRight />
        </button>
      </div>
    );
  }
  if (modal?.type === "reviews") {
    modalTitle = "Отзывы наших клиентов";
    modalContent = <ReviewsContent reviews={reviews} onAdd={addReview} />;
  }
  if (modal?.type === "privacy") {
    modalTitle = "Политика конфиденциальности";
    modalContent = (
      <div className="legal-content">
        <p>
          Мы бережно относимся к вашим персональным данным и используем их
          только для обработки обращений по услугам «ВывозМусора СПб».
        </p>
        <h3>Какие данные используются</h3>
        <p>
          Имя, номер телефона, адрес объекта и сведения о заказанной услуге,
          которые вы самостоятельно указываете в форме.
        </p>
        <h3>Как работает форма</h3>
        <p>
          Расчёт выполняется в вашем браузере. Заявка сохраняется локально на
          вашем устройстве. Данные передаются в WhatsApp только после того, как
          вы нажмёте кнопку отправки и самостоятельно отправите сообщение
          диспетчеру.
        </p>
        <h3>Хранение и защита</h3>
        <p>
          Мы не используем рекламные cookie. Сохранённые на устройстве данные
          можно удалить в настройках браузера. При переходе в WhatsApp действуют
          правила конфиденциальности этого сервиса.
        </p>
        <h3>Ваши права</h3>
        <p>
          Вы можете отозвать согласие, уточнить или попросить удалить переданные
          сведения, связавшись по телефону{" "}
          <a href="tel:+79673448484">+7 (967) 344-84-84</a>.
        </p>
      </div>
    );
  }
  if (modal?.type === "sitemap") {
    modalTitle = "Карта сайта";
    modalContent = (
      <nav className="sitemap-links">
        {[
          ["home", "Главная"],
          ["services", "Наши услуги"],
          ["about", "О компании"],
          ["prices", "Цены"],
          ["reviews", "Отзывы"],
          ["contacts", "Контакты"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={closeModal}>
            {label}
            <ArrowRight size={18} />
          </a>
        ))}
      </nav>
    );
  }

  if (window.location.pathname === "/prices") return <PricePage />;

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <section className="hero" id="home">
        <picture className="hero-picture">
          <source media="(max-width: 760px)" srcSet="/images/hero-truck.jpg" />
          <motion.img
            className="hero-image"
            src="/images/hero-banner.jpg"
            alt="Мусоровоз с синим контейнером на набережной Санкт-Петербурга"
            fetchPriority="high"
            initial={reduceMotion ? false : { scale: 1.035, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </picture>
        <div className="hero-wash" />
        <header className="header site-container">
          <Brand />
          <nav className="desktop-nav" aria-label="Основная навигация">
            <div className="nav-services">
              <button
                aria-expanded={servicesOpen}
                aria-controls="services-dropdown"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                Услуги <ChevronDown className={servicesOpen ? "rotated" : ""} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    id="services-dropdown"
                    className="services-dropdown"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => openService(service.id)}
                      >
                        <ServiceIcon name={service.icon} />
                        <span>{service.title}</span>
                        <ArrowRight />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {navLinks}
          </nav>
          <a className="header-phone phone-link" href="tel:+79673448484">
            <Phone fill="currentColor" />
            <span>
              <strong>+7 (967) 344-84-84</strong>
              <small>Звоните круглосуточно</small>
            </span>
          </a>
          <a
            className="header-whatsapp button button-yellow"
            aria-label="Написать в WhatsApp"
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon />
            <span>
              Написать
              <br />в WhatsApp
            </span>
          </a>
          <button
            className="mobile-menu-toggle"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </header>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              className="mobile-nav"
              aria-label="Мобильная навигация"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <a href="#services" onClick={navigate}>
                Услуги
              </a>
              {navLinks}
              <a href="tel:+79673448484" className="mobile-nav-phone">
                <Phone size={19} />
                +7 (967) 344-84-84
              </a>
              <a
                className="button button-yellow"
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon /> Написать в WhatsApp
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
        <motion.div
          className="hero-content site-container"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <h1>
            Вывоз строительного
            <br />
            мусора <span>в Санкт-Петербурге</span>
          </h1>
          <h2>Быстро. Надёжно. Недорого.</h2>
          <ul className="hero-benefits check-list">
            <CheckItem>Вывоз от 1 мешка и до контейнера</CheckItem>
            <CheckItem>Подача машины в день обращения</CheckItem>
            <CheckItem>Работаем по всему СПб и области</CheckItem>
          </ul>
          <div className="hero-actions">
            <button
              className="button button-yellow hero-cta"
              onClick={() => openRequest()}
            >
              Оставить заявку <ArrowRight />
            </button>
            <button
              className="about-button"
              onClick={() => setModal({ type: "about" })}
            >
              <span className="play-button">
                <Play fill="currentColor" />
              </span>
              <span>
                Узнать больше
                <br />о нашей работе
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      <main id="main">
        <section
          className="services-section"
          id="services"
          aria-labelledby="services-heading"
        >
          <div className="section-heading">
            <span />
            <h2 id="services-heading">Наши услуги</h2>
            <span />
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <motion.button
                className={`service-tile ${service.id === "demolition" ? "service-popular" : ""}`}
                aria-label={service.title}
                key={service.id}
                onClick={() => openService(service.id)}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.055 }}
                whileHover={reduceMotion ? {} : { y: -4 }}
              >
                {service.id === "demolition" && (
                  <span className="popular-label">Популярно</span>
                )}
                <ServiceIcon name={service.icon} />
                <span>
                  {service.lines[0]}
                  {service.lines[1] && (
                    <>
                      <br />
                      {service.lines[1]}
                    </>
                  )}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <section
          className="advantages site-container"
          id="about"
          aria-labelledby="advantages-heading"
        >
          <div className="advantages-image">
            <img
              src="/images/workers.jpg"
              alt="Наша бригада аккуратно выносит мешки со строительным мусором"
              loading="lazy"
            />
          </div>
          <div className="advantages-copy">
            <h2 id="advantages-heading">
              Почему выбирают
              <br />
              нас?
            </h2>
            <ul className="check-list">
              {benefits.map((benefit) => (
                <CheckItem key={benefit}>{benefit}</CheckItem>
              ))}
            </ul>
          </div>
          <svg
            className="calculator-arrow"
            viewBox="0 0 90 60"
            aria-hidden="true"
          >
            <path
              d="M4 7C22 32 44 35 75 29L61 15l28 14-22 22 5-15C37 42 15 32 4 7Z"
              fill="#ffd300"
            />
          </svg>
          <Calculator
            onRequest={(quote) =>
              setModal({
                type: "request",
                service:
                  quote.type === "furniture" ? "furniture" :
                  quote.type === "demolition" ? "demolition" :
                  quote.type === "container" ? "container" :
                  quote.type === "household" ? "apartment" :
                  "renovation",
                quote,
              })
            }
          />
        </section>

        <Reveal className="demolition-section site-container">
          <section
            className="demolition-banner"
            aria-labelledby="demolition-heading"
          >
            <img
              src="/images/demolition.jpg"
              alt="Экскаватор выполняет демонтаж здания"
              loading="lazy"
            />
            <div className="demolition-wash" />
            <div className="demolition-copy">
              <span className="yellow-label">Комплексная услуга</span>
              <h2 id="demolition-heading">
                Вывоз мусора
                <br />и демонтаж
              </h2>
              <p>
                <strong>Квартира, офис, здание</strong> - под ключ!
              </p>
            </div>
            <div className="demolition-action">
              <ul className="check-list">
                <CheckItem>Демонтаж любой сложности</CheckItem>
                <CheckItem>Вывоз мусора</CheckItem>
                <CheckItem>Уборка территории</CheckItem>
              </ul>
              <button
                className="button button-yellow"
                onClick={() => openService("demolition")}
              >
                Узнать подробнее <ArrowRight />
              </button>
            </div>
          </section>
        </Reveal>

        <Reveal className="prices-section site-container">
          <section
            className="prices-layout"
            id="prices"
            aria-labelledby="prices-heading"
          >
            <div className="prices-intro">
              <h2 id="prices-heading">Прозрачные цены</h2>
              <p>
                Стоимость зависит от объёма
                <br className="desktop-break" /> и типа мусора. Уточняйте цену
                <br className="desktop-break" /> у менеджера.
              </p>
              <a className="button button-outline" href="/prices">
                Перейти к ценам <ArrowRight />
              </a>
            </div>
            <div className="price-grid">
              {prices.map((price) => (
                <button
                  className="price-tile"
                  key={price.id}
                  onClick={() =>
                    openRequest(
                      price.id === "loaders"
                        ? "loaders"
                        : price.id === "bags"
                          ? "bags"
                          : "container",
                      price.volume,
                    )
                  }
                  aria-label={`${price.title}, от ${money(price.price)} рублей. Заказать`}
                >
                  <div className="price-image">
                    <img
                      src={`/images/${price.image}`}
                      alt={price.title}
                      loading="lazy"
                    />
                  </div>
                  <span>{price.title}</span>
                  <strong>от {money(price.price)} ₽</strong>
                  <ArrowRight className="price-hover-arrow" />
                </button>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal className="reviews-section site-container">
          <section id="reviews" aria-labelledby="reviews-heading">
            <div className="reviews-heading">
              <h2 id="reviews-heading">Отзывы наших клиентов</h2>
              <button
                className="all-reviews-link"
                onClick={() => setModal({ type: "reviews" })}
              >
                Все отзывы <ArrowRight />
              </button>
            </div>
            <div className="reviews-grid">
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="footer" id="contacts">
        <div className="footer-visual">
          <img
            className="footer-background"
            src="/images/footer-spb.jpg"
            alt=""
            loading="lazy"
          />
          <div className="footer-top site-container">
            <div className="footer-brand-block">
              <Brand footer />
              <p>Чистый город - наша работа!</p>
            </div>
            <nav className="footer-nav" aria-label="Навигация в подвале">
              <a href="#services">Услуги</a>
              <a href="#prices">Цены</a>
              <a href="#about">О компании</a>
              <a href="#reviews">Отзывы</a>
              <a href="#contacts">Контакты</a>
            </nav>
            <a className="footer-phone phone-link" href="tel:+79673448484">
              <Phone fill="currentColor" />
              <span>
                <strong>+7 (967) 344-84-84</strong>
                <small>Круглосуточно</small>
              </span>
            </a>
            <div className="social-links">
              <a
                className="social-whatsapp"
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                aria-label="Написать в WhatsApp"
              >
                <WhatsAppIcon />
              </a>
              <a
                className="social-telegram"
                href="https://t.me/VozovMusoraSPB247_bot"
                target="_blank"
                rel="noreferrer"
                aria-label="Открыть бота для оформления заказа в Telegram"
              >
                <TelegramIcon />
              </a>
              <a
                className="social-vk"
                href="https://vk.com/share.php?url=https%3A%2F%2Fwa.me%2F79673448484&title=%D0%92%D1%8B%D0%B2%D0%BE%D0%B7%D0%9C%D1%83%D1%81%D0%BE%D1%80%D0%B0%20%D0%A1%D0%9F%D0%B1"
                target="_blank"
                rel="noreferrer"
                aria-label="Поделиться контактом ВКонтакте"
              >
                <VkIcon />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom site-container">
          <p>© 2024 ВывозМусора СПб. Все права защищены.</p>
          <a
            className="footer-location"
            href="https://yandex.ru/maps/2/saint-petersburg/"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin fill="currentColor" />
            Санкт-Петербург и Ленинградская область
          </a>
          <div className="footer-legal">
            <button onClick={() => setModal({ type: "privacy" })}>
              Политика конфиденциальности
            </button>
            <span>|</span>
            <button onClick={() => setModal({ type: "sitemap" })}>
              Карта сайта
            </button>
          </div>
        </div>
      </footer>
      <AnimatePresence>
        {modal && (
          <Modal
            title={modalTitle}
            onClose={closeModal}
            wide={modal.type === "reviews" || modal.type === "prices"}
          >
            {modalContent}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
