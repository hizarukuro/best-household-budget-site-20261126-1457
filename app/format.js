// HearthLedger formatting helpers: rupiah amounts, percents and month names.
// One job only — turning numbers into the words the pages show.

// Rp 13.579.000 — Indonesian grouping uses dots as thousand separators.
function formatRp(n) {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + 'Rp ' + digits;
}

// Short form for chart labels and tight cards: Rp 13,6 jt (jt = juta, million).
function formatRpShort(n) {
  if (Math.abs(n) >= 1000000) {
    const v = n / 1000000;
    return 'Rp ' + (Math.round(v * 10) / 10).toString().replace('.', ',') + ' jt';
  }
  if (Math.abs(n) >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
  return formatRp(n);
}

function formatPct(part, whole) {
  if (!whole) return '0%';
  return Math.round((part / whole) * 100) + '%';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// "March 2027" for a Date, used by the savings-goal finish dates.
function monthLabel(date) {
  return MONTH_NAMES[date.getMonth()] + ' ' + date.getFullYear();
}

// Add whole months to a (year, monthIndex) pair; returns a Date on the 1st.
function addMonths(year, monthIndex, count) {
  return new Date(year, monthIndex + count, 1);
}

// Value of a <input type="month"> ("2027-03") as a whole-month count since
// the start of the current month; negative or zero means "already there".
function monthsUntil(monthValue, now) {
  const parts = monthValue.split('-').map(Number);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return 0;
  return (parts[0] - now.getFullYear()) * 12 + (parts[1] - 1 - now.getMonth());
}
