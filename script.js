let echoes = 0;
let echoesPerSecond = 0;
let liminalDrift = 0; 
let isCheckpointActive = false;
let isChimeActive = false; 

let paths = { threshold: 0, attachment: 0, void: 0 };

const backgroundLayer = document.getElementById('background-layer');
const deskLayer = document.getElementById('desk-layer');
const moteContainer = document.getElementById('mote-container');
const crystalOrb = document.getElementById('crystal-orb');
const echoCountDisplay = document.getElementById('echo-count');
const echoRateDisplay = document.getElementById('echo-rate');
const driftBarFill = document.getElementById('drift-bar-fill');
const shopItemsContainer = document.getElementById('shop-items');
const btnTarot = document.getElementById('btn-tarot-reading');

const shopToggleBtn = document.getElementById('shop-toggle-btn');
const shopContainer = document.getElementById('shop-container');

const dialogueOverlay = document.getElementById('dialogue-overlay');
const dialogueText = document.getElementById('dialogue-text');
const dialogueChoices = document.getElementById('dialogue-choices');
const teaTimerOverlay = document.getElementById('tea-timer-overlay');
const teaBarFill = document.getElementById('tea-bar-fill');

const loreOverlay = document.getElementById('lore-overlay');
const loreImage = document.getElementById('lore-image');
const loreText = document.getElementById('lore-text');
const loreCloseBtn = document.getElementById('lore-close-btn');

const musicToggleBtn = document.getElementById('music-toggle-btn');

const chimeOverlay = document.getElementById('chime-overlay');
const chimeTimerDisplay = document.getElementById('chime-timer');
const chimeParticlesContainer = document.getElementById('chime-particles');
let chimeCountdownInterval;

// --- AUDIO SETUP ---
const cardFlipAudio = new Audio('assets/cardflip.mp3');

const gameplayAudio = new Audio('assets/gameplay.mp3');
gameplayAudio.volume = 0.5;

const teatimerAudio = new Audio('assets/teatimer.mp3');
teatimerAudio.volume = 0.6;

const tarotAudio = new Audio('assets/tarotgameplay.mp3');
tarotAudio.volume = 0.5;

const chimeAudio = new Audio('assets/chime.mp3');
chimeAudio.volume = 0.9;

const tvOnAudio = new Audio('assets/tvon.mp3');
tvOnAudio.loop = true;
tvOnAudio.volume = 0.3;

const tvCh1Audio = new Audio('assets/tvch1.mp3');
tvCh1Audio.loop = true;
tvCh1Audio.volume = 0.4;

const tvDefaultOnAudio = new Audio('assets/tvdefaulton.mp3');
const tvDefaultOffAudio = new Audio('assets/tvdefaultoff.mp3');

// --- AUDIO LOOPING ---
[gameplayAudio, tarotAudio].forEach(audio => {
  audio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play().catch(e => console.log(e));
  }, false);
});

// --- MUSIC TOGGLE LOGIC ---
let isMusicPlaying = false;

musicToggleBtn.addEventListener('click', () => {
  if (isMusicPlaying) {
    gameplayAudio.pause();
    tvOnAudio.pause();
    tvCh1Audio.pause();
    musicToggleBtn.innerText = '🔇';
    isMusicPlaying = false;
  } else {
    gameplayAudio.play().catch(e => console.log(e));
    musicToggleBtn.innerText = '🔊';
    isMusicPlaying = true;
  }
});

// --- HOURLY CHIME LOGIC ---
function checkHourlyChime() {
  const now = new Date();
  if (now.getMinutes() === 0 && now.getSeconds() === 0 && !isChimeActive) {
    triggerHourlyChime();
  }
}
setInterval(checkHourlyChime, 1000); 

