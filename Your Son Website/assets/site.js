/* Shared site behavior:
   - Mobile menu toggle
   - Simple cart (localStorage) with count in header
   - Cart drawer rendering on all pages
*/

const STORE_KEY = "demo_cart_v1";

// Neutral, non-demo products (rename/price as you like)
const PRODUCTS = [
  { id: "p1", name: "Your Son's Cap", price: 35.00, note: "Produced from stitch to label in Ontario, Canada" },
  { id: "p2", name: "Your Son's Toque", price: 35.00, note: "Produced from stitch to label in Ontario, Canada." },
  { id: "p3", name: "Your Son's Trousers", price: 55.00, note: "Produced from stitch to label in Ontario, Canada." },
  { id: "p4", name: "Oak Stave Centrepiece", price: 75.00, note: "Reclaimed oak whisky barrel stave from Salaberry-de-Valleyfield, Quebec." },
];

function money(n){ return `$${n.toFixed(2)}`; }

function getCart(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }catch(_e){
    return [];
  }
}
function setCart(items){
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
  updateCartBadges();
}

function cartCount(){
  return getCart().reduce((sum, it) => sum + (it.qty || 0), 0);
}

function updateCartBadges(){
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = count;
  });
}

function addToCart(productId, qty=1){
  const cart = getCart();
  const found = cart.find(x => x.id === productId);
  if(found) found.qty += qty;
  else cart.push({ id: productId, qty });
  setCart(cart);
}

function removeFromCart(productId){
  const cart = getCart().filter(x => x.id !== productId);
  setCart(cart);
}

function changeQty(productId, delta){
  const cart = getCart();
  const it = cart.find(x => x.id === productId);
  if(!it) return;
  it.qty = Math.max(1, (it.qty || 1) + delta);
  setCart(cart);
}

function cartTotal(){
  const cart = getCart();
  let total = 0;
  for(const it of cart){
    const p = PRODUCTS.find(x => x.id === it.id);
    if(p) total += p.price * (it.qty || 0);
  }
  return total;
}

/* Cart drawer */
function ensureCartDrawer(){
  if(document.getElementById("cartOverlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";
  overlay.id = "cartOverlay";
  overlay.dataset.open = "false";
  overlay.innerHTML = `
    <aside class="cart" role="dialog" aria-modal="true" aria-label="Cart drawer">
      <div class="cart-header">
        <div class="cart-title">Cart (<span data-cart-count>0</span>)</div>
        <button class="icon-btn" type="button" id="cartCloseBtn" aria-label="Close cart">Close</button>
      </div>

      <div class="cart-items" id="cartItems"></div>

      <div class="cart-footer">
        <div class="totals">
          <span>Total</span>
          <strong id="cartTotal">$0.00</strong>
        </div>
        <button class="btn primary" type="button" id="checkoutBtn">Checkout</button>
        <div class="small-note">Demo cart (localStorage). Hook this up to your real checkout later.</div>
      </div>
    </aside>
  `;
  document.body.appendChild(overlay);

  // Close interactions
  overlay.addEventListener("click", (e) => {
    if(e.target === overlay) setCartOpen(false);
  });
  overlay.querySelector("#cartCloseBtn").addEventListener("click", () => setCartOpen(false));

  // Fake checkout
  overlay.querySelector("#checkoutBtn").addEventListener("click", () => {
    const count = cartCount();
    if(count === 0){
      alert("Your cart is empty.");
      return;
    }
    alert("Demo checkout. Replace this with your real checkout flow.");
  });
}

function setCartOpen(open){
  const overlay = document.getElementById("cartOverlay");
  if(!overlay) return;
  overlay.dataset.open = open ? "true" : "false";
  if(open) renderCartDrawer();
}

function renderCartDrawer(){
  ensureCartDrawer();
  const cart = getCart();
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  itemsEl.innerHTML = "";

  if(cart.length === 0){
    itemsEl.innerHTML = `<div class="cart-item"><div class="name">Cart is empty</div><div class="sub">Add something from the Shop page.</div></div>`;
  }else{
    for(const it of cart){
      const p = PRODUCTS.find(x => x.id === it.id);
      if(!p) continue;

      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="top">
          <div>
            <div class="name">${p.name}</div>
            <div class="sub">${money(p.price)} • Qty: ${it.qty}</div>
          </div>
          <button class="icon-btn" type="button" data-remove="${p.id}" aria-label="Remove ${p.name}">Remove</button>
        </div>
        <div class="actions">
          <button class="btn ghost" type="button" data-qty="${p.id}" data-delta="-1">−</button>
          <button class="btn ghost" type="button" data-qty="${p.id}" data-delta="1">+</button>
        </div>
      `;
      itemsEl.appendChild(row);
    }

    itemsEl.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        removeFromCart(btn.getAttribute("data-remove"));
        renderCartDrawer();
      });
    });
    itemsEl.querySelectorAll("[data-qty]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-qty");
        const delta = Number(btn.getAttribute("data-delta") || "0");
        changeQty(id, delta);
        renderCartDrawer();
      });
    });
  }

  totalEl.textContent = money(cartTotal());
  updateCartBadges();
}

/* Mobile menu */
function initMobileMenu(){
  const header = document.getElementById("siteHeader");
  const btn = document.getElementById("menuBtn");
  const panel = document.getElementById("mobilePanel");
  if(!header || !btn || !panel) return;

  function setOpen(open){
    header.dataset.open = open ? "true" : "false";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  btn.addEventListener("click", () => {
    const isOpen = header.dataset.open === "true";
    setOpen(!isOpen);
  });

  panel.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if(a) setOpen(false);
  });
}

/* Shop renderer (only runs if the container exists) */
function renderShop(){
  const grid = document.getElementById("shopGrid");
  if(!grid) return;

  grid.innerHTML = "";
  for(const p of PRODUCTS){
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <div class="thumb" aria-hidden="true"></div>
      <div>
        <h3>${p.name}</h3>
        <div class="meta">
          <span>${p.note}</span>
          <strong>${money(p.price)}</strong>
        </div>
      </div>
      <button class="btn primary" type="button" data-add="${p.id}">Add to Cart</button>
    `;
    grid.appendChild(card);
  }

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.getAttribute("data-add"), 1);
      btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = "Add to Cart"), 800);
    });
  });
}

/* Cart links in header */
function initCartLinks(){
  ensureCartDrawer();
  document.querySelectorAll("[data-open-cart]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setCartOpen(true);
    });
  });
}

/* Footer year */
function setYear(){
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* Init */
window.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initCartLinks();
  renderShop();
  updateCartBadges();
  setYear();
});
