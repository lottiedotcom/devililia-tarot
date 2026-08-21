let echoes = 99999; // DEBUG MODE
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

// --- SHOP ITEMS (TV now unlocks the bedroom!) ---
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

function increaseDrift() {
  if (isCheckpointActive || isTarotActive || liminalDrift >= 100) return;
  
  liminalDrift += 0.03; // SLOWED DOWN PACING
  
  if (liminalDrift >= 100) {
    liminalDrift = 100;
    driftBarFill.style.width = `100%`;
    triggerInfiniteTarot(); // INFINITE TAROT LOOP TRIGGER
    return;
  }
  
  driftBarFill.style.width = `${liminalDrift}%`;
  checkTriggers();
}

function checkTriggers() {
  const pending = checkpoints.find(cp => !cp.completed && liminalDrift >= cp.trigger);
  if (pending) {
    isCheckpointActive = true;
    pending.completed = true; // SQUASH THE LOOP BUG!
    displayCheckpoint(pending);
  }
}

// --- ROOM SWITCHING LOGIC ---
function switchRoom(targetRoom) {
  currentRoom = targetRoom;
  
  // Hide all items globally first
  document.querySelectorAll('.room-item').forEach(el => el.classList.add('hidden'));

  if (targetRoom === 'main') {
    updateTimeOfDay(); // Restores day/night window
    deskLayer.classList.remove('hidden');
    crystalOrb.classList.remove('hidden');
    
    // Reveal Main Room Items (if owned)
    ['hourglass', 'polaroid', 'moontear', 'clock', 'mirror'].forEach(id => {
      let itemData = shopItems.find(i => i.id === id);
      if (itemData && itemData.count > 0) document.getElementById(itemData.elementId).classList.remove('hidden');
    });

  } else if (targetRoom === 'bedroom') {
    backgroundLayer.style.backgroundImage = "url('assets/bedroom.png')"; // YOUR NEW ARTWORK
    deskLayer.classList.add('hidden');
    crystalOrb.classList.add('hidden');

    // Reveal Bedroom Items (if owned)
    ['tv', 'pillow', 'letter', 'mirror'].forEach(id => {
      let itemData = shopItems.find(i => i.id === id);
      if (itemData && itemData.count > 0) document.getElementById(itemData.elementId).classList.remove('hidden');
    });

    // Fire opening dialogue once
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

// --- MIRROR PORTAL NETWORK ---
const roomMirror = document.getElementById('room-mirror');
const mirrorReflections = [
  'assets/item-mirror.png', // Main
  'assets/mirrorgirl.png',  // Bedroom
  'assets/mirrorpool.png',  // Pool (Locked)
  'assets/mirrorhall.png',  // Hall (Locked)
  'assets/mirrorchurch.png' // Church (Locked)
];
let currentMirrorIndex = 0;

setupRoomItem('room-mirror', 'mirror', () => {
  currentMirrorIndex = (currentMirrorIndex + 1) % mirrorReflections.length;
  roomMirror.src = mirrorReflections[currentMirrorIndex];
});

// Custom Mirror Hold Override for Portals
let mirrorHoldTimer;
let isMirrorHolding = false;

roomMirror.addEventListener('pointerdown', (e) => {
  if (isCheckpointActive || isChimeActive) return;
  isMirrorHolding = false;
  
  mirrorHoldTimer = setTimeout(() => {
    isMirrorHolding = true;
    let currentSrc = roomMirror.src;
    
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
  }, 450); 
});

roomMirror.addEventListener('pointerup', () => clearTimeout(mirrorHoldTimer));
roomMirror.addEventListener('pointerleave', () => clearTimeout(mirrorHoldTimer));

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


// --- THE UNSENT REPLY (LETTER MECHANIC) ---
const letterEl = document.getElementById('room-letter');
let letterHoldTimer;

letterEl.addEventListener('pointerdown', (e) => {
  if (isCheckpointActive || currentRoom !== 'bedroom') return;
  letterHoldTimer = setTimeout(() => {
    startLetterSequence();
  }, 450);
});
letterEl.addEventListener('pointerup', () => clearTimeout(letterHoldTimer));
letterEl.addEventListener('pointerleave', () => clearTimeout(letterHoldTimer));

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


// --- TRUE TAROT ENGINE ---
function triggerInfiniteTarot() {
  isTarotActive = true;
  gameplayAudio.pause();
  tarotAudio.currentTime = 0;
  tarotAudio.play().catch(() => {});

  document.getElementById('ui-layer').classList.add('hidden');
  document.getElementById('mote-container').classList.add('hidden');
  document.getElementById('desk-layer').classList.add('hidden');
  document.getElementById('room-items-layer').classList.add('hidden');
  document.getElementById('tarot-layer').classList.remove('hidden');

  // Pull 3 unique random cards from tarot-deck.js
  let shuffled = tarotDeck.sort(() => 0.5 - Math.random());
  let draw = shuffled.slice(0, 3);
  let dominantPath = Object.keys(paths).reduce((a, b) => paths[a] > paths[b] ? a : b);

  let pastIntro = dominantPath === "threshold" ? "You see the seams..." : dominantPath === "attachment" ? "Your pockets are heavy..." : "You are fading...";
  let presIntro = dominantPath === "threshold" ? "Manipulating the wiring..." : dominantPath === "attachment" ? "Holding onto ghosts..." : "Blending into the wallpaper...";
  let futIntro = dominantPath === "threshold" ? "A calculated exit..." : dominantPath === "attachment" ? "Leaving the key behind..." : "Total integration...";

  document.getElementById('card-1-front').innerText = `${draw[0].name}\n\n[PAST]\n${draw[0].past}\n\n(${pastIntro})`;
  document.getElementById('card-2-front').innerText = `${draw[1].name}\n\n[PRESENT]\n${draw[1].present}\n\n(${presIntro})`;
  document.getElementById('card-3-front').innerText = `${draw[2].name}\n\n[FUTURE]\n${draw[2].future}\n\n(${futIntro})`;

  // Reset cards
  document.querySelectorAll('.tarot-card').forEach(card => card.classList.remove('flipped'));

  // Reset Drift for the infinite loop
  liminalDrift = 0;
  driftBarFill.style.width = '0%';
}

document.querySelectorAll('.tarot-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!card.classList.contains('flipped')) {
      cardFlipAudio.cloneNode().play().catch(()=>{});
      card.classList.add('flipped');
    } else {
      // If all 3 are flipped, let them click to exit
      let allFlipped = document.querySelectorAll('.tarot-card.flipped').length;
      if (allFlipped === 3) {
         document.getElementById('ui-layer').classList.remove('hidden');
         document.getElementById('tarot-layer').classList.add('hidden');
         isTarotActive = false;
         tarotAudio.pause();
         gameplayAudio.play().catch(()=>{});
         switchRoom(currentRoom); // Restores items based on room
      }
    }
  });
});