function triggerHourlyChime() {
  isChimeActive = true;
  
  backgroundLayer.classList.add('hourly-blur');
  deskLayer.classList.add('hourly-blur');
  moteContainer.classList.add('hourly-blur');

  chimeOverlay.classList.remove('hidden');

  if (isMusicPlaying) {
    gameplayAudio.pause();
    tvOnAudio.pause();
    tvCh1Audio.pause();
  }
  chimeAudio.currentTime = 0;
  chimeAudio.play().catch(()=>{});

  chimeParticlesContainer.innerHTML = '';
  for(let i=0; i<25; i++) {
    let sparkle = document.createElement('div');
    sparkle.className = 'chime-sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.animationDelay = (Math.random() * 2) + 's';
    sparkle.style.animationDuration = (2 + Math.random() * 2) + 's';
    chimeParticlesContainer.appendChild(sparkle);
  }

  let timeLeft = 15; 
  chimeTimerDisplay.innerText = timeLeft;
  
  clearInterval(chimeCountdownInterval);
  chimeCountdownInterval = setInterval(() => {
    timeLeft--;
    if(timeLeft > 0) {
      chimeTimerDisplay.innerText = timeLeft;
    } else {
      chimeTimerDisplay.innerText = 0;
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(chimeCountdownInterval);
    chimeOverlay.classList.add('hidden');
    backgroundLayer.classList.remove('hourly-blur');
    deskLayer.classList.remove('hourly-blur');
    moteContainer.classList.remove('hourly-blur');
    
    if (isMusicPlaying) {
      gameplayAudio.play().catch(()=>{});
    }
    
    isChimeActive = false;
  }, 15000); 
}

// --- RECURRING TEA TIME LOGIC ---
let firstTeaTriggered = false;
let teaInterval;

const teaDialogue = {
  dialogue: "Your hands must be getting tired from catching all those echoes. I brewed this a while ago, though it hasn't lost its heat. You should sit with the quiet for a moment. The dust will still be here when you're ready.",
  choices: [
    { text: "Accept the tea and rest your hands.", path: "attachment", action: "startTea" },
    { text: "Examine the cup's cracked glaze, but accept it.", path: "threshold", action: "startTea" },
    { text: "Politely decline and keep your hands empty.", path: "void", followUp: "No? Ah... keeping your hands empty. I understand. Some people prefer not to leave fingerprints." }
  ]
};

function triggerTeaTime() {
  isCheckpointActive = true;
  displayCheckpoint(teaDialogue);
}

function startTeaTimerInterval() {
  clearInterval(teaInterval);
  teaInterval = setInterval(() => {
    if (!isCheckpointActive && !isChimeActive) triggerTeaTime();
  }, 15 * 60 * 1000); 
}
startTeaTimerInterval();

// --- STORY CHECKPOINTS ---
const checkpoints = [
  {
    trigger: 35,
    completed: false,
    dialogue: "Have you noticed the air in here? It smells exactly like a waiting room from when you were seven. The kind where the magazines are peeling back and the hum of the lights makes your teeth ache.",
    choices: [
      { text: "I remember the pattern on the chairs. I used to trace it so I wouldn't have to look up.", path: "attachment" },
      { text: "I've wondered if the clock moves, but i dont think it ever did.", path: "threshold" },
      { text: "I don't smell much, I stopped breathing through my nose a few miles back.", path: "void" }
    ]
  },
  {
    trigger: 55,
    completed: false,
    dialogue: "Something just moved in the corner of the ceiling. When you feel someone watching you from an empty room, what is your first instinct?",
    choices: [
      { text: "Look right back to see what rules of physics they're breaking.", path: "threshold", nextPart: true },
      { text: "Hope it's someone I miss coming back to check on me.", path: "attachment", nextPart: true },
      { text: "Ignore them completely. If I don't look, they can't anchor me here.", path: "void", nextPart: true }
    ],
    part2: {
      dialogue: "And... do you think they're lonely, or are we the ones interrupting them?",
      choices: [
        { text: "We're all just passing through the same walls, aren't we?", path: "threshold" },
        { text: "They're lonely. That's why they stay close to the doors.", path: "attachment" },
        { text: "There's no difference between us and them anymore.", path: "void" }
      ]
    }
  },
  {
    trigger: 75,
    completed: false,
    dialogue: "As we walk through these halls, we pick up things without realizing it—habits, names, regrets. Do your pockets feel heavier now than when you first started clicking?",
    choices: [
      { text: "Yes, but every fragment I carry teaches me something new about where I am.", path: "threshold" },
      { text: "Extremely heavy. I'm afraid if I drop anything, I'll forget who I was.", path: "attachment" },
      { text: "My pockets are empty. I left everything behind miles ago.", path: "void" }
    ]
  },
  {
    trigger: 90,
    completed: false,
    dialogue: "Look at you... you're practically glowing with all those collected fragments. You've changed since you first wandered down this hallway, you know. Your silhouette looks softer... or maybe you're just starting to blend into the wallpaper. The deck is shuffling itself on the desk. Whenever you're ready, tell me you want the reading, and we'll see what the cards have to say about the path you've carved.",
    choices: [
      { text: "I'm ready.", path: null, action: "unlockTarot" }
    ]
  }
];

const shopItems = [
  { id: 'hourglass', name: 'Hourglass Shard', cost: 15, income: 1, count: 0, elementId: 'room-hourglass', icon: 'assets/item-hourglass.png' },
  { id: 'polaroid', name: 'Fading Polaroid', cost: 75, income: 3, count: 0, elementId: 'room-polaroid', icon: 'assets/item-polaroid.png' },
  { id: 'moontear', name: 'The Moon Tear', cost: 240, income: 8, count: 0, elementId: 'room-moontear', icon: 'assets/item-moontear.png' },
  { id: 'tv', name: 'Static Television', cost: 900, income: 25, count: 0, elementId: 'room-tv', icon: 'assets/item-tv.png' },
  { id: 'letter', name: 'Unopened Letter', cost: 3200, income: 70, count: 0, elementId: 'room-letter', icon: 'assets/item-letter.png' },
  { id: 'clock', name: 'Melding Clock', cost: 9500, income: 180, count: 0, elementId: 'room-clock', icon: 'assets/item-clock.png' },
  { id: 'mirror', name: 'Corridor Mirror', cost: 28000, income: 450, count: 0, elementId: 'room-mirror', icon: 'assets/item-mirror.png' },
  { id: 'pillow', name: 'Ghost Cat Pillow', cost: 85000, income: 1200, count: 0, elementId: 'room-pillow', icon: 'assets/item-pillow.png' }
];

const moteThoughts = [
  "Nobody's home", "You left it open", "Inside your skin", "Not your face", 
  "Forgotten name", "Is this real?", "Fading out", "Whose voice?", "Keep walking"
];

const trappedThoughts = [
  "It remembers you", "Don't let go", "Heavy fragment", "Hold still..."
];

shopToggleBtn.addEventListener('click', () => {
  shopContainer.classList.toggle('open');
  shopToggleBtn.innerText = shopContainer.classList.contains('open') ? 'Close Machine' : 'Open Machine';
});

function updateTimeOfDay() {
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 18;
  backgroundLayer.style.backgroundImage = isDay ? "url('assets/day.png')" : "url('assets/night.png')";
}
updateTimeOfDay();
setInterval(updateTimeOfDay, 60000);

function increaseDrift() {
  if (isCheckpointActive || liminalDrift >= 100) return;
  liminalDrift += 0.05; 
  if (liminalDrift > 100) liminalDrift = 100;
  driftBarFill.style.width = `${liminalDrift}%`;
  checkTriggers();
}

crystalOrb.addEventListener('contextmenu', (e) => e.preventDefault());
crystalOrb.addEventListener('click', (e) => {
  if(isCheckpointActive || isChimeActive) return;
  addEchoes(1);
  increaseDrift();
  triggerOrbJump();
  createRipple(e.clientX, e.clientY);
});

function triggerOrbJump() {
  crystalOrb.classList.remove('jumping');
  void crystalOrb.offsetWidth;
  crystalOrb.classList.add('jumping');
}

function spawnMote() {
  if(isCheckpointActive || isChimeActive) return;

  const mote = document.createElement('img');
  mote.src = 'assets/mote.png';
  mote.className = 'floating-mote';
  mote.draggable = false; 
  mote.addEventListener('contextmenu', (e) => e.preventDefault());
  
  const isTrapped = Math.random() < 0.15;
  if (isTrapped) mote.classList.add('trapped-mote');

  const startX = Math.random() * (window.innerWidth - 90); 
  const startY = window.innerHeight * 0.7; 
  mote.style.left = `${startX}px`;
  mote.style.top = `${startY}px`;

  let holdTimer;

  mote.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if(isCheckpointActive || isChimeActive) return;

    if (isTrapped) {
      mote.classList.add('holding');
      holdTimer = setTimeout(() => {
        burstMote(e, mote, true); 
      }, 500); 
    } else {
      burstMote(e, mote, false); 
    }
  });

  const cancelHold = () => {
    clearTimeout(holdTimer);
    mote.classList.remove('holding');
  };
  
  mote.addEventListener('pointerup', cancelHold);
  mote.addEventListener('pointerleave', cancelHold);
  mote.addEventListener('pointercancel', cancelHold);

  moteContainer.appendChild(mote);
  void mote.offsetWidth;

  const endX = startX + ((Math.random() > 0.5 ? 1 : -1) * (Math.random() * 300 + 100)); 
  const endY = -100; 
  
  mote.style.left = `${endX}px`;
  mote.style.top = `${endY}px`;

  setTimeout(() => { if (mote.parentNode) mote.remove(); }, 12000);
}

