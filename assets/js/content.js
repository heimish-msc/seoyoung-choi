/* =========================================================
   관리자 페이지에서 수정할 수 있는 콘텐츠
   - SECTIONS: 관리자 편집 화면이 이 정의대로 그려집니다
   - DEFAULTS: data.js / i18n.js 의 현재 내용 (저장된 값이 없을 때 사용)
   - apply(): Supabase site_content 에 저장된 값을 사이트에 덮어씁니다
   data.js, i18n.js 다음에 불러와야 합니다.
   ========================================================= */
(function () {
  "use strict";

  const LANGS = ["ko", "en", "fr"];
  const I = window.I18N;
  const clone = (o) => JSON.parse(JSON.stringify(o ?? null));
  const ml = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(l) ?? ""]));
  const pick = (v, l) => (v && (v[l] || v.en || v.ko)) || "";

  // 유튜브 주소(또는 ID)에서 영상 ID 추출
  function ytId(s) {
    s = String(s || "").trim();
    const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s) ? s : "";
  }

  /* ---------------------------------------------------- 사진 자리 */
  const PHOTO_KEYS = [
    { k: "hero1", label: "첫 화면 상단 — 왼쪽", file: "assets/images/hero-1.jpg" },
    { k: "hero2", label: "첫 화면 상단 — 가운데 (가로 사진)", file: "assets/images/hero-2.jpg" },
    { k: "hero3", label: "첫 화면 상단 — 오른쪽", file: "assets/images/hero-3.jpg" },
    { k: "aboutPortrait", label: "첫 화면 약력 옆 — 프로필 사진", file: "assets/images/about-portrait.jpg" }
  ];

  /* ---------------------------------------------------- 편집 화면 정의 */
  const eduItem = [
    { k: "school", label: "학교", ml: true },
    { k: "orig", label: "원어 이름 / 위치", ml: true },
    { k: "program", label: "과정", ml: true },
    { k: "note", label: "성적 · 비고", ml: true }
  ];
  const teacherItem = [{ k: "ko", label: "이름 (한국어)" }, { k: "orig", label: "이름 (영문)" }];

  const SECTIONS = [
    {
      key: "gallery", label: "사진 아카이브",
      help: "Photos 페이지의 연주 사진입니다. '여러 장 올리기'로 한 번에 추가한 뒤 장소·도시·날짜를 적어 주세요. 같은 장소 이름끼리 묶여 필터 버튼이 생깁니다.",
      fields: [{ k: "items", label: "사진", type: "list", bulk: true, item: [
        { k: "image", label: "사진", type: "image" },
        { k: "venue", label: "장소", ml: true },
        { k: "city", label: "도시", ml: true },
        { k: "date", label: "날짜 (예: 2025.05)" },
        { k: "caption", label: "설명 (선택)", ml: true }
      ] }]
    },
    {
      key: "videos", label: "영상",
      help: "유튜브 주소를 붙여넣으면 썸네일이 자동으로 표시됩니다. 위·아래 버튼으로 순서를 바꿀 수 있어요.",
      fields: [{ k: "items", label: "영상 목록", type: "list", item: [
        { k: "youtube", label: "유튜브 주소 또는 영상 ID" },
        { k: "title", label: "제목", ml: true },
        { k: "sub", label: "부제", ml: true }
      ] }]
    },
    {
      key: "home", label: "첫 화면 문구",
      fields: [
        { k: "role", label: "이름 아래 한 줄 소개 (푸터에도 표시)", ml: true }
      ]
    },
    {
      key: "bio", label: "소개 글",
      help: "첫 화면(About)의 약력입니다. 문단 사이는 빈 줄로 구분해 주세요.",
      fields: [{ k: "text", label: "약력", ml: true, area: true, rows: 16, stack: true }]
    },
    {
      key: "lists", label: "학력·경력",
      help: "첫 화면(About)의 목록들입니다. 언어 칸을 비워 두면 영어 → 한국어 순으로 대신 표시됩니다.",
      fields: [
        { k: "education", label: "학력", type: "list", item: eduItem },
        { k: "extra", label: "추가 수학", type: "list", item: eduItem },
        { k: "awards", label: "수상 & 경력", type: "list", item: [{ k: "text", label: "내용", ml: true }] },
        { k: "orchestras", label: "협연", type: "list", item: [{ k: "name", label: "오케스트라", ml: true }, { k: "orig", label: "원어 이름", ml: true }] },
        { k: "venues", label: "주요 연주 장소", type: "list", item: [{ k: "ko", label: "장소 (한국어)" }, { k: "orig", label: "장소 (원어)" }, { k: "city", label: "도시", ml: true }] },
        { k: "teachers_korea", label: "사사 — 한국", type: "list", item: teacherItem },
        { k: "teachers_france", label: "사사 — 프랑스", type: "list", item: teacherItem },
        { k: "teachers_germany", label: "사사 — 독일", type: "list", item: teacherItem }
      ]
    },
    {
      key: "contact", label: "연락처·SNS",
      help: "첫 화면 상단 연락처, Contact 페이지, 모든 페이지 하단의 SNS 아이콘에 반영됩니다. 전화번호를 비워 두면 표시되지 않습니다.",
      fields: [
        { k: "email", label: "이메일" },
        { k: "TEL", label: "전화번호" },
        { k: "instagram", label: "인스타그램 주소" },
        { k: "youtube", label: "유튜브 채널 주소" }
      ]
    },
    {
      key: "photos", label: "첫 화면 사진", type: "photos",
      help: "사진을 고르면 자동으로 크기를 줄여 업로드합니다. '저장'을 눌러야 사이트에 반영됩니다."
    }
  ];

  /* ---------------------------------------------------- 기본값 (현재 사이트 내용) */
  const zip = (get, make) => {
    const n = Math.max(...LANGS.map((l) => (get(l) || []).length));
    return Array.from({ length: n }, (_, i) => make((l) => (get(l) || [])[i]));
  };
  const eduZip = (key) => zip((l) => I[l].about[key], (at) => ({
    school: ml((l) => at(l)?.school), orig: ml((l) => at(l)?.orig),
    program: ml((l) => at(l)?.program), note: ml((l) => at(l)?.note)
  }));

  const DEFAULTS = {
    gallery: { items: clone(GALLERY) },
    videos: { items: VIDEOS.map((v) => ({ youtube: v.youtube, title: clone(v.title), sub: clone(v.sub) })) },
    home: {
      role: ml((l) => I[l].home.role)
    },
    bio: { text: ml((l) => (I[l].about.bio || []).join("\n\n")) },
    lists: {
      education: eduZip("education"),
      extra: eduZip("extra"),
      awards: zip((l) => I[l].about.awards, (at) => ({ text: ml(at) })),
      orchestras: zip((l) => I[l].about.orchestras, (at) => ({ name: ml((l) => at(l)?.name), orig: ml((l) => at(l)?.orig) })),
      venues: clone(VENUES),
      teachers_korea: clone(TEACHERS.korea),
      teachers_france: clone(TEACHERS.france),
      teachers_germany: clone(TEACHERS.germany)
    },
    contact: { email: SITE.email, TEL: SITE.TEL, instagram: SITE.instagram, youtube: SITE.youtube },
    photos: Object.fromEntries(PHOTO_KEYS.map((p) => [p.k, { url: p.file }]))
  };
  Object.freeze(DEFAULTS);

  // 사이트에서 쓰는 사진 정보 (저장된 값이 있으면 apply 에서 덮어씀)
  window.PHOTOS = clone(DEFAULTS.photos);

  /* ---------------------------------------------------- 저장된 값 적용 */
  // 언어별 문구: 빈 언어는 영어 → 한국어 순으로 대신 채움. 세 언어 모두 비어 있으면 기존 문구 유지
  const setText = (obj, key, v, l) => { const val = pick(v, l); if (val) obj[key] = val; };

  function apply(data) {
    const d = data || {};

    if (d.home) LANGS.forEach((l) => {
      setText(I[l].home, "role", d.home.role, l);
    });

    if (d.bio && d.bio.text) LANGS.forEach((l) => {
      const paras = pick(d.bio.text, l).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      if (paras.length) I[l].about.bio = paras;
    });

    if (d.lists) {
      const L = d.lists;
      LANGS.forEach((l) => {
        const edu = (items) => items.map((it) => ({ school: pick(it.school, l), orig: pick(it.orig, l), program: pick(it.program, l), note: pick(it.note, l) }));
        if (L.education) I[l].about.education = edu(L.education);
        if (L.extra) I[l].about.extra = edu(L.extra);
        if (L.awards) I[l].about.awards = L.awards.map((it) => pick(it.text, l)).filter(Boolean);
        if (L.orchestras) I[l].about.orchestras = L.orchestras.map((it) => ({ name: pick(it.name, l), orig: pick(it.orig, l) }));
      });
      if (L.venues) VENUES.splice(0, VENUES.length, ...L.venues.map((v) => ({ ko: v.ko || v.orig || "", orig: v.orig || v.ko || "", city: v.city || {} })));
      ["korea", "france", "germany"].forEach((g) => {
        const list = L["teachers_" + g];
        if (list) TEACHERS[g] = list.map((p) => ({ ko: p.ko || p.orig || "", orig: p.orig || p.ko || "" }));
      });
    }

    if (d.videos && Array.isArray(d.videos.items)) {
      window.VIDEOS = d.videos.items
        .map((v) => ({ youtube: ytId(v.youtube), img: "", cat: "recital", title: v.title || {}, sub: v.sub || {} }))
        .filter((v) => v.youtube);
    }

    if (d.gallery && Array.isArray(d.gallery.items)) {
      window.GALLERY = d.gallery.items.filter((g) => g && g.image);
    }

    if (d.contact) Object.keys(d.contact).forEach((k) => { if (d.contact[k]) SITE[k] = d.contact[k]; });

    if (d.photos) Object.keys(d.photos).forEach((k) => {
      const p = d.photos[k];
      if (!p || !window.PHOTOS[k]) return;
      if (p.url) window.PHOTOS[k].url = p.url;
      if (p.caption) window.PHOTOS[k].caption = p.caption;
    });
  }

  window.CONTENT = { LANGS, SECTIONS, PHOTO_KEYS, DEFAULTS, apply, ytId, clone };
})();
