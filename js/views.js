/* ===== Экранлар ва маршрутлаш ===== */
(function () {
  const { Q, SUR, AY, TOTAL, TJ, TJ_COLORS, tjRules, esc, ayahHtml, bismHtml, S, save, todayStr, addDays, streak, INT, mk, isMem, markMem, unMem, grade, dueList, memList, byRef, portions, dayNum, portionDone, portionProgress, currentPortionIdx, playAyah, playList, stop, speechSupported, makeRecognizer, evaluate, toast, modal, closeModal, shuffle, pick, ref, applySettings, logToday } = H;
  const view = document.getElementById('view');
  const titleEl = document.getElementById('title');
  const backBtn = document.getElementById('backBtn');
  const V = {};
  let stack = [];
  const TABS = ['home', 'memorize', 'review', 'exercises', 'more'];

  window.go = function (name, params, replace) {
    stop();
    if (TABS.includes(name)) stack = [{ name, params }];
    else if (replace) stack[stack.length - 1] = { name, params };
    else stack.push({ name, params });
    render();
  };
  window.back = function () { stop(); if (stack.length > 1) stack.pop(); render(); };
  function render() {
    const cur = stack[stack.length - 1];
    window.scrollTo(0, 0);
    view.innerHTML = '';
    backBtn.hidden = stack.length <= 1;
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === stack[0].name));
    V[cur.name](cur.params || {});
  }
  backBtn.onclick = () => back();
  document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => go(b.dataset.tab));
  document.getElementById('settingsBtn').onclick = () => V.settings();
  function setTitle(t) { titleEl.textContent = t; }

  const TIPS = [
    'Ёдлашнинг энг яхши вақти — бомдоддан кейин, зеҳн тоза пайт.',
    'Янги оятни ёдлашдан олдин 10 марта қироат билан тингланг.',
    'Бир хил мусҳаф (бир хил саҳифа жойлашуви) дан фойдаланинг — кўз хотираси ишлайди.',
    'Қоида: 1 янги саҳифа : 5 эски саҳифа такрори.',
    'Ёдлаганингизни намозда ўқинг — энг кучли мустаҳкамлаш.',
    'Оятнинг маъносини билиб ёдланг — маъно хотирага илгак бўлади.',
    'Уйқудан олдин ва уйғонгач бугунги оятларни бир марта такрорланг.',
    'Овоз чиқариб ёдланг: қулоқ, тил ва кўз бирга ишлайди.',
    'Телефон ва шовқиндан узоқ, бир хил жойда ёдланг.',
    'Бировга ўқиб беринг — хато шунда билинади.',
    'Қийин оятни ёзиб кўринг: қўл хотираси ҳам ёрдам беради.',
    'Чарчасангиз, 5 дақиқа юриб келинг, сув ичинг — сўнг давом этинг.',
    'Оятларни занжир қилинг: 1, 1-2, 1-2-3 ... тартибида қўшиб ўқинг.',
    'Такрорни ўтказиб юборманг: такрорсиз ёдлаган нарса 3 кунда учади.',
    'Истиғфор ва дуо қилинг: илм ният ва поклик билан осон киради.'
  ];

  /* ---------- БОШ ---------- */
  V.home = function () {
    setTitle('Ҳифз');
    const due = dueList(); const mem = memList();
    const name = S.set.name ? `, ${esc(S.set.name)}` : '';
    let planHtml;
    if (!S.plan) {
      planHtml = `<div class="card"><h2 style="margin-top:0">Режа тузилмаган</h2><p class="muted">Нимани қанча кунда ёдлашни танланг. Илова ҳар кунга бўлакларни ўзи тақсимлайди.</p><button class="btn primary block" onclick="go('plan')">30 кунлик режа тузиш</button></div>`;
    } else {
      const ps = portions(); const d = dayNum(); const ci = currentPortionIdx(); const p = ps[ci] || [];
      const all = H.planAyahs(); const done = all.filter(isMem).length;
      const left = p.filter(a => !isMem(a)).length;
      const backlog = ps.slice(0, Math.min(d, ps.length)).filter((x, i) => i !== ci && !portionDone(x)).length;
      planHtml = `<div class="card">
        <div class="row between"><h2 style="margin:0">${d}-кун / ${S.plan.days}</h2><span class="chip">${planName()}</span></div>
        <div class="spacer"></div>
        <div class="bar"><i style="width:${all.length ? done / all.length * 100 : 0}%"></i></div>
        <p class="muted">${done} / ${all.length} оят ёдланди (${all.length ? Math.round(done / all.length * 100) : 0}%)</p>
        <div class="grid2">
          <div class="stat"><b>${left}</b><small>бугун янги оят</small></div>
          <div class="stat"><b>${due.length}</b><small>такрорга навбатда</small></div>
        </div>
        <div class="spacer"></div>
        <button class="btn primary block" onclick="go('portion',{i:${ci}})">${left ? '📖 Бугунги вазифани бошлаш' : '✅ Бугунги вазифа бажарилди'}</button>
        ${backlog ? `<p class="muted center">⚠️ ${backlog} кунлик қарз бор — <a href="#" onclick="go('memorize');return false">кўриш</a></p>` : ''}
      </div>`;
    }
    view.innerHTML = `
      <h1>Ассалому алайкум${name}!</h1>
      <div class="grid3">
        <div class="stat"><b>${mem.length}</b><small>ёдланган оят</small></div>
        <div class="stat"><b>${streak()}</b><small>кун кетма-кет</small></div>
        <div class="stat"><b>${S.xp}</b><small>балл</small></div>
      </div>
      <div class="spacer"></div>
      ${planHtml}
      <div class="card">
        <div class="row between"><h2 style="margin:0">Такрорлаш</h2><span class="chip ${due.length ? 'gold' : 'ok'}">${due.length} та</span></div>
        <p class="muted">Ёдланган оятлар 1, 3, 7, 14, 30 кун оралиғида қайта сўралади. Такрорсиз ҳифз сақланмайди.</p>
        <button class="btn ${due.length ? 'gold' : ''} block" onclick="go('review')">🔁 Такрорлашни бошлаш</button>
      </div>
      <div class="grid2">
        <button class="btn" onclick="go('check')">🎙️ Ўқишни текшириш</button>
        <button class="btn" onclick="go('exercises')">🧠 Зеҳн машқлари</button>
        <button class="btn" onclick="go('mushaf')">📗 Қуръон (тажвид)</button>
        <button class="btn" onclick="go('methods')">💡 Ёдлаш усуллари</button>
      </div>
      <div class="tip">💡 ${TIPS[new Date().getDate() % TIPS.length]}</div>`;
  };
  function planName() {
    const p = S.plan; if (!p) return '';
    if (p.scope === 'quran') return 'Бутун Қуръон';
    if (p.scope === 'juz') return p.juz.length === 1 ? `${p.juz[0]}-жуз` : `${p.juz.length} жуз`;
    if (p.scope === 'surah') return p.surah.length === 1 ? SUR[p.surah[0] - 1].uz : `${p.surah.length} сура`;
    return 'Оралиқ';
  }

  /* ---------- РЕЖА ---------- */
  V.plan = function () {
    setTitle('Режа');
    const p = S.plan || { scope: 'quran', juz: [30], surah: [1, 112, 113, 114], days: 30, start: todayStr(), from: 1, to: 7 };
    view.innerHTML = `
      <h1>Ёдлаш режаси</h1>
      <div class="card">
        <label>Нимани ёдлайман?</label>
        <select id="scope">
          <option value="quran">Бутун Қуръон (604 саҳифа)</option>
          <option value="juz">Танланган жузлар</option>
          <option value="surah">Танланган суралар</option>
        </select>
        <div id="juzBox" hidden><label>Жузлар (бир нечтасини белгилаш мумкин)</label><div class="grid3" id="juzs">${Array.from({ length: 30 }, (_, i) => `<label style="margin:0"><input type="checkbox" value="${i + 1}"> ${i + 1}-жуз</label>`).join('')}</div></div>
        <div id="surBox" hidden><label>Суралар</label><input id="surSearch" placeholder="Қидириш..."><div class="list" id="surs" style="max-height:260px;overflow:auto;margin-top:6px">${SUR.map(s => `<label class="item" style="margin:0"><input type="checkbox" value="${s.n}"><span>${s.n}. ${s.uz} <small class="muted">(${s.ayahs.length} оят)</small></span></label>`).join('')}</div></div>
        <label>Неча кунда?</label><input id="days" type="number" min="1" max="3650" value="${p.days}">
        <label>Бошланиш санаси</label><input id="start" type="date" value="${p.start}">
        <div class="tip" id="summary"></div>
        <button class="btn primary block" id="savePlan">Режани сақлаш</button>
      </div>
      ${S.plan ? `<h2>Кунлар</h2><div class="cal" id="cal"></div><p class="muted">Яшил — бажарилган, сариқ — қисман, рамка — бугун.</p>` : ''}`;
    const scope = view.querySelector('#scope'); scope.value = p.scope;
    view.querySelectorAll('#juzs input').forEach(c => c.checked = (p.juz || []).includes(+c.value));
    view.querySelectorAll('#surs input').forEach(c => c.checked = (p.surah || []).includes(+c.value));
    view.querySelector('#surSearch').oninput = e => { const q = e.target.value.toLowerCase(); view.querySelectorAll('#surs .item').forEach(it => it.style.display = it.textContent.toLowerCase().includes(q) ? '' : 'none'); };
    const current = () => ({
      scope: scope.value,
      juz: [...view.querySelectorAll('#juzs input:checked')].map(c => +c.value),
      surah: [...view.querySelectorAll('#surs input:checked')].map(c => +c.value),
      days: Math.max(1, +view.querySelector('#days').value || 30),
      start: view.querySelector('#start').value || todayStr()
    });
    const upd = () => {
      const c = current();
      view.querySelector('#juzBox').hidden = c.scope !== 'juz'; view.querySelector('#surBox').hidden = c.scope !== 'surah';
      const list = H.planAyahs(c); const pages = new Set(list.map(a => a.page)).size;
      const perDay = list.length / c.days; const pp = pages / c.days;
      let warn = '';
      if (pp > 5) warn = `<br>⚠️ Кунига ${pp.toFixed(1)} саҳифа — бу жуда катта юк. Бутун Қуръонни 30 кунда ёдлаш фақат фавқулодда зеҳн ва кунига 8–10 соат билан мумкин. Агар қийин бўлса, кунлар сонини кўпайтиринг ёки аввал 30-жуздан бошланг.`;
      else if (pp > 2) warn = `<br>⚠️ Кунига ${pp.toFixed(1)} саҳифа — жиддий меҳнат талаб қилади (кунига 3–5 соат).`;
      view.querySelector('#summary').innerHTML = list.length ? `Жами <b>${list.length}</b> оят, <b>${pages}</b> саҳифа. Кунига ≈ <b>${Math.ceil(perDay)}</b> оят (${pp.toFixed(1)} саҳифа).${warn}` : 'Ҳеч нарса танланмаган.';
    };
    view.querySelectorAll('#scope,#juzs input,#surs input,#days,#start').forEach(x => x.onchange = upd); upd();
    view.querySelector('#savePlan').onclick = () => {
      const c = current(); if (!H.planAyahs(c).length) return toast('Аввал нимани ёдлашни танланг');
      S.plan = c; save(); toast('Режа сақланди'); go('home');
    };
    if (S.plan) {
      const ps = portions(); const d = dayNum();
      view.querySelector('#cal').innerHTML = ps.map((x, i) => { const pr = portionProgress(x); const cls = (pr === 1 ? 'done' : pr > 0 ? 'part' : '') + (i + 1 === d ? ' today' : ''); return `<div class="${cls}" onclick="go('portion',{i:${i}})">${i + 1}<small>${x.length} оят</small></div>`; }).join('');
    }
  };

  /* ---------- ЁДЛАШ (кунлар рўйхати) ---------- */
  V.memorize = function () {
    setTitle('Ёдлаш');
    if (!S.plan) { view.innerHTML = `<h1>Ёдлаш</h1><div class="card"><p>Аввал режа тузинг.</p><button class="btn primary block" onclick="go('plan')">Режа тузиш</button></div><div class="card"><p>Ёки режасиз, истаган сурани ёдлаш:</p><button class="btn block" onclick="go('mushaf')">Қуръондан танлаш</button></div>`; return; }
    const ps = portions(); const d = dayNum(); const ci = currentPortionIdx();
    view.innerHTML = `<h1>Кунлик бўлаклар</h1><p class="muted">${planName()} — ${S.plan.days} кун. Бугун ${d}-кун.</p><div class="list">${ps.map((p, i) => {
      if (!p.length) return '';
      const a = p[0], b = p[p.length - 1]; const pr = portionProgress(p);
      return `<div class="item ${pr === 1 ? 'done' : ''}" onclick="go('portion',{i:${i}})"><div class="n">${i + 1}</div><div class="t">${ref(a)} → ${ref(b)}<small>${p.length} оят · ${Math.round(pr * 100)}% ${i === ci ? '· <b>навбатдаги</b>' : ''}</small></div><span>${pr === 1 ? '✅' : i + 1 < d ? '⚠️' : '›'}</span></div>`;
    }).join('')}</div>`;
  };

  V.portion = function ({ i }) {
    const p = portions()[i] || []; setTitle(`${i + 1}-кун`);
    if (!p.length) { view.innerHTML = '<div class="card">Бу кунга оят йўқ.</div>'; return; }
    const left = p.filter(a => !isMem(a));
    const first = left.length ? p.indexOf(left[0]) : 0;
    view.innerHTML = `<div class="row between"><h1 style="margin:0">${i + 1}-кун вазифаси</h1><span class="chip">${p.length - left.length}/${p.length}</span></div>
      <p class="muted">${ref(p[0])} → ${ref(p[p.length - 1])}. Ҳар оят 5 босқичдан ўтади ва текширувдан ўтгандагина «ёдланган» ҳисобланади.</p>
      <div class="row"><button class="btn primary" onclick="go('train',{gs:[${p.map(a => a.g)}],i:${first}})">▶ ${left.length ? 'Ёдлашни давом эттириш' : 'Қайта кўриб чиқиш'}</button><button class="btn" id="listen">🔊 Ҳаммасини тинглаш</button><button class="btn" onclick="go('check',{s:${p[0].s},a:${p[0].a},b:${p[p.length - 1].s === p[0].s ? p[p.length - 1].a : SUR[p[0].s - 1].ayahs.length}})">🎙️ Текшириш</button></div>
      <div class="spacer"></div>
      <div class="list">${p.map((a, k) => `<div class="item ${isMem(a) ? 'done' : ''}" onclick="go('train',{gs:[${p.map(x => x.g)}],i:${k}})"><div class="n">${a.a}</div><div class="t"><div class="ar">${ayahHtml(a, { num: false })}</div><small>${ref(a)}${isMem(a) ? ' · ёдланган' : ''}</small></div><span>${isMem(a) ? '✅' : '›'}</span></div>`).join('')}</div>`;
    view.querySelector('#listen').onclick = () => playList(p.map(a => a.g), 1);
  };

  /* ---------- ТРЕНАЖЁР (бир оят, 5 босқич) ---------- */
  V.train = function ({ gs, i, step }) {
    const list = gs.map(g => AY[g - 1]); const ay = list[i]; step = step || 0;
    setTitle(ref(ay));
    const STEPS = ['Тингла ва ўқи', 'Қисман ёпиш', 'Тўлиқ ёпиш', 'Тартибла', 'Текшир'];
    const stepsHtml = `<div class="steps">${STEPS.map((s, k) => `<i class="${k < step ? 'done' : k === step ? 'on' : ''}"></i>`).join('')}</div><p class="muted center" style="margin-top:-8px">${step + 1}-босқич: <b>${STEPS[step]}</b></p>`;
    const nav = (prevOk) => `<div class="row between" style="margin-top:12px"><button class="btn" onclick="go('train',{gs:[${gs}],i:${i},step:${Math.max(0, step - 1)}},true)" ${step === 0 ? 'disabled' : ''}>‹ Орқага</button><span class="chip muted">${i + 1}/${list.length} оят</span><button class="btn primary" id="nextStep" ${prevOk === false ? 'disabled' : ''}>Кейинги ›</button></div>`;
    const goStep = s => go('train', { gs, i, step: s }, true);
    const nextAyah = () => { if (i + 1 < list.length) go('train', { gs, i: i + 1, step: 0 }, true); else { toast('Бўлак тугади!'); back(); } };
    const uzHtml = S.set.showUz ? `<p class="uz">${esc(ay.uz)}</p>` : '';
    const prevHtml = i > 0 ? `<p class="muted">Олдинги оят охири: <span class="ar" style="font-size:20px">… ${esc(list[i - 1].wt.slice(-3).join(' '))}</span></p>` : '';

    if (step === 0) {
      const n = S.set.repeatN;
      view.innerHTML = `${stepsHtml}<div class="card">${prevHtml}<div class="ar">${ayahHtml(ay)}</div>${uzHtml}
        <div class="spacer"></div>
        <div class="row"><button class="btn" id="play">🔊 Тинглаш</button><button class="btn" id="playN">🔁 ${n} марта тинглаш</button><button class="btn ghost sm" id="tjShow">Тажвид қоидалари</button></div>
        <div class="spacer"></div>
        <p class="muted center">Қироатга қараб <b>${n} марта</b> овоз чиқариб ўқинг, ҳар ўқиганда босинг:</p>
        <p class="counter" id="cnt">0 / ${n}</p><button class="btn block" id="read">✓ Ўқидим</button>
        ${nav()}</div>
        <div class="tip">Усул: аввал тингланг, кейин кўриб ўқинг, кейин кўзни бир лаҳза юмиб эсланг. Маънони ҳам ўқинг — маъно хотирага илгак бўлади.</div>`;
      let c = 0;
      view.querySelector('#play').onclick = () => playAyah(ay.g);
      view.querySelector('#playN').onclick = () => playList([ay.g], n, (g, k, r) => toast(`${r + 1}-марта`));
      view.querySelector('#read').onclick = () => { c++; view.querySelector('#cnt').textContent = `${c} / ${n}`; if (c >= n) toast('Яхши! Энди кейинги босқич'); };
      view.querySelector('#tjShow').onclick = () => showTj([ay]);
      view.querySelector('#nextStep').onclick = () => goStep(1);
    } else if (step === 1 || step === 2) {
      const idxs = ay.wn.map((n, k) => n ? k : -1).filter(k => k >= 0);
      const hide = new Set(step === 1 ? shuffle(idxs).slice(0, Math.max(1, Math.round(idxs.length * 0.45))) : idxs);
      view.innerHTML = `${stepsHtml}<div class="card">${prevHtml}<p class="muted">${step === 1 ? 'Ярим сўзлар яширилган.' : 'Ҳамма сўзлар яширилган.'} Ёддан ўқинг, эслолмасангиз сўзни босиб кўринг. Ҳеч сўзни очмасдан 3 марта ўқий олсангиз — кейинги босқичга.</p>
        <div class="ar" id="txt">${ayahHtml(ay, { hide })}</div>${S.set.showUz ? `<p class="uz">${esc(ay.uz)}</p>` : ''}
        <div class="row"><button class="btn sm" id="reh">Қайта яшир</button><button class="btn sm" id="play">🔊</button><span class="chip" id="opened">Очилди: 0</span></div>
        ${nav()}</div>`;
      let opened = 0;
      const bind = () => view.querySelectorAll('#txt .w.hid').forEach(w => w.onclick = () => { w.classList.remove('hid'); opened++; view.querySelector('#opened').textContent = 'Очилди: ' + opened; });
      bind();
      view.querySelector('#reh').onclick = () => { view.querySelectorAll('#txt .w').forEach(w => { if (hide.has(+w.dataset.i)) w.classList.add('hid'); }); opened = 0; view.querySelector('#opened').textContent = 'Очилди: 0'; bind(); };
      view.querySelector('#play').onclick = () => playAyah(ay.g);
      view.querySelector('#nextStep').onclick = () => goStep(step + 1);
    } else if (step === 3) {
      const idxs = ay.wn.map((n, k) => n ? k : -1).filter(k => k >= 0);
      const order = shuffle(idxs); let pos = 0; const built = [];
      view.innerHTML = `${stepsHtml}<div class="card">${prevHtml}<p class="muted">Сўзларни тўғри тартибда босинг.</p>
        <div class="ar center" id="out" style="min-height:60px;background:var(--bg);border-radius:12px;padding:6px"></div><div class="spacer"></div>
        <div class="pool" id="pool">${order.map(k => `<span class="w ar" data-i="${k}" style="font-size:26px">${esc(ay.wt[k])}</span>`).join('')}</div>
        ${nav(false)}</div>`;
      view.querySelectorAll('#pool .w').forEach(w => w.onclick = () => {
        const k = +w.dataset.i;
        if (k === idxs[pos]) { pos++; w.classList.add('used'); built.push(ay.wt[k]); view.querySelector('#out').textContent = built.join(' '); if (pos === idxs.length) { view.querySelector('#nextStep').disabled = false; toast('Тўғри! Энди текшириш'); } }
        else { w.classList.add('err'); setTimeout(() => w.classList.remove('err'), 400); }
      });
      view.querySelector('#nextStep').onclick = () => goStep(4);
    } else if (step === 4) {
      view.innerHTML = `${stepsHtml}<div class="card">${prevHtml}<p class="muted">Оятни кўрмасдан ўқинг. Микрофон орқали автоматик ёки ўзингиз текширинг. <b>90% ва ундан юқори</b> натижа — оят ёдланган ҳисобланади.</p>
        <div id="chk"></div></div>
        <div class="card" id="resBox" hidden></div>`;
      checkPanel(view.querySelector('#chk'), [ay], res => {
        const box = view.querySelector('#resBox'); box.hidden = false;
        const pass = res.score >= 90;
        box.innerHTML = `<div class="score ${pass ? 'ok' : res.score >= 70 ? 'warn' : 'bad'}">${res.score}%</div><p class="center muted">${pass ? 'Баракалла! Оят ёдланди.' : res.score >= 70 ? 'Яқин, лекин яна машқ керак.' : 'Ҳали эрта. 2-босқичдан такрорланг.'}</p>
          <div class="row" style="justify-content:center">${pass ? `<button class="btn ok" id="memOk">✅ Ёдладим, кейинги оят</button>` : `<button class="btn primary" id="again">↺ Яна машқ (2-босқич)</button>`}<button class="btn" id="tjBtn">Тажвид текшируви</button></div>`;
        if (pass) { markMem(ay); box.querySelector('#memOk').onclick = () => { if (i > 0 && i % 3 === 0) chainPrompt(list.slice(0, i + 1), nextAyah); else nextAyah(); }; }
        else box.querySelector('#again').onclick = () => goStep(1);
        box.querySelector('#tjBtn').onclick = () => showTj([ay]);
      });
    }
  };
  function chainPrompt(ayahs, next) {
    modal(`<h2 style="margin-top:0">🔗 Занжир: боғлаб ўқинг</h2><p class="muted">Ҳозир ${ayahs.length} та оятни бошидан охиригача кўрмасдан боғлаб ўқинг. Бу оятларнинг бир-бирига уланишини мустаҳкамлайди.</p><div id="chainChk"></div><div class="spacer"></div><button class="btn block" id="skip">Ўтказиб юбориш</button>`, b => {
      b.querySelector('#skip').onclick = () => { closeModal(); next(); };
      checkPanel(b.querySelector('#chainChk'), ayahs, res => { toast(`Занжир: ${res.score}%`); S.xp += res.score >= 90 ? 5 : 1; save(); setTimeout(() => { closeModal(); next(); }, 1500); });
    });
  }

  /* ---------- ТЕКШИРИШ ПАНЕЛИ (микрофон / ўзим) ---------- */
  function checkPanel(el, ayahs, onResult) {
    const sup = speechSupported();
    el.innerHTML = `<div class="row" style="justify-content:center"><button class="btn sm ${sup ? 'primary' : ''}" id="mMic" ${sup ? '' : 'disabled'}>🎙️ Микрофон</button><button class="btn sm ${sup ? '' : 'primary'}" id="mSelf">👁️ Ўзим текшираман</button></div>
      ${sup ? '' : '<p class="muted center">Бу браузерда нутқни таниш йўқ. Chrome ёки Edge да микрофон ишлайди.</p>'}<div id="mode"></div>`;
    const modeEl = el.querySelector('#mode');
    const mic = () => {
      modeEl.innerHTML = `<button class="mic" id="mic">🎙️</button><p class="center muted" id="st">Босинг ва ўқишни бошланг. Тугагач яна босинг.</p><div class="ar" id="live" style="font-size:20px;color:var(--muted);min-height:30px"></div>`;
      const btn = modeEl.querySelector('#mic'); let rec = null;
      btn.onclick = () => {
        if (rec && rec.active) { rec.stop(); btn.classList.remove('rec'); modeEl.querySelector('#st').textContent = 'Таҳлил қилинмоқда...'; return; }
        rec = makeRecognizer((fin, inter) => { modeEl.querySelector('#live').textContent = fin + ' ' + inter; }, fin => {
          btn.classList.remove('rec');
          if (!fin.trim()) { modeEl.querySelector('#st').textContent = 'Овоз аниқланмади. Яна уриниб кўринг.'; return; }
          const res = evaluate(ayahs, fin); renderResult(modeEl, ayahs, res); onResult(res);
        });
        rec.start(); btn.classList.add('rec'); modeEl.querySelector('#st').textContent = 'Эшитяпман... ўқинг (интернет керак)';
      };
    };
    const self = () => {
      let revealed = false; const marked = new Set();
      modeEl.innerHTML = `<p class="muted">Матн яширилган. Ёддан ўқинг, сўнг «Кўрсат»ни босиб, хато қилган сўзларингизни белгиланг.</p>
        <div id="txt">${ayahs.map(a => `<div class="ar" data-a="${a.g}">${ayahHtml(a, { hide: new Set(a.wn.map((n, k) => n ? k : -1).filter(k => k >= 0)) })}</div>`).join('')}</div>
        <div class="row" style="justify-content:center;margin-top:8px"><button class="btn primary" id="rev">👁️ Кўрсат</button><button class="btn ok" id="done" hidden>Баҳолаш</button></div>`;
      modeEl.querySelector('#rev').onclick = () => {
        revealed = true; modeEl.querySelector('#rev').hidden = true; modeEl.querySelector('#done').hidden = false;
        modeEl.querySelectorAll('#txt .w').forEach(w => { w.classList.remove('hid'); w.onclick = () => { const id = w.closest('[data-a]').dataset.a + ':' + w.dataset.i; if (marked.has(id)) { marked.delete(id); w.classList.remove('mark'); } else { marked.add(id); w.classList.add('mark'); } }; });
        toast('Хато сўзларни босиб белгиланг');
      };
      modeEl.querySelector('#done').onclick = () => {
        const total = ayahs.reduce((s, a) => s + a.wc, 0);
        const res = { total, bad: marked.size, miss: 0, near: 0, ok: total - marked.size, score: Math.round((total - marked.size) / total * 100), extra: [], self: true };
        modeEl.querySelectorAll('#txt .w').forEach(w => w.onclick = null);
        onResult(res);
      };
    };
    el.querySelector('#mMic').onclick = mic; el.querySelector('#mSelf').onclick = self;
    if (sup) mic(); else self();
  }
  function renderResult(el, ayahs, res) {
    const lab = ayahs.map(() => ({}));
    res.labels.forEach((l, k) => { const r = res.refs[k]; lab[r.ai][r.wi] = l; });
    const extraByAyah = ayahs.map(() => []);
    res.extra.forEach(e => { const r = res.refs[Math.min(e.after, res.refs.length - 1)]; extraByAyah[r ? r.ai : 0].push(e.w); });
    el.innerHTML = `<p class="muted">🟩 тўғри · 🟨 тахминан тўғри · 🟥 хато / тушиб қолган</p>` + ayahs.map((a, ai) => `<div class="ar">${ayahHtml(a, { cls: i => lab[ai][i] || '' })}</div>${extraByAyah[ai].length ? `<p class="extra">+ ортиқча: ${esc(extraByAyah[ai].join(' '))}</p>` : ''}`).join('') +
      `<div class="grid3" style="margin-top:8px"><div class="stat"><b class="ok-text">${res.ok + res.near}</b><small>тўғри</small></div><div class="stat"><b class="bad-text">${res.bad}</b><small>хато</small></div><div class="stat"><b class="bad-text">${res.miss}</b><small>тушиб қолган</small></div></div>`;
  }
  function showTj(ayahs) {
    const items = ayahs.flatMap(a => tjRules(a).map(r => ({ ...r, ay: a })));
    modal(`<h2 style="margin-top:0">Тажвид қоидалари (${items.length})</h2><p class="muted">Айман Сувайд услуби: ҳар бир қоида учун талаффузни текширинг ва тўғри бажарган бўлсангиз белгиланг. Бу «лаҳн хафий» (яширин хато) текшируви.</p>
      <div class="tj-list">${items.map((it, k) => `<div class="tj-item"><input type="checkbox" data-k="${k}"><span class="ar"><span style="color:${TJ_COLORS[it.r]}">${esc(it.word)}</span></span><div class="d"><b style="color:${TJ_COLORS[it.r]}">${TJ[it.r].n}</b>${TJ[it.r].d}<br><small class="muted">${ref(it.ay)}</small></div></div>`).join('')}</div>
      <div class="spacer"></div><button class="btn primary block" id="tjDone">Якунлаш</button>`, b => {
      b.querySelector('#tjDone').onclick = () => { const n = b.querySelectorAll('input:checked').length; toast(`Тажвид: ${n}/${items.length} қоида тўғри`); if (n === items.length && items.length) { S.xp += 5; save(); } closeModal(); };
    });
  }

  /* ---------- ТАКРОРЛАШ ---------- */
  V.review = function () {
    setTitle('Такрорлаш');
    const due = dueList(); const mem = memList();
    if (!mem.length) { view.innerHTML = `<h1>Такрорлаш</h1><div class="card"><p>Ҳали ёдланган оят йўқ. Аввал ёдлашни бошланг.</p><button class="btn primary block" onclick="go('memorize')">Ёдлаш</button></div>`; return; }
    if (!due.length) {
      const nxt = mem.map(a => S.mem[mk(a)].due).sort()[0];
      view.innerHTML = `<h1>Такрорлаш</h1><div class="card center"><p style="font-size:40px">✅</p><p>Бугунга такрор йўқ. Кейинги такрор: <b>${nxt}</b></p><button class="btn block" id="free">Барибир такрорлайман (ихтиёрий)</button></div>
        <div class="card"><h3 style="margin-top:0">Ёдланганлар (${mem.length})</h3><div class="list">${groupBySurah(mem)}</div></div>`;
      view.querySelector('#free').onclick = () => reviewSession(shuffle(mem).slice(0, 10), true);
      return;
    }
    view.innerHTML = `<h1>Такрорлаш</h1><div class="card"><p>Бугун <b>${due.length}</b> оят такрорга келди. Ҳар оятни кўрмасдан ўқинг, сўнг қандай эслаганингизни ҳалол баҳоланг.</p><button class="btn gold block" id="start">▶ Бошлаш</button></div>
      <div class="list">${due.map(a => `<div class="item"><div class="n">${a.a}</div><div class="t">${ref(a)}<small>${INT[S.mem[mk(a)].lvl]} кунлик босқич · ${S.mem[mk(a)].lapses} марта унутилган</small></div></div>`).join('')}</div>`;
    view.querySelector('#start').onclick = () => reviewSession(due, false);
  };
  function groupBySurah(list) {
    const by = {}; list.forEach(a => { (by[a.s] = by[a.s] || []).push(a); });
    return Object.keys(by).map(s => `<div class="item" onclick="go('surah',{n:${s}})"><div class="n">${s}</div><div class="t">${SUR[s - 1].uz}<small>${by[s].length} / ${SUR[s - 1].ayahs.length} оят</small></div><span>›</span></div>`).join('');
  }
  function reviewSession(items, free) {
    let i = 0; const results = [];
    const one = () => {
      if (i >= items.length) {
        const good = results.filter(q => q >= 3).length;
        view.innerHTML = `<div class="card center"><h2>Такрор тугади</h2><p>Эсланди: <b class="ok-text">${good}</b> · Унутилди: <b class="bad-text">${results.length - good}</b></p><button class="btn primary block" onclick="go('home')">Бош саҳифа</button></div>`;
        return;
      }
      const ay = items[i]; const prev = ay.a > 1 ? AY[ay.g - 2] : null;
      view.innerHTML = `<div class="row between"><span class="chip">${i + 1} / ${items.length}</span><span class="chip gold">${ref(ay)}</span></div><div class="spacer"></div>
        <div class="card">${prev ? `<p class="muted">Олдинги оят: <span class="ar" style="font-size:20px">${esc(prev.wt.slice(-4).join(' '))} …</span></p>` : ''}<p class="muted">Бу оятни ёддан ўқинг (${ay.wc} сўз):</p>
        <div class="ar" id="txt">${ayahHtml(ay, { hide: new Set(ay.wn.map((n, k) => n ? k : -1).filter(k => k >= 0)) })}</div>
        <div class="row" style="justify-content:center;margin-top:8px"><button class="btn primary" id="rev">👁️ Кўрсат</button><button class="btn" id="play">🔊</button></div>
        <div id="grades" hidden><p class="uz">${esc(ay.uz)}</p><p class="muted center">Қандай эсладингиз?</p><div class="grid2"><button class="btn bad" data-q="0">❌ Унутдим</button><button class="btn" data-q="3">😓 Қийин</button><button class="btn" data-q="4">🙂 Яхши</button><button class="btn ok" data-q="5">😎 Осон</button></div></div></div>`;
      view.querySelector('#rev').onclick = () => { view.querySelectorAll('#txt .w').forEach(w => w.classList.remove('hid')); view.querySelector('#grades').hidden = false; view.querySelector('#rev').hidden = true; };
      view.querySelectorAll('#txt .w.hid').forEach(w => w.onclick = () => w.classList.remove('hid'));
      view.querySelector('#play').onclick = () => playAyah(ay.g);
      view.querySelectorAll('#grades button').forEach(b => b.onclick = () => { const q = +b.dataset.q; if (!free || q < 3) grade(ay, q); results.push(q); i++; one(); });
    };
    one();
  }

  /* ---------- МАШҚЛАР ---------- */
  V.exercises = function () {
    setTitle('Машқлар');
    const grp = g => EX.LIST.filter(e => e.grp === g).map(e => `<div class="item" onclick="go('ex',{id:'${e.id}'})"><div class="n">${e.icon}</div><div class="t">${e.t}<small>${e.d}</small></div><span>›</span></div>`).join('');
    view.innerHTML = `<h1>Зеҳн ва кўз машқлари</h1><p class="muted">Ҳар куни 10–15 дақиқа. Машқлар ёдланган оятларингиз асосида тузилади (ҳали кам бўлса — 30-жуздан).</p>
      <h2>🧠 Зеҳн ва хотира</h2><div class="list">${grp('Зеҳн')}</div>
      <h2>👁️ Кўзни тез югуртириш</h2><p class="muted">Саҳифани тез «суратга олиш», сўзни бир қарашда илғаш ва кўз чарчамаслиги учун.</p><div class="list">${grp('Кўз')}</div>`;
  };
  V.ex = function ({ id }) { const e = EX.LIST.find(x => x.id === id); setTitle(e.t); view.innerHTML = '<div id="exBox"></div>'; EX[id](view.querySelector('#exBox')); };

  /* ---------- ЯНА ---------- */
  V.more = function () {
    setTitle('Яна');
    view.innerHTML = `<h1>Бўлимлар</h1><div class="list">
      <div class="item" onclick="go('plan')"><div class="n">📅</div><div class="t">Режа<small>30 кунлик режа ва кунлар</small></div><span>›</span></div>
      <div class="item" onclick="go('mushaf')"><div class="n">📗</div><div class="t">Қуръон (тажвид рангли)<small>114 сура, таржима, аудио</small></div><span>›</span></div>
      <div class="item" onclick="go('check')"><div class="n">🎙️</div><div class="t">Ўқишни текшириш<small>Истаган оралиқни микрофон билан</small></div><span>›</span></div>
      <div class="item" onclick="go('methods')"><div class="n">💡</div><div class="t">Ёдлаш усуллари<small>Осон ёдлаш ва зеҳнни кучайтириш</small></div><span>›</span></div>
      <div class="item" onclick="go('tajweed')"><div class="n">🎨</div><div class="t">Тажвид қоидалари<small>Айман Сувайд услубида, ранглар изоҳи</small></div><span>›</span></div>
      <div class="item" onclick="go('stats')"><div class="n">📊</div><div class="t">Статистика<small>Ёдланганлар, кунлик фаоллик</small></div><span>›</span></div>
      <div class="item" onclick="V.settings()"><div class="n">⚙️</div><div class="t">Созламалар<small>Ҳарф ўлчами, қори, таржима</small></div><span>›</span></div>
    </div>`;
  };

  /* ---------- ҚУРЪОН ---------- */
  V.mushaf = function () {
    setTitle('Қуръон');
    view.innerHTML = `<h1>Қуръони Карим</h1><input id="q" placeholder="Сура номи ёки рақами..." class="srch"><div class="list" id="ls">${SUR.map(s => `<div class="item" onclick="go('surah',{n:${s.n}})"><div class="n">${s.n}</div><div class="t">${s.uz}<small>${s.type} · ${s.ayahs.length} оят · ${memCount(s.n)} ёдланган</small></div><span class="ar" style="font-size:22px">${esc(s.ar)}</span></div>`).join('')}</div>`;
    view.querySelector('#q').oninput = e => { const q = e.target.value.toLowerCase(); view.querySelectorAll('#ls .item').forEach(it => it.style.display = it.textContent.toLowerCase().includes(q) ? '' : 'none'); };
  };
  function memCount(s) { return SUR[s - 1].ayahs.reduce((n, _, i) => n + (S.mem[`${s}:${i + 1}`] ? 1 : 0), 0); }
  V.surah = function ({ n, a }) {
    const s = SUR[n - 1]; setTitle(`${n}. ${s.uz}`);
    const ays = AY.slice(H.firstG[n], H.firstG[n] + s.ayahs.length);
    view.innerHTML = `<div class="row between"><h1 style="margin:0">${s.uz} сураси</h1><span class="chip">${s.type} · ${ays.length} оят</span></div>
      <div class="row" style="margin:8px 0"><button class="btn sm" id="playAll">🔊 Сурани тинглаш</button><button class="btn sm" id="memAll">📖 Шу сурани ёдлаш</button><button class="btn sm" onclick="go('check',{s:${n},a:1,b:${Math.min(ays.length, 10)}})">🎙️ Текшириш</button><button class="btn sm ghost" id="leg">🎨 Ранглар</button></div>
      <div id="legend" hidden class="card"></div>
      ${n !== 1 && n !== 9 ? `<div class="card">${bismHtml()}</div>` : ''}
      <div class="list">${ays.map(x => `<div class="card" id="a${x.a}" style="margin:0"><div class="ar">${ayahHtml(x)}</div>${S.set.showUz ? `<p class="uz">${esc(x.uz)}</p>` : ''}<div class="row"><button class="btn sm" onclick="H.playAyah(${x.g})">🔊</button><button class="btn sm" onclick="go('train',{gs:[${ays.map(y => y.g)}],i:${x.a - 1}})">📖 Ёдлаш</button>${isMem(x) ? '<span class="chip ok">ёдланган</span>' : ''}<span class="chip muted">${x.page}-саҳ · ${x.juz}-жуз</span></div></div>`).join('')}</div>`;
    view.querySelector('#playAll').onclick = () => playList(ays.map(x => x.g), 1, g => { const el = document.getElementById('a' + AY[g - 1].a); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    view.querySelector('#memAll').onclick = () => go('train', { gs: ays.map(y => y.g), i: ays.findIndex(y => !isMem(y)) >= 0 ? ays.findIndex(y => !isMem(y)) : 0 });
    view.querySelector('#leg').onclick = () => { const l = view.querySelector('#legend'); l.hidden = !l.hidden; l.innerHTML = legendHtml(); };
    if (a) setTimeout(() => { const el = document.getElementById('a' + a); if (el) el.scrollIntoView({ block: 'center' }); }, 50);
  };
  function legendHtml() { return `<div class="legend">${Object.keys(TJ).map(k => `<div><i style="background:${TJ_COLORS[k]}"></i>${TJ[k].n}</div>`).join('')}</div>`; }

  /* ---------- ТЕКШИРИШ (оралиқ) ---------- */
  V.check = function ({ s, a, b }) {
    setTitle('Текшириш');
    s = s || 1; a = a || 1; b = b || SUR[s - 1].ayahs.length;
    view.innerHTML = `<h1>Ўқишни текшириш</h1><div class="card">
      <label>Сура</label><select id="s">${SUR.map(x => `<option value="${x.n}">${x.n}. ${x.uz}</option>`).join('')}</select>
      <div class="grid2"><div><label>Оятдан</label><input id="a" type="number" min="1" value="${a}"></div><div><label>Оятгача</label><input id="b" type="number" min="1" value="${b}"></div></div>
      <p class="muted">Микрофон режимида бир сафарда кўпи билан 30 оят. Икки хил текширув бўлади: <b>лаҳн жалий</b> (сўз/ҳарф хатоси — автоматик) ва <b>лаҳн хафий</b> (тажвид — қоидалар рўйхати бўйича).</p>
      <button class="btn primary block" id="go">Бошлаш</button></div><div id="area"></div>`;
    view.querySelector('#s').value = s;
    view.querySelector('#s').onchange = e => { view.querySelector('#b').value = Math.min(10, SUR[+e.target.value - 1].ayahs.length); view.querySelector('#a').value = 1; };
    view.querySelector('#go').onclick = () => {
      const sn = +view.querySelector('#s').value; const n = SUR[sn - 1].ayahs.length;
      let from = Math.max(1, Math.min(n, +view.querySelector('#a').value || 1)), to = Math.max(from, Math.min(n, +view.querySelector('#b').value || from));
      if (to - from > 29) { to = from + 29; toast('30 оятгача чекланди'); }
      const ays = AY.slice(H.firstG[sn] + from - 1, H.firstG[sn] + to);
      const area = view.querySelector('#area');
      area.innerHTML = `<div class="card"><p class="muted">${SUR[sn - 1].uz} ${from}–${to} (${ays.reduce((x, y) => x + y.wc, 0)} сўз)</p><div id="chk"></div></div><div id="res"></div>`;
      area.scrollIntoView({ behavior: 'smooth' });
      checkPanel(area.querySelector('#chk'), ays, res => {
        logToday('chk'); const t = todayStr(); S.log[t].best = Math.max(S.log[t].best || 0, res.score); save();
        const items = ays.flatMap(x => tjRules(x).map(r => ({ ...r, ay: x })));
        area.querySelector('#res').innerHTML = `<div class="card"><div class="score ${res.score >= 90 ? 'ok' : res.score >= 70 ? 'warn' : 'bad'}">${res.score}%</div><p class="center muted">Лаҳн жалий (сўз хатолари): ${res.bad + res.miss} та</p>
          ${res.score >= 90 && ays.some(x => !isMem(x)) ? `<button class="btn ok block" id="markAll">✅ Бу оятларни ёдланган деб белгилаш</button>` : ''}
          ${res.score < 70 && ays.some(isMem) ? `<button class="btn bad block" id="reset">↺ Ёдланганларни қайта ўрганишга қайтариш</button>` : ''}</div>
          <div class="card"><h3 style="margin-top:0">Тажвид текшируви (лаҳн хафий) — ${items.length} қоида</h3><p class="muted">Айман Сувайд услуби бўйича ҳар қоидани ўзингиз эшитиб баҳоланг. Қайси қоида хато бўлса, белгиламанг — илова уни сизга эслатиб туради.</p>
          <div class="tj-list">${items.map((it, k) => `<div class="tj-item"><input type="checkbox" data-k="${k}" checked><span class="ar"><span style="color:${TJ_COLORS[it.r]}">${esc(it.word)}</span></span><div class="d"><b style="color:${TJ_COLORS[it.r]}">${TJ[it.r].n}</b>${TJ[it.r].d}<br><small class="muted">${ref(it.ay)}</small></div></div>`).join('')}</div>
          <div class="spacer"></div><button class="btn primary block" id="tjSave">Тажвид натижасини сақлаш</button></div>`;
        const r = area.querySelector('#res');
        const ma = r.querySelector('#markAll'); if (ma) ma.onclick = () => { ays.forEach(markMem); toast('Белгиланди'); ma.remove(); };
        const rs = r.querySelector('#reset'); if (rs) rs.onclick = () => { ays.forEach(x => { if (isMem(x)) grade(x, 0); }); toast('Такрорга қайтарилди'); rs.remove(); };
        r.querySelector('#tjSave').onclick = () => {
          const wrong = items.filter((it, k) => !r.querySelector(`input[data-k="${k}"]`).checked);
          S.tjErr = S.tjErr || {}; wrong.forEach(it => { S.tjErr[it.r] = (S.tjErr[it.r] || 0) + 1; }); save();
          toast(wrong.length ? `${wrong.length} та тажвид хатоси қайд этилди` : 'Тажвид: ҳаммаси тўғри!');
        };
      });
    };
  };

  /* ---------- СТАТИСТИКА ---------- */
  V.stats = function () {
    setTitle('Статистика');
    const mem = memList(); const days = Array.from({ length: 14 }, (_, i) => addDays(todayStr(), -13 + i));
    const byJuz = {}; mem.forEach(a => byJuz[a.juz] = (byJuz[a.juz] || 0) + 1);
    const juzTotal = {}; AY.forEach(a => juzTotal[a.juz] = (juzTotal[a.juz] || 0) + 1);
    const tjErr = Object.entries(S.tjErr || {}).sort((x, y) => y[1] - x[1]);
    view.innerHTML = `<h1>Статистика</h1>
      <div class="grid3"><div class="stat"><b>${mem.length}</b><small>оят</small></div><div class="stat"><b>${new Set(mem.map(a => a.page)).size}</b><small>саҳифа (қисман)</small></div><div class="stat"><b>${streak()}</b><small>кун</small></div></div>
      <div class="card"><h3 style="margin-top:0">Охирги 14 кун</h3><table style="width:100%;font-size:13px;border-collapse:collapse"><tr><th align="left">Сана</th><th>Янги</th><th>Такрор</th><th>Машқ</th><th>Текшир</th></tr>${days.map(d => { const l = S.log[d] || {}; return `<tr style="border-top:1px solid var(--line)"><td>${d.slice(5)}</td><td align="center">${l.new || 0}</td><td align="center">${l.rev || 0}</td><td align="center">${l.ex || 0}</td><td align="center">${l.chk ? (l.best || 0) + '%' : '–'}</td></tr>`; }).join('')}</table></div>
      <div class="card"><h3 style="margin-top:0">Жузлар бўйича</h3>${Object.keys(byJuz).map(j => `<div class="row between" style="margin:4px 0"><span>${j}-жуз</span><span class="muted">${byJuz[j]} / ${juzTotal[j]}</span></div><div class="bar"><i style="width:${byJuz[j] / juzTotal[j] * 100}%"></i></div>`).join('') || '<p class="muted">Ҳали йўқ</p>'}</div>
      <div class="card"><h3 style="margin-top:0">Тез-тез хато бўладиган тажвид қоидалари</h3>${tjErr.length ? tjErr.map(([r, n]) => `<div class="row between"><span style="color:${TJ_COLORS[r]}"><b>${TJ[r].n}</b></span><span class="chip bad">${n}</span></div>`).join('') : '<p class="muted">Хато қайд этилмаган</p>'}</div>
      <div class="card"><h3 style="margin-top:0">Кўп унутиладиган оятлар</h3>${mem.filter(a => S.mem[mk(a)].lapses > 0).sort((x, y) => S.mem[mk(y)].lapses - S.mem[mk(x)].lapses).slice(0, 10).map(a => `<div class="row between"><span>${ref(a)}</span><span class="chip bad">${S.mem[mk(a)].lapses} марта</span></div>`).join('') || '<p class="muted">Йўқ</p>'}</div>`;
  };

  /* ---------- СОЗЛАМАЛАР ---------- */
  V.settings = function () {
    modal(`<h2 style="margin-top:0">Созламалар</h2>
      <label>Исмингиз</label><input id="nm" value="${esc(S.set.name)}">
      <label>Араб ҳарфи ўлчами: <span id="szv">${S.set.arSize}</span></label><input id="sz" type="range" min="20" max="48" value="${S.set.arSize}">
      <label>Қори</label><select id="rc"><option value="ar.alafasy">Мишарий Рошид Афасий</option><option value="ar.husary">Маҳмуд Халил Ҳусарий</option><option value="ar.abdulbasitmurattal">Абдулбосит (мураттал)</option><option value="ar.minshawi">Муҳаммад Сиддиқ Миншовий</option><option value="ar.hudhaify">Али Ҳузайфий</option></select>
      <label>Ҳар оятни неча марта ўқиш (1-босқич)</label><input id="rn" type="number" min="1" max="30" value="${S.set.repeatN}">
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="uz" ${S.set.showUz ? 'checked' : ''}> Таржимани кўрсатиш</label>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="tj" ${S.set.tj ? 'checked' : ''}> Тажвид рангларини кўрсатиш</label>
      <div class="spacer"></div><button class="btn primary block" id="ok">Сақлаш</button><div class="spacer"></div>
      <div class="row"><button class="btn sm" id="exp">📤 Нусха олиш (экспорт)</button><button class="btn sm" id="imp">📥 Тиклаш (импорт)</button><button class="btn sm bad" id="rst">Ҳаммасини ўчириш</button></div>`, b => {
      b.querySelector('#rc').value = S.set.reciter;
      b.querySelector('#sz').oninput = e => b.querySelector('#szv').textContent = e.target.value;
      b.querySelector('#ok').onclick = () => { S.set.name = b.querySelector('#nm').value.trim(); S.set.arSize = +b.querySelector('#sz').value; S.set.reciter = b.querySelector('#rc').value; S.set.repeatN = Math.max(1, +b.querySelector('#rn').value || 5); S.set.showUz = b.querySelector('#uz').checked; S.set.tj = b.querySelector('#tj').checked; save(); applySettings(); closeModal(); render(); };
      b.querySelector('#exp').onclick = () => { const txt = JSON.stringify(S); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Нусха буферга олинди')).catch(() => prompt('Нусха олинг:', txt)); };
      b.querySelector('#imp').onclick = () => { const t = prompt('Экспорт матнини қўйинг:'); if (!t) return; try { const o = JSON.parse(t); Object.assign(S, o); save(); applySettings(); closeModal(); render(); toast('Тикланди'); } catch (e) { toast('Нотўғри матн'); } };
      b.querySelector('#rst').onclick = () => { if (confirm('Барча ёдлаш маълумотлари ўчирилади. Ишончингиз комилми?')) { localStorage.removeItem('hifz_state_v1'); location.reload(); } };
    });
  };

  /* ---------- ЁДЛАШ УСУЛЛАРИ ---------- */
  V.methods = function () {
    setTitle('Усуллар');
    view.innerHTML = `<h1>Осон ёдлаш ва зеҳнни кучайтириш</h1><div class="guide">
    <details open><summary>1. Ёдлашдан олдин тайёргарлик</summary><ul>
      <li><b>Ният ва поклик.</b> Таҳорат билан, қиблага қараб, ҳар сафар бир хил жойда ўтиринг — мия шу жойни «ёдлаш» билан боғлайди.</li>
      <li><b>Вақт.</b> Энг кучли вақт — бомдоддан кейин (зеҳн тоза, шовқин йўқ). Иккинчи вақт — уйқудан олдин (мия уйқуда мустаҳкамлайди).</li>
      <li><b>Бир хил мусҳаф.</b> Доим бир хил саҳифа жойлашувидан ўқинг: кўз хотираси саҳифани «суратга олади».</li>
      <li><b>Телефон.</b> Ёдлаш пайтида хабарларни ўчириб қўйинг. 25 дақиқа ёдлаш + 5 дақиқа дам (Помодоро).</li>
    </ul></details>
    <details open><summary>2. Бир оятни ёдлаш усули (илова шу тартибда олиб боради)</summary><ol>
      <li><b>Тинглаш (5–10 марта).</b> Қорининг қироатига қараб, кўз билан матнни кузатинг. Қулоқ оҳангни, кўз шаклни ёдлайди.</li>
      <li><b>Маъносини ўқиш.</b> Нима ҳақида эканини билиш — хотирага «илгак». Маъно билан ёдланган оят 3 баравар узоқ сақланади.</li>
      <li><b>Кўриб, овоз чиқариб 5–10 марта ўқиш.</b> Тажвид билан, шошмасдан. Тил мушак хотираси ҳосил қилади.</li>
      <li><b>Ярмини ёпиб ўқиш.</b> Кейин ҳаммасини ёпиб ўқиш. Қоқилган сўзни очиб, яна 3 марта такрорланг.</li>
      <li><b>Текшириш.</b> Кўрмасдан ўқиб, хатони белгиланг. 90% дан паст бўлса — 4-босқичга қайтинг. Фақат текширувдан ўтган оят «ёдланган» ҳисобланади.</li>
    </ol></details>
    <details><summary>3. Оятларни занжирлаш (боғлаш)</summary><p>Ҳар янги оятни олдингилар билан боғланг: 1 → 1-2 → 1-2-3 → ... Саҳифа охирида бутун саҳифани бошидан ўқинг. Илова ҳар 3 оятдан кейин «занжир» текширувини таклиф қилади.</p><p>Оятнинг охирги сўзи билан кейинги оятнинг биринчи сўзини алоҳида жуфт қилиб ёдланг — унутиш кўпинча оятлар орасида бўлади.</p></details>
    <details><summary>4. Такрорлаш — ҳифзнинг устуни</summary><ul>
      <li>Ёдланган оят такрорсиз 3 кунда учади. Илова оятни 1, 3, 7, 14, 30, 60 кундан кейин қайта сўрайди (оралиқли такрор).</li>
      <li><b>1:5 қоидаси.</b> 1 саҳифа янги ёдласангиз, 5 саҳифа эскисини такрорланг.</li>
      <li>Ёдлаганингизни намозда (айниқса кечки нафлларда) ўқинг — энг кучли мустаҳкамлаш.</li>
      <li>Ҳафтада бир кун «фақат такрор» куни қилинг.</li>
    </ul></details>
    <details><summary>5. Зеҳнни кучайтириш</summary><ul>
      <li><b>Уйқу 7–8 соат.</b> Хотира уйқуда «ёзилади». Уйқусиз ёдлаш — тешик идишга сув қуйиш.</li>
      <li><b>Сув ва озиқ.</b> Сувсизлик диққатни 20% га туширади. Ёнғоқ, асал, хурмо, балиқ, зайтун — мия учун фойдали.</li>
      <li><b>Ҳаракат.</b> Кунига 20–30 дақиқа юриш мияга қон оқимини оширади. Ёдлаш орасида юриб туринг.</li>
      <li><b>Диққат машқлари.</b> «Машқ» бўлимидаги Шульте жадвали, сўз занжири, рақам хотираси — кунига 10 дақиқа.</li>
      <li><b>Кўзни тез югуртириш.</b> Чақмоқ сўз ва пейсер машқлари сўзни бир қарашда илғашга ва саҳифани тез «суратга олиш»га ўргатади.</li>
      <li><b>Гуноҳлардан сақланиш.</b> Имом Шофеъий: «Илм — нур, Аллоҳнинг нури эса осийга берилмайди».</li>
      <li><b>Дуо.</b> «Раббий зидний илман» (Тоҳа, 114) — ҳар ўтиришдан олдин.</li>
    </ul></details>
    <details><summary>6. Қийин оятлар учун</summary><ul>
      <li>Ўхшаш оятларни (муташобиҳот) ёнма-ён ёзиб, фарқини белгиланг.</li>
      <li>Қийин оятни қоғозга 3 марта ёзинг — қўл хотираси қўшилади.</li>
      <li>Оятни бўлакларга бўлинг (вақф белгиларида), ҳар бўлакни алоҳида ёдлаб, кейин бирлаштиринг.</li>
      <li>Оятни бировга (онангиз, фарзандингиз, дўстингиз) ўқиб беринг ва кузатишини сўранг.</li>
    </ul></details>
    <details><summary>7. 30 кунлик режа ҳақида ҳалол гап</summary><p>Бутун Қуръон (604 саҳифа) ни 30 кунда ёдлаш — кунига 20 саҳифа. Бу тарихда жуда кам кишига насиб қилган ва кунига 8–10 соат, фақат такрор билан яшашни талаб қилади. Шунинг учун илова режани ўзингиз танлашингизга имкон беради: масалан, 30-жузни 30 кунда (кунига ~1 саҳифа) ёки бутун Қуръонни 1–2 йилда. Асосийси — <b>ҳар куни узлуксиз</b> ва <b>такрор</b>. Қуръоннинг ўзи айтади: «Биз Қуръонни эслаш учун осон қилдик, бас, эслайдиган борми?» (Қамар, 17).</p></details>
    </div>`;
  };

  /* ---------- ТАЖВИД ҚЎЛЛАНМАСИ ---------- */
  V.tajweed = function () {
    setTitle('Тажвид');
    view.innerHTML = `<h1>Тажвид қоидалари</h1><p class="muted">Ҳафс ривояти (Шотибия йўли). Тузилиш шайх Айман Рушдий Сувайднинг «Итқон тиловатил Қуръон» дарслари тартибида берилган. Матн ранглари ҳар бир қоидани кўрсатади:</p>
    <div class="card">${legendHtml()}</div><div class="guide">
    <details open><summary>1. Лаҳн (хато) турлари</summary><ul><li><b>Лаҳн жалий</b> — очиқ хато: ҳарфни алмаштириш, ҳаракатни ўзгартириш, ҳарф қўшиш/тушириш. Бу ҳаром — илова микрофон орқали шуни аниқлайди.</li><li><b>Лаҳн хафий</b> — яширин хато: маддни кам/кўп чўзиш, ғуннани тушириб қолдириш, тафхим/тарқиқ, қалқаласиз ўқиш. Илова ҳар оят учун қоидалар рўйхатини кўрсатади — сиз ўзингизни эшитиб баҳолайсиз.</li></ul></details>
    <details><summary>2. Махорижул ҳуруф — ҳарф чиқиш жойлари (17 маҳраж)</summary><ul>
      <li><b>Жавф (оғиз бўшлиғи):</b> мадд ҳарфлари — ا و ي (сукунли, олдида мос ҳаракат).</li>
      <li><b>Ҳалқ (томоқ):</b> энг пасти — ء ه, ўртаси — ع ح, юқориси — غ خ.</li>
      <li><b>Лисон (тил):</b> тил илдизи — ق (танглайнинг юмшоқ қисми), ك (бироз олдинроқ); тил ўртаси — ج ش ي; тил чети — ض (озиқ тишлар); тил учи — ل ن ر (танглай олди); ط د ت (юқори курак тишлар илдизи); ص س ز (пастки курак тишлар); ظ ذ ث (юқори тишлар учи).</li>
      <li><b>Шафатайн (лаблар):</b> ف (пастки лаб + юқори тишлар), ب م و (икки лаб).</li>
      <li><b>Хайшум (бурун):</b> ғунна.</li></ul><p class="muted">Айман Сувайд услуби: ҳар ҳарфни сукун билан, олдига ҳамза қўйиб айтиб (أبْ، أتْ) маҳражини ҳис қилинг.</p></details>
    <details><summary>3. Сифатул ҳуруф — ҳарф сифатлари</summary><ul>
      <li><b>Ҳамс / Жаҳр:</b> нафас оқади (فحثه شخص سكت) / нафас тўхтайди.</li>
      <li><b>Шидда / Тавассут / Рахова:</b> овоз тўхтайди (أجد قط بكت) / ўрта (لن عمر) / овоз оқади (қолганлари).</li>
      <li><b>Истиъло / Истифол:</b> тил юқорига кўтарилади — خص ضغط قظ (йўғон ўқилади) / пастда қолади (ингичка).</li>
      <li><b>Итбоқ:</b> ص ض ط ظ — тил танглайга ёпишади, энг йўғон ҳарфлар.</li>
      <li><b>Қалқала:</b> قطب جد — сукунда титраш. <b>Сафир:</b> ص س ز — ҳуштак. <b>Такрир:</b> ر — титраш (ортиқча эмас!). <b>Тафашший:</b> ش — ёйилиш. <b>Иститола:</b> ض — чўзилиш. <b>Лин:</b> сукунли و ي фатҳадан кейин. <b>Инҳироф:</b> ل ر.</li></ul></details>
    <details><summary>4. Нун сокина ва танвин аҳкомлари</summary><ul>
      <li><b>Изҳор:</b> ء ه ع ح غ خ дан олдин — нун очиқ, ғуннасиз.</li>
      <li><b>Идғом:</b> ي ر م ل و ن дан олдин. ينمو билан ғунна бор, ل ر билан ғунна йўқ. (Бир сўз ичида идғом йўқ: دنيا، صنوان.)</li>
      <li><b>Иқлоб:</b> ب дан олдин нун → мим, лаблар енгил юмилади, ғунна 2 ҳаракат.</li>
      <li><b>Ихфо:</b> қолган 15 ҳарф. Нун маҳражга тегмайди, ғунна 2 ҳаракат; кейинги ҳарф йўғон бўлса, ғунна ҳам йўғонроқ.</li></ul></details>
    <details><summary>5. Мим сокина аҳкомлари</summary><ul><li><b>Ихфо шафавий:</b> م + ب — лаблар енгил, ғунна.</li><li><b>Идғом шафавий:</b> م + م — ташдид каби, ғунна.</li><li><b>Изҳор шафавий:</b> қолган ҳарфлар — очиқ; айниқса ف ва و олдида эҳтиёт бўлинг (ихфо қилманг).</li></ul></details>
    <details><summary>6. Ғунна даражалари</summary><p>Энг кучли: ташдидли ن م ва идғом → ихфо ва иқлоб → сукунли изҳор → ҳаракатли ن م (энг кучсиз). Ташдидли ғунна — 2 ҳаракат, кам ҳам, кўп ҳам эмас.</p></details>
    <details><summary>7. Мадд турлари ва миқдорлари (ҳаракат)</summary><ul>
      <li><b>Табиий (аслий)</b> — 2. Сўз охирида ҳам, ўртасида ҳам.</li>
      <li><b>Бадал</b> (ҳамзадан кейин мадд: آمن) — 2. <b>Иваз</b> (танвин фатҳага вақф: عليمًا → عليما) — 2. <b>Сила суғро</b> (ҳаракатли ҳа замири: لهُ) — 2.</li>
      <li><b>Вожиб муттасил</b> (мадд + ҳамза бир сўзда: جاء) — 4 ёки 5, вақфда 6 гача.</li>
      <li><b>Жоиз мунфасил</b> (мадд сўз охири + ҳамза кейинги сўз боши: بما أنزل) — 4 ёки 5 (бутун хатмда бир хил танланг).</li>
      <li><b>Сила кубро</b> (ҳа замири + ҳамза) — мунфасил каби 4–5.</li>
      <li><b>Лозим</b> (мадд + асл сукун/ташдид: الضالّين، الم) — 6. Тўрт тури: калимий мусаққал/мухаффаф, ҳарфий мусаққал/мухаффаф.</li>
      <li><b>Ориз лис-сукун</b> (вақф сабабли сукун: العالمين) — 2, 4 ёки 6 (бир хил танланг).</li>
      <li><b>Лин</b> (сукунли و ي фатҳадан кейин, вақфда: البيت) — 2, 4 ёки 6.</li></ul><p class="muted">Ҳаракат = бир бармоқни оддий тезликда букиб ёки ёзиш вақти. Айман Сувайд: мадд миқдорини «секундлар» билан эмас, ўқиш тезлигига нисбатан ҳаракат билан ўлчанг.</p></details>
    <details><summary>8. Тафхим ва тарқиқ</summary><ul><li><b>Истиъло ҳарфлари</b> (خص ضغط قظ) доим йўғон. Даражалари: фатҳа+алиф > фатҳа > замма > сукун > касра.</li><li><b>Ро:</b> фатҳа/замма билан — йўғон; касра билан — ингичка; сукунли бўлса — олдинги ҳаракатга қарайди (касрадан кейин ингичка, лекин кейинида истиъло ҳарфи бўлса йўғон: قرطاس). Истисно: فِرْق (икки хил).</li><li><b>Лом:</b> фақат «Аллоҳ» лафзида, олдида фатҳа/замма бўлса йўғон; касра бўлса ингичка (بسم الله).</li><li><b>Алиф:</b> ўзидан олдинги ҳарфга эргашади.</li></ul></details>
    <details><summary>9. Қалқала даражалари</summary><p><b>Суғро</b> — сўз ўртасида (يقطعون). <b>Кубро</b> — вақф қилинган сўз охирида (أحد → أحدْ). <b>Акбар</b> — вақфда ташдидли (الحقّ). Қалқала фатҳага ҳам, касрага ҳам мойил эмас — соф титраш.</p></details>
    <details><summary>10. Вақф ва ибтидо, аломатлар</summary><ul><li><b>ۘ</b> (م) — вақф лозим; <b>ۚ</b> (ج) — вақф жоиз; <b>ۖ</b> (صلى) — улаш афзал; <b>ۗ</b> (قلى) — тўхташ афзал; <b>ۙ</b> (لا) — тўхтама; <b>ۛ ۛ</b> — иккисидан бирида тўхта.</li><li>Вақфда: ҳаракат сукунга айланади; танвин фатҳа → алиф (2 ҳаракат); та марбута → ҳа сокина; ташдид сақланади.</li><li>Ибтидо: ҳамзатул васл билан бошланганда — феълда учинчи ҳарф заммали бўлса замма, акс ҳолда касра; «ال» да фатҳа; исмларда касра.</li></ul></details>
    <details><summary>11. Ҳафс ривоятининг махсус ўринлар</summary><ul><li>Сакта (нафассиз қисқа тўхташ) 4 жойда: Каҳф 1–2 (عوجا ۜ قيما), Ёсин 52 (مرقدنا ۜ هذا), Қиёмат 27 (من ۜ راق), Мутаффифун 14 (بل ۜ ران).</li><li>Имола: Ҳуд 41 (مجراها) — «ро» касрага мойил.</li><li>Ташҳил: Фуссилат 44 (ءأعجمي) — иккинчи ҳамза енгил.</li><li>Ишмом: Юсуф 11 (تأمنا) — лабларни замма шаклига келтириш.</li><li>Намл 36 (آتان) ва Исро 11 каби сўзларда ёй ҳукмларига эътибор.</li></ul></details>
    </div>`;
  };

  /* ---------- Бошланғич ---------- */
  stack = [{ name: 'home' }]; render();
})();
