import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';

const firebaseConfig = {
    // TODO: Add your Firebase configuration here
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
    // apiKey: "AIzaSyA4D6mUpt98kdKtdGy0DqHoY2W09KQI46Y",
    // authDomain: "chat-app-f401b.firebaseapp.com",
    // projectId: "chat-app-f401b",
    // storageBucket: "chat-app-f401b.appspot.com",
    // messagingSenderId: "1042363916345",
    // appId: "1:1042363916345:web:28355cda3e23fce360ede8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();

        const { user } = await signInWithPopup(auth, provider);

        return { uid: user.uid, displayName: user.displayName, avatar: user.photoURL };
    } catch (error) {
        if (error.code !== 'auth/cancelled-popup-request') {
            console.error(error);
        }
        return null;
    }
}

//addDoc(collection(db, 'chats', roomId, 'messages'), { timestamp: serverTimestamp(),  text, user });
async function sendMessage(roomId, user, text) {
    try {
        await addDoc(collection(db, 'chats', roomId, 'messages'), {
            uid: user.uid,
            text: text.trim(),
            timestamp: serverTimestamp(),
            user
        });
    } catch (error) {
        console.error(error);
    }
}

function getMessages(roomId, callback) {
    return onSnapshot(
        query(
            collection(db, 'chats', roomId, 'messages'),
            orderBy('timestamp', 'asc')
        ),
        (querySnapshot) => {
            const messages = querySnapshot.docs.map((x) => ({
                id: x.id,
                ...x.data(),
            }));

            callback(messages);
        }
    );
}

export { loginWithGoogle, sendMessage, getMessages };
