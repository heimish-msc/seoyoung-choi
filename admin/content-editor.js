/* =========================================================
   콘텐츠 편집기 — assets/js/content.js 의 SECTIONS 정의대로 입력 폼을 그리고
   Supabase site_content 테이블에 섹션 단위로 저장합니다.
   ========================================================= */
window.createContentEditor = function (sb, ui) {
  "use strict";

  const { LANGS, SECTIONS, PHOTO_KEYS, DEFAULTS, clone, ytId } = window.CONTENT;
  const LANG_LABEL = { ko: "한국어", en: "English", fr: "Français" };
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const BUCKET = "site-images";

  const root = $("#content-editor");
  let section = null;
  let state = null;
  let defs = {}; // path → 필드 정의

  /* ---------------------------------------------------- 값 읽기·쓰기 (경로: "items.0.title.ko") */
  const parts = (path) => path.split(".").map((p) => (/^\d+$/.test(p) ? +p : p));
  function getAt(obj, path) { return parts(path).reduce((o, k) => (o == null ? undefined : o[k]), obj); }
  function setAt(obj, path, val) {
    const ks = parts(path);
    let o = obj;
    ks.slice(0, -1).forEach((k, i) => {
      if (o[k] == null) o[k] = typeof ks[i + 1] === "number" ? [] : {};
      o = o[k];
    });
    o[ks[ks.length - 1]] = val;
  }
  const emptyML = () => Object.fromEntries(LANGS.map((l) => [l, ""]));
  const emptyItem = (item) => Object.fromEntries(item.map((f) => [f.k, f.ml ? emptyML() : ""]));
  // 미리보기용 경로: 기본 사진(assets/...)은 관리자 폴더 기준 ../ 를 붙임
  const previewUrl = (u) => (!u ? "" : /^[a-z]+:/i.test(u) ? u : "../" + u);

  /* ---------------------------------------------------- 입력 칸 */
  function input(path, value, f, ph) {
    defs[path] = f;
    const common = `data-path="${esc(path)}"${ph ? ` placeholder="${esc(ph)}"` : ""}`;
    return f.area
      ? `<textarea ${common} rows="${f.rows || 4}">${esc(value)}</textarea>`
      : `<input ${common} value="${esc(value)}">`;
  }

  function field(f, value, path) {
    if (f.type === "list") return listField(f, value || [], path);
    if (f.type === "image") return `
      <div class="ce-field ce-field--image">
        <span class="label">${esc(f.label)}</span>
        <div class="ce-image">
          <div class="ce-image__img" style="background-image:url('${esc(previewUrl(value))}')"></div>
          <label class="ce-upload">${value ? "사진 바꾸기" : "사진 올리기"}<input type="file" accept="image/*" data-img-path="${esc(path)}"></label>
        </div>
      </div>`;
    if (f.ml) {
      const v = value || {};
      return `
        <div class="ce-field ce-field--ml${f.stack ? " ce-field--stack" : ""}">
          <span class="label">${esc(f.label)}</span>
          ${LANGS.map((l) => `<label class="ce-lang"><span class="ce-lang__tag">${l.toUpperCase()}</span>${input(`${path}.${l}`, v[l], f, LANG_LABEL[l])}</label>`).join("")}
        </div>`;
    }
    return `<label class="ce-field"><span class="label">${esc(f.label)}</span>${input(path, value, f)}</label>`;
  }

  function listField(f, items, path) {
    defs[path] = f;
    return `
      <div class="ce-list">
        <h2 class="ce-list__title">${esc(f.label)} <small>${items.length}</small></h2>
        ${items.map((it, i) => `
          <div class="ce-item">
            <div class="ce-item__bar">
              <span class="label">${i + 1}${f.k === "items" && it.youtube ? ` · ${esc(ytId(it.youtube) || "주소 확인 필요")}` : ""}</span>
              <span class="ce-item__btns">
                <button type="button" data-act="up" data-path="${esc(path)}" data-i="${i}" ${i === 0 ? "disabled" : ""} aria-label="위로">↑</button>
                <button type="button" data-act="down" data-path="${esc(path)}" data-i="${i}" ${i === items.length - 1 ? "disabled" : ""} aria-label="아래로">↓</button>
                <button type="button" data-act="remove" data-path="${esc(path)}" data-i="${i}">삭제</button>
              </span>
            </div>
            ${f.item.map((sf) => field(sf, it[sf.k], `${path}.${i}.${sf.k}`)).join("")}
          </div>`).join("")}
        <div class="ce-add-row">
          <button type="button" class="ce-add" data-act="add" data-path="${esc(path)}">+ ${esc(f.label)} 항목 추가</button>
          ${f.bulk ? `<label class="ce-upload ce-upload--bulk">여러 장 올리기<input type="file" accept="image/*" multiple data-bulk-path="${esc(path)}"></label>` : ""}
        </div>
      </div>`;
  }

  /* ---------------------------------------------------- 사진 */
  function photosField() {
    return `<div class="ce-photos">${PHOTO_KEYS.map((p) => {
      const v = state[p.k] || {};
      const isDefault = v.url === DEFAULTS.photos[p.k].url;
      return `
        <div class="ce-photo">
          <div class="ce-photo__img" style="background-image:url('${esc(previewUrl(v.url))}')"></div>
          <div class="ce-photo__body">
            <span class="label">${esc(p.label)}</span>
            <div class="ce-photo__btns">
              <label class="ce-upload">사진 바꾸기<input type="file" accept="image/*" data-img-path="${p.k}.url"></label>
              ${isDefault ? "" : `<button type="button" class="admin-textbtn" data-act="photo-default" data-key="${p.k}">기본 사진으로</button>`}
            </div>
            ${p.venue != null ? field({ k: "caption", label: "사진 설명", ml: true }, v.caption, `${p.k}.caption`) : ""}
          </div>
        </div>`;
    }).join("")}</div>`;
  }

  // 큰 사진은 업로드 전에 긴 변 2000px JPEG 로 줄임
  function resizeImage(file, max = 2000) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        c.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지 변환 실패"))), "image/jpeg", 0.85);
      };
      img.onerror = () => reject(new Error("이 형식의 사진은 열 수 없습니다. JPG 또는 PNG 로 올려 주세요."));
      img.src = URL.createObjectURL(file);
    });
  }

  // 사진 한 장을 줄여서 저장소에 올리고 공개 주소를 돌려줌
  async function uploadFile(file) {
    const blob = await resizeImage(file);
    const path = `${section.key}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function uploadTo(path, file) {
    ui.msg("사진을 올리는 중입니다…");
    try {
      setAt(state, path, await uploadFile(file));
      render();
      ui.msg("사진을 올렸습니다. '저장'을 눌러야 사이트에 반영됩니다.");
    } catch (e) {
      ui.msg(ui.errText(e), true);
    }
  }

  // 여러 장 한 번에: 사진마다 새 항목을 만들어 목록 끝에 추가
  async function uploadMany(path, files) {
    const f = defs[path];
    const imgKey = f.item.find((x) => x.type === "image").k;
    const list = getAt(state, path) || [];
    let done = 0;
    try {
      for (const file of files) {
        ui.msg(`사진을 올리는 중입니다… (${done + 1}/${files.length})`);
        const item = emptyItem(f.item);
        item[imgKey] = await uploadFile(file);
        list.push(item);
        done++;
      }
      setAt(state, path, list);
      render();
      ui.msg(`사진 ${done}장을 올렸습니다. 장소·날짜를 적고 '저장'을 눌러 주세요.`);
    } catch (e) {
      setAt(state, path, list);
      render();
      ui.msg(`${done}장까지 올렸습니다. ` + ui.errText(e), true);
    }
  }

  /* ---------------------------------------------------- 그리기 */
  function render() {
    defs = {};
    const y = window.scrollY;
    root.innerHTML = section.type === "photos"
      ? photosField()
      : section.fields.map((f) => field(f, state[f.k], f.k)).join("");
    window.scrollTo(0, y);
  }

  root.addEventListener("input", (e) => {
    const path = e.target.dataset.path;
    if (path) setAt(state, path, e.target.value);
  });

  root.addEventListener("change", (e) => {
    const { imgPath, bulkPath } = e.target.dataset;
    if (imgPath && e.target.files[0]) uploadTo(imgPath, e.target.files[0]);
    if (bulkPath && e.target.files.length) uploadMany(bulkPath, [...e.target.files]);
  });

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "photo-default") {
      state[b.dataset.key] = clone(DEFAULTS.photos[b.dataset.key]);
      return render();
    }
    const path = b.dataset.path;
    const list = getAt(state, path) || [];
    const i = +b.dataset.i;
    if (act === "add") list.push(emptyItem(defs[path].item));
    if (act === "remove") {
      if (!confirm(`${i + 1}번 항목을 삭제할까요? ('저장'을 눌러야 사이트에 반영됩니다)`)) return;
      list.splice(i, 1);
    }
    if (act === "up" && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    if (act === "down" && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
    setAt(state, path, list);
    render();
  });

  /* ---------------------------------------------------- 열기·저장·되돌리기 */
  async function open(key) {
    section = SECTIONS.find((s) => s.key === key);
    $("#content-title").textContent = section.label;
    $("#content-help").textContent = section.help || "";
    $("#content-help").hidden = !section.help;
    root.innerHTML = "";
    const { data, error } = await sb.from("site_content").select("value").eq("key", key).maybeSingle();
    if (error) ui.msg(ui.errText(error), true);
    // 저장된 값이 없으면 현재 사이트 내용(기본값)으로 시작. 사진은 새 자리가 생겨도 빠지지 않게 합침
    state = data && data.value ? clone(data.value) : clone(DEFAULTS[key]);
    if (key === "photos") state = Object.assign(clone(DEFAULTS.photos), state);
    render();
  }

  async function save() {
    if (section.key === "videos") {
      const bad = (state.items || []).findIndex((v) => !ytId(v.youtube));
      if (bad >= 0) return ui.msg(`${bad + 1}번 영상의 유튜브 주소를 확인해 주세요.`, true);
    }
    const btn = $("#content-save");
    btn.disabled = true;
    const { error } = await sb.from("site_content")
      .upsert({ key: section.key, value: state, updated_at: new Date().toISOString() });
    btn.disabled = false;
    if (error) return ui.msg(ui.errText(error), true);
    ui.msg("저장했습니다. 사이트에 바로 반영됩니다.");
    render();
  }

  async function reset() {
    if (!confirm(`'${section.label}'을(를) 처음 사이트 내용으로 되돌릴까요?\n여기서 저장했던 내용은 지워집니다.`)) return;
    const { error } = await sb.from("site_content").delete().eq("key", section.key);
    if (error) return ui.msg(ui.errText(error), true);
    state = clone(DEFAULTS[section.key]);
    render();
    ui.msg("기본 내용으로 되돌렸습니다.");
  }

  $("#content-save").addEventListener("click", save);
  $("#content-reset").addEventListener("click", reset);

  return { open, sections: SECTIONS };
};
