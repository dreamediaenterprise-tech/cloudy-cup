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

const cart={};
const orderItems=document.getElementById("orderItems");
const totalPrice=document.getElementById("totalPrice");
const orderSummary=document.getElementById("orderSummary");
const orderTotal=document.getElementById("orderTotal");

function render(category,target){
  const grid=document.getElementById(target);
  menu[category].forEach(item=>{
    cart[item.id]=0;
    grid.innerHTML+=`
      <div class="card">
        ${item.best?'<div class="badge">⭐ Best Seller</div>':''}
        <img src="${item.img}">
        <div class="card-body">
          <div>${item.name}</div>
          <div>₱${item.price}</div>
          <div class="qty">
            <button onclick="changeQty('${item.id}',-1)">−</button>
            <span id="${item.id}">0</span>
            <button onclick="changeQty('${item.id}',1)">+</button>
          </div>
        </div>
      </div>`;
  });
}

function changeQty(id,val){
  cart[id]=Math.max(0,cart[id]+val);
  document.getElementById(id).innerText=cart[id];
  updateOrder();
}

function updateOrder(){
  let total=0,summary="";
  orderItems.innerHTML="";
  Object.values(menu).flat().forEach(item=>{
    if(cart[item.id]>0){
      total+=cart[item.id]*item.price;
      summary+=`${cart[item.id]}x ${item.name}, `;
      orderItems.innerHTML+=`<div>${cart[item.id]}x ${item.name}</div>`;
    }
  });
  if(total===0) orderItems.innerText="No items yet. Add drinks from the menu ☁️";
  totalPrice.innerText=total;
  orderSummary.value=summary;
  orderTotal.value=total;
}

/* GCash auto show */
document.getElementById("paymentMethod").addEventListener("change",e=>{
  document.getElementById("gcashBox").style.display=
    e.target.value==="GCash"?"block":"none";
});

/* Success animation */
document.getElementById("orderForm").addEventListener("submit",()=>{
  document.getElementById("successMsg").style.display="block";
});

render("classic","classicGrid");
render("fruit","fruitGrid");
render("special","specialGrid");