function burstMote(e, mote, wasTrapped) {
  const baseGain = Math.max(2, Math.floor(echoesPerSecond * 0.5) + 2);
  const totalGain = wasTrapped ? baseGain * 4 : baseGain; 
  
  addEchoes(totalGain);
  increaseDrift();
  if (wasTrapped) increaseDrift(); 
  
  createRipple(e.clientX, e.clientY);
  
  const thoughtsArray = wasTrapped ? trappedThoughts : moteThoughts;
  const thought = thoughtsArray[Math.floor(Math.random() * thoughtsArray.length)];
  spawnFloatingText(e.clientX, e.clientY, thought);
  
  mote.remove();
}

setInterval(spawnMote, 4500);

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

function addEchoes(amount) {
  echoes += amount;
  updateUI();

  if (!firstTeaTriggered && echoes >= 500 && !isCheckpointActive) {
    firstTeaTriggered = true;
    triggerTeaTime();
    startTeaTimerInterval(); 
  }
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
  if (isCheckpointActive || isChimeActive) return;
  const item = shopItems[index];
  if (echoes >= item.cost) {
    echoes -= item.cost;
    item.count += 1;
    item.cost = Math.floor(item.cost * 1.23); 
    
    calculateEchoRate();
    updateUI();
    
    const shopItemElements = document.querySelectorAll('.shop-item');
    const costDisplay = shopItemElements[index].querySelector('.item-cost');
    const countDisplay = shopItemElements[index].querySelector('.item-count');
    
    if (costDisplay) costDisplay.innerText = `${item.cost} Echoes`;
    if (countDisplay) countDisplay.innerText = `Owned: ${item.count}`;

    if (item.elementId) {
      const roomElement = document.getElementById(item.elementId);
      if (roomElement) {
        roomElement.classList.remove('hidden');
      }
    }
  }
}

