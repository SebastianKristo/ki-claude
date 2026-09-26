# iPad Dashboard (`iPad Dashboard`)

Oversiktsdashboard (bredde 1180). Hver del er live når entitetene finnes, ellers vises designets demo for den delen.

| Alias | Standard / autodeteksjon | Brukes til |
|---|---|---|
| `vaer` | første `weather.*` | værbrikke og «Ute er det …» |
| – | alle `person.*` (eller `ipad.personer`) | «n hjemme», «Familien», avatarer (entity_picture) |
| `las` | første `lock.*` | Låst/Ulåst-brikke |
| `alarm` | første `alarm_control_panel.*` | Borte/Hjemme/Natt/Av-brikke |
| `stovsuger` | første `vacuum.*` | støvsugerbrikke |
| `strompris` | `sensor.norgespris_total_strompris_norgespris`, `sensor.strompris_na`, `sensor.nordpool_kwh_no1_nok_3_10_025` | «Strømmen koster» (øre → kr), prikk rød/gul/grønn (`ipad.pris_hoy` 1,0 / `ipad.pris_middels` 0,6) |
| `effekt` | `entiteter.total_effekt` fra `sensor.ki_energi_status`, `sensor.total_effekt`, `sensor.power_consumption` | «vi bruker … W» |
| – | `ipad.kalendere` eller første 6 `calendar.*` | «n hendelser i dag» |
| `lys_rom` / `ipad.rom` | lys i området `stue` (ellers de 8 første lysene), eller `ipad.lys: [...]` | «Lys i stua», av/på, dra for lysstyrke, «Slå av alle» |
| – | `sensor.ki_laster` (KI Energi, attributt `laster`) eller `ipad.varme: [climate…]` eller første 2 `climate.*` | Varme: settpunkt −/+, av/på |
| `ipad_media` | `media_player.rn602_stue`, ellers første spillende/første `media_player.*` | mediekortet, albumbilde |
| `markise` / `gardiner` | `cover.markise` / `cover.gardiner`, `cover.stue_gardiner`, ellers cover med «markise»/«gardin» i id | persienner/gardiner |
| `plex_nytt` | `sensor.plex_recently_added`, `sensor.plex_nylig_lagt_til` | «Nytt i Plex» |
| `scene_filmkveld`, `scene_middag`, `nattmodus`, `scene_natta`, `kamera` | `scene.filmkveld`, `scene.middag`, `switch.nattmodus`, `scene.natta`/`script.natta`, første `camera.*` | Scener («Alt lys av» slår av lysene i lyskortet) |

Kortkonfig:

```yaml
ipad:
  rom: stue
  lys: [light.sofabord, light.stalampe]
  varme: [climate.stue, climate.kjokken]
  scener:
    - { entity: scene.filmkveld, navn: Filmkveld, ikon: movie }
  kalendere: [calendar.familie]
  personer: [person.sebastian, person.cybele]
```

Handlinger: `light.toggle`/`light.turn_on` (`brightness_pct`)/`light.turn_off`, `scene/script.turn_on`,
`switch.toggle`, `climate.set_temperature`/`turn_on`/`turn_off` eller `ki_energi.overstyr` (sone uten termostat),
`media_player.toggle/media_play_pause/media_next_track`, `cover.open_cover/stop_cover/close_cover`, more-info (kamera, Plex).
