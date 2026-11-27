// HearthLedger seed data: one realistic month for a Jakarta household of four.
// Every figure is in rupiah (Rp). The month shown is November 2026, day 24:
// rent and school fees are paid, the groceries are three weeks in, and one
// category (dining out) has already run over its budget on purpose, so the
// planner's warnings have something true to say.

const HEARTH_MONTH = {
  label: 'November 2026',
  dayOfMonth: 24,
  daysInMonth: 30,
  household: 'The Prasetyo household — two adults, two children, South Jakarta',
};

const HEARTH_INCOME = [
  { id: 'salary', label: 'Main salary (take-home)', amount: 13500000 },
  { id: 'side', label: 'Freelance & side income', amount: 1500000 },
];

// group: 'needs' | 'wants' | 'savings' — the three buckets of the 50/30/20 split.
// budget: what the household planned for the month. spent: what has actually
// gone out by day 24. The planner edits `budget`; the dashboard reads both.
const HEARTH_CATEGORIES = [
  { id: 'rent', group: 'needs', label: 'Rent', note: 'Kontrakan, paid on the 1st', budget: 3200000, spent: 3200000 },
  { id: 'groceries', group: 'needs', label: 'Groceries & market', note: 'Belanja dapur — weekly market runs', budget: 2200000, spent: 1940000 },
  { id: 'utilities', group: 'needs', label: 'Utilities', note: 'PLN electricity, PAM water, fibre internet', budget: 800000, spent: 764000 },
  { id: 'transport', group: 'needs', label: 'Transport', note: 'Fuel, TransJakarta cards, parking', budget: 850000, spent: 798000 },
  { id: 'school', group: 'needs', label: 'School fees', note: 'SPP for two children', budget: 700000, spent: 700000 },
  { id: 'health', group: 'needs', label: 'Health', note: 'BPJS top-ups, pharmacy, clinic', budget: 350000, spent: 185000 },
  { id: 'dining', group: 'wants', label: 'Dining out', note: 'Warung treats, weekend coffee, delivery', budget: 900000, spent: 965000 },
  { id: 'subs', group: 'wants', label: 'Subscriptions', note: 'Streaming, music, cloud storage', budget: 350000, spent: 349000 },
  { id: 'shopping', group: 'wants', label: 'Shopping', note: 'Clothes, household goods, gadgets', budget: 600000, spent: 428000 },
  { id: 'outings', group: 'wants', label: 'Family outings', note: 'Day trips, cinema, playground entry', budget: 450000, spent: 450000 },
  { id: 'emergency', group: 'savings', label: 'Emergency fund transfer', note: 'Auto-debit on payday', budget: 2000000, spent: 2000000 },
  { id: 'holiday', group: 'savings', label: 'Holiday fund transfer', note: 'Auto-debit on payday', budget: 800000, spent: 800000 },
  { id: 'education', group: 'savings', label: 'Education savings transfer', note: 'Auto-debit on payday', budget: 1000000, spent: 1000000 },
];

// Monthly bills with their due day. paid toggles on the Bills page move the
// "still to pay" total; PLN + PAM + internet here add up to the utilities
// spent figure above, so the pages agree with each other.
const HEARTH_BILLS = [
  { id: 'b-rent', label: 'Rent (sewa rumah)', detail: 'Transfer to landlord', amount: 3200000, dueDay: 1, paid: true },
  { id: 'b-school', label: 'School fees (SPP)', detail: 'Two children, monthly', amount: 700000, dueDay: 5, paid: true },
  { id: 'b-bpjs', label: 'BPJS Kesehatan', detail: 'Family health premium', amount: 300000, dueDay: 10, paid: false },
  { id: 'b-stream', label: 'Streaming bundle', detail: 'Video + music family plans', amount: 189000, dueDay: 12, paid: true },
  { id: 'b-net', label: 'Fibre internet', detail: 'Home broadband, 50 Mbps', amount: 160000, dueDay: 15, paid: true },
  { id: 'b-pln', label: 'Electricity (PLN)', detail: 'Postpaid meter, house + AC', amount: 486000, dueDay: 20, paid: true },
  { id: 'b-pam', label: 'Water (PAM)', detail: 'City water bill', amount: 118000, dueDay: 20, paid: false },
  { id: 'b-motor', label: 'Motorcycle instalment', detail: '18 of 36 payments', amount: 685000, dueDay: 27, paid: false },
];

// Savings goals. monthly is the planned contribution; the calculator on the
// Goals page works both ways: change the monthly amount to see the finish
// date move, or pick a target month to see the monthly amount it needs.
const HEARTH_GOALS = [
  {
    id: 'g-emergency', label: 'Emergency fund', target: 45000000, saved: 27500000, monthly: 2000000,
    note: 'Six months of essential spending (Rp 7.5 jt × 6), kept in a separate savings account.',
  },
  {
    id: 'g-holiday', label: 'Family holiday — Yogyakarta', target: 8000000, saved: 4800000, monthly: 800000,
    note: 'Train tickets, four nights near Malioboro, and food money for four people.',
  },
  {
    id: 'g-school', label: 'School entry fees', target: 12000000, saved: 9000000, monthly: 1000000,
    note: 'Registration and first-term fees for the eldest, due at the new school year.',
  },
];

const HEARTH_SPLIT = { needs: 50, wants: 30, savings: 20 };