// --- ITEM LORE DATABASE ---
const loreData = {
  hourglass: [
    "At a certain point you stop tracking the sand, the years seem to go by here... I wonder how long I've been here..",
    "It doesn't measure time seemingly.. it measures something else.",
    "I like to play with it in my free time, it's nice to step away from here sometimes to just, be there."
  ],
  polaroid: [
    "I took this the day I arrived. My face looked different then.",
    "I swear the Ink has made me look more depressed.. or maybe I've always been this way.",
    "I looked so pretty here .. do I still?"
  ],
  letter: [
    "The wax smells like roses from, back then... It leaves my head dizzy.",
    "The seal is made of dried wax and something... colder.",
    "I keep it closed. Some news is better off unread."
  ],
  moontear: [
    "It fell from the moon during an eclipse. I put it in a jar to cherish it.",
    "It smells like rain and old metal.",
    "If you hold it to your ear, you can hear the ocean."
  ],
  clock: [
    "Time feels like it only existed beyond these walls, when was that again?",
    "I've started to wonder if it represents how long I've been here or the way I feel, maybe it's just me.",
    "It’s stuck on the hour you arrived. Every single day."
  ],
  pillow: [
    "It's cold, I wonder where Kalt is, she's a good cat.",
    "Always smells of lavender and fresh bread.. she does make great biscuits.",
    "It likes to curl up in the spaces where the light doesn't reach."
  ],
  tv: [
    "Shhhh, my favorite show is on.",
    "Sometimes, if you lean in close, you can hear yourself breathing on the other side.",
    "I swear I didn't turn it off, did you?"
  ],
  mirror: [
    "It's the only thing in the room that doesn't lie to me.",
    "Did you see that? Or is my mind elsewhere again..",
    "That hall is familiar, It haunts me in my dreams."
  ]
};

