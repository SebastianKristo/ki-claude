# Søvn (`Søvn`)

Integrasjoner: KI Søvn (`ki_sovn`, personer + innebygd vekking) og KI Vekking (`ki_vekking`, eldre frittstående vekking).
Uten noen av dem vises demo uendret. Personer og vekkinger oppdages automatisk (ingen alias).

| Entitet | Oppdages som | Brukes til |
|---|---|---|
| `binary_sensor.<navn>_sovn_sover` | attr `integrasjon: ki_sovn`, `type: person` | sover ja/nei, navn, `siden`, `sannsynlighet`, «Vindu åpent» (`obs_vindu_åpent`) |
| `sensor.<prefix>_sannsynlighet` + `number.<prefix>_terskel` | via attr `prefix` | tidslinje siste 24 t og «sov X t Y min i natt» (historikk ≥ terskel) |
| `button.<prefix>_sett_sover` / `_sett_vaken` | | bryteren per person |
| `sensor.<navn>_vekking_neste_alarm` | `type: vekking` (ki_sovn) eller entity_id-suffiks (ki_vekking) | vekkekort, «Neste vekking HH:MM · om …» (`neste_tidspunkt`), lamper, person, hopper over |
| `switch.<prefix>_aktiv`, `switch.<prefix>_<dag>_aktiv`, `time.<prefix>_<dag>`, `number.<prefix>_fade_opp` | | av/på, ukedager, tid, fade |

ki_sovn har **ingen søvnscore eller søvnfaser**; designet har heller ikke det, så «sov X t» beregnes fra sannsynlighetshistorikken. Uten historikk vises «Våken/Sover siden HH:MM · NN %».

## Handlinger
- Personbryter: `button.press` på `sett_sover` / `sett_vaken`.
- Vekking av/på: `switch.toggle` på `switch.<prefix>_aktiv`. Ukedagsknapper: `switch.toggle` på `<dag>_aktiv`.
- − / + (15 min): `time.set_value` på den viste dagens tid (neste alarmdag, ellers i dag) **og** alle andre aktive dager med samme tid (typisk alle hverdager). Viste dag er markert med ring.
