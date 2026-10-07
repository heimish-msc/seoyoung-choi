/* =========================================================
   사이트 데이터 — 이 파일만 수정하면 연락처·영상·공연이 바뀝니다.
   다국어 값은 { ko, en, fr } 형태로 적어주세요.
   ========================================================= */

window.SITE = {
  // TODO: 실제 연락처로 교체
  email: "contact@example.com",
  TEL: "+82 10-0000-0000",
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

/* 공연 일정 — date: "YYYY-MM-DD" (지난 날짜는 자동으로 '지난 공연'으로 이동)
   ⚠️ 아래는 레이아웃 확인용 샘플입니다. 실제 일정으로 교체하세요. */
window.EVENTS = [
  {
    date: "2026-11-21", time: "19:30", link: "",
    title: { ko: "오르간 독주회", en: "Organ Recital", fr: "Récital d'orgue" },
    program: { ko: "프로그램 추후 공개", en: "Programme to be announced", fr: "Programme à venir" },
    venue: { ko: "공연장 추후 공개", en: "Venue TBA", fr: "Lieu à confirmer" },
    city: { ko: "서울", en: "Seoul", fr: "Séoul" }
  },
  {
    date: "2026-12-19", time: "20:00", link: "",
    title: { ko: "크리스마스 오르간 콘서트", en: "Christmas Organ Concert", fr: "Concert d'orgue de Noël" },
    program: { ko: "프로그램 추후 공개", en: "Programme to be announced", fr: "Programme à venir" },
    venue: { ko: "공연장 추후 공개", en: "Venue TBA", fr: "Lieu à confirmer" },
    city: { ko: "파리", en: "Paris", fr: "Paris" }
  },
  {
    date: "2027-03-06", time: "19:30", link: "",
    title: { ko: "현대 오르간 음악 — 국내 초연", en: "Contemporary Organ — Korean Premieres", fr: "Orgue contemporain — créations en Corée" },
    program: { ko: "프로그램 추후 공개", en: "Programme to be announced", fr: "Programme à venir" },
    venue: { ko: "공연장 추후 공개", en: "Venue TBA", fr: "Lieu à confirmer" },
    city: { ko: "서울", en: "Seoul", fr: "Séoul" }
  }
];

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
