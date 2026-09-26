# Kalender (`Kalender`)

Standard `calendar.*` via `ha.events` (REST `calendars/<id>`), pluss [ki-hyttebesok](https://github.com/SebastianKristo/ki-hyttebesok) for Hytta-fanen. Gave-knappen embedder «Bursdager og post» (egen skjerm, ikke endret her).

| Alias / config | Standard | Brukes til |
|---|---|---|
| `calendars: [id \| {entity, name, color}]` (kortkonfig) | alle `calendar.*` unntatt Sonarr/Radarr/Plex, renovasjon og klipper-kalendere | «Kommende» (liste, 8 første dager med hendelser) og «Måned» (antall-merker, dagsliste). Navn = hvem (kalenderens navn), farge per kalender |
| `upcoming: [id]` (kortkonfig) | `calendar.*` med `sonarr`/`radarr`/`lidarr`/`plex`/`kino` i id-en | «Framover» (14 dager). `Serie - 1x03 - Tittel` splittes i tittel/undertekst; Radarr = Film, Sonarr = Serie, Plex = Plex. `downloaded`/`hasFile` i beskrivelsen gir hake |
| – | `ki_hyttebesok` Oversikt-sensorer (`integrasjon: ki_hyttebesok`, `ki_type: oversikt`), f.eks. `sensor.ki_hyttebesok_stromstad_oversikt` | «Hytta»: kort per sted + «Alle steder» (netter/besøk i år, hvem er her), kalender (`dager`, stiplet = planlagt fra `kommende`), Opphold (`opphold`), Statistikk (`per_maaned`, sted-kort), «lest HH:MM» (`sist_lest`) |

Hver del er live for seg; mangler kildene for en fane, vises designets demo der. Når noe er live er «i dag» = nå og måned/valgt dag følger dagens dato til brukeren blar.

Begrensning: `ha.events` henter fra i dag og fremover (92 dager), så passerte dager i månedsvisningen er tomme. (Trenger et `start`-argument i `ha.events` for historikk.)

Handlinger: ingen tjenestekall – kalenderen er kun visning.
