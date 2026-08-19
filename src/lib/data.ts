export type LeadStatus = "new" | "contacted" | "qualified" | "active" | "lost";
export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "expired";
export type OrderStatus = "processing" | "production" | "shipped" | "delivered";

export type Brand = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  location: string;
  model: string;
  tier: string;
  owner: string;
  unitsYear: number;
  health: number;
  icp: number;
  notes: string;
};

export type Person = {
  id: string;
  brandId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  status: LeadStatus;
  lastTouch: string;
};

export type Quote = {
  id: string;
  number: string;
  brandId: string;
  brandName: string;
  units: number;
  unitPrice: number;
  status: QuoteStatus;
  decoration: string;
  date: string;
};

export type Order = {
  id: string;
  number: string;
  brandId: string;
  brandName: string;
  units: number;
  amount: number;
  status: OrderStatus;
  date: string;
};

export type Activity = {
  id: string;
  brandId?: string;
  kind: string;
  title: string;
  body?: string;
  when: string;
};

export type Task = {
  id: string;
  title: string;
  due: string;
  brandName?: string;
};

export const BRANDS: Brand[] = [
  {
    id: "streetwear",
    name: "Streetwear Co",
    domain: "streetwear.co",
    industry: "Streetwear / DTC",
    location: "Los Angeles, CA",
    model: "Connected Print + Fulfill",
    tier: "Strategic",
    owner: "Maya Chen",
    unitsYear: 420000,
    health: 86,
    icp: 94,
    notes: "Core program on A1. Sample loop tight. Expanding hoodie line Q4.",
  },
  {
    id: "allume",
    name: "Allume",
    domain: "allume.com",
    industry: "Activewear",
    location: "Austin, TX",
    model: "Production Runs",
    tier: "Active",
    owner: "Luis Ortega",
    unitsYear: 180000,
    health: 72,
    icp: 88,
    notes: "Kit program. Needs landed cost clarity on next PO.",
  },
  {
    id: "northside",
    name: "Northside Athletic",
    domain: "northsideathletic.com",
    industry: "Team sports",
    location: "Chicago, IL",
    model: "Fulfillment Ops",
    tier: "Prospect",
    owner: "Asha Patel",
    unitsYear: 95000,
    health: 61,
    icp: 79,
    notes: "Evaluating vs domestic screen shop. Sample in flight.",
  },
  {
    id: "cabana",
    name: "Cabana Rica",
    domain: "cabanarica.com",
    industry: "Resort / lifestyle",
    location: "Miami, FL",
    model: "Production Runs",
    tier: "Active",
    owner: "Maya Chen",
    unitsYear: 64000,
    health: 78,
    icp: 71,
    notes: "Seasonal peaks. Sublimation capacity reserved.",
  },
  {
    id: "fieldfern",
    name: "Field & Fern",
    domain: "fieldandfern.com",
    industry: "Outdoor / merch",
    location: "Portland, OR",
    model: "Connected Print + Fulfill",
    tier: "Target",
    owner: "Luis Ortega",
    unitsYear: 40000,
    health: 55,
    icp: 82,
    notes: "First discovery call done. Mapping decoration stack.",
  },
];

export const PEOPLE: Person[] = [
  {
    id: "p1",
    brandId: "streetwear",
    name: "Jordan Lee",
    title: "Head of Ops",
    email: "jordan@streetwear.co",
    phone: "+1 310 555 0142",
    status: "active",
    lastTouch: "2h ago",
  },
  {
    id: "p2",
    brandId: "streetwear",
    name: "Sam Rivera",
    title: "Founder",
    email: "sam@streetwear.co",
    phone: "+1 310 555 0198",
    status: "active",
    lastTouch: "Yesterday",
  },
  {
    id: "p3",
    brandId: "allume",
    name: "Priya Shah",
    title: "Supply Chain Lead",
    email: "priya@allume.com",
    phone: "+1 512 555 0110",
    status: "qualified",
    lastTouch: "3d ago",
  },
  {
    id: "p4",
    brandId: "northside",
    name: "Chris Nolan",
    title: "Merch Director",
    email: "chris@northsideathletic.com",
    phone: "+1 312 555 0166",
    status: "contacted",
    lastTouch: "5d ago",
  },
  {
    id: "p5",
    brandId: "cabana",
    name: "Elena Ruiz",
    title: "Creative Director",
    email: "elena@cabanarica.com",
    phone: "+1 305 555 0133",
    status: "active",
    lastTouch: "1d ago",
  },
  {
    id: "p6",
    brandId: "fieldfern",
    name: "Taylor Brooks",
    title: "Founder",
    email: "taylor@fieldandfern.com",
    phone: "+1 503 555 0177",
    status: "new",
    lastTouch: "1w ago",
  },
];

