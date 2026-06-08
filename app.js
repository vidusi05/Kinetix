/* ==========================================================================
   KINETIX INTERACTIVE APPLICATION JS
   Multi-Role UI Logic, State Management, and Cross-Role Interactive Sync
   ========================================================================== */

// --- GLOBAL APP STATE ---
const KINETIX_STATE = {
  currentRole: 'client', // 'client' | 'pt' | 'gymowner'
  currentClientScreen: 'discover', // 'discover' | 'booking' | 'workout' | 'forum'
  currentPTScreen: 'chat', // 'chat' | 'builder'
  currentOwnerScreen: 'register', // 'register' | 'trainers'
  
  // Package Booking Data
  activeTierType: 'pt-only',
  bookingPackages: {
    'pt-only': [
      { name: 'Rookie PT', price: 150, desc: 'Introductory 1-on-1 coaching', features: ['4 PT Sessions / Month', 'Basic Macro Guidance', 'App Custom Workout Plan'], popular: false },
      { name: 'Alpha Iron', price: 280, desc: 'High-intensity coaching & support', features: ['8 PT Sessions / Month', 'Detailed Meal Plan Sync', 'Direct PT 24/7 Chat Access', 'Form Assessment Reviews'], popular: true },
      { name: 'Elite Savage', price: 450, desc: 'Premium competitive conditioning', features: ['12 PT Sessions / Month', 'Bespoke Competition Prep', 'Bi-weekly Strength Metrics Review', 'Priority Scheduler'], popular: false }
    ],
    'pt-gym': [
      { name: 'Iron Hybrid', price: 210, desc: 'Gym access with professional training', features: ['All Gym Facilities Access', '4 PT Sessions / Month', 'Custom Program Builder'], popular: false },
      { name: 'Titan Force', price: 340, desc: 'The ultimate hybrid transformation program', features: ['All Gym Facilities Access', '8 PT Sessions / Month', 'Custom Meal Plans', 'Premium Recovery Room Access'], popular: true },
      { name: 'Apex Elite', price: 520, desc: 'Fully managed fitness and recovery lifestyle', features: ['24/7 VIP Gym Access', '12 PT Sessions / Month', 'Dedicated PT Coach', 'Unlimited Sauna & Cold Plunge'], popular: false }
    ],
    'gym-only': [
      { name: 'Standard Club', price: 49, desc: 'General facility entry during hours', features: ['Gym Floor & Free Weights Access', 'Locker Room & Shower Access', 'Standard Gym Hours (6AM - 10PM)'], popular: false },
      { name: 'Iron Club VIP', price: 79, desc: 'Unrestricted 24/7 access with premium perks', features: ['24/7 Full Keycard Access', 'Sauna & Steam Access', '1 Free Trainer Consult / Month', '1 Guest Pass Per Visit'], popular: true },
      { name: 'The Compound Pass', price: 119, desc: 'All recovery amenities and facilities included', features: ['24/7 Keycard Access', 'Sauna & Cold Plunge Access', 'Group Boxing & HIIT Classes', 'Free Towel Service'], popular: false }
    ]
  },

  // Active workout structure
  isWorkoutActive: false,
  workoutTimerInterval: null,
  workoutSeconds: 0,
  workoutRoutines: {
    'push-alpha': [
      { id: 1, name: 'Barbell Bench Press', sets: 3, reps: 'x10', done: false },
      { id: 2, name: 'Incline Dumbbell Chest Press', sets: 3, reps: 'x8-12', done: false },
      { id: 3, name: 'Overhead Barbell Press', sets: 3, reps: 'x10', done: false },
      { id: 4, name: 'Weighted Chest Dips', sets: 3, reps: 'x Max reps', done: false },
      { id: 5, name: 'Skull Crushers (EZ Bar)', sets: 3, reps: 'x12', done: false }
    ],
    'pull-strength': [
      { id: 1, name: 'Deadlift (Heavy)', sets: 4, reps: 'x5', done: false },
      { id: 2, name: 'Weighted Pullups', sets: 3, reps: 'x8', done: false },
      { id: 3, name: 'Bent Over Barbell Rows', sets: 3, reps: 'x10', done: false },
      { id: 4, name: 'Seated Cable Rows (Wide Grip)', sets: 3, reps: 'x12', done: false },
      { id: 5, name: 'Dumbbell Hammer Curls', sets: 3, reps: 'x10-12', done: false }
    ],
    'leg-demolition': [
      { id: 1, name: 'Barbell Back Squats', sets: 4, reps: 'x8', done: false },
      { id: 2, name: 'Romanian Deadlifts', sets: 3, reps: 'x10', done: false },
      { id: 3, name: 'Leg Press (Drop Sets)', sets: 3, reps: 'x12-15', done: false },
      { id: 4, name: 'Standing Calf Raises', sets: 4, reps: 'x15', done: false }
    ]
  },
  workoutStats: {
    completedCount: 4,
    todayPerformanceHeight: 0 // Will fill when user finishes
  },

  // Chat Data (PT to Client)
  activeChatClientId: 'client-marcus',
  chats: {
    'client-marcus': [
      { sender: 'client', text: 'Hey Marcus, how is the chest soreness today?', time: '10:15 AM' },
      { sender: 'user', text: 'Actually not bad, coach. That stretching routine helped a lot.', time: '10:20 AM' },
      { sender: 'client', text: 'Coach, I finished the squats. My knees felt perfect today!', time: '12:30 PM' }
    ],
    'client-elena': [
      { sender: 'user', text: 'Elena, great job on finishing the sprint workout yesterday.', time: 'Yesterday' },
      { sender: 'client', text: 'Can you check my macro breakdown? I\'ve updated my food journal.', time: 'Yesterday' }
    ],
    'client-drake': [
      { sender: 'client', text: 'I am planning to hit the gym late tonight around 9 PM.', time: 'Jun 5' },
      { sender: 'user', text: 'Understood. I will push through the chest press session tonight.', time: 'Jun 5' }
    ]
  },

  // Trainer roster (Syncs owner dashboard edits to Client Discover View)
  trainers: [
    { id: 'marcus', name: 'Coach Marcus Vance', exp: '8 Yrs Exp', specialty: 'Strength & Powerlifting', tags: ['CSCS Certified', 'Nutritionist'], price: 75, status: 'Active', bio: 'CSCS strength coach specializing in competitive powerlifting.' },
    { id: 'elena', name: 'Sergeant Elena Rostova', exp: '12 Yrs Exp', specialty: 'Military Fitness & HIIT', tags: ['Ex-Spetsnaz', 'Conditioning'], price: 90, status: 'Active', bio: 'Former tactical conditioning specialist focusing on endurance.' },
    { id: 'drake', name: 'Drake Harrison', exp: '5 Yrs Exp', specialty: 'Bodybuilding & Aesthetics', tags: ['IFBB Pro', 'Physique'], price: 65, status: 'Pending Approval', bio: 'Aesthetics hypertrophy programmer for competition athletes.' }
  ],

  // Community Forum threads
  forumThreads: [
    {
      id: 1,
      title: 'Bulking Season: Clean vs Dirty Bulking',
      category: 'nutrition',
      author: 'Coach Marcus Vance',
      authorType: 'PT',
      avatarClass: 'trainer-1',
      preview: 'Is a dirty bulk ever justified? In this thread I discuss the science behind calorie surpluses, insulin response, and fat accumulation rates...',
      content: 'Calorie surpluses are essential for muscle hypertrophy, but going over +500 kcal above maintenance often leads to excess fat gain. Clean bulking focus on whole foods and high protein, while dirty bulking relies on calorie density. I recommend sticking to a moderate +300kcal clean surplus to stay lean while packing on power.',
      likes: 24,
      replies: 3,
      comments: [
        { author: 'Drake Harrison', authorType: 'PT', text: 'Completely agree. Fat cells are much harder to lose once created.', time: '2 hours ago' },
        { author: 'Alex K.', authorType: 'Client', text: 'Does this apply to hardgainers? I struggle to eat 3500 calories of clean food.', time: '1 hour ago' },
        { author: 'Coach Marcus Vance', authorType: 'PT', text: 'For hardgainers, liquid calories like oats and peanut butter shakes can close the gap without dirty eating.', time: '45 mins ago' }
      ]
    },
    {
      id: 2,
      title: 'Pre-Workout Stack Guide: What Actually Works',
      category: 'general',
      author: 'Sergeant Elena Rostova',
      authorType: 'PT',
      avatarClass: 'trainer-2',
      preview: 'Ditch the marketing gimmicks. Let\'s look at clinical evidence for Caffeine, L-Citrulline, Beta-Alanine, and Creatine...',
      content: 'Most commercial pre-workouts are underdosed. Look for: L-Citrulline (6-8g for pump), Beta-Alanine (3.2g for buffering lactic acid), Caffeine (200-350mg for CNS drive), and Creatine Monohydrate (5g daily, not timing dependent). Avoid proprietary blends!',
      likes: 42,
      replies: 1,
      comments: [
        { author: 'WorkoutSavage', authorType: 'Client', text: 'Tested this exact formulation this morning and the vascularity was insane!', time: 'Yesterday' }
      ]
    },
    {
      id: 3,
      title: 'Active Recovery Protocol for Powerlifters',
      category: 'pt-exclusive',
      author: 'Coach Marcus Vance',
      authorType: 'PT',
      avatarClass: 'trainer-1',
      preview: 'Exclusive: How to manage CNS fatigue during heavy deadlift blocks. Stretching is not enough...',
      content: 'Deadlifts tax the central nervous system heavily. My recovery protocol includes 15 mins of light sled pulls (no eccentric phase) on off days, contrast showers, and maintaining sodium levels. This keeps blood flowing and restores neural drive.',
      likes: 18,
      replies: 0,
      comments: []
    }
  ]
};

