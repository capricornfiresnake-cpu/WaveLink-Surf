/* =====================================================================
   WAVELINK — checkout page (interim "request a lesson" mode)
   Collects the guest's details + cart and emails the booking request to
   Wavelink. No backend required — works the moment the site is live.
   (When Acuity/Stripe is connected, the Book page moves to real-time
   booking + payment and this page is retired.)
   ===================================================================== */
(function () {
  "use strict";
  var money = function (n) { return "$" + n.toLocaleString("en-US"); };

  var linesEl = document.querySelector("[data-order-lines]");
  var totalEl = document.querySelector("[data-order-total]");
  var form = document.getElementById("checkout-form");
  var confirmEl = document.querySelector("[data-confirm]");
  var submitBtn = form ? form.querySelector('[type="submit"]') : null;

  function render() {
    var cart = window.WLCart.read();
    if (!cart.length) {
      linesEl.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a class="btn btn--ghost btn--sm" href="book.html">Browse lessons</a></div>';
      totalEl.textContent = money(0);
      if (submitBtn) submitBtn.disabled = true;
      return;
    }
    if (submitBtn) submitBtn.disabled = false;
    linesEl.innerHTML = cart.map(function (i) {
      return '<div class="order-line">' +
        '<img src="' + i.img + '" alt="">' +
        '<div><div class="nm">' + i.name + '</div>' +
        '<div class="mt">' + i.dateLabel + ' · ' + i.time + '<br>' + i.surfers + ' surfer' + (i.surfers > 1 ? 's' : '') + ' × ' + money(i.price) + '</div>' +
        '<button class="rm" data-rm="' + i.id + '">Remove</button></div>' +
        '<div class="pr">' + money(i.price * i.surfers) + '</div></div>';
    }).join("");
    totalEl.textContent = money(window.WLCart.total());
    linesEl.querySelectorAll("[data-rm]").forEach(function (b) {
      b.addEventListener("click", function () { window.WLCart.remove(b.getAttribute("data-rm")); render(); });
    });
  }
  render();

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var cart = window.WLCart.read();
      if (!cart.length) return;

      var data = new FormData(form);
      var name = data.get("name") || "", email = data.get("email") || "",
          phone = data.get("phone") || "—", notes = data.get("notes") || "—";

      var lines = cart.map(function (i) {
        return "• " + i.name + " — " + i.dateLabel + " at " + i.time +
          " — " + i.surfers + " surfer(s) x " + money(i.price) + " = " + money(i.price * i.surfers);
      }).join("\n");

      var body =
        "New booking request from the Wavelink website\n" +
        "----------------------------------------\n\n" +
        "Name:  " + name + "\n" +
        "Email: " + email + "\n" +
        "Phone: " + phone + "\n\n" +
        "Lessons:\n" + lines + "\n\n" +
        "Total: " + money(window.WLCart.total()) + "\n\n" +
        "Notes: " + notes + "\n";

      window.location.href = "mailto:ariengel22@icloud.com" +
        "?subject=" + encodeURIComponent("Booking request — " + name) +
        "&body=" + encodeURIComponent(body);

      if (confirmEl) confirmEl.classList.add("show");
      form.style.display = "none";
      window.WLCart.clear();
      render();
      if (confirmEl) confirmEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
