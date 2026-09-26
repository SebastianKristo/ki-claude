// KI Claude – Design Component runtime for Home Assistant.
//
// A faithful port of the Claude Design "dc-runtime" (support.js) that renders
// *.dc.html designs 1:1, but inside a Lovelace card's shadow root instead of a
// standalone page. Templates and logic are bundled at build time (no fetch, no
// eval), styles are scoped to the card, and every logic class gets access to
// the live Home Assistant bridge (`ha`).
import React from 'react';

const h = (...args) => React.createElement(...args);

// ─── expr ────────────────────────────────────────────────────────────────────
const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
function resolve(vals, src) {
  const expr = String(src).trim();
  if (!expr) return undefined;
  if (expr[0] === '(' && expr[expr.length - 1] === ')' && parensWrapWhole(expr)) return resolve(vals, expr.slice(1, -1));
  const eq = findTopLevelEquality(expr);
  if (eq) {
    const lv = resolve(vals, expr.slice(0, eq.index));
    const rv = resolve(vals, expr.slice(eq.index + eq.op.length));
    switch (eq.op) {
      case '===': return lv === rv;
      case '!==': return lv !== rv;
      case '==': return lv == rv; // eslint-disable-line eqeqeq
      default: return lv != rv; // eslint-disable-line eqeqeq
    }
  }
  if (expr[0] === '!') return !resolve(vals, expr.slice(1));
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (expr === 'undefined') return undefined;
  if (NUMBER_RE.test(expr)) return Number(expr);
  if (expr.length >= 2 && (expr[0] === '"' || expr[0] === "'") && expr[expr.length - 1] === expr[0]) return expr.slice(1, -1);
  return resolvePath(vals, expr);
}
function parensWrapWhole(expr) {
  let depth = 0;
  for (let i = 0; i < expr.length - 1; i++) {
    if (expr[i] === '(') depth++;
    else if (expr[i] === ')') { depth--; if (depth === 0) return false; }
  }
  return true;
}
function findTopLevelEquality(expr) {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (depth === 0 && (c === '=' || c === '!') && expr[i + 1] === '=') {
      if (i > 0 && (expr[i - 1] === '=' || expr[i - 1] === '!')) continue;
      if (!expr.slice(0, i).trim()) continue;
      const op = expr[i + 2] === '=' ? c + '==' : c + '=';
      return { index: i, op };
    }
  }
  return null;
}
function resolvePath(vals, expr) {
  const head = expr.match(IDENT_RE);
  if (!head) return undefined;
  let cur = vals == null ? undefined : vals[head[0]];
  let i = head[0].length;
  while (i < expr.length) {
    if (expr[i] === '.') {
      const m = expr.slice(i + 1).match(IDENT_RE) || expr.slice(i + 1).match(/^\d+/);
      if (!m) return undefined;
      cur = cur == null ? undefined : cur[m[0]];
      i += 1 + m[0].length;
    } else if (expr[i] === '[') {
      let depth = 1, j = i + 1;
      while (j < expr.length && depth > 0) {
        if (expr[j] === '[') depth++;
        else if (expr[j] === ']') { depth--; if (depth === 0) break; }
        j++;
      }
      if (depth !== 0) return undefined;
      const key = resolve(vals, expr.slice(i + 1, j));
      cur = cur == null ? undefined : cur[key];
      i = j + 1;
    } else return undefined;
  }
  return cur;
}

