(() => {
  'use strict';

  const SIZE = 720;
  const PAPER = '#fffaf8';
  const NTFY = 'https://ntfy.sh';
  const STORE_KEY = 'couples-app:v1';
  const COLORS = ['#e11d48', '#f97316', '#eab308', '#16a34a', '#2563eb', '#7c3aed', '#1f2937'];
  const WIDTHS = [6, 14, 28];
  const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

  const $ = (id) => document.getElementById(id);
  const canvas = $('canvas');
  const ctx = canvas.getContext('2d');

  // --- bez zumiranja prstima (iOS Safari ignoriše user-scalable=no) ---
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
    document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
  });
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // --- pohrana (localStorage može biti nedostupan) ---
  let memory = null;
  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignorisano */ }
    return memory;
  }
  function saveConfig(cfg) {
    memory = cfg;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cfg)); } catch (_) { /* ignorisano */ }
  }

  let config = loadConfig();
  let color = COLORS[0];
  let width = WIDTHS[1];
  let strokes = [];
  let current = null;

  // --- pomoćne funkcije ---
  function makeCode() {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  }
  function validCode(code) { return /^[a-z0-9]{12,40}$/.test(code); }
  function topicFor(cfg, role) { return `cpl-${cfg.code}-${role}`; }
  function otherRole(role) { return role === 'a' ? 'b' : 'a'; }
  // HTTP zaglavlja moraju biti ASCII.
  function ascii(text, fallback) {
    const clean = String(text || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^\x20-\x7e]/g, '').trim().slice(0, 30);
    return clean || fallback;
  }
  function setStatus(el, text, kind) {
    el.textContent = text || '';
    el.className = 'status' + (kind ? ' ' + kind : '');
  }

  // --- crtanje ---
  function drawStroke(s) {
    const p = s.points;
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (p.length === 1) {
      ctx.beginPath();
      ctx.arc(p[0][0], p[0][1], s.width / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2;
      const my = (p[i][1] + p[i + 1][1]) / 2;
      ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
    }
    const last = p[p.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
  }
  function redraw() {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (const s of strokes) drawStroke(s);
    if (current) drawStroke(current);
  }
  function pointFrom(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * (SIZE / r.width), (e.clientY - r.top) * (SIZE / r.height)];
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    current = { color, width, points: [pointFrom(e)] };
    redraw();
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!current) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (events.length ? events : [e])) current.points.push(pointFrom(ev));
    redraw();
    e.preventDefault();
  });
  function endStroke() {
    if (!current) return;
    strokes.push(current);
    current = null;
    redraw();
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  // --- alati ---
  function buildTools() {
    const colors = $('colors');
    COLORS.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.style.background = c;
      b.setAttribute('aria-label', 'Boja ' + c);
      b.setAttribute('aria-pressed', String(c === color));
      b.addEventListener('click', () => {
        color = c;
        colors.querySelectorAll('.swatch').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
      colors.appendChild(b);
    });
    const widths = $('widths');
    WIDTHS.forEach((w, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'width';
      b.setAttribute('aria-label', 'Debljina ' + (i + 1));
      b.setAttribute('aria-pressed', String(w === width));
      const dot = document.createElement('i');
      const px = Math.max(4, Math.round(w * 0.8));
      dot.style.width = dot.style.height = px + 'px';
      b.appendChild(dot);
      b.addEventListener('click', () => {
        width = w;
        widths.querySelectorAll('.width').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
      widths.appendChild(b);
    });
  }

  $('undo').addEventListener('click', () => { strokes.pop(); redraw(); });

  let clearArmed = false;
  let clearTimer = 0;
  $('clear').addEventListener('click', () => {
    const btn = $('clear');
    if (!clearArmed) {
      clearArmed = true;
      btn.textContent = 'Sigurno?';
      clearTimer = window.setTimeout(() => { clearArmed = false; btn.textContent = 'Obriši sve'; }, 2500);
      return;
    }
    window.clearTimeout(clearTimer);
    clearArmed = false;
    btn.textContent = 'Obriši sve';
    strokes = [];
    redraw();
  });

  // --- slanje ---
  function toBlob() {
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Slika nije napravljena.'))), 'image/png');
    });
  }

  async function ntfyPut(topic, body, headers) {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(`${NTFY}/${topic}`, { method: 'PUT', body, headers, signal: ctrl.signal });
      if (!res.ok) throw new Error('Server je odgovorio sa statusom ' + res.status + '.');
      return res;
    } finally {
      window.clearTimeout(timer);
    }
  }

  const drawStatus = $('draw-status');

  $('send').addEventListener('click', async () => {
    if (!config) return;
    if (!strokes.length) { setStatus(drawStatus, 'Prvo nešto nacrtaj.', 'warn'); return; }
    const btn = $('send');
    btn.disabled = true;
    setStatus(drawStatus, 'Šaljem…');
    try {
      const blob = await toBlob();
      await ntfyPut(topicFor(config, otherRole(config.role)), blob, {
        Filename: 'crtez.png',
        Title: 'Crtez od ' + ascii(config.name, 'partnera'),
        Tags: 'heart',
        Priority: '4'
      });
      setStatus(drawStatus, 'Poslano.', 'ok');
    } catch (err) {
      const msg = err && err.name === 'AbortError' ? 'Isteklo je vrijeme čekanja.' : (err && err.message) || 'Greška.';
      setStatus(drawStatus, 'Slanje nije uspjelo: ' + msg + ' Probaj "Podijeli (iMessage)".', 'err');
    } finally {
      btn.disabled = false;
    }
  });

  $('share').addEventListener('click', async () => {
    try {
      if (!strokes.length) { setStatus(drawStatus, 'Prvo nešto nacrtaj.', 'warn'); return; }
      const blob = await toBlob();
      const file = new File([blob], 'crtez.png', { type: 'image/png' });
      if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
        setStatus(drawStatus, 'Ovaj preglednik ne podržava dijeljenje slike.', 'err');
        return;
      }
      await navigator.share({ files: [file], title: 'Crtež' });
      setStatus(drawStatus, '');
    } catch (err) {
      if (err && err.name === 'AbortError') { setStatus(drawStatus, ''); return; }
      setStatus(drawStatus, 'Dijeljenje nije uspjelo: ' + ((err && err.message) || 'greška') + '.', 'err');
    }
  });

  // --- postavke ---
  const form = $('settings-form');
  const settingsStatus = $('settings-status');

  function refreshTopics() {
    const code = $('code').value.trim().toLowerCase();
    const role = form.elements.role.value;
    const box = $('topics');
    if (validCode(code)) {
      $('topic-in').textContent = topicFor({ code }, role);
      box.hidden = false;
    } else {
      box.hidden = true;
    }
  }

  function showScreen(name) {
    $('screen-settings').hidden = name !== 'settings';
    $('screen-draw').hidden = name !== 'draw';
    const btn = $('open-settings');
    btn.hidden = name === 'settings' && !config;
    btn.textContent = name === 'settings' ? 'Nazad' : 'Postavke';
    if (name === 'draw') redraw();
  }

  function fillSettings() {
    $('name').value = (config && config.name) || '';
    $('code').value = (config && config.code) || makeCode();
    form.elements.role.value = (config && config.role) || 'a';
    refreshTopics();
  }

  $('open-settings').addEventListener('click', () => {
    if (!$('screen-settings').hidden) { showScreen('draw'); return; }
    fillSettings();
    showScreen('settings');
  });
  $('gen-code').addEventListener('click', () => { $('code').value = makeCode(); refreshTopics(); });
  $('code').addEventListener('input', refreshTopics);
  Array.from(form.querySelectorAll('input[name="role"]')).forEach((r) => r.addEventListener('change', refreshTopics));

  $('copy-topic').addEventListener('click', async () => {
    const text = $('topic-in').textContent;
    try {
      await navigator.clipboard.writeText(text);
      setStatus(settingsStatus, 'Kopirano.', 'ok');
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents($('topic-in'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      setStatus(settingsStatus, 'Označeno, kopiraj ručno.', 'warn');
    }
  });

  function readForm() {
    const code = $('code').value.trim().toLowerCase();
    const name = $('name').value.trim();
    const role = form.elements.role.value === 'b' ? 'b' : 'a';
    if (!name) throw new Error('Upiši ime.');
    if (!validCode(code)) throw new Error('Kod mora imati 12 do 40 malih slova i brojeva.');
    return { name, code, role };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      config = readForm();
    } catch (err) {
      setStatus(settingsStatus, err.message, 'err');
      return;
    }
    saveConfig(config);
    setStatus(settingsStatus, '');
    showScreen('draw');
  });

  $('test-self').addEventListener('click', async () => {
    let cfg;
    try { cfg = readForm(); } catch (err) { setStatus(settingsStatus, err.message, 'err'); return; }
    setStatus(settingsStatus, 'Šaljem test…');
    try {
      await ntfyPut(topicFor(cfg, cfg.role), 'Test iz Couples App. Ako ovo vidiš, notifikacije rade.', {
        Title: 'Couples App test',
        Tags: 'white_check_mark'
      });
      setStatus(settingsStatus, 'Test poslan. Provjeri ntfy aplikaciju.', 'ok');
    } catch (err) {
      setStatus(settingsStatus, 'Test nije uspio: ' + ((err && err.message) || 'greška'), 'err');
    }
  });

  // --- pokretanje ---
  buildTools();
  redraw();
  if (config && validCode(config.code)) {
    showScreen('draw');
  } else {
    config = null;
    fillSettings();
    showScreen('settings');
  }
})();
