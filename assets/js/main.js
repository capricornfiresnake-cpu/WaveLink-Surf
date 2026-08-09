/* =====================================================================
   WAVELINK — shared site behaviour
   Header scroll · mobile menu · cart drawer + storage · reveals · FAQ
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- header scroll state ---------- */
  var header = document.querySelector(".site-header");
  var solid = document.body.classList.contains("header-solid");
  function onScroll() {
    if (solid) return;
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  if (header) { onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); }

  /* ---------- mobile menu overlay ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var overlay = document.querySelector(".nav-overlay");
  var closeBtn = document.querySelector(".nav-overlay__close");
  function openMenu() { overlay.classList.add("open"); document.body.style.overflow = "hidden"; if (toggle) toggle.setAttribute("aria-expanded", "true"); }
  function closeMenu() { overlay.classList.remove("open"); document.body.style.overflow = ""; if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  if (toggle && overlay) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    overlay.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal, .reveal-line");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__item");
      var a = item.querySelector(".faq__a");
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
    });
  });

  /* =====================================================================
     CART  (shared across pages via localStorage)
     ===================================================================== */
  var KEY = "wavelink_cart_v1";
  var money = function (n) { return "$" + n.toLocaleString("en-US"); };

  window.WLCart = {
    read: function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
    write: function (c) { localStorage.setItem(KEY, JSON.stringify(c)); render(); },
    add: function (item) { var c = this.read(); item.id = Date.now() + "" + Math.floor(Math.random() * 999); c.push(item); this.write(c); openDrawer(); },
    remove: function (id) { this.write(this.read().filter(function (i) { return i.id !== id; })); },
    clear: function () { this.write([]); },
    total: function () { return this.read().reduce(function (s, i) { return s + i.price * i.surfers; }, 0); },
    count: function () { return this.read().reduce(function (s, i) { return s + i.surfers; }, 0); }
  };

  var drawer = document.querySelector(".drawer");
  var itemsEl = document.querySelector(".drawer__items");
  var totalEl = document.querySelector("[data-cart-total]");
  var countEls = document.querySelectorAll(".cart-count");
  var footEl = document.querySelector(".drawer__foot");

  function openDrawer() { if (drawer) { drawer.classList.add("open"); document.body.style.overflow = "hidden"; } }
  function closeDrawer() { if (drawer) { drawer.classList.remove("open"); document.body.style.overflow = ""; } }

  document.querySelectorAll("[data-cart-open]").forEach(function (b) { b.addEventListener("click", openDrawer); });
  document.querySelectorAll("[data-cart-close]").forEach(function (b) { b.addEventListener("click", closeDrawer); });

  function render() {
    var cart = window.WLCart.read();
    var n = window.WLCart.count();
    countEls.forEach(function (el) {
      el.textContent = n;
      el.classList.toggle("show", n > 0);
    });
    if (!itemsEl) return;
    if (!cart.length) {
      itemsEl.innerHTML = '<div class="cart-empty"><p>Your cart is empty. Choose a lesson and pick your date to get started.</p><a class="btn btn--ghost btn--sm" href="book.html">Browse lessons</a></div>';
      if (footEl) footEl.style.display = "none";
      if (totalEl) totalEl.textContent = money(0);
      return;
    }
    if (footEl) footEl.style.display = "";
    itemsEl.innerHTML = cart.map(function (i) {
      return '<div class="cart-item">' +
        '<img class="cart-item__img" src="' + i.img + '" alt="">' +
        '<div><div class="cart-item__name">' + i.name + '</div>' +
        '<div class="cart-item__meta">' + i.dateLabel + ' · ' + i.time + '<br>' + i.surfers + ' surfer' + (i.surfers > 1 ? 's' : '') + ' · ' + money(i.price) + ' each</div>' +
        '<button class="cart-item__rm" data-rm="' + i.id + '">Remove</button></div>' +
        '<div class="cart-item__price">' + money(i.price * i.surfers) + '</div>' +
        '</div>';
    }).join("");
    if (totalEl) totalEl.textContent = money(window.WLCart.total());
    itemsEl.querySelectorAll("[data-rm]").forEach(function (b) {
      b.addEventListener("click", function () { window.WLCart.remove(b.getAttribute("data-rm")); });
    });
  }
  render();

  /* close overlays on Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDrawer(); if (overlay) closeMenu(); }
  });

  /* ---------- footer year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
