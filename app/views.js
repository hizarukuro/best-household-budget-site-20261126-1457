// HearthLedger views: one renderer per page, each a pure function of state.
// One job only — building the HTML for Dashboard, Planner, Bills, Goals and
// Guide. main.js owns the state and the events; when a control changes the
// state, the page is rendered again from these functions, so every figure
// on every page always agrees with every other.

// ---- shared sums ----------------------------------------------------------

function totalIncome(state) {
  return state.income.reduce((sum, row) => sum + row.amount, 0);
}

function totalBudget(state) {
  return state.categories.reduce((sum, c) => sum + c.budget, 0);
}

function totalSpent(state) {
  return state.categories.reduce((sum, c) => sum + c.spent, 0);
}

function groupBudget(state, group) {
  return state.categories.filter((c) => c.group === group).reduce((sum, c) => sum + c.budget, 0);
}

function billsTotal(state) {
  return state.bills.reduce((sum, b) => sum + b.amount, 0);
}

function billsStillDue(state) {
  return state.bills.filter((b) => !b.paid).reduce((sum, b) => sum + b.amount, 0);
}

const GROUP_NAMES = { needs: 'Needs', wants: 'Wants', savings: 'Savings & goals' };
const GROUP_COLOURS = { needs: '#1e6f5c', wants: '#e8a33d', savings: '#4a7fb5' };

// ---- dashboard ------------------------------------------------------------

function viewDashboard(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const left = income - spent;
  const slices = state.categories.map((c) => ({ label: c.label, value: c.spent }));
  const rows = state.categories.map((c) => {
    const over = c.spent > c.budget;
    return '<div class="cat-row">' +
      '<div class="cat-head"><span class="cat-label">' + c.label + '</span>' +
      '<span class="cat-figures">' + formatRp(c.spent) + ' of ' + formatRp(c.budget) +
      (over ? ' <strong class="over-text">over by ' + formatRp(c.spent - c.budget) + '</strong>' : '') + '</span></div>' +
      progressBar(c.spent, c.budget) + '</div>';
  }).join('');
  const due = billsStillDue(state);
  const dueCount = state.bills.filter((b) => !b.paid).length;
  const goalRows = state.goals.map((g) =>
    '<div class="cat-row"><div class="cat-head"><span class="cat-label">' + g.label + '</span>' +
    '<span class="cat-figures">' + formatRp(g.saved) + ' of ' + formatRp(g.target) + ' · ' + formatPct(g.saved, g.target) + '</span></div>' +
    progressBar(g.saved, g.target) + '</div>').join('');

  return '<section class="hero">' +
    '<h2>' + HEARTH_MONTH.label + ' — day ' + HEARTH_MONTH.dayOfMonth + ' of ' + HEARTH_MONTH.daysInMonth + '</h2>' +
    '<p class="hero-sub">' + HEARTH_MONTH.household + '. ' + (HEARTH_MONTH.daysInMonth - HEARTH_MONTH.dayOfMonth) +
    ' days left in the month, and the plan is holding: one category has run over, everything else is on track.</p>' +
    '<div class="stat-grid">' +
    '<div class="stat"><span class="stat-label">Income this month</span><strong>' + formatRp(income) + '</strong><small>salary + freelance</small></div>' +
    '<div class="stat"><span class="stat-label">Spent so far</span><strong>' + formatRp(spent) + '</strong><small>' + formatPct(spent, income) + ' of income</small></div>' +
    '<div class="stat"><span class="stat-label">Left to spend</span><strong>' + formatRp(left) + '</strong><small>for the last ' + (HEARTH_MONTH.daysInMonth - HEARTH_MONTH.dayOfMonth) + ' days</small></div>' +
    '<div class="stat"><span class="stat-label">Bills still to pay</span><strong>' + formatRp(due) + '</strong><small>' + dueCount + ' bills open — see Bills &amp; Due Dates</small></div>' +
    '</div></section>' +
    '<section class="panel"><h3>Where the money went</h3><div class="chart-flex">' +
    donutChart(slices, spent) +
    '<ul class="legend">' + donutLegend(slices, spent) + '</ul></div></section>' +
    '<section class="panel"><h3>Category by category</h3>' + rows +
    '<p class="panel-note">Bars show spending against this month\u2019s budget. Dining out is the one to watch: ' +
    'it passed its Rp 900 rb budget on day 21, so the plan for the rest of the month is cooking at home.</p></section>' +
    '<section class="panel"><h3>Savings goals at a glance</h3>' + goalRows +
    '<p class="panel-note"><a href="#/goals">Open Savings Goals</a> to run the contribution calculator.</p></section>';
}

// ---- budget planner ---------------------------------------------------------