// --- HOLD-TO-INSPECT LOGIC MANAGER ---
function showLore(itemId, imageSrc) {
  const snippets = loreData[itemId];
  const randomSnippet = snippets[Math.floor(Math.random() * snippets.length)];
  
  loreImage.src = imageSrc;
  loreText.innerText = randomSnippet;
  loreOverlay.classList.remove('hidden');
}

loreCloseBtn.addEventListener('click', () => {
  loreOverlay.classList.add('hidden');
});

// CRITICAL FIX: Pure pointer logic exactly like the motes
function setupRoomItem(elementId, loreKey, tapCallback) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let holdTimer;
  let isHolding = false;

  el.oncontextmenu = function(e) { e.preventDefault(); return false; };

  el.addEventListener('pointerdown', (e) => {
    if (isCheckpointActive || isChimeActive) return;
    
    isHolding = false;
    
    holdTimer = setTimeout(() => {
      isHolding = true;
      showLore(loreKey, el.src); 
    }, 450); 
  });

  const cancelHold = () => {
    clearTimeout(holdTimer);
  };

  el.addEventListener('pointerup', (e) => {
    clearTimeout(holdTimer);
    
    if (!isHolding && tapCallback) {
      tapCallback(e); 
    }
  });

  el.addEventListener('pointerleave', cancelHold);
  el.addEventListener('pointercancel', cancelHold);
}

// --- INTERACTIVE ROOM ITEMS SETUP ---

const roomMirror = document.getElementById('room-mirror');
const mirrorReflections = [
  'assets/item-mirror.png',
  'assets/mirrorgirl.png',
  'assets/mirrorpool.png',
  'assets/mirrorhall.png',
  'assets/mirrorchurch.png'
];

setupRoomItem('room-mirror', 'mirror', () => {
  let chosenFile;
  const roll = Math.random();
  if (roll < 0.6) {
    chosenFile = mirrorReflections[0];
  } else {
    const spookyIndex = Math.floor(Math.random() * 4) + 1;
    chosenFile = mirrorReflections[spookyIndex];
  }

  roomMirror.src = chosenFile;
  setTimeout(() => { roomMirror.src = mirrorReflections[0]; }, 4000);
});

const roomTv = document.getElementById('room-tv');
let tvState = 0; 

