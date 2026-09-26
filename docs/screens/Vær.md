# Vær (`Vær v3`)

Standard `weather.*` med `weather.get_forecasts` (daily + hourly) via `ha.forecast`, pluss `sun.sun`, månefase, farevarsler og pollen.

| Alias / config | Standard | Brukes til |
|---|---|---|
| `vaer` (eller `weather:`) | `weather.forecast_home`, `weather.home`, ellers første `weather.*` | «Været nå» (temp, H/L i dag, tilstand, vind m/s + retning, nedbør neste time), timevarsel (12 t), dagskort (7 dager), detaljkort (skydekke, vind/retning, vindkast, fukt/duggpunkt, UV, trykk, nedbør 24 t), animasjon/ikon etter tilstand (natt: måne) |
| `place` (kortkonfig) | værentitetens navn uten «Forecast » | stedsnavn i toppkortet |
| `sol` | `sun.sun` | soloppgang/-nedgang, solhøyde, solbanen, nattikoner |
| `maane` | `sensor.moon_phase` (Moon-integrasjonen) | Månefase-kortet (navn + skygge), «Andre varsler» |
| `uv` | `sensor.uv_index` (ellers `uv_index`-attributtet) | UV-kortet |
| `farevarsel` / `alerts: [ids]` | sensorer `sensor.met_alerts*`, `sensor.metalerts*`, `sensor.norway_alerts*`, `sensor.meteoalarm*` | Farevarsler. Leser `alerts`/`warnings`-lister eller enkeltvarsel i attributtene: `title`, `event`, `awareness_level` («2; yellow; Moderate») / `level`/`severity`, `starttime`/`endtime`, `description`, `instruction`, `consequences`, `area`. Pågår/Ventet ut fra tid; utløpte skjules |
| `pollen_<plante>` | `sensor.pollen_<hazel\|alder\|salix\|birch\|grass\|mugwort>_*_today` | Pollen-sliden (none/low/moderate/severe/extreme eller 0–4); mangler → «—» |

Vindhastighet konverteres fra `wind_speed_unit` (km/h, mph, kn) til m/s. Mangler værentiteten (eller den er `unavailable`), vises demoen. Når vær er live men ingen varselsensor finnes, skjules farevarsel-seksjonen. «Forhåndsvis vær» i Tilpass-arket overstyrer animasjonen til siden lastes på nytt.

Handlinger: ingen tjenestekall (kun visning). Tilpass-oppsettet (rekkefølge/skjul) lagres lokalt som før.
