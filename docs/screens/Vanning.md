# Vanning (`Vanning v4`)

Integrasjon: [ki-vanning](https://github.com/SebastianKristo/ki-vanning) (`ki_vanning`), begge moduser (egne ventiler og OpenSprinkler).

| Alias | Standard | Brukes til |
|---|---|---|
| `oversikt` | `sensor.ki_vanning_oversikt` | soner, programmer, planlagte kjøringer, forbruk per periode, planlegger/kø, regnpause, anlegg |
| `estimat_i_dag` | `sensor.ki_vanning_estimat_i_dag` | estimat per sone i dag |
| `aktiv_sone` | `sensor.ki_vanning_aktiv_sone` | pågående kjøring (liter denne kjøringen) |
| `forbruk_i_dag` | `sensor.ki_vanning_forbruk_i_dag` | historikk (høyeste verdi per døgn fra recorder) |
| `anlegg` | `switch.ki_vanning_anlegget` | tannhjulet åpner more-info |
| `strom` | `sensor.<prefiks>_current_draw` | strømtrekk (OpenSprinkler) |

Handlinger: `ki_vanning.kjor`, `kjor_program`, `stopp`, `sett_regnpause` (også «Hopp over» = regnpause til neste kjøring er forbi), `nullstill_regnpause`, `sett_anlegg`, `nullstill` (bekreftes), `lag_program` (aktiver/deaktiver program). I OpenSprinkler-modus: `opensprinkler.run_program` / `opensprinkler.stop` og program-bryterne.
