// Cloudy Cup — Premium Upgrade (Frontend + Formspree)
// - Tabs per category (classic/fruit/special)
// - Proper cart state (no reset bug)
// - Order panel editable quantities
// - Top total pill + mobile sticky total bar
// - Safer submit: prevent empty cart, loading state, success modal

const menu = {
  classic:[
    {id:"c1",name:"Classic Milk Tea",price:120,img:"https://i.pinimg.com/736x/81/a4/bb/81a4bbf789dc005db307140990fcad69.jpg",best:true},
    {id:"c2",name:"Okinawa Milk Tea",price:130,img:"https://i.pinimg.com/736x/72/66/72/72667205ea25dc997e87498cc901bc37.jpg"},
    {id:"c3",name:"Wintermelon Milk Tea",price:130,img:"https://i.pinimg.com/736x/9a/db/bc/9adbbc8830c87faccba32e116bcab548.jpg"},
    {id:"c4",name:"Hokkaido Milk Tea",price:140,img:"https://ricelifefoodie.com/wp-content/uploads/2024/10/ice-cold-Hokkaido-Milk-Tea-with-boba-.jpg"}
  ],
  fruit:[
    {id:"f1",name:"Strawberry Fruit Tea",price:150,img:"https://i.pinimg.com/736x/ca/6e/c6/ca6ec6e5f2f247098ed5e202a0788611.jpg",best:true},
    {id:"f2",name:"Mango Fruit Tea",price:150,img:"https://i.pinimg.com/736x/ef/23/56/ef2356d569cac198828b3d31da13451f.jpg"},
    {id:"f3",name:"Lychee Fruit Tea",price:150,img:"https://i.pinimg.com/1200x/90/af/5d/90af5dc00b32a1e86d6370e942f523bb.jpg"},
    {id:"f4",name:"Passion Fruit Tea",price:150,img:"https://i.pinimg.com/1200x/18/1a/3a/181a3ae06cfe574f82c55bf0a6a81828.jpg"}
  ],
  special:[
    {id:"s1",name:"Chocolate Milk Tea",price:150,img:"https://i.pinimg.com/736x/0a/34/4c/0a344cfabbe54777fb3b1ff22405507c.jpg"},
    {id:"s2",name:"Oreo Milk Tea",price:160,img:"https://i.pinimg.com/736x/31/db/23/31db23ad8c64cae681a26af9ebd1a107.jpg",best:true},
    {id:"s3",name:"Matcha Milk Tea",price:160,img:"https://i.pinimg.com/736x/9b/73/b4/9b73b43031facd0621bb2630d201e23b.jpg"},
    {id:"s4",name:"Taro Milk Tea",price:150,img:"https://i.pinimg.com/736x/e5/9d/e6/e59de61513e3543bdf3f46b3c18459be.jpg"}
  ]
};

// cart: id -> qty
const cart = {};

// DOM
const menuGrid = document.getElementById("menuGrid");
const orderItems = document.getElementById("orderItems");
const emptyMsg = document.getElementById("emptyMsg");

const totalPrice = document.getElementById("totalPrice");
const topTotalBtn = document.getElementById("topTotalBtn");
const topTotal = document.getElementById("topTotal");
const topCount = document.getElementById("topCount");

const mobileTotal = document.getElementById("mobileTotal");
const mobileCount = document.getElementById("mobileCount");
const mobileGoOrder = document.getElementById("mobileGoOrder");

const paymentMethod = document.getElementById("paymentMethod");
const gcashBox = document.getElementById("gcashBox");

const orderSummary = document.getElementById("orderSummary");
const orderTotal = document.getElementById("orderTotal");

const orderForm = document.getElementById("orderForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");
const errorMsg = document.getElementById("errorMsg");

const successModal = document.getElementById("successModal");
const modalSummary = document.getElementById("modalSummary");
const modalTotal = document.getElementById("modalTotal");
const modalBrowse = document.getElementById("modalBrowse");
const modalClose = document.getElementById("modalClose");

let activeTab = "classic";

// helpers
function peso(n){ return (Number(n)||0).toLocaleString("en-PH"); }

function getAllItems(){
  return Object.values(menu).flat();
}
function findById(id){
  return getAllItems().find(x => x.id === id);
}
function getQty(id){
  return cart[id] || 0;
}
function setQty(id, qty){
  const v = Math.max(0, Number(qty)||0);
  if(v === 0) delete cart[id];
  else cart[id] = v;
}
function add(id){ setQty(id, getQty(id)+1); }
function sub(id){ setQty(id, getQty(id)-1); }

function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function cartTotal(){
  let t = 0;
  for(const id of Object.keys(cart)){
    const item = findById(id);
    if(!item) continue;
    t += item.price * cart[id];
  }
  return t;
}
function buildSummary(){
  const parts = [];
  for(const id of Object.keys(cart)){
    const item = findById(id);
    if(!item) continue;
    parts.push(`${cart[id]}x ${item.name} (₱${item.price})`);
  }
  return parts.join(" | ");
}

