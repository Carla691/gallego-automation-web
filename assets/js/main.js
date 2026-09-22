/* =========================================================
   Gallego Automation — comportamiento del sitio
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. ENLACE DE AGENDA
     Para cambiarlo, sustituye la URL de abajo por la de tu evento.
     Si se deja vacía, los botones bajan a la sección "Agenda" y allí
     queda el texto con el correo y el WhatsApp.
     --------------------------------------------------------- */
  var BOOKING_URL = 'https://calendly.com/carla-gallegoautomation/30min';

  if (BOOKING_URL) {
    document.querySelectorAll('[data-cta]').forEach(function (a) {
      a.href = BOOKING_URL;
      a.target = '_blank';
      a.rel = 'noopener';
    });

    var booking = document.getElementById('booking');
    if (booking) {
      var frame = document.createElement('iframe');
      frame.src = BOOKING_URL;
      frame.title = 'Agenda una llamada de 30 minutos con Gallego Automation';
      frame.loading = 'lazy';

      var aviso = document.getElementById('booking-nojs');
      if (aviso) aviso.remove();
      booking.appendChild(frame);
    }
  }

  /* ---------------------------------------------------------
     2. Menú móvil
     --------------------------------------------------------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    };

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) closeNav();
    });
  }

  /* ---------------------------------------------------------
     3. Cabecera: sombra al hacer scroll y CTA coral fuera del hero.
     El CTA de la cabecera solo aparece cuando el CTA del hero ya no
     está a la vista, para no tener dos elementos coral compitiendo.
     --------------------------------------------------------- */
  var header = document.getElementById('site-header');
  var hero = document.getElementById('inicio');

  var onScroll = function () {
    if (!header) return;
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 8);
    if (hero) {
      header.classList.toggle('is-past-hero', y > hero.offsetHeight - 120);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     4. Enlace activo en la navegación
     --------------------------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------
     5. Aparición progresiva de bloques
     --------------------------------------------------------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll(
    '.section-head, .card, .step, .metric, .beliefs li, .faq details, .booking, .metrics-note, .trustbar-inner'
  );

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
        el.classList.add('is-visible');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    targets.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------
     6. Conversación del hero: se reproduce sola, en bucle.
     Los mensajes ya ocupan su sitio en el layout, así que la tarjeta
     nunca cambia de alto. Solo se anima mientras está a la vista.
     --------------------------------------------------------- */
  var mock = document.getElementById('mock');

  if (mock && !reduce) {
    var pasos = Array.prototype.slice.call(mock.querySelectorAll('[data-step]'));

    // pausa: espera antes del mensaje · escribiendo: cuánto dura el indicador
    var GUION = [
      { pausa: 500, escribiendo: 0 },
      { pausa: 250, escribiendo: 1200 },
      { pausa: 950, escribiendo: 0 },
      { pausa: 250, escribiendo: 1300 },
      { pausa: 550, escribiendo: 0 }
    ];
    var PAUSA_FINAL = 3800;

    var relojes = [];
    var enMarcha = false;

    var limpiar = function () {
      relojes.forEach(clearTimeout);
      relojes = [];
    };
    var esperar = function (ms, fn) {
      relojes.push(setTimeout(fn, ms));
    };

    var reproducir = function (i) {
      if (i >= pasos.length) {
        esperar(PAUSA_FINAL, reiniciar);
        return;
      }
      var paso = GUION[i] || { pausa: 600, escribiendo: 0 };
      esperar(paso.pausa, function () {
        if (!paso.escribiendo) {
          pasos[i].classList.add('is-shown');
          reproducir(i + 1);
          return;
        }
        mock.classList.add('is-typing');
        esperar(paso.escribiendo, function () {
          mock.classList.remove('is-typing');
          pasos[i].classList.add('is-shown');
          reproducir(i + 1);
        });
      });
    };

    function reiniciar() {
      mock.classList.remove('is-typing');
      pasos.forEach(function (el) { el.classList.remove('is-shown'); });
      esperar(650, function () { reproducir(0); });
    }

    var arrancar = function () {
      if (enMarcha) return;
      enMarcha = true;
      reproducir(0);
    };
    var parar = function () {
      if (!enMarcha) return;
      enMarcha = false;
      limpiar();
      mock.classList.remove('is-typing');
      // Se deja la conversación a cero para que al volver empiece de nuevo
      // y no se reanude a medias.
      pasos.forEach(function (el) { el.classList.remove('is-shown'); });
    };

    // Sin JS la conversación se ve entera y quieta: la clase que la oculta
    // para animarla solo se aplica aquí.
    mock.classList.add('is-animated');

    var aLaVista = function () {
      var r = mock.getBoundingClientRect();
      return r.top < (window.innerHeight || 0) - 60 && r.bottom > 60;
    };

    var revisar = function () {
      if (document.hidden || !aLaVista()) parar();
      else arrancar();
    };

    window.addEventListener('scroll', revisar, { passive: true });
    window.addEventListener('resize', revisar);
    document.addEventListener('visibilitychange', revisar);
    revisar();
  }

  /* ---------------------------------------------------------
     7. Un único acordeón abierto a la vez
     --------------------------------------------------------- */
  var faqs = document.querySelectorAll('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });

  /* ---------------------------------------------------------
     8. Año en el pie
     --------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
