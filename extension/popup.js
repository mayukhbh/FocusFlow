// Focus Mode popup.
// Storage follows docs/CONTRACT.md (`enabled`, `stats.focusedMsByDay`). Until the content
// script moves to that schema, the popup also writes the old `researchMode` key and sends
// the old message, so the extension keeps working in the meantime.

(async () => {
  const pop = document.getElementById('pop');
  const sw = document.getElementById('switch');
  const title = document.getElementById('stateTitle');
  const text = document.getElementById('stateText');
  const focusedToday = document.getElementById('focusedToday');
  const tabStatus = document.getElementById('tabStatus');

  const todayKey = () => new Date().toLocaleDateString('en-CA');
  const fmt = (ms) => {
    const m = Math.round(ms / 60000);
    if (m < 1) return 'None yet';
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)} h ${m % 60} m`;
  };

  let tab = null;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch {
    /* no tab access */
  }
  const onYouTube = !!tab?.url && /^https?:\/\/([a-z0-9-]+\.)?youtube\.com\//.test(tab.url);
  tabStatus.textContent = onYouTube ? 'YouTube, active' : 'Not YouTube';

  const render = (on) => {
    pop.dataset.on = String(on);
    sw.setAttribute('aria-checked', String(on));
    title.textContent = on ? 'Focus is on' : 'Focus is off';
    text.textContent = on
      ? 'YouTube opens to a question, not a feed. Recommendations stay hidden.'
      : 'YouTube looks the way it normally does.';
  };

  const stored = await chrome.storage.sync.get(['enabled', 'researchMode', 'stats']);
  let on = stored.enabled ?? stored.researchMode ?? false;
  render(on);
  focusedToday.textContent = fmt(stored.stats?.focusedMsByDay?.[todayKey()] ?? 0);

  sw.addEventListener('click', async () => {
    on = !on;
    render(on);
    await chrome.storage.sync.set({ enabled: on, researchMode: on });
    if (onYouTube && tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleResearchMode', enabled: on }).catch(() => {});
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.enabled) {
      on = !!changes.enabled.newValue;
      render(on);
    }
    if (changes.stats) focusedToday.textContent = fmt(changes.stats.newValue?.focusedMsByDay?.[todayKey()] ?? 0);
  });

  document.getElementById('settingsLink').addEventListener('click', (e) => {
    if (chrome.runtime.openOptionsPage) {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    }
  });
})();