setupRoomItem('room-tv', 'tv', () => {
  tvState++;
  
  if (Math.random() < 0.1) {
    tvState = 3; 
  }

  if (tvState === 1) {
    roomTv.src = 'assets/tvon.png';
    if (isMusicPlaying) {
      tvDefaultOnAudio.currentTime = 0;
      tvDefaultOnAudio.play().catch(()=>{});
      tvOnAudio.currentTime = 0;
      tvOnAudio.play().catch(()=>{});
    }
  } else if (tvState === 2) {
    roomTv.src = 'assets/tvch1.png';
    tvOnAudio.pause();
    if (isMusicPlaying) {
      tvCh1Audio.currentTime = 0;
      tvCh1Audio.play().catch(()=>{});
    }
  } else {
    tvState = 0;
    roomTv.src = 'assets/item-tv.png';
    tvOnAudio.pause();
    tvCh1Audio.pause();
    if (isMusicPlaying) {
      tvDefaultOffAudio.currentTime = 0;
      tvDefaultOffAudio.play().catch(()=>{});
    }
  }
});

setupRoomItem('room-letter', 'letter', () => {
  spawnFloatingText(document.getElementById('room-letter').getBoundingClientRect().left, document.getElementById('room-letter').getBoundingClientRect().top - 20, "Waiting...");
});

setupRoomItem('room-hourglass', 'hourglass', () => {
  spawnFloatingText(document.getElementById('room-hourglass').getBoundingClientRect().left, document.getElementById('room-hourglass').getBoundingClientRect().top - 20, "Time slows.");
});

// Items without quick tap actions, just lore holds
setupRoomItem('room-polaroid', 'polaroid', null);
setupRoomItem('room-moontear', 'moontear', null);
setupRoomItem('room-clock', 'clock', null);
setupRoomItem('room-pillow', 'pillow', null);

setInterval(() => {
  if (echoesPerSecond > 0 && !isCheckpointActive && !isChimeActive) {
    echoes += echoesPerSecond / 10;
    updateUI();

    if (!firstTeaTriggered && echoes >= 500) {
      firstTeaTriggered = true;
      triggerTeaTime();
      startTeaTimerInterval();
    }
  }
}, 100);

function updateUI() {
  echoCountDisplay.innerText = Math.floor(echoes);
  const shopElements = document.querySelectorAll('.shop-item');
  shopElements.forEach((el, index) => {
    if (echoes >= shopItems[index].cost) {
      el.classList.remove('disabled');
    } else {
      el.classList.add('disabled');
    }
  });
}

function checkTriggers() {
  const pending = checkpoints.find(cp => !cp.completed && liminalDrift >= cp.trigger);
  if (pending) {
    isCheckpointActive = true;
    displayCheckpoint(pending);
  }
}

function displayCheckpoint(cp) {
  dialogueText.innerText = cp.dialogue;
  dialogueChoices.innerHTML = '';

  cp.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = choice.text;
    btn.onclick = () => handleChoice(choice, cp);
    dialogueChoices.appendChild(btn);
  });

  dialogueOverlay.classList.remove('hidden');
}

function handleChoice(choice, cp) {
  if (choice.path) { paths[choice.path] += 1; }

  if (choice.nextPart && cp.part2) {
    displayCheckpoint(cp.part2);
    return;
  }

  if (choice.followUp) {
    dialogueText.innerText = choice.followUp;
    dialogueChoices.innerHTML = '';
    setTimeout(() => closeCheckpoint(cp), 3000);
    return;
  }

  if (choice.action === "startTea") {
    dialogueOverlay.classList.add('hidden');
    startTeaTimer(cp);
    return;
  }

  if (choice.action === "unlockTarot") {
    btnTarot.classList.remove('hidden');
  }

  closeCheckpoint(cp);
}

function closeCheckpoint(cp) {
  if (cp && cp.hasOwnProperty('completed')) {
    cp.completed = true;
  }
  dialogueOverlay.classList.add('hidden');
  setTimeout(() => { isCheckpointActive = false; }, 500); 
}

