# Focus Mode design: intent first

YouTube opens to a question, not a feed. The popup is one switch.

## Surfaces

- **Popup (`popup.*`).** A single physical-looking rocker switch. Turning focus on dims the whole popup, like switching a light off. Under the switch: the state in words, focused time today, and whether this tab is YouTube. Monochrome: `#EDEDEA` light, `#1C1C1C` dark, no accent color.
- **Intent screen (`intent.*`).** On the YouTube home page with focus on, an overlay below YouTube's top bar asks "What are you here for?" with a search box and a small "Browse anyway for 10 minutes" link. It uses YouTube's own fonts and follows its light or dark theme (`html[dark]`), so it feels native. It is an overlay rather than a change to YouTube's feed markup, so feed redesigns can't break it.
- **Settings (`options.*`).** What to hide while focusing (home feed, Shorts, recommendations beside videos, end screens and cards, comments), and focus hours with days of the week. Changes save immediately with a short confirmation.

## Storage

Follows `docs/CONTRACT.md`: `enabled`, `hide`, `focusHours`, `browseUntil`, `stats.focusedMsByDay`.

Until the content-script rewrite moves to that schema, the popup also writes the old `researchMode` key and sends the old `toggleResearchMode` message, so the extension keeps working. Remove both once `content.js` reads `enabled`.

## Notes for the engineering rewrite

- `intent.js` handles the home feed itself, so the stylesheet rewrite doesn't need a `#fm-intent-root` mount point. It shows only when `enabled`, `hide.home` is not false, the path is `/`, and `browseUntil` has passed.
- The hide toggles and focus hours in Settings are saved but not yet applied. The content script should read `hide` for each class and apply `focusHours`.
- The popup shows `stats.focusedMsByDay[today]`, which the background script should record.
