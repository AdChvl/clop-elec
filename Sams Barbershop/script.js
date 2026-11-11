/* Sam's Barbershop – script.js (vanilla, sans dépendance) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Horaires (modifier ici si besoin) ----------
     Index : 0 = dimanche … 6 = samedi. Heures en minutes depuis minuit.
     Exemple : [[540, 720], [840, 1140]] = 9h-12h puis 14h-19h. */
  var HOURS = {
    0: [],
    1: [[540, 720], [840, 1140]],
    2: [[540, 720], [840, 1140]],
    3: [[540, 720], [840, 1140]],
    4: [[540, 720], [840, 1140]],
    5: [[540, 720], [840, 1140]],
    6: [[540, 1080]]
  };
  var PHONE = "03 22 31 63 52";
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

  /* ---------- Visualiseurs 360° / 180° ----------
     Chaque bloc [data-spin] lit une suite d'images numérotées (01.webp, 02.webp…).
     data-loop : tour complet qui boucle. Sinon : aller simple (data-arc degrés). */
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-spin]").forEach(function (root) {
    var stage = root.querySelector(".spin-stage");
    var img = stage.querySelector("img");
    var thumb = root.querySelector(".spin-track span");
    var count = parseInt(root.dataset.count, 10);
    var loop = root.hasAttribute("data-loop");
    var arc = loop ? 360 : parseInt(root.dataset.arc || "180", 10);
    var start = parseInt(root.dataset.start || "1", 10) - 1;
    var pos = start;          // position courante (décimale) dans la suite d'images
    var shown = -1;
    var frames = [];
    var loading = false, ready = false, visible = false, demoDone = false;
    var raf = 0;

    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    if (!ctx || !count) return;

    function clamp(p) {
      if (loop) return ((p % count) + count) % count;
      return Math.max(0, Math.min(count - 1, p));
    }

    function render() {
      var i = Math.round(pos);
      if (loop) i = i % count;
      if (i === shown) return;
      var f = frames[i];
      if (!f || !f.complete || !f.naturalWidth) return;
      ctx.drawImage(f, 0, 0, canvas.width, canvas.height);
      shown = i;
      var ratio = loop ? i / count : i / (count - 1);
      var angle = Math.round(loop ? ratio * 360 : ratio * arc - arc / 2);
      if (thumb) thumb.style.left = (ratio * 100) + "%";
      stage.setAttribute("aria-valuenow", angle);
      stage.setAttribute("aria-valuetext", !loop && angle === 0 ? "De face" : angle + "°");
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    /* Petite rotation de démonstration, une seule fois, quand le bloc devient visible */
    function demo() {
      if (demoDone || !ready || !visible) return;
      demoDone = true;
      if (reducedMotion) return;
      var duration = loop ? 4200 : 3600;
      var amp = Math.min(start, count - 1 - start);
      var t0 = 0;
      var step = function (now) {
        if (!t0) t0 = now;
        var u = Math.min(1, (now - t0) / duration);
        if (loop) {
          var e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          pos = clamp(start + count * e);
        } else {
          pos = clamp(start + amp * Math.sin(2 * Math.PI * u));
        }
        render();
        raf = u < 1 ? requestAnimationFrame(step) : 0;
      };
      raf = requestAnimationFrame(step);
    }

    function load() {
      if (loading) return;
      loading = true;
      var done = 0;
      for (var i = 0; i < count; i++) {
        var f = new Image();
        f.onload = f.onerror = function () {
          done++;
          if (done < count) return;
          ready = frames.every(function (x) { return x.naturalWidth > 0; });
          if (!ready) return;   // une image manque : on garde la photo fixe
          stage.insertBefore(canvas, img.nextSibling);
          render();
          root.classList.add("is-ready");
          demo();
        };
        f.src = root.dataset.path + String(i + 1).padStart(2, "0") + ".webp";
        frames.push(f);
      }
    }

    function touched() {
      stop();
      demoDone = true;
      root.classList.add("is-touched");
    }

    /* Glisser à la souris ou au doigt */
    var dragging = false, lastX = 0, lastT = 0, velocity = 0;

    function perFrame() { return Math.max(4, stage.clientWidth * 1.1 / count); }

    stage.addEventListener("pointerdown", function (e) {
      if (!ready || (e.pointerType === "mouse" && e.button !== 0)) return;
      touched();
      dragging = true;
      lastX = e.clientX;
      lastT = e.timeStamp;
      velocity = 0;
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
    });

    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      var dt = Math.max(1, e.timeStamp - lastT);
      var d = -dx / perFrame();
      pos = clamp(pos + d);
      velocity = .7 * (d / dt) + .3 * velocity;
      lastX = e.clientX;
      lastT = e.timeStamp;
      render();
    });

    function release(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      if (reducedMotion || e.type === "pointercancel" || e.timeStamp - lastT > 80 || Math.abs(velocity) < .004) return;
      var v = Math.max(-.05, Math.min(.05, velocity)), prev = 0;
      var glide = function (now) {   // élan après le lâcher
        var dt = prev ? Math.min(40, now - prev) : 16;
        prev = now;
        var next = clamp(pos + v * dt);
        if (!loop && (next === 0 || next === count - 1)) v = 0;
        pos = next;
        v *= Math.pow(.994, dt);
        render();
        raf = Math.abs(v) > .0015 ? requestAnimationFrame(glide) : 0;
      };
      raf = requestAnimationFrame(glide);
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);

    /* Clavier : flèches, Début, Fin */
    stage.addEventListener("keydown", function (e) {
      if (!ready) return;
      var p = Math.round(pos);
      if (e.key === "ArrowRight" || e.key === "ArrowUp") p += 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") p -= 1;
      else if (e.key === "Home") p = 0;
      else if (e.key === "End") p = count - 1;
      else return;
      e.preventDefault();
      touched();
      pos = clamp(p);
      render();
    });

    /* Chargement différé des images, puis démo quand le bloc est bien visible */
    if ("IntersectionObserver" in window) {
      var loadIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { loadIo.disconnect(); load(); }
      }, { rootMargin: "600px 0px" });
      loadIo.observe(stage);
      var demoIo = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) demo();
      }, { threshold: .5 });
      demoIo.observe(stage);
    } else {
      visible = true;
      load();
    }
  });

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