function plannerSummary(state) {
  const income = totalIncome(state);
  const budgeted = totalBudget(state);
  const unallocated = income - budgeted;
  const splitRows = ['needs', 'wants', 'savings'].map((g) => {
    const pct = income ? (groupBudget(state, g) / income) * 100 : 0;
    return splitBar(GROUP_NAMES[g], pct, HEARTH_SPLIT[g], GROUP_COLOURS[g]);
  }).join('');
  return '<div class="stat-grid">' +
    '<div class="stat"><span class="stat-label">Total income</span><strong id="sum-income">' + formatRp(income) + '</strong></div>' +
    '<div class="stat"><span class="stat-label">Total budgeted</span><strong id="sum-budgeted">' + formatRp(budgeted) + '</strong></div>' +
    '<div class="stat"><span class="stat-label">Safety buffer left over</span><strong id="sum-buffer">' + formatRp(unallocated) + '</strong><small>unallocated on purpose</small></div>' +
    '</div>' +
    '<h3>Your split vs the 50/30/20 guide</h3><div id="split-rows">' + splitRows + '</div>' +
    '<p class="panel-note">The black tick on each bar is the 50/30/20 target. This household runs needs-heavy ' +
    '(Jakarta rent and school fees) and makes it up by saving more than 20% and keeping wants lean.</p>';
}

function viewPlanner(state) {
  const incomeRows = state.income.map((row) =>
    '<label class="edit-row"><span>' + row.label + '</span>' +
    '<span class="rp-input">Rp <input type="number" min="0" step="50000" value="' + row.amount + '" data-income="' + row.id + '" aria-label="' + row.label + '"></span></label>'
  ).join('');
  const groups = ['needs', 'wants', 'savings'].map((g) => {
    const rows = state.categories.filter((c) => c.group === g).map((c) => {
      const over = c.spent > c.budget;
      return '<div class="edit-row cat-edit">' +
        '<span class="cat-edit-label">' + c.label + '<small>' + c.note + '</small></span>' +
        '<span class="spent-cell">spent ' + formatRp(c.spent) + '</span>' +
        '<span class="rp-input">Rp <input type="number" min="0" step="25000" value="' + c.budget + '" data-cat="' + c.id + '" aria-label="Budget for ' + c.label + '"></span>' +
        '<span class="flag-cell" id="flag-' + c.id + '">' + (over ? '<strong class="over-text">over by ' + formatRp(c.spent - c.budget) + '</strong>' : '<span class="ok-text">' + formatRp(c.budget - c.spent) + ' left</span>') + '</span></div>';
    }).join('');
    return '<h3 class="group-title">' + GROUP_NAMES[g] + ' — <span id="group-total-' + g + '">' + formatRp(groupBudget(state, g)) + '</span></h3>' + rows;
  }).join('');
  return '<section class="panel"><h2>Budget Planner</h2>' +
    '<p>Change any amount and the totals, the 50/30/20 split and the warnings update as you type. ' +
    'The “spent” column is what has actually gone out by day ' + HEARTH_MONTH.dayOfMonth + ', so a budget set below it flags red at once.</p>' +
    '<h3 class="group-title">Income</h3>' + incomeRows +
    '<div id="planner-groups">' + groups + '</div></section>' +
    '<section class="panel" id="planner-summary">' + plannerSummary(state) + '</section>';
}

// ---- bills ------------------------------------------------------------------

function viewBills(state) {
  const rows = state.bills.slice().sort((a, b) => a.dueDay - b.dueDay).map((b) =>
    '<div class="bill-row' + (b.paid ? ' bill-paid' : '') + '">' +
    '<span class="bill-due">due<br><strong>' + b.dueDay + '</strong></span>' +
    '<span class="bill-main">' + b.label + '<small>' + b.detail + '</small></span>' +
    '<span class="bill-amount">' + formatRp(b.amount) + '</span>' +
    '<label class="bill-toggle"><input type="checkbox" data-bill="' + b.id + '"' + (b.paid ? ' checked' : '') + '> paid</label></div>'
  ).join('');
  return '<section class="panel"><h2>Bills &amp; Due Dates</h2>' +
    '<p>Every fixed bill for ' + HEARTH_MONTH.label + ', in due-date order. Tick a bill off as paid and the amount ' +
    'still to find this month drops with it — try it.</p>' + rows +
    '<div class="bill-totals"><span>All bills <strong>' + formatRp(billsTotal(state)) + '</strong></span>' +
    '<span>Still to pay <strong id="bills-due">' + formatRp(billsStillDue(state)) + '</strong></span></div>' +
    '<p class="panel-note">Still open: BPJS Kesehatan (due 10th, paid by manual transfer), PAM water (due 20th) and the ' +
    'motorcycle instalment (due 27th). Together they are exactly the “bills still to pay” figure on the dashboard.</p></section>';
}

// ---- savings goals ------------------------------------------------------------