// ─── encode ──────────────────────────────────────────────────────────────────
const CAMEL_ATTR = 'sc-camel-';
const RAW_WRAP = { select: 'sc-raw-select', table: 'sc-raw-table', tbody: 'sc-raw-tbody', thead: 'sc-raw-thead', tfoot: 'sc-raw-tfoot', tr: 'sc-raw-tr', td: 'sc-raw-td', th: 'sc-raw-th', caption: 'sc-raw-caption' };
const RAW_UNWRAP = Object.fromEntries(Object.entries(RAW_WRAP).map(([k, v]) => [v, k]));
const EVENT_MAP = {
  onclick: 'onClick', onchange: 'onChange', oninput: 'onInput', onsubmit: 'onSubmit', onkeydown: 'onKeyDown', onkeyup: 'onKeyUp', onkeypress: 'onKeyPress',
  onmousedown: 'onMouseDown', onmouseup: 'onMouseUp', onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave', onfocus: 'onFocus', onblur: 'onBlur',
  ondoubleclick: 'onDoubleClick', oncontextmenu: 'onContextMenu', onmousemove: 'onMouseMove', onmouseover: 'onMouseOver', onmouseout: 'onMouseOut',
  onpointerdown: 'onPointerDown', onpointerup: 'onPointerUp', onpointermove: 'onPointerMove', onpointerenter: 'onPointerEnter', onpointerleave: 'onPointerLeave',
  onpointercancel: 'onPointerCancel', onpointerover: 'onPointerOver', onpointerout: 'onPointerOut', ongotpointercapture: 'onGotPointerCapture',
  onlostpointercapture: 'onLostPointerCapture', ontouchstart: 'onTouchStart', ontouchend: 'onTouchEnd', ontouchmove: 'onTouchMove', ontouchcancel: 'onTouchCancel',
  ondragstart: 'onDragStart', ondragend: 'onDragEnd', ondragenter: 'onDragEnter', ondragleave: 'onDragLeave', ondragover: 'onDragOver', ondrop: 'onDrop',
  onscroll: 'onScroll', onanimationstart: 'onAnimationStart', onanimationend: 'onAnimationEnd', onanimationiteration: 'onAnimationIteration', ontransitionend: 'onTransitionEnd',
};
const ATTRS = `(?:[^>"']|"[^"]*"|'[^']*')*`;
const IMPORT_SELF_CLOSE_RE = new RegExp('<(x-import|dc-import)(' + ATTRS + ')/>', 'gi');
const CAMEL_ATTR_RE = /(\s)([a-z]+[A-Z][A-Za-z0-9]*)(\s*=)/g;
function encodeCase(html) {
  html = html.replace(IMPORT_SELF_CLOSE_RE, (_, t, a) => '<' + t + a + '></' + t + '>');
  html = html.replace(/<helmet(\s|>)/gi, '<sc-helmet$1').replace(/<\/helmet\s*>/gi, '</sc-helmet>');
  html = html.replace(CAMEL_ATTR_RE, (_, sp, name, eq) => sp + CAMEL_ATTR + name.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + eq);
  for (const [real, alias] of Object.entries(RAW_WRAP)) html = html.replace(new RegExp('(</?)' + real + '(?=[\\s>])', 'gi'), '$1' + alias);
  return html;
}
const kebabToCamel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function cssToObj(css) {
  const o = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    o[prop.startsWith('--') ? prop : kebabToCamel(prop)] = decl.slice(i + 1).trim();
  }
  return o;
}
function compileAttr(raw) {
  const whole = raw.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (whole) { const path = whole[1]; return vals => resolve(vals, path); }
  if (raw.includes('{{')) {
    const parts = raw.split(/\{\{([\s\S]+?)\}\}/g);
    return vals => parts.map((s, i) => (i & 1 ? resolve(vals, s) ?? '' : s)).join('');
  }
  return () => raw;
}