// --- INITIALIZE ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  // Sync status time
  updateTime();
  setInterval(updateTime, 10000);
  
  // Navigation & Role switcher listeners
  initRoleSwitcher();
  initClientNavigation();
  initPTNavigation();
  initOwnerNavigation();
  
  // Feature handlers setup
  renderBookingPackages();
  renderForumFeed();
  renderPTClientList();
  renderPTActiveChat();
  renderPTRoutineBuilder();
  renderOwnerTrainers();
  setupRegistrationForm();
  
  // Connect active workout trigger buttons
  document.getElementById('btn-start-workout-mode').addEventListener('click', startActiveWorkoutSession);
  document.getElementById('btn-cancel-workout').addEventListener('click', cancelActiveWorkoutSession);
  document.getElementById('btn-complete-workout').addEventListener('click', completeActiveWorkoutSession);
});

// --- CORE UTILITIES ---
function updateTime() {
  const timeElement = document.getElementById('status-time');
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes;
  timeElement.textContent = `${hours}:${minutes}`;
}

function showNotification(title, body) {
  const toast = document.getElementById('toast-notification');
  toast.querySelector('.toast-title').textContent = title;
  toast.querySelector('.toast-body').textContent = body;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Dynamic Island Notification Simulator
function triggerIslandPulse(message) {
  const island = document.getElementById('island-content');
  const parent = document.getElementById('island-content').parentElement;
  
  island.innerHTML = `<span class="island-text text-red"><i class="fa-solid fa-bell"></i> ${message}</span>`;
  parent.style.width = '220px';
  parent.style.boxShadow = '0 0 15px var(--glow-red)';
  
  setTimeout(() => {
    island.innerHTML = `<span class="island-text"><i class="fa-solid fa-bolt text-red"></i> Kinetix Core</span>`;
    parent.style.width = '110px';
    parent.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
  }, 3000);
}


// ==========================================================================
// ROLE SWITCHER LOGIC
// ==========================================================================
function initRoleSwitcher() {
  const buttons = document.querySelectorAll('.role-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedButton = e.currentTarget;
      const role = selectedButton.getAttribute('data-role');
      
      // Update UI active states
      buttons.forEach(b => b.classList.remove('active'));
      selectedButton.classList.add('active');
      
      // Set State
      KINETIX_STATE.currentRole = role;
      
      // Update Header badge
      const badge = document.getElementById('current-role-badge');
      if (role === 'client') badge.textContent = 'Client View';
      if (role === 'pt') badge.textContent = 'Trainer Portal';
      if (role === 'gymowner') badge.textContent = 'Gym Owner View';
      
      // Render Bottom Nav & Switch viewport screens
      renderBottomNavigation();
      switchRoleViewport();
      
      showNotification("Role Switched", `Accessing Kinetix as ${role.toUpperCase()}`);
    });
  });
  
  // Set default view on load
  renderBottomNavigation();
  switchRoleViewport();
}

