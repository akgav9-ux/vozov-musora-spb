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
  const [type, setType] = useState("");
  const [volume, setVolume] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length !== 11) {
      setPhoneError(true);
      return;
    }
    const basePrices: Record<string, number> = {
      bags: 1500,
      "8": 7000,
      "27": 14000,
      loaders: 2500,
    };
    const surcharge = type === "heavy" ? 1.15 : 1;
    setQuote({
      address,
      type,
      volume,
      phone,
      price: Math.round(((basePrices[volume] || 1500) * surcharge) / 100) * 100,
    });
  };

  return (
    <div className="calculator" id="calculator">
      {quote ? (
        <motion.div
          className="quote-result"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          aria-live="polite"
        >
          <span className="result-check">
            <CheckCheck />
          </span>
          <h3>Ваш расчёт готов!</h3>
          <p>Предварительная стоимость</p>
          <strong className="quote-price">от {money(quote.price)} ₽</strong>
          <p className="quote-address">
            <MapPin size={15} />
            {quote.address}
          </p>
          <button
            className="button button-yellow"
            onClick={() => onRequest(quote)}
          >
            Оформить заявку <ArrowRight />
          </button>
          <button className="text-button" onClick={() => setQuote(null)}>
            Изменить данные
          </button>
          <small>Точную цену подтвердим до начала работ.</small>
        </motion.div>
      ) : (
        <>
          <div className="calculator-title">
            <Timer />
            <h3>
              Рассчитайте стоимость
              <br />
              за 1 минуту
            </h3>
          </div>
          <form onSubmit={calculate} className="calculator-form">
            <label className="input-wrap">
              <MapPin />
              <input
                aria-label="Ваш адрес в Санкт-Петербурге"
                placeholder="Ваш адрес в СПб"
                required
                minLength={5}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                autoComplete="street-address"
              />
            </label>
            <label className="input-wrap select-wrap">
              <Box />
              <select
                aria-label="Тип мусора"
                required
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="" disabled>
                  Тип мусора
                </option>
                <option value="construction">Строительный мусор</option>
                <option value="household">Бытовой мусор</option>
                <option value="furniture">Мебель и техника</option>
                <option value="heavy">Кирпич и бетон</option>
              </select>
              <ChevronDown className="select-chevron" />
            </label>
            <label className="input-wrap select-wrap">
              <BarChart3 />
              <select
                aria-label="Примерный объём"
                required
                value={volume}
                onChange={(event) => setVolume(event.target.value)}
              >
                <option value="" disabled>
                  Примерный объём
                </option>
                <option value="bags">До 10 мешков</option>
                <option value="8">Контейнер 8 м³</option>
                <option value="27">Контейнер 27 м³</option>
                <option value="loaders">Машина с грузчиками</option>
              </select>
              <ChevronDown className="select-chevron" />
            </label>
            <label className={`input-wrap ${phoneError ? "input-error" : ""}`}>
              <Phone />
              <input
                aria-label="Телефон для расчёта"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="+7 (___) ___-__-__"
                value={phone}
                aria-invalid={phoneError}
                onChange={(event) => {
                  setPhone(formatPhone(event.target.value));
                  setPhoneError(false);
                }}
              />
            </label>
            {phoneError && (
              <span className="field-error">
                Введите номер полностью: 11 цифр
              </span>
            )}
            <button
              type="submit"
              className="button button-yellow calculator-submit"
            >
              Получить расчёт <ArrowRight />
            </button>
          </form>
          <p className="data-safe">
            <LockKeyhole /> Ваши данные в безопасности
          </p>
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
  const [service, setService] = useState(initialService);
  const [phoneError, setPhoneError] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [telegramSent, setTelegramSent] = useState(false);
  const selectedVolume = prices.find(
    (price) => price.volume === (quote?.volume || volume),
  );
  const serviceName =
    services.find((item) => item.id === service)?.title || "Вывоз мусора";
  const message = `Здравствуйте! Хочу заказать услугу: ${serviceName}.\nИмя: ${name}.\nТелефон: ${phone}.\nАдрес: ${address || "уточню у диспетчера"}.${selectedVolume ? `\nОбъём: ${selectedVolume.title}.` : ""}${quote ? `\nПредварительный расчёт: от ${money(quote.price)} ₽.` : ""}`;

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
          volume: selectedVolume?.title || "",
          priceEstimate: quote ? `от ${money(quote.price)} ₽` : selectedVolume ? `от ${money(selectedVolume.price)} ₽` : "",
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
          <span>
            <Phone size={16} />
            {phone}
          </span>
          {quote && <strong>Предварительно: от {money(quote.price)} ₽</strong>}
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
      {selectedVolume && (
        <p className="selected-order">
          <Box size={19} /> {selectedVolume.title}{" "}
          <strong>от {money(quote?.price || selectedVolume.price)} ₽</strong>
        </p>
      )}
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
                  quote.type === "furniture"
                    ? "furniture"
                    : quote.type === "heavy"
                      ? "bags"
                      : quote.volume === "8" || quote.volume === "27"
                        ? "container"
                        : "renovation",
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
              <button
                className="button button-outline"
                onClick={() => setModal({ type: "prices" })}
              >
                Перейти к ценам <ArrowRight />
              </button>
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
                href="https://t.me/share/url?url=https%3A%2F%2Fwa.me%2F79673448484&text=%D0%92%D1%8B%D0%B2%D0%BE%D0%B7%20%D0%BC%D1%83%D1%81%D0%BE%D1%80%D0%B0%20%D0%A1%D0%9F%D0%B1"
                target="_blank"
                rel="noreferrer"
                aria-label="Поделиться контактом в Telegram"
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
