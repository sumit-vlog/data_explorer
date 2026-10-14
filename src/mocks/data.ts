import { CATEGORIES, ORDER_STATUSES, REGIONS, type Order } from '@/types/order';

const FIRST_NAMES = [
  'Ava',
  'Liam',
  'Noah',
  'Mia',
  'Zara',
  'Arjun',
  'Sofia',
  'Kenji',
  'Leila',
  'Omar',
  'Emma',
  'Lucas',
  'Priya',
  'Mateo',
  'Hana',
  'Ethan',
];
const LAST_NAMES = [
  'Smith',
  'Patel',
  'Garcia',
  'Kim',
  'Nguyen',
  'Müller',
  'Rossi',
  'Silva',
  'Khan',
  'Tanaka',
  'Brown',
  'Haddad',
  'Novak',
  'Cohen',
  'Okafor',
  'Larsen',
];
const PRODUCTS: Record<Order['category'], string[]> = {
  Electronics: [
    'Wireless Earbuds',
    'USB-C Hub',
    '4K Monitor',
    'Mechanical Keyboard',
    'Smart Watch',
  ],
  Home: ['Ceramic Vase', 'Air Purifier', 'Coffee Grinder', 'Linen Sheets', 'Desk Lamp'],
  Apparel: ['Rain Jacket', 'Wool Sweater', 'Running Shoes', 'Denim Jeans', 'Baseball Cap'],
  Sports: ['Yoga Mat', 'Kettlebell', 'Tennis Racket', 'Cycling Helmet', 'Water Bottle'],
  Books: [
    'Design Patterns',
    'Clean Code',
    'The Pragmatic Programmer',
    'Refactoring',
    'Atomic Habits',
  ],
  Toys: ['Building Blocks', 'Puzzle Set', 'RC Car', 'Plush Bear', 'Board Game'],
};

const DATASET_END = Date.UTC(2026, 0, 1);
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateOrders(count: number, seed = 42): Order[] {
  const random = mulberry32(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T;

  return Array.from({ length: count }, (_, index) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const category = pick(CATEGORIES);
    const quantity = 1 + Math.floor(random() * 5);
    const unitPrice = 5 + random() * 495;

    return {
      id: `ORD-${String(index + 1).padStart(6, '0')}`,
      customer: `${first} ${last}`,
      email: `${first}.${last}${index}@example.com`.toLowerCase(),
      product: pick(PRODUCTS[category]),
      category,
      status: pick(ORDER_STATUSES),
      region: pick(REGIONS),
      quantity,
      total: Math.round(unitPrice * quantity * 100) / 100,
      createdAt: new Date(DATASET_END - Math.floor(random() * TWO_YEARS_MS)).toISOString(),
    };
  });
}
