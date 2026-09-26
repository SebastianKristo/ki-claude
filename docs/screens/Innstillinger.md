# Innstillinger (`Innstillinger v3`)

Dashboardinnstillinger. Koblet til ki_nattmodus, ki_vekking/ki_sovn, ki_utelys og ki_notifications når de finnes.

| Alias | Standard | Brukes til |
|---|---|---|
| `nattmodus` | `switch.nattmodus` (ellers switch fra `ki_nattmodus`) | heltekortet: God natt/morgen/dag/kveld, trykk = `switch.toggle`; attributt `tid_pa` → «Nattmodus starter kl. 22:45» |
| `vekking` | `sensor.soverom_vekking_neste_alarm` (ellers første `sensor.*_vekking_neste_alarm`) | «Vekking kl. 06:40» |
| `ansiktsgjenkjenning` | `switch.ansiktsgjenkjenning_dorlas_ansiktsgjenkjenning_dorlas` | Automasjoner: Ansiktsgjenkjenning |
| `utelys_automatikk` | `switch.ki_utelys_auto` | Automasjoner: Utelys automatikk |
| `varsel_dorklokke` | `switch.dorklokke_varsling`, `switch.dorklokke_varsel` | Push: Dørklokke |
| `varsel_bevegelse` | `switch.bevegelse_ute_varsling`, `switch.bevegelse_ute_varsel` | Push: Bevegelse ute |
| `varsel_vaskemaskin` | `switch.vaskemaskin_ferdig_varsling`, `switch.vaskemaskin_varsling` | Push: Vaskemaskin ferdig |
| `varsel_strompris` | `switch.hoy_strompris_varsling`, `switch.strompris_varsling` | Push: Høy strømpris |

Radene kan erstattes helt i kortkonfig:

```yaml
innstillinger:
  automasjoner:
    - { entity: automation.utelys, navn: Utelys, ikon: emoji_objects, tekst: Styrer utelysene }
  push:
    - { entity: switch.alarm_alle_varsler, navn: Alarm, ikon: shield, tekst: Alle alarmvarsler }
```

Rader uten entitet er rene dashboardvalg: de lagres i localStorage per HA-bruker (`innstillinger-v3:<user.id>`).
Uten nattmodus-bryter virker heltekortet lokalt som i designet.

Handlinger: `switch.toggle` / `homeassistant.toggle` på bryteren til raden eller nattmodus.
