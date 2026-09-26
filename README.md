# KI Claude

Home Assistant-dashboardet designet i **Claude Design**, bygget som ett HACS-kort – piksel for
piksel likt prototypen, og koblet til ki-integrasjonene:

| Skjerm | Integrasjon |
|---|---|
| Hjem | HA-områder/etasjer, [ki-rom](https://github.com/SebastianKristo/ki-rom), [ki-sovn](https://github.com/SebastianKristo/ki-sovn), [ki-varslinger](https://github.com/SebastianKristo/ki-varslinger), personer, vær, pris, lås, alarm … |
| Vanning | [ki-vanning](https://github.com/SebastianKristo/ki-vanning) |
| Basseng | [ki-basseng](https://github.com/SebastianKristo/ki-basseng) |
| Strøm, Strømpriser, Strømregning, Norgespris, Strøminnstillinger | [ki-strom](https://github.com/SebastianKristo/ki-strom) (KI Energi) |
| Klima, Varmepumpe | [ki-strom](https://github.com/SebastianKristo/ki-strom) + `climate.*` |
| Lys, Jul, Rom | [ki-lys](https://github.com/SebastianKristo/ki-lys), [ki-rom](https://github.com/SebastianKristo/ki-rom), [ki-utelys](https://github.com/SebastianKristo/ki-utelys) |
| Søvn | [ki-sovn](https://github.com/SebastianKristo/ki-sovn), [ki-vekking](https://github.com/SebastianKristo/ki-vekking) |
| Planter | [ki-planter](https://github.com/SebastianKristo/ki-planter) |
| Sikkerhet, Dører | [ki-varslinger](https://github.com/SebastianKristo/ki-varslinger), [ki-hyttebes-k](https://github.com/SebastianKristo/ki-hyttebes-k), `lock.*`, `alarm_control_panel.*` |
| Innstillinger | [ki-nattmodus](https://github.com/SebastianKristo/ki-nattmodus), [ki-utelys](https://github.com/SebastianKristo/ki-utelys), [ki-varslinger](https://github.com/SebastianKristo/ki-varslinger) |
| Vær, Kalender, Bursdager og post, Gjøremål, Søppel, Media, Støvsuger, Gressklipper, Kamera, Person, Bil, 3D-printer, Drivstoff, Helse, Datamaskiner, Server, Ruter (Entur), iPad | standard HA-entiteter (autodeteksjon + alias), Kalender-hytta via [ki-hyttebes-k](https://github.com/SebastianKristo/ki-hyttebes-k) |

Finnes ikke en integrasjon/entitet, viser skjermen designets egne demodata – så alt ser alltid
ut som i Claude Design, og blir «levende» etter hvert som integrasjonene er på plass.

![KI Claude](docs/img/oversikt.png)

## Installasjon (HACS)

1. HACS → ⋮ → *Custom repositories* → `https://github.com/SebastianKristo/ki-claude`, kategori **Dashboard**.
2. Last ned **KI Claude**. HACS legger til ressursen `/hacsfiles/ki-claude/ki-claude.js`.
3. Hard-refresh nettleseren (Ctrl/Cmd + Shift + R).

Manuelt: kopier `dist/ki-claude.js` til `/config/www/` og legg til `/local/ki-claude.js`
som *JavaScript-modul* under Innstillinger → Dashbord → Ressurser.

## Bruk

Hele dashboardet (anbefalt i en **panel**-visning, gjerne sammen med kiosk-mode):

```yaml
views:
  - title: Hjem
    path: hjem
    type: panel
    cards:
      - type: custom:ki-claude-card
```

Eller la kortet lage hele dashboardet: nytt dashbord → ⋮ → *Rediger* → *Rå konfigurasjon*:

```yaml
strategy:
  type: custom:ki-claude
```

(Hjem og iPad blir egne panel-visninger. Alle kortvalg under kan også settes her.)

`layout: auto | mobil | stor` styrer mobil- og nettbrett-oppsettet (standard `auto`).

iPad-dashboardet:

```yaml
type: custom:ki-claude-ipad-card
```

Én enkelt skjerm, f.eks. i en popup eller et eksisterende dashbord:

```yaml
type: custom:ki-claude-card
screen: Vanning
```

Gyldige skjermer: `hjem`, `vanning`, `basseng`, `strøm`, `strømpriser`, `strømregning`,
`norgespris`, `strøminnstillinger`, `klima`, `varmepumpe`, `lys`, `jul`, `rom`, `søvn`,
`planter`, `sikkerhet`, `dører`, `kamera`, `person`, `vær`, `kalender`, `bursdager og post`,
`gjøremål`, `søppel`, `media`, `støvsuger`, `gressklipper`, `bil`, `3d-printer`, `drivstoff`,
`helse`, `datamaskiner`, `server`, `ruter`, `innstillinger`, `ipad dashboard`.
Skjermer som tar egenskaper fra Hjem kan få dem via `props`, f.eks.
`props: { roomId: stue }` for Rom eller `props: { personId: sebastian }` for Person.

### Overstyre entiteter og bilder

Autodeteksjonen finner det meste selv. Vil du peke på en bestemt entitet, bruk alias-navnet
fra dokumentasjonen til skjermen ([docs/screens](docs/screens)):

```yaml
type: custom:ki-claude-card
entities:
  las: lock.inngangsdor
  pris: sensor.nordpool_kwh_no1_nok
  effekt: sensor.tibber_pulse_power
  vaer: weather.forecast_hjem
calendars: [calendar.familie, calendar.skole]
images:
  bil-v3-foto: /local/bil.jpg
```

## Oppsett og tilpasning

Alt som kan tilpasses i designet (faner, rom, størrelser, snarveier, tekst-setningene,
varsler på rom og navbar, navbar-stil, popup-seksjoner, header) gjøres direkte i dashboardet
via «Tilpass Hjem» / «Tilpass navbar» i ⋯-menyen, og lagres per nettleser – som i prototypen.

## Utvikling

Designfilene fra Claude Design ligger uendret i `src/screens/*.dc.html` (template + logikk).
Koblingen til Home Assistant skjer i hver fils script via `ha`-broen – se
[docs/WIRING.md](docs/WIRING.md).

```bash
npm ci
npm run build     # → dist/ki-claude.js
npm run watch
```

Runtime-en (`src/runtime/dc.js`) er en port av Claude Designs dc-runtime som rendrer designene
i kortets shadow DOM med React 18.

## Lisens

Apache 2.0. Inkluderer React (MIT).
