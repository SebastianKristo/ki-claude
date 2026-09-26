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
    const screen = resolveScreen(next.screen || this.defaultScreen());
    if (!SCREENS[screen]) throw new Error(`Ukjent skjerm «${next.screen}». Gyldige: ${Object.keys(ALIASES).join(', ')}`);
    const changedScreen = this._config && resolveScreen(this._config.screen || this.defaultScreen()) !== screen;
    this._config = next;
    this._ha.setConfig(next);
    if (changedScreen && this._mounted) { this._reactRoot.unmount(); this._mounted = false; this._root.innerHTML = ''; this._mount(); }
  }
  set hass(hass) {
    this._ha.setHass(hass);
    if (!this._mounted) this._mount();
  }
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
    const rt = createRuntime({ root: this._root, screens: SCREENS, ha: this._ha, externals: makeExternals(this._ha), rootName: screen });
    const Root = rt.getDC(screen);
    const props = { ...(this._config.props || {}) };
    if (this._config.layout) props.layout = this._config.layout;
    if (screen === 'Hjem v2' && !props.layout) props.layout = 'auto';
    this._reactRoot = createRoot(mountEl);
    this._reactRoot.render(React.createElement(Root, props));
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

if (!customElements.get('ki-claude-card')) customElements.define('ki-claude-card', KiClaudeCard);
if (!customElements.get('ki-claude-ipad-card')) customElements.define('ki-claude-ipad-card', KiClaudeIpadCard);
if (!customElements.get('ki-claude-card-editor')) customElements.define('ki-claude-card-editor', KiClaudeCardEditor);

window.customCards = window.customCards || [];
window.customCards.push(
  { type: 'ki-claude-card', name: 'KI Claude – Hjem', description: 'Hjem-dashboardet fra Claude Design, koblet til ki-integrasjonene. Velg «screen» for én enkelt skjerm.', preview: false, documentationURL: 'https://github.com/SebastianKristo/ki-claude' },
  { type: 'ki-claude-ipad-card', name: 'KI Claude – iPad', description: 'iPad-dashboardet fra Claude Design.', preview: false, documentationURL: 'https://github.com/SebastianKristo/ki-claude' },
);
console.info(`%c KI-CLAUDE %c ${VERSION} `, 'color:#2a1720;background:linear-gradient(145deg,#f285c9,#f5cdc6);font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px', 'color:#fafafa;background:#2a2a2a;border-radius:0 4px 4px 0;padding:2px 6px');
