/* ---------------- In-memory data (resets on page reload) ---------------- */
let listings = [
  { id: 1, crop: 'Maize', qty: 500, unit: 'kg', location: 'Masaka', price: 1200, contact: '0772 345 678', farmer: 'Nakato Sarah' },
  { id: 2, crop: 'Coffee', qty: 200, unit: 'kg', location: 'Mukono', price: 9500, contact: '0701 998 221', farmer: 'Ssewanyana John' },
  { id: 3, crop: 'Beans', qty: 300, unit: 'kg', location: 'Mbarara', price: 3200, contact: '0782 114 890', farmer: 'Kwikiriza Grace' },
  { id: 4, crop: 'Bananas (Matooke)', qty: 150, unit: 'bunches', location: 'Kayunga', price: 8000, contact: '0759 220 341', farmer: 'Okello Peter' }
];
let salesRecords = [{ product: 'Coffee', qty: '50 kg', price: 'UGX 9,500/kg', buyer: 'Kampala Exporters Ltd', date: '2026-08-20', farmer: 'Ssewanyana John' }];
let nextId = listings.reduce((max, listing) => Math.max(max, listing.id), 0) + 1;

const marketPrices = [
  { crop: 'Maize', icon: '🌽', price: '1,150 – 1,300', unit: '/kg', trend: 'up' },
  { crop: 'Beans', icon: '🫘', price: '3,000 – 3,400', unit: '/kg', trend: 'down' },
  { crop: 'Coffee (Kiboko)', icon: '☕', price: '9,000 – 9,800', unit: '/kg', trend: 'up' },
  { crop: 'Tomatoes', icon: '🍅', price: '1,800 – 2,500', unit: '/kg', trend: 'down' },
  { crop: 'Bananas (Matooke)', icon: '🍌', price: '7,500 – 9,000', unit: '/bunch', trend: 'up' },
  { crop: 'Cassava', icon: '🥔', price: '900 – 1,100', unit: '/kg', trend: 'flat' }
];
const cropIcons = { Maize: '🌽', Beans: '🫘', Coffee: '☕', Tomatoes: '🍅', 'Bananas (Matooke)': '🍌', Cassava: '🥔', Other: '🌱' };
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const formatNumber = value => Number(value).toLocaleString('en-UG');

function goTo(tab) {
  const target = document.getElementById(`screen-${tab}`);
  const navButton = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
  if (!target || !navButton) return;
  document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
  target.classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(button => button.classList.toggle('active', button === navButton));
  renderAll();
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function renderTicker() {
  const track = document.getElementById('tickerTrack');
  const items = marketPrices.map(price => {
    const arrow = price.trend === 'up' ? '<span class="up">▲</span>' : price.trend === 'down' ? '<span class="down">▼</span>' : '<span>▬</span>';
    return `<span class="ticker-item">${price.icon} ${escapeHTML(price.crop)} UGX ${escapeHTML(price.price)}${price.unit} ${arrow}</span>`;
  }).join('');
  track.innerHTML = items + items;
}

function renderHome() {
  document.getElementById('statListings').textContent = listings.length;
  document.getElementById('statSales').textContent = salesRecords.length;
  document.getElementById('statCrops').textContent = new Set(listings.map(listing => listing.crop)).size;
  const recent = [...listings].slice(-3).reverse();
  document.getElementById('homeListings').innerHTML = recent.map(listingCardHTML).join('') || emptyState('🌱', 'No listings yet. Be the first farmer to list a crop.');
}

function addListing() {
  const crop = document.getElementById('f-crop').value;
  const qty = Number(document.getElementById('f-qty').value);
  const location = document.getElementById('f-location').value.trim();
  const price = Number(document.getElementById('f-price').value);
  const contact = document.getElementById('f-contact').value.trim();
  if (!Number.isFinite(qty) || qty <= 0 || !location || !Number.isFinite(price) || price <= 0 || !contact) {
    showToast('Enter a valid quantity, location, price and contact.');
    return;
  }
  listings.push({ id: nextId++, crop, qty, unit: 'kg', location, price, contact, farmer: 'You' });
  ['f-qty', 'f-location', 'f-price', 'f-contact'].forEach(id => { document.getElementById(id).value = ''; });
  showToast(`✅ ${crop} listed successfully`);
  renderAll();
}

function removeListing(id) {
  listings = listings.filter(listing => listing.id !== id);
  showToast('Listing removed');
  renderAll();
}

function editListing(id) {
  const listing = listings.find(item => item.id === id);
  if (!listing) return;
  const newQty = prompt('Update quantity (kg):', listing.qty);
  if (newQty === null) return;
  const newPrice = prompt('Update price (UGX/kg):', listing.price);
  if (newPrice === null) return;
  const qty = Number(newQty);
  const price = Number(newPrice);
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) { showToast('Enter positive numbers only.'); return; }
  listing.qty = qty;
  listing.price = price;
  showToast('Listing updated');
  renderAll();
}

