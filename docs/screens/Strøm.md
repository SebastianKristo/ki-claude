# Strøm (`Strøm v5`, `Strømpriser`, `Strømregning`, `Norgespris`, `Strøminnstillinger`)

Integrasjon: [ki-strom](https://github.com/SebastianKristo/ki-strom) (`ki_energi`) + prisintegrasjon (Nord Pool, Energi Data Service o.l.) + strømmåler (Tibber Pulse, AMS/HAN).

`ki_energi` lager **ingen** egen pris-sensor med timepriser; den leser eksterne sensorer som settes i
integrasjonens oppsett (`strompris`, `nordpool`, `norgespris_aktiv`, `energiledd_dag/natt`, `kapasitetstrinn`).
Bare målerne (`total_effekt`, `importert_energi`) eksponeres i `sensor.ki_energi_status` → `entiteter`, så skjermene
bruker dem direkte og finner prissensoren selv (alias `pris` eller autodeteksjon). Alle ki_energi-entiteter har
fast entity_id `<domene>.<nøkkel>`; finnes de under andre id-er, slås de opp via entitetsregisteret (`platform: ki_energi`).

Uten noen av entitetene under vises designets demo-data uendret. Hver del faller tilbake til demo for seg
(f.eks. demo-priser hvis ingen prissensor finnes, men ekte effekt fra måleren).

## Felles alias

| Alias | Standard | Brukes til |
|---|---|---|
| `status` | `sensor.ki_energi_status` | `entiteter.total_effekt` / `entiteter.importert_energi` (målerne ki_energi bruker) |
| `effekt` | `entiteter.total_effekt` → `sensor.strommaler_effekt` → første `device_class: power`-sensor med `strommaler/ams/han/pulse/tibber/import` i id | effekt nå (W/kW) |
| `energi` | `entiteter.importert_energi` → `sensor.strommaler_imported_energy` → første `energy`/`total_increasing`-sensor med måler-navn | timeforbruk via recorder-statistikk (`recorder/statistics_during_period`, `change` per time fra 1. januar i fjor) |
| `pris` | `sensor.nordpool` → første sensor med `raw_today`/`today`/`prices_today`/`today_prices`/`prices`-attributt (id med nordpool/spot/energi_data/tibber/pris foretrekkes) → `sensor.ki_vvb_billige_timer.doegn` | timepriser i dag/i morgen. Elementer kan være tall eller objekter (`start`/`hour`/`startsAt` + `value`/`price`/`total`). 15-min-priser støttes. Enhet øre/cent (eller `price_in_cents`) og MWh skaleres til kr/kWh. Historiske timepriser: statistikk `mean`, ellers rå historikk siste 62 døgn |
| `time_energi` | `sensor.ki_time_energi` | kWh i inneværende time (ikke i statistikken ennå) |
| `energiledd_dag` / `energiledd_natt` | `input_number.grid_day_hourly_cost` / `input_number.grid_night_hourly_cost` → `sensor.nettleie_elvia_energiledd_dag` / `sensor.nettleie_elvia_energiledd_natt_helg` (ki_energi-standarden) | nettleie kr/kWh (natt = 22–06 og helg) |
| `paaslag` | `input_number.el_company_surcharge` | påslag fra strømselskap (kr/kWh eks. mva) |
| `norgespris` | `input_number.norgespris` | Norgespris-fastpris; ellers `norgespris` i kortkonfig, ellers 0,50 kr/kWh |
| `norgespris_aktiv` | `binary_sensor.norgespris_norgespris_aktiv_na` (ki_energi-standarden) | om Norgespris gjelder nå |
| `nettleie` | `sensor.ki_nettleie` | kapasitetsledd (kr/mnd), `registrert_snitt`, `registrert_trinn_fra/til`, `topp_tre`, `tabell`; historikk (366 d) gir effektledd per måned |
| `sparing` | `sensor.ki_sparing` | «Spart denne mnd.» (ekstra kortside i Strøm) |
| `prognose` | `sensor.ki_prognose` | «Prognose 15 min» (ekstra kortside i Strøm) |
| `laster` | `sensor.ki_laster` | kurser (hvis `kurser` ikke er satt) |
| `bereder` | `sensor.ki_bereder` | `effekt_sensor` for varmtvannsberederen |
| `styrt_effekt` / `hvitevarer_effekt` / `vvb_effekt` | `sensor.ki_styrt_effekt` / `sensor.ki_hvitevarer_effekt` / `ki_bereder.effekt_sensor` | fordeling per kilde i Forbruk (integrert effekthistorikk for døgnet) |
| `vvb_billige_timer` | `sensor.ki_vvb_billige_timer` | reserve-prisskilde (`doegn`: 24 timer fra nå) |
| `fase_l1` / `fase_l2` / `fase_l3` | første `device_class: current`-sensor med `l1`/`phase_1`/`fase_1` osv. i id | fasestrøm i Kurser |

### Kortkonfig

```yaml
type: custom:ki-claude-card
screen: Strøm v5
entities:
  pris: sensor.nordpool_kwh_no1_nok_3_10_025
  effekt: sensor.power_hjemme          # Tibber Pulse
  energi: sensor.accumulated_consumption_hjemme
pris_inkl_mva: true      # prissensoren rapporterer inkl. mva (standard). false = eks. mva
norgespris: 0.50         # kr/kWh inkl. mva hvis ingen entitet
avgift_kr_kwh: 0.1691    # elavgift + Enova inkl. mva (Strømregning), standard 0,1691
hovedsikring: 40         # A (Kurser)
kurser:                  # valgfritt, ellers ki_energi-lastene
  - { navn: Varmepumpe, entity: sensor.varmepumpe_power, ampere: 16, fase: L1, ikon: heat_pump }
```

## Strøm (`Strøm v5`)

- **Hero**: effekt nå (`effekt`), spotnivå (billig/middels/dyr fra dagens priser), sparkline og «spot i dag»-spenn fra `pris`, «i dag X kr · Y kWh» fra timeforbruk × timepris (med valgte tillegg). Demo-simuleringen av watt stoppes i live-modus.
- **Priser**: «Pris nå», «Strømregning <mnd>» (hittil i måneden), «Billigst i dag», «Norgespris»; ekstra side med ki_sparing/ki_prognose. Graf time for time / i morgen (kvartersoppløsning når kilden har det; «ikke publisert ennå» når morgendagens priser mangler). Eksempler finner billigste start i dag *og* i morgen. Knappene Nettleie/Strømselskap/Moms er visningsvalg: nettleie = energiledd (dag/natt+helg), strømselskap = `paaslag`.
- **Forbruk**: kWh per time for valgt døgn (pil tilbake i tid), sum i dag / måned / år, fordeling Oppvarming (ki_styrt_effekt), Varmtvannsbereder, Hvitevarer og Øvrig.
- **Kurser**: fasestrømmer mot `hovedsikring`; kurser fra `kurser` eller `sensor.ki_laster` (effekt fra lastenes egne effektsensorer, sonens status i undertekst).

## Strømpriser

Spotpris-sensoren og attributtet for i morgen i skjermens eget oppsett (redigeringspanelet, lagres lokalt) brukes som kandidater etter alias `pris`; Norgespris-entiteten derfra etter alias `norgespris`. Timer uten pris tegnes ikke.

## Strømregning

- Regning per dag/uke/måned/år (og forrige periode via kalenderknappen): **Strøm** = kWh × timepris (eller Norgespris når `norgespris_aktiv` er på), **Nettleie** = kWh × energiledd + kapasitetsledd fordelt per døgn, **Avgifter** = kWh × `avgift_kr_kwh`. Inneværende periode vises som anslag (hittil × periodelengde/forløpt tid).
- **Effekttrinn** og **Effektledd per måned** fra `sensor.ki_nettleie` (trinn, snitt av tre topper, margin, topper med dato/time, neste trinn og merkostnad fra `tabell`).

## Norgespris

Spart med Norgespris per døgn (Måned) og per måned (År): Σ kWh × spot mot kWh × Norgespris, med energiledd lagt på begge. Faktaboksene viser fastpris, besparelse i dag, snitt spot (forbruksvektet) og forbruk.

## Strøminnstillinger

| Rad | Alias | Standard |
|---|---|---|
| Dag · 06–22 | `energiledd_dag` | `input_number.grid_day_hourly_cost`, `sensor.nettleie_elvia_energiledd_dag` |
| Natt og helg | `energiledd_natt` | `input_number.grid_night_hourly_cost`, `sensor.nettleie_elvia_energiledd_natt_helg` |
| Påslag | `paaslag` | `input_number.el_company_surcharge` |
| Strømstøtte fra | `stotte_terskel` | `input_number.electricity_government_support_threshold` |
| Strømstøtte | `stotte_prosent` | `input_number.electricity_government_support_percentage` |
| Mva | `mva` | `input_number.vat_percent` |

`input_number`/`number` justeres med −/+ (`set_value`, innenfor min/max); en sensor åpner more-info. Mangler entiteten, er verdien bare en lokal kalkulatorverdi. Totalprisen bruker spot nå (eks. mva) – eller Norgespris uten strømstøtte når `norgespris_aktiv` er på.

Gruppen **KI Energi** vises bare når entitetene finnes: `switch.ki_energi_hovedbryter`, `ki_skyggemodus`, `ki_helgemodus` (bortemodus), `ki_sommermodus`, `ki_vvb_prisstyring` (− = av, + = på), VVB-boost (`ki_energi.vvb_boost` / `ki_energi.vvb_avbryt_boost`, status fra `binary_sensor.ki_vvb_boost_aktiv`), `number.ki_mal_trinn_kw`, `number.ki_maks_time_kwh`, `number.vvb_billigste_timer_dogn`, `number.ki_vvb_boost_minutter` (steg fra entiteten) og `time.ki_vvb_vindu_start` (±30 min via `time.set_value`).

## Handlinger

`input_number/number.set_value`, `switch.turn_on/turn_off`, `time.set_value`, `ki_energi.vvb_boost`, `ki_energi.vvb_avbryt_boost`, more-info for sensorer. Øvrige knapper (faner, periode, dag, time, tillegg) er visningsvalg.
