/* ===========================================================
   THE LANDS BETWEEN COLLECTIBLES — Shared Engine
   =========================================================== */

const GST_RATE = 0.18;
const SHIPPING_FLAT = 150;
const FREE_SHIP_THRESHOLD = 2000;
const CART_KEY = "ltb_cart_v1";

/* ---------- Cart core ---------- */
function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(id, qty){
  const userJson = localStorage.getItem('ltb_user');
  if (!userJson) {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.classList.add('active');
      document.body.classList.add('lock');
      if (typeof window.initLightfall === 'function') {
        window.initLightfall('lightfallContainer');
      }
    }
    return;
  }
  qty = qty || 1;
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
}
function setQty(id, qty){
  const cart = getCart();
  if(qty <= 0){ delete cart[id]; } else { cart[id] = qty; }
  saveCart(cart);
}
function removeFromCart(id){
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}
function clearCart(){ saveCart({}); }

function cartLines(){
  const cart = getCart();
  return Object.keys(cart).map(id => {
    const product = PRODUCTS.find(p => p.id === id);
    return product ? { product, qty: cart[id] } : null;
  }).filter(Boolean);
}
function cartCount(){
  const cart = getCart();
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function cartSubtotal(){
  return cartLines().reduce((sum, l) => sum + l.product.price * l.qty, 0);
}
function computePricing(){
  const subtotal = cartSubtotal();
  const gst = subtotal * GST_RATE;
  const shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FLAT);
  const total = subtotal + gst + shipping;
  return { subtotal, gst, shipping, total };
}
function updateCartBadge(){
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    const n = cartCount();
    el.textContent = n;
    el.style.display = n > 0 ? "flex" : "none";
  });
}

/* ---------- Stars ---------- */
function renderStars(rating){
  const full = Math.round(rating);
  return "★★★★★☆☆☆☆☆".slice(5-full, 10-full) + ` ${rating.toFixed(1)}`;
}

