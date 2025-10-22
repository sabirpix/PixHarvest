// admin.js - admin & owner helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, onValue, update, set, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

let app, auth, db;
export function initFirebase(){ if(app) return; app = initializeApp(firebaseConfig); auth = getAuth(app); db = getDatabase(app); }

export const adminAuth = {
  async signIn(email, pass){
    if(!auth) initFirebase();
    await signInWithEmailAndPassword(auth, email, pass);
  },
  async signOut(){
    if(!auth) initFirebase();
    await signOut(auth);
  }
};

export function listenOrders(cb){
  if(!db) initFirebase();
  onValue(ref(db,'orders'), snap=>{
    const val = snap.val() || {};
    const arr = Object.entries(val).map(([id,data])=>({ id, ...data }));
    arr.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
    cb(arr);
  });
}

export async function updateOrderStatus(orderId, status){
  if(!db) initFirebase();
  await update(ref(db, 'orders/' + orderId), { status, updatedAt: Date.now() });
}

export function listenUsers(cb){
  if(!db) initFirebase();
  onValue(ref(db,'users'), snap=>{
    const val = snap.val() || {};
    const arr = Object.entries(val).map(([uid,data])=>({ uid, ...data }));
    cb(arr);
  });
}

export async function setRoleByEmail(email, role){
  if(!db) initFirebase();
  const usersSnap = await get(ref(db,'users'));
  const users = usersSnap.val() || {};
  for(const uid in users){
    const data = users[uid];
    if(data && data.email === email){
      await update(ref(db,'users/' + uid), { role });
      return true;
    }
  }
  return false;
}

export async function approveAdminRequest(requestId){
  if(!db) initFirebase();
  const reqSnap = await get(ref(db,'adminRequests/' + requestId));
  if(!reqSnap.exists()) return false;
  const { uid } = reqSnap.val();
  await update(ref(db,'users/' + uid), { role: 'admin' });
  await set(ref(db,'adminRequests/' + requestId), null);
  return true;
}

export async function denyAdminRequest(requestId){
  if(!db) initFirebase();
  await set(ref(db,'adminRequests/' + requestId), null);
  return true;
}
