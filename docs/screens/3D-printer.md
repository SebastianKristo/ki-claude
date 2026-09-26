# 3D-printer (`3D-printer`)

Ingen ki-integrasjon. Støtter Creality K2 (samme entiteter som `ki-k2-card`), Bambu Lab, OctoPrint,
PrusaLink og Moonraker. Alle entiteter bygges fra et **prefiks**: `printer.prefiks` i kortkonfig,
ellers `creality_k2` hvis `sensor.creality_k2_print_status` finnes, ellers første `sensor.*_print_status`,
`*_current_state`, `*_print_progress` eller `*_job_percentage`. Hver rolle kan overstyres med alias
`printer_<rolle>`; første eksisterende kandidat brukes.

| Alias | Kandidater (`<p>` = prefiks) | Brukes til |
|---|---|---|
| `printer_status` | `sensor.<p>_print_status`, `_current_state`, `_status`, `sensor.<p>` | status (Klar/Skriver ut/Pause/Ferdig/Av) |
| `printer_progress` | `sensor.<p>_print_progress`, `_job_percentage`, `_progress` | fremdrift |
| `printer_time_left` | `sensor.<p>_print_time_left`, `_remaining_time`, `_time_remaining` (s/min/h, H:MM:SS eller tidsstempel) | «ca. … igjen» |
| `printer_layer` / `printer_layers` | `sensor.<p>_working_layer`/`_current_layer`, `_total_layers`/`_total_layer_count` | «Lag x av y» |
| `printer_file` | `sensor.<p>_current_object`, `_task_name`, `_gcode_filename`, `_filename`, `_job_name` | filnavn |
| `printer_nozzle` / `printer_nozzle_target` | `sensor.<p>_nozzle_temperature`, `_actual_tool0_temp` / `number.<p>_nozzle_target`, `sensor.<p>_target_nozzle_temperature` | dysetemp. |
| `printer_bed` / `printer_bed_target` | `sensor.<p>_bed_temperature`, `_actual_bed_temp`, `_heatbed_temperature` / `number.<p>_bed_target` … | platetemp. |
| `printer_chamber` | `sensor.<p>_chamber_temperature` | kammer |
| `printer_pause` / `printer_resume` / `printer_stop` | `button.<p>_pause_print`/`_pause_printing`/`_pause_job`, `…resume…`, `…stop_print`/`_cancel_job` | styreknapper |
| `printer_light` | `light.<p>_light`, `light.<p>_chamber_light`, `switch.<p>_light` | Lys |
| `printer_power` | `switch.<p>` | Strøm |
| `printer_camera` | `camera.<p>_printer_camera`, `camera.<p>_camera`, `camera.<p>` | kamerabilde (trykk = more-info) |
| `printer_speed`, `printer_part_fan`, `printer_chamber_fan`, `printer_z_offset`, `printer_layer_height` | `sensor.<p>_print_speed`, `fan.<p>_model_fan`, `fan.<p>_case_fan`, `sensor/number.<p>_z_offset`, `sensor.<p>_layer_height` | Avansert-fanen |
| `printer_slot_1…4` | `sensor.<p>_cfs_box_1_slot_N_filament` (+ `_color`, `_remaining`) eller `sensor.<p>_ams_1_tray_N` (attr. `type`, `color`, `remain`) | filamentslots |
| `printer_active_slot` | `sensor.<p>_active_filament_slot`, `_active_tray` | valgt slot |
| `printer_cfs_temp` / `printer_cfs_hum` | `sensor.<p>_cfs_box_1_temperature`/`_humidity`, `sensor.<p>_ams_1_…` | «24 °C · 31 % RF» |
| `printer_start` | `printer.start` i kortkonfig (button/script) | «Skriv ut siste jobb» (vises kun når satt) |

Kortkonfig: `printer: { prefiks: creality_k2, navn: Creality K2, start: script.skriv_ut_siste }`.

Handlinger: `button.press` (pause/fortsett/stopp – stopp bekreftes), `light/switch.toggle` (lys, strøm – bekreftes
under utskrift), filamentslot → more-info.