function goalCard(state, g, now) {
  const remaining = g.target - g.saved;
  const months = g.monthly > 0 ? Math.ceil(remaining / g.monthly) : 0;
  const finish = addMonths(now.getFullYear(), now.getMonth(), months);
  const finishValue = finish.getFullYear() + '-' + String(finish.getMonth() + 1).padStart(2, '0');
  return '<article class="panel goal-card" id="goal-' + g.id + '">' +
    '<h3>' + g.label + '</h3><p class="goal-note">' + g.note + '</p>' +
    '<div class="cat-head"><span class="cat-label">' + formatRp(g.saved) + ' saved</span>' +
    '<span class="cat-figures">target ' + formatRp(g.target) + ' · ' + formatRp(remaining) + ' to go · ' + formatPct(g.saved, g.target) + '</span></div>' +
    progressBar(g.saved, g.target) +
    '<div class="goal-calc">' +
    '<label>Monthly contribution <span class="rp-input">Rp <input type="number" min="0" step="50000" value="' + g.monthly + '" data-goal-monthly="' + g.id + '"></span></label>' +
    '<label>Finish by <input type="month" value="' + finishValue + '" data-goal-until="' + g.id + '"></label>' +
    '<p class="goal-readout" id="readout-' + g.id + '">At ' + formatRp(g.monthly) + ' a month this goal is fully funded in <strong>' +
    monthLabel(finish) + '</strong> (' + months + ' monthly payments). Pick an earlier month and the contribution it needs appears here.</p>' +
    '</div></article>';
}

function viewGoals(state) {
  const now = new Date();
  return '<section class="panel"><h2>Savings Goals</h2>' +
    '<p>Three goals, one calculator each. Change the monthly contribution and the finish date moves; ' +
    'change the finish month and the contribution it takes is worked out for you. Both directions update live.</p></section>' +
    state.goals.map((g) => goalCard(state, g, now)).join('');
}

// ---- guide --------------------------------------------------------------------

function viewGuide(state) {
  const income = totalIncome(state);
  return '<section class="panel guide"><h2>The HearthLedger Guide</h2>' +
    '<h3>Start with the 50/30/20 split</h3>' +
    '<p>Divide take-home pay into three buckets: about <strong>50% for needs</strong> (rent, food, bills, transport, school), ' +
    '<strong>30% for wants</strong> (eating out, subscriptions, shopping) and <strong>20% for savings and extra debt payments</strong>. ' +
    'It is a compass, not a law. In Jakarta, rent and school fees push this household\u2019s needs to ' + formatPct(groupBudget(state, 'needs'), income) +
    ' of income, so the plan compensates: wants stay near ' + formatPct(groupBudget(state, 'wants'), income) + ' and savings run at ' +
    formatPct(groupBudget(state, 'savings'), income) + '. What matters is that the three add up to the pay — plus a small buffer left unallocated on purpose.</p>' +
    '<h3>One month, worked out in rupiah</h3>' +
    '<table class="guide-table"><tr><th>Line</th><th>Amount</th><th>Share of income</th></tr>' +
    '<tr><td>Take-home income (salary Rp 13.500.000 + freelance Rp 1.500.000)</td><td>' + formatRp(income) + '</td><td>100%</td></tr>' +
    '<tr><td>Needs — rent, groceries, utilities, transport, school, health</td><td>' + formatRp(groupBudget(state, 'needs')) + '</td><td>' + formatPct(groupBudget(state, 'needs'), income) + '</td></tr>' +
    '<tr><td>Wants — dining out, subscriptions, shopping, outings</td><td>' + formatRp(groupBudget(state, 'wants')) + '</td><td>' + formatPct(groupBudget(state, 'wants'), income) + '</td></tr>' +
    '<tr><td>Savings transfers — emergency, holiday, education</td><td>' + formatRp(groupBudget(state, 'savings')) + '</td><td>' + formatPct(groupBudget(state, 'savings'), income) + '</td></tr>' +
    '<tr><td>Left unallocated as a buffer</td><td>' + formatRp(income - totalBudget(state)) + '</td><td>' + formatPct(income - totalBudget(state), income) + '</td></tr></table>' +
    '<h3>Five habits that keep this budget alive</h3>' +
    '<ol class="habits">' +
    '<li><strong>Pay the savings first.</strong> The three transfers leave on payday by auto-debit, before any spending starts — what is left is what the month may spend.</li>' +
    '<li><strong>Give every bill a day.</strong> Bills are listed by due date on the Bills page, so a due date never ambushes the account mid-month.</li>' +
    '<li><strong>Shop the market weekly, not daily.</strong> One planned market run a week keeps groceries near Rp 550 rb a week; daily top-ups were adding Rp 300 rb a month.</li>' +
    '<li><strong>Let one category be the shock absorber.</strong> When dining out runs over — as it did this month — the buffer and next month\u2019s dining budget absorb it, never the emergency fund.</li>' +
    '<li><strong>Review for fifteen minutes on the 25th.</strong> Compare spent against budget, move what is left into a goal, and set next month\u2019s numbers while this month is still fresh.</li>' +
    '</ol>' +
    '<h3>The payday routine, in order</h3>' +
    '<p>1. Savings transfers out (Rp 3.800.000). 2. Rent and school fees paid (Rp 3.900.000). 3. Bills money set aside for the month\u2019s due dates. ' +
    '4. What remains is the spending money — groceries, transport, and the wants — watched on the dashboard until the 25th review.</p></section>';
}
