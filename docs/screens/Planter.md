# Planter (`Planter`)

Integrasjon: KI Planter (`ki_planter`). Uten planter vises demo uendret. Oppdages automatisk (ingen alias).

| Entitet | Oppdages som | Brukes til |
|---|---|---|
| `binary_sensor.<plante>_trenger_vann` | attr `integrasjon: ki_planter`, `type: plante` | navn, latin, sted, trenger vann, jordfukt (`fuktighet`, `fuktighet_min`), sist vannet (`dager_siden`), `dager_igjen`, intervall, sesong, neste vanning |
| `button.<plante>_vannet_na` | samme enhet som planten (fallback: entity_id-mønster) | «Merk som vannet» |
| `sensor.<sted>_planter_trenger_vann` | `type: sted` | «per sted»-oversikt (vises når planter står på flere steder), sesong + dagslys i undertittelen |
| `button.<sted>_planter_alle_vannet` | via attr `prefix` | «Alle vannet» per sted |
| lys/temperatur/ledningsevne-sensorer | samme enhet som `fuktighet_sensor` (f.eks. Mi Flora) | «Avansert»: Lys / Temp / Næring. Finnes de ikke vises Intervall / Sesong / Neste i stedet |

ki_planter har ingen øvre fuktgrense: målbåndet går fra `fuktighet_min` til 100 % og teksten er «NN % · min NN %».
Planter uten fuktsensor viser «Siden vanning: X dager av N» med andel av intervallet som stolpe.

## Handlinger
- «Merk som vannet»: `button.press` på `button.<plante>_vannet_na`.
- «Alle vannet»: `button.press` på `button.<sted>_planter_alle_vannet`.