function switchRoleViewport() {
  // Hide all screens
  const allScreens = document.querySelectorAll('.app-screen');
  allScreens.forEach(s => s.classList.remove('active'));
  
  // Display target screen based on active navigation item
  if (KINETIX_STATE.currentRole === 'client') {
    const targetScreen = document.getElementById(`screen-client-${KINETIX_STATE.currentClientScreen}`);
    if (targetScreen) targetScreen.classList.add('active');
  } 
  else if (KINETIX_STATE.currentRole === 'pt') {
    const targetScreen = document.getElementById(`screen-pt-${KINETIX_STATE.currentPTScreen}`);
    if (targetScreen) targetScreen.classList.add('active');
  } 
  else if (KINETIX_STATE.currentRole === 'gymowner') {
    const targetScreen = document.getElementById(`screen-owner-${KINETIX_STATE.currentOwnerScreen}`);
    if (targetScreen) targetScreen.classList.add('active');
  }
}


// ==========================================================================
// DYNAMIC NAVIGATION BARS
// ==========================================================================
function renderBottomNavigation() {
  const navBar = document.getElementById('bottom-nav');
  navBar.innerHTML = '';
  
  if (KINETIX_STATE.currentRole === 'client') {
    navBar.innerHTML = `
      <button class="bottom-nav-item ${KINETIX_STATE.currentClientScreen === 'discover' ? 'active' : ''}" data-screen="discover">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>Discover</span>
      </button>
      <button class="bottom-nav-item ${KINETIX_STATE.currentClientScreen === 'booking' ? 'active' : ''}" data-screen="booking">
        <i class="fa-solid fa-ticket"></i>
        <span>Booking</span>
      </button>
      <button class="bottom-nav-item ${KINETIX_STATE.currentClientScreen === 'workout' ? 'active' : ''}" data-screen="workout">
        <i class="fa-solid fa-dumbbell"></i>
        <span>Workout</span>
      </button>
      <button class="bottom-nav-item ${KINETIX_STATE.currentClientScreen === 'forum' ? 'active' : ''}" data-screen="forum">
        <i class="fa-solid fa-comments"></i>
        <span>Forum</span>
      </button>
    `;
    initClientNavigation();
  } 
  else if (KINETIX_STATE.currentRole === 'pt') {
    navBar.innerHTML = `
      <button class="bottom-nav-item ${KINETIX_STATE.currentPTScreen === 'chat' ? 'active' : ''}" data-screen="chat">
        <i class="fa-solid fa-message"></i>
        <span>Chats</span>
      </button>
      <button class="bottom-nav-item ${KINETIX_STATE.currentPTScreen === 'builder' ? 'active' : ''}" data-screen="builder">
        <i class="fa-solid fa-file-signature"></i>
        <span>Routines</span>
      </button>
    `;
    initPTNavigation();
  } 
  else if (KINETIX_STATE.currentRole === 'gymowner') {
    navBar.innerHTML = `
      <button class="bottom-nav-item ${KINETIX_STATE.currentOwnerScreen === 'register' ? 'active' : ''}" data-screen="register">
        <i class="fa-solid fa-building-circle-check"></i>
        <span>Register Gym</span>
      </button>
      <button class="bottom-nav-item ${KINETIX_STATE.currentOwnerScreen === 'trainers' ? 'active' : ''}" data-screen="trainers">
        <i class="fa-solid fa-users-gear"></i>
        <span>Trainers</span>
      </button>
    `;
    initOwnerNavigation();
  }
}

function initClientNavigation() {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      const screen = e.currentTarget.getAttribute('data-screen');
      KINETIX_STATE.currentClientScreen = screen;
      
      // Update nav states
      items.forEach(i => i.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      switchRoleViewport();
    });
  });
}

function initPTNavigation() {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      const screen = e.currentTarget.getAttribute('data-screen');
      KINETIX_STATE.currentPTScreen = screen;
      
      items.forEach(i => i.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      switchRoleViewport();
    });
  });
}