export const QUOTES: Quote[] = [
  {
    id: "q1",
    number: "PQ-2148",
    brandId: "streetwear",
    brandName: "Streetwear Co",
    units: 85000,
    unitPrice: 5.72,
    status: "viewed",
    decoration: "Screen 6-color",
    date: "Aug 12, 2026",
  },
  {
    id: "q2",
    number: "PQ-2155",
    brandId: "allume",
    brandName: "Allume",
    units: 24000,
    unitPrice: 5.35,
    status: "sent",
    decoration: "DTG + left chest",
    date: "Aug 14, 2026",
  },
  {
    id: "q3",
    number: "PQ-2160",
    brandId: "cabana",
    brandName: "Cabana Rica",
    units: 12000,
    unitPrice: 7.54,
    status: "accepted",
    decoration: "Sublimation",
    date: "Aug 8, 2026",
  },
  {
    id: "q4",
    number: "PQ-2162",
    brandId: "northside",
    brandName: "Northside Athletic",
    units: 18000,
    unitPrice: 4.9,
    status: "draft",
    decoration: "Screen 3-color",
    date: "Aug 16, 2026",
  },
  {
    id: "q5",
    number: "PQ-2139",
    brandId: "fieldfern",
    brandName: "Field & Fern",
    units: 8000,
    unitPrice: 6.1,
    status: "expired",
    decoration: "Embroidery",
    date: "Jul 22, 2026",
  },
];

export const ORDERS: Order[] = [
  {
    id: "o1",
    number: "PO-5002",
    brandId: "cabana",
    brandName: "Cabana Rica",
    units: 12000,
    amount: 90480,
    status: "production",
    date: "Aug 10, 2026",
  },
  {
    id: "o2",
    number: "PO-4991",
    brandId: "streetwear",
    brandName: "Streetwear Co",
    units: 40000,
    amount: 228800,
    status: "shipped",
    date: "Aug 2, 2026",
  },
  {
    id: "o3",
    number: "PO-4988",
    brandId: "allume",
    brandName: "Allume",
    units: 15000,
    amount: 80250,
    status: "delivered",
    date: "Jul 28, 2026",
  },
  {
    id: "o4",
    number: "PO-5008",
    brandId: "streetwear",
    brandName: "Streetwear Co",
    units: 10000,
    amount: 57200,
    status: "processing",
    date: "Aug 17, 2026",
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    brandId: "streetwear",
    kind: "sample",
    title: "Sample set shipped to LA",
    body: "6-color strike-off on Bella+Canvas 3001. Tracking out from A1.",
    when: "2h ago",
  },
  {
    id: "a2",
    brandId: "allume",
    kind: "quote",
    title: "PQ-2155 sent",
    body: "24K unit kit program. Landed San Diego injection included.",
    when: "Yesterday",
  },
  {
    id: "a3",
    brandId: "northside",
    kind: "call",
    title: "Discovery with Chris Nolan",
    body: "Mapped team sports seasonal curve. Sample requested.",
    when: "2d ago",
  },
  {
    id: "a4",
    brandId: "cabana",
    kind: "stage",
    title: "PO-5002 moved to production",
    body: "Sublimation run locked on press 3.",
    when: "3d ago",
  },
  {
    id: "a5",
    brandId: "streetwear",
    kind: "email",
    title: "Jordan replied on PQ-2148",
    body: "Reviewing unit price vs last season. Decision by Friday.",
    when: "4d ago",
  },
];

export const TASKS: Task[] = [
  { id: "t1", title: "Follow up PQ-2148 with Jordan", due: "Today", brandName: "Streetwear Co" },
  { id: "t2", title: "Ship Northside sample set", due: "Tomorrow", brandName: "Northside Athletic" },
  { id: "t3", title: "Confirm Allume landed cost line", due: "Aug 20", brandName: "Allume" },
  { id: "t4", title: "Book Field & Fern decoration map", due: "Aug 21", brandName: "Field & Fern" },
];

export function getBrand(id: string) {
  return BRANDS.find((b) => b.id === id);
}

export function peopleForBrand(brandId: string) {
  return PEOPLE.filter((p) => p.brandId === brandId);
}

export function quotesForBrand(brandId: string) {
  return QUOTES.filter((q) => q.brandId === brandId);
}

export function ordersForBrand(brandId: string) {
  return ORDERS.filter((o) => o.brandId === brandId);
}

export function activitiesForBrand(brandId: string) {
  return ACTIVITIES.filter((a) => a.brandId === brandId);
}
