# Dører (`Dører`)

Prop `site` (Oslo / Strømstad / Toten – fra «Hjem v2»s valgte server). Standard HA: `lock.*` og `cover.*` med device_class `garage`/`gate`.
Tillegg: [ki_notifications](https://github.com/SebastianKristo/ki-varslinger) (autolås, «Sist låst opp av») og [ki_hyttebesok](https://github.com/SebastianKristo/ki-hyttebesok) (hvem som er på stedet).

| Alias / konfig | Standard | Brukes til |
|---|---|---|
| `sites:` (eller `steder:`) | – | dører per sted: `sites: { Strømstad: [lock.x, cover.y] }` eller `{ locks: [...], garages: [...] }` (nøkkel matches uten aksenter) |
| (autodeteksjon) | HA-område med samme navn som stedet → ellers alle låser + garasjeporter | når stedet ikke står i `sites:` |
| `bat_<objekt>` | `sensor.<lås>_battery` / `_battery_level`, `battery_level`-attributt, batterisensor på samme enhet | «Batteri» (raden skjules uten data) |
| `ansikt` | `sensor.ansiktsgjenkjenning_dorlas_sist_last_opp_av` | «Låst opp av …» når `changed_by` mangler (innen 2 min) |
| `autolas` | autolås-regel fra ki_notifications der `las` = låsen (statussensor `type: autolock`), bryter på samme enhet, ellers `switch.autolas_autolas` | «Autolås etter …» (ventetid fra `number.autolas_ventetid_for_autolas`/`ventetid_sekunder`), «Ulåst · låses HH:MM» fra `planlagt_lasing` |
| `ventetid_<objekt>` | `number.autolas_ventetid_for_autolas` | ventetid i etiketten |
| (ki_hyttebesok) | `sensor.ki_hyttebesok_<sted>_oversikt` (`ki_type: oversikt`, `sted`) | «Strømstad · Rune og Cybele er her» |

Status: `locked/unlocked/locking/unlocking/jammed/open/unavailable`, tid fra `last_changed`; garasje: `current_position` (ellers open/closed), `opening/closing` = beveger seg.

Handlinger: lås-ikon og «Lås/Lås opp» → `lock.lock` / `lock.unlock`; autolås-bryter → `switch.toggle`; garasje ↑/↓/stopp → `cover.open_cover` / `close_cover` / `stop_cover`; «Sikre alt» → låser alle ulåste og lukker åpne porter; entitetsraden → more-info.
Står stedet i `sites:` uten entiteter, vises «Ingen dører eller porter». Uten låser/porter (og uten `sites:`-oppføring) vises designets demo for stedet.
