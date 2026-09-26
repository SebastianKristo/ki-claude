# Bil (`Bil v3`)

Ingen ki-integrasjon. Fungerer med Tesla Fleet/Tessie/Tesla Custom, Volvo, Kia/Hyundai, VW m.fl.
Standardverdiene er de samme som i `ki-tesla-card` (`tesla_model_y_*`).

**Autodeteksjon:** batterisensoren finnes via alias `bil_batteri`, standard-id-ene under, eller første
`sensor` med `device_class: battery` på en enhet/entitet som heter noe med bil (tesla, volvo, kia,
model y, polestar, ioniq, enyaq, id.4 …). Alle andre roller hentes fra alias → standard-id → første
entitet på *samme enhet* (eller med samme prefiks) som matcher mønsteret i tabellen.

| Alias | Standard | Autodeteksjon (samme enhet/prefiks) | Brukes til |
|---|---|---|---|
| `bil_batteri` | `sensor.tesla_model_y_batteri_batteriniva` | sensor `*_battery_level`, `*_battery`, `*_soc` | batteri % |
| `bil_rekkevidde` | `sensor.tesla_model_y_batteri_estimert_batterirekkevidde` | sensor `*range*`/`*rekkevidde*` (mi → km) | «298 km», rekkevidde-flis |
| `bil_effekt` | `sensor.tesla_model_y_batteri_charge_power` | sensor `*charger_power`, `*charging_power` (W → kW) | ladeeffekt, ladetid |
| `bil_ladestatus` | `select.tesla_model_y_batteri_charging_state` | sensor/select/binary_sensor `*charging_state`, `*charging` | Lading På/Av |
| `bil_lader` | `switch.elbillader_charging` | switch `*_charge`, `*_charger`, `*_charging` | lade-bryteren |
| `bil_ladegrense` | `input_number.tesla_model_y_ladegrense` | number/input_number `*charge_limit*` | 50–100 %-knappene |
| `bil_laas` | `switch.tesla_model_y_car_doors_locked` | lock `*lock*` | Låst/Ulåst |
| `bil_tut` | – | button `*honk*`/`*horn*` | Tut |
| `bil_klima` | – | climate / switch `*climate*` | Klima |
| `bil_frunk` | `switch.tesla_model_y_car_trunk_front` | cover/switch/button/lock `*frunk*` | Frunk |
| `bil_bagasje` | `switch.tesla_model_y_car_trunk_rear` | cover/switch/button/lock `*trunk*`, `*tailgate*` | Bagasje |
| `bil_sentry` | – | switch `*sentry*` | «Sentry på»-merket |
| `bil_km` | – | sensor `*odometer*` | kilometerstand + daglig kjøring (recorder-historikk 8 døgn) |
| `bil_posisjon` | – | device_tracker på enheten | ekstra merke med sone når bilen ikke er hjemme |
| `bil_smartlading` | `input_boolean.smartlading`, `switch.elbillader_smart_charging` | switch/input_boolean `*smart_charg*` | Smartlading-bryteren |
| `bil_smart_ferdig` | `input_datetime.smartlading_ferdig` | time/input_datetime/sensor `*ferdig*`/`*departure*` | «ferdig 07:00» |
| `bil_sist_lading` | `sensor.elbil_sist_lading_kostnad` | sensor `*last_charge_cost*` | «Sist lading kostet» |
| `strompris` | `sensor.strompris_na`, `sensor.nordpool_kwh_no1_nok_3_10_025`, `sensor.ki_energi_pris_na` | – | «koste ca» (kWh × kr/kWh; uten pris brukes designets anslag) |

Kortkonfig `bil:`

```yaml
bil:
  navn: Tesla Model Y        # tittel (ellers enhetsnavnet)
  prefiks: [tesla_model_y]   # entitetsprefiks (streng eller liste)
  kapasitet: 75              # kWh, for ladetid og kostnad
  forbruk: 0.16              # kWh/km for «Uken totalt»
  laas_omvendt: true         # switch der on = ulåst (standard for *_doors_locked)
```

Bildet i toppkortet er `x-import`-bildesporet `bil-v3-foto` (settes via `images.bil-v3-foto`).

Handlinger: `lock.lock/unlock` eller `switch.toggle` (lås), `button.press` (tut), `climate.turn_on/turn_off`
(klima), `cover.open_cover/close_cover` / `switch.toggle` / `button.press` (frunk/bagasje),
`switch.toggle` (lading, smartlading), `number/input_number.set_value` (ladegrense).
Uten rekkeviddesensor anslås rekkevidden som i designet (4,2 km per %).
