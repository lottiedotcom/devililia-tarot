// DEBUG MODE IS BACK ON
let echoes = 999999; 
let echoesPerSecond = 0;
let liminalDrift = 0; 
let isCheckpointActive = false;
let isChimeActive = false; 
let isTarotActive = false;

let paths = { threshold: 0, attachment: 0, void: 0 };

// ROOM STATE MANAGEMENT
let currentRoom = 'main'; 
let unlockedRooms = ['main']; 

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
  }
];

const shopItems = [
  { id: 'hourglass', name: 'Hourglass Shard', cost: 15, income: 1, count: 0, elementId: 'room-hourglass', icon: 'assets/item-hourglass.png' },
  { id: 'polaroid', name: 'Fading Polaroid', cost: 75, income: 3, count: 0, elementId: 'room-polaroid', icon: 'assets/item-polaroid.png' },
  { id: 'moontear', name: 'The Moon Tear', cost: 240, income: 8, count: 0, elementId: 'room-moontear', icon: 'assets/item-moontear.png' },
  { id: 'clock', name: 'Melding Clock', cost: 950, income: 20, count: 0, elementId: 'room-clock', icon: 'assets/item-clock.png' },
  { id: 'tv', name: 'Static TV (Unlocks Bedroom)', cost: 3000, income: 50, count: 0, elementId: 'room-tv', icon: 'assets/item-tv.png' },
  { id: 'letter', name: 'Unopened Letter', cost: 9500, income: 180, count: 0, elementId: 'room-letter', icon: 'assets/item-letter.png' },
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
  if (currentRoom === 'main') {
    const currentHour = new Date().getHours();
    const isDay = currentHour >= 6 && currentHour < 18;
    backgroundLayer.style.backgroundImage = isDay ? "url('assets/day.png')" : "url('assets/night.png')";
  }
}
updateTimeOfDay();
setInterval(updateTimeOfDay, 60000);

function increaseDrift() {
  if (isCheckpointActive || isTarotActive || liminalDrift >= 100) return;
  
  liminalDrift += 0.03; 
  
  if (liminalDrift >= 100) {
    liminalDrift = 100;
    driftBarFill.style.width = `100%`;
    triggerInfiniteTarot(); 
    return;
  }
  
  driftBarFill.style.width = `${liminalDrift}%`;
  checkTriggers();
}

function checkTriggers() {
  const pending = checkpoints.find(cp => !cp.completed && liminalDrift >= cp.trigger);
  if (pending) {
    isCheckpointActive = true;
    pending.completed = true; 
    displayCheckpoint(pending);
  }
}

// --- ROOM SWITCHING LOGIC ---
function switchRoom(targetRoom) {
  currentRoom = targetRoom;
  
  document.querySelectorAll('.room-item').forEach(el => el.classList.add('hidden'));

  if (targetRoom === 'main') {
    updateTimeOfDay(); 
    deskLayer.classList.remove('hidden');
    crystalOrb.classList.remove('hidden');
    
    ['hourglass', 'polaroid', 'moontear', 'clock', 'mirror'].forEach(id => {
      let itemData = shopItems.find(i => i.id === id);
      if (itemData && itemData.count > 0) document.getElementById(itemData.elementId).classList.remove('hidden');
    });

  } else if (targetRoom === 'bedroom') {
    backgroundLayer.style.backgroundImage = "url('assets/bedroom.png')"; 
    deskLayer.classList.add('hidden');
    crystalOrb.classList.add('hidden');

    ['tv', 'pillow', 'letter', 'mirror'].forEach(id => {
      let itemData = shopItems.find(i => i.id === id);
      if (itemData && itemData.count > 0) document.getElementById(itemData.elementId).classList.remove('hidden');
    });

    if (!unlockedRooms.includes('bedroom_visited')) {
      unlockedRooms.push('bedroom_visited');
      isCheckpointActive = true;
      displayCheckpoint({
        dialogue: "This is where I go when the front desk gets too loud. It doesn't have much—just a bed that remembers being cold and a screen that hums to itself. Since you're staying a while, you might as well make it feel like yours.\n\nWhen you close your eyes in an unfamiliar room, do you picture home, or do you picture the hallway outside?",
        choices: [
          { text: "Home.", path: "attachment" },
          { text: "The hallway. There’s no going backward.", path: "threshold" }
        ]
      });
    }
  }
}

