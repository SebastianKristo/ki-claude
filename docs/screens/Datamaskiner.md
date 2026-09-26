# Datamaskiner (`Datamaskiner`)

Ingen ki-integrasjon. Støtter HASS.Agent (Windows), macOS companion-app, IOT Link og System Bridge.
Fanene er datamaskinene. Liste i kortkonfig (anbefalt):

```yaml
datamaskiner:
  - navn: Mac mini
    type: mac                # mac | pc (bestemmer oppsettet)
    prefiks: mac_mini        # entitetsprefiks
    media_player: media_player.mac_mini
  - navn: Stasjonær PC
    type: pc
    prefiks: stasjonaer_pc
    wol: switch.stasjonaer_pc_wol      # eller mac: "AA:BB:CC:DD:EE:FF" (wake_on_lan.send_magic_packet)
    entities: { primary: sensor.pc_primary_display }   # overstyr enkeltnøkler
```

Uten liste: `mac_mini` og `stasjonaer_pc` hvis de finnes, ellers alle prefikser med `sensor.*_cpuload` /
`sensor.*_cpu_usage`. Hver nøkkel kan også overstyres med alias `pc_<n>_<nøkkel>` (n = 1, 2 …).
Rader/fliser uten entitet skjules i live-modus.

| Nøkkel | Kandidater (`<p>` = prefiks) | Brukes til |
|---|---|---|
| `cpu`, `gpu`, `gputemp`, `mem`, `disk`, `diskc`, `diskd` | `sensor.<p>_cpuload`/`_cpu_usage`, `_gpuload`, `_gputemperature`, `_memoryusage`/`_memory_usage`, `_storage`/`_disk_usage`, `_storage_c`, `_storage_d` | statistikkflisene |
| `media` | `media_player.<p>` | spiller nå, play/pause, forrige/neste, volum, demp |
| `awake` | `switch.<p>_keep_awake` | Keep Awake |
| `wake`, `dsleep`, `saver`, `lock` | `button.<p>_monitorwake`/`_wake_display`, `_monitorsleep`/`_sleep_display`, `_screensaver`, `_lock` | skjermknapper |
| `uptime`, `ip` | `sensor.<p>_uptime`/`_last_boot`, `_public_ip` | System |
| `cam`, `mic` | `binary_sensor.<p>_camera_in_use`, `_audio_input_in_use` (eller `sensor.<p>_webcamprocesses`/`_microphoneprocesses`) | Sensorer |
| `monitors`, `primary` | `sensor.<p>_monitors`, `_primary_display` | Skjermer |
| `audio`, `muted`, `micdev`, `sessions` | `sensor.<p>_audio_default_device`, `binary_sensor.<p>_audio_muted`, `sensor.<p>_audio_default_input_device`, `_audio_sessions` | Lyd |
| `eth`, `wifi`, `vpn` | `sensor.<p>_network_ethernet`, `_network_wifi`, `_vpn` | Nettverk |
| `sleep`, `restart`, `shutdown` | `button.<p>_sleep`, `_restart`, `_shutdown` | strømknappene (Shutdown bekreftes) |
| `state`, `wol` | `binary_sensor.<p>` / `switch.<p>_wol` | av/på-status, «Slå på» når maskinen er av |

Handlinger: `button.press`, `switch.toggle`, `media_player.media_play_pause/previous/next/volume_set/volume_mute`,
`wake_on_lan.send_magic_packet`. Knappene viser «… · sendt» som kvittering.
