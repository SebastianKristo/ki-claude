# Drivstoff (`Drivstoff`)

Ingen ki-integrasjon. Et *område* er en sensor som har en liste over stasjoner i et attributt
(`stasjoner`, `stations`, `priser`, `prices` eller `data`).

| Alias | Standard | Brukes til |
|---|---|---|
| `drivstoff_oslo` | `sensor.drivstoffpriser_oslo` | område 1 («Nærmest Oslo») |
| `drivstoff_stromstad` | `sensor.drivstoffpriser_stromstad` | område 2 («Nærmest Strömstad») |
| – | alle `sensor.drivstoffpriser_*` og sensorer med attributtet `stasjoner`/`stations` | flere områder |

Feltene i hver stasjon leses fleksibelt: kjede `kjede|brand|merke|navn|name`, sted `sted|city|by|location`,
adresse `adresse|address`, avstand `avstand|distance|km`, oppdatert `oppdatert|updated|last_updated|tid`
(ISO/epoch/«HH:MM»), priser `bensin|petrol|gasoline|95|e10` og `diesel` – direkte, i objektet
`priser`/`prices`, eller som liste `[{ type: 'Diesel', price }]`. Områdenavnet er `friendly_name` uten
«Drivstoffpriser».

Kortkonfig:

```yaml
drivstoff:
  omrader:                     # overstyrer standardområdene
    - { entity: sensor.drivstoffpriser_oslo, navn: Oslo }
  stasjoner:                   # enkeltstasjoner med egne prissensorer
    - { navn: Circle K, sted: Ullern, km: 1.2, bensin: sensor.ck_ullern_95, diesel: sensor.ck_ullern_diesel, omrade: Oslo }
```

Handlinger: trykk på en stasjon/«Billigst»-kort åpner more-info for områdesensoren. Sorteringsknappene
(bensin/diesel/nærmest område/sist oppdatert) virker på live-data.