function startTeaTimer(cp) {
  teaTimerOverlay.classList.remove('hidden');
  teaBarFill.style.width = '0%';
  
  gameplayAudio.pause();
  tvOnAudio.pause();
  tvCh1Audio.pause();
  teatimerAudio.currentTime = 0;
  teatimerAudio.play().catch(() => {});
  
  void teaBarFill.offsetWidth; 
  
  teaBarFill.style.transition = 'width 15s linear';
  teaBarFill.style.width = '100%';

  setTimeout(() => {
    teaTimerOverlay.classList.add('hidden');
    
    teatimerAudio.pause();
    if (isMusicPlaying) {
      gameplayAudio.play().catch(() => {});
    }

    addEchoes(50);
    spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, "+50 Echoes (Rested)");

    closeCheckpoint(cp);
  }, 15000);
}

// --- TAROT LOGIC ---
const tarotLayer = document.getElementById('tarot-layer');
const card1Front = document.getElementById('card-1-front');
const card2Front = document.getElementById('card-2-front');
const card3Front = document.getElementById('card-3-front');

btnTarot.addEventListener('click', () => {
  gameplayAudio.pause();
  tvOnAudio.pause();
  tvCh1Audio.pause();
  teatimerAudio.pause();
  tarotAudio.currentTime = 0;
  tarotAudio.play().catch(() => {});

  document.getElementById('ui-layer').classList.add('hidden');
  document.getElementById('mote-container').classList.add('hidden');
  document.getElementById('desk-layer').classList.add('hidden');
  document.getElementById('room-items-layer').classList.add('hidden');
  shopToggleBtn.classList.add('hidden'); 
  tarotLayer.classList.remove('hidden');

  generateTarotReading();
});

function generateTarotReading() {
  let dominantPath = Object.keys(paths).reduce((a, b) => paths[a] > paths[b] ? a : b);

  let card1 = "The High Priestess\n\n(Drawn upside down near a flickering light. You know a secret, but it's about a room you haven't visited yet.)";
  let card2 = "The Tower\n\n(The wallpaper is peeling. Sudden chaos, or maybe just a realization that the ceiling was painted on.)";
  let card3 = "The Fool\n\n(Stepping off a ledge into a pile of static. A new beginning, completely untethered.)";

  if (dominantPath === "threshold") {
    card1 = "The Magician\n\n(You see the seams of this place. You manipulate the echoes well, but don't look too closely at the wiring.)";
    card2 = "The Hermit\n\n(Holding a lantern in an endless hall. You are aware, but awareness is a lonely road.)";
    card3 = "The Star\n\n(Clarity. You will find the exit, but you might decide you prefer the architecture here instead.)";
  } else if (dominantPath === "attachment") {
    card1 = "The Lovers\n\n(Two chairs facing each other, but only one has an indent. You are holding onto a ghost.)";
    card2 = "Six of Cups\n\n(A jar full of old moon tears. Nostalgia is sweet, but it makes your pockets too heavy to run.)";
    card3 = "Death\n\n(Not an ending, just a closed door. It's time to leave the key under the mat and walk away.)";
  } else if (dominantPath === "void") {
    card1 = "The Moon\n\n(Illusion. You think you are fading away, but you are just blending perfectly into the pastel wallpaper.)";
    card2 = "Four of Swords\n\n(Resting in a display case. Detachment brings peace, but it also brings cold hands.)";
    card3 = "The World\n\n(The hallway loops back on itself. Emptiness is complete. You belong to the corridor now.)";
  }

  card1Front.innerText = card1;
  card2Front.innerText = card2;
  card3Front.innerText = card3;
}

document.querySelectorAll('.tarot-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!card.classList.contains('flipped')) {
      cardFlipAudio.cloneNode().play().catch(()=>{});
      card.classList.add('flipped');
    }
  });
});

calculateEchoRate();
renderShop();
updateUI();
