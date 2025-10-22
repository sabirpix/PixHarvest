// auth.js - handles signup/login/google and role requests
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, push, child, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

let app, auth, db;
function init(){ if(app) return; app = initializeApp(firebaseConfig); auth = getAuth(app); db = getDatabase(app); }

export function onAuthChange(cb){ init(); onAuthStateChanged(auth, cb); }

export async function signupEmail(email, password, displayName){
  init();
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await set(ref(db, 'users/' + userCred.user.uid), {
    email, displayName: displayName || '', role: 'user', createdAt: Date.now()
  });
  return userCred;
}

export async function loginEmail(email, password){
  init();
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function googleLogin(){
  init();
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function logout(){
  if(!auth) init();
  return await signOut(auth);
}

export async function requestAdminAccess(reason){
  init();
  const user = auth.currentUser;
  if(!user) throw new Error('Not signed in');
  const reqRef = push(ref(db,'adminRequests'));
  await set(reqRef, { uid: user.uid, email: user.email, reason: reason||'', createdAt: Date.now() });
  return reqRef.key;
}

export async function getRole(uid){
  init();
  const snap = await get(child(ref(db), 'users/' + uid));
  if(!snap.exists()) return null;
  return snap.val().role;
}
