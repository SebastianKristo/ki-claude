# Gjøremål (`Gjøremål`)

Standard HA-domene `todo.*` (Local To-do, Google Tasks, Todoist, Handleliste …). De to fanene er to todo-lister.

| Alias / config | Standard | Brukes til |
|---|---|---|
| `todo_lists: [id, id]` (kortkonfig) | – | hvilke lister som blir fanene (maks 2) |
| `liste1`, `liste2` | – | alternativ til `todo_lists` |
| – | de to første `todo.*` | autodeteksjon når ingenting er konfigurert |

Fanenavn = listens `friendly_name`, tallet = åpne oppgaver (fra entitetens state til elementene er lastet). Elementer hentes med `todo/item/list`.

Prioritet (Høy/Medium/Lav) finnes ikke i HA; den leses fra beskrivelsen (`Prioritet: Høy|Medium|Lav`, også `!!` = høy). Uten det: høy hvis fristen er i dag/passert, ellers medium. Metalinjen viser frist («Frist 3. okt») og første linje av beskrivelsen.

Handlinger: avkryssing → `todo.update_item` (`status: completed|needs_action`), × → `todo.remove_item`, ny oppgave → `todo.add_item` (med `description: "Prioritet: Høy|Lav"` når prioriteten ikke er Medium). Filtrene er lokale visningsvalg.
