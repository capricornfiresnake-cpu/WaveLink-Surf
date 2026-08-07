/* =====================================================================
   WAVELINK — booking flow (Book Online page)
   Opens a modal with a calendar, time slots and surfer count,
   computes the price live, and adds the reservation to the cart.
   ===================================================================== */
(function () {
  "use strict";

  var LESSONS = {
    private: { name: "Private Lesson", price: 125, unit: "per surfer", min: 1, max: 1, img: "assets/img/coach-student.jpg" },
    semi:    { name: "Semi-Private Lesson", price: 98, unit: "per surfer", min: 2, max: 2, img: "assets/img/ride-1.jpg" },
    group:   { name: "Group Lesson", price: 80, unit: "per person", min: 3, max: 8, img: "assets/img/kid-orange.jpg" }
  };
  var SLOTS = ["7:00 AM", "9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DOW = ["S", "M", "T", "W", "T", "F", "S"];

  var modal = document.getElementById("booking-modal");
  if (!modal) return;

  var state = { key: null, date: null, time: null, surfers: 1, view: new Date() };
  var today = new Date(); today.setHours(0, 0, 0, 0);

  var el = {
    title: modal.querySelector("[data-b-title]"),
    calMonth: modal.querySelector("[data-cal-month]"),
    calGrid: modal.querySelector("[data-cal-grid]"),
    prev: modal.querySelector("[data-cal-prev]"),
    next: modal.querySelector("[data-cal-next]"),
    slots: modal.querySelector("[data-slots]"),
    dec: modal.querySelector("[data-dec]"),
    inc: modal.querySelector("[data-inc]"),
    num: modal.querySelector("[data-num]"),
    hint: modal.querySelector("[data-surfer-hint]"),
    sumName: modal.querySelector("[data-sum-name]"),
    sumDate: modal.querySelector("[data-sum-date]"),
    sumTime: modal.querySelector("[data-sum-time]"),
    sumSurfers: modal.querySelector("[data-sum-surfers]"),
    sumTotal: modal.querySelector("[data-sum-total]"),
    add: modal.querySelector("[data-b-add]")
  };

  function money(n) { return "$" + n.toLocaleString("en-US"); }
  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function fmtDate(d) {
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }

  function open(key) {
    var L = LESSONS[key];
    state.key = key;
    state.date = null;
    state.time = null;
    state.surfers = L.min;
    state.view = new Date(today.getFullYear(), today.getMonth(), 1);
    el.title.textContent = "Reserve · " + L.name;
    el.hint.textContent = key === "group"
      ? "Group lessons are for 3 or more surfers — one coach for every two surfers."
      : key === "semi" ? "Semi-private is for exactly two surfers sharing one instructor."
      : "Private lessons are one surfer, one instructor.";
    renderCal(); renderSlots(); renderStepper(); renderSummary();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() { modal.classList.remove("open"); document.body.style.overflow = ""; }

  function renderCal() {
    var v = state.view;
    el.calMonth.textContent = MONTHS[v.getMonth()] + " " + v.getFullYear();
    var first = new Date(v.getFullYear(), v.getMonth(), 1);
    var startDow = first.getDay();
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
    // limit backward navigation to current month
    var atStart = v.getFullYear() === today.getFullYear() && v.getMonth() === today.getMonth();
    el.prev.disabled = atStart;
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
    var L = LESSONS[state.key];
    el.num.textContent = state.surfers;
    el.dec.disabled = state.surfers <= L.min;
    el.inc.disabled = state.surfers >= L.max;
  }

  function renderSummary() {
    var L = LESSONS[state.key];
    el.sumName.textContent = L.name;
    el.sumDate.textContent = state.date ? fmtDate(state.date) : "Select a date";
    el.sumTime.textContent = state.time || "Select a time";
    el.sumSurfers.textContent = state.surfers + " × " + money(L.price);
    el.sumTotal.textContent = money(L.price * state.surfers);
    el.add.disabled = !(state.date && state.time);
  }

  el.prev.addEventListener("click", function () {
    state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1); renderCal();
  });
  el.next.addEventListener("click", function () {
    state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1); renderCal();
  });
  el.dec.addEventListener("click", function () {
    var L = LESSONS[state.key];
    if (state.surfers > L.min) { state.surfers--; renderStepper(); renderSummary(); }
  });
  el.inc.addEventListener("click", function () {
    var L = LESSONS[state.key];
    if (state.surfers < L.max) { state.surfers++; renderStepper(); renderSummary(); }
  });

  el.add.addEventListener("click", function () {
    if (!(state.date && state.time)) return;
    var L = LESSONS[state.key];
    window.WLCart.add({
      key: state.key, name: L.name, price: L.price, surfers: state.surfers,
      time: state.time, date: state.date.toISOString(), dateLabel: fmtDate(state.date), img: L.img
    });
    close();
  });

  modal.querySelectorAll("[data-b-close]").forEach(function (b) { b.addEventListener("click", close); });

  document.querySelectorAll("[data-book]").forEach(function (b) {
    b.addEventListener("click", function () { open(b.getAttribute("data-book")); });
  });
})();