// ─── compile ─────────────────────────────────────────────────────────────────
function collectProps(node, kind, host) {
  const propGetters = [], pseudoClasses = [];
  let hintSize = null;
  for (const { name, value } of [...node.attributes]) {
    if (name === 'sc-name' || name === 'data-dc-tpl') continue;
    let key = name;
    if (key.startsWith(CAMEL_ATTR)) key = kebabToCamel(key.slice(CAMEL_ATTR.length));
    if (key === 'hint-size') { hintSize = value; continue; }
    if (key.startsWith('style-')) { pseudoClasses.push(host.pseudoClass(key.slice(6), value)); continue; }
    if (kind !== 'dom') {
      if (key.includes('-') && !(kind === 'x-import' && (key.startsWith('aria-') || key.startsWith('data-')))) key = kebabToCamel(key);
    } else if (key === 'class') key = 'className';
    else if (key === 'for') key = 'htmlFor';
    else if (key.startsWith('on')) key = EVENT_MAP[key] || 'on' + key[2].toUpperCase() + key.slice(3);
    propGetters.push([key, compileAttr(value)]);
  }
  return { propGetters, pseudoClasses, hintSize };
}
const HOST_STYLE_PROPS = new Set(['position', 'left', 'right', 'top', 'bottom', 'inset', 'width', 'height', 'z-index', 'transform']);
function hostPositionStyle(style) {
  const all = typeof style === 'string' ? cssToObj(style) : style != null && typeof style === 'object' ? style : null;
  if (!all) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(all)) if (HOST_STYLE_PROPS.has(k.replace(/[A-Z]/g, c => '-' + c.toLowerCase()))) out[k] = v;
  return Object.keys(out).length ? out : undefined;
}
function compileTemplate(html, host) {
  const tpl = document.createElement('template');
  tpl.innerHTML = encodeCase(html);
  const builders = walkChildren(tpl.content, host);
  return (vals, ctx) => builders.map((b, i) => b(vals || {}, ctx, i));
}
const walkChildren = (node, host) => [...node.childNodes].map(c => walk(c, host)).filter(b => b != null);
function walk(node, host) {
  if (node.nodeType === Node.TEXT_NODE) return walkText(node);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const tag = node.tagName.toLowerCase();
  if (tag === 'sc-for') return walkFor(node, host);
  if (tag === 'sc-if') return walkIf(node, host);
  if (tag === 'x-import') return walkXImport(node, host);
  if (tag === 'sc-helmet') return host.helmet(node);
  if (tag === 'dc-import') return walkComponent(node, host);
  return walkElement(node, host);
}
function walkText(node) {
  const txt = node.nodeValue ?? '';
  if (!txt.includes('{{')) {
    if (!txt.trim() && !txt.includes(' ')) return null;
    return () => txt;
  }
  const parts = txt.split(/\{\{([\s\S]+?)\}\}/g);
  return (vals, ctx, key) => h(React.Fragment, { key }, ...parts.map((p, i) => {
    if (!(i & 1)) return p;
    const v = resolve(vals, p);
    if (v === undefined || v === null || typeof v === 'boolean') return null;
    if (React.isValidElement(v) || Array.isArray(v)) return h(React.Fragment, { key: i }, v);
    return h('span', { key: i, className: 'sc-interp' }, String(v));
  }));
}
function walkFor(el, host) {
  const listGet = compileAttr(el.getAttribute('list') || '');
  const asName = el.getAttribute('as') || 'item';
  const kids = walkChildren(el, host);
  return (vals, ctx, key) => {
    let list = listGet(vals);
    if (!Array.isArray(list)) list = [];
    return h(React.Fragment, { key }, list.map((item, i) => {
      const sub = { ...vals, [asName]: item, $index: i };
      return h(React.Fragment, { key: i }, kids.map((b, j) => b(sub, ctx, j)));
    }));
  };
}
function walkIf(el, host) {
  const valGet = compileAttr(el.getAttribute('value') || '');
  const kids = walkChildren(el, host);
  return (vals, ctx, key) => (valGet(vals) ? h(React.Fragment, { key }, kids.map((b, j) => b(vals, ctx, j))) : null);
}
function walkComponent(el, host) {
  const name = el.getAttribute('name') || el.getAttribute('component') || '';
  el.removeAttribute('name');
  el.removeAttribute('component');
  const styleRaw = el.getAttribute('style');
  el.removeAttribute('style');
  const styleGet = styleRaw != null ? compileAttr(styleRaw) : null;
  const { propGetters } = collectProps(el, 'dc-import', host);
  const kids = walkChildren(el, host);
  return (vals, ctx, key) => {
    const props = { key, __hostStyle: styleGet ? hostPositionStyle(styleGet(vals)) : undefined };
    for (const [k, g] of propGetters) {
      const v = g(vals);
      if (k === 'dcProps') { if (v && typeof v === 'object') Object.assign(props, v); continue; }
      props[k] = v;
    }
    if (kids.length) props.children = kids.map((b, j) => b(vals, ctx, j));
    return h(host.component(name), props);
  };
}
function walkXImport(el, host) {
  const globalName = el.getAttribute('component-from-global-scope') || el.getAttribute('component') || el.getAttribute('name') || '';
  const styleRaw = el.getAttribute('style');
  el.removeAttribute('style');
  const styleGet = styleRaw != null ? compileAttr(styleRaw) : null;
  const { propGetters } = collectProps(el, 'x-import', host);
  return (vals, ctx, key) => {
    const C = host.external(globalName);
    const props = {};
    for (const [k, g] of propGetters) {
      if (k === 'component' || k === 'componentFromGlobalScope' || k === 'from') continue;
      props[k] = g(vals);
    }
    const hostStyle = styleGet ? hostPositionStyle(styleGet(vals)) : undefined;
    return h('div', { key, className: 'sc-host-x', style: hostStyle || { display: 'contents' } }, C ? h(C, props) : null);
  };
}
function walkElement(el, host) {
  const realTag = RAW_UNWRAP[el.localName] || el.localName;
  const { propGetters, pseudoClasses } = collectProps(el, 'dom', host);
  const kids = walkChildren(el, host);
  return (vals, ctx, key) => {
    const props = { key };
    for (const [k, g] of propGetters) {
      let v = g(vals);
      if (k === 'style' && typeof v === 'string') v = cssToObj(v);
      if ((k === 'value' || k === 'checked') && v === undefined) v = k === 'checked' ? false : '';
      props[k] = v;
    }
    if (pseudoClasses.length) props.className = [props.className, ...pseudoClasses].filter(Boolean).join(' ');
    return h(realTag, props, ...kids.map((b, j) => b(vals, ctx, j)));
  };
}

