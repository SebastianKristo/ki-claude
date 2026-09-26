# Basseng (`Basseng v3`)

Integrasjon: [ki-basseng](https://github.com/SebastianKristo/ki-basseng) (`ki_basseng`). Skjermen blir live når
`sensor.<prefiks>_pumpemodus` finnes (funnet via attributtene `integrasjon: ki_basseng` og `prefiks`, så `_2`-oppføringer
virker også). Alle andre ki-entiteter slås opp som `<domene>.<prefiks>_<nøkkel>`, deretter `<domene>.ki_basseng_<nøkkel>`,
deretter via entitetsregisteret. Uten integrasjonen vises designets demo uendret.

ki_basseng har **ingen pH-, klor-ppm- eller ORP-måling** – klor er en tablettlogg. Pumpe, varmepumpe, pooltak, lys og
spreder-ventil er eksterne entiteter som integrasjonen ikke eksponerer; de finnes via alias, «Tilpass → Entiteter» i
skjermen (lagres lokalt i nettleseren) eller automatisk oppslag.

## Ki-entiteter (alias = nøkkel)

Alle kan overstyres med `entities: { <alias>: entity_id }` i kortkonfig.

| Alias | Standard | Brukes til |
|---|---|---|
| `pumpemodus` | `sensor.ki_basseng_pumpemodus` | status i bildet (Filtrerer/Varmer/Står …), `pumpe_gar` (pumpe-animasjon), Boost-markering |
| `vanntemperatur` | `sensor.ki_basseng_vanntemperatur` | temperatur i bildet/kort/setninger + graf «Endring siste døgn» (recorder-historikk 24 t) |
| `maltemperatur` | `sensor.ki_basseng_maltemperatur` | «mål X°», «på målet / X° under målet» |
| `omsetninger_i_dag` | `sensor.ki_basseng_omsetninger_i_dag` | «1,12 av 1,50 omsetninger» (attr `mal`) |
| `pumpetid_i_dag` | `sensor.ki_basseng_pumpetid_i_dag` | «Pumpet X t» |
| `neste_pumpestart` | `sensor.ki_basseng_neste_pumpestart` | «Pumpa starter HH:MM» når den står |
| `spart_i_dag` | `sensor.ki_basseng_spart_i_dag` | «Spart i dag» (enhet = valuta) |
| `kostnad_i_dag` | `sensor.ki_basseng_kostnad_i_dag` | «Strømmen har kostet X kroner i dag» |
| `varmepumpe_effekt` | `sensor.ki_basseng_varmepumpe_effekt` | «Effekt nå» (W), varmer/hviler |
| `varmetap` | `sensor.ki_basseng_varmetap` | Varmetap (kW), attr `pooltak` (tak lukket), `pooltak_kilde`, `utetemperatur`, `solgevinst_w` (Sol inn) |
| `solinnstraling` | `sensor.ki_basseng_solinnstraling` | Sol inn (W/m²) når `solgevinst_w` mangler |
| `nattsenking` | `sensor.ki_basseng_nattsenking` | Nattsenking-kortet (Holder varmen / Senker HH–HH / Senker nå, `begrunnelse`), skyggefelt i grafen |
| `nattsenking_aktiv` | `binary_sensor.ki_basseng_nattsenking_aktiv` | «Varmepumpa står for nattsenking» |
| `siste_klortablett` | `sensor.ki_basseng_siste_klortablett` | sist lagt i / hvem, navn + antall per person, kalender (attr `logg`), speilkalender |
| `neste_klortablett` | `sensor.ki_basseng_neste_klortablett` | «Neste klortablett tor 1. okt.», markert dag i kalenderen, `intervall_dager` |
| `klorstatus` | `sensor.ki_basseng_klorstatus` | «Klortablett nå · N dager på overtid» (rødt ikon) |
| `klortablett_intervall` | `number.ki_basseng_klortablett_intervall` | «Hver 7. dag · nå 6,2 dager fordi vannet er varmt» |
| `varsle_om_klor` | `switch.ki_basseng_varsle_om_klor` | «· varsling av», Påminnelse-raden åpner more-info |
| `klorlogg` | `calendar.ki_basseng_klorlogg` | Klorloggen-raden åpner more-info (overstyres av «Klorkalender» i Tilpass) |
| `navn_i_klorloggen` | `text.ki_basseng_navn_i_klorloggen` | navneliste (fallback når attr `navn` mangler), rad åpner more-info |
| `spreder_kjorer` / `spreder_gjenstar` | `binary_sensor.…_spreder_kjorer` / `sensor.…_spreder_gjenstar` | Sprer/Står, «N min igjen», status (frost/maks), brukt i dag |
| `spreder_varighet` / `spreder_intervall` / `spreder_maks_per_dogn` | `number.ki_basseng_…` | varighetsknappene, «Start hver», «Maks per døgn» |
| `spreder_program` / `frostvakt` | `switch.ki_basseng_…` | «Mellom 10 og 20» / «Spreder-program er av», Frostvakt På/Av |
| `automatikk` / `prisstyring` / `varmeprioritet` | `switch.ki_basseng_…` | flaggene i Oversikt |
| `smart_nattsenking` / `vintermodus` / `pooltak_pa` | `switch.ki_basseng_…` | bryterne i Varme (pooltak_pa brukes når ingen ekstern tak-entitet) |
| `driftsprofil` | `select.ki_basseng_driftsprofil` | Eco / Balansert / Badeklar |
| `onsket_temperatur` | `number.ki_basseng_onsket_temperatur` | 23°–27°-knappene og «Mål» |
| `vanniva` | `sensor.ki_basseng_vanniva` | ekstra «Vannivå»-flagg i Oversikt (kun når nivåsensor er konfigurert) |
| `fyll_bassenget` / `stopp_pafylling` | `button.ki_basseng_…` | Vannivå-flagget: fyll når lav/tørr/stoppet, stopp når den fyller |
| `varmetap_uten_tak` / `varmetap_med_tak` | `number.ki_basseng_…` | «sparer X kW» på Pooltak-kortet |

«Tilpass → Styring og verdier» er koblet til: `driftsprofil`, `omsetninger_per_dogn`, `vedlikeholdspuls`, `dagtimer_i_planen`,
`prisstyring`, `varmeprioritet`, `minste_kjoretid`, `pumpe_basislast`, `manuell_overstyring_varer`, `styr_varmepumpe`,
`styr_settpunkt`, `varmevindu_start`, `varmevindu_slutt`, `senking_nar_ingen_er_hjemme`, `solvarme`, `varmetap_uten_tak`,
`varmetap_med_tak`, `sol_gjennom_taket`, `klortablett_intervall` (tall lagres 1,2 s etter siste tastetrykk).

## Eksterne entiteter

| Alias | Oppslag (i rekkefølge) | Brukes til |
|---|---|---|
| `pump` | Tilpass → Pumpe, `switch.bassengpumpe`, `switch.pool_pump`, `switch.shelly_basseng`, første `switch` med pool/basseng + pump i navnet | Pumpe-knappen (toggle). Uten pumpe: knappen kjører `ki_basseng.boost` |
| `heat` | Tilpass → Varmepumpe, `climate.basseng_varmepumpe`, `climate.pool_heater`, `switch.varmepumpe_basseng`, første `climate` med pool/basseng | Varme-knappen (toggle), på/av i bildet |
| `cover` | Tilpass → Pooltak, alias, `pooltak_kilde` fra `sensor.ki_basseng_varmetap`, ellers `switch.ki_basseng_pooltak_pa` | Pooltak-knapp/-kort (toggle; binary_sensor → more-info). Tilstand fra attr `pooltak` |
| `light` | Tilpass → Lys, `light.basseng`, `light.pool_led`, `switch.basseng_lys`, første `light` med pool/basseng | Lys-knappen og lyset i bildet |
| `spr` | kun alias / Tilpass | vises i Tilpass; spreder styres via ki_basseng-tjenestene |
| – | Tilpass → Utetemperatur (sensor eller weather) | «Ute» (ellers attr `utetemperatur`) |
| – | Tilpass → Effekt / Vanntemperatur | overstyrer `varmepumpe_effekt` / `vanntemperatur` |

## Handlinger

`ki_basseng.boost` (Boost), `ki_basseng.start_spreder {minutter}` / `stopp_spreder` (Spreder-knapp, modusknapp og
«Start i N min»), `ki_basseng.logg_klortablett {antall, hvem}` (navneknapp, «uten navn» uten `hvem`; antall fra 1/2/3 stk),
`ki_basseng.angre_klortablett` («Angre siste»), `select.select_option` på driftsprofil (fallback `ki_basseng.sett_profil`),
`number.set_value` (ønsket temperatur, spreder-varighet, Tilpass-verdier), `switch.toggle` (flagg, nattsenking, vintermodus,
frostvakt, Tilpass-brytere), `button.press` (fyll/stopp påfylling), `toggle` på pumpe/varmepumpe/pooltak/lys, more-info på
Påminnelse/Klorloggen/Navn og spreder-radene. Tjenestene kalles uten `entry_id` (virker på alle bassenger).

## Fortsatt demo / ikke tilgjengelig

- Ingen pH/klor-måling i integrasjonen – klorfanen viser bare tablettloggen.
- «Lyd av»-kontrollen (skjult som standard) har ingen kobling.
- Grafen viser vanntemperatur siste 24 t; skyggefeltet er nattsenkingsvinduet (`fra`–`til`) når det overlapper.
