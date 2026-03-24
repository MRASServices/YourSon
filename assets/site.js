/* Shared site behavior:
   - Mobile menu toggle
   - Simple cart (localStorage) with count in header
   - Cart drawer rendering on all pages
*/

const STORE_KEY = "demo_cart_v1";

// Products (now includes dropdown info)
const PRODUCTS = [
  {
    id: "p1",
    name: "your son's toque",
    price: 0.00,
    note: "To keep your melon warm on Canada's coldest days. It's also great for when you're in survival mode, à la Man Cold.",
    image: "assets/images/coming_soon.png",
    specs: ["One size fits most", "Shaker Knit", "Embroidered Logo"],
    materials: ["100% Cotton"],
    origin: ["Brampton, Ontario, Canada"]
  },
  {
    id: "p2",
    name: "your son's cap",
    price: 0.00,
    note: "Sometimes it's sunny, sometimes it's windy, and most times, our hair is in absolute shambles; it's great for all three.",
    image: "assets/images/coming_soon.png",
    specs: ["One size fits most", "Embroidered Logo"],
    materials: ["Cotton twill"],
    origin: ["Fenelon Falls, Ontario, Canada"]
  },
  {
    id: "p3",
    name: "your son's trousers",
    price: 0.00,
    note: "Pants. We need them durable, comfortable, and not to look like something Armstrong wore when they filmed the landing in '69.  ",
    image: "assets/images/coming_soon.png",
    specs: ["Relaxed fit", "Reinforced seams"],
    materials: ["Workwear blend"],
    origin: ["Barrie, Ontario, Canada"]
  },
  {
    id: "p4",
    name: "oak stave centrepiece",
    price: 0.00,
    note: "Ever dreamed of finally owning a true part of Canadian history? Well, this isn't that. It's wood, but it does have candles!",
    image: "assets/images/coming_soon.png",
    specs: ["Natural reclaimed shape", "Hand-finished", "Width: 1.5″ or less", "Length: approx. 35″"],
    materials: ["Reclaimed oak"], 
    origin: ["Salaberry-de-Valleyfield, Quebec, Canada"]
  },
  {
    id: "p5",
    name: "made in canada patch",
    price: 0.00,
    note: "It really shouldn't take the Orange Man to remind us Canadians just how proud we are. Yet, here we are - again.",
    image: "assets/images/coming_soon.png",
    specs: ["Iron-on or sew-on"],
    materials: ["Woven patch, Embroidered"],
    origin: ["Newmarket, Ontario, Canada"]
  },
   {
    id: "p6",
    name: "bibliophile cutting board (set)",
    price: 0.00,
    note: "From bedtime stories to dinnertime recipes, we love our books. Now, introducing books you can cut on! Revolutionary.",
    image: "assets/images/coming_soon.png",
    specs: ["Individual (in): 12l * 10w * 1th", "Set (in): 12l * 10w * 3th"],
    materials: ["Red Oak","Maple","Red Grandis"],
    origin: ["Oshawa, Ontario, Canada"]
  },
   {
    id: "p7",
    name: "bibliophile cutting board (single)",
    price: 0.00,
    note: "We get it, sometimes three is a crowd. But much like Your Son, sometimes it pays to have <s>an only child</s> one cutting board.",
    image: "assets/images/coming_soon.png",
    specs: ["Measurement (in): 12l * 10w * 1th"],
    materials: ["Red Oak","Maple","Red Grandis"],
    origin: ["Oshawa, Ontario, Canada"]
  },
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

  overlay.addEventListener("click", (e) => {
    if(e.target === overlay) setCartOpen(false);
  });
  overlay.querySelector("#cartCloseBtn").addEventListener("click", () => setCartOpen(false));

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

/* Helpers for dropdown lists */
function renderList(items){
  if(!items || !items.length) return `<p class="prod-dd-empty">Details coming soon.</p>`;
  return `<ul class="prod-dd-list">${items.map(x => `<li>${x}</li>`).join("")}</ul>`;
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
      <div class="thumb">
        <img src="${p.image}" alt="${p.name}">
      </div>

      <div class="prod-main">
        <h3>${p.name}</h3>

        <div class="meta">
          <span class="prod-note">${p.note}</span>
          <strong class="prod-price">${money(p.price)}</strong>
        </div>

        <div class="prod-dds" aria-label="More product information">
          <details class="prod-dd">
            <summary>Specifications</summary>
            <div class="prod-dd-panel">
              ${renderList(p.specs)}
            </div>
          </details>

          <details class="prod-dd">
            <summary>Materials</summary>
            <div class="prod-dd-panel">
              ${renderList(p.materials)}
            </div>
          </details>

          <details class="prod-dd">
            <summary>Origin</summary>
            <div class="prod-dd-panel">
              ${renderList(p.origin)}
            </div>
          </details>
        </div>
      </div>

      <button class="btn primary-shop prod-buy" type="button" data-add="${p.id}">click to own</button>
    `;

    grid.appendChild(card);
  }

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.getAttribute("data-add"), 1);
      btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = "click to own"), 800);
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
  initPersonalServices();
});

/* ===== PERSONAL SERVICES SEARCH (your existing version kept) ===== */
function initPersonalServices(){
  const searchInput = document.getElementById("serviceSearch");
  const clearBtn = document.getElementById("clearSearch");
  const statusEl = document.getElementById("searchStatus");
  const boxes = Array.from(document.querySelectorAll("details.ps-mini-box"));
  if(!searchInput || !clearBtn || boxes.length === 0) return;

  function normalize(s){ return (s || "").toLowerCase(); }
  function setStatus(msg){ if(statusEl) statusEl.textContent = msg; }

  function escapeRegex(str){
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function highlightHtml(html, query){
    if(!query) return html;
    const re = new RegExp(escapeRegex(query), "gi");
    return html.replace(re, (m) => `<span class="ps-hit">${m}</span>`);
  }

  boxes.forEach(d => {
    const panel = d.querySelector(".ps-mini-panel");
    if(panel && !panel.dataset.origHtml){
      panel.dataset.origHtml = panel.innerHTML;
    }
  });

  function applyFilter(){
    const q = normalize(searchInput.value).trim();
    let matches = 0;

    boxes.forEach(d => {
      d.classList.remove("match");

      const panel = d.querySelector(".ps-mini-panel");
      if(panel && panel.dataset.origHtml){
        panel.innerHTML = panel.dataset.origHtml;
      }

      if(!q){
        d.style.display = "";
        d.open = false;
        return;
      }

      const text = normalize(d.textContent);
      const hit = text.includes(q);

      if(hit){
        d.style.display = "";
        d.classList.add("match");
        d.open = true;
        matches += 1;

        if(panel){
          panel.innerHTML = highlightHtml(panel.innerHTML, q);
        }
      }else{
        d.style.display = "none";
        d.open = false;
      }
    });

    if(!q) setStatus("");
    else setStatus(`${matches} section${matches===1?"":"s"} matched`);
  }

  searchInput.addEventListener("input", applyFilter);

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    boxes.forEach(d => {
      d.style.display = "";
      d.classList.remove("match");
      d.open = false;

      const panel = d.querySelector(".ps-mini-panel");
      if(panel && panel.dataset.origHtml) panel.innerHTML = panel.dataset.origHtml;
    });
    setStatus("");
    searchInput.focus();
  });

  // Modals (unchanged)
  const callModal = document.getElementById("callModal");
  const writeModal = document.getElementById("writeModal");
  const openCall = document.getElementById("openCall");
  const openWrite = document.getElementById("openWrite");
  const openTextForm = document.getElementById("openTextForm");
  const textFormWrap = document.getElementById("textFormWrap");

  function openModal(m){
    if(!m) return;
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
  }
  function closeModal(m){
    if(!m) return;
    m.classList.remove("open");
    m.setAttribute("aria-hidden", "true");
    if(textFormWrap) textFormWrap.classList.remove("open");
  }

  openCall && openCall.addEventListener("click", () => openModal(callModal));
  openWrite && openWrite.addEventListener("click", () => openModal(writeModal));

  document.addEventListener("click", (e) => {
    const t = e.target;
    if(!(t instanceof Element)) return;
    if(t.matches("[data-ps-close='true']")){
      if(callModal && callModal.classList.contains("open")) closeModal(callModal);
      if(writeModal && writeModal.classList.contains("open")) closeModal(writeModal);
    }
  });

  document.addEventListener("keydown", (e) => {
    if(e.key !== "Escape") return;
    if(callModal && callModal.classList.contains("open")) closeModal(callModal);
    if(writeModal && writeModal.classList.contains("open")) closeModal(writeModal);
  });

  openTextForm && openTextForm.addEventListener("click", () => {
    if(!textFormWrap) return;
    textFormWrap.classList.toggle("open");
  });

  applyFilter();
}

/* ===== GALLERY MODAL (unchanged) ===== */
(() => {
  const modal = document.getElementById("workGallery");
  if(!modal) return;

  const imgEl = document.getElementById("galleryImg");
  const titleEl = document.getElementById("galleryTitle");
  const subEl = document.getElementById("gallerySub");
  const dotsEl = document.getElementById("galleryDots");
  const prevBtn = modal.querySelector(".gallery-nav.prev");
  const nextBtn = modal.querySelector(".gallery-nav.next");

  let images = [];
  let index = 0;
  let lastFocus = null;

  function renderDots(){
    dotsEl.innerHTML = "";
    images.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gallery-dot" + (i === index ? " is-active" : "");
      b.setAttribute("aria-label", `Go to photo ${i+1}`);
      b.addEventListener("click", () => { index = i; render(); });
      dotsEl.appendChild(b);
    });
  }

  function render(){
    if (!images.length) return;
    imgEl.src = images[index];
    imgEl.alt = `${titleEl.textContent} photo ${index+1} of ${images.length}`;
    renderDots();
  }

  function openGallery({title, sub, imgs}){
    images = imgs;
    index = 0;
    titleEl.textContent = title || "Project";
    subEl.textContent = sub || `${images.length} photos`;
    lastFocus = document.activeElement;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    render();

    const closeBtn = modal.querySelector("[data-close]");
    closeBtn && closeBtn.focus();
  }

  function closeGallery(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function next(){
    if (!images.length) return;
    index = (index + 1) % images.length;
    render();
  }

  function prev(){
    if (!images.length) return;
    index = (index - 1 + images.length) % images.length;
    render();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-open-gallery");
    if (!btn) return;

    let imgs = [];
    try { imgs = JSON.parse(btn.dataset.images || "[]"); } catch {}
    if (!imgs.length) return;

    openGallery({
      title: btn.dataset.title,
      sub: btn.dataset.sub,
      imgs
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeGallery();
  });

  nextBtn && nextBtn.addEventListener("click", next);
  prevBtn && prevBtn.addEventListener("click", prev);

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;

    if (e.key === "Escape") closeGallery();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  let startX = null;
  const frame = modal.querySelector(".gallery-frame");
  frame && frame.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, {passive:true});
  frame && frame.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    startX = null;

    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
  }, {passive:true});
})();