function initOwnerNavigation() {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      const screen = e.currentTarget.getAttribute('data-screen');
      KINETIX_STATE.currentOwnerScreen = screen;
      
      items.forEach(i => i.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      switchRoleViewport();
    });
  });
}


// ==========================================================================
// CLIENT MODULE: DISCOVER & SYNCED ROSTERS
// ==========================================================================
// Dynamic Trainer listing that respects changes from Gym Owner panel
function renderClientDiscoverTrainers() {
  const listContainer = document.getElementById('trainers-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';
  
  // Filter only trainers that are ACTIVE
  const activeTrainers = KINETIX_STATE.trainers.filter(t => t.status === 'Active');
  
  activeTrainers.forEach((t, index) => {
    const avatarClass = t.id === 'marcus' ? 'trainer-1' : (t.id === 'elena' ? 'trainer-2' : 'trainer-3');
    
    const card = document.createElement('div');
    card.className = 'card-trainer';
    card.innerHTML = `
      <div class="trainer-avatar-wrapper">
        <div class="trainer-avatar ${avatarClass}"></div>
        <span class="active-dot"></span>
      </div>
      <div class="trainer-info">
        <div class="trainer-header-row">
          <h3>${t.name}</h3>
          <span class="exp-badge"><i class="fa-solid fa-award"></i> ${t.exp}</span>
        </div>
        <p class="trainer-specialty">${t.specialty}</p>
        <div class="trainer-badges">
          ${t.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
        </div>
        <div class="trainer-footer">
          <span class="trainer-price">$${t.price}<span class="text-sm">/hr</span></span>
          <button class="btn-book-quick" data-trainer="${t.name}">Book PT</button>
        </div>
      </div>
    `;
    
    // Wire booking actions
    card.querySelector('.btn-book-quick').addEventListener('click', () => {
      KINETIX_STATE.currentClientScreen = 'booking';
      renderBottomNavigation();
      switchRoleViewport();
      showNotification("Package Select", `Choose a package tier for coaching with ${t.name}`);
    });
    
    listContainer.appendChild(card);
  });
}


// ==========================================================================
// CLIENT MODULE: PACKAGE TIERS
// ==========================================================================
function renderBookingPackages() {
  const container = document.getElementById('packages-list-container');
  if (!container) return;
  
  // Segmented control click handlers
  const segmentedOptions = document.querySelectorAll('.segmented-option');
  segmentedOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      segmentedOptions.forEach(o => o.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      const type = e.currentTarget.getAttribute('data-tier-type');
      KINETIX_STATE.activeTierType = type;
      renderBookingPackages();
      
      showNotification("Package Switched", `Viewing ${type.replace('-', ' ').toUpperCase()} pricing tiers`);
    });
  });
  
  // Generate tier cards
  container.innerHTML = '';
  const currentPackages = KINETIX_STATE.bookingPackages[KINETIX_STATE.activeTierType];
  
  currentPackages.forEach(p => {
    const card = document.createElement('div');
    card.className = `card-package-tier ${p.popular ? 'popular' : ''}`;
    card.innerHTML = `
      ${p.popular ? '<div class="popular-badge">Popular</div>' : ''}
      <div class="tier-header">
        <h3>${p.name}</h3>
        <div class="tier-price-row">
          <span class="tier-price">$${p.price}</span>
          <span class="unit">/mo</span>
        </div>
      </div>
      <p class="tier-desc">${p.desc}</p>
      <ul class="tier-features">
        ${p.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
      </ul>
      <button class="btn-select-tier">Purchase Package</button>
    `;
    
    card.querySelector('.btn-select-tier').addEventListener('click', () => {
      showNotification("Purchase Initiated", `Selected package: ${p.name}`);
      triggerIslandPulse(`Paid $${p.price}`);
    });
    
    container.appendChild(card);
  });
}


