import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDurjQUu5IOWLwUMPWhz01xIc-W5CEqiLw",
  authDomain: "moto-dash-firebase.firebaseapp.com",
  projectId: "moto-dash-firebase",
  storageBucket: "moto-dash-firebase.firebasestorage.app",
  messagingSenderId: "297758440469",
  appId: "1:297758440469:web:f7c33ce5cef16c941a621c"
};

if (!firebaseConfig.projectId) {
  console.warn('[firebase] Fehlende Konfiguration. Bitte .env Variablen setzen')
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)

