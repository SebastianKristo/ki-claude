# Kamera (`Kamera v2`)

Standard HA: `camera.*` (UniFi Protect, Frigate m.fl.), deteksjonssensorer (`binary_sensor.*`), `light.*` (flomlys), `siren.*`.

| Alias / konfig | Standard | Brukes til |
|---|---|---|
| `cameras:` (eller `kameraer:`) | alle `camera.*` utenom medium/lav oppløsning og `_insecure`, én per enhet (+ pakkekamera) | liste `[camera.x, {entity, name, icon, model, lys, sirene, sensors: [...]}]` |
| (stillbilde) | `entity_picture` (`/api/camera_proxy/<id>?token=<access_token>`) | fliser, enkeltvisning, hendelser og «Tilpass»; lastes på nytt hvert 10. sekund. `images: {cam-<entity_id>: url}` i kortkonfig overstyrer |
| (hendelser) | `binary_sensor.<enhet>_person_detected`/`_person_occupancy`, `_vehicle_detected`/`_car_occupancy`, `_animal_detected`/`_cat_occupancy`/`_dog_occupancy`, `_package_detected`/`_package_occupancy`, `_doorbell`, `_motion` (bare når kameraet mangler smartdeteksjon) – eller sensorer på samme enhet | «Hendelser» og Frigate-fanen: on-perioder i dag fra historikken (tid + varighet), tellere «Hendelser i dag / Personer / Biler» |
| `lys_<enhet>` | `light.<enhet>_flood_light` / `_floodlight` / lys på samme enhet | «Lys» i enkeltvisning |
| `sirene` | `siren.*` på samme enhet, ellers første `siren.*` | «Sirene» |

Navn: friendly_name uten «High resolution channel»/modell; modell fra `model_name`/enhetens modell. Ikon gjettes fra navnet (inngang/ringeklokke, veranda, plen, hage, garasje, pakke …).
Handlinger: trykk på stort bilde, «Snakk» og «Bilde» → more-info (direktestrøm); «Lys»/«Sirene» → `light.toggle`/`siren.toggle`. Rekkefølge/skjul/visning lagres i nettleseren (`kamera-cfg`) som i designet.
Uten `camera.*` vises designets demo.
