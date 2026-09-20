
    // ---- Jalali (Persian) calendar helpers ----
    function jDiv(a, b){ return Math.floor(a / b); }
    function jMod(a, b){ return a - jDiv(a, b) * b; }

    function gregorianToJalali(gy, gm, gd){
    const gDaysInMonth = [0,31,59,90,120,151,181,212,243,273,304,334];
    const gy2 = (gm > 2) ? gy + 1 : gy;
    let days = 355666 + (365 * gy) + jDiv(gy2 + 3, 4) - jDiv(gy2 + 99, 100) + jDiv(gy2 + 399, 400) + gd + gDaysInMonth[gm - 1];
    let jy = -1595 + 33 * jDiv(days, 12053);
    days = jMod(days, 12053);
    jy += 4 * jDiv(days, 1461);
    days = jMod(days, 1461);
    if (days > 365){
    jy += jDiv(days - 1, 365);
    days = jMod(days - 1, 365);
}
    let jm, jd;
    if (days < 186){
    jm = 1 + jDiv(days, 31);
    jd = 1 + jMod(days, 31);
} else {
    jm = 7 + jDiv(days - 186, 30);
    jd = 1 + jMod(days - 186, 30);
}
    return [jy, jm, jd];
}

    function jalaliToGregorian(jy, jm, jd){
    const jy2 = jy + 1595;
    let days = -355668 + (365 * jy2) + (jDiv(jy2, 33) * 8) + jDiv(jMod(jy2, 33) + 3, 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    let gy = 400 * jDiv(days, 146097);
    days = jMod(days, 146097);
    if (days > 36524){
    days -= 1;
    gy += 100 * jDiv(days, 36524);
    days = jMod(days, 36524);
    if (days >= 365) days += 1;
}
    gy += 4 * jDiv(days, 1461);
    days = jMod(days, 1461);
    if (days > 365){
    gy += jDiv(days - 1, 365);
    days = jMod(days - 1, 365);
}
    let gd = days + 1;
    const isGregLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const gDaysInMonth = [0,31, isGregLeap ? 29 : 28, 31,30,31,30,31,31,30,31,30,31];
    let gm = 1;
    while (gm <= 12 && gd > gDaysInMonth[gm]){
    gd -= gDaysInMonth[gm];
    gm += 1;
}
    return [gy, gm, gd];
}

    function isLeapJalaliYear(jy){
    return (((((jy - (jy > 0 ? 474 : 473)) % 2820) + 474 + 38) * 682) % 2816) < 682;
}

    function jalaliDaysInMonth(jy, jm){
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaliYear(jy) ? 30 : 29;
}

    function toPersianDigits(value){
    const en = '0123456789', fa = '۰۱۲۳۴۵۶۷۸۹';
    return String(value).replace(/[0-9]/g, d => fa[en.indexOf(d)]);
}

    function compareJalali(a, b){
    if (!a || !b) return 0;
    if (a.y !== b.y) return a.y - b.y;
    if (a.m !== b.m) return a.m - b.m;
    return a.d - b.d;
}

    function addOneJalaliDay(val){
    let { y, m, d } = val;
    d += 1;
    if (d > jalaliDaysInMonth(y, m)){
    d = 1;
    m += 1;
    if (m > 12){ m = 1; y += 1; }
}
    return { y, m, d };
}

    const JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

    const todayDate = new Date();
    const [TODAY_Y, TODAY_M, TODAY_D] = gregorianToJalali(todayDate.getFullYear(), todayDate.getMonth() + 1, todayDate.getDate());

    function formatJalali(val){
    return toPersianDigits(val.d) + ' ' + JALALI_MONTHS[val.m - 1] + ' ' + toPersianDigits(val.y);
}

    function closeAllPopups(){
    document.querySelectorAll('.calendar-popup').forEach(p => { p.hidden = true; });
}
    document.addEventListener('click', (e) => {
    if (!e.target.closest('.date-field, .has-popup')) closeAllPopups();
});
    document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllPopups();
});

    function createCalendar(input, popup, opts){
    opts = opts || {};
    let viewY = null, viewM = null, selected = null;
    const titleEl = popup.querySelector('.calendar-title');
    const daysEl = popup.querySelector('.calendar-days');
    const prevBtn = popup.querySelector('[data-dir="prev"]');
    const nextBtn = popup.querySelector('[data-dir="next"]');

    function render(){
    titleEl.textContent = JALALI_MONTHS[viewM - 1] + ' ' + toPersianDigits(viewY);
    const [gy, gm, gd] = jalaliToGregorian(viewY, viewM, 1);
    const firstWeekday = (new Date(gy, gm - 1, gd).getDay() + 1) % 7;
    const totalDays = jalaliDaysInMonth(viewY, viewM);
    const min = opts.getMin ? opts.getMin() : null;

    daysEl.innerHTML = '';
    for (let i = 0; i < firstWeekday; i += 1){
    daysEl.appendChild(document.createElement('span'));
}
    for (let d = 1; d <= totalDays; d += 1){
    const cell = { y: viewY, m: viewM, d };
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cal-day';
    btn.textContent = toPersianDigits(d);
    if (viewY === TODAY_Y && viewM === TODAY_M && d === TODAY_D) btn.classList.add('is-today');
    if (selected && selected.y === viewY && selected.m === viewM && selected.d === d) btn.classList.add('is-selected');
    if (min && compareJalali(cell, min) < 0){
    btn.disabled = true;
    btn.classList.add('is-disabled');
} else {
    btn.addEventListener('click', () => {
    selected = cell;
    input.value = formatJalali(cell);
    closeAllPopups();
    if (opts.onSelect) opts.onSelect(cell);
});
}
    daysEl.appendChild(btn);
}
}

    prevBtn.addEventListener('click', () => {
    viewM -= 1;
    if (viewM < 1){ viewM = 12; viewY -= 1; }
    render();
});
    nextBtn.addEventListener('click', () => {
    viewM += 1;
    if (viewM > 12){ viewM = 1; viewY += 1; }
    render();
});

    input.addEventListener('click', () => {
    if (input.disabled) return;
    const alreadyOpen = !popup.hidden;
    closeAllPopups();
    if (alreadyOpen) return;
    viewY = selected ? selected.y : TODAY_Y;
    viewM = selected ? selected.m : TODAY_M;
    render();
    popup.hidden = false;
    requestAnimationFrame(() => {
    popup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
});

    return {
    getSelected: () => selected,
    clear: () => { selected = null; input.value = ''; },
    refresh: () => { if (!popup.hidden) render(); },
};
}

    function createCounter(input, popup, categories){
    const MAIN_CAP = 9;
    const OVERALL_CAP = 10;
    const counts = {};
    const defaults = {};
    categories.forEach(c => { counts[c.key] = c.start || 0; defaults[c.key] = c.start || 0; });

    function groupTotal(group){
    return categories.filter(c => c.group === group).reduce((sum, c) => sum + counts[c.key], 0);
}
    function overallTotal(){
    return categories.reduce((sum, c) => sum + counts[c.key], 0);
}
    function canIncrement(c){
    if (counts[c.key] >= (c.cap || 9)) return false;
    if (c.group === 'main' && groupTotal('main') >= MAIN_CAP) return false;
    if (overallTotal() >= OVERALL_CAP) return false;
    return true;
}
    function canDecrement(c){
    if (counts[c.key] <= 0) return false;
    if (c.group === 'main' && groupTotal('main') <= 1) return false;
    return true;
}

    function updateDisplay(){
    const parts = categories
    .filter(c => counts[c.key] > 0)
    .map(c => toPersianDigits(counts[c.key]) + ' ' + c.label);
    input.value = parts.join('، ');
}

    function render(){
    categories.forEach(c => {
    const row = popup.querySelector('[data-type="' + c.key + '"]');
    row.querySelector('.counter-value').textContent = toPersianDigits(counts[c.key]);
    row.querySelector('[data-action="minus"]').disabled = !canDecrement(c);
    row.querySelector('[data-action="plus"]').disabled = !canIncrement(c);
});
}

    categories.forEach(c => {
    const row = popup.querySelector('[data-type="' + c.key + '"]');
    row.querySelector('[data-action="minus"]').addEventListener('click', () => {
    if (canDecrement(c)){
    counts[c.key] -= 1;
    render();
    updateDisplay();
}
});
    row.querySelector('[data-action="plus"]').addEventListener('click', () => {
    if (canIncrement(c)){
    counts[c.key] += 1;
    render();
    updateDisplay();
}
});
});

    const resetBtn = popup.querySelector('.counter-reset-btn');
    if (resetBtn){
    resetBtn.addEventListener('click', () => {
    categories.forEach(c => { counts[c.key] = defaults[c.key]; });
    render();
    updateDisplay();
});
}
    const confirmBtn = popup.querySelector('.counter-confirm-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', () => closeAllPopups());

    input.addEventListener('click', () => {
    const alreadyOpen = !popup.hidden;
    closeAllPopups();
    if (alreadyOpen) return;
    render();
    popup.hidden = false;
    requestAnimationFrame(() => {
    popup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
});

    render();
    updateDisplay();
    return { getCounts: () => ({ ...counts }), total: overallTotal };
}

    // Depart / return calendars, linked so return can't be earlier than depart
    const departField = document.querySelector('.date-field[data-field="depart"]');
    const returnField = document.querySelector('.date-field[data-field="return"]');
    const departInput = document.getElementById('depart');
    const returnInput = document.getElementById('return-date');
    let departCalendar, returnCalendar;
    departCalendar = createCalendar(departInput, departField.querySelector('.calendar-popup'), {
    onSelect: (val) => {
    const ret = returnCalendar.getSelected();
    if (ret && compareJalali(ret, val) < 0){
    returnCalendar.clear();
}
    returnCalendar.refresh();
}
});
    returnCalendar = createCalendar(returnInput, returnField.querySelector('.calendar-popup'), {
    getMin: () => departCalendar.getSelected()
});

    // One-way / round-trip switch: right = یک‌طرفه, left = رفت و برگشت (enables the return date)
    const tripOptions = document.querySelectorAll('.trip-type-option');
    const tripSwitch = document.querySelector('.trip-type-switch');
    tripOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        tripOptions.forEach(o => o.classList.remove('is-active'));
        opt.classList.add('is-active');
        const isRoundtrip = opt.dataset.trip === 'roundtrip';
        tripSwitch.classList.toggle('is-roundtrip', isRoundtrip);
        returnInput.disabled = !isRoundtrip;
        returnField.classList.toggle('is-disabled', !isRoundtrip);
        if (!isRoundtrip){
            returnCalendar.clear();
            closeAllPopups();
        }
    });
});

    // Hotel: check-out unlocks once check-in is picked, and can't be before the night after check-in
    const checkinField = document.querySelector('.date-field[data-field="checkin"]');
    const checkoutField = document.querySelector('.date-field[data-field="checkout"]');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    let checkinCalendar, checkoutCalendar;
    checkinCalendar = createCalendar(checkinInput, checkinField.querySelector('.calendar-popup'), {
    onSelect: (val) => {
    checkoutInput.disabled = false;
    checkoutField.classList.remove('is-disabled');
    const minForCheckout = addOneJalaliDay(val);
    const co = checkoutCalendar.getSelected();
    if (co && compareJalali(co, minForCheckout) < 0){
    checkoutCalendar.clear();
}
    checkoutCalendar.refresh();
}
});
    checkoutCalendar = createCalendar(checkoutInput, checkoutField.querySelector('.calendar-popup'), {
    getMin: () => {
    const ci = checkinCalendar.getSelected();
    return ci ? addOneJalaliDay(ci) : null;
}
});

    // Tour: single standalone date field
    const tourDateField = document.querySelector('.date-field[data-field="tour-date"]');
    createCalendar(document.getElementById('tour-date'), tourDateField.querySelector('.calendar-popup'), {});

    // Adult / child / infant counters for passengers, hotel guests, and tour headcount
    const counterCategories = [
    { key: 'adult', label: 'بزرگسال', group: 'main', cap: 9 },
    { key: 'child', label: 'کودک', group: 'main', cap: 9 },
    { key: 'infant', label: 'نوزاد', group: 'extra', cap: 2 },
    ];
    const passengersField = document.querySelector('.people-field[data-field="passengers"]');
    createCounter(
    document.getElementById('passengers'),
    passengersField.querySelector('.calendar-popup'),
    counterCategories.map(c => ({ ...c, start: c.key === 'adult' ? 1 : 0 }))
    );
    const guestsField = document.querySelector('.people-field[data-field="guests"]');
    createCounter(
    document.getElementById('guests'),
    guestsField.querySelector('.calendar-popup'),
    counterCategories.map(c => ({ ...c, start: c.key === 'adult' ? 2 : 0 }))
    );
    const tourPeopleField = document.querySelector('.people-field[data-field="tour-people"]');
    createCounter(
    document.getElementById('tour-people'),
    tourPeopleField.querySelector('.calendar-popup'),
    counterCategories.map(c => ({ ...c, start: c.key === 'adult' ? 2 : 0 }))
    );

    // Destination content per top-tab category, and syncing the FAQ + destinations sections
    const destinationsData = {
    flight: [
{ name: 'تهران', label: 'پرواز از', amount: '۹۸۰,۰۰۰ تومان' },
{ name: 'اصفهان', label: 'پرواز از', amount: '۱,۱۰۰,۰۰۰ تومان' },
{ name: 'شیراز', label: 'پرواز از', amount: '۸۵۰,۰۰۰ تومان' },
{ name: 'مشهد', label: 'پرواز از', amount: '۸۷۰,۰۰۰ تومان' },
{ name: 'کیش', label: 'پرواز از', amount: '۱,۲۰۰,۰۰۰ تومان' },
{ name: 'استانبول', label: 'پرواز از', amount: '۴,۱۰۰,۰۰۰ تومان' },
    ],
    train: [
{ name: 'تهران', label: 'قطار از', amount: '۴۵۰,۰۰۰ تومان' },
{ name: 'اصفهان', label: 'قطار از', amount: '۵۲۰,۰۰۰ تومان' },
{ name: 'یزد', label: 'قطار از', amount: '۴۸۰,۰۰۰ تومان' },
{ name: 'مشهد', label: 'قطار از', amount: '۶۵۰,۰۰۰ تومان' },
{ name: 'تبریز', label: 'قطار از', amount: '۵۹۰,۰۰۰ تومان' },
{ name: 'اهواز', label: 'قطار از', amount: '۵۳۰,۰۰۰ تومان' },
    ],
    bus: [
{ name: 'تهران', label: 'اتوبوس از', amount: '۲۲۰,۰۰۰ تومان' },
{ name: 'قم', label: 'اتوبوس از', amount: '۱۲۰,۰۰۰ تومان' },
{ name: 'اصفهان', label: 'اتوبوس از', amount: '۲۸۰,۰۰۰ تومان' },
{ name: 'شیراز', label: 'اتوبوس از', amount: '۳۵۰,۰۰۰ تومان' },
{ name: 'رشت', label: 'اتوبوس از', amount: '۲۶۰,۰۰۰ تومان' },
{ name: 'ساری', label: 'اتوبوس از', amount: '۲۴۰,۰۰۰ تومان' },
    ],
    hotel: [
{ name: 'کیش', label: 'هتل از', amount: '۱,۸۰۰,۰۰۰ تومان' },
{ name: 'اصفهان', label: 'هتل از', amount: '۱,۲۰۰,۰۰۰ تومان' },
{ name: 'شیراز', label: 'هتل از', amount: '۹۵۰,۰۰۰ تومان' },
{ name: 'مشهد', label: 'هتل از', amount: '۱,۱۰۰,۰۰۰ تومان' },
{ name: 'یزد', label: 'هتل از', amount: '۸۵۰,۰۰۰ تومان' },
{ name: 'تهران', label: 'هتل از', amount: '۱,۵۰۰,۰۰۰ تومان' },
    ],
    tour: [
{ name: 'کیش', label: 'تور از', amount: '۳,۴۰۰,۰۰۰ تومان' },
{ name: 'استانبول', label: 'تور از', amount: '۶,۸۰۰,۰۰۰ تومان' },
{ name: 'آنتالیا', label: 'تور از', amount: '۹,۵۰۰,۰۰۰ تومان' },
{ name: 'اصفهان', label: 'تور از', amount: '۲,۹۰۰,۰۰۰ تومان' },
{ name: 'قشم', label: 'تور از', amount: '۳,۱۰۰,۰۰۰ تومان' },
{ name: 'شیراز', label: 'تور از', amount: '۲,۷۰۰,۰۰۰ تومان' },
    ],
};
    const categoryLabels = { flight: 'پرواز', train: 'قطار', bus: 'اتوبوس', hotel: 'هتل', tour: 'تور' };
    const destCards = document.querySelectorAll('.dest-card');
    const destinationsHeading = document.getElementById('destinations-heading');

    function updateDestinations(category){
    const data = destinationsData[category];
    if (!data) return;
    destCards.forEach((card, i) => {
    const item = data[i];
    if (!item) return;
    card.querySelector('h3').textContent = item.name;
    card.querySelector('.price').innerHTML = item.label + ' <b>' + item.amount + '</b>';
});
    if (destinationsHeading) destinationsHeading.textContent = 'مقصدهای محبوب ' + categoryLabels[category];
}

    function updateFaqCategory(category){
    const tab = document.querySelector('.faq-tab[data-faq="' + category + '"]');
    if (!tab) return;
    document.querySelectorAll('.faq-tab').forEach(t => t.classList.toggle('is-active', t === tab));
    document.querySelectorAll('.faq-list').forEach(list => list.classList.toggle('is-active', list.dataset.faq === category));
}

    // Tab switching for the search widget
    const tabs = document.querySelectorAll('.search-tab');
    const fieldsets = document.querySelectorAll('.search-fields');
    const trainOptionsRow = document.querySelector('.train-options-row');
    tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const mode = tab.dataset.mode;
        fieldsets.forEach(fs => fs.classList.toggle('is-active', fs.dataset.mode === mode));
        trainOptionsRow.hidden = tab.dataset.tab !== 'train';

        const category = tab.dataset.tab || tab.dataset.mode;
        updateFaqCategory(category);
        updateDestinations(category);
    });
});
    updateDestinations('flight');

    // Swap origin / destination
    const swapBtn = document.querySelector('.swap-btn');
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    swapBtn.addEventListener('click', () => {
    const tmp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tmp;
    swapBtn.classList.toggle('spun');
});

    // FAQ category tabs
    const faqTabs = document.querySelectorAll('.faq-tab');
    const faqLists = document.querySelectorAll('.faq-list');
    faqTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        faqTabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const cat = tab.dataset.faq;
        faqLists.forEach(list => list.classList.toggle('is-active', list.dataset.faq === cat));
    });
});

    // FAQ accordion (one open item per category at a time)
    document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('is-open');
        item.closest('.faq-list').querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
        if (!wasOpen) item.classList.add('is-open');
    });
});

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.mobile-nav-drawer');
    hamburger.addEventListener('click', () => {
    mainNav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');
});
    document.addEventListener('click', (e) => {
    if (!mainNav.classList.contains('is-open')) return;
    if (e.target.closest('.mobile-nav-drawer') || e.target.closest('.hamburger')) return;
    mainNav.classList.remove('is-open');
    hamburger.classList.remove('is-active');
});
