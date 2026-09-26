# Helse (`Helse`)

Ingen ki-integrasjon. Leser helsesensorer fra iOS/Android companion-app, Withings, Garmin o.l.
Alle verdier slås opp som `ha.first('helse_<suffiks>', <prefiks><suffiks>)`. Prefiks = `helse.prefiks`,
ellers `sensor.sebastian_iphone_17_pro_` (samme som `ki-helse-card`), ellers første `sensor.*_steps`.

| Alias (`helse_…`) | Suffiks (alternativ) | Flis |
|---|---|---|
| `helse_steps` | `steps` | Skritt + ring |
| `helse_active_energy` | `active_energy` | Aktiv energi + ring |
| `helse_exercise_time` | `exercise_time` | Trening + ring |
| `helse_walking_running_distance` | `walking_running_distance` (`distance`), m → km | Distanse |
| `helse_floors_ascended` / `helse_floors_descended` | `floors_ascended` (`flights_climbed`) / `floors_descended` | Etasjer |
| `helse_average_active_pace` | (`walking_speed`) | Snittfart |
| `helse_resting_energy` | (`basal_energy`) | Hvileenergi |
| `helse_heart_rate`, `helse_resting_heart_rate`, `helse_walking_heart_rate_average`, `helse_heart_rate_variability`, `helse_vo2_max`, `helse_blood_oxygen` (`oxygen_saturation`), `helse_respiratory_rate` | samme | Hjerte-fanen |
| `helse_blood_pressure_systolic` + `helse_blood_pressure_diastolic` | samme | Blodtrykk «118/76» |
| `helse_in_bed`, `helse_sleep_duration` (`asleep`), `helse_heart_rate_variability_sleep` | h/min/s | Søvn-fanen |
| `helse_deep_sleep`, `helse_core_sleep`, `helse_rem_sleep`, `helse_awake` | – | søvnfaser (stolpe) |
| `helse_weight` (`body_mass`), `helse_height` (m → cm), `helse_lean_body_mass`, `helse_body_fat_percentage`, `helse_body_temperature`, `helse_basal_body_temperature`, `helse_blood_glucose`, `helse_water` (ml → l) | – | Kropp-fanen |

Kortkonfig: `helse: { prefiks: sensor.min_telefon_, mal: { skritt: 10000, trening: 60, energi: 600 }, kilde: 'Min iPhone', app: 'Apple Helse' }`.
Bunnteksten viser enhetsnavnet til skrittsensoren. Manglende sensorer vises som «–».

Handlinger: trykk på en flis åpner more-info.
