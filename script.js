const form = document.querySelector('#availability-form');
const list = document.querySelector('#availability-list');
const template = document.querySelector('#entry-template');
const countLabel = document.querySelector('#entry-count');
const clearButton = document.querySelector('#clear-all');
const shareButton = document.querySelector('#share-plan');
const statusMessage = document.querySelector('#status-message');

const STORAGE_KEY = 'when-and-where-availability';
const SHARE_PREFIX = '#plan=';

const showStatus = (message) => {
  statusMessage.textContent = message;
};

const readEntries = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const formatTime = (timeValue) => {
  const [hours = '0', minutes = '00'] = timeValue.split(':');
  const hour = Number(hours);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${minutes} ${suffix}`;
};

const encodeEntriesToHash = (entries) => {
  const json = JSON.stringify(entries);
  return `${SHARE_PREFIX}${encodeURIComponent(btoa(json))}`;
};

const decodeEntriesFromHash = () => {
  if (!window.location.hash.startsWith(SHARE_PREFIX)) {
    return null;
  }

  const encoded = window.location.hash.slice(SHARE_PREFIX.length);
  if (!encoded) return null;

  try {
    const decoded = atob(decodeURIComponent(encoded));
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const render = () => {
  const entries = readEntries();
  list.innerHTML = '';

  if (entries.length === 0) {
    list.innerHTML = '<li class="empty">No one has added their availability yet.</li>';
    countLabel.textContent = 'No plans yet';
    clearButton.disabled = true;
    shareButton.disabled = true;
    return;
  }

  countLabel.textContent = `${entries.length} ${entries.length === 1 ? 'plan' : 'plans'} added`;
  clearButton.disabled = false;
  shareButton.disabled = false;

  entries.forEach((entry, index) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.person').textContent = entry.name;
    node.querySelector('.meta').textContent = `${entry.day} · ${formatTime(entry.time)} · ${entry.place}`;
    node.querySelector('.note').textContent = entry.notes || 'No extra notes';

    node.querySelector('.remove').addEventListener('click', () => {
      const next = readEntries().filter((_, i) => i !== index);
      saveEntries(next);
      showStatus('Entry removed.');
      render();
    });

    list.append(node);
  });
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);

  const entry = {
    name: data.get('name')?.toString().trim(),
    day: data.get('day')?.toString().trim(),
    time: data.get('time')?.toString(),
    place: data.get('place')?.toString().trim(),
    notes: data.get('notes')?.toString().trim()
  };

  if (!entry.name || !entry.day || !entry.time || !entry.place) {
    showStatus('Please fill in name, day, time, and place.');
    return;
  }

  const entries = readEntries();
  entries.push(entry);
  saveEntries(entries);
  form.reset();
  showStatus('Availability saved.');
  render();
});

clearButton.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  window.history.replaceState({}, '', window.location.pathname);
  showStatus('All availability cleared.');
  render();
});

shareButton.addEventListener('click', async () => {
  const entries = readEntries();
  if (entries.length === 0) return;

  const shareUrl = `${window.location.origin}${window.location.pathname}${encodeEntriesToHash(entries)}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    showStatus('Share link copied! Send it to your friends.');
  } catch {
    showStatus(`Copy failed. Share this URL manually: ${shareUrl}`);
  }
});

const importedEntries = decodeEntriesFromHash();
if (importedEntries) {
  saveEntries(importedEntries);
  showStatus('Loaded a shared plan from the link.');
}

render();
