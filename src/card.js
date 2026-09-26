// KI Claude – Lovelace cards rendering the Claude Design dashboard 1:1.
//
//   type: custom:ki-claude-card        → Hjem (hele dashboardet, "Hjem v2")
//   type: custom:ki-claude-card
//   screen: Vanning                    → én enkelt skjerm (se README for liste)
//   type: custom:ki-claude-ipad-card   → iPad-dashboardet
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createRuntime, BASE_CSS } from './runtime/dc.js';
import { createBridge } from './runtime/ha.js';
import { makeExternals, installMoreInfo, installGlassDrag } from './runtime/helpers.js';
import { SCREENS, ALIASES } from './generated/screens.js';
import { VERSION } from './generated/version.js';

const FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&display=block',
];
function ensureFonts() {
  for (const href of FONT_LINKS) {
    if (document.head.querySelector(`link[href="${href}"]`)) continue;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
}

// Popup-nøkler fra «Hjem v2» → skjerm. Brukes for Bubble Card-pop-ups (#ki-<nøkkel>).
export const POPUPS = { strom: 'Strøm v5', sik: 'Sikkerhet v3', vann: 'Vanning v4', vac: 'Støvsuger', media: 'Media v4', car: 'Bil v3', server: 'Server v3', settings: 'Innstillinger v3', cal: 'Kalender', vaer: 'Vær v3', lys: 'Lys v4', cam: 'Kamera v2', klima: 'Klima v2', trash: 'Søppel', todo: 'Gjøremål', plants: 'Planter', sleep: 'Søvn', bill: 'Strømregning', pool: 'Basseng v3', mower: 'Gressklipper', nibe: 'Varmepumpe', printer: '3D-printer', fuel: 'Drivstoff', ruter: 'Ruter v2', pcs: 'Datamaskiner', helse: 'Helse', norgespris: 'Norgespris', elset: 'Strøminnstillinger', jul: 'Jul', doors: 'Dører' };
const popupScreen = key => POPUPS[key] || (String(key).startsWith('rom') ? 'Rom v4' : String(key).startsWith('person') ? 'Person' : null);

export function resolveScreen(name) {
  if (!name) return 'Hjem v2';
  if (SCREENS[name]) return name;
  const k = String(name).toLowerCase().normalize('NFC');
  return ALIASES[k] || Object.keys(SCREENS).find(n => n.toLowerCase() === k) || name;
}

class KiClaudeCard extends HTMLElement {
  static getStubConfig() { return { screen: 'Hjem' }; }
  static getConfigElement() { return document.createElement('ki-claude-card-editor'); }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._ha = createBridge(this);
    this._mounted = false;
  }
  defaultScreen() { return 'Hjem v2'; }
  setConfig(config) {
    const next = { ...(config || {}) };
    if (next.popup && !next.screen) next.screen = popupScreen(next.popup) || undefined;
    const screen = resolveScreen(next.screen || this.defaultScreen());
    if (!SCREENS[screen]) throw new Error(`Ukjent skjerm «${next.screen}». Gyldige: ${Object.keys(ALIASES).join(', ')}`);
    const changedScreen = this._config && resolveScreen(this._config.screen || this.defaultScreen()) !== screen;
    this._config = next;
    this._ha.setConfig(next);
    if (changedScreen && this._mounted) { this._unmount(); this._mount(); }
  }
  set hass(hass) {
    this._ha.setHass(hass);
    if (!this._mounted && this._popupOpen()) this._mount();
  }
  // Pop-up-kort (popup: <nøkkel>) monteres først når Bubble Card-pop-upen åpnes, og tas ned etter lukking.
  _popupOpen() { return !this._config || !this._config.popup || location.hash === '#ki-' + this._config.popup; }
  connectedCallback() {
    if (!this._config || !this._config.popup || this._onLoc) return;
    this._onLoc = () => setTimeout(() => {
      const open = this._popupOpen();
      clearTimeout(this._unmountT);
      if (open && !this._mounted && this._ha.hass) this._mount();
      else if (!open && this._mounted) this._unmountT = setTimeout(() => { if (!this._popupOpen()) this._unmount(); }, 800);
    }, 0);
    ['location-changed', 'popstate', 'hashchange'].forEach(e => window.addEventListener(e, this._onLoc));
  }
  disconnectedCallback() { if (this._onLoc) { ['location-changed', 'popstate', 'hashchange'].forEach(e => window.removeEventListener(e, this._onLoc)); this._onLoc = null; } }
  _unmount() { if (!this._mounted) return; this._reactRoot.unmount(); this._mounted = false; this._root.innerHTML = ''; }
  get hass() { return this._ha.hass; }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  _mount() {
    if (this._mounted || !this._config) return;
    this._mounted = true;
    ensureFonts();
    const screen = resolveScreen(this._config.screen || this.defaultScreen());
    const base = document.createElement('style');
    base.textContent = BASE_CSS + `
:host{display:block;position:relative;font-family:'Space Grotesk',system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:#fafafa}
:host([data-full]){min-height:100vh}
.sc-host{display:contents}
.ki-claude-root>.sc-host{display:block}
${this._config.max_width ? `.ki-claude-root>.sc-host>div{max-width:${this._config.max_width}}` : ''}
`;
    this._root.appendChild(base);
    const mountEl = document.createElement('div');
    mountEl.className = 'ki-claude-root';
    this._root.appendChild(mountEl);
    installMoreInfo(this._root, this._ha);
    installGlassDrag(this._root);
    const popup = this._config.popup;
    const rt = createRuntime({ root: this._root, screens: SCREENS, ha: this._ha, externals: makeExternals(this._ha), rootName: popup ? '_Popup' : screen });
    const Root = rt.getDC(screen);
    const props = { ...(this._config.props || {}) };
    if (this._config.layout) props.layout = this._config.layout;
    if (screen === 'Hjem v2' && !props.layout) props.layout = 'auto';
    this._reactRoot = createRoot(mountEl);
    const el = React.createElement(Root, props);
    this._reactRoot.render(popup ? React.createElement(rt.getDC('_Popup'), { ...props, popup, body: el }) : el);
  }
}

