// --- STATE MANAGEMENT ---
let echoes = 0;
let echoesPerSecond = 0;

// --- FLEETING THOUGHTS LIST ---
const moteThoughts = [
  "Nobody's home",
  "You left it open",
  "Inside your skin",
  "Past the hallway",
  "A ticking clock",
  "Flickering static",
  "Forgotten names",
  "Cold tea",
  "Light blue dust",
  "Soft whispers"
];

// --- SHOP UPGRADE DEFINITIONS (TIERS 1 - 3) ---
const shopItems = [
  { id: 'hourglass', name: 'Hourglass Shard', cost: 15, income: 1, count: 0, icon: 'assets/item-hourglass.png' },
  { id: 'polaroid', name: 'Fading Polaroid', cost: 75, income: 3, count: 0, icon: 'assets/item-polaroid.png' },
  { id: 'moontear', name: 'The Moon Tear', cost: 240, income: 8, count: 0, icon: 'assets/item-moontear.png' },
  { id: 'tv', name: 'Static Television', cost: 900, income: 25, count: 0, icon: 'assets/item-tv.png' },
  { id: 'letter', name: 'Unopened Letter', cost: 3200, income: 70, count: 0, icon: 'assets/item-letter.png' },
  { id: 'clock', name: 'Melding Clock', cost: 9500, income: 180, count: 0, icon: 'assets/item-clock.png' },
  { id: 'mirror', name: 'Corridor Mirror', cost: 28000, income: 450, count: 0, icon: 'assets/item-mirror.png' },
  { id: 'pillow', name: 'Ghost Cat Pillow', cost: 85000, income: 1200, count: 0, icon: 'assets/item-pillow.png' }
];

// --- DOM REFERENCES ---
const backgroundLayer = document.getElementById('background-layer');
const moteContainer = document.getElementById('mote-container');
const crystalOrb = document.getElementById('crystal-orb');
const echoCountDisplay = document.getElementById('echo-count');
const echoRateDisplay = document.getElementById('echo-rate');
const shopItemsContainer = document.getElementById('shop-items');
const cardFlipAudio = new Audio('assets/cardflip.mp3');
const gameplayAudio = new Audio('assets/gameplay.mp3');

// --- DYNAMIC DAY/NIGHT CYCLE ---
function updateTimeOfDay() {
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 18;
  backgroundLayer.style.backgroundImage = isDay ? "url('assets/day.png')" : "url('assets/night.png')";
}
updateTimeOfDay();
setInterval(updateTimeOfDay, 60000);

// --- ACTIVE CLICKING: ORB ---
crystalOrb.addEventListener('click', (e) => {
  addEchoes(1);
  triggerOrbJump();
  playRapidAudio(gameplayAudio, 0.4);
  createRipple(e.clientX, e.clientY);
  spawnFloatingText(e.clientX, e.clientY, "+1");
});

function triggerOrbJump() {
  crystalOrb.classList.remove('jumping');
  void crystalOrb.offsetWidth;
  crystalOrb.classList.add('jumping');
}

// --- MOTE SPAWN ENGINE ---
function spawnMote() {
  const mote = document.createElement('img');
  mote.src = 'assets/mote.png';
  mote.className = 'floating-mote';

  // Random placement within interactive screen bounds
  const x = Math.random() * (window.innerWidth - 60) + 30;
  const y = Math.random() * (window.innerHeight * 0.45) + 60;
  mote.style.left = `${x}px`;
  mote.style.top = `${y}px`;

  mote.addEventListener('click', (e) => {
    e.stopPropagation();
    const gain = Math.max(2, Math.floor(echoesPerSecond * 0.5) + 2);
    addEchoes(gain);
    playRapidAudio(gameplayAudio, 0.5);

    createRipple(e.clientX, e.clientY);
    const thought = moteThoughts[Math.floor(Math.random() * moteThoughts.length)];
    spawnFloatingText(e.clientX, e.clientY, `${thought} (+${gain})`);

    mote.remove();
  });

  moteContainer.appendChild(mote);

  // Auto-remove unclicked motes after 10s
  setTimeout(() => {
    if (mote.parentNode) {
      mote.remove();
    }
  }, 10000);
}

setInterval(spawnMote, 4500);

// --- VISUAL EFFECTS HELPERS ---
function createRipple(x, y) {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 450);
}

function spawnFloatingText(x, y, text) {
  const label = document.createElement('div');
  label.className = 'fleeting-thought';
  label.innerText = text;
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
  document.body.appendChild(label);
  setTimeout(() => label.remove(), 1800);
}

function playRapidAudio(audioObj, volume = 0.5) {
  const sound = audioObj.cloneNode();
  sound.volume = volume;
  sound.play().catch(() => {});
}

// --- ECONOMY & SHOP SYSTEM ---
function addEchoes(amount) {
  echoes += amount;
  updateUI();
}

function calculateEchoRate() {
  echoesPerSecond = shopItems.reduce((total, item) => total + (item.count * item.income), 0);
  echoRateDisplay.innerText = `${echoesPerSecond} / sec`;
}

function renderShop() {
  shopItemsContainer.innerHTML = '';
  shopItems.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = `shop-item ${echoes < item.cost ? 'disabled' : ''}`;
    itemEl.innerHTML = `
      <img src="${item.icon}" alt="${item.name}">
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-stats">+${item.income} Echo/s</div>
      </div>
      <div class="item-cost-box">
        <div class="item-cost">${item.cost} Echoes</div>
        <div class="item-count">Owned: ${item.count}</div>
      </div>
    `;

    itemEl.addEventListener('click', () => buyShopItem(index));
    shopItemsContainer.appendChild(itemEl);
  });
}

function buyShopItem(index) {
  const item = shopItems[index];
  if (echoes >= item.cost) {
    echoes -= item.cost;
    item.count += 1;
    item.cost = Math.floor(item.cost * 1.18); // 18% price scale
    calculateEchoRate();
    updateUI();
  }
}

// Passive income tick: 10 times a second for fluid progress
setInterval(() => {
  if (echoesPerSecond > 0) {
    echoes += echoesPerSecond / 10;
    updateUI();
  }
}, 100);

function updateUI() {
  echoCountDisplay.innerText = Math.floor(echoes);
  
  // Refresh disabled status on shop buttons efficiently
  const shopElements = document.querySelectorAll('.shop-item');
  shopElements.forEach((el, index) => {
    if (echoes >= shopItems[index].cost) {
      el.classList.remove('disabled');
    } else {
      el.classList.add('disabled');
    }
  });
}

// --- TAROT CARD FLIP LISTENERS ---
document.querySelectorAll('.tarot-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!card.classList.contains('flipped')) {
      playRapidAudio(cardFlipAudio, 0.6);
      card.classList.add('flipped');
    }
  });
});

// Initial load render
calculateEchoRate();
renderShop();
updateUI();
