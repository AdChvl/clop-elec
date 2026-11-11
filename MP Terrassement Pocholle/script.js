/* MP Terrassement – script.js (vanilla, sans dépendance) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Horaires (modifier ici si besoin) ----------
     Index : 0 = dimanche … 6 = samedi. Heures en minutes depuis minuit.
     Exemple : [[540, 720], [840, 1140]] = 9h-12h puis 14h-19h. */
  var HOURS = {
    0: [],
    1: [[480, 720], [810, 1080]],
    2: [[480, 720], [810, 1080]],
    3: [[480, 720], [810, 1080]],
    4: [[480, 720], [810, 1080]],
    5: [[480, 720], [810, 1080]],
    6: []
  };
  var PHONE = "03 22 27 94 12";
  var DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  /* ---------- Menu burger ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("menu");

  function setMenu(open) {
    if (!burger || !nav) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("is-open", open);
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        burger.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) setMenu(false);
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Ombre de l'en-tête au défilement ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Lien actif dans le menu + apparition des blocs ---------- */
  if ("IntersectionObserver" in window) {
    var links = document.querySelectorAll('.main-nav a[href^="#"]');
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && byId[entry.target.id]) {
          links.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
          byId[entry.target.id].classList.add("is-active");
          byId[entry.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });

    var revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealIo.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { revealIo.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Ouvert / fermé (heure de Paris) ---------- */
  function parisNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[map.weekday], minutes: parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + "h" + (m ? String(m).padStart(2, "0") : "");
  }

  function nextOpening(now) {
    for (var i = 0; i < 8; i++) {
      var day = (now.day + i) % 7;
      var slots = HOURS[day] || [];
      for (var j = 0; j < slots.length; j++) {
        if (i > 0 || slots[j][0] > now.minutes) {
          var when = i === 0 ? "aujourd'hui" : i === 1 ? "demain" : DAY_NAMES[day];
          return when + " à " + fmt(slots[j][0]);
        }
      }
    }
    return "";
  }

  if (HOURS) {
    var now = parisNow();
    document.querySelectorAll("[data-status]").forEach(function (status) {
      var text = status.querySelector(".status-text");
      var current = (HOURS[now.day] || []).filter(function (s) { return now.minutes >= s[0] && now.minutes < s[1]; })[0];
      if (current) {
        status.classList.add("is-open");
        text.textContent = "Ouvert en ce moment · jusqu'à " + fmt(current[1]);
      } else {
        status.classList.add("is-closed");
        text.textContent = "Fermé en ce moment · ouvre " + nextOpening(now);
      }
    });
    var todayRow = document.querySelector('.hours tr[data-day="' + now.day + '"]');
    if (todayRow) todayRow.classList.add("is-today");
  }

  /* ---------- Année du pied de page ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Formulaire Web3Forms ---------- */
  var form = document.querySelector(".contact-form");
  if (form) {
    var result = form.querySelector(".form-result");
    var button = form.querySelector('button[type="submit"]');
    var label = button.textContent;
    var fallback = PHONE ? " Appelez-nous au " + PHONE + "." : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      result.className = "form-result";

      var invalid = null;
      form.querySelectorAll("[required]").forEach(function (field) {
        var ok = field.value.trim() !== "";
        field.setAttribute("aria-invalid", String(!ok));
        if (!ok && !invalid) invalid = field;
      });
      var email = form.querySelector('[type="email"]');
      if (email && email.value && !email.checkValidity()) {
        email.setAttribute("aria-invalid", "true");
        invalid = invalid || email;
      }
      if (invalid) {
        result.classList.add("is-error");
        result.textContent = "Merci de remplir les champs obligatoires (*).";
        invalid.focus();
        return;
      }

      var key = form.querySelector('[name="access_key"]').value;
      if (!key || key.indexOf("VOTRE_CLE") === 0) {
        result.classList.add("is-error");
        result.textContent = "Le formulaire n'est pas encore activé." + fallback;
        return;
      }

      button.disabled = true;
      button.textContent = "Envoi en cours…";

      fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) {
            result.classList.add("is-ok");
            result.textContent = "Merci, votre message a bien été envoyé. Nous vous répondons rapidement.";
            form.reset();
          } else {
            throw new Error("send failed");
          }
        })
        .catch(function () {
          result.classList.add("is-error");
          result.textContent = "L'envoi a échoué." + fallback;
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = label;
        });
    });
  }
})();
