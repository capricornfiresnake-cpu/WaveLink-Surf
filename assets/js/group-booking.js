/* =====================================================================
   WAVELINK — Group Lesson booking (custom request flow)
   Group only: pick date + time + number of surfers (min 3, $80 each),
   then send a booking request by email. Ari confirms and sends a
   payment link. Private/Semi use the Acuity popup instead.
   ===================================================================== */
(function () {
  "use strict";
  var PRICE = 80, MIN = 3, MAX = 8;
  var SLOTS = ["7:00 AM", "9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var modal = document.getElementById("group-modal");
  if (!modal) return;

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var state = { date: null, time: null, surfers: MIN, view: new Date(today.getFullYear(), today.getMonth(), 1) };

  var el = {
    calMonth: modal.querySelector("[data-gcal-month]"),
    calGrid: modal.querySelector("[data-gcal-grid]"),
    prev: modal.querySelector("[data-gcal-prev]"),
    next: modal.querySelector("[data-gcal-next]"),
    slots: modal.querySelector("[data-gslots]"),
    dec: modal.querySelector("[data-gdec]"),
    inc: modal.querySelector("[data-ginc]"),
    num: modal.querySelector("[data-gnum]"),
    sumDate: modal.querySelector("[data-gsum-date]"),
    sumTime: modal.querySelector("[data-gsum-time]"),
    sumSurfers: modal.querySelector("[data-gsum-surfers]"),
    sumTotal: modal.querySelector("[data-gsum-total]"),
    submit: modal.querySelector("[data-g-submit]"),
    form: modal.querySelector("[data-g-form]"),
    confirm: modal.querySelector("[data-g-confirm]"),
    name: modal.querySelector("#g-name"),
    email: modal.querySelector("#g-email"),
    phone: modal.querySelector("#g-phone")
  };

  function money(n) { return "$" + n.toLocaleString("en-US"); }
  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function fmtDate(d) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }

  function renderCal() {
    var v = state.view;
    el.calMonth.textContent = MONTHS[v.getMonth()] + " " + v.getFullYear();
    var startDow = new Date(v.getFullYear(), v.getMonth(), 1).getDay();
    var days = new Date(v.getFullYear(), v.getMonth() + 1, 0).getDate();
    var html = "";
    for (var i = 0; i < startDow; i++) html += '<div class="cal-day empty"></div>';
    for (var d = 1; d <= days; d++) {
      var date = new Date(v.getFullYear(), v.getMonth(), d);
      var past = date < today;
      var sel = sameDay(date, state.date);
      html += '<button class="cal-day' + (sel ? ' sel' : '') + '" ' + (past ? 'disabled' : 'data-day="' + d + '"') + '>' + d + '</button>';
    }
    el.calGrid.innerHTML = html;
    el.calGrid.querySelectorAll("[data-day]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.date = new Date(v.getFullYear(), v.getMonth(), +b.getAttribute("data-day"));
        renderCal(); renderSummary();
      });
    });
    el.prev.disabled = (v.getFullYear() === today.getFullYear() && v.getMonth() === today.getMonth());
  }

  function renderSlots() {
    el.slots.innerHTML = SLOTS.map(function (s) {
      return '<button class="slot' + (s === state.time ? ' sel' : '') + '" data-slot="' + s + '">' + s + '</button>';
    }).join("");
    el.slots.querySelectorAll("[data-slot]").forEach(function (b) {
      b.addEventListener("click", function () { state.time = b.getAttribute("data-slot"); renderSlots(); renderSummary(); });
    });
  }

  function renderStepper() {
    el.num.textContent = state.surfers;
    el.dec.disabled = state.surfers <= MIN;
    el.inc.disabled = state.surfers >= MAX;
  }

  function renderSummary() {
    el.sumDate.textContent = state.date ? fmtDate(state.date) : "Select a date";
    el.sumTime.textContent = state.time || "Select a time";
    el.sumSurfers.textContent = state.surfers + " × " + money(PRICE);
    el.sumTotal.textContent = money(PRICE * state.surfers);
    el.submit.disabled = !(state.date && state.time);
  }

  function openModal() {
    state.date = null; state.time = null; state.surfers = MIN;
    state.view = new Date(today.getFullYear(), today.getMonth(), 1);
    el.form.style.display = "";
    if (el.confirm) el.confirm.classList.remove("show");
    renderCal(); renderSlots(); renderStepper(); renderSummary();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }

  el.prev.addEventListener("click", function () { state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1); renderCal(); });
  el.next.addEventListener("click", function () { state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1); renderCal(); });
  el.dec.addEventListener("click", function () { if (state.surfers > MIN) { state.surfers--; renderStepper(); renderSummary(); } });
  el.inc.addEventListener("click", function () { if (state.surfers < MAX) { state.surfers++; renderStepper(); renderSummary(); } });

  el.submit.addEventListener("click", function () {
    if (!(state.date && state.time)) return;
    var name = (el.name.value || "").trim();
    var email = (el.email.value || "").trim();
    if (!name) { el.name.focus(); return; }
    if (!email) { el.email.focus(); return; }
    var phone = (el.phone.value || "").trim() || "—";

    var body =
      "New GROUP LESSON booking request from the Wavelink website\n" +
      "----------------------------------------\n\n" +
      "Name:  " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + phone + "\n\n" +
      "Lesson: Group Lesson\n" +
      "Date:   " + fmtDate(state.date) + "\n" +
      "Time:   " + state.time + "\n" +
      "Surfers: " + state.surfers + " × " + money(PRICE) + "\n" +
      "Total:  " + money(PRICE * state.surfers) + "\n\n" +
      "Please confirm availability and send a payment link.\n";

    window.location.href = "mailto:ariengel22@icloud.com" +
      "?subject=" + encodeURIComponent("Group Lesson request — " + name) +
      "&body=" + encodeURIComponent(body);

    el.form.style.display = "none";
    if (el.confirm) el.confirm.classList.add("show");
  });

  document.querySelectorAll("[data-group-book]").forEach(function (b) {
    b.addEventListener("click", openModal);
  });
  modal.querySelectorAll("[data-g-close]").forEach(function (x) { x.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
})();
