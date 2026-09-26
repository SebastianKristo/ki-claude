# Rom (`Rom v4`)

Integrasjoner: HA-områder, [ki-rom](https://github.com/SebastianKristo/ki-rom) (`ki_rom`, romoversikt) og scene-delen av `ki_lys`/`ki_rom`. Skjermen brukes både alene og innebygd i «Hjem v2» (`<dc-import name="Rom v4" room-id=… name=… icon=… col=… temp=… hum=…>`).

**Romvalg**: `props.roomId` matches mot `hass.areas` på area_id, deretter områdenavn/slug (`ha.norm`), deretter `props.name` (f.eks. roomId `sov` + name `Soverom` → området «Soverom»). Uten treff (eller uten hass) vises designets demo-rom (`stue`, `pult`, `kjokken`, `bad`, `sov`, `kontor`) uendret. `props.icon`/`col` brukes som før; uten `icon` velges ikon fra romnavn/områdeikon. Alene: `props: {roomId: stue}` i kortkonfig.

| Alias | Standard | Brukes til |
|---|---|---|
| `oversikt_<area_id>` | `sensor.<rom>_oversikt` med `integrasjon: ki_rom`, `area_id` = området | lister: `lys`, `media`, `brytere`+`vifter` (`{entity, effekt}`), `klima`, `gardiner`, `sensorer` (`{entity, klasse}`), `scener` (HA-scener), `temperatur`, `fuktighet`, `lysniva` |
| – | `sensor.<slug>_lys_oversikt` (`integrasjon: ki_lys`, `area_id`/`area_ids`) | scenekort (`scener[].entity` = `button.<slug>_lys_<id>`) |
| – | `sensor.<rom>_effekt` (KI Rom-teller) | «Enheter»-summen (W) |
| – (reserve uten ki_rom) | entiteter i området (entitet- eller enhetsområde, ikke skjulte/kategoriserte) | `light`, `switch`, `fan`, `climate`, `media_player`, `cover`, `binary_sensor` (bevegelse/tilstede/dør/vindu/fukt …), `sensor` temperatur/fukt/lysnivå, `scene` |

Toppkortet: temperatur/fukt fra første `temperatur`/`fuktighet` (eller valgt sensor i «Tilpass → Klima-kort»), graf = recorder-historikk siste 24 t (timeverdier). Uten temperaturkilde skjules toppkortet. Termostat/sensor-velgerne i «Tilpass» søker i ekte `climate.*` og temperatur-/fuktsensorer; valgt termostat blir første klimakort, «+ ekstra» legger til flere `climate.*`. Lystype «Auto» leses fra `supported_color_modes` (onoff/dim/ct/farge). Navn får romnavnet fjernet foran («Stue Peislampe» → «Peislampe»).

Handlinger:
- Scener: `button.press` (KI-scener) / `scene.turn_on` (HA-scener).
- Lys: trykk = `toggle`; dra = `light.turn_on` `brightness_pct` ved slipp (0 = av); temperatur = `color_temp_kelvin`; farge = `hs_color`. «Kun av/på» = `toggle`.
- Enheter: `switch.toggle`/`fan.toggle`. Klima: `climate.set_temperature` ± `target_temp_step`.
- Media: `media_player.toggle`, `media_play_pause`, `media_previous_track`, `media_next_track`, `volume_set`; «…» = more-info.
- Gardiner: dra = `cover.set_cover_position` (uten posisjonsstøtte `open_cover`/`close_cover`), trykk = åpne/lukke, forvalg 0–100 % på alle.

Oppsett i «Tilpass» (rekkefølge, skjulte seksjoner/entiteter, farger, overstyringer) lagres per rom i nettleseren som før.