// ─── logic base ──────────────────────────────────────────────────────────────
export class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; this.__host = null; }
  setState(update, cb) { this.__host && this.__host.__setLogicState(update, cb); }
  forceUpdate() { this.__host && this.__host.forceUpdate(); }
  componentDidMount() {}
  componentDidUpdate() {}
  componentWillUnmount() {}
  renderVals() { return {}; }
}

// ─── pseudo classes (style-hover / style-active …) ──────────────────────────
function importantify(css) {
  return css.split(';').map(d => d.trim()).filter(Boolean).map(d => (/!\s*important$/i.test(d) ? d : d + ' !important')).join(';');
}

// ─── runtime (one per card / shadow root) ────────────────────────────────────
// `screens` maps a design name → { html, factory(DCLogic, React, ha) → Component }.
// `ha` is the live Home Assistant bridge handed to every logic class.
export function createRuntime({ root, screens, ha, externals = {}, rootName }) {
  const styleHost = root; // ShadowRoot
  const pseudoEl = document.createElement('style');
  styleHost.appendChild(pseudoEl);
  const pseudoCache = new Map();
  let pseudoN = 0;
  const pseudoClass = (pseudo, css) => {
    const k = pseudo + '|' + css;
    if (pseudoCache.has(k)) return pseudoCache.get(k);
    const cls = 'scp' + (pseudoN++).toString(36);
    const el = pseudo === 'before' || pseudo === 'after';
    pseudoEl.appendChild(document.createTextNode('.' + cls + (el ? '::' : ':') + pseudo + '{' + (el ? css : importantify(css)) + '}\n'));
    pseudoCache.set(k, cls);
    return cls;
  };

  const mountedHelmets = new Set();
  const helmet = (node, ownerName) => {
    const raw = [...node.children];
    return () => {
      const key = ownerName;
      if (mountedHelmets.has(key)) return null;
      mountedHelmets.add(key);
      for (const child of raw) {
        const tag = child.tagName;
        if (tag === 'LINK') {
          const href = child.getAttribute('href') || '';
          if (!document.head.querySelector(`link[href="${CSS.escape(href)}"]`)) document.head.appendChild(child.cloneNode(true));
        } else if (tag === 'STYLE') {
          let css = child.textContent || '';
          // Page-level rules (html,body{…}) apply to the card host only for the root design.
          css = css.replace(/(^|[}\s,])html\s*,\s*body\s*\{([^}]*)\}/g, (m, pre, body) => (ownerName === rootName ? pre + ':host{' + body + '}' : pre));
          css = css.replace(/(^|[}\s,])(html|body)\s*\{([^}]*)\}/g, (m, pre, sel, body) => (ownerName === rootName ? pre + ':host{' + body + '}' : pre));
          const el = document.createElement('style');
          el.setAttribute('data-dc', ownerName);
          el.textContent = css;
          styleHost.appendChild(el);
          // @keyframes / @font-face only resolve reliably at document level for
          // elements appended to document.body (e.g. more-info sheets).
          const kf = css.match(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g);
          if (kf && !document.head.querySelector(`style[data-ki-claude-kf="${CSS.escape(ownerName)}"]`)) {
            const g = document.createElement('style');
            g.setAttribute('data-ki-claude-kf', ownerName);
            g.textContent = kf.join('\n');
            document.head.appendChild(g);
          }
        }
      }
      return null;
    };
  };

  // Scripts written for a standalone page query `document`; inside a card the
  // design lives in a shadow root, so DOM lookups and bubbling pointer/scroll
  // listeners are redirected there.
  const ROOT_EVENTS = new Set(['scroll', 'click', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'wheel', 'mousedown', 'mouseup', 'mousemove', 'contextmenu', 'dragstart', 'dragover', 'drop']);
  const doc = new Proxy(document, {
    get(t, k) {
      if (k === 'querySelector') return s => root.querySelector(s);
      if (k === 'querySelectorAll') return s => root.querySelectorAll(s);
      if (k === 'getElementById') return id => root.getElementById(id);
      if (k === 'addEventListener') return (type, fn, o) => (ROOT_EVENTS.has(type) ? root : document).addEventListener(type, fn, o);
      if (k === 'removeEventListener') return (type, fn, o) => { root.removeEventListener(type, fn, o); document.removeEventListener(type, fn, o); };
      const v = Reflect.get(t, k);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  const registry = {};
  const components = new Map();
  const get = name => {
    if (registry[name]) return registry[name];
    const def = screens[name];
    if (!def) { console.warn('[ki-claude] ukjent design:', name); return (registry[name] = { tpl: null, Logic: null }); }
    const host = {
      component: n => getDC(n),
      helmet: node => helmet(node, name),
      external: n => externals[n] || null,
      pseudoClass,
    };
    let Logic = null;
    try { Logic = def.factory(DCLogic, React, ha, doc); } catch (e) { console.error('[ki-claude] logic feilet for', name, e); }
    return (registry[name] = { tpl: compileTemplate(def.html, host), Logic });
  };

  class DCComponent extends React.Component {
    constructor(props) {
      super(props);
      this.__name = props.__name;
      this.state = { __v: 0, __err: null };
      const r = get(this.__name);
      const L = r.Logic || DCLogic;
      try { this.logic = new L(this.__userProps()); } catch (e) { console.error(e); this.logic = new DCLogic(this.__userProps()); }
      this.logic.__host = this;
      this.__deps = null;
      this.__unsub = ha.subscribe(changed => {
        const d = this.__deps;
        if (d && d.has('*all') && !changed.has('*')) {
          // whole-house screens: coalesce to at most one re-render per second
          if (!this.__t) this.__t = setTimeout(() => { this.__t = null; this.setState(s => ({ __v: s.__v + 1 })); }, 1000);
          return;
        }
        if (!d || [...d].some(id => changed.has(id)) || changed.has('*')) this.setState(s => ({ __v: s.__v + 1 }));
      });
    }
    static getDerivedStateFromError(e) { return { __err: e && e.message ? e.message : String(e) }; }
    componentDidCatch(e, info) { console.error('[ki-claude] render error in <' + this.__name + '>:', e, info?.componentStack || ''); }
    __userProps() { const { __name, __hostStyle, ...rest } = this.props; return rest; }
    __setLogicState(update, cb) {
      const prev = this.logic.state;
      if (!this.__prevLogicState) this.__prevLogicState = prev;
      const patch = typeof update === 'function' ? update(prev) : update;
      this.logic.state = { ...prev, ...patch };
      this.setState(s => ({ __v: s.__v + 1 }), cb);
    }
    componentDidMount() { try { this.logic.componentDidMount(); } catch (e) { console.error(e); } }
    componentDidUpdate(prev) {
      this.logic.props = this.__userProps();
      const ps = this.__prevLogicState || this.logic.state;
      this.__prevLogicState = null;
      try { this.logic.componentDidUpdate(prev, ps); } catch (e) { console.error(e); }
    }
    componentWillUnmount() { clearTimeout(this.__t); this.__unsub(); try { this.logic.componentWillUnmount(); } catch (e) { console.error(e); } }
    render() {
      const r = get(this.__name);
      const hostBase = { className: 'sc-host', style: this.props.__hostStyle, 'data-sc-name': this.__name };
      if (this.state.__err) return h('div', { ...hostBase, className: 'sc-host sc-has-error' }, h('div', { className: 'sc-logic-error' }, this.__name + ': ' + this.state.__err));
      if (!r.tpl) return h('div', hostBase);
      const userProps = this.__userProps();
      this.logic.props = userProps;
      let vals = userProps, err = null;
      const deps = new Set();
      ha.track(deps, () => {
        try { vals = { ...userProps, ...(this.logic.renderVals() || {}) }; } catch (e) { console.error(e); err = this.__name + '.renderVals(): ' + (e && e.message ? e.message : String(e)); }
      });
      this.__deps = deps;
      return h('div', { ...hostBase, className: 'sc-host' + (err ? ' sc-has-error' : '') }, err && h('div', { className: 'sc-logic-error' }, err), r.tpl(vals, this));
    }
  }

  function getDC(name) {
    if (components.has(name)) return components.get(name);
    const C = p => h(DCComponent, { ...p, __name: name });
    C.displayName = name;
    components.set(name, C);
    return C;
  }
  return { getDC };
}

export const BASE_CSS = `
.sc-host.sc-has-error{position:relative}
.sc-logic-error{position:absolute;top:8px;left:8px;z-index:2147483647;max-width:60ch;padding:6px 10px;background:#b00020;color:#fff;font:12px/1.4 ui-monospace,monospace;border-radius:4px;white-space:pre-wrap;pointer-events:none}
`;
