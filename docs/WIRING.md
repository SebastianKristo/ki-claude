# Slik kobles en Claude Design-skjerm til Home Assistant

Hver skjerm i `src/screens/*.dc.html` er en uendret eksport fra Claude Design
(template i `<x-dc>` + logikk i `<script data-dc-script>`). Runtime-en i
`src/runtime/dc.js` rendrer dem 1:1. Koblingen til Home Assistant skjer inne i
skjermens script via det globale objektet **`ha`**.

## Prinsipper

1. **Demo-data er fallback.** Designets egne konstanter beholdes. Finnes ikke
   integrasjonen/entiteten, skal skjermen se *nøyaktig* ut som i Claude Design
   (verifiseres piksel for piksel).
2. **Live-data overstyrer.** Når entitetene finnes, byttes demo-data ut med
   verdier fra `hass`. Mønster: `let X = DEMO_X;` på toppnivå, og en
   `loadLive()` som kjøres først i `renderVals()` og returnerer `null` (demo)
   eller et objekt med live-verdier (se `Vanning v4.dc.html`).
3. **Handlinger kaller tjenester.** I live-modus simuleres ingenting lokalt –
   knapper kaller `ha.call(...)`/`ha.toggle(...)` og UI oppdateres når
   `hass` endres.
4. **Faste datoer blir «nå».** `'2026-09-25'` o.l. brukes kun i demo.
5. **Hardkodede tall i templaten** som egentlig er data, erstattes med
   `{{ binding }}` som i demo gir nøyaktig samme tekst.
6. **Aldri krasj.** Tomme lister, manglende attributter og `unavailable`
   skal håndteres.

## `ha`-API (src/runtime/ha.js)

| Kall | Beskrivelse |
|---|---|
| `ha.live` | `true` når kortet har `hass` |
| `ha.state(id)` | state-objekt eller `undefined` (registrerer avhengighet → re-render ved endring) |
| `ha.val(id, fb)` / `ha.num(id, fb)` / `ha.on(id, fb)` | state som tekst / tall / boolsk, med fallback |
| `ha.attr(id, navn, fb)` / `ha.name(id, fb)` / `ha.unit(id, fb)` | attributter |
| `ha.first(alias, ...kandidater)` | første eksisterende entity_id; `entities.<alias>` i kortkonfig vinner |
| `ha.ki(integrasjon, filter?)` | entiteter med attributtet `integrasjon: <integrasjon>` (ki-konvensjonen) |
| `ha.all(platform, domain?)` / `ha.find(platform, nøkkel, domain?, alias?)` | oppslag via entitetsregisteret |
| `ha.domain('light', filter?)` | alle entiteter i et HA-domene |
| `ha.area(id)` / `ha.device(id)` | område/enhet for en entitet |
| `ha.call(domain, service, data)` | kall tjeneste (feil vises som toast) |
| `ha.toggle(id)` / `ha.turn(id, på, ekstra)` / `ha.press(id)` / `ha.setNumber(id, v)` / `ha.select(id, valg)` | vanlige handlinger |
| `ha.moreInfo(id)` | åpner Home Assistants more-info-dialog |
| `ha.history(id, timer)` | `[{t: Date, v: number}]` (asynkront, `null` til data er lastet) |
| `ha.events(kalender, dager)` | kalenderhendelser (asynkront) |
| `ha.todo(id)` | gjøremål i en todo-liste (asynkront) |
| `ha.forecast(id, 'daily'|'hourly')` | værvarsel (asynkront) |
| `ha.config` | kortets YAML-konfig (`entities`, `images`, `props` …) |

## Overstyre entiteter

Alle oppslag som går via `ha.first(alias, …)` kan overstyres i kortet:

```yaml
type: custom:ki-claude-card
screen: Vanning
entities:
  oversikt: sensor.min_vanning_oversikt
```

Hver skjerm dokumenterer sine alias i `docs/screens/<Skjerm>.md`.
