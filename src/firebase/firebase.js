import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	deleteUser,
} from "firebase/auth"

const firebaseConfig = {
	apiKey: "AIzaSyCWYIadgpZo-7gY1_VBjP_rCTBSC8dH9X0",
	authDomain: "fir-learning-a0d0d.firebaseapp.com",
	projectId: "fir-learning-a0d0d",
	storageBucket: "fir-learning-a0d0d.appspot.com",
	messagingSenderId: "698102441841",
	appId: "1:698102441841:web:27d74eb52cc99cd03978d0",
	measurementId: "G-NN0MVB5SLT",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const user = auth.currentUser
const db = getFirestore(app)
const storage = getStorage(app)

const logInWithEmailAndPassword = async (email, password) => {
	return await signInWithEmailAndPassword(auth, email, password)
}

const registerWithEmailAndPassword = async (email, password) => {
	return await createUserWithEmailAndPassword(auth, email, password)
}

const deleteUserOwn = async () => {
	await deleteUser(user)
}

const logout = async () => {
	await signOut(auth)
}

export {
	auth,
	db,
	storage,
	logInWithEmailAndPassword,
	registerWithEmailAndPassword,
	logout,
	deleteUserOwn,
}