/* ---------- Toast ---------- */
function showToast(msg){
  let toast = document.querySelector(".added-toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "added-toast";
    toast.innerHTML = `<span class="ic">✦</span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector(".toast-msg").textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.classList.remove("show"), 2600);
}

/* ---------- Preloader ---------- */
function initPreloader(){
  const pre = document.getElementById("preloader");
  if(!pre) {
    document.documentElement.classList.add("loaded");
    return;
  }
  // build ember particles
  const emberWrap = pre.querySelector(".intro-ember");
  if(emberWrap){
    for(let i=0;i<22;i++){
      const s = document.createElement("span");
      s.style.left = Math.random()*100 + "%";
      s.style.animationDuration = (4 + Math.random()*4) + "s";
      s.style.animationDelay = (Math.random()*3) + "s";
      emberWrap.appendChild(s);
    }
  }
  const seen = sessionStorage.getItem("ltb_intro_seen");
  if(seen){
    pre.remove();
    document.body.classList.remove("lock");
    document.documentElement.classList.add("loaded");
    return;
  }
  document.body.classList.add("lock");
  setTimeout(()=>{
    pre.classList.add("fade-out");
    document.body.classList.remove("lock");
    sessionStorage.setItem("ltb_intro_seen", "1");
    document.documentElement.classList.add("loaded");
    setTimeout(()=> pre.remove(), 1100);
  }, 3500);
}

/* ---------- Nav ---------- */
function initNav(){
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if(toggle && links){
    toggle.addEventListener("click", ()=> links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", ()=> links.classList.remove("open")));
  }
  // highlight active link
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a=>{
    if(a.getAttribute("href") === path) a.classList.add("active");
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal(){
  const els = document.querySelectorAll(".reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale");
  if(!("IntersectionObserver" in window) || !els.length){
    els.forEach(e=>e.classList.add("in"));
    return;
  }
  
  // Apply staggered transition delays for elements within same containers (like grids)
  els.forEach(el => {
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => 
        child.classList.contains('reveal') || 
        child.classList.contains('reveal-up') || 
        child.classList.contains('reveal-left') || 
        child.classList.contains('reveal-right') || 
        child.classList.contains('reveal-scale')
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(el);
        if (index > 0) {
          // Cap the stagger delay index at 3 (max 180ms) to ensure grid items load extremely quickly
          const delayIndex = Math.min(index, 3);
          el.style.transitionDelay = `${delayIndex * 60}ms`;
        }
      }
    }
  });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ 
        en.target.classList.add("in"); 
        io.unobserve(en.target); 
      }
    });
  }, { threshold:.12 });
  els.forEach(e=> io.observe(e));
}

/* ---------- Header sticky shrink ---------- */
function initHeaderScroll(){
  const header = document.querySelector(".site-header");
  if(!header) return;
  window.addEventListener("scroll", ()=>{
    header.style.boxShadow = window.scrollY > 30 ? "0 10px 30px rgba(0,0,0,.4)" : "none";
  });
}

/* ---------- Login Theming & Logic ---------- */
function initLogin() {
  const modalHTML = `
    <!-- SUCCESS OVERLAY (Souls Style) -->
    <div id="successOverlay" class="success-overlay" aria-hidden="true">
      <div class="banner-gold">
        <h1 class="success-text" id="successText">COVENANT ESTABLISHED</h1>
        <p class="success-sub" id="successSub">Humanity Restored · Connection Established</p>
      </div>
    </div>

    <!-- LOGIN MODAL BACKDROP -->
    <div id="loginModal" class="login-modal" aria-hidden="true">
      <div id="lightfallContainer" class="lightfall-modal-bg"></div>
      <div class="login-card">
        <button class="login-close" id="loginCloseBtn" aria-label="Close form">&times;</button>
        
        <div class="login-header">
          <h2 id="loginTitle">Enter the Covenant</h2>
          <p id="loginDesc" class="login-subtitle">Seek strength from the Lands Between</p>
        </div>

        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="covClass">Select Covenant Path</label>
            <select id="covClass" required>
              <option value="Tarnished">Tarnished (Elden Ring)</option>
              <option value="Chosen Undead">Chosen Undead (Dark Souls)</option>
              <option value="Good Hunter">Good Hunter (Bloodborne)</option>
              <option value="Ashen One">Ashen One (Dark Souls III)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="loginUser">Character Name</label>
            <input type="text" id="loginUser" placeholder="e.g. Sharif" required autocomplete="username">
          </div>

          <div class="form-group">
            <label for="loginPass">Covenant Oath (Password)</label>
            <input type="password" id="loginPass" placeholder="••••••••" required autocomplete="current-password">
          </div>

          <button type="submit" class="btn btn-solid btn-block login-submit-btn" id="loginSubmitBtn">Establish Connection</button>
        </form>

        <div class="login-footer">
          <a href="#" id="switchAuthBtn">Need to forge a new covenant? Join Covenant</a>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const loginModal = document.getElementById('loginModal');
  const successOverlay = document.getElementById('successOverlay');
  const navBtn = document.getElementById('navLoginBtn');
  const closeBtn = document.getElementById('loginCloseBtn');
  const form = document.getElementById('loginForm');
  const switchBtn = document.getElementById('switchAuthBtn');
  const loginTitle = document.getElementById('loginTitle');
  const loginDesc = document.getElementById('loginDesc');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const successText = document.getElementById('successText');
  const successSub = document.getElementById('successSub');

  let isSignUpMode = false;

  updateLoginState();

  if (navBtn) {
    navBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentUser = localStorage.getItem('ltb_user');
      if (currentUser) {
        triggerLogout();
      } else {
        openModal();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeModal();
    });
  }

  if (switchBtn) {
    switchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isSignUpMode = !isSignUpMode;
      if (isSignUpMode) {
        loginTitle.textContent = "Forge Covenant";
        loginDesc.textContent = "Initiate your vow and create an account";
        loginSubmitBtn.textContent = "Forge Covenant";
        switchBtn.textContent = "Already established? Enter Covenant";
      } else {
        loginTitle.textContent = "Enter the Covenant";
        loginDesc.textContent = "Seek strength from the Lands Between";
        loginSubmitBtn.textContent = "Establish Connection";
        switchBtn.textContent = "Need to forge a new covenant? Join Covenant";
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUser').value.trim();
      const covClass = document.getElementById('covClass').value;
      
      localStorage.setItem('ltb_user', JSON.stringify({ username, covClass }));

      closeModal();
      triggerSuccess(username, covClass);
    });
  }

  function openModal() {
    loginModal.classList.add('active');
    document.body.classList.add('lock');
    if (typeof window.initLightfall === 'function') {
      window.initLightfall('lightfallContainer');
    }
  }

  function closeModal() {
    loginModal.classList.remove('active');
    document.body.classList.remove('lock');
    if (typeof window.destroyLightfall === 'function') {
      window.destroyLightfall();
    }
  }

  function triggerSuccess(username, covClass) {
    if (isSignUpMode) {
      successText.textContent = "COVENANT FORGED";
      successSub.textContent = `Vow pledged by ${covClass} ${username}`;
    } else {
      successText.textContent = "COVENANT ESTABLISHED";
      successSub.textContent = `Welcome back, ${covClass} ${username}`;
    }

    successOverlay.classList.add('active');
    
    setTimeout(() => {
      successOverlay.classList.remove('active');
      updateLoginState();
      window.location.href = 'dashboard.html';
    }, 2800);
  }

  function triggerLogout() {
    successText.textContent = "COVENANT ABANDONED";
    successSub.textContent = "You are now disconnected from the flame";
    successOverlay.classList.add('active');

    localStorage.removeItem('ltb_user');
    if (typeof clearCart === 'function') clearCart();
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  function updateLoginState() {
    const navBtn = document.getElementById('navLoginBtn');
    if (!navBtn) return;
    
    const user = JSON.parse(localStorage.getItem('ltb_user'));
    if (user) {
      let icon = "🛡️";
      if (user.covClass === "Good Hunter") icon = "🩸";
      else if (user.covClass === "Tarnished") icon = "✨";
      else if (user.covClass === "Ashen One") icon = "🔥";
      
      navBtn.innerHTML = `${icon} ${user.username} <span class="logout-indicator">(Abandon)</span>`;
      navBtn.classList.add('logged-in');
    } else {
      navBtn.innerHTML = "Sign In";
      navBtn.classList.remove('logged-in');
    }
  }
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  initPreloader();
  initNav();
  initReveal();
  initHeaderScroll();
  updateCartBadge();
  initLogin();
});