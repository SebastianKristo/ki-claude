# Lys (`Lys v4`)

Integrasjoner: [ki-lys](https://github.com/SebastianKristo/ki-lys) (`ki_lys`) eller KI Rom (`ki_rom`, samme scene-entiteter), [ki-utelys](https://github.com/SebastianKristo/ki-utelys) (`ki_utelys`) for Utelys-fanen, samt vanlige `light.*` og HA-områder/etasjer.

Skjermen er live så snart det finnes lys i hass (eller `switch.ki_utelys_auto`). Uten det vises designets demo uendret.

| Alias | Standard | Brukes til |
|---|---|---|
| – (oppdages) | `sensor.<slug>_lys_oversikt` (attr. `integrasjon: ki_lys`, `ki_type: oversikt`) | rom: navn, lys, scener (`scener[].entity`) |
| `lys_alle_<area_id>` | `switch.<slug>_lys_alle` | «På/Av» per rom (på = Komfort, av = Alt av) |
| – | `light.*` med område | lys som ikke ligger i et KI-rom grupperes per HA-område |
| – | `hass.floors` / `areas[].floor_id`, ellers `sensor.<rom>_oversikt` (ki_rom: `etasje`, `etasje_id`, `etasje_niva`) | én fane per etasje («… etasje» → «… etg»); rom uten etasje → «Øvrige rom» (eller «Rom») |
| `jul_nedtelling` | `sensor.ki_jul_nedtelling` | julelysene (`lys`) holdes utenfor romlistene |
| `utelys_auto` | `switch.ki_utelys_auto` | Styring: Auto/Tidsplan = på, Manuelt = av |
| `utelys_kveld` / `utelys_morgen` | `switch.ki_utelys_kveld` / `switch.ki_utelys_morgen` | Kveld/Morgen-bryterne |
| `utelys_status` | `sensor.ki_utelys_status` | `grunn` i forklaringsteksten |
| `utelys_neste_paa` / `utelys_neste_av` | `sensor.ki_utelys_neste_paa` / `_neste_av` | «Tennes/Slukkes HH:MM» og mørkebåndet på tidslinjen (reserve: `sun.sun` `next_dusk`/`next_dawn`) |
| `utelys_terskel_paa` / `utelys_terskel_av` / `utelys_minst_morke` | `number.ki_utelys_*` | tekst for Auto/Tidsplan |
| `sol` | `sun.sun` | soloppgang/-nedgang, borgerlig skumring, dagslengde (Sola-panelet og tidslinjen) |

**Utelamper** (i prioritert rekkefølge): `utelys:` i kortkonfig (liste med entity_id eller `{entity, name, icon}`), lampene i skjermens egen «Innstillinger → Utelamper» (lagres i nettleseren) hvis entitetene finnes, ellers lys med `ute/utelys/veranda/terrasse/inngang/hage/carport/fasade/garasje` i id-en eller i et område som heter «Ute/Hage/Utendørs».

```yaml
type: custom:ki-claude-card
screen: Lys
utelys: [light.verandalampe, {entity: light.utelys_inngang, name: Inngang, icon: wall_lamp}]
```

Handlinger:
- Trykk på en lampe: `light.toggle` (eller `switch.toggle` osv.). Dra: forhåndsvisning lokalt, `light.turn_on` med `brightness_pct` (0 = `turn_off`) når du slipper.
- Etasjescener (Maks/Kveld/Dempet/Natt/Alt av → `maks`/`komfort`/`mindre`/`natt`/`av`): trykker `button.<slug>_lys_<scene>` i hvert rom i etasjen, ellers `ki_lys.sett`/`ki_rom.sett` med `rom`, ellers `light.turn_on/off` med lysstyrke.
- Rom «På/Av»: `switch.<slug>_lys_alle` (ellers hver lampe).
- «Slå av alle»: `light.turn_off` på alle lys som er på. En linje i «Lys på»: `turn_off`.
- Utelys-knappen: `turn_on/turn_off` på alle utelamper. Kveld/Morgen: `switch.toggle`. Manuelt/Auto: `switch.turn_off/turn_on` på `switch.ki_utelys_auto`.

Merk: «ca. X W» er et estimat (≈ 9 W per lampe ved 100 %). Innstillinger-feltene for tider/lux er fortsatt bare lokale (ki_utelys har ingen entiteter for dem); uten ki_utelys er Auto/Tidsplan/Kveld/Morgen bare visning.
