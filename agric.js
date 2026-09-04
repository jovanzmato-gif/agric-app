/* ---------------- In-memory data (resets on page reload) ---------------- */
let listings = [
  {id:1, crop:"Maize", qty:500, unit:"kg", location:"Masaka", price:1200, contact:"0772 345 678", farmer:"Nakato Sarah"},
  {id:2, crop:"Coffee", qty:200, unit:"kg", location:"Mukono", price:9500, contact:"0701 998 221", farmer:"Ssewanyana John"},
  {id:3, crop:"Beans", qty:300, unit:"kg", location:"Mbarara", price:3200, contact:"0782 114 890", farmer:"Kwikiriza Grace"},
  {id:4, crop:"Bananas (Matooke)", qty:150, unit:"bunches", location:"Kayunga", price:8000, contact:"0759 220 341", farmer:"Okello Peter"},
];
let salesRecords = [
  {product:"Coffee", qty:"50 kg", price:"UGX 9,500/kg", buyer:"Kampala Exporters Ltd", date:"2026-08-20", farmer:"Ssewanyana John"},
];
let nextId = 5;

const marketPrices = [
  {crop:"Maize", icon:"🌽", price:"1,150 – 1,300", unit:"/kg", trend:"up"},
  {crop:"Beans", icon:"🫘", price:"3,000 – 3,400", unit:"/kg", trend:"down"},
  {crop:"Coffee (Kiboko)", icon:"☕", price:"9,000 – 9,800", unit:"/kg", trend:"up"},
  {crop:"Tomatoes", icon:"🍅", price:"1,800 – 2,500", unit:"/kg", trend:"down"},
  {crop:"Bananas (Matooke)", icon:"🍌", price:"7,500 – 9,000", unit:"/bunch", trend:"up"},
  {crop:"Cassava", icon:"🥔", price:"900 – 1,100", unit:"/kg", trend:"flat"},
];

const cropIcons = {
  "Maize":"🌽","Beans":"🫘","Coffee":"☕","Tomatoes":"🍅",
  "Bananas (Matooke)":"🍌","Cassava":"🥔","Other":"🌱"
};

/* ---------------- Navigation ---------------- */
function goTo(tab){
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-' + tab).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.nav-btn[data-tab="' + tab + '"]').classList.add('active');
  renderAll();
}

/* ---------------- Toast ---------------- */
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------------- Ticker ---------------- */
function renderTicker(){
  const track = document.getElementById('tickerTrack');
  const items = marketPrices.map(p => {
    const arrow = p.trend === 'up' ? '<span class="up">▲</span>' : p.trend === 'down' ? '<span class="down">▼</span>' : '▬';
    return <span class="ticker-item">${p.icon} ${p.crop} UGX ${p.price}${p.unit} ${arrow}</span>;
  }).join('');
  track.innerHTML = items + items;
}

/* ---------------- Home ---------------- */
function renderHome(){
  document.getElementById('statListings').textContent = listings.length;
  document.getElementById('statSales').textContent = salesRecords.length;
  const recent = [...listings].slice(-3).reverse();
  document.getElementById('homeListings').innerHTML = recent.map(listingCardHTML).join('') ||
    emptyState('🌱', 'No listings yet. Be the first farmer to list a crop.');
}

/* ---------------- Farmer screen ---------------- */
function addListing(){
  const crop = document.getElementById('f-crop').value;
  const qty = document.getElementById('f-qty').value.trim();
  const location = document.getElementById('f-location').value.trim();
  const price = document.getElementById('f-price').value.trim();
  const contact = document.getElementById('f-contact').value.trim();

  if(!qty || !location || !price || !contact){
    showToast('Please fill in every field.');
    return;
  }

  listings.push({
    id: nextId++,
    crop, qty: Number(qty), unit:"kg", location,
    price: Number(price), contact, farmer:"You"
  });

  document.getElementById('f-qty').value='';
  document.getElementById('f-location').value='';
  document.getElementById('f-price').value='';
  document.getElementById('f-contact').value='';

  showToast('✅ ' + crop + ' listed successfully');
  renderAll();
}

function removeListing(id){
  listings = listings.filter(l => l.id !== id);
  showToast('Listing removed');
  renderAll();
}