// ==========================================================================
// CLIENT MODULE: WORKOUTS & TRACKER & LIVE MODE
// ==========================================================================
function startActiveWorkoutSession() {
  KINETIX_STATE.isWorkoutActive = true;
  
  // Toggle displays
  document.getElementById('workout-tracker-dashboard').classList.add('hidden');
  document.getElementById('workout-active-mode').classList.remove('hidden');
  
  // Get active workout routine
  const routineSelector = document.getElementById('routine-select');
  const selectedRoutineVal = routineSelector ? routineSelector.value : 'push-alpha';
  const exercises = KINETIX_STATE.workoutRoutines[selectedRoutineVal];
  
  // Render Active Workout Table/Chart
  const tbody = document.getElementById('active-workout-tbody');
  tbody.innerHTML = '';
  
  exercises.forEach((ex) => {
    // Reset checked state
    ex.done = false;
    
    const row = document.createElement('tr');
    row.className = 'workout-row';
    row.id = `workout-ex-row-${ex.id}`;
    row.innerHTML = `
      <td>
        <span class="exercise-name">${ex.name}</span>
        <span class="exercise-sub">Target progression</span>
      </td>
      <td>${ex.sets}</td>
      <td>${ex.reps}</td>
      <td>
        <label class="exercise-checkbox-label">
          <input type="checkbox" data-ex-id="${ex.id}">
          <div class="custom-checkbox-workout">
            <i class="fa-solid fa-check"></i>
          </div>
        </label>
      </td>
    `;
    
    // Add checkbox event listener
    const check = row.querySelector('input[type="checkbox"]');
    check.addEventListener('change', (e) => {
      const exId = parseInt(e.target.getAttribute('data-ex-id'));
      const isDone = e.target.checked;
      
      // Update state
      const targetEx = exercises.find(item => item.id === exId);
      if (targetEx) targetEx.done = isDone;
      
      // Update row design
      if (isDone) {
        row.classList.add('completed');
      } else {
        row.classList.remove('completed');
      }
      
      // Recalculate progress
      updateWorkoutProgress(exercises);
    });
    
    tbody.appendChild(row);
  });
  
  // Start Timer
  KINETIX_STATE.workoutSeconds = 0;
  const timerDisplay = document.getElementById('workout-timer');
  timerDisplay.textContent = "00:00";
  
  if (KINETIX_STATE.workoutTimerInterval) clearInterval(KINETIX_STATE.workoutTimerInterval);
  KINETIX_STATE.workoutTimerInterval = setInterval(() => {
    KINETIX_STATE.workoutSeconds++;
    const mins = Math.floor(KINETIX_STATE.workoutSeconds / 60);
    const secs = KINETIX_STATE.workoutSeconds % 60;
    timerDisplay.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, 1000);
  
  // Reset buttons
  updateWorkoutProgress(exercises);
  showNotification("Workout Started", "Session live. Follow the set charts.");
}

function updateWorkoutProgress(exercises) {
  const total = exercises.length;
  const completed = exercises.filter(e => e.done).length;
  const percentage = Math.round((completed / total) * 100);
  
  // Update progress elements
  document.getElementById('workout-progress-percentage').textContent = `${percentage}%`;
  document.getElementById('workout-progress-bar').style.width = `${percentage}%`;
  
  // Enable finish button only when all sets checked
  const finishBtn = document.getElementById('btn-complete-workout');
  if (percentage === 100) {
    finishBtn.removeAttribute('disabled');
    finishBtn.style.background = 'var(--success-green)';
    finishBtn.style.color = '#000';
  } else {
    finishBtn.setAttribute('disabled', 'true');
    finishBtn.style.background = '#1d1d2b';
    finishBtn.style.color = 'var(--text-muted)';
  }
}

function cancelActiveWorkoutSession() {
  KINETIX_STATE.isWorkoutActive = false;
  if (KINETIX_STATE.workoutTimerInterval) clearInterval(KINETIX_STATE.workoutTimerInterval);
  
  document.getElementById('workout-active-mode').classList.add('hidden');
  document.getElementById('workout-tracker-dashboard').classList.remove('hidden');
  
  showNotification("Workout Cancelled", "Data not saved.");
}

function completeActiveWorkoutSession() {
  KINETIX_STATE.isWorkoutActive = false;
  if (KINETIX_STATE.workoutTimerInterval) clearInterval(KINETIX_STATE.workoutTimerInterval);
  
  document.getElementById('workout-active-mode').classList.add('hidden');
  document.getElementById('workout-tracker-dashboard').classList.remove('hidden');
  
  // Update dashboard mock states
  KINETIX_STATE.workoutStats.completedCount++;
  
  // Increment completed sessions UI
  const statsContainer = document.querySelectorAll('.stat-val');
  if (statsContainer.length > 1) {
    statsContainer[1].innerHTML = `${KINETIX_STATE.workoutStats.completedCount} <span class="unit">sessions</span>`;
  }
  
  // Update today bar chart to show high completion value
  const todayBar = document.querySelector('.chart-bar-wrapper .bar-fill.current');
  if (todayBar) {
    todayBar.style.height = '100%';
  }
  
  triggerIslandPulse("100% Completed!");
  showNotification("Workout Logged!", "Volume tracked. Excellent execution.");
}


// ==========================================================================
// CLIENT MODULE: COMMUNITY FORUM
// ==========================================================================
function renderForumFeed() {
  const feedContainer = document.getElementById('forum-feed-list');
  if (!feedContainer) return;
  
  // Handle Category tab clicks
  const tabs = document.querySelectorAll('.forum-cat-tab');
  tabs.forEach(tab => {
    // Prevent stacking click handlers
    if (!tab.getAttribute('data-wired')) {
      tab.setAttribute('data-wired', 'true');
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const cat = e.currentTarget.getAttribute('data-category');
        renderForumFeedFiltered(cat);
      });
    }
  });
  
  renderForumFeedFiltered('all');
}

function renderForumFeedFiltered(category) {
  const feedContainer = document.getElementById('forum-feed-list');
  feedContainer.innerHTML = '';
  
  const filtered = category === 'all' 
    ? KINETIX_STATE.forumThreads 
    : KINETIX_STATE.forumThreads.filter(t => t.category === category);
    
  filtered.forEach(t => {
    const card = document.createElement('div');
    card.className = 'forum-card';
    card.innerHTML = `
      <div class="forum-card-header">
        <div class="forum-author">
          <div class="author-avatar ${t.avatarClass}"></div>
          <div>
            <span class="author-name">${t.author}</span>
            ${t.authorType === 'PT' ? '<span class="badge-pt-only">PRO PT</span>' : ''}
          </div>
        </div>
        <span class="forum-time">${t.category.toUpperCase()}</span>
      </div>
      <h3>${t.title}</h3>
      <p class="forum-card-preview">${t.preview}</p>
      <div class="forum-card-footer">
        <span><i class="fa-regular fa-thumbs-up"></i> ${t.likes} Likes</span>
        <span><i class="fa-regular fa-comment"></i> ${t.comments.length} Comments</span>
      </div>
    `;
    
    // Open thread details on card click
    card.addEventListener('click', () => {
      openForumThreadDetail(t);
    });
    
    feedContainer.appendChild(card);
  });
}

