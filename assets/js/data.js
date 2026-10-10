/* =========================================================
   사이트 데이터 — 이 파일만 수정하면 연락처·영상·공연이 바뀝니다.
   다국어 값은 { ko, en, fr } 형태로 적어주세요.
   ========================================================= */

window.SITE = {
  email: "3634syoung@gmail.com",
  TEL: "", // 비워 두면 전화번호 줄이 표시되지 않음
  instagram: "https://www.instagram.com/__celine_sy/",
  youtube: "https://www.youtube.com/@celine.1117"
};

/* 영상 — youtube: 유튜브 영상 ID (주소 watch?v= 뒤의 값)
   img: 썸네일 이미지 (비워두면 유튜브 썸네일 사용)
   cat: recital | contemporary | orchestra | improvisation
   overlay: true 이면 썸네일 위에 제목 표시
   클릭하면 유튜브 영상이 새 탭으로 열립니다. */
window.VIDEOS = [
  {
    youtube: "8mnZFB2o1ic", img: "", cat: "recital",
    title: { ko: "O. Messiaen", en: "O. Messiaen", fr: "O. Messiaen" },
    sub: { ko: "Transports de joie (L'Ascension)", en: "Transports de joie (L'Ascension)", fr: "Transports de joie (L'Ascension)" }
  },
  {
    youtube: "HrlV5Xj-ass", img: "", cat: "recital",
    title: { ko: "F. Liszt", en: "F. Liszt", fr: "F. Liszt" },
    sub: { ko: "B-A-C-H 주제에 의한 전주곡과 푸가", en: "Prelude and Fugue on B-A-C-H", fr: "Prélude et fugue sur B-A-C-H" }
  }
];

/* 사진 아카이브 (Photos 페이지) — 관리자 페이지 '사진 아카이브' 탭에서 추가·수정
   image: 사진 경로 / venue·city: 장소·도시 / date: 날짜(예: 2025.05) / caption: 설명
   ⚠️ 장소·도시·날짜·설명은 화면 확인용 예시입니다. 관리자 페이지에서 실제 정보로 바꿔 주세요. */
const SAMPLE_PLACE = {
  eustache: { venue: { ko: "생퇴스타슈 성당", en: "Église Saint-Eustache", fr: "Église Saint-Eustache" }, city: { ko: "파리", en: "Paris", fr: "Paris" } },
  moelln: { venue: { ko: "묄른 성 니콜라이 교회", en: "St. Nicolai-Kirche", fr: "St. Nicolai-Kirche" }, city: { ko: "묄른", en: "Mölln", fr: "Mölln" } },
  buxtehude: { venue: { ko: "북스테후데 성 베드로 교회", en: "Kirche St. Petri", fr: "Kirche St. Petri" }, city: { ko: "북스테후데", en: "Buxtehude", fr: "Buxtehude" } }
};
window.GALLERY = [
  { image: "assets/images/hero-2.jpg", place: "eustache", date: "2025.05",
    caption: { ko: "오르간 독주회", en: "Organ recital", fr: "Récital d’orgue" } },
  { image: "assets/images/recent-main.jpg", place: "moelln", date: "2024.09",
    caption: { ko: "리허설", en: "Rehearsal", fr: "Répétition" } },
  { image: "assets/images/venue-2.jpg", place: "eustache", date: "2025.05",
    caption: { ko: "", en: "", fr: "" } },
  { image: "assets/images/hero-3.jpg", place: "buxtehude", date: "2024.06",
    caption: { ko: "초청 연주", en: "Guest recital", fr: "Concert sur invitation" } },
  { image: "assets/images/venue-1.jpg", place: "moelln", date: "2024.09",
    caption: { ko: "", en: "", fr: "" } },
  { image: "assets/images/hero-1.jpg", place: "buxtehude", date: "2024.06",
    caption: { ko: "", en: "", fr: "" } }
].map(({ place, ...g }) => Object.assign(g, JSON.parse(JSON.stringify(SAMPLE_PLACE[place]))));

/* 공연 일정은 Supabase 데이터베이스에 있습니다.
   관리자 페이지(/admin)에서 입력하면 홈 '예정된 공연'과 공연 페이지에 바로 반영됩니다. */

/* 주요 연주 장소 (이력 기반) */
window.VENUES = [
  { ko: "파리 생퇴스타슈 성당", orig: "Église Saint-Eustache", city: { ko: "파리", en: "Paris", fr: "Paris" } },
  { ko: "베르사유 궁정음악당", orig: "Chapelle Royale du Château de Versailles", city: { ko: "베르사유", en: "Versailles", fr: "Versailles" } },
  { ko: "파리 생세브랭 성당", orig: "Église Saint-Séverin", city: { ko: "파리", en: "Paris", fr: "Paris" } },
  { ko: "로야몽 수도원", orig: "Abbaye de Royaumont", city: { ko: "아니에르쉬르우아즈", en: "Asnières-sur-Oise", fr: "Asnières-sur-Oise" } },
  { ko: "샹베리 대성당", orig: "Cathédrale Saint-François-de-Sales", city: { ko: "샹베리", en: "Chambéry", fr: "Chambéry" } },
  { ko: "파리 몽마르트르 생피에르 성당", orig: "Paroisse Saint-Pierre de Montmartre", city: { ko: "파리", en: "Paris", fr: "Paris" } },
  { ko: "살페트리에르 생루이 예배당", orig: "Chapelle Saint-Louis de la Salpêtrière", city: { ko: "파리", en: "Paris", fr: "Paris" } },
  { ko: "님 노트르담 에 생 카스토르 대성당", orig: "Cathédrale Notre-Dame-et-Saint-Castor", city: { ko: "님", en: "Nîmes", fr: "Nîmes" } },
  { ko: "묄른 성 니콜라이 교회", orig: "St. Nicolai-Kirche", city: { ko: "묄른", en: "Mölln", fr: "Mölln" } },
  { ko: "북스테후데 성 베드로 교회", orig: "Kirche St. Petri", city: { ko: "북스테후데", en: "Buxtehude", fr: "Buxtehude" } }
];

/* 사사 */
window.TEACHERS = {
  korea: [
    { ko: "김원", orig: "Kim Won" },
    { ko: "민동림", orig: "Min Dong-rim" },
    { ko: "박혜원", orig: "Park Hye-won" },
    { ko: "곽동순", orig: "Kwak Dong-soon" }
  ],
  france: [
    { ko: "에릭 르브룅", orig: "Eric Lebrun" },
    { ko: "올리비에 라트리", orig: "Olivier Latry" },
    { ko: "미셸 부바르", orig: "Michel Bouvard" },
    { ko: "장바티스트 로뱅", orig: "Jean-Baptiste Robin" }
  ],
  germany: [
    { ko: "피터르 판데이크", orig: "Pieter van Dijk" },
    { ko: "마티아스 노이만", orig: "Matthias Neumann" }
  ]
};
