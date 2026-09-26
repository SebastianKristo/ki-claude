# Ruter (`Ruter v2`)

Kollektivtrafikk (Ruter/Entur). Ingen ki-integrasjon; bruker HA-integrasjonen **Entur**
(`entur_public_transport`) for avganger og **Entur SX** (`entur_sx`) for avvik.

| Kilde | Oppslag | Brukes til |
|---|---|---|
| Stopp | alle sensorer fra `entur_public_transport`, eller `sensor.entur_*`/`sensor.transport_*` med `route`/`due_at`/`stop_id` | avgangskort, «Legg til stopp» |
| Avganger | attributter `route` («17 Grefsen st.»), `due_at`/`due_in`, `real_time`, `next_route`/`next_due_at`, `departure_#3…` («ca. 12:34 17 Grefsen»), `route_N`/`due_at_N`, `transport_mode` | linje, mål, minutter, sanntidsmerke |
| Avvik | `sensor.*_summary` fra `entur_sx` + linjesensorer `sensor.<enhet>_<operatør>_line_<linje>` (state = antall eller oppsummering; attributter `summary`, `status`/`progress` (open/planned), `description`, `valid_from`, `valid_to`) | avvikskortet og «Linjer funnet» |

Transportmiddel: `transport_mode`, ellers linjenummer (1–6 T-bane, 11–19 trikk, bokstav = tog, ellers buss).

Standardoppsett (før brukeren redigerer) fra kortkonfig, ellers de fem første stoppene og første
oppsummeringssensor:

```yaml
ruter:
  stops:
    - { entity: sensor.transport_majorstuen, name: Majorstuen, icon: subway, walk: 4 min gange, lines: ['2', '5'], n: 3 }
  summary: sensor.ruter_disruption_summary
```

Endringer i «Rediger» (stopp, linjefilter, antall, avvikssensor, egne linjesensorer, visning) lagres i
localStorage (`ruter-v2-cfg`) som i designet; «Tilbakestill» går tilbake til standardoppsettet.
Langt trykk på et stopp/avvik åpner more-info (`data-ent`).
