# Varmepumpe (`Varmepumpe`)

En vilkårlig `climate`-entitet (luft-luft, luft-vann, bergvarme). Uten climate-entitet vises demo uendret.
Seksjoner uten data (varmtvann, tilleggsvarme, energi) skjules i live-modus.

| Alias | Standard | Brukes til |
|---|---|---|
| `varmepumpe` | første `climate` med `heat` og `cool` i `hvac_modes`, ellers første `climate` | modus, inne-temp, måltemp, hvac_action (Varmer/Kjøler/Holder/Av), vifte, swing, forvalg, luftfukt; navn/modell fra enhet + område |
| `ute` | climate-attr `outdoor_temperature`/`outside_temperature`, ellers første `weather` | «Ute» |
| `tur` / `retur` | – | «Inne · tur X° · retur Y°» (uten dem: «Inne · <modus>») |
| `effekt` | – | «Effekt nå» (W eller kW) |
| `energi` | – | «Energi siste 7 dager» (kWh-teller, historikk; døgnforbruk = sum av økninger) |
| `cop` | – | COP-flis og i energi-overskriften |
| `varmtvann` | første `water_heater` | varmtvann-temp (flis), driftsmodusknapper (`operation_list`, maks 4) |
| `tilleggsvarme` | – | bryter for elkolbe/tilleggsvarme |

## Handlinger
- − / +: `climate.set_temperature` (steg `target_temp_step`, grenser `min_temp`/`max_temp`; ved `heat_cool` med low/high flyttes begge).
- Flisene Modus / Vifte / Swing / Forvalg går til neste verdi: `climate.set_hvac_mode`, `set_fan_mode`, `set_swing_mode`, `set_preset_mode`. Øvrige fliser åpner more-info.
- Varmtvann: `water_heater.set_operation_mode`. Tilleggsvarme: `switch.toggle` (evt. `input_boolean`).
