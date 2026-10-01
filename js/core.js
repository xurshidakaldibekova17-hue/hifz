/* ===== Ҳифз — асосий мантиқ ===== */
(function () {
  const Q = window.QURAN;
  const SUR = Q.surahs;
  const AY = [];
  let g = 0;
  SUR.forEach(s => s.ayahs.forEach((a, i) => {
    g++;
    AY.push({ g, s: s.n, a: i + 1, tj: a[0], uz: a[1], page: a[2], juz: a[3] });
  }));
  const TOTAL = AY.length;

  /* ---------- Тажвид белгили матнни таҳлил қилиш ---------- */
  const RE = /\[([a-z]+)(?::\d+)?\[([^\]]*)\]/g;
  function parseTj(tj) {
    const segs = []; let last = 0, m; RE.lastIndex = 0;
    while ((m = RE.exec(tj))) {
      if (m.index > last) segs.push([null, tj.slice(last, m.index)]);
      segs.push([m[1], m[2]]);
      last = RE.lastIndex;
    }
    if (last < tj.length) segs.push([null, tj.slice(last)]);
    return segs;
  }
  function plain(tj) { return tj.replace(/\[[a-z]+(?::\d+)?\[/g, '').replace(/\]/g, ''); }
  // сўзларга бўлиш: ҳар сўз = [[rule,text],...]
  function words(tj) {
    const segs = parseTj(tj);
    const out = [[]];
    for (const [r, t] of segs) {
      const parts = t.split(' ');
      parts.forEach((p, i) => {
        if (i > 0) out.push([]);
        if (p) out[out.length - 1].push([r, p]);
      });
    }
    return out.filter(w => w.length);
  }
  function wordText(w) { return w.map(x => x[1]).join(''); }
  function norm(s) {
    return s
      .replace(/ٰ/g, 'ا')
      .replace(/[ؐ-ًؚ-ٟۖ-ۭـ‌‍‏۟ۥۦ]/g, '')
      .replace(/[ٱ-ٳآأإ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىی]/g, 'ي')
      .replace(/[^ء-ي]/g, '');
  }
  function key(s) { return norm(s).replace(/[اءؤئو]/g, ''); }

  AY.forEach(x => {
    x.ar = plain(x.tj);
    x.w = words(x.tj);
    x.wt = x.w.map(wordText);
    x.wn = x.wt.map(norm);
    x.wc = x.wn.filter(Boolean).length;
  });

  const TJ = {
    h: { n: 'Ҳамзатул васл', d: 'Сўз бошида ўқилади, олдинги сўзга уланганда тушиб қолади.' },
    s: { n: 'Ўқилмайдиган ҳарф', d: 'Ёзилган, лекин талаффуз қилинмайди.' },
    l: { n: 'Лом шамсия', d: '«Ал» даги лом ўқилмайди, кейинги ҳарф ташдид билан ўқилади.' },
    n: { n: 'Мадд табиий', d: '2 ҳаракат чўзилади (бир бармоқни букиб-ёзиш вақти). Кам ҳам, ортиқ ҳам эмас.' },
    p: { n: 'Мадд жоиз мунфасил', d: 'Мадд ҳарфи сўз охирида, ҳамза кейинги сўз бошида. Ҳафс (Шотибия йўли) бўйича 4 ёки 5 ҳаракат чўзилади.' },
    o: { n: 'Мадд вожиб муттасил', d: 'Мадд ҳарфидан кейин шу сўзнинг ўзида ҳамза келади. 4–5 ҳаракат, вақфда 6 гача чўзиш мумкин.' },
    m: { n: 'Мадд лозим', d: 'Мадд ҳарфидан кейин асл сукун ёки ташдид. 6 ҳаракат — энг узун мадд.' },
    q: { n: 'Қалқала', d: 'ق ط ب ج د сукунли бўлганда маҳражда титраб, ҳаракатга ўхшамаган қисқа жаранг билан чиқарилади. Вақфда кучлироқ (қалқалаи кубро).' },
    g: { n: 'Ғунна', d: 'Ташдидли ن ва م — бурундан 2 ҳаракат миқдорида ғунна (бурун овози) билан ўқилади.' },
    f: { n: 'Ихфо', d: 'Сукунли ن ёки танвиндан кейин 15 ихфо ҳарфидан бири келса: нун маҳражга тегмасдан, бурундан 2 ҳаракат ғунна билан яширин ўқилади. Тил кейинги ҳарф маҳражига тайёр туради.' },
    c: { n: 'Ихфо шафавий', d: 'Сукунли م дан кейин ب келса: лаблар енгил юмилиб, ғунна билан 2 ҳаракат ўқилади.' },
    w: { n: 'Идғом шафавий', d: 'Сукунли م дан кейин م келса: ташдидли мим каби, ғунна билан қўшиб ўқилади.' },
    i: { n: 'Иқлоб', d: 'Сукунли ن ёки танвиндан кейин ب келса: нун мимга айлантирилиб, лаблар енгил юмилиб, ғунна билан ўқилади.' },
    a: { n: 'Идғом ғунна билан', d: 'Сукунли ن ёки танвиндан кейин ي ن م و келса: нун ўша ҳарфга қўшилиб, ғунна билан 2 ҳаракат ўқилади.' },
    u: { n: 'Идғом ғуннасиз', d: 'Сукунли ن ёки танвиндан кейин ل ёки ر келса: нун бутунлай қўшилиб, ғуннасиз ўқилади.' },
    d: { n: 'Идғом мутажонисайн', d: 'Маҳражи бир, сифати бошқа икки ҳарф: биринчиси иккинчисига қўшилиб ўқилади.' },
    b: { n: 'Идғом мутақорибайн', d: 'Маҳражи яқин икки ҳарф қўшилиб ўқилади.' }
  };
  const TJ_COLORS = { h: '#9a9a9a', s: '#9a9a9a', l: '#9a9a9a', n: '#537FFF', p: '#4050FF', o: '#2144C1', m: '#000EBC', q: '#DD0008', g: '#FF7E1E', f: '#9400A8', c: '#D500B7', w: '#58B800', i: '#26BFFD', a: '#169777', u: '#169200', d: '#A1A1A1', b: '#A1A1A1' };
  // Текшириш рўйхатига кирадиган қоидалар (лаҳн хафий)
  const TJ_CHECK = ['m', 'o', 'p', 'n', 'q', 'g', 'f', 'c', 'w', 'i', 'a', 'u', 'd', 'b'];

  // оятдаги қоидалар рўйхати: [{rule, word(text), wi}]
  function tjRules(ay) {
    const out = [];
    ay.w.forEach((w, wi) => {
      const seen = new Set();
      for (const [r] of w) {
        if (r && TJ_CHECK.includes(r) && !seen.has(r)) { seen.add(r); out.push({ r, wi, word: ay.wt[wi] }); }
      }
    });
    return out;
  }

  /* ---------- Матнни HTML қилиш ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function wordHtml(w, cls, idx) {
    const inner = w.map(([r, t]) => r ? `<span class="tj-${r}">${esc(t)}</span>` : esc(t)).join('');
    return `<span class="w ${cls || ''}" data-i="${idx}">${inner}</span>`;
  }
  // opts: {hide:Set, cls:fn(i)=>class, num:boolean}
  function ayahHtml(ay, opts) {
    opts = opts || {};
    const parts = ay.w.map((w, i) => {
      let cls = opts.cls ? (opts.cls(i) || '') : '';
      if (opts.hide && opts.hide.has(i)) cls += ' hid';
      return wordHtml(w, cls, i);
    });
    let html = parts.join(' ');
    if (opts.num !== false) html += `<span class="ayah-num">${ay.a}</span>`;
    return html;
  }
  function bismHtml() {
    return `<div class="ar center bism">${words(Q.bismillah).map(w => wordHtml(w, '', -1)).join(' ')}</div>`;
  }

  /* ---------- Ҳолат (localStorage) ---------- */
  const KEY = 'hifz_state_v1';
  const DEF = () => ({
    plan: null, mem: {}, log: {}, xp: 0,
    set: { arSize: 30, showUz: true, reciter: 'ar.alafasy', tj: true, repeatN: 5, name: '' },
    ex: {}
  });
  let S;
  try { S = Object.assign(DEF(), JSON.parse(localStorage.getItem(KEY) || '{}')); S.set = Object.assign(DEF().set, S.set || {}); } catch (e) { S = DEF(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

  function todayStr(d) { d = d || new Date(); const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }
  function addDays(str, n) { const d = new Date(str + 'T00:00:00'); d.setDate(d.getDate() + n); return todayStr(d); }
  function diffDays(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }
  function logToday(field, n) {
    const t = todayStr(); S.log[t] = S.log[t] || { new: 0, rev: 0, ex: 0, chk: 0, best: 0 };
    S.log[t][field] = (S.log[t][field] || 0) + (n == null ? 1 : n); save();
  }
  function streak() {
    let n = 0, d = todayStr();
    if (!S.log[d]) d = addDays(d, -1);
    while (S.log[d] && (S.log[d].new || S.log[d].rev || S.log[d].ex || S.log[d].chk)) { n++; d = addDays(d, -1); }
    return n;
  }

  /* ---------- Такрорлаш (SRS) ---------- */
  const INT = [1, 3, 7, 14, 30, 60, 120, 240];
  const mk = ay => `${ay.s}:${ay.a}`;
  function isMem(ay) { return !!S.mem[mk(ay)]; }
  function markMem(ay) {
    const k = mk(ay);
    if (!S.mem[k]) { S.mem[k] = { lvl: 0, reps: 0, lapses: 0, due: addDays(todayStr(), 1), since: todayStr() }; logToday('new'); S.xp += 10; }
    save();
  }
  function unMem(ay) { delete S.mem[mk(ay)]; save(); }
  function grade(ay, q) {
    const k = mk(ay); const m = S.mem[k]; if (!m) return;
    if (q < 3) { m.lvl = 0; m.lapses++; } else { m.lvl = Math.min(INT.length - 1, m.lvl + (q === 5 ? 2 : 1)); }
    m.reps++; m.due = addDays(todayStr(), INT[m.lvl]); m.last = todayStr(); m.q = q;
    S.xp += q >= 3 ? 3 : 1; logToday('rev'); save();
  }
  function dueList() {
    const t = todayStr();
    return Object.keys(S.mem).filter(k => S.mem[k].due <= t).map(k => { const [s, a] = k.split(':').map(Number); return byRef(s, a); }).sort((x, y) => x.g - y.g);
  }
  function memList() { return Object.keys(S.mem).map(k => { const [s, a] = k.split(':').map(Number); return byRef(s, a); }).sort((x, y) => x.g - y.g); }
  function byRef(s, a) { const su = SUR[s - 1]; return AY[su.ayahs.length ? (firstG[s] + a - 1) : 0]; }
  const firstG = {}; { let c = 0; SUR.forEach(s => { firstG[s.n] = c; c += s.ayahs.length; }); }

  /* ---------- Режа ---------- */
  function planAyahs(p) {
    p = p || S.plan; if (!p) return [];
    if (p.scope === 'quran') return AY;
    if (p.scope === 'juz') return AY.filter(a => p.juz.includes(a.juz));
    if (p.scope === 'surah') return AY.filter(a => p.surah.includes(a.s));
    if (p.scope === 'range') return AY.filter(a => a.g >= p.from && a.g <= p.to);
    return [];
  }
  let portionsCache = null, portionsKey = '';
  function portions() {
    if (!S.plan) return [];
    const k = JSON.stringify(S.plan);
    if (portionsCache && portionsKey === k) return portionsCache;
    const list = planAyahs(); const days = Math.max(1, S.plan.days || 30);
    const total = list.reduce((s, a) => s + a.wc, 0);
    const per = total / days; const out = []; let cur = [], acc = 0;
    for (const a of list) {
      cur.push(a); acc += a.wc;
      if (acc >= per * (out.length + 1) && out.length < days - 1) { out.push(cur); cur = []; }
    }
    if (cur.length) out.push(cur);
    while (out.length < days) out.push([]);
    portionsCache = out; portionsKey = k; return out;
  }
  function dayNum() { if (!S.plan) return 1; return Math.min(S.plan.days, Math.max(1, diffDays(S.plan.start, todayStr()) + 1)); }
  function portionDone(p) { return p.length > 0 && p.every(isMem); }
  function portionProgress(p) { return p.length ? p.filter(isMem).length / p.length : 0; }
  function currentPortionIdx() {
    const ps = portions(); const d = dayNum() - 1;
    for (let i = 0; i <= d; i++) if (!portionDone(ps[i])) return i;
    for (let i = d + 1; i < ps.length; i++) if (!portionDone(ps[i])) return i;
    return d;
  }

  /* ---------- Аудио ---------- */
  const player = document.getElementById('player');
  let queue = [], qIdx = 0, qRepeat = 1, qCount = 0, onQEnd = null, onQAyah = null;
  function audioUrl(g) { return `https://cdn.islamic.network/quran/audio/128/${S.set.reciter}/${g}.mp3`; }
  function playAyah(g) { stop(); queue = [g]; qIdx = 0; qRepeat = 1; qCount = 0; playNext(); }
  function playList(gs, repeat, cbAyah, cbEnd) { stop(); queue = gs.slice(); qIdx = 0; qRepeat = repeat || 1; qCount = 0; onQAyah = cbAyah; onQEnd = cbEnd; playNext(); }
  function playNext() {
    if (qIdx >= queue.length) {
      qCount++;
      if (qCount < qRepeat) { qIdx = 0; } else { queue = []; if (onQEnd) onQEnd(); return; }
    }
    const g = queue[qIdx]; player.src = audioUrl(g); player.playbackRate = 1;
    if (onQAyah) onQAyah(g, qIdx, qCount);
    player.play().catch(() => { toast('Аудио юкланмади (интернет керак)'); });
  }
  player.addEventListener('ended', () => { qIdx++; if (queue.length) playNext(); });
  player.addEventListener('error', () => { if (queue.length) { qIdx++; setTimeout(() => queue.length && playNext(), 300); } });
  function stop() { queue = []; onQEnd = null; onQAyah = null; try { player.pause(); } catch (e) { } }
  function playing() { return !player.paused && !player.ended; }

  /* ---------- Нутқни таниш (Web Speech API) ---------- */
  const SRC = window.SpeechRecognition || window.webkitSpeechRecognition;
  function speechSupported() { return !!SRC; }
  function makeRecognizer(onUpdate, onEnd) {
    const r = new SRC(); r.lang = 'ar-SA'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    let finals = [], active = false, interim = '';
    r.onresult = e => {
      interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finals.push(t); else interim += t + ' ';
      }
      onUpdate(finals.join(' '), interim);
    };
    r.onerror = e => { if (e.error === 'not-allowed') { active = false; toast('Микрофонга рухсат берилмади'); onEnd(finals.join(' ')); } };
    r.onend = () => { if (active) { try { r.start(); } catch (e) { } } else onEnd(finals.join(' ')); };
    return {
      start() { finals = []; interim = ''; active = true; try { r.start(); } catch (e) { toast('Микрофон ишга тушмади'); } },
      stop() { active = false; try { r.stop(); } catch (e) { } },
      get active() { return active; }
    };
  }

  /* ---------- Сўзларни солиштириш (тўғри/хато/тушиб қолган) ---------- */
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  }
  function sim(a, b) { if (!a && !b) return 1; const d = lev(a, b); return 1 - d / Math.max(a.length, b.length); }
  function wordMatch(refN, spoN) {
    if (refN === spoN) return 'ok';
    if (key(refN) === key(spoN)) return 'ok';
    const s = sim(refN, spoN);
    if (s >= 0.66 || (refN.length <= 3 && s >= 0.5)) return 'near';
    return null;
  }
  // refs: [{ai, wi, n}] ; spoken: [n]
  // натижа: refs учун label (ok/near/bad/miss), extra: қўшимча айтилган сўзлар
  function align(refs, spoken) {
    const m = refs.length, n = spoken.length;
    const D = Array.from({ length: m + 1 }, () => new Float32Array(n + 1));
    const B = Array.from({ length: m + 1 }, () => new Uint8Array(n + 1));
    for (let i = 1; i <= m; i++) { D[i][0] = i; B[i][0] = 1; }
    for (let j = 1; j <= n; j++) { D[0][j] = j; B[0][j] = 2; }
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      const mt = wordMatch(refs[i - 1].n, spoken[j - 1]);
      const sub = D[i - 1][j - 1] + (mt === 'ok' ? 0 : mt === 'near' ? 0.4 : 1.2);
      const del = D[i - 1][j] + 1, ins = D[i][j - 1] + 1;
      if (sub <= del && sub <= ins) { D[i][j] = sub; B[i][j] = 3; }
      else if (del <= ins) { D[i][j] = del; B[i][j] = 1; }
      else { D[i][j] = ins; B[i][j] = 2; }
    }
    const labels = new Array(m).fill('miss'); const extra = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      const b = B[i][j];
      if (b === 3) { const mt = wordMatch(refs[i - 1].n, spoken[j - 1]); labels[i - 1] = mt || 'bad'; i--; j--; }
      else if (b === 1) { labels[i - 1] = 'miss'; i--; }
      else { extra.push({ after: i, w: spoken[j - 1] }); j--; }
    }
    return { labels, extra: extra.reverse() };
  }
  function evaluate(ayahs, transcript) {
    const refs = [];
    ayahs.forEach((ay, ai) => ay.wn.forEach((n, wi) => { if (n) refs.push({ ai, wi, n }); }));
    const spoken = transcript.split(/\s+/).map(norm).filter(Boolean);
    const { labels, extra } = align(refs, spoken);
    const total = refs.length; let ok = 0, near = 0, bad = 0, miss = 0;
    labels.forEach(l => { if (l === 'ok') ok++; else if (l === 'near') near++; else if (l === 'bad') bad++; else miss++; });
    const score = total ? Math.round(((ok + near * 0.8) / total) * 100) : 0;
    return { refs, labels, extra, total, ok, near, bad, miss, score, spoken };
  }

  /* ---------- UI ёрдамчилар ---------- */
  let toastT;
  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }
  function modal(html, after) {
    const m = document.getElementById('modal'), b = document.getElementById('modalBox');
    b.innerHTML = html; m.hidden = false;
    m.onclick = e => { if (e.target === m) closeModal(); };
    if (after) after(b);
  }
  function closeModal() { document.getElementById('modal').hidden = true; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function ref(ay) { return `${SUR[ay.s - 1].uz} ${ay.s}:${ay.a}`; }
  function applySettings() {
    document.documentElement.style.setProperty('--ar-size', S.set.arSize + 'px');
    document.body.classList.toggle('no-tj', !S.set.tj);
  }
  applySettings();

  window.H = { Q, SUR, AY, TOTAL, TJ, TJ_COLORS, TJ_CHECK, tjRules, parseTj, plain, words, norm, key, esc, wordHtml, ayahHtml, bismHtml, S, save, todayStr, addDays, diffDays, logToday, streak, INT, mk, isMem, markMem, unMem, grade, dueList, memList, byRef, firstG, planAyahs, portions, dayNum, portionDone, portionProgress, currentPortionIdx, audioUrl, playAyah, playList, stop, playing, player, speechSupported, makeRecognizer, evaluate, wordMatch, sim, toast, modal, closeModal, shuffle, pick, ref, applySettings };
})();