class KiClaudeIpadCard extends KiClaudeCard {
  defaultScreen() { return 'iPad Dashboard'; }
  static getStubConfig() { return {}; }
}

class KiClaudeCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(h) { this._hass = h; }
  _render() {
    if (!this._sel) {
      this.innerHTML = '';
      const label = document.createElement('label');
      label.textContent = 'Skjerm ';
      label.style.cssText = 'display:flex;gap:12px;align-items:center;font:14px var(--paper-font-body1_-_font-family,system-ui)';
      this._sel = document.createElement('select');
      this._sel.style.cssText = 'flex:1;padding:8px;border-radius:8px';
      for (const k of Object.keys(ALIASES)) {
        const o = document.createElement('option');
        o.value = k; o.textContent = k;
        this._sel.appendChild(o);
      }
      this._sel.addEventListener('change', () => {
        const ev = new Event('config-changed', { bubbles: true, composed: true });
        ev.detail = { config: { ...this._config, screen: this._sel.value } };
        this.dispatchEvent(ev);
      });
      label.appendChild(this._sel);
      this.appendChild(label);
    }
    const cur = resolveScreen(this._config?.screen || 'Hjem');
    this._sel.value = Object.keys(ALIASES).find(k => ALIASES[k] === cur) || 'hjem';
  }
}

