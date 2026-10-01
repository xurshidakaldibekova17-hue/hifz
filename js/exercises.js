/* ===== Зеҳн ва кўз машқлари ===== */
(function () {
  const { AY, SUR, S, esc, ayahHtml, wordHtml, shuffle, pick, ref, toast, logToday, memList, portions, currentPortionIdx, playAyah } = H;

  function pool() {
    let m = memList().filter(a => a.wc >= 3);
    if (m.length >= 8) return m;
    if (S.plan) { const p = portions()[currentPortionIdx()] || []; const pp = p.filter(a => a.wc >= 3); if (pp.length >= 8) return pp; }
    return AY.filter(a => a.s >= 78 && a.wc >= 3);
  }
  function finishBox(el, title, lines, again) {
    el.innerHTML = `<div class="card center"><h2>${title}</h2>${lines.map(l => `<p>${l}</p>`).join('')}<div class="row" style="justify-content:center;margin-top:10px"><button class="btn primary" id="again">Яна</button><button class="btn" id="backEx">Машқлар</button></div></div>`;
    el.querySelector('#again').onclick = again;
    el.querySelector('#backEx').onclick = () => go('exercises');
    logToday('ex'); S.xp += 5; H.save();
  }
  function quizFrame(el, i, n, body) {
    el.innerHTML = `<div class="card"><div class="row between"><span class="chip">${i + 1} / ${n}</span><span class="chip gold" id="sc"></span></div><div class="spacer"></div>${body}</div>`;
  }

  const EX = {};

  /* 1. Тушириб қолдирилган сўз */
  EX.missing = function (el) {
    const P = pool(); const N = 8; let i = 0, score = 0;
    const next = () => {
      if (i >= N) return finishBox(el, 'Натижа', [`Тўғри: <b>${score}</b> / ${N}`], () => EX.missing(el));
      const ay = pick(P); const idxs = ay.wn.map((n, k) => n ? k : -1).filter(k => k >= 0);
      const wi = pick(idxs); const answer = ay.wt[wi];
      const others = shuffle(AY.filter(a => a.s === ay.s && a !== ay).flatMap(a => a.wt.filter((t, k) => a.wn[k] && a.wn[k] !== ay.wn[wi]))).slice(0, 3);
      const choices = shuffle([answer, ...others]);
      quizFrame(el, i, N, `<p class="muted">${ref(ay)} — тушириб қолдирилган сўзни топинг</p><div class="ar">${ayahHtml(ay, { hide: new Set([wi]) })}</div><div class="choices" id="ch">${choices.map(c => `<div class="choice ar" style="font-size:24px;line-height:1.6">${esc(c)}</div>`).join('')}</div>`);
      el.querySelector('#sc').textContent = score;
      el.querySelectorAll('.choice').forEach(c => c.onclick = () => {
        const good = c.textContent === answer;
        c.classList.add(good ? 'ok' : 'bad'); if (good) score++; else el.querySelectorAll('.choice').forEach(x => { if (x.textContent === answer) x.classList.add('ok'); });
        el.querySelector('.w.hid').classList.remove('hid');
        el.querySelectorAll('.choice').forEach(x => x.onclick = null);
        i++; setTimeout(next, 1100);
      });
    };
    next();
  };

  /* 2. Кейинги оят */
  EX.next = function (el) {
    const P = pool().filter(a => a.g < AY.length && AY[a.g].s === a.s); const N = 8; let i = 0, score = 0;
    const next = () => {
      if (i >= N) return finishBox(el, 'Натижа', [`Тўғри: <b>${score}</b> / ${N}`], () => EX.next(el));
      const ay = pick(P); const ans = AY[ay.g];
      const others = shuffle(AY.filter(a => a.s === ay.s && a !== ans && a !== ay && a.wc >= 2)).slice(0, 3);
      const choices = shuffle([ans, ...others]);
      quizFrame(el, i, N, `<p class="muted">${ref(ay)} — кейинги оят қайси?</p><div class="ar">${ayahHtml(ay)}</div><div class="choices">${choices.map(c => `<div class="choice ar" data-g="${c.g}" style="font-size:22px;line-height:1.7">${ayahHtml(c, { num: false })}</div>`).join('')}</div>`);
      el.querySelector('#sc').textContent = score;
      el.querySelectorAll('.choice').forEach(c => c.onclick = () => {
        const good = +c.dataset.g === ans.g; c.classList.add(good ? 'ok' : 'bad'); if (good) score++;
        else el.querySelector(`.choice[data-g="${ans.g}"]`).classList.add('ok');
        el.querySelectorAll('.choice').forEach(x => x.onclick = null); i++; setTimeout(next, 1300);
      });
    };
    next();
  };

  /* 3. Қайси сура? */
  EX.which = function (el) {
    const P = pool(); const N = 8; let i = 0, score = 0;
    const next = () => {
      if (i >= N) return finishBox(el, 'Натижа', [`Тўғри: <b>${score}</b> / ${N}`], () => EX.which(el));
      const ay = pick(P); const sNums = [...new Set(P.map(a => a.s))].filter(s => s !== ay.s);
      const others = shuffle(sNums.length >= 3 ? sNums : [...new Set(AY.map(a => a.s))].filter(s => s !== ay.s)).slice(0, 3);
      const choices = shuffle([ay.s, ...others]);
      quizFrame(el, i, N, `<p class="muted">Бу оят қайси сурадан?</p><div class="ar">${ayahHtml(ay, { num: false })}</div><p class="uz">${esc(ay.uz)}</p><div class="choices">${choices.map(s => `<div class="choice ltr" data-s="${s}">${s}. ${SUR[s - 1].uz} сураси</div>`).join('')}</div>`);
      el.querySelector('#sc').textContent = score;
      el.querySelectorAll('.choice').forEach(c => c.onclick = () => {
        const good = +c.dataset.s === ay.s; c.classList.add(good ? 'ok' : 'bad'); if (good) score++;
        else el.querySelector(`.choice[data-s="${ay.s}"]`).classList.add('ok');
        el.querySelectorAll('.choice').forEach(x => x.onclick = null); i++; setTimeout(next, 1100);
      });
    };
    next();
  };

  /* 4. Жуфт топиш: оят ↔ маъно */
  EX.pairs = function (el) {
    const P = shuffle(pool().filter(a => a.wc <= 8 && a.uz.length < 90)).slice(0, 6);
    if (P.length < 6) { el.innerHTML = '<div class="card">Етарли оят йўқ.</div>'; return; }
    const cards = shuffle(P.flatMap((a, k) => [{ k, t: 'ar', html: `<span class="ar">${esc(a.ar)}</span>` }, { k, t: 'uz', html: esc(a.uz) }]));
    let open = [], found = 0, moves = 0; const t0 = Date.now();
    el.innerHTML = `<div class="card"><p class="muted">Оят ва унинг маъносини жуфтланг. Карточкани босинг.</p><div class="cards">${cards.map((c, i) => `<div class="mcard" data-i="${i}">?</div>`).join('')}</div><p class="muted center" id="mv">Юришлар: 0</p></div>`;
    el.querySelectorAll('.mcard').forEach(c => c.onclick = () => {
      const i = +c.dataset.i; if (c.classList.contains('open') || c.classList.contains('found') || open.length === 2) return;
      c.classList.add('open'); c.innerHTML = cards[i].html; open.push(i);
      if (open.length === 2) {
        moves++; el.querySelector('#mv').textContent = 'Юришлар: ' + moves;
        const [a, b] = open;
        if (cards[a].k === cards[b].k && cards[a].t !== cards[b].t) {
          found++; open = []; el.querySelectorAll('.mcard.open').forEach(x => { x.classList.remove('open'); x.classList.add('found'); });
          if (found === 6) setTimeout(() => finishBox(el, 'Баракалла!', [`Юришлар: <b>${moves}</b>`, `Вақт: <b>${Math.round((Date.now() - t0) / 1000)}</b> с`], () => EX.pairs(el)), 500);
        } else setTimeout(() => { el.querySelectorAll('.mcard.open').forEach(x => { x.classList.remove('open'); x.textContent = '?'; }); open = []; }, 900);
      }
    });
  };

  /* 5. Сўз занжири: тартибни эслаб қолиш */
  EX.chain = function (el, len) {
    len = len || (S.ex.chain || 4);
    const P = pool(); const seq = shuffle(P).slice(0, len).map(a => a.wt.find((t, k) => a.wn[k]));
    el.innerHTML = `<div class="card center"><p class="muted">${len} та сўзни тартиби билан эслаб қолинг</p><div class="ar center" id="seq" style="font-size:30px">${seq.map(esc).join(' • ')}</div><p class="counter" id="cd">5</p></div>`;
    let c = 5; const t = setInterval(() => {
      c--; el.querySelector('#cd').textContent = c;
      if (c <= 0) {
        clearInterval(t);
        const picked = []; const opts = shuffle(seq);
        el.innerHTML = `<div class="card"><p class="muted">Энди ўша тартибда босинг</p><div class="pool" id="pool">${opts.map((w, i) => `<span class="w ar" data-i="${i}" style="font-size:26px">${esc(w)}</span>`).join('')}</div><div class="ar center" id="out" style="min-height:50px;font-size:26px"></div></div>`;
        el.querySelectorAll('#pool .w').forEach(w => w.onclick = () => {
          const want = seq[picked.length];
          if (w.textContent === want) { picked.push(w.textContent); w.classList.add('used'); el.querySelector('#out').textContent = picked.join(' • '); if (picked.length === seq.length) { S.ex.chain = Math.min(9, len + 1); H.save(); finishBox(el, 'Тўғри!', [`Занжир узунлиги: <b>${len}</b>. Кейинги сафар ${Math.min(9, len + 1)} та.`], () => EX.chain(el)); } }
          else { w.classList.add('err'); setTimeout(() => w.classList.remove('err'), 400); S.ex.chain = Math.max(3, len - 1); H.save(); setTimeout(() => finishBox(el, 'Хато', [`Тўғри тартиб: <span class="ar" style="font-size:22px">${seq.map(esc).join(' • ')}</span>`], () => EX.chain(el)), 500); }
        });
      }
    }, 1000);
  };

  /* 6. Рақамлар хотираси */
  EX.digits = function (el, len) {
    len = len || (S.ex.digits || 4);
    const digits = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
    el.innerHTML = `<div class="card center"><p class="muted">Рақамларни эслаб қолинг (${len} та)</p><div class="big">${digits}</div><p class="counter" id="cd">${Math.max(2, Math.round(len * 0.7))}</p></div>`;
    let c = Math.max(2, Math.round(len * 0.7));
    const t = setInterval(() => {
      c--; el.querySelector('#cd').textContent = c;
      if (c <= 0) {
        clearInterval(t);
        el.innerHTML = `<div class="card center"><p class="muted">Рақамларни тескари эмас, кўрган тартибда киритинг</p><input id="inp" inputmode="numeric" style="font-size:28px;text-align:center;letter-spacing:4px"><div class="spacer"></div><button class="btn primary block" id="ok">Текшириш</button></div>`;
        const inp = el.querySelector('#inp'); inp.focus();
        const check = () => {
          const good = inp.value.trim() === digits;
          S.ex.digits = good ? Math.min(12, len + 1) : Math.max(3, len - 1); H.save();
          finishBox(el, good ? 'Тўғри!' : 'Хато', [`Рақам: <b>${digits}</b>`, good ? `Кейинги даража: ${S.ex.digits} та рақам` : `Сиз: ${esc(inp.value)}`], () => EX.digits(el));
        };
        el.querySelector('#ok').onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check(); };
      }
    }, 1000);
  };

  /* 7. Шульте жадвали — кўзни тез югуртириш */
  EX.schulte = function (el) {
    const nums = shuffle(Array.from({ length: 25 }, (_, i) => i + 1)); let need = 1; const t0 = Date.now();
    el.innerHTML = `<div class="card"><p class="muted">Кўзингизни марказдаги катакка қаратинг, бошингизни қимирлатмасдан 1 дан 25 гача тартиб билан топинг ва босинг. Периферик кўриш ривожланади.</p><div class="row between"><span class="chip" id="need">Топинг: 1</span><span class="chip gold" id="tm">0.0 с</span></div><div class="spacer"></div><div class="schulte">${nums.map(n => `<div data-n="${n}">${n}</div>`).join('')}</div></div>`;
    const tm = setInterval(() => { el.querySelector('#tm').textContent = ((Date.now() - t0) / 1000).toFixed(1) + ' с'; }, 100);
    el.querySelectorAll('.schulte div').forEach(c => c.onclick = () => {
      if (+c.dataset.n === need) {
        c.classList.add('done'); need++; el.querySelector('#need').textContent = 'Топинг: ' + need;
        if (need > 25) { clearInterval(tm); const sec = (Date.now() - t0) / 1000; const best = S.ex.schulte; if (!best || sec < best) S.ex.schulte = sec; H.save(); finishBox(el, 'Тайёр!', [`Вақт: <b>${sec.toFixed(1)}</b> с`, `Энг яхши: ${S.ex.schulte.toFixed(1)} с`, sec < 30 ? 'Аъло даража!' : sec < 45 ? 'Яхши, давом этинг.' : 'Ҳар куни 2–3 марта машқ қилинг.'], () => EX.schulte(el)); }
      } else { c.classList.add('err'); setTimeout(() => c.classList.remove('err'), 300); }
    });
  };

  /* 8. Чақмоқ сўз — тез кўриб илғаш */
  EX.flash = function (el) {
    const P = pool(); const N = 8; let i = 0, score = 0; let ms = S.ex.flash || 700;
    const next = () => {
      if (i >= N) { S.ex.flash = score >= 7 ? Math.max(150, ms - 100) : score <= 4 ? Math.min(1500, ms + 100) : ms; H.save(); return finishBox(el, 'Натижа', [`Тўғри: <b>${score}</b> / ${N}`, `Кўрсатиш вақти: ${ms} мс. Кейинги: ${S.ex.flash} мс`], () => EX.flash(el)); }
      const ay = pick(P); const idxs = ay.wn.map((n, k) => n && ay.wt[k].length >= 3 ? k : -1).filter(k => k >= 0);
      if (!idxs.length) return next();
      const wi = pick(idxs); const word = ay.wt[wi];
      const others = shuffle(ay.wt.filter((t, k) => ay.wn[k] && k !== wi)).slice(0, 3);
      while (others.length < 3) others.push(pick(pick(P).wt));
      const x = 15 + Math.random() * 60, y = 15 + Math.random() * 60;
      quizFrame(el, i, N, `<p class="muted">Нуқтага қаранг. Сўз бир лаҳза кўринади — уни топинг.</p><div class="flash-box" id="fb"><div class="dot"></div></div><div class="choices" id="ch" style="margin-top:10px;visibility:hidden">${shuffle([word, ...others]).map(c => `<div class="choice ar" style="font-size:24px;line-height:1.6">${esc(c)}</div>`).join('')}</div>`);
      el.querySelector('#sc').textContent = score;
      setTimeout(() => {
        const fb = el.querySelector('#fb'); if (!fb) return;
        fb.innerHTML = `<span class="ar" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%)">${esc(word)}</span>`;
        setTimeout(() => { fb.innerHTML = '<div class="dot"></div>'; el.querySelector('#ch').style.visibility = 'visible'; }, ms);
      }, 900);
      el.querySelectorAll('.choice').forEach(c => c.onclick = () => {
        const good = c.textContent === word; c.classList.add(good ? 'ok' : 'bad'); if (good) score++;
        el.querySelectorAll('.choice').forEach(x => { if (x.textContent === word) x.classList.add('ok'); x.onclick = null; });
        i++; setTimeout(next, 900);
      });
    };
    next();
  };

  /* 9. Кўз пейсери — оятни тезлик билан кўз югуртириб ўқиш */
  EX.pacer = function (el) {
    const P = pool().filter(a => a.wc >= 6);
    let wpm = S.ex.wpm || 60; let timer = null;
    const render = () => {
      const ay = pick(P);
      el.innerHTML = `<div class="card"><p class="muted">Сариқ белги сўзлар устидан юради — кўзингиз у билан бирга юрсин, овоз чиқармай ўқинг. Бу Қуръон саҳифасини тез «суратга олиш»га ўргатади.</p><div class="row between"><span class="chip">${ref(ay)}</span><span class="chip gold">${wpm} сўз/дақ</span></div><div class="spacer"></div><div class="ar pacer" id="txt">${ayahHtml(ay)}</div><div class="spacer"></div><div class="row" style="justify-content:center"><button class="btn sm" id="slow">− секин</button><button class="btn primary" id="start">Бошлаш</button><button class="btn sm" id="fast">+ тез</button></div><div class="spacer"></div><div class="row" style="justify-content:center"><button class="btn sm" id="hide">Матнни яшир</button><button class="btn sm" id="nextA">Бошқа оят</button></div></div>`;
      const ws = [...el.querySelectorAll('#txt .w')].filter(w => ay.wn[+w.dataset.i]);
      el.querySelector('#start').onclick = () => {
        clearInterval(timer); ws.forEach(w => w.classList.remove('cur', 'read')); let k = 0;
        timer = setInterval(() => { ws.forEach(w => w.classList.remove('cur')); if (k > 0) ws[k - 1].classList.add('read'); if (k >= ws.length) { clearInterval(timer); logToday('ex'); toast('Тайёр! Энди кўзни юмиб, оятни эсланг.'); return; } ws[k].classList.add('cur'); k++; }, 60000 / wpm);
      };
      el.querySelector('#slow').onclick = () => { wpm = Math.max(20, wpm - 10); S.ex.wpm = wpm; H.save(); render(); };
      el.querySelector('#fast').onclick = () => { wpm = Math.min(300, wpm + 10); S.ex.wpm = wpm; H.save(); render(); };
      el.querySelector('#hide').onclick = () => { ws.forEach(w => w.classList.toggle('hid')); };
      el.querySelector('#nextA').onclick = () => { clearInterval(timer); render(); };
    };
    render();
  };

  /* 10. Кўз ҳаракати — нуқтани кузатиш */
  EX.eyemove = function (el) {
    let timer = null, n = 0; const N = 30;
    el.innerHTML = `<div class="card"><p class="muted">Бошни қимирлатмай, фақат кўз билан нуқтани кузатинг. Кўз мушаклари чаққонлашади, саҳифада сўзни тез топиш осонлашади.</p><div class="eye-area" id="area"><div class="eye-dot" id="dot" style="left:50%;top:50%"></div></div><p class="center muted" id="cnt">0 / ${N}</p><div class="row" style="justify-content:center"><button class="btn primary" id="go">Бошлаш</button></div></div>`;
    const dot = el.querySelector('#dot');
    const pattern = ['lr', 'ud', 'diag', 'rand'];
    el.querySelector('#go').onclick = () => {
      clearInterval(timer); n = 0;
      timer = setInterval(() => {
        const p = pattern[Math.floor(n / 8) % pattern.length]; let x, y;
        if (p === 'lr') { x = n % 2 ? 90 : 5; y = 45; } else if (p === 'ud') { x = 45; y = n % 2 ? 85 : 5; } else if (p === 'diag') { x = n % 2 ? 90 : 5; y = n % 2 ? 85 : 5; } else { x = 5 + Math.random() * 85; y = 5 + Math.random() * 80; }
        dot.style.left = x + '%'; dot.style.top = y + '%'; n++; el.querySelector('#cnt').textContent = `${n} / ${N}`;
        if (n >= N) { clearInterval(timer); finishBox(el, 'Тайёр!', ['Кўзни 10 сония юмиб дам беринг.'], () => EX.eyemove(el)); }
      }, 700);
    };
  };

  EX.LIST = [
    { id: 'missing', t: 'Тушган сўз', d: 'Оятдаги яширин сўзни топинг', icon: '🧩', grp: 'Зеҳн' },
    { id: 'next', t: 'Кейинги оят', d: 'Оятлар занжирини мустаҳкамлайди', icon: '⛓️', grp: 'Зеҳн' },
    { id: 'which', t: 'Қайси сура?', d: 'Оятни сурага боғлаш', icon: '📍', grp: 'Зеҳн' },
    { id: 'pairs', t: 'Жуфт топиш', d: 'Оят ↔ маъно, хотира карточкалари', icon: '🃏', grp: 'Зеҳн' },
    { id: 'chain', t: 'Сўз занжири', d: 'Тартибни эслаб қолиш (ўсиб боради)', icon: '🔗', grp: 'Зеҳн' },
    { id: 'digits', t: 'Рақам хотираси', d: 'Қисқа муддатли хотира машқи', icon: '🔢', grp: 'Зеҳн' },
    { id: 'schulte', t: 'Шульте жадвали', d: 'Кўзни тез югуртириш, периферик кўриш', icon: '👁️', grp: 'Кўз' },
    { id: 'flash', t: 'Чақмоқ сўз', d: 'Бир лаҳзада сўзни илғаш', icon: '⚡', grp: 'Кўз' },
    { id: 'pacer', t: 'Кўз пейсери', d: 'Оятни тезлик билан кўз югуртириб ўқиш', icon: '🏃', grp: 'Кўз' },
    { id: 'eyemove', t: 'Кўз гимнастикаси', d: 'Нуқтани кузатиш, кўз мушаклари', icon: '🎯', grp: 'Кўз' }
  ];
  window.EX = EX;
})();
