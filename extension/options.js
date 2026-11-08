// Settings page. Reads and writes `hide` and `focusHours` as described in docs/CONTRACT.md.

(async () => {
  const HIDE = [
    { id: 'home', label: 'Home feed', help: 'Replaced by "What are you here for?" and a search box.' },
    { id: 'shorts', label: 'Shorts', help: 'The Shorts shelf, tab and Shorts in search results.' },
    { id: 'sidebar', label: 'Recommendations beside videos', help: 'The column of suggested videos next to the player.' },
    { id: 'endscreen', label: 'End screens and cards', help: 'Suggestions that appear over the video as it ends.' },
    { id: 'comments', label: 'Comments', help: 'The comment section under each video.' },
  ];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DEFAULTS = {
    hide: { home: true, shorts: true, sidebar: true, endscreen: true, comments: false },
    focusHours: { enabled: false, start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
  };

  const saved = document.getElementById('saved');
  let timer;
  const note = (msg) => {
    saved.textContent = msg;
    clearTimeout(timer);
    timer = setTimeout(() => (saved.textContent = ''), 2000);
  };

  const s = await chrome.storage.sync.get(['hide', 'focusHours']);
  const hide = { ...DEFAULTS.hide, ...(s.hide || {}) };
  const hours = { ...DEFAULTS.focusHours, ...(s.focusHours || {}) };

  const save = async (patch, msg) => {
    await chrome.storage.sync.set(patch);
    note(msg);
  };

  const list = document.getElementById('hideList');
  for (const h of HIDE) {
    const li = document.createElement('li');
    li.innerHTML = `<label class="opt-row"><span><span class="opt-label"></span><span class="opt-help"></span></span><input type="checkbox" role="switch"></label>`;
    li.querySelector('.opt-label').textContent = h.label;
    li.querySelector('.opt-help').textContent = h.help;
    const box = li.querySelector('input');
    box.checked = !!hide[h.id];
    box.setAttribute('aria-label', h.label);
    box.addEventListener('change', () => {
      hide[h.id] = box.checked;
      save({ hide }, `${h.label} will be ${box.checked ? 'hidden' : 'shown'} while focusing.`);
    });
    list.appendChild(li);
  }

  const on = document.getElementById('hoursOn');
  const boxEl = document.getElementById('hoursBox');
  const start = document.getElementById('hoursStart');
  const end = document.getElementById('hoursEnd');
  on.checked = hours.enabled;
  boxEl.hidden = !hours.enabled;
  start.value = hours.start;
  end.value = hours.end;

  on.addEventListener('change', () => {
    hours.enabled = on.checked;
    boxEl.hidden = !on.checked;
    save({ focusHours: hours }, on.checked ? 'Focus hours turned on.' : 'Focus hours turned off.');
  });
  start.addEventListener('change', () => { hours.start = start.value; save({ focusHours: hours }, 'Focus hours saved.'); });
  end.addEventListener('change', () => { hours.end = end.value; save({ focusHours: hours }, 'Focus hours saved.'); });

  const days = document.getElementById('days');
  DAYS.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = d;
    b.setAttribute('aria-pressed', String(hours.days.includes(i)));
    b.addEventListener('click', () => {
      hours.days = hours.days.includes(i) ? hours.days.filter((x) => x !== i) : [...hours.days, i].sort();
      b.setAttribute('aria-pressed', String(hours.days.includes(i)));
      save({ focusHours: hours }, 'Focus hours saved.');
    });
    days.appendChild(b);
  });
})();