function openForumThreadDetail(thread) {
  document.getElementById('forum-feed-list').classList.add('hidden');
  document.querySelector('.forum-categories').classList.add('hidden');
  const detailContainer = document.getElementById('forum-thread-detail');
  detailContainer.classList.remove('hidden');
  
  const content = document.getElementById('thread-detail-content');
  content.innerHTML = `
    <div class="thread-main-post">
      <div class="forum-card-header">
        <div class="forum-author">
          <div class="author-avatar ${thread.avatarClass}"></div>
          <div>
            <span class="author-name">${thread.author}</span>
            ${thread.authorType === 'PT' ? '<span class="badge-pt-only">PRO PT</span>' : ''}
          </div>
        </div>
        <span class="forum-time">${thread.category.toUpperCase()}</span>
      </div>
      <h2>${thread.title}</h2>
      <p>${thread.content}</p>
    </div>
    
    <div class="comments-section">
      <h4>Comments (${thread.comments.length})</h4>
      <div class="comments-list" id="thread-comments-list">
        ${thread.comments.length === 0 ? '<p class="text-muted text-sm">No comments yet. Start the discussion!</p>' : ''}
        ${thread.comments.map(c => `
          <div class="comment-item">
            <div class="comment-header">
              <span class="comment-author">${c.author} ${c.authorType === 'PT' ? '<span class="badge-pt-only">PT</span>' : ''}</span>
              <span class="comment-time">${c.time}</span>
            </div>
            <p class="comment-text">${c.text}</p>
          </div>
        `).join('')}
      </div>
      
      <form class="comment-form" id="forum-comment-form">
        <input type="text" placeholder="Add a constructive comment..." class="comment-input" required>
        <button type="submit" class="btn-comment-submit"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  `;
  
  // Wire comment form submit
  const commentForm = document.getElementById('forum-comment-form');
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = commentForm.querySelector('.comment-input');
    const commentVal = input.value.trim();
    if (!commentVal) return;
    
    // Add to state
    const newComment = {
      author: 'AestheticLifter',
      authorType: 'Client',
      text: commentVal,
      time: 'Just now'
    };
    
    thread.comments.push(newComment);
    input.value = '';
    
    // Refresh thread view
    openForumThreadDetail(thread);
    showNotification("Comment Published", "Your discussion response is active.");
  });
  
  // Wire back button
  document.getElementById('btn-back-to-feed').addEventListener('click', () => {
    detailContainer.classList.add('hidden');
    document.getElementById('forum-feed-list').classList.remove('hidden');
    document.querySelector('.forum-categories').classList.remove('hidden');
    renderForumFeedFiltered('all');
  });
}


// ==========================================================================
// PT MODULE: CHATS & TERMINALS
// ==========================================================================
function renderPTClientList() {
  const cards = document.querySelectorAll('.client-chat-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const clientId = e.currentTarget.getAttribute('data-client-id');
      KINETIX_STATE.activeChatClientId = clientId;
      
      // Set Active Class in sidebar list
      cards.forEach(c => c.classList.remove('active-chat'));
      e.currentTarget.classList.add('active-chat');
      
      // Update Header info
      const name = e.currentTarget.querySelector('h3').textContent;
      document.getElementById('chat-header-name').textContent = name;
      
      // Swap avatar details
      const headerAvatar = document.getElementById('chat-header-avatar');
      headerAvatar.className = 'trainer-avatar header-avatar';
      if (clientId === 'client-marcus') headerAvatar.classList.add('client-avatar-1');
      if (clientId === 'client-elena') headerAvatar.classList.add('client-avatar-2');
      if (clientId === 'client-drake') headerAvatar.classList.add('client-avatar-3');
      
      // Toggle to chat room view inside mock viewport
      document.getElementById('pt-chat-client-list').classList.add('hidden');
      document.getElementById('pt-chat-room').classList.remove('hidden');
      
      renderPTActiveChat();
    });
  });
  
  // Back to Client list button in chat room
  document.getElementById('btn-back-to-clients').addEventListener('click', () => {
    document.getElementById('pt-chat-room').classList.add('hidden');
    document.getElementById('pt-chat-client-list').classList.remove('hidden');
  });
}

function renderPTActiveChat() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;
  container.innerHTML = '';
  
  const activeChat = KINETIX_STATE.chats[KINETIX_STATE.activeChatClientId];
  
  activeChat.forEach(msg => {
    const bubbleRow = document.createElement('div');
    bubbleRow.className = `chat-msg-row ${msg.sender === 'user' ? 'outgoing' : 'incoming'}`;
    bubbleRow.innerHTML = `
      <div class="chat-bubble">
        <p>${msg.text}</p>
        <span class="chat-msg-time">${msg.time}</span>
      </div>
    `;
    container.appendChild(bubbleRow);
  });
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
  
  // Hook message input
  const sendBtn = document.getElementById('btn-send-message');
  const input = document.getElementById('chat-message-input');
  
  // Remove existing listeners to avoid cloning
  const newSendBtn = sendBtn.cloneNode(true);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
  
  newSendBtn.addEventListener('click', () => {
    sendTrainerChatMessage(input);
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendTrainerChatMessage(input);
    }
  });
}

function sendTrainerChatMessage(inputElement) {
  const textVal = inputElement.value.trim();
  if (!textVal) return;
  
  // Outgoing msg state addition
  const activeChat = KINETIX_STATE.chats[KINETIX_STATE.activeChatClientId];
  const now = new Date();
  const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
  
  activeChat.push({
    sender: 'user',
    text: textVal,
    time: timeStr
  });
  
  // Reset input
  inputElement.value = '';
  renderPTActiveChat();
  
  // Simulated Interactive Client Reply with Typing Indicator!
  simulateClientResponse();
}

