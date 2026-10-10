(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const sb = window.supabase.createClient(SUPABASE.url, SUPABASE.anonKey);
  const FIELDS = [
    "event_date", "start_time", "link",
    "title_ko", "title_en", "title_fr",
    "program_ko", "program_en", "program_fr",
    "venue_ko", "venue_en", "venue_fr",
    "city_ko", "city_en", "city_fr"
  ];
  const LANG_PH = { ko: "한국어", en: "English", fr: "Français" };

  let current = "";
  let recovering = false; // 비밀번호 재설정 링크로 들어온 상태
  let rows = [];

  /* ---------------------------------------------------- view / message */
  function show(view) {
    current = view;
    $$(".admin-view").forEach((el) => (el.hidden = el.id !== "view-" + view));
    $("#logout").hidden = !(view === "list" || view === "form");
    window.scrollTo(0, 0);
  }
  function msg(text, isError) {
    const el = $("#msg");
    el.hidden = !text;
    el.textContent = text || "";
    el.classList.toggle("is-error", !!isError);
  }
  const errText = (e) => {
    const m = (e && e.message) || "";
    if (/Invalid login/i.test(m)) return "이메일 또는 비밀번호가 올바르지 않습니다.";
    if (/row-level security|permission/i.test(m)) return "이 계정에는 수정 권한이 없습니다. 관리자 이메일로 등록되어 있는지 확인해 주세요.";
    if (/Password should be/i.test(m)) return "비밀번호가 너무 짧거나 단순합니다.";
    return "오류가 발생했습니다. 잠시 후 다시 시도해 주세요." + (m ? ` (${m})` : "");
  };

  /* ---------------------------------------------------- auth */
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") { recovering = true; msg(""); show("reset"); return; }
    if (recovering) return;
    if (session) {
      if (current !== "list" && current !== "form") loadList();
    } else {
      show("login");
    }
  });

  $("#form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    msg("");
    const { error } = await sb.auth.signInWithPassword({ email: f.get("email"), password: f.get("password") });
    if (error) msg(errText(error), true);
  });

  $("#form-forgot").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    if (error) return msg(errText(error), true);
    msg("재설정 메일을 보냈습니다. 메일함을 확인해 주세요.");
    show("login");
  });

  $("#form-reset").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (f.get("password") !== f.get("password2")) return msg("두 비밀번호가 서로 다릅니다.", true);
    const { error } = await sb.auth.updateUser({ password: f.get("password") });
    if (error) return msg(errText(error), true);
    recovering = false;
    e.target.reset();
    history.replaceState(null, "", location.pathname); // 주소의 재설정 토큰 제거
    msg("비밀번호를 변경했습니다.");
    loadList();
  });

  $("#logout").addEventListener("click", async () => {
    await sb.auth.signOut();
    msg("");
  });

  $$("[data-go]").forEach((b) => b.addEventListener("click", () => { msg(""); show(b.dataset.go); }));

  /* ---------------------------------------------------- list */
  async function loadList() {
    show("list");
    const { data, error } = await sb.from("events").select("*").order("event_date", { ascending: false });
    if (error) return msg(errText(error), true);
    rows = data || [];
    renderList();
  }

  function renderList() {
    const today = new Date().toISOString().slice(0, 10);
    $("#list").innerHTML = rows.length
      ? rows.map((r) => `
        <li class="${r.event_date < today ? "is-past" : ""}">
          <div class="a-date">${esc(r.event_date)}<small>${r.event_date < today ? "지난 공연" : "예정"}${r.start_time ? " · " + esc(r.start_time) : ""}</small></div>
          <div>
            <div class="a-title">${esc(r.title_ko)}</div>
            <div class="a-sub">${esc([r.venue_ko, r.city_ko].filter(Boolean).join(" · "))}</div>
          </div>
          <div class="a-btns">
            <button type="button" data-edit="${esc(r.id)}">수정</button>
            <button type="button" data-del="${esc(r.id)}">삭제</button>
          </div>
        </li>`).join("")
      : '<li><span class="a-empty">등록된 공연이 없습니다. \'+ 공연 추가\'를 눌러 입력해 주세요.</span></li>';
  }

  $("#list").addEventListener("click", async (e) => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-del]");
    if (edit) openForm(rows.find((r) => r.id === edit.dataset.edit));
    if (del) {
      const r = rows.find((x) => x.id === del.dataset.del);
      if (!confirm(`'${r.title_ko}' (${r.event_date}) 공연을 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)) return;
      const { error } = await sb.from("events").delete().eq("id", r.id);
      if (error) return msg(errText(error), true);
      msg("삭제했습니다.");
      loadList();
    }
  });

  /* ---------------------------------------------------- form */
  const form = $("#form-event");
  $$("input[name$='_ko'], input[name$='_en'], input[name$='_fr']", form).forEach((i) => {
    i.placeholder = LANG_PH[i.name.slice(-2)];
  });

  function openForm(row) {
    msg("");
    form.reset();
    form.elements.id.value = row ? row.id : "";
    FIELDS.forEach((k) => { form.elements[k].value = (row && row[k]) || ""; });
    $("#form-title").textContent = row ? "공연 수정" : "공연 추가";
    show("form");
    form.elements.event_date.focus();
  }

  $("#btn-new").addEventListener("click", () => openForm(null));
  $("#btn-cancel").addEventListener("click", () => { msg(""); show("list"); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = { updated_at: new Date().toISOString() };
    FIELDS.forEach((k) => { payload[k] = form.elements[k].value.trim() || null; });
    const id = form.elements.id.value;
    const btn = $("button[type=submit]", form);
    btn.disabled = true;
    const { error } = id
      ? await sb.from("events").update(payload).eq("id", id)
      : await sb.from("events").insert(payload);
    btn.disabled = false;
    if (error) return msg(errText(error), true);
    msg("저장했습니다. 사이트에 바로 반영됩니다.");
    loadList();
  });
})();
