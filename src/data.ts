export type ServiceIconName =
  "home" | "roller" | "truck" | "sofa" | "bags" | "worker" | "excavator";

export interface Service {
  id: string;
  title: string;
  lines: [string, string?];
  icon: ServiceIconName;
  description: string;
  price: string;
  includes: string[];
}

export const services: Service[] = [
  {
    id: "apartment",
    title: "Вывоз мусора из квартир",
    lines: ["Вывоз мусора", "из квартир"],
    icon: "home",
    description:
      "Освободим квартиру от ненужных вещей и мусора. Сами спустим, погрузим и вывезем всё на официальный полигон.",
    price: "от 1 500 ₽",
    includes: [
      "Вынос с любого этажа",
      "Защита лифта и общих зон",
      "Уборка после погрузки",
    ],
  },
  {
    id: "renovation",
    title: "Вывоз мусора после ремонта",
    lines: ["Вывоз мусора", "после ремонта"],
    icon: "roller",
    description:
      "Уберём остатки стройматериалов, упаковку, старые покрытия и всё, что осталось после ремонта. Приедем в удобное время.",
    price: "от 1 500 ₽",
    includes: [
      "Сбор и упаковка в мешки",
      "Аккуратный вынос и погрузка",
      "Вывоз в день обращения",
    ],
  },
  {
    id: "container",
    title: "Вывоз строительного мусора контейнерами",
    lines: ["Вывоз строительного", "мусора контейнерами"],
    icon: "truck",
    description:
      "Подадим контейнер 8 или 27 м³ для строительного мусора. Подберём объём, организуем погрузку и законный вывоз.",
    price: "от 7 000 ₽",
    includes: [
      "Контейнеры 8 и 27 м³",
      "Подача и вывоз по графику",
      "Для частных и строительных объектов",
    ],
  },
  {
    id: "furniture",
    title: "Вывоз старой мебели и техники",
    lines: ["Вывоз старой", "мебели и техники"],
    icon: "sofa",
    description:
      "Заберём старые диваны, шкафы, кухонные гарнитуры и бытовую технику. При необходимости разберём мебель на месте.",
    price: "от 2 500 ₽",
    includes: [
      "Разборка крупной мебели",
      "Вынос без повреждения отделки",
      "Ответственная утилизация",
    ],
  },
  {
    id: "bags",
    title: "Вывоз мешков с кирпичом и бетоном",
    lines: ["Вывоз мешков", "с кирпичом и бетоном"],
    icon: "bags",
    description:
      "Вывезем тяжёлый строительный мусор в мешках: кирпич, бетон, штукатурку и плитку. Работаем с любым объёмом.",
    price: "от 1 500 ₽",
    includes: [
      "От одного мешка",
      "Помощь с упаковкой",
      "Грузчики и машина в одной заявке",
    ],
  },
  {
    id: "loaders",
    title: "Заказ грузчиков",
    lines: ["Заказ", "грузчиков"],
    icon: "worker",
    description:
      "Опытные и вежливые грузчики помогут вынести мусор, разобрать мебель и подготовить объект к следующему этапу работ.",
    price: "от 700 ₽ / час",
    includes: [
      "Бригада от двух человек",
      "Работа с тяжёлыми грузами",
      "Почасовая или фиксированная оплата",
    ],
  },
  {
    id: "demolition",
    title: "Демонтаж",
    lines: ["Демонтаж"],
    icon: "excavator",
    description:
      "Демонтаж, вывоз мусора и уборка территории под ключ. От перегородки в квартире до отдельно стоящего здания.",
    price: "Индивидуальный расчёт",
    includes: [
      "Демонтаж любой сложности",
      "Вывоз строительного мусора",
      "Уборка территории",
    ],
  },
];

export const prices = [
  {
    id: "bags",
    title: "До 10 мешков",
    price: 1500,
    image: "price-bag.jpg",
    volume: "bags",
    note: "Небольшой объём после ремонта",
  },
  {
    id: "skip",
    title: "8 м³",
    price: 7000,
    image: "price-skip.jpg",
    volume: "8",
    note: "Контейнер для ремонта квартиры",
  },
  {
    id: "container",
    title: "27 м³",
    price: 14000,
    image: "price-container.jpg",
    volume: "27",
    note: "Для больших строительных объектов",
  },
  {
    id: "loaders",
    title: "Вывоз с грузчиками",
    price: 2500,
    image: "price-truck.jpg",
    volume: "loaders",
    note: "Машина и помощь с погрузкой",
  },
];

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  avatar?: string;
}

export const initialReviews: Review[] = [
  {
    id: "1",
    name: "Алексей Петров",
    date: "15.11.2024",
    rating: 5,
    text: "Быстро приехали, аккуратно вывезли мусор. Рекомендую!",
    avatar: "avatar-alex.jpg",
  },
  {
    id: "2",
    name: "Марина Иванова",
    date: "05.11.2024",
    rating: 5,
    text: "Отличный сервис! Приехали в тот же день. Спасибо!",
    avatar: "avatar-marina.jpg",
  },
  {
    id: "3",
    name: "Дмитрий Кузнецов",
    date: "28.10.2024",
    rating: 5,
    text: "Профессионально и недорого. Буду обращаться еще.",
    avatar: "avatar-dmitry.jpg",
  },
  {
    id: "4",
    name: "Елена Смирнова",
    date: "21.10.2024",
    rating: 5,
    text: "Вывозили старую мебель перед ремонтом. Ребята всё разобрали и вынесли, в подъезде оставили чистоту.",
  },
  {
    id: "5",
    name: "Сергей Волков",
    date: "16.10.2024",
    rating: 5,
    text: "Заказывал контейнер на стройку. Подали вовремя, цена совпала с расчётом. Всё чётко.",
  },
  {
    id: "6",
    name: "Ольга Соколова",
    date: "09.10.2024",
    rating: 5,
    text: "Помогли убрать мусор после ремонта квартиры. Вежливые грузчики, быстрая работа. Спасибо вашей команде!",
  },
];

export const money = (amount: number) =>
  new Intl.NumberFormat("ru-RU").format(amount);

export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits[0] === "8") digits = "7" + digits.slice(1);
  if (digits[0] !== "7") digits = "7" + digits;
  digits = digits.slice(0, 11);
  let result = "+7";
  if (digits.length > 1) result += " (" + digits.slice(1, 4);
  if (digits.length > 4) result += ") ";
  if (digits.length > 4) result += digits.slice(4, 7);
  if (digits.length > 7) result += "-" + digits.slice(7, 9);
  if (digits.length > 9) result += "-" + digits.slice(9, 11);
  return result;
}

export const whatsappUrl = (
  message = "Здравствуйте! Хочу заказать вывоз мусора в Санкт-Петербурге.",
) => `https://wa.me/79673448484?text=${encodeURIComponent(message)}`;
