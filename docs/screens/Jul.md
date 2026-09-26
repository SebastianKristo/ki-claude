# Jul (`Jul`)

Integrasjon: julelys-delen av [ki-lys](https://github.com/SebastianKristo/ki-lys) (`ki_lys`, `jul.aktiv`) eller KI Rom (samme entiteter, `integrasjon: ki_lys`). Live når `sensor.ki_jul_nedtelling` finnes; ellers demo.

| Alias | Standard | Brukes til |
|---|---|---|
| `nedtelling` | `sensor.ki_jul_nedtelling` (reserve: `ha.ki('ki_lys', ki_type: jul)`) | dager igjen (state), overskrift («Til julaften» / «Til julesesongen» / «Til julesesongen slutter»), `grupper[].lys[]` → lyskortene, `antall` |
| `tent` | `sensor.ki_jul_tent` | «X av Y julelys på» |
| `alle_pa` / `alle_av` | `button.ki_jul_alle_pa` / `button.ki_jul_alle_av` | stor knapp «Alle på/Alle av» |
| `sesong` | `switch.ki_jul_sesong` | reserve for stor knapp |
| `i_sesong` | `binary_sensor.ki_jul_i_sesong` | Automasjon-fanen hvis ingen julautomasjoner finnes (sesong fra–til, trykk = more-info) |

Lyskort: ikon/farge etter gruppe (`stjerner` → stjerne, `staker` → lysestake, `ute` → rød, juletre → grønt tre). Status leses direkte fra lysentiteten. Adventsteksten regnes ut fra dagens dato (neste adventssøndag / julaften). Er nedtellingen `unavailable`, regnes dagene til julaften lokalt.

**Automasjon-fanen**: `jul_automasjoner:` i kortkonfig (liste med `automation.*`), ellers alle `automation.*` med «jul» eller «advent» i id/navn. Undertekst = «Sist kjørt …».

Handlinger: lyskort → `<domene>.toggle`; «Alle på/av» → `button.press` (ellers `switch.turn_on/off` på `switch.ki_jul_sesong`, ellers `homeassistant.turn_on/off` på lysene); automasjonsbryter → `automation.toggle`.
