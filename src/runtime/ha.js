// KI Claude – Home Assistant bridge used by every design's logic class.
//
// Design scripts read live data through `ha.*` and fall back to the design's
// own demo values when an entity is missing, so a screen always renders
// exactly like the Claude Design prototype and becomes live as soon as the
// matching ki-* integration (or a configured entity) is present.
export function createBridge(card) {
  let hass = null;
  let config = {};
  const subs = new Set();
  let deps = null;
  const cache = new Map();

  const use = id => { if (deps && id) deps.add(id); };
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  const ha = {
    get hass() { return hass; },
    get live() { return !!hass; },
    get config() { return config; },
    get lang() { return hass?.locale?.language || 'nb'; },
    norm,

    setHass(next) {
      const prev = hass;
      hass = next;
      if (!prev || prev.entities !== next.entities) cache.clear();
      const changed = new Set();
      if (!prev) changed.add('*');
      else if (prev.states !== next.states) {
        for (const id in next.states) if (next.states[id] !== prev.states[id]) changed.add(id);
        for (const id in prev.states) if (!(id in next.states)) changed.add(id);
      }
      if (changed.size) subs.forEach(fn => fn(changed));
    },
    setConfig(c) { config = c || {}; cache.clear(); subs.forEach(fn => fn(new Set(['*']))); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    track(set, fn) { const prev = deps; deps = set; try { fn(); } finally { deps = prev; } },
    /** Re-render everything that reads `id` (used by async helpers). */
    bump(id) { const s = new Set([id || '*']); subs.forEach(fn => fn(s)); },
    /** Screens that aggregate the whole house re-render on any state change (throttled by the runtime). */
    watchAll() { use('*all'); },

    // ── state access ──
    state(id) { use(id); return id && hass ? hass.states[id] : undefined; },
    has(id) { return !!ha.state(id); },
    val(id, fb) { const s = ha.state(id); return s && s.state !== 'unavailable' && s.state !== 'unknown' ? s.state : fb; },
    num(id, fb) { const v = parseFloat(ha.val(id)); return Number.isFinite(v) ? v : fb; },
    on(id, fb) { const s = ha.val(id); return s === undefined ? fb : ['on', 'home', 'open', 'unlocked', 'playing', 'heat', 'cool', 'auto', 'heat_cool', 'cleaning', 'mowing', 'armed_away', 'armed_home', 'armed_night', 'true'].includes(s); },
    attr(id, a, fb) { const s = ha.state(id); const v = s?.attributes?.[a]; return v === undefined || v === null ? fb : v; },
    name(id, fb) { const s = ha.state(id); return s?.attributes?.friendly_name || fb; },
    unit(id, fb) { return ha.attr(id, 'unit_of_measurement', fb); },
    changed(id) { const s = ha.state(id); return s ? new Date(s.last_changed) : null; },

    // ── entity discovery ──
    /** All entity_ids created by integration `platform` (optionally only `domain`). */
    all(platform, domain) {
      const k = 'all|' + platform + '|' + (domain || '');
      if (!cache.has(k)) {
        const ents = hass?.entities || {};
        cache.set(k, Object.keys(ents).filter(id => ents[id].platform === platform && (!domain || id.startsWith(domain + '.'))).sort());
      }
      return cache.get(k);
    },
    /**
     * Find an entity of integration `platform` by translation_key (preferred),
     * entity_id suffix or name. `domain` narrows the HA platform (sensor, switch…).
     * Card config `entities: { <alias>: entity_id }` always wins.
     */
    find(platform, key, domain, alias) {
      const over = config.entities?.[alias || key];
      if (over) return over;
      const k = 'find|' + platform + '|' + key + '|' + (domain || '');
      if (cache.has(k)) return cache.get(k);
      const ents = hass?.entities || {};
      const ids = ha.all(platform, domain);
      const nk = norm(key);
      const hit = ids.find(id => ents[id].translation_key === key)
        || ids.find(id => id.split('.')[1] === nk || id.split('.')[1].endsWith('_' + nk))
        || ids.find(id => norm(ents[id].name || '') === nk)
        || null;
      if (hass?.entities) cache.set(k, hit);
      return hit;
    },
    /** All entities of `platform` whose translation_key equals `key` (per-zone/per-room entities). */
    findAll(platform, key, domain) {
      const k = 'findAll|' + platform + '|' + key + '|' + (domain || '');
      if (!cache.has(k)) {
        const ents = hass?.entities || {};
        cache.set(k, ha.all(platform, domain).filter(id => ents[id].translation_key === key || id.split('.')[1].endsWith('_' + norm(key))));
      }
      return cache.get(k);
    },
    /** Entities whose attributes declare `integrasjon: <integ>` (the ki-* convention), optionally filtered on attributes. */
    ki(integ, filter) {
      const ids = hass ? Object.keys(hass.states).filter(id => hass.states[id].attributes?.integrasjon === integ) : [];
      ids.forEach(use);
      return filter ? ids.filter(id => filter(hass.states[id].attributes, id, hass.states[id])) : ids;
    },
    /** First existing entity among candidate ids (config alias first). */
    first(alias, ...ids) {
      const over = config.entities?.[alias];
      if (over) return over;
      for (const id of ids.flat()) if (id && hass?.states[id]) return id;
      return null;
    },
    /** Entities of a HA domain (light, person, weather …), optionally filtered. */
    domain(d, filter) {
      const ids = hass ? Object.keys(hass.states).filter(id => id.startsWith(d + '.')) : [];
      ids.forEach(use);
      return filter ? ids.filter(id => filter(hass.states[id], id)) : ids;
    },
    /** Card-config entity (alias) or first match from `fallback()`. */
    ent(alias, fallback) { return config.entities?.[alias] || (fallback ? fallback() : null) || null; },
    device(id) { const e = hass?.entities?.[id]; return e?.device_id ? hass.devices?.[e.device_id] : undefined; },
    area(id) { const e = hass?.entities?.[id]; const aid = e?.area_id || ha.device(id)?.area_id; return aid ? hass.areas?.[aid] : undefined; },

    // ── actions ──
    call(domain, service, data, target) {
      if (!hass) return Promise.resolve();
      return hass.callService(domain, service, data || {}, target).catch(e => { console.error('[ki-claude]', domain + '.' + service, e); ha.toast(e.message || String(e)); });
    },
    toggle(id) { if (!id) return; const d = id.split('.')[0]; return ha.call(['light', 'switch', 'fan', 'input_boolean', 'media_player', 'automation', 'siren', 'humidifier', 'climate'].includes(d) ? d : 'homeassistant', 'toggle', { entity_id: id }); },
    turn(id, on, extra) { if (!id) return; const d = id.split('.')[0]; return ha.call(['light', 'switch', 'fan', 'input_boolean', 'media_player', 'automation', 'siren', 'humidifier', 'climate'].includes(d) ? d : 'homeassistant', on ? 'turn_on' : 'turn_off', { entity_id: id, ...(extra || {}) }); },
    press(id) { return id && ha.call('button', 'press', { entity_id: id }); },
    setNumber(id, value) { return id && ha.call(id.split('.')[0], 'set_value', { entity_id: id, value }); },
    select(id, option) { return id && ha.call(id.split('.')[0], 'select_option', { entity_id: id, option }); },
    moreInfo(id) { if (!id) return; const ev = new Event('hass-more-info', { bubbles: true, composed: true }); ev.detail = { entityId: id }; card.dispatchEvent(ev); },
    navigate(path) { history.pushState(null, '', path); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); },
    toast(message) { const ev = new Event('hass-notification', { bubbles: true, composed: true }); ev.detail = { message }; card.dispatchEvent(ev); },

    // ── async data (cached, re-renders on arrival) ──
    /** Hourly history of a numeric sensor (last `hours`), [{t: Date, v: number}]. */
    history(id, hours = 24) {
      use(id);
      if (!hass || !id) return null;
      const k = 'hist|' + id + '|' + hours;
      const c = cache.get(k);
      if (c && Date.now() - c.at < 5 * 60e3) return c.data;
      if (!c || !c.pending) {
        cache.set(k, { at: c?.at || 0, data: c?.data || null, pending: true });
        const start = new Date(Date.now() - hours * 3600e3).toISOString();
        hass.callWS({ type: 'history/history_during_period', start_time: start, entity_ids: [id], minimal_response: true, no_attributes: true })
          .then(r => {
            const rows = (r[id] || []).map(x => ({ t: new Date((x.lu || x.lc) * 1000), v: parseFloat(x.s) })).filter(x => Number.isFinite(x.v));
            cache.set(k, { at: Date.now(), data: rows });
            ha.bump(id);
          }).catch(() => cache.set(k, { at: Date.now(), data: [] }));
      }
      return c?.data || null;
    },
    /** Upcoming calendar events for `id` in the next `days`. */
    events(id, days = 31, back = 0) {
      use(id);
      if (!hass || !id) return null;
      const k = 'cal|' + id + '|' + days + '|' + back;
      const c = cache.get(k);
      if (c && Date.now() - c.at < 10 * 60e3) return c.data;
      if (!c || !c.pending) {
        cache.set(k, { at: c?.at || 0, data: c?.data || null, pending: true });
        const s = new Date(); s.setHours(0, 0, 0, 0); s.setDate(s.getDate() - back);
        const e = new Date(s.getTime() + (days + back) * 864e5);
        hass.callApi('GET', `calendars/${id}?start=${encodeURIComponent(s.toISOString())}&end=${encodeURIComponent(e.toISOString())}`)
          .then(r => { cache.set(k, { at: Date.now(), data: r || [] }); ha.bump(id); })
          .catch(() => cache.set(k, { at: Date.now(), data: [] }));
      }
      return c?.data || null;
    },
    /** Items of a todo list entity. */
    todo(id) {
      use(id);
      if (!hass || !id) return null;
      const k = 'todo|' + id + '|' + (hass.states[id]?.last_updated || '');
      const c = cache.get(k);
      if (c) return c.data;
      cache.set(k, { data: null });
      hass.callWS({ type: 'todo/item/list', entity_id: id }).then(r => { cache.set(k, { data: r.items || [] }); ha.bump(id); }).catch(() => cache.set(k, { data: [] }));
      return null;
    },
    /** Weather forecast via weather.get_forecasts (type: daily|hourly). */
    forecast(id, type = 'daily') {
      use(id);
      if (!hass || !id) return null;
      const k = 'fc|' + id + '|' + type;
      const c = cache.get(k);
      if (c && Date.now() - c.at < 15 * 60e3) return c.data;
      if (!c || !c.pending) {
        cache.set(k, { at: c?.at || 0, data: c?.data || null, pending: true });
        hass.callWS({ type: 'call_service', domain: 'weather', service: 'get_forecasts', service_data: { type }, target: { entity_id: id }, return_response: true })
          .then(r => { cache.set(k, { at: Date.now(), data: r?.response?.[id]?.forecast || [] }); ha.bump(id); })
          .catch(() => cache.set(k, { at: Date.now(), data: [] }));
      }
      return c?.data || null;
    },
  };
  return ha;
}
