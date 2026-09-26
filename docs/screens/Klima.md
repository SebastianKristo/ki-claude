# Klima (`Klima v2`)

Integrasjon: KI Energi (`ki_energi`, repo ki-strom) + vanlige `climate`-entiteter og rom-sensorer.
Uten `sensor.ki_energi_status` **og** uten `climate.*` vises designets demo uendret.

ki_energi har faste entity_id-er (`<plattform>.<nøkkel>`). De viktigste kan overstyres med alias:

| Alias | Standard | Brukes til |
|---|---|---|
| `status` | `sensor.ki_energi_status` | hode (effekt, fargesone, tillatt kW, kWh igjen, kW ledig, min igjen), prognose 15/30/60/120 min, personer (Leggetid/ferie), «Slik tenker motoren nå» |
| `laster` | `sensor.ki_laster` | soner (navn, nå-temp, mål, handling, overstyring, leggetid, person), «Vurdering per sone», bad-gulvvarme |
| `nettleie` | `sensor.ki_nettleie` | «Siste 12 timer» (`timer_siste_12`), døgnmaks, snitt topp 3, topp tre |
| `time_energi` | `sensor.ki_time_energi` | inneværende time i 12-timersgrafen |
| `estimert_timesforbruk` | `sensor.ki_estimert_timesforbruk` | «forventet nå» |
| `sparing` / `besparelse` | `sensor.ki_sparing` / `sensor.ki_besparelse` | «KI sparer» (poster, total, kWh flyttet, nettleie) |
| `bereder` | `sensor.ki_bereder` | legionella-ring, status, bryter (`attr bryter`), varmtvann-kort |
| `billige_timer` | `sensor.ki_vvb_billige_timer` | prisstyring (`doegn`, grønn = valgt time) |
| `hanklevarmer` | `sensor.ki_hanklevarmer` | Bad: håndklevarmer, sparing, dusjvinduer |
| `logg` | `sensor.ki_beslutningslogg` | beslutningslogg (5 nyeste, antall) |
| `tidskonstanter` | `sensor.ki_tidskonstanter` | innlærte tidskonstanter |
| `lys` | `sensor.ki_lys` | lysregler (`switch.ki_lys_<key>`) |
| `prognoselaering` | `sensor.ki_prognoselaering` | prognose og reserver |
| `effekt` | – | kun uten ki_energi: effekt i hodet |

Faste entiteter (uten alias): `switch.ki_helgemodus`, `ki_sommermodus`, `ki_hjemkomst_aktiv`, `ki_<person>_ferie` (ungdom), `binary_sensor.ki_alle_borte`,
`switch.ki_styr_<sone>`, `number.ki_rom_<rom>_temp` (finnes via attr `rom`), `sensor.ki_styrt_effekt`/`ki_uregulert_effekt` (+historikk 6 t),
`number.ki_stat_*`, alle `number.`/`time.`/`switch.ki_*` i Energi/Oppsett/Avansert, `binary_sensor.ki_vvb_boost_aktiv`, `ki_vvb_legionella_ok/forfalt`.
Hodets effekt leses fra `attr entiteter.total_effekt` på statussensoren.

Romtemperatur/luftfukt: sensorer med `device_class` temperature/humidity i samme HA-område som sonens `climate` vises i sonedetaljen (og brukes som temperatur hvis motoren ikke har en).
**Uten ki_energi:** alle `climate.*` vises som soner (± kaller `climate.set_temperature`), hodet viser snitt inne / antall som varmer / antall termostater.

## Handlinger
- Borte / Sommer / «<Navn> ferie»: `switch.toggle`. Hjemkomst: `ki_energi.hjemkomst {naa: true}` / `ki_energi.hjemkomst_ferdig`. Alle borte: more-info.
- Leggetid: `ki_energi.leggetid {sone, avbryt}` for alle soner til personen.
- Sone ±: `number.set_value` på `number.ki_rom_<rom>_temp` (permanent dagtemperatur); mens sonen er overstyrt: ny `ki_energi.overstyr` med gjenværende tid. Finnes ikke romnummer, holdes verdien lokalt til en varighet velges.
- 1 t / 2 t / 6 t: `ki_energi.overstyr {sone, temp, minutter}`; trykk igjen = `ki_energi.fjern_overstyring`. «KI styrer sonen»: `switch.ki_styr_<sone>`.
- Bereder: bryter/prisstyring/legionella `switch.toggle`, `ki_energi.vvb_boost` / `vvb_avbryt_boost`, `ki_energi.vvb_tving_syklus`.
- Oppsett: «Motoren styrer ovnene» = `switch.ki_skyggemodus` (invertert), øvrige brytere `switch.toggle`. Rader med tall/tid åpner more-info (for redigering).
