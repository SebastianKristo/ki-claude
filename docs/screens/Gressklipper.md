# Gressklipper (`Gressklipper`)

Standard HA-domene `lawn_mower.*` (f.eks. Husqvarna Automower, Worx Landroid, Mammotion). Første `lawn_mower.*` brukes; søsken-entiteter finnes via samme object_id (`sensor.<klipper>_battery` osv.).

| Alias | Standard | Brukes til |
|---|---|---|
| `gressklipper` | kortkonfig `mower:` eller første `lawn_mower.*` | status (Klipper/Pauset/Parkert/Lader/Kjører hjem/Feil), navn i toppkortet, klippe-animasjon |
| `batteri` | `sensor.<klipper>_battery` / `_battery_level` (ellers attributtet `battery_level`) | batteri i toppkortet |
| `lader` | `binary_sensor.<klipper>_charging` | «Lader» vs. «Parkert» når dokket (ellers: batteri < 100 % = lader) |
| `klippetid` | `sensor.<klipper>_cutting_time` / `_mowing_time` / `_total_cutting_time` | statistikk-pille 1 |
| `knivslitasje` | `sensor.<klipper>_cutting_blade_usage_time` / `_blade_usage` | statistikk-pille 2 |
| `areal` | `sensor.<klipper>_area` / `_work_area_progress` / `_total_drive_distance` | statistikk-pille 3 |
| `signal` | `sensor.<klipper>_rssi` / `_wifi_signal` | statistikk-pille 4 (dBm → God/Middels/Svak) |
| `arbeidsomraade` | `sensor.<klipper>_work_area` | «Soner» (enum-`options`) og aktiv sone |
| `timeplan` | `calendar.<klipper>` | «Timeplan»: første klippevindu per ukedag neste 7 dager |
| `timeplan_bryter` | `switch.<klipper>_enable_schedule` | trykk på en dag åpner more-info (hvis ingen kalender) |

Manglende sensorer vises som «—». Statistikk-piller åpner more-info.

**Kortkonfig (valgfritt):** `zones: [{name, entity?, service?, data?, sist?}]` – egne soner. `entity` (script/button/switch/…) slås på, `service: domene.tjeneste` kalles med `data`; `sist` = sensor med tidspunkt for siste klipp («i dag», «i går», «n d siden»).

Handlinger: Start → `lawn_mower.start_mowing`, Pause → `lawn_mower.pause`, Hjem → `lawn_mower.dock`, Parker → `husqvarna_automower.override_schedule` (`override_mode: park`, 3 t) for Automower, ellers `lawn_mower.dock`. Autodetekterte soner og dager åpner more-info.