// --- STANDARD UI / ENGINE STUFF ---
crystalOrb.addEventListener('click', (e) => {
  if(isCheckpointActive || isChimeActive || isTarotActive) return;
  addEchoes(1);
  increaseDrift();
  triggerOrbJump();
  createRipple(e.clientX, e.clientY);
});

// Generic Setup Item Logic
function setupRoomItem(elementId, loreKey, tapCallback) {
  const el = document.getElementById(elementId);
  if (!el || elementId === 'room-mirror' || elementId === 'room-letter') return; // Skip overrides

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
  const cancelHold = () => clearTimeout(holdTimer);
  el.addEventListener('pointerup', (e) => {
    clearTimeout(holdTimer);
    if (!isHolding && tapCallback) tapCallback(e); 
  });
  el.addEventListener('pointerleave', cancelHold);
  el.addEventListener('pointercancel', cancelHold);
}

// Dialog Handler
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
  if (choice.path) paths[choice.path] += 1;

  if (choice.action === "letter1") { liminalDrift = Math.max(0, liminalDrift - 5); driftBarFill.style.width = `${liminalDrift}%`; }
  if (choice.action === "letter2") { liminalDrift = Math.min(99, liminalDrift + 5); driftBarFill.style.width = `${liminalDrift}%`; }

  if (choice.nextPart && cp.part2) { displayCheckpoint(cp.part2); return; }

  if (choice.followUp) {
    dialogueText.innerText = choice.followUp;
    dialogueChoices.innerHTML = '';
    setTimeout(() => {
      closeCheckpoint(cp);
      if(choice.action && choice.action.includes('letter')) handleLetterCore();
    }, 3500);
    return;
  }
  closeCheckpoint(cp);
}

function closeCheckpoint(cp) {
  dialogueOverlay.classList.add('hidden');
  setTimeout(() => { isCheckpointActive = false; }, 500); 
}

function buyShopItem(index) {
  if (isCheckpointActive || isChimeActive) return;
  const item = shopItems[index];
  if (echoes >= item.cost) {
    echoes -= item.cost;
    item.count += 1;
    item.cost = Math.floor(item.cost * 1.23); 
    
    // BEDROOM UNLOCK LOGIC
    if (item.id === 'tv' && !unlockedRooms.includes('bedroom')) {
      unlockedRooms.push('bedroom');
    }
    
    calculateEchoRate();
    updateUI();
    switchRoom(currentRoom); // Refreshes item visibility
  }
}

// Helper methods simplified for length
function updateTimeOfDay() { if(currentRoom === 'main') backgroundLayer.style.backgroundImage = new Date().getHours() >= 6 && new Date().getHours() < 18 ? "url('assets/day.png')" : "url('assets/night.png')"; }
setInterval(updateTimeOfDay, 60000);

shopToggleBtn.addEventListener('click', () => { shopContainer.classList.toggle('open'); shopToggleBtn.innerText = shopContainer.classList.contains('open') ? 'Close Machine' : 'Open Machine'; });

function addEchoes(amount) { echoes += amount; updateUI(); }
function calculateEchoRate() { echoesPerSecond = shopItems.reduce((total, item) => total + (item.count * item.income), 0); echoRateDisplay.innerText = `${echoesPerSecond} / sec`; }
function updateUI() { echoCountDisplay.innerText = Math.floor(echoes); document.querySelectorAll('.shop-item').forEach((el, index) => { echoes >= shopItems[index].cost ? el.classList.remove('disabled') : el.classList.add('disabled'); }); }

// DEBUG INITIALIZATION
shopItems.forEach(item => { item.count = 1; });
unlockedRooms.push('bedroom');
calculateEchoRate();
updateUI();
switchRoom('main'); 