function simulateClientResponse() {
  const container = document.getElementById('chat-messages-container');
  
  // Create typing bubble
  const typingRow = document.createElement('div');
  typingRow.className = 'chat-msg-row incoming';
  typingRow.id = 'chat-typing-indicator';
  typingRow.innerHTML = `
    <div class="chat-bubble" style="background:#111119; border: 1px solid var(--border-color); padding: 10px 15px;">
      <span class="typing-dots"><i class="fa-solid fa-circle-notch fa-spin text-purple"></i> Client is typing...</span>
    </div>
  `;
  container.appendChild(typingRow);
  container.scrollTop = container.scrollHeight;
  
  // Select context responses depending on client id
  let replyText = "Understood, coach. I will track that during my session tonight!";
  if (KINETIX_STATE.activeChatClientId === 'client-marcus') {
    replyText = "Thanks Coach! Adjusting the weights. Looking forward to the next workout block.";
  } else if (KINETIX_STATE.activeChatClientId === 'client-elena') {
    replyText = "Perfect, adjusting my food journal. The macro ratio adjustments feel much better.";
  } else if (KINETIX_STATE.activeChatClientId === 'client-drake') {
    replyText = "Will increase the sets by 1 as suggested. Heavy focus on concentric contraction.";
  }
  
  setTimeout(() => {
    // Remove typing bubble
    const ind = document.getElementById('chat-typing-indicator');
    if (ind) ind.remove();
    
    // Add real response bubble
    const activeChat = KINETIX_STATE.chats[KINETIX_STATE.activeChatClientId];
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
    
    activeChat.push({
      sender: 'client',
      text: replyText,
      time: timeStr
    });
    
    renderPTActiveChat();
    triggerIslandPulse("New Client Msg");
  }, 1800);
}