crystalOrb.oncontextmenu = function(e) { e.preventDefault(); return false; };

crystalOrb.addEventListener('pointerdown', (e) => {
  if(isCheckpointActive || isChimeActive || isTarotActive) return;
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
  if(isCheckpointActive || isChimeActive || isTarotActive) return;

  const mote = document.createElement('img');
  mote.src = 'assets/mote.png';
  mote.className = 'floating-mote';
  mote.draggable = false; 
  mote.oncontextmenu = function(e) { e.preventDefault(); return false; };
  
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
    
    if (item.id === 'tv' && !unlockedRooms.includes('bedroom')) {
      unlockedRooms.push('bedroom');
    }
    
    calculateEchoRate();
    updateUI();
    switchRoom(currentRoom); 
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

function setupRoomItem(elementId, loreKey, tapCallback, holdCallback) {
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
      if (holdCallback) {
        holdCallback(el.src);
      } else {
        showLore(loreKey, el.src); 
      }
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
let currentMirrorIndex = 0;

setupRoomItem('room-mirror', 'mirror', 
  () => {
    currentMirrorIndex = (currentMirrorIndex + 1) % mirrorReflections.length;
    roomMirror.src = mirrorReflections[currentMirrorIndex];
  },
  (currentSrc) => {
    if (currentSrc.includes('mirrorgirl.png')) {
      if (unlockedRooms.includes('bedroom')) {
        triggerPortalPrompt("bedroom", "The glass ripples softly... Step through to the Bedroom?");
      } else {
        showLore('mirror', currentSrc);
      }
    } else if (currentSrc.includes('item-mirror.png') && currentRoom !== 'main') {
       triggerPortalPrompt("main", "The glass ripples softly... Step through to the Waiting Room?");
    } else if (currentSrc.includes('mirrorchurch.png') || currentSrc.includes('mirrorhall.png') || currentSrc.includes('mirrorpool.png')) {
       triggerPortalPrompt("locked", "(Coming Soon... the dust hasn't settled there yet.)");
    } else {
      showLore('mirror', currentSrc);
    }
  }
);

function triggerPortalPrompt(target, text) {
  isCheckpointActive = true;
  dialogueText.innerText = text;
  dialogueChoices.innerHTML = '';

  if (target === "locked") {
    let btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = "Step away.";
    btn.onclick = () => closeCheckpoint();
    dialogueChoices.appendChild(btn);
  } else {
    let yesBtn = document.createElement('button');
    yesBtn.className = 'choice-btn';
    yesBtn.innerText = "Yes, cross over.";
    yesBtn.onclick = () => { closeCheckpoint(); switchRoom(target); };
    
    let noBtn = document.createElement('button');
    noBtn.className = 'choice-btn';
    noBtn.innerText = "No, stay here.";
    noBtn.onclick = () => closeCheckpoint();

    dialogueChoices.appendChild(yesBtn);
    dialogueChoices.appendChild(noBtn);
  }
  dialogueOverlay.classList.remove('hidden');
}


const roomTv = document.getElementById('room-tv');
let tvState = 0; 

setupRoomItem('room-tv', 'tv', () => {
  tvState++;
  if (Math.random() < 0.1) tvState = 3; 

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


setupRoomItem('room-letter', 'letter', 
  () => {
    spawnFloatingText(document.getElementById('room-letter').getBoundingClientRect().left, document.getElementById('room-letter').getBoundingClientRect().top - 20, "Waiting...");
  },
  () => {
    if (currentRoom === 'bedroom') {
       startLetterSequence();
    } else {
       showLore('letter', document.getElementById('room-letter').src);
    }
  }
);

function startLetterSequence() {
  isCheckpointActive = true;
  displayCheckpoint({
    dialogue: "[ The Unsent Reply ]\nDevililia sits with a blank page. How should she begin?",
    choices: [
      { text: "\"To whom it may concern...\"", path: "void", followUp: "Too formal. Like we're signing a lease for a room we'll never leave. (-5% Drift)", action: "letter1" },
      { text: "\"Dearest stranger...\"", path: "attachment", followUp: "A bit dramatic, but honesty looks good on paper. (+5% Drift)", action: "letter2" },
      { text: "[ Leave it blank ]", path: "threshold", followUp: "Silence says plenty. Sometimes more than the ink does.", action: "letter3" }
    ]
  });
}

function handleLetterCore() {
  setTimeout(() => {
    isCheckpointActive = true;
    displayCheckpoint({
      dialogue: "What is the core of the message?",
      choices: [
        { text: "\"The walls are still made of paper.\"", followUp: "She writes about the architecture, as if the sender doesn't already know how thin the boundaries are here." },
        { text: "\"I forgot what your voice sounded like.\"", followUp: "The hardest part isn't being alone; it's realizing you've memorized the silence instead of a name." },
        { text: "\"I'm not coming back.\"", followUp: "A bold lie. The desk is still right where you left it." }
      ]
    });
  }, 3000);
}

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

  if (choice.action === "letter1") { liminalDrift = Math.max(0, liminalDrift - 5); driftBarFill.style.width = `${liminalDrift}%`; }
  if (choice.action === "letter2") { liminalDrift = Math.min(99, liminalDrift + 5); driftBarFill.style.width = `${liminalDrift}%`; }

  if (choice.nextPart && cp.part2) {
    displayCheckpoint(cp.part2);
    return;
  }

  if (choice.followUp) {
    dialogueText.innerText = choice.followUp;
    dialogueChoices.innerHTML = '';
    setTimeout(() => {
      closeCheckpoint(cp);
      if(choice.action && choice.action.includes('letter')) handleLetterCore();
    }, 3500);
    return;
  }

  if (choice.action === "startTea") {
    dialogueOverlay.classList.add('hidden');
    startTeaTimer(cp);
    return;
  }

  closeCheckpoint(cp);
}

function closeCheckpoint(cp) {
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

// --- TRUE TAROT ENGINE ---
const tarotLayer = document.getElementById('tarot-layer');
const card1Front = document.getElementById('card-1-front');
const card2Front = document.getElementById('card-2-front');
const card3Front = document.getElementById('card-3-front');

function triggerInfiniteTarot() {
  isTarotActive = true;
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

  let shuffled = tarotDeck.sort(() => 0.5 - Math.random());
  let draw = shuffled.slice(0, 3);
  let dominantPath = Object.keys(paths).reduce((a, b) => paths[a] > paths[b] ? a : b);

  let pastIntro = dominantPath === "threshold" ? "You see the seams..." : dominantPath === "attachment" ? "Your pockets are heavy..." : "You are fading...";
  let presIntro = dominantPath === "threshold" ? "Manipulating the wiring..." : dominantPath === "attachment" ? "Holding onto ghosts..." : "Blending into the wallpaper...";
  let futIntro = dominantPath === "threshold" ? "A calculated exit..." : dominantPath === "attachment" ? "Leaving the key behind..." : "Total integration...";

  card1Front.innerText = `${draw[0].name}\n\n[PAST]\n${draw[0].past}\n\n(${pastIntro})`;
  card2Front.innerText = `${draw[1].name}\n\n[PRESENT]\n${draw[1].present}\n\n(${presIntro})`;
  card3Front.innerText = `${draw[2].name}\n\n[FUTURE]\n${draw[2].future}\n\n(${futIntro})`;

  document.querySelectorAll('.tarot-card').forEach(card => card.classList.remove('flipped'));

  liminalDrift = 0;
  driftBarFill.style.width = '0%';
}

document.querySelectorAll('.tarot-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!card.classList.contains('flipped')) {
      cardFlipAudio.cloneNode().play().catch(()=>{});
      card.classList.add('flipped');
    } else {
      let allFlipped = document.querySelectorAll('.tarot-card.flipped').length;
      if (allFlipped === 3) {
         document.getElementById('ui-layer').classList.remove('hidden');
         document.getElementById('tarot-layer').classList.add('hidden');
         shopToggleBtn.classList.remove('hidden');
         isTarotActive = false;
         tarotAudio.pause();
         if (isMusicPlaying) gameplayAudio.play().catch(()=>{});
         switchRoom(currentRoom); 
      }
    }
  });
});

// --- DEBUG INITIALIZATION BLOCK ---
// This runs on load so you can actually test your layouts!
shopItems.forEach(item => { item.count = 1; });
unlockedRooms.push('bedroom');
calculateEchoRate();
updateUI();
switchRoom('main'); 