// Dashboard-strategi: «strategy: { type: custom:ki-claude }».
// Hjem + iPad som panel-visninger. Med Bubble Card installert (eller popups: bubble) får hver
// popup i Hjem sin egen Bubble Card-pop-up (#ki-<nøkkel>), også ett per rom og per person.
const whenDefined = (tag, ms) => Promise.race([customElements.whenDefined(tag).then(() => true), new Promise(r => setTimeout(() => r(false), ms))]);
export function bubblePopup(key, screen, props, opts = {}) {
  // Bubble Card ≥ 3.2 «standalone»-format: innholdet ligger i pop-upens egen `cards`.
  return { type: 'custom:bubble-card', card_type: 'pop-up', hash: '#ki-' + key, show_header: false, bg_color: '#232323', bg_opacity: '100', shadow_opacity: '0', width_desktop: '440px', close_by_clicking_outside: true, ...(opts.bubble || {}),
    cards: [{ type: 'custom:ki-claude-card', popup: key, ...(screen ? { screen } : {}), ...(props ? { props } : {}), ...(opts.card || {}) }] };
}
class KiClaudeStrategy extends HTMLElement {
  static async generate(config, hass) {
    const { type, popups, ...rest } = config || {};
    const bubble = popups === 'bubble' || (popups !== 'intern' && await whenDefined('bubble-card', 4000));
    const shared = { ...(rest.entities ? { entities: rest.entities } : {}), ...(rest.images ? { images: rest.images } : {}) };
    const cards = [{ type: 'custom:ki-claude-card', ...rest, ...(bubble ? { popups: 'bubble' } : {}) }];
    if (bubble) {
      Object.entries(POPUPS).forEach(([k, scr]) => cards.push(bubblePopup(k, scr, k === 'sik' ? { embedded: true } : k === 'doors' && rest.site ? { site: rest.site } : null, { card: shared })));
      Object.values((hass && hass.areas) || {}).forEach(a => cards.push(bubblePopup('rom-' + a.area_id, 'Rom v4', { roomId: a.area_id, name: a.name }, { card: shared })));
      Object.keys((hass && hass.states) || {}).filter(id => id.startsWith('person.')).forEach(id => cards.push(bubblePopup('person-' + id.slice(7), 'Person', { personId: id.slice(7) }, { card: shared })));
    }
    return { title: 'KI Claude', views: [
      { title: 'Hjem', path: 'hjem', icon: 'mdi:home', type: 'panel', cards: [bubble ? { type: 'vertical-stack', cards } : cards[0]] },
      { title: 'iPad', path: 'ipad', icon: 'mdi:tablet', type: 'panel', cards: [{ type: 'custom:ki-claude-ipad-card', ...rest, screen: undefined }] },
    ] };
  }
}

if (!customElements.get('ki-claude-card')) customElements.define('ki-claude-card', KiClaudeCard);
if (!customElements.get('ki-claude-ipad-card')) customElements.define('ki-claude-ipad-card', KiClaudeIpadCard);
if (!customElements.get('ll-strategy-dashboard-ki-claude')) customElements.define('ll-strategy-dashboard-ki-claude', KiClaudeStrategy);
if (!customElements.get('ki-claude-card-editor')) customElements.define('ki-claude-card-editor', KiClaudeCardEditor);

window.customCards = window.customCards || [];
window.customCards.push(
  { type: 'ki-claude-card', name: 'KI Claude – Hjem', description: 'Hjem-dashboardet fra Claude Design, koblet til ki-integrasjonene. Velg «screen» for én enkelt skjerm.', preview: false, documentationURL: 'https://github.com/SebastianKristo/ki-claude' },
  { type: 'ki-claude-ipad-card', name: 'KI Claude – iPad', description: 'iPad-dashboardet fra Claude Design.', preview: false, documentationURL: 'https://github.com/SebastianKristo/ki-claude' },
);
console.info(`%c KI-CLAUDE %c ${VERSION} `, 'color:#2a1720;background:linear-gradient(145deg,#f285c9,#f5cdc6);font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px', 'color:#fafafa;background:#2a2a2a;border-radius:0 4px 4px 0;padding:2px 6px');
