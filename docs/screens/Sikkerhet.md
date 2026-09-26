# Sikkerhet (`Sikkerhet v3`)

Standard HA: `alarm_control_panel.*`, `lock.*`, `binary_sensor.*` (device_class door/window/opening/garage_door/motion/occupancy/presence).
Tillegg fra [ki_notifications](https://github.com/SebastianKristo/ki-varslinger) (KI Varslinger og sikkerhet): sikkerhetsfeil og «Sist låst opp av».
Innebygd i «Hjem v2» med `embedded`, `editReq` og `onSections` – virker som før.

| Alias | Standard | Brukes til |
|---|---|---|
| `alarm` | valgt i «Tilpass» → `alarm_control_panel.alarm` → `.alarmo` → `.hjem` → første `alarm_control_panel.*` | modus (disarmed/armed_home/armed_away/armed_night → Av/Hjemme/Borte/Natt; triggered/arming/pending vises egne), «Aktivert HH:MM» fra `last_changed`, kodekrav fra `code_format`/`code_arm_required` |
| `ansikt` | `sensor.ansiktsgjenkjenning_dorlas_sist_last_opp_av` (eller ki_notifications-sensor `*_sist_last_opp_av`) | «Inngang låst opp · Sebastian · ansikt» i loggen |
| `bat_<objekt>` | `sensor.<lås>_battery` / `_battery_level`, ellers `battery_level`-attributtet eller batterisensor på samme enhet | batteri på låser |
| (ki_notifications) | alle `sensor.*` fra plattformen `ki_notifications` med tilstand `Sikkerhetsfeil` | kort under «Krever oppmerksomhet» (tekst fra `sikkerhetsfeil`/`siste_feil`) |

**Sensorer** (ring, rom, varsler): i prioritert rekkefølge
1. `sensorer:` (eller `sensors:`) i kortkonfig – liste med entity_id eller `{entity, room/rom, type (door|window|lock|motion|presence), name/navn}`;
2. listen brukeren har redigert i «Tilpass sikkerhet» (lagres i nettleseren, `sik-cfg`);
3. autodeteksjon: alle `lock.*` + `binary_sensor.*` med relevant device_class (skjulte/deaktiverte/diagnostiske, ki-sensorer med `integrasjon` og kameraenes smartdeteksjon/ringeklokke utelates). Rom = HA-området, ellers gjettet fra navnet («Cybele soverom vindu» → «Cybele soverom»).

«Siste hendelser» hentes fra loggboka (`logbook/get_events`, siste 3 døgn) for alarm, sensorer og ansiktssensoren; «lukket»/«ingen bevegelse» filtreres bort, hvem = HA-bruker/person, automasjon («Automatisk») eller sensortype.

Handlinger: hold inne modus → `alarm_control_panel.alarm_disarm` / `alarm_arm_home` / `alarm_arm_away` / `alarm_arm_night` (tastaturet vises når entiteten krever kode; koden sendes som `code`, avvist kode rister tastaturet). «Lås» på ulåst lås → `lock.lock`; «Vis» og trykk på sensor-chip → more-info. «Tilpass»: velg alarmpanel blant `alarm_control_panel.*`, legg til/fjern/rediger sensorer (søk i låser og binary_sensor).

Demo: uten alarmpanel og uten sensorer vises designet uendret. Finnes sensorer men ikke alarmpanel, simuleres modusvelgeren som i designet. «Krev kode»/«Testkode» i Tilpass gjelder bare demo – i live bestemmer alarm-entiteten kodekravet; «Kodelengde» brukes for tastaturet.
