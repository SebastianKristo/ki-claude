# Hjem (`Hjem v2`)

Hoveddashboardet. Alt oppsett fra Claude Design (faner, kort, snarveier, tekst-setninger,
varsler, navbar, liquid glass, popup-seksjoner) virker som i designet og lagres i nettleseren
(`localStorage`), akkurat som prototypen. Popupene åpner de andre skjermene (Vanning, Strøm,
Sikkerhet, Rom …) med sin egen kobling.

Når Home Assistant har data byttes demo-innholdet ut slik:

| Del | Kilde | Alias (overstyr i `entities:`) |
|---|---|---|
| Rom (kort, etasjer, «Ute») | HA-områder og etasjer. Per rom: [ki-rom](https://github.com/SebastianKristo/ki-rom) `sensor.<rom>_oversikt` (lys, media, klima, temperatur, fukt), ellers entiteter i området | – |
| Lys på/av per rom | `light.turn_on/turn_off` på rommets lys, eller ki-lys `switch.<rom>_lys_alle` | – |
| Måltemperatur (pil opp/ned) | `climate.set_temperature` på rommets første klimaentitet | – |
| Personer, «hjemme/borte», sone | `person.*` + `zone.*` | – |
| «Sover» | [ki-sovn](https://github.com/SebastianKristo/ki-sovn) `binary_sensor.<navn>_sovn_sover` | – |
| Hilsen `{name}` | innlogget HA-bruker | – |
| Vær i teksten og i «Hjem/Profil»-toppen | `weather.*` | `vaer` |
| Ute-temperatur | `sensor.ute_temperatur` / værets temperatur | `ute_temp` |
| Strømpris + prisgraf (i dag/i morgen) | Nord Pool-/Tibber-sensor med `raw_today`/`today` (auto) | `pris` |
| Effekt (W) | effektsensor (Tibber Pulse/AMS …, auto) | `effekt` |
| Antall lys på | alle `light.*` | – |
| Hendelser i dag + kalender-kortet | alle `calendar.*` (eller `calendars:`-liste i kortet) | – |
| Dørlås (flis + lås-ark) | `lock.*` (+ `changed_by`) | `las` |
| Autolås-bryteren | [ki-varslinger](https://github.com/SebastianKristo/ki-varslinger) `switch.autolas_autolas` | `autolas` |
| Alarm | `alarm_control_panel.*` | `alarm` |
| Kamera / bevegelse | `camera.*`, bevegelsessensor på kameraet | `kamera`, `kamera_bevegelse` |
| Garasjeport | `cover.*` med `device_class: garage` | `garasje` |
| TV | `media_player.*` med `device_class: tv` | `tv` |
| Støvsuger | `vacuum.*` | `stovsuger` |
| Oppvask/vask/tørk (fliser + «Aktuelt») | statussensor + gjenstående tid (auto på navn) | `oppvask`, `oppvask_tid`, `vaskemaskin`, `vaskemaskin_tid`, `torketrommel`, `torketrommel_tid` |
| Gjøremål-lista | `todo.*` (avkryssing = `todo.update_item`) | `gjoremal` |
| Søppel | sensor/kalender for tømming (dager eller dato) | `soppel` |
| Ruter-flisen | Entur/Ruter-sensor | `ruter` |
| Kiosk-modus (hold inne hilsenen) | `input_boolean.kiosk_mode` | `kiosk` |
| Batterier-fanen | alle `sensor.*` med `device_class: battery` | – |
| Varsel-regler, tekst-kilder `{sensor.x}` og tjenestebyggeren | ekte entiteter og tjenestekall | – |

Handlinger fra fliser/snarveier/tekst (Veksle dørlås, Armer alarm, Alle lys av, Garasjeport,
TV, Støvsuger, egendefinert tjeneste med mål og data) kaller de tilsvarende HA-tjenestene.
Alarm med kode åpner Home Assistants egen dialog.

Med `popups: bubble` (settes automatisk av strategien når Bubble Card er installert) åpnes alle
skjerm-popups som Bubble Card-pop-ups via `#ki-<nøkkel>` – se README. De små hurtigarkene
(dørlås, person-hurtigvalg) og «Tilpass»-editorene ligger fortsatt i kortet.

Langt trykk på en flis/et rom/en person åpner Home Assistants more-info.
