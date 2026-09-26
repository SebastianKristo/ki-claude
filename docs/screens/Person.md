# Person (`Person`)

Prop `personId` (sebastian / cybele / rune). Standard HA: `person.*`, mobile_app-sensorer, `zone.*`, recorder-historikk. Tillegg: [ki_sovn](https://github.com/SebastianKristo/ki-sovn) og [ki_hyttebesok](https://github.com/SebastianKristo/ki-hyttebesok).

| Alias / konfig | Standard | Brukes til |
|---|---|---|
| `person_<id>` | `person.sebastian_kristo_jemtland` / `person.cybele_kristo` / `person.rune_jemtland` → `person.<id>` → `person.<id>_*` / fornavn | navn (fornavn), bilde (`entity_picture`), sone, «… siden HH:MM», soner i dag |
| `mobil:` (streng eller `{<id>: prefiks}`) | prefiks fra personens `device_trackers` (`sensor.<tracker>_battery_level` finnes), ellers `sensor.<id>_*_battery_level` | `battery_level`, `battery_state`, `connection_type` (+ Cellular Technology), `ssid`/`wifi_connection`, `geocoded_location`, `steps`, `distance`/`walking_running_distance`, `binary_sensor.<prefiks>focus`, søvnfaser `awake/core_sleep/deep_sleep/rem_sleep`, `sleep_duration` |
| `sovn_<id>` | `binary_sensor.<id>_sovn_sover` (ki_sovn) → `switch.homey_logic_<id>_sovn_vaken` → ki_sovn-sensor med `navn` | søvnvindu og -tid i natt, blokker (Sover/Våken) når fasene mangler, uke-stolper, «Våknet» i soner i dag |
| `sovnvarighet_<id>` | `sensor.<prefiks>sleep_duration` | søvn i natt og uke-stolper |
| `sovnscore_<id>` | `sensor.<prefiks>sleep_score` / `sensor.<id>_sovn_score` / `_sleep_score` | søvnscore-flisen og «God/Grei/Urolig natt» (ellers fra varigheten ≥ 7 t / ≥ 6 t) |
| (ki_hyttebesok) | `sensor.ki_hyttebesok_<sted>_netter_<navn>` (`ki_type: person`), `sensor.ki_hyttebesok_oslo_helger` (`hvor_er_vi_naa`) | «hyttenetter i år» når en aktivitetsflis mangler; sted når personen er borte |

Fliser: skritt, reist i dag, søvnscore (eller søvn i natt) – manglende data vises som «–». Soner i dag bygges fra personens historikk i dag («Forlot hjemmet», «Ankom skole», «Kom hjem»). Hjemmets navn fra `hass.config.location_name` eller `geocoded_location`.
Ingen handlinger (visning). Finnes ikke person-entiteten, vises designets demo for personen.
