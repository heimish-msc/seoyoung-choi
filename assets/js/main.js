(function () {
  "use strict";

  const LANGS = ["ko", "en", "fr"];
  const LOCALES = { ko: "ko-KR", en: "en-GB", fr: "fr-FR" };
  const PAGES = ["home", "about", "videos", "events", "contact"];
  const HREF = { home: "index.html", about: "about.html", videos: "videos.html", events: "events.html", contact: "contact.html" };
  const page = document.body.dataset.page;

  /* ---------------------------------------------------- helpers */
  const store = {
    get() { try { return localStorage.getItem("lang"); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem("lang", v); } catch (e) { /* ignore */ } }
  };
  function detectLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) return q;
    const s = store.get();
    if (LANGS.includes(s)) return s;
    return "en"; // 처음 방문하면 영어로 시작 (이후엔 고른 언어를 기억)
  }
  let lang = detectLang();

  const dig = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const t = (key) => { const v = dig(I18N[lang], key); return v == null ? (dig(I18N.en, key) ?? key) : v; };
  // 비어 있는 언어는 영어 → 한국어 순으로 대신 표시
  const L = (o) => (o == null ? "" : typeof o === "string" ? o : (o[lang] || o.en || o.ko || ""));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  // 원어 이름: 한국어일 땐 한글 + 원어, 그 외엔 원어
  const nameOf = (o) => (lang === "ko" ? o.ko : o.orig);

  const ICON = {
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.25" fill="currentColor"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="currentColor"/><path d="M10 8.8v6.4l5.4-3.2z" fill="var(--bg)"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M6.5 8.5h11v7h-11z M6.5 8.5l5.5 4 5.5-4" fill="none" stroke="var(--bg)" stroke-width="1.5" stroke-linejoin="round"/></svg>'
  };
  const socialsHTML = () =>
    `<a href="${esc(SITE.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.instagram}</a>` +
    `<a href="${esc(SITE.youtube)}" target="_blank" rel="noopener" aria-label="YouTube">${ICON.youtube}</a>` +
    `<a href="mailto:${esc(SITE.email)}" aria-label="Email">${ICON.mail}</a>`;

  const mediaStyle = (...urls) => {
    const list = urls.filter(Boolean).map((u) => `url('${u}')`).join(", ");
    return list ? `--img:${list}` : "";
  };

  /* ---------------------------------------------------- header / footer */
  function renderChrome() {
    const header = $("#site-header");
    header.innerHTML = `
      <a class="skip" href="#main" data-i18n="common.skip"></a>
      <div class="wrap header__inner">
        <a class="brand" href="index.html">
          <b data-i18n="common.nameLatin"></b>
        </a>
        <nav class="nav" id="nav" aria-label="Main">
          ${PAGES.map((p) => `<a href="${HREF[p]}" data-i18n="nav.${p}"${p === page ? ' aria-current="page"' : ""}></a>`).join("")}
          <a class="nav__admin" href="admin/" aria-label="Admin" title="Admin">${ICON.gear}</a>
        </nav>
        <div class="lang" role="group" aria-label="Language">
          ${LANGS.map((l) => `<button type="button" data-lang="${l}">${l.toUpperCase()}</button>`).join("")}
        </div>
        <button class="burger" type="button" aria-controls="nav" aria-expanded="false"><span></span><span></span><span class="sr" data-i18n="common.menu"></span></button>
      </div>`;

    const footer = $("#site-footer");
    footer.innerHTML = `
      <div class="wrap footer__inner">
        <div>
          <div class="footer__name" data-i18n="common.nameLatin"></div>
          <div class="label" data-i18n="home.role"></div>
        </div>
        <nav class="footer__nav">
          ${PAGES.map((p) => `<a href="${HREF[p]}" data-i18n="nav.${p}"></a>`).join("")}
        </nav>
        <div class="footer__end">
          <div class="socials">${socialsHTML()}</div>
          <div class="label">© ${new Date().getFullYear()} Seoyoung Choi. <span data-i18n="common.rights"></span></div>
        </div>
      </div>`;

    $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

    const burger = $(".burger"), nav = $("#nav");
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
  }

  /* ---------------------------------------------------- shared bits */
  function fillSite() {
    $$("[data-site]").forEach((el) => {
      const key = el.dataset.site;
      const val = SITE[key] || "";
      el.textContent = val;
      if (el.tagName === "A") {
        el.href = key === "email" ? `mailto:${val}` : key === "TEL" ? `tel:${val.replace(/[^\d+]/g, "")}` : val;
      }
    });
    $$("[data-socials]").forEach((el) => (el.innerHTML = socialsHTML()));
    $$("[data-venue]").forEach((el) => {
      const v = VENUES[+el.dataset.venue];
      if (v) el.textContent = `${nameOf(v)} — ${L(v.city)}`;
    });
  }

  function videoItem(v, i, cls = "") {
    const thumb = mediaStyle(v.img, v.youtube && `https://i.ytimg.com/vi/${v.youtube}/maxresdefault.jpg`);
    const tag = v.youtube ? "a" : "div";
    const link = v.youtube ? `href="https://www.youtube.com/watch?v=${encodeURIComponent(v.youtube)}" target="_blank" rel="noopener"` : "";
    return `
      <${tag} class="vitem ${cls}" ${link} data-cat="${esc(v.cat)}">
        <span class="media" style="${thumb}">
          ${v.overlay ? `<span class="media__overlay">${esc(L(v.title))}</span>` : ""}
          ${v.youtube ? '<span class="play" aria-hidden="true"></span>' : `<span class="soon">${esc(t("common.soon"))}</span>`}
        </span>
        <span class="vitem__title">${esc(L(v.title))}</span>
        <span class="vitem__sub">${esc(L(v.sub))}</span>
      </${tag}>`;
  }


  function splitEvents() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const parse = (e) => new Date(e.date + "T00:00:00");
    const sorted = [...(window.EVENTS || [])].sort((a, b) => parse(a) - parse(b));
    return {
      upcoming: sorted.filter((e) => parse(e) >= today),
      past: sorted.filter((e) => parse(e) < today).reverse()
    };
  }

  // 큰 날짜 표기 — 한국어: 월.일 (11.21) / 영어: Nov 21 / 프랑스어: 21 Nov.
  function formatDay(d) {
    if (lang === "ko") return `${d.getMonth() + 1}.${d.getDate()}`;
    if (lang === "en") return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
    const fr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(d);
    return fr.replace(/\p{L}/u, (c) => c.toUpperCase()); // 21 nov. → 21 Nov.
  }

  function eventRow(e) {
    const d = new Date(e.date + "T00:00:00");
    const loc = LOCALES[lang];
    const meta = `${d.getFullYear()} · ${new Intl.DateTimeFormat(loc, { weekday: "short" }).format(d)}${e.time ? " · " + e.time : ""}`;
    return `
      <li class="event">
        <div class="event__date"><b>${esc(formatDay(d))}</b><small>${esc(meta)}</small></div>
        <div>
          <div class="event__title">${esc(L(e.title))}</div>
          <div class="event__prog">${esc(L(e.program))}</div>
        </div>
        <div class="event__venue">${esc(L(e.venue))}<br>${esc(L(e.city))}</div>
        <div class="event__action">${e.link ? `<a class="link-arrow" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(t("events.tickets"))} →</a>` : ""}</div>
      </li>`;
  }

  function eventList(el, list) {
    if (window.EVENTS === null) { el.innerHTML = ""; return; } // 불러오는 중
    el.innerHTML = list.length
      ? list.map(eventRow).join("")
      : `<li class="event event--empty">${esc(t("events.none"))}</li>`;
  }

  function venueGrid(el) {
    el.innerHTML = VENUES.map((v, i) => `
      <li class="venue">
        <span class="venue__no">${String(i + 1).padStart(2, "0")}</span>
        <span>
          <span class="venue__name">${esc(nameOf(v))}</span>
          ${lang === "ko" ? `<span class="venue__orig">${esc(v.orig)}</span>` : ""}
          <span class="venue__city">${esc(L(v.city))}</span>
        </span>
      </li>`).join("");
  }

  /* ---------------------------------------------------- page renderers */
  const render = {
    home() {
      // 8개 이상이면 시안 배치(작게·작게·넓게…), 적으면 개수에 맞춰 크게
      const list = VIDEOS.slice(0, 8);
      const spans = list.length >= 8
        ? ["", "", "vitem--wide", "", "", "vitem--wide", "vitem--wide", "vitem--wide"]
        : list.map(() => (list.length <= 2 ? "vitem--half" : "vitem--wide"));
      $("#home-videos").innerHTML = list.map((v, i) => videoItem(v, i, spans[i])).join("");
      eventList($("#home-upcoming"), splitEvents().upcoming.slice(0, 3));
    },

    about() {
      $("#bio").innerHTML = t("about.bio").map((p) => `<p>${esc(p)}</p>`).join("");
      const rows = (list) => list.map((r) => `
        <li class="row">
          <div class="row__main"><b>${esc(r.school)}</b>${r.orig ? `<small>${esc(r.orig)}</small>` : ""}</div>
          <div class="row__prog">${esc(r.program || "—")}</div>
          <div class="row__note">${r.note ? esc(r.note) : ""}</div>
        </li>`).join("");
      $("#education").innerHTML = rows(t("about.education"));
      $("#extra").innerHTML = rows(t("about.extra"));
      $("#awards").innerHTML = t("about.awards").map((a) => `<li>${esc(a)}</li>`).join("");
      $("#orchestras").innerHTML = t("about.orchestras")
        .map((o) => `<li>${esc(o.name)}${o.orig ? `<small>${esc(o.orig)}</small>` : ""}</li>`).join("");
      venueGrid($("#venues"));
      $("#teachers").innerHTML = ["korea", "france", "germany"].map((k) => `
        <div class="teachers__col">
          <h3 class="label">${esc(t("about." + k))}</h3>
          <ul>${TEACHERS[k].map((p) => `<li>${esc(nameOf(p))}${lang === "ko" && k !== "korea" ? `<small>${esc(p.orig)}</small>` : ""}</li>`).join("")}</ul>
        </div>`).join("");
    },

    videos() {
      const cats = ["all", ...new Set(VIDEOS.map((v) => v.cat))];
      const bar = $("#vfilters");
      bar.hidden = cats.length <= 2; // 카테고리가 하나뿐이면 필터 숨김
      const current = bar.dataset.current || "all";
      bar.innerHTML = cats.map((c) =>
        `<button type="button" data-filter="${c}" aria-pressed="${c === current}">${esc(t("videos." + c))}</button>`).join("");
      const grid = $("#video-list");
      grid.classList.toggle("vlist--two", VIDEOS.length <= 2);
      grid.innerHTML = VIDEOS.map((v, i) => videoItem(v, i)).join("");
      const apply = (c) => {
        bar.dataset.current = c;
        $$("button", bar).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === c)));
        $$(".vitem", grid).forEach((it) => (it.hidden = c !== "all" && it.dataset.cat !== c));
      };
      $$("button", bar).forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter)));
      apply(current);
    },

    events() {
      if (!$("#upcoming")) return; // 내용 준비 중인 페이지
      const { upcoming, past } = splitEvents();
      eventList($("#upcoming"), upcoming);
      $("#past-wrap").hidden = past.length === 0;
      if (past.length) eventList($("#past"), past);
      if ($("#venues")) venueGrid($("#venues"));
    },

    contact() {
      const form = $("#contact-form");
      if (!form || form.dataset.bound) return; // 내용 준비 중이면 form 없음
      form.dataset.bound = "1";
      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const f = new FormData(form);
        const subject = f.get("subject") || "Contact";
        const body = `${f.get("message") || ""}\n\n— ${f.get("name") || ""} <${f.get("email") || ""}>`;
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    }
  };

  /* ---------------------------------------------------- language */
  function setLang(next) {
    if (!LANGS.includes(next)) return;
    lang = next;
    store.set(lang);
    document.documentElement.lang = lang;

    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
      });
    });
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    if (page) document.title = t("meta." + page);

    fillSite();
    if (render[page]) render[page]();
    absolutizeMedia();
  }

  // CSS 변수 안의 url()은 style.css 위치 기준으로 해석되므로, 페이지 기준 절대 경로로 바꿔준다
  function absolutizeMedia() {
    $$('[style*="--img"]').forEach((el) => {
      const v = el.style.getPropertyValue("--img");
      if (!v) return;
      el.style.setProperty("--img", v.replace(/url\((['"]?)([^'")]+)\1\)/g,
        (m, q, u) => (/^[a-z]+:/i.test(u) ? m : `url("${new URL(u, location.href).href}")`)));
    });
  }

  /* ---------------------------------------------------- reveal */
  function initReveal() {
    const items = $$(".card");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    // 첫 화면에 보이는 카드는 애니메이션 없이 바로 표시
    items
      .filter((el) => el.getBoundingClientRect().top > window.innerHeight)
      .forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }

  /* ---------------------------------------------------- events data */
  // 공연 일정은 관리자 페이지(/admin)에서 입력하는 Supabase events 테이블에서 불러온다
  window.EVENTS = null; // null = 아직 불러오는 중
  const toEvent = (r) => ({
    date: r.event_date,
    time: r.start_time || "",
    link: r.link || "",
    title: { ko: r.title_ko, en: r.title_en, fr: r.title_fr },
    program: { ko: r.program_ko, en: r.program_en, fr: r.program_fr },
    venue: { ko: r.venue_ko, en: r.venue_en, fr: r.venue_fr },
    city: { ko: r.city_ko, en: r.city_en, fr: r.city_fr }
  });
  function loadEvents() {
    if (page !== "home" && page !== "events") return;
    const done = (list) => { window.EVENTS = list; if (render[page]) render[page](); };
    if (!window.SUPABASE) return done([]);
    fetch(`${SUPABASE.url}/rest/v1/events?select=*&order=event_date.asc`, {
      headers: { apikey: SUPABASE.anonKey, Authorization: `Bearer ${SUPABASE.anonKey}` }
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((rows) => done(rows.map(toEvent)))
      .catch(() => done([])); // 불러오기 실패 시 '곧 공개' 문구 표시
  }

  renderChrome();
  setLang(lang);
  loadEvents();
  initReveal();
  document.documentElement.classList.remove("js-loading");
})();
