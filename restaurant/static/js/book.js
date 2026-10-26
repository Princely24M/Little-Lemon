// Slots are hours in 24h format: 10 (10 AM) ... 20 (8 PM)
const FIRST_SLOT = 10;
const LAST_SLOT = 20;

const form = document.getElementById('booking-form');
const dateInput = document.getElementById('reservation_date');
const nameInput = document.getElementById('first_name');
const slotSelect = document.getElementById('reservation_slot');
const messageEl = document.getElementById('message');
const listEl = document.getElementById('today');
const selectedDateEl = document.getElementById('selected-date');
const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

function slotLabel(h) {
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

// Local date, NOT toISOString() (which is UTC and can be off by a day).
function todayLocal() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function showMessage(text, kind) {
  messageEl.textContent = text;
  messageEl.className = kind || '';
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderSlots(booked) {
  const previous = slotSelect.value;
  slotSelect.innerHTML = '<option value="" disabled>Select time</option>';
  for (let h = FIRST_SLOT; h <= LAST_SLOT; h++) {
    const opt = document.createElement('option');
    opt.value = h;
    opt.textContent = slotLabel(h);
    if (booked.includes(h)) opt.disabled = true;  // greyed out
    slotSelect.appendChild(opt);
  }
  // Keep the previous choice if still free, else pick the first free slot
  const keep = [...slotSelect.options].find(o => o.value === previous && !o.disabled);
  const firstFree = [...slotSelect.options].find(o => !o.disabled);
  if (keep) keep.selected = true;
  else if (firstFree) firstFree.selected = true;
  else slotSelect.selectedIndex = 0;
}

function getBookings() {
  const day = dateInput.value;
  selectedDateEl.textContent = day;
  if (!day) return Promise.resolve();

  return fetch(`/bookings?date=${encodeURIComponent(day)}`)
    .then(r => {
      if (!r.ok) throw new Error('Could not load bookings');
      return r.json();
    })
    .then(data => {
      const booked = data.map(item => item.fields.reservation_slot);
      renderSlots(booked);
      listEl.innerHTML = data.length
        ? data.map(item =>
            `<p>${escapeHtml(item.fields.first_name)} - ${slotLabel(item.fields.reservation_slot)}</p>`
          ).join('')
        : '<p>No Booking</p>';
    })
    .catch(err => showMessage(err.message, 'error'));
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return showMessage('Please enter your name.', 'error');
  if (!dateInput.value) return showMessage('Please choose a date.', 'error');
  if (slotSelect.selectedOptions.length === 0 || slotSelect.selectedOptions[0].disabled) {
    return showMessage('No free slot on this date.', 'error');
  }

  fetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
    body: JSON.stringify({
      first_name: name,
      reservation_date: dateInput.value,
      reservation_slot: slotSelect.value,
    }),
  })
    .then(r => r.json().then(body => ({ status: r.status, body })))
    .then(({ status, body }) => {
      if (status === 201) {
        showMessage('Reservation saved!', 'ok');
        nameInput.value = '';
      } else if (status === 409) {
        showMessage('Sorry, that slot was just booked. Please pick another.', 'error');
      } else {
        showMessage(body.error || 'Something went wrong.', 'error');
      }
      return getBookings();
    })
    .catch(() => showMessage('Network error.', 'error'));
});

dateInput.value = todayLocal();          // criterion 13
dateInput.addEventListener('change', () => { showMessage(''); getBookings(); });  // criterion 8
getBookings();
