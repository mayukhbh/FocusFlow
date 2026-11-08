// Intent screen: on the YouTube home page with Focus Mode on, the feed is covered by one
// question and a search box. It is an overlay below YouTube's top bar, so it does not
// depend on feed markup. "Browse anyway" sets `browseUntil` for 10 minutes.

(() => {
  'use strict';
  const ROOT_ID = 'fm-intent';
  const BROWSE_MIN = 10;
  let state = { enabled: false, browseUntil: 0, hideHome: true };

  const isHome = () => location.pathname === '/' || location.pathname === '';

  function build() {
    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Focus Mode');
    root.innerHTML = `
      <div class="fm-inner">
        <p class="fm-kicker">Focus Mode is on</p>
        <h1 class="fm-q">What are you here for?</h1>
        <form class="fm-form" role="search">
          <label class="fm-sr" for="fm-q-input">Search YouTube</label>
          <input id="fm-q-input" type="search" autocomplete="off" placeholder="Search for the one thing you came for" />
          <button type="submit">Search</button>
        </form>
        <button type="button" class="fm-browse">Browse anyway for ${BROWSE_MIN} minutes</button>
      </div>`;
    root.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = root.querySelector('input').value.trim();
      if (q) location.href = `/results?search_query=${encodeURIComponent(q)}`;
    });
    root.querySelector('.fm-browse').addEventListener('click', () => {
      const until = Date.now() + BROWSE_MIN * 60000;
      chrome.storage.sync.set({ browseUntil: until });
      state.browseUntil = until;
      update();
    });
    return root;
  }

  function update() {
    const existing = document.getElementById(ROOT_ID);
    const show = state.enabled && state.hideHome && isHome() && Date.now() >= (state.browseUntil || 0);
    document.documentElement.classList.toggle('fm-intent-on', show);
    if (show && !existing) {
      const root = build();
      document.body.appendChild(root);
      setTimeout(() => root.querySelector('input')?.focus({ preventScroll: true }), 50);
    } else if (!show && existing) {
      existing.remove();
    }
  }

  chrome.storage.sync.get(['enabled', 'researchMode', 'browseUntil', 'hide'], (r) => {
    state = { enabled: r.enabled ?? r.researchMode ?? false, browseUntil: r.browseUntil || 0, hideHome: r.hide?.home !== false };
    update();
  });
  chrome.storage.onChanged.addListener((c, area) => {
    if (area !== 'sync') return;
    if (c.enabled) state.enabled = !!c.enabled.newValue;
    else if (c.researchMode) state.enabled = !!c.researchMode.newValue;
    if (c.browseUntil) state.browseUntil = c.browseUntil.newValue || 0;
    if (c.hide) state.hideHome = c.hide.newValue?.home !== false;
    update();
  });
  // YouTube is a single-page app: re-check after each in-app navigation.
  document.addEventListener('yt-navigate-finish', update);
  window.addEventListener('popstate', update);
  setInterval(update, 30000); // ends "browse anyway" when its time is up
})();