// UI render
function renderTabs(){
  const tabs = document.getElementById("tabs");
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if(!btn) return;

    document.querySelectorAll(".tab").forEach(t=>{
      t.classList.remove("active");
      t.setAttribute("aria-selected","false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected","true");

    activeTab = btn.dataset.tab;
    renderMenu();
  });
}

function renderMenu(){
  const list = menu[activeTab] || [];
  menuGrid.innerHTML = list.map(item => {
    const q = getQty(item.id);
    return `
      <div class="card">
        <div class="cardMedia">
          ${item.best ? `<div class="badge">⭐ Best Seller</div>` : ``}
          <img src="${item.img}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cardBody">
          <div class="cardName">${item.name}</div>
          <div class="cardPrice">₱${peso(item.price)}</div>
          <div class="cardQty">
            <button class="qtyBtn" data-act="minus" data-id="${item.id}" ${q===0 ? "disabled" : ""}>−</button>
            <div class="qtyCount" id="qty-${item.id}">${q}</div>
            <button class="qtyBtn" data-act="plus" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // bind
  menuGrid.querySelectorAll(".qtyBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      if(act === "plus") add(id);
      if(act === "minus") sub(id);
      updateUI();
      renderMenu(); // refresh disabled state
    });
  });
}

function renderOrderPanel(){
  const ids = Object.keys(cart);

  if(ids.length === 0){
    emptyMsg.hidden = false;
    orderItems.innerHTML = `<div class="empty" id="emptyMsg">No items yet. Add drinks from the menu ☁️</div>`;
    return;
  }

  emptyMsg.hidden = true;

  orderItems.innerHTML = ids.map(id=>{
    const item = findById(id);
    const qty = getQty(id);
    const subtotal = (item?.price||0) * qty;

    return `
      <div class="lineItem">
        <div class="lineLeft">
          <div class="lineName">${item?.name || id}</div>
          <div class="lineSub">₱${peso(item?.price||0)} × ${qty} = <b>₱${peso(subtotal)}</b></div>
        </div>

        <div class="qtyPill">
          <button class="qBtn" data-line="minus" data-id="${id}" ${qty===0?"disabled":""}>−</button>
          <div class="qVal">${qty}</div>
          <button class="qBtn" data-line="plus" data-id="${id}">+</button>
        </div>
      </div>
    `;
  }).join("");

  orderItems.querySelectorAll(".qBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const act = btn.dataset.line;
      if(act === "plus") add(id);
      if(act === "minus") sub(id);
      updateUI();
      renderMenu();
    });
  });
}

function updateTotals(){
  const total = cartTotal();
  const count = cartCount();

  totalPrice.textContent = peso(total);
  topTotal.textContent = peso(total);
  topCount.textContent = String(count);

  mobileTotal.textContent = peso(total);
  mobileCount.textContent = String(count);

  orderSummary.value = buildSummary();
  orderTotal.value = `₱${peso(total)}`;
}

function updateUI(){
  updateTotals();
  renderOrderPanel();
}

function goToOrder(){
  document.querySelector("#order")?.scrollIntoView({ behavior:"smooth", block:"start" });
}
function goToMenu(){
  document.querySelector("#menu")?.scrollIntoView({ behavior:"smooth", block:"start" });
}

// Payment show/hide
paymentMethod.addEventListener("change", (e)=>{
  const isGCash = e.target.value === "GCash";
  gcashBox.hidden = !isGCash;
});

// Top / Mobile buttons
topTotalBtn.addEventListener("click", goToOrder);
mobileGoOrder.addEventListener("click", goToOrder);

// Modal
function openModal(summary, total){
  modalSummary.textContent = summary || "—";
  modalTotal.textContent = `₱${peso(total)}`;
  successModal.hidden = false;
  successModal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  successModal.hidden = true;
  successModal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
successModal.addEventListener("click", (e)=>{
  if(e.target?.getAttribute?.("data-close")) closeModal();
});
modalClose.addEventListener("click", closeModal);
modalBrowse.addEventListener("click", ()=>{
  closeModal();
  goToMenu();
});

// Submit (AJAX Formspree)
orderForm.addEventListener("submit", (e)=>{
  e.preventDefault();

  successMsg.hidden = true;
  errorMsg.hidden = true;

  if(cartCount() === 0){
    alert("Add at least 1 drink first ☁️🧋");
    goToMenu();
    return;
  }

  updateUI();

  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  const totalBefore = cartTotal();
  const summaryBefore = buildSummary();

  const data = new FormData(orderForm);

  fetch(orderForm.action, {
    method: "POST",
    body: data,
    headers: { "Accept": "application/json" }
  })
  .then(res=>{
    if(res.ok){
      successMsg.hidden = false;

      // Clear cart
      for(const k of Object.keys(cart)) delete cart[k];

      orderForm.reset();
      gcashBox.hidden = true;

      updateUI();
      renderMenu();

      openModal(summaryBefore, totalBefore);

      setTimeout(()=>{ successMsg.hidden = true; }, 2000);
    }else{
      errorMsg.hidden = false;
    }
  })
  .catch(()=>{
    errorMsg.hidden = false;
  })
  .finally(()=>{
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  });
});

// init
renderTabs();
renderMenu();
updateUI();
