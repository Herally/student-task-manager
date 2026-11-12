// src/firebase/config.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyABqRg6EpEsTd49QwqGy299uQiudOZC7Lo",
  authDomain: "student-task-manager-44edc.firebaseapp.com",
  projectId: "student-task-manager-44edc",
  storageBucket: "student-task-manager-44edc.firebasestorage.app",
  messagingSenderId: "957088879468",
  appId: "1:957088879468:web:8f75ddecf10893c2d29949",
  measurementId: "G-3ZKRL5GN9R"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