// ==========================================================================
// PT MODULE: ROUTINE ARCHITECT & REORDERING
// ==========================================================================
function renderPTRoutineBuilder() {
  const select = document.getElementById('routine-select');
  if (!select) return;
  
  // Load builder reorder details
  const activeRoutineKey = select.value;
  const listContainer = document.getElementById('builder-routine-list');
  listContainer.innerHTML = '';
  
  const exercises = KINETIX_STATE.workoutRoutines[activeRoutineKey];
  
  exercises.forEach((ex, idx) => {
    const item = document.createElement('div');
    item.className = 'builder-item';
    item.innerHTML = `
      <div style="display:flex; align-items:center; flex:1;">
        <span class="builder-item-drag-indicator"><i class="fa-solid fa-grip-vertical"></i></span>
        <div class="builder-item-info">
          <h4>${ex.name}</h4>
          <p>${ex.sets} Sets • ${ex.reps} Reps</p>
        </div>
      </div>
      
      <div class="builder-item-actions">
        <button class="builder-action-btn btn-up" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        <button class="builder-action-btn btn-down" data-idx="${idx}" ${idx === exercises.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
          <i class="fa-solid fa-arrow-down"></i>
        </button>
        <button class="builder-action-btn btn-delete" data-idx="${idx}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    
    // Wire sorting
    item.querySelector('.btn-up').addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.getAttribute('data-idx'));
      swapRoutineElements(exercises, i, i - 1);
    });
    item.querySelector('.btn-down').addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.getAttribute('data-idx'));
      swapRoutineElements(exercises, i, i + 1);
    });
    item.querySelector('.btn-delete').addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.getAttribute('data-idx'));
      exercises.splice(i, 1);
      renderPTRoutineBuilder();
      showNotification("Exercise Removed", "Published list modified.");
    });
    
    listContainer.appendChild(item);
  });
  
  // Setup Select listener
  if (!select.getAttribute('data-wired')) {
    select.setAttribute('data-wired', 'true');
    select.addEventListener('change', renderPTRoutineBuilder);
  }
  
  // Submit new exercise
  const addBtn = document.getElementById('btn-add-exercise-submit');
  const nameInput = document.getElementById('add-ex-name');
  const setsInput = document.getElementById('add-ex-sets');
  const repsInput = document.getElementById('add-ex-reps');
  
  const newAddBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newAddBtn, addBtn);
  
  newAddBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const sets = parseInt(setsInput.value);
    const reps = repsInput.value.trim();
    
    if (!name || isNaN(sets) || !reps) {
      showNotification("Error", "Fill in all exercise parameters.");
      return;
    }
    
    const newEx = {
      id: Date.now(),
      name: name,
      sets: sets,
      reps: `x${reps.replace('x', '')}`,
      done: false
    };
    
    exercises.push(newEx);
    
    // Clear inputs
    nameInput.value = '';
    setsInput.value = '';
    repsInput.value = '';
    
    renderPTRoutineBuilder();
    showNotification("Exercise Added", `Appended ${name} to published list.`);
  });
  
  // Routine save publishes message
  const saveBtn = document.getElementById('btn-save-routine');
  const newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
  newSaveBtn.addEventListener('click', () => {
    showNotification("Routine Saved", "Changes pushed live to all client programs.");
    triggerIslandPulse("Routine Updated");
  });
}

function swapRoutineElements(arr, indexA, indexB) {
  const temp = arr[indexA];
  arr[indexA] = arr[indexB];
  arr[indexB] = temp;
  renderPTRoutineBuilder();
}


// ==========================================================================
// GYM OWNER MODULE: REGISTRATION & VERIFICATION CYCLES
// ==========================================================================
function setupRegistrationForm() {
  const form = document.getElementById('gym-reg-form');
  if (!form) return;
  
  // File drag-drop visual simulator
  const dropZone = document.getElementById('file-upload-zone');
  const fileInput = document.getElementById('gym-file-input');
  const uploadedLabel = document.getElementById('uploaded-file-name');
  
  dropZone.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      uploadedLabel.textContent = `Attached: ${fileInput.files[0].name}`;
      uploadedLabel.style.display = 'block';
      showNotification("Document Attached", fileInput.files[0].name);
    }
  });
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary-red)';
    dropZone.style.background = 'rgba(255, 30, 56, 0.04)';
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--border-color)';
    dropZone.style.background = 'rgba(255,255,255,0.01)';
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
    dropZone.style.background = 'rgba(255,255,255,0.01)';
    
    if (e.dataTransfer.files.length > 0) {
      uploadedLabel.textContent = `Dropped: ${e.dataTransfer.files[0].name}`;
      uploadedLabel.style.display = 'block';
      showNotification("Document Uploaded", e.dataTransfer.files[0].name);
    }
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const banner = document.getElementById('facility-status-banner');
    const text = document.getElementById('facility-status-text');
    
    // Set Pending State
    banner.className = 'verification-status-banner pending';
    banner.querySelector('i').className = 'fa-solid fa-clock-rotate-left';
    text.textContent = 'Under Review - Verification Pending';
    
    showNotification("Facility Submitted", "Gym under technical compliance review.");
    triggerIslandPulse("Gym Verification");
    
    // Simulate auto-approval after 6 seconds for showcase clarity!
    setTimeout(() => {
      banner.className = 'verification-status-banner approved';
      banner.querySelector('i').className = 'fa-solid fa-shield-halved';
      text.textContent = 'Active Partner - Verified Gym';
      
      showNotification("Gym Approved!", "Facility listed live on discovery maps!");
      triggerIslandPulse("Gym Verified!");
    }, 6000);
  });
}


// ==========================================================================
// GYM OWNER MODULE: ROSTER MANAGEMENT (CROSS-ROLE SYNC)
// ==========================================================================
function renderOwnerTrainers() {
  const container = document.getElementById('owner-trainers-list');
  if (!container) return;
  container.innerHTML = '';
  
  KINETIX_STATE.trainers.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'owner-trainer-card';
    card.innerHTML = `
      <div class="owner-trainer-header">
        <div class="trainer-avatar ${t.id === 'marcus' ? 'trainer-1' : (t.id === 'elena' ? 'trainer-2' : 'trainer-3')}" style="width:40px; height:40px;"></div>
        <div class="owner-trainer-details">
          <h3>${t.name}</h3>
          <p>${t.specialty}</p>
        </div>
      </div>
      
      <textarea class="owner-trainer-bio-edit" placeholder="Edit biography...">${t.bio}</textarea>
      
      <div class="owner-trainer-controls">
        <span class="owner-status-label">Status Level:</span>
        <select class="owner-status-selector ${t.status === 'Active' ? 'active-status' : (t.status === 'Suspended' ? 'suspended-status' : 'pending-status')}">
          <option value="Active" ${t.status === 'Active' ? 'selected' : ''}>Active / Listed</option>
          <option value="Pending Approval" ${t.status === 'Pending Approval' ? 'selected' : ''}>Pending Approval</option>
          <option value="Suspended" ${t.status === 'Suspended' ? 'selected' : ''}>Suspended / Hidden</option>
        </select>
      </div>
    `;
    
    // Event listener for bio updates
    const bioText = card.querySelector('.owner-trainer-bio-edit');
    bioText.addEventListener('change', (e) => {
      t.bio = e.target.value;
      showNotification("Profile Edited", `${t.name}'s biography updated.`);
      // Sync trainers to client discover
      renderClientDiscoverTrainers();
    });
    
    // Event listener for status changes
    const select = card.querySelector('.owner-status-selector');
    select.addEventListener('change', (e) => {
      const newStatus = e.target.value;
      t.status = newStatus;
      
      // Update styling
      select.className = 'owner-status-selector';
      if (newStatus === 'Active') select.classList.add('active-status');
      if (newStatus === 'Suspended') select.classList.add('suspended-status');
      if (newStatus === 'Pending Approval') select.classList.add('pending-status');
      
      showNotification("Status Adjusted", `${t.name} state set to: ${newStatus}`);
      triggerIslandPulse("Roster Sync");
      
      // Sync trainers list in client view! (will immediately add/remove from trainer list)
      renderClientDiscoverTrainers();
    });
    
    container.appendChild(card);
  });
  
  // Wire "Invite New Trainer" button
  const inviteBtn = document.getElementById('btn-add-mock-trainer');
  const newInviteBtn = inviteBtn.cloneNode(true);
  inviteBtn.parentNode.replaceChild(newInviteBtn, inviteBtn);
  
  newInviteBtn.addEventListener('click', () => {
    // Generate new mock trainer in state
    const newId = `trainer-${Date.now()}`;
    const newTrainer = {
      id: newId,
      name: 'Dr. Drake Harrison',
      exp: '6 Yrs Exp',
      specialty: 'Kinesiology Rehab',
      tags: ['DPT Doctor', 'Rehab'],
      price: 110,
      status: 'Pending Approval',
      bio: 'Physical therapist and clinical coach targeting motor pattern adjustments.'
    };
    
    KINETIX_STATE.trainers.push(newTrainer);
    renderOwnerTrainers();
    
    showNotification("Trainer Invited", "Drake Harrison added to roster (Pending approval).");
  });
  
  // Trigger initial client discover list render
  renderClientDiscoverTrainers();
}
