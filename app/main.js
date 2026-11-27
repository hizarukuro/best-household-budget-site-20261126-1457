// HearthLedger entry point: owns the state, the hash router and every event.
// One job only — wiring. The seed data lives in data.js, the words and
// figures are computed in views.js, the pictures in charts.js. Editing a
// figure here changes it everywhere, because all pages render from this
// one state object.

// Deep-copy the seed so a visitor's edits never touch the original data.
const state = JSON.parse(JSON.stringify({
  income: HEARTH_INCOME,
  categories: HEARTH_CATEGORIES,
  bills: HEARTH_BILLS,
  goals: HEARTH_GOALS,
}));

const ROUTES = {
  '/': { title: 'Dashboard', render: viewDashboard },
  '/planner': { title: 'Budget Planner', render: viewPlanner },
  '/bills': { title: 'Bills & Due Dates', render: viewBills },
  '/goals': { title: 'Savings Goals', render: viewGoals },
  '/guide': { title: 'Guide', render: viewGuide },
};

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '');
  return ROUTES[hash] ? hash : '/';
}

function render() {
  const path = currentPath();
  document.getElementById('page').innerHTML = ROUTES[path].render(state);
  document.querySelectorAll('.nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + path);
  });
  document.title = 'HearthLedger — ' + ROUTES[path].title;
}

// ---- planner events ---------------------------------------------------------
// Inputs are edited in place: update the state, then refresh only the
// summary numbers and flags, so the field being typed in never loses focus.

function refreshPlanner() {
  document.getElementById('planner-summary').innerHTML = plannerSummary(state);
  ['needs', 'wants', 'savings'].forEach((g) => {
    const el = document.getElementById('group-total-' + g);
    if (el) el.textContent = formatRp(groupBudget(state, g));
  });
  state.categories.forEach((c) => {
    const flag = document.getElementById('flag-' + c.id);
    if (!flag) return;
    flag.innerHTML = c.spent > c.budget
      ? '<strong class="over-text">over by ' + formatRp(c.spent - c.budget) + '</strong>'
      : '<span class="ok-text">' + formatRp(c.budget - c.spent) + ' left</span>';
  });
}

function onPlannerInput(event) {
  const value = Math.max(0, Number(event.target.value) || 0);
  if (event.target.dataset.income) {
    const row = state.income.find((r) => r.id === event.target.dataset.income);
    if (row) row.amount = value;
  } else if (event.target.dataset.cat) {
    const cat = state.categories.find((c) => c.id === event.target.dataset.cat);
    if (cat) cat.budget = value;
  } else {
    return;
  }
  refreshPlanner();
}

// ---- bills events -------------------------------------------------------------

function onBillToggle(event) {
  const bill = state.bills.find((b) => b.id === event.target.dataset.bill);
  if (!bill) return;
  bill.paid = event.target.checked;
  const row = event.target.closest('.bill-row');
  if (row) row.classList.toggle('bill-paid', bill.paid);
  document.getElementById('bills-due').textContent = formatRp(billsStillDue(state));
}

// ---- goals events ---------------------------------------------------------------
// The calculator runs both ways: a new monthly amount moves the finish
// month; a new finish month works out the monthly amount it takes.

function goalReadout(g, months, finish) {
  return 'At ' + formatRp(g.monthly) + ' a month this goal is fully funded in <strong>' +
    monthLabel(finish) + '</strong> (' + months + ' monthly payments). Pick an earlier month and the contribution it needs appears here.';
}

function onGoalMonthly(event) {
  const g = state.goals.find((x) => x.id === event.target.dataset.goalMonthly);
  if (!g) return;
  g.monthly = Math.max(0, Number(event.target.value) || 0);
  const remaining = g.target - g.saved;
  const months = g.monthly > 0 ? Math.ceil(remaining / g.monthly) : 0;
  const now = new Date();
  const finish = addMonths(now.getFullYear(), now.getMonth(), months);
  const card = document.getElementById('goal-' + g.id);
  card.querySelector('[data-goal-until]').value =
    finish.getFullYear() + '-' + String(finish.getMonth() + 1).padStart(2, '0');
  card.querySelector('.goal-readout').innerHTML = goalReadout(g, months, finish);
}

function onGoalUntil(event) {
  const g = state.goals.find((x) => x.id === event.target.dataset.goalUntil);
  if (!g) return;
  const now = new Date();
  const months = Math.max(1, monthsUntil(event.target.value, now));
  const remaining = g.target - g.saved;
  g.monthly = Math.ceil(remaining / months / 1000) * 1000;
  const finish = addMonths(now.getFullYear(), now.getMonth(), months);
  const card = document.getElementById('goal-' + g.id);
  card.querySelector('[data-goal-monthly]').value = g.monthly;
  card.querySelector('.goal-readout').innerHTML = goalReadout(g, months, finish);
}

// ---- wiring ---------------------------------------------------------------------

document.getElementById('page').addEventListener('input', (event) => {
  if (event.target.dataset.income || event.target.dataset.cat) onPlannerInput(event);
  else if (event.target.dataset.goalMonthly) onGoalMonthly(event);
  else if (event.target.dataset.goalUntil) onGoalUntil(event);
});
document.getElementById('page').addEventListener('change', (event) => {
  if (event.target.dataset.bill) onBillToggle(event);
  if (event.target.dataset.goalUntil) onGoalUntil(event);
});
window.addEventListener('hashchange', render);
render();