function editListing(id){
  const l = listings.find(x => x.id === id);
  if(!l) return;
  const newQty = prompt('Update quantity (kg):', l.qty);
  if(newQty === null) return;
  const newPrice = prompt('Update price (UGX/kg):', l.price);
  if(newPrice === null) return;
  l.qty = Number(newQty) || l.qty;
  l.price = Number(newPrice) || l.price;
  showToast('Listing updated');
  renderAll();
}

function renderFarmerListings(){
  const mine = listings.filter(l => l.farmer === "You");
  document.getElementById('farmerListings').innerHTML = mine.map(l => `
    <div class="listing-card">
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="listing-icon">${cropIcons[l.crop] || '🌱'}</div>
        <div class="listing-body">
          <div class="listing-crop">${l.crop}</div>
          <div class="listing-meta"><span>${l.qty} ${l.unit}</span><span>📍 ${l.location}</span></div>
        </div>
        <div class="listing-price">UGX ${l.price.toLocaleString()}/kg</div>
      </div>
      <div class="listing-actions">
        <button onclick="editListing(${l.id})">Edit</button>
        <button class="danger" onclick="removeListing(${l.id})">Remove</button>
      </div>
    </div>
  `).join('') || emptyState('📋', "You haven't listed anything yet. Use the form above.");
}

/* ---------------- Search / Buyer screen ---------------- */
function renderSearch(){
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const results = q ? listings.filter(l => l.crop.toLowerCase().includes(q)) : listings;
  const box = document.getElementById('searchResults');
  box.innerHTML = results.map(listingCardHTML).join('') ||
    emptyState('🔍', 'No crops match "' + q + '". Try another search.');
}

function contactFarmer(id){
  const l = listings.find(x => x.id === id);
  if(!l) return;
  salesRecords.push({
    product: l.crop,
    qty: l.qty + ' ' + l.unit,
    price: 'UGX ' + l.price.toLocaleString() + '/kg',
    buyer: 'You',
    date: new Date().toISOString().slice(0,10),
    farmer: l.farmer
  });
  showToast('📞 Contacting ' + l.farmer + ' — ' + l.contact);
  renderAll();
}

/* ---------------- Shared listing card ---------------- */
function listingCardHTML(l){
  return `
    <div class="listing-card">
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="listing-icon">${cropIcons[l.crop] || '🌱'}</div>
        <div class="listing-body">
          <div class="listing-crop">${l.crop}</div>
          <div class="listing-meta"><span>${l.qty} ${l.unit}</span><span>📍 ${l.location}</span><span class="badge">${l.farmer}</span></div>
        </div>
        <div class="listing-price">UGX ${l.price.toLocaleString()}/kg</div>
      </div>
      <button class="contact-btn" onclick="contactFarmer(${l.id})">Contact Farmer — ${l.contact}</button>
    </div>
  `;
}

function emptyState(glyph, text){
  return <div class="empty-state"><div class="glyph">${glyph}</div><p>${text}</p></div>;
}

/* ---------------- Market prices screen ---------------- */
function renderPrices(){
  document.getElementById('priceBoard').innerHTML = marketPrices.map(p => {
    const trendHTML = p.trend === 'up' ? '<span class="trend-up">▲ rising</span>'
      : p.trend === 'down' ? '<span class="trend-down">▼ falling</span>'
      : '<span style="color:#B9B09A;">▬ steady</span>';
    return `
      <div class="price-row">
        <div class="price-crop">${p.icon} ${p.crop}</div>
        <div class="price-val">UGX ${p.price}${p.unit}<br><span class="price-trend">${trendHTML}</span></div>
      </div>
    `;
  }).join('');
}

/* ---------------- Records screen ---------------- */
function renderRecords(){
  document.getElementById('recordsList').innerHTML = [...salesRecords].reverse().map(r => `
    <div class="record-card">
      <div class="record-top"><span>${r.product}</span><span class="badge">${r.date}</span></div>
      <div class="record-grid">
        <div>Quantity: <b>${r.qty}</b></div>
        <div>Price: <b>${r.price}</b></div>
        <div>Buyer: <b>${r.buyer}</b></div>
        <div>Farmer: <b>${r.farmer}</b></div>
      </div>
    </div>
  `).join('') || emptyState('🧾', 'No sales recorded yet.');
}

/* ---------------- Render everything ---------------- */
function renderAll(){
  renderHome();
  renderFarmerListings();
  renderSearch();
  renderPrices();
  renderRecords();
}

renderTicker();
renderAll();