function renderFarmerListings() {
  const mine = listings.filter(listing => listing.farmer === 'You');
  document.getElementById('farmerListings').innerHTML = mine.map(listing => `
    <div class="listing-card">
      <div style="display:flex; gap:12px; align-items:center;"><div class="listing-icon">${cropIcons[listing.crop] || '🌱'}</div><div class="listing-body"><div class="listing-crop">${escapeHTML(listing.crop)}</div><div class="listing-meta"><span>${formatNumber(listing.qty)} ${escapeHTML(listing.unit)}</span><span>📍 ${escapeHTML(listing.location)}</span></div></div><div class="listing-price">UGX ${formatNumber(listing.price)}/kg</div></div>
      <div class="listing-actions"><button type="button" onclick="editListing(${listing.id})">Edit</button><button type="button" class="danger" onclick="removeListing(${listing.id})">Remove</button></div>
    </div>`).join('') || emptyState('📋', "You haven't listed anything yet. Use the form above.");
}

function renderSearch() {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const results = query ? listings.filter(listing => listing.crop.toLowerCase().includes(query)) : listings;
  document.getElementById('searchResults').innerHTML = results.map(listingCardHTML).join('') || emptyState('🔍', `No crops match "${query}". Try another search.`);
}

function contactFarmer(id) {
  const listing = listings.find(item => item.id === id);
  if (!listing) return;
  salesRecords.push({ product: listing.crop, qty: `${listing.qty} ${listing.unit}`, price: `UGX ${formatNumber(listing.price)}/kg`, buyer: 'You', date: new Date().toISOString().slice(0, 10), farmer: listing.farmer });
  showToast(`📞 Contacting ${listing.farmer} — ${listing.contact}`);
  renderAll();
}

function listingCardHTML(listing) {
  return `<div class="listing-card"><div style="display:flex; gap:12px; align-items:center;"><div class="listing-icon">${cropIcons[listing.crop] || '🌱'}</div><div class="listing-body"><div class="listing-crop">${escapeHTML(listing.crop)}</div><div class="listing-meta"><span>${formatNumber(listing.qty)} ${escapeHTML(listing.unit)}</span><span>📍 ${escapeHTML(listing.location)}</span><span class="badge">${escapeHTML(listing.farmer)}</span></div></div><div class="listing-price">UGX ${formatNumber(listing.price)}/kg</div></div><button type="button" class="contact-btn" onclick="contactFarmer(${listing.id})">Contact Farmer — ${escapeHTML(listing.contact)}</button></div>`;
}

function emptyState(glyph, text) { return `<div class="empty-state"><div class="glyph" aria-hidden="true">${glyph}</div><p>${escapeHTML(text)}</p></div>`; }
function renderPrices() { document.getElementById('priceBoard').innerHTML = marketPrices.map(price => { const trend = price.trend === 'up' ? '<span class="trend-up">▲ rising</span>' : price.trend === 'down' ? '<span class="trend-down">▼ falling</span>' : '<span style="color:#B9B09A;">▬ steady</span>'; return `<div class="price-row"><div class="price-crop">${price.icon} ${escapeHTML(price.crop)}</div><div class="price-val">UGX ${escapeHTML(price.price)}${price.unit}<br><span class="price-trend">${trend}</span></div></div>`; }).join(''); }
function renderRecords() { document.getElementById('recordsList').innerHTML = [...salesRecords].reverse().map(record => `<div class="record-card"><div class="record-top"><span>${escapeHTML(record.product)}</span><span class="badge">${escapeHTML(record.date)}</span></div><div class="record-grid"><div>Quantity: <b>${escapeHTML(record.qty)}</b></div><div>Price: <b>${escapeHTML(record.price)}</b></div><div>Buyer: <b>${escapeHTML(record.buyer)}</b></div><div>Farmer: <b>${escapeHTML(record.farmer)}</b></div></div></div>`).join('') || emptyState('🧾', 'No sales recorded yet.'); }
function renderAll() { renderHome(); renderFarmerListings(); renderSearch(); renderPrices(); renderRecords(); }

renderTicker();
renderAll();
