# Server (`Server v3`)

Ingen ki-integrasjon. Integrasjoner, enheter og entiteter hentes automatisk fra entitetsregisteret
(`platform` + `device_id`); ingen faste entity-id-er. Gruppene (fanene):

| Fane | Plattformer (første som finnes = standardkilde, velg i «Henter fra») |
|---|---|
| Nettverk | `unifi`, `tplink_omada`, `pfsense`, `opnsense`, `luci`/`openwrt`, `fritz`, `asuswrt`, `netgear`, `mikrotik`, `speedtestdotnet` |
| Proxmox | `proxmoxve`, `proxmox`, `vmware` |
| Unraid | `unraid`, `truenas`, `synology_dsm`, `qnap`, `portainer` |
| System | `systemmonitor`, `glances`, `hassio` |

Enheter = HA-enheter (sortert ruter → node → lagring → switch → AP → resten). Online = `binary_sensor` med
`device_class: running`/«status» er på, ellers at minst én entitet er tilgjengelig.
Automatiske roller: knapper → *handling*, `entity_category: config` → *skjult*, CPU/minne/latens på første
enhet → *oppsummering* (maks 4), første CPU/last/klienter/trafikk-sensor per enhet → *graf* (24 t recorder-historikk),
resten → *detalj*. Roller, navn og rekkefølge endres i «Tilpass» og lagres i localStorage (`server-cfg`), som i designet.

Kortkonfig:

```yaml
server:
  skjul: [sensor.udm_pro_storage]                 # skjul entiteter
  integrasjoner: { unifi: [unifi], system: [glances] }   # overstyr plattformer per fane
```

Handlinger: detaljpille på knapp → `button.press` (restart/reboot/shutdown/stop bekreftes), bryter → `switch.toggle`,
ellers more-info.
