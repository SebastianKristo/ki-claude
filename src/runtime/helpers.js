// Shadow-DOM ports of the prototype's helper scripts:
//  • image-slot.js  → <ImageSlot> (read-only; image from card config or the bundled photo)
//  • more-info.js   → long-press on [data-ent] opens Home Assistant's more-info
//                      (falls back to the design's own bottom sheet for unknown entities)
//  • glass-drag.js  → "liquid glass" lens when dragging across [data-glass-drag] rows
import React from 'react';
import BIL_PHOTO from '../assets/bil.webp';

const h = React.createElement;

export function makeExternals(ha) {
  function ImageSlot(p) {
    const imgs = ha.config.images || {};
    const src = imgs[p.id] || imgs[String(p.id || '').replace(/-v\d+/, '')] || p.src || (String(p.id).startsWith('bil') ? BIL_PHOTO : null);
    const radius = p.shape === 'circle' ? '50%' : p.shape === 'pill' ? '999px' : p.shape === 'rect' ? 0 : (p.radius || 12) + 'px';
    const frame = { position: 'absolute', inset: 0, overflow: 'hidden', background: 'rgba(127,127,127,.08)', borderRadius: radius };
    if (src) return h('div', { style: { display: 'block', position: 'relative', width: '100%', height: '100%' } }, h('div', { style: frame }, h('img', { src, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: p.fit || 'cover' } })));
    return h('div', { style: { display: 'block', position: 'relative', width: '100%', height: '100%', font: '13px/1.3 system-ui,-apple-system,sans-serif' } },
      h('div', { style: frame }),
      h('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', padding: 12, boxSizing: 'border-box' } },
        h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, style: { opacity: 0.45 } },
          h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }), h('circle', { cx: 9, cy: 10, r: 2 }), h('path', { d: 'M21 16l-5-5-9 9' })),
        h('div', { style: { maxWidth: '90%', fontWeight: 500, letterSpacing: '.01em', opacity: 0.75 } }, p.placeholder || 'Drop an image')));
  }
  return { 'image-slot': ImageSlot };
}

const slug = n => String(n || '').toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const closestIn = (e, sel) => { for (const n of e.composedPath()) { if (n.nodeType === 1 && n.matches && n.matches(sel)) return n; if (n === e.currentTarget) break; } return null; };

