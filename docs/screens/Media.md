# Media (`Media v4`)

Standard `media_player.*` (+ `remote.*` for TV-fjernkontroll). Skjermens eget Oppsett (tannhjulet) velger mediaspiller per kilde og lagres lokalt (`localStorage: media-v4-vol`); listen viser nå alle `media_player.*` i HA.

| Alias / config | Standard | Brukes til |
|---|---|---|
| kilder (Oppsett) | Musikk: `media_player.squeezebox_radio`, `media_player.rn602_stue`; TV: `media_player.stue_tv`, `media_player.telia_box_2` | kortene i karusellen (valgt entitet vinner) |
| `media: {tv: [...], musikk: [...]}` (kortkonfig) | – | egne kilder: `{entity, name?, icon?, remote?, platform?: apple\|google, presets?: [{name, icon?, source? \| entity?}]}` |
| – | alle `media_player.*` (TV = `device_class: tv` eller tv/apple/chromecast/android/telia/box i id-en) | autodeteksjon når verken config eller standard-id-ene finnes |
| fjernkontroll | `remote.<samme object_id>` (standard `remote.stue_tv`, `remote.telia_box_2`) | D-pad, Tilbake/Hjem/Meny/Spill |

Kortet viser `media_title`, artist/serie/app, `source`/`app_name`, volum (`volume_level`), av/på, gjenta/tilfeldig, og albumbilde fra `entity_picture`. Musikk-«Kilde»: egne snarveier (Oppsett/`presets`) – ellers standard-snarveiene hvis entitetene/kildene finnes – ellers spillerens `source_list`. TV-«Apper»: listen fra Oppsett. Mangler en fane live-kilder, vises demoen for den fanen.

Handlinger: av/på → `media_player.turn_on/turn_off`, spill/pause → `media_play_pause`, forrige/neste → `media_previous_track/media_next_track`, gjenta → `repeat_set`, tilfeldig → `shuffle_set`, volum-slider → `volume_set` (debounce 120 ms), volumknapper → konfigurert button/script/switch (Oppsett) ellers `volume_up/volume_down/volume_mute`, kilde-snarvei → `select_source` / `script.turn_on` / `button.press`, app → `select_source` (eller `remote.turn_on` med `activity: <App-ID>` for Google TV), D-pad/taster → `remote.send_command` (Apple TV: up/down/left/right/select/menu/home/top_menu/play_pause; Google TV: DPAD_*/BACK/HOME/MENU/MEDIA_PLAY_PAUSE; hold Hjem = `hold_secs: 1`). «Seertid» vises ikke i live.
