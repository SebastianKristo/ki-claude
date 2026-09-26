# Bursdager og post (`Bursdager og post`)

Samme datakilder som `ki-post-bursdag-card` i ki-cards.

| Alias / konfig | Standard | Brukes til |
|---|---|---|
| `bursdager` | `calendar.birthdays` → `calendar.bursdager` → `calendar.fodselsdager` | bursdager (neste 370 dager via `ha.events`). Navn fra tittelen («Rune (1969)», «Rune's Birthday», «Tante Kari fyller 52 år»); fødselsår fra `(1969)`, `f. 1969`, `Født 1969-01-21` eller «fyller N år» |
| `bursdager:` (liste) | – | ekstra bursdager i kortkonfig: `[{navn, dato: 'YYYY-MM-DD'}]` |
| `post` | `sensor.nar_kommer_posten_posten_sensor_next` → `sensor.posten_neste_levering` (eller en `calendar.*`) | postdager: attributtene `delivery_dates`/`next_delivery_dates`/`dates`, ellers annenhver hverdag regnet fra tilstanden (neste leveringsdato) |
| `postdager:` | – | faste postdager, f.eks. `[2, 4]` (1 = mandag) |
| `postnummer:` / `sted:` | `postal_code`/`postnummer` og `city`/`sted` på post-sensoren | «Posten · 1670 Strømstad» |
| `pakker:` | alle `sensor.*_status` fra plattformen `norwegian_parcel_tracker` (`false` skjuler) | pakker: status → steg (registrert/transport/klar til henting), `estimated_delivery`/`forventet_levering`, `pickup_point`/`hentested`, `latest_event`; leverte skjules |

Handlinger: «Legg til bursdag» → `calendar.create_event` på bursdagskalenderen: heldagshendelse «Navn (år)» med `rrule: FREQ=YEARLY` (støtter ikke kalenderen det, legges ti år inn én og én). Den nye bursdagen vises med én gang.
Kalendervisningen viser bursdager, postdager og pakker (forventet dato). Datoer er «i dag» i live; mangler en kilde vises en nøytral tekst («Ingen bursdager», «–»). Uten noen av kildene vises designets demo.
