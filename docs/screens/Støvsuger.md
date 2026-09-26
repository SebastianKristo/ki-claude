# Støvsuger (`Støvsuger`)

Standard HA-domene `vacuum.*` (Roborock, Xiaomi, Dreame, Ecovacs …). Første `vacuum.*` brukes; søsken-entiteter finnes via samme object_id (Roborock-navngiving).

| Alias | Standard | Brukes til |
|---|---|---|
| `stovsuger` | kortkonfig `vacuum:` eller første `vacuum.*` | status, navn i toppen, start/pause/dokk/finn, sugestyrke (`fan_speed`/`fan_speed_list`) |
| `batteri` | `sensor.<v>_battery` (ellers attributtet `battery_level`) | batteriring |
| `fremdrift` | `sensor.<v>_cleaning_progress` | «n % ferdig» |
| `areal` / `tid` | `sensor.<v>_cleaning_area` / `_cleaning_time` | undertekst (pågående/siste tur) |
| `sist` | `sensor.<v>_last_clean_end` | «Sist støvsuget i går 14:20» |
| `rom_na` | `sensor.<v>_current_room` | «Støvsuger kjøkken», robotprikken i kartet |
| `hovedborste`, `sideborste`, `filter`, `sensorer` | `sensor.<v>_main_brush_time_left`, `_side_brush_time_left`, `_filter_time_left`, `_sensor_time_left` | Slitedeler (restlevetid; levetid 300/200/150/30 t) |
| `reset_hovedborste` … `reset_sensorer` | `button.<v>_reset_main_brush_consumable` osv. | «Merk som byttet» |
| `total_tid`, `total_areal`, `turer` | `sensor.<v>_total_cleaning_time`, `_total_cleaning_area`, `_total_cleaning_count` | Info-tallene |
| `mopp` / `mopp_modus` | `switch.<v>_mop` / `select.<v>_mop_intensity` | Mopp-bryteren |
| `stille`, `stille_start`, `stille_slutt` | `switch.<v>_do_not_disturb`, `time.<v>_do_not_disturb_begin/_end` | Stille timer |
| `tom` | `button.<v>_empty_bin` / `_start_empty` / `_evacuate` | «Tøm» (ellers more-info) |

Mangler en bryter vises den ikke; manglende tall vises som «—».

**Kortkonfig (rom/soner – HA har ingen standard for dette):**
```yaml
rooms:            # rom-kort og kart
  - {name: Kjøkken, segment: 16, icon: kitchen, m2: 12, rect: [4, 4, 44, 34]}   # rect valgfri (x,y,b,h i %)
room_command: app_segment_clean   # standard (Roborock/Xiaomi)
zones:
  - {name: Under bordet, zone: [25500, 25500, 27500, 27500]}   # app_zoned_clean
  - {name: Stue, entity: script.stue_stovsug}                   # eller service: + data:
```
Uten `rooms` er rom-listen tom («Legg til rom i kortkonfig»).

Handlinger: Start → `vacuum.start` (eller `vacuum.send_command` `app_segment_clean` med valgte segmenter / `app_zoned_clean` for sone), Pause → `vacuum.pause`, Dokk → `vacuum.return_to_base`, Finn → `vacuum.locate`, Tøm → `button.press`, sugestyrke → `vacuum.set_fan_speed`, Mopp → `switch.toggle`/`select.select_option`, Stille timer → `switch.toggle`, «Merk som byttet» → `button.press`. Rom-/sonevalg er lokal UI-tilstand. Ingen simulering i live-modus.