export function installMoreInfo(root, ha) {
  const entOf = el => el.dataset.ent || ((el.dataset.entDomain || 'sensor') + '.' + slug(el.dataset.entName || el.textContent.trim().slice(0, 30)));
  const ICON = { light: 'lightbulb', switch: 'toggle_on', climate: 'thermostat', person: 'person', lock: 'lock', cover: 'garage', media_player: 'cast', camera: 'videocam', vacuum: 'robot_2', alarm_control_panel: 'shield', sensor: 'sensors', todo: 'checklist', weather: 'partly_cloudy_day' };
  const SEL = '[data-ent],[data-ent-domain]';
  let t = null, sx = 0, sy = 0, fired = false, target = null;
  const css = (el, o) => { Object.assign(el.style, o); return el; };
  const mk = (tag, o, txt) => { const e = css(document.createElement(tag), o || {}); if (txt != null) e.textContent = txt; return e; };
  const close = () => { const o = root.getElementById('__mi'); if (o) o.remove(); };
  function sheet(el, ent) {
    const dom = ent.split('.')[0], name = el.dataset.entName || ent, state = el.dataset.entState || '';
    const wrap = mk('div', { position: 'fixed', inset: '0', zIndex: '9999', fontFamily: "'Space Grotesk',system-ui,sans-serif", color: '#fafafa' }); wrap.id = '__mi';
    const bg = mk('div', { position: 'absolute', inset: '0', background: 'rgba(0,0,0,0.55)' }); bg.onclick = close;
    const sh = mk('div', { position: 'absolute', left: '0', right: '0', bottom: '0', maxWidth: '420px', margin: '0 auto', boxSizing: 'border-box', padding: '12px 18px calc(28px + env(safe-area-inset-bottom))', borderRadius: '32px 32px 0 0', background: '#2f2f2f', boxShadow: '0 -20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '14px', transform: 'translateY(30px)', opacity: '0', transition: 'transform .3s cubic-bezier(.34,1.3,.64,1), opacity .2s' });
    sh.appendChild(mk('div', { width: '40px', height: '5px', borderRadius: '3px', background: '#545454', alignSelf: 'center' }));
    const hd = mk('div', { display: 'flex', alignItems: 'center', gap: '12px' });
    const ic = mk('span', { width: '48px', height: '48px', borderRadius: '24px', flex: 'none', display: 'grid', placeItems: 'center', background: '#3a3a3a' }); ic.appendChild(mk('span', { fontFamily: "'Material Symbols Rounded'", fontSize: '24px', fontVariationSettings: "'FILL' 1" }, ICON[dom] || 'info'));
    const tx = mk('div', { flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '2px' }); tx.appendChild(mk('span', { fontSize: '18px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, name)); tx.appendChild(mk('span', { fontSize: '12px', color: '#979797', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, ent));
    const x = mk('button', { width: '40px', height: '40px', borderRadius: '20px', border: '0', background: '#3a3a3a', color: '#fafafa', cursor: 'pointer', display: 'grid', placeItems: 'center' }); x.appendChild(mk('span', { fontFamily: "'Material Symbols Rounded'", fontSize: '20px' }, 'close')); x.onclick = close;
    hd.append(ic, tx, x); sh.appendChild(hd);
    if (state) sh.appendChild(mk('div', { fontSize: '40px', fontWeight: '300', letterSpacing: '-0.03em', lineHeight: '1' }, state));
    const rows = mk('div', { display: 'flex', flexDirection: 'column', padding: '4px 14px', borderRadius: '18px', background: '#232323' });
    [['Domene', dom], ['Entitets-ID', ent], ['Status', 'Ikke funnet i Home Assistant']].forEach(([k, v], i) => { const r = mk('div', { display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '11px 0', borderTop: i ? '1px solid rgba(255,255,255,0.06)' : 'none', fontSize: '13px' }); r.append(mk('span', { color: '#979797' }, k), mk('span', { fontWeight: '500', textAlign: 'right', wordBreak: 'break-all' }, v)); rows.appendChild(r); });
    sh.appendChild(rows);
    wrap.append(bg, sh); root.appendChild(wrap);
    requestAnimationFrame(() => css(sh, { transform: 'translateY(0)', opacity: '1' }));
  }
  function open(el) {
    close();
    const ent = entOf(el);
    if (ha.hass && ha.hass.states[ent]) ha.moreInfo(ent);
    else sheet(el, ent);
  }
  const cancel = () => { clearTimeout(t); t = null; };
  root.addEventListener('pointerdown', e => { if (e.button) return; const el = closestIn(e, SEL); if (!el || closestIn(e, '#__mi')) return; fired = false; target = el; sx = e.clientX; sy = e.clientY; cancel(); t = setTimeout(() => { fired = true; navigator.vibrate && navigator.vibrate(18); open(target); }, 520); }, true);
  root.addEventListener('pointermove', e => { if (t && (Math.abs(e.clientX - sx) > 8 || Math.abs(e.clientY - sy) > 8)) cancel(); }, true);
  const swallow = e => { if (fired) { e.stopPropagation(); e.preventDefault(); if (e.type === 'click') fired = false; } };
  root.addEventListener('pointerup', e => { cancel(); swallow(e); }, true);
  root.addEventListener('pointercancel', cancel, true);
  root.addEventListener('click', swallow, true);
  root.addEventListener('contextmenu', e => { if (closestIn(e, SEL)) e.preventDefault(); }, true);
  root.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

export function installGlassDrag(root) {
  let st = null, suppress = false;
  const isGlass = () => { try { return localStorage.getItem('hjem-nav') === 'glass'; } catch (e) { return false; } };
  const itemsOf = c => [...c.querySelectorAll('button')].filter(b => b.offsetParent && c.contains(b) && !b.closest('[data-gd-skip]'));
  const axisOf = c => { const a = c.dataset.glassDrag; if (a === 'x' || a === 'y') return a; return getComputedStyle(c).flexDirection === 'column' ? 'y' : 'x'; };
  const pick = (items, x, y) => { let best = null, bd = 1e9; items.forEach(b => { const r = b.getBoundingClientRect(), cx = Math.max(r.left, Math.min(r.right, x)), cy = Math.max(r.top, Math.min(r.bottom, y)), d = Math.hypot(x - cx, y - cy); if (d < bd) { bd = d; best = b; } }); return best; };
  function lensEl() { const l = document.createElement('span'); Object.assign(l.style, { position: 'fixed', zIndex: '9998', pointerEvents: 'none', borderRadius: '999px', background: 'linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.1))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 1px rgba(255,255,255,0.18), inset 0 0 0 0.5px rgba(255,255,255,0.4), 0 10px 24px rgba(0,0,0,0.35)', backdropFilter: 'blur(4px) saturate(220%) brightness(1.15)', WebkitBackdropFilter: 'blur(4px) saturate(220%) brightness(1.15)', opacity: '0', transform: 'scale(.8)', transition: 'left .16s cubic-bezier(.34,1.5,.64,1), top .16s cubic-bezier(.34,1.5,.64,1), width .2s, height .2s, opacity .15s, transform .3s cubic-bezier(.34,1.8,.64,1)' }); root.appendChild(l); requestAnimationFrame(() => { l.style.opacity = '1'; l.style.transform = 'scale(1.1)'; }); return l; }
  function place(x, y) {
    const { c, items, lens, ax } = st, hit = pick(items, x, y); if (!hit) return; st.hit = hit;
    const r = hit.getBoundingClientRect(), cr = c.getBoundingClientRect(), w = r.width, hgt = r.height;
    let L = ax === 'x' ? x - w / 2 : r.left, T = ax === 'y' ? y - hgt / 2 : r.top;
    L = Math.max(cr.left + 2, Math.min(cr.right - w - 2, L)); T = Math.max(cr.top + 2, Math.min(cr.bottom - hgt - 2, T));
    Object.assign(lens.style, { left: L + 'px', top: T + 'px', width: w + 'px', height: hgt + 'px', borderRadius: Math.min(w, hgt) / 2 + 'px' });
  }
  root.addEventListener('pointerdown', e => { if (e.button) return; const c = closestIn(e, '[data-glass-drag]'); if (!c || closestIn(e, 'input,select,textarea,[data-ent],[data-gd-skip]')) return; if (c.dataset.gdGlassOnly && !isGlass()) return; st = { c, sx: e.clientX, sy: e.clientY, ax: axisOf(c), on: false, id: e.pointerId }; }, true);
  root.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    if (window.__tabReorder) { if (st.lens) st.lens.remove(); if (st.on) st.c.style.touchAction = st.prevTA || ''; st = null; return; }
    const dx = e.clientX - st.sx, dy = e.clientY - st.sy;
    if (!st.on) {
      const along = st.ax === 'x' ? Math.abs(dx) : Math.abs(dy), across = st.ax === 'x' ? Math.abs(dy) : Math.abs(dx);
      if (across > 12 && across > along) { st = null; return; }
      if (along < 8) return;
      st.on = true; st.items = itemsOf(st.c); st.lens = lensEl(); try { st.c.setPointerCapture(e.pointerId); } catch (x) { /* noop */ } st.prevTA = st.c.style.touchAction; st.c.style.touchAction = 'none';
    }
    e.preventDefault(); place(e.clientX, e.clientY);
  }, { capture: true, passive: false });
  const end = e => {
    if (!st) return;
    if (window.__tabReorder) { if (st.lens) st.lens.remove(); st = null; return; }
    const s0 = st; st = null; if (!s0.on) return; e.stopPropagation(); s0.c.style.touchAction = s0.prevTA || '';
    const l = s0.lens; l.style.opacity = '0'; l.style.transform = 'scale(.9)'; setTimeout(() => l.remove(), 220);
    suppress = true; setTimeout(() => { suppress = false; }, 350);
    if (s0.hit && e.type === 'pointerup') { navigator.vibrate && navigator.vibrate(10); s0.hit.click(); }
  };
  root.addEventListener('pointerup', end, true); root.addEventListener('pointercancel', end, true);
  root.addEventListener('click', e => { if (suppress && e.isTrusted) { e.stopPropagation(); e.preventDefault(); suppress = false; } }, true);
}
