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
    const inside = ["list", "form", "content", "messages"].includes(view); // 로그인 후 화면
    $("#logout").hidden = !inside;
    $("#tabs").hidden = !inside;
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
    if (/site_content/.test(m) && /schema cache|does not exist/i.test(m)) return "콘텐츠 저장용 테이블이 아직 없습니다. Supabase 에서 supabase/schema-content.sql 을 실행해 주세요.";
    if (/Bucket not found/i.test(m)) return "사진 저장소가 아직 없습니다. Supabase 에서 supabase/schema-content.sql 을 실행해 주세요.";
    if (/row-level security|permission|Unauthorized/i.test(m)) return "이 계정에는 수정 권한이 없습니다. 관리자 이메일로 등록되어 있는지 확인해 주세요.";
    if (/Password should be/i.test(m)) return "비밀번호가 너무 짧거나 단순합니다.";
    if (/different from the old password/i.test(m)) return "이전과 다른 새 비밀번호를 입력해 주세요.";
    if (/Auth session missing|session.*expired/i.test(m)) return "인증 시간이 지났습니다. 재설정 메일을 다시 받아 링크를 눌러 주세요.";
    if (/rate limit/i.test(m)) return "메일을 너무 자주 요청했습니다. 잠시(약 1시간) 후 다시 시도해 주세요.";
    if (/not authorized|Email address .* cannot be used/i.test(m)) return "이 이메일로는 메일을 보낼 수 없습니다. Supabase 메일 발송 설정(SMTP)을 확인해 주세요.";
    return "오류가 발생했습니다. 잠시 후 다시 시도해 주세요." + (m ? ` (${m})` : "");
  };

  /* ---------------------------------------------------- 메일 링크 오류 */
  // 재설정 메일 링크가 만료됐거나 이미 사용된 경우 Supabase 가 주소 뒤에 오류를 붙여 돌려보냄
  (function showLinkError() {
    const q = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
    const code = q.get("error_code") || q.get("error");
    if (!code) return;
    const text = /otp_expired|expired|invalid/i.test(code + " " + (q.get("error_description") || ""))
      ? "메일 링크가 만료되었거나 이미 사용되었습니다. '비밀번호를 잊으셨나요?'에서 재설정 메일을 다시 받아 가장 최근 메일의 링크를 눌러 주세요."
      : `메일 링크로 로그인하지 못했습니다. (${q.get("error_description") || code})`;
    history.replaceState(null, "", location.pathname);
    setTimeout(() => msg(text, true), 0);
  })();

  /* ---------------------------------------------------- auth */
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") { recovering = true; msg(""); show("reset"); return; }
    if (recovering) return;
    if (session) {
      if (!["list", "form", "content", "messages"].includes(current)) openTab("events");
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
    // 메일 링크를 누르면 돌아올 관리자 페이지 주소 (…/admin/ 형태로 고정)
    const redirectTo = location.origin + location.pathname.replace(/index\.html$/, "");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
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
    openTab("events");
    msg("비밀번호를 변경했습니다.");
  });

  $("#logout").addEventListener("click", async () => {
    await sb.auth.signOut();
    msg("");
  });

  $$("[data-go]").forEach((b) => b.addEventListener("click", () => { msg(""); show(b.dataset.go); }));

  /* ---------------------------------------------------- list */
  /* ---------------------------------------------------- tabs */
  const editor = window.createContentEditor(sb, { msg, errText });
  const TABS = [{ key: "events", label: "공연 일정" }, { key: "messages", label: "문의" }, ...editor.sections.map((s) => ({ key: s.key, label: s.label }))];
  $("#tabs").innerHTML = TABS.map((t) => `<button type="button" data-tab="${t.key}">${esc(t.label)}</button>`).join("");
  let tab = "events";
  function openTab(key) {
    tab = key;
    msg("");
    $$("#tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === key)));
    if (key === "events") return loadList();
    if (key === "messages") return loadMessages();
    show("content");
    editor.open(key);
  }
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) openTab(b.dataset.tab);
  });

  /* ---------------------------------------------------- 문의 */
  async function loadMessages() {
    show("messages");
    const { data, error } = await sb.from("messages").select("*").order("created_at", { ascending: false });
    if (error) {
      if (/messages/.test(error.message) && /schema cache|does not exist/i.test(error.message)) {
        return msg("문의 저장용 테이블이 아직 없습니다. Supabase 에서 supabase/schema-messages.sql 을 실행해 주세요.", true);
      }
      return msg(errText(error), true);
    }
    const fmt = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" });
    $("#messages").innerHTML = data.length
      ? data.map((m) => {
          const reply = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent("Re: " + (m.subject || "Seoyoung Choi"))}`;
          return `
          <li>
            <div class="m-head">
              <div><b>${esc(m.name)}</b> <a href="mailto:${esc(m.email)}">${esc(m.email)}</a></div>
              <small>${esc(fmt.format(new Date(m.created_at)))}${m.lang ? " · " + esc(m.lang.toUpperCase()) : ""}</small>
            </div>
            ${m.subject ? `<div class="m-subject">${esc(m.subject)}</div>` : ""}
            <p class="m-body">${esc(m.message)}</p>
            <div class="m-btns">
              <a class="btn" href="${esc(reply)}">답장하기 →</a>
              <button type="button" class="admin-textbtn" data-del-msg="${esc(m.id)}">삭제</button>
            </div>
          </li>`;
        }).join("")
      : '<li class="a-empty">아직 들어온 문의가 없습니다.</li>';
  }

  $("#messages").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-del-msg]");
    if (!b || !confirm("이 문의를 삭제할까요? 삭제하면 되돌릴 수 없습니다.")) return;
    const { error } = await sb.from("messages").delete().eq("id", b.dataset.delMsg);
    if (error) return msg(errText(error), true);
    msg("삭제했습니다.");
    loadMessages();
  });

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
