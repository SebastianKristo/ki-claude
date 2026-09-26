# Søppel (`Søppel`)

Tømmekalender fra sensorer (Min renovasjon, waste_collection_schedule, renovasjonsportal) eller en `calendar.*`. Skjermen har egen redigering (tannhjul) der hver fraksjon kan få en sensor; den lagres i nettleseren (`localStorage: soppel-cfg`) og vinner over kortkonfig.

| Alias / config | Standard | Brukes til |
|---|---|---|
| fraksjon `entity` (redigering / `fractions`) | `sensor.min_renovasjon_restavfall`, `_plastemballasje`, `_papir`, `_glass_og_metallemballasje` | datoer per fraksjon |
| `fractions: [{name, entity, match?, icon?, color?, start?, step?}]` (kortkonfig) | – | egne fraksjoner. `entity` kan være `calendar.*`; `match` = tekst i hendelsesnavnet (standard: første ord i `name`) |
| `tommekalender` | – | `calendar.*` der fraksjonene autodetekteres fra hendelsesnavnene |
| – | sensorer fra plattformene `min_renovasjon`, `waste_collection_schedule`, `renovasjonsportal` | autodeteksjon når verken standard-id-ene, `fractions` eller `tommekalender` finnes (ikon/farge ut fra navnet) |
| `varsel` (eller `notify_entity`) | – | bryter for «Varsle kvelden før» (input_boolean/automation/switch) |

Sensortolkning: dato i state (`2026-09-28`, `28.09.2026`, ISO-tid), attributter `next_date`/`next_pickup`/`neste`/`date`, lister `upcoming`/`dates`, attributtnøkler som er datoer (WCS), eller antall dager (state/`days_to`/`daysTo`). Intervallet («Hver 2. uke») beregnes fra kommende datoer.

Live-regler: finnes minst én fraksjons-entitet, er «i dag» = nå og kalenderen starter på inneværende måned. Fraksjoner med sensor men uten datoer skjules; fraksjoner uten sensor bruker sitt manuelle intervall (start/steg) regnet frem fra i dag. Flere fraksjoner samme dag vises som «Restavfall + Matavfall». «Varsle kvelden før» vises i live kun når `varsel` er satt, og trykk kaller `toggle` på den. Ingen andre tjenestekall (skjermen er kun visning).
