
// main.js - Firebase init & order helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue, get, child, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';
import { products } from './products.js';

let app, db;
export function initFirebase(){ if(app) return; app = initializeApp(firebaseConfig); db = getDatabase(app); }

export async function pushOrder(order){
  if(!db) initFirebase();
  const prod = products.find(p=>p.id===order.productId);
  if(prod){ order.productName = prod.name; order.price = prod.price; order.total = prod.price*order.quantity; }
  const ordersRef = ref(db,'orders');
  const newRef = push(ordersRef);
  await set(newRef, order);
  return newRef.key;
}

export async function getOrder(orderId){
  if(!db) initFirebase();
  const snapshot = await get(child(ref(db), `orders/${orderId}`));
  return snapshot.exists()? snapshot.val(): null;
}

export async function pushContact(contact){
  if(!db) initFirebase();
  const cRef = ref(db,'contacts');
  const newRef = push(cRef);
  await set(newRef, contact);
}

export function listenAllOrders(cb){
  if(!db) initFirebase();
  onValue(ref(db,'orders'), snap=>{
    const val = snap.val() || {};
    const arr = Object.entries(val).map(([id,data])=>({ id, ...data }));
    arr.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
    cb(arr);
  });
}

export function listenProducts(cb){
  if(!db) initFirebase();
  onValue(ref(db,'products'), snap=>{
    const val = snap.val() || {};
    const arr = Object.entries(val).map(([id,data])=>({ id, ...data }));
    cb(arr);
  });
}

export async function addProduct(prod){
  if(!db) initFirebase();
  const pRef = push(ref(db,'products'));
  await set(pRef, prod);
  return pRef.key;
}

export async function updateProduct(id, prod){
  if(!db) initFirebase();
  await update(ref(db, 'products/' + id), prod);
}

export async function deleteProduct(id){
  if(!db) initFirebase();
  await set(ref(db,'products/' + id), null);
            }
