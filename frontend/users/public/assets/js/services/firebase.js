// TODO: Uncomment imports once firebaseConfig is filled in
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// TODO: Fill in Firebase project config from Firebase Console → Project Settings → Your apps
/* const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const app          = initializeApp(firebaseConfig);
export const auth  = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' }); */

// ─── Google Auth ─────────────────────────────────────
// Opens a Google sign-in popup and returns { name, email, phone, photo } on success,
// or null if the user closed/cancelled the popup.
export async function socialAuth() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const { user } = result;
        return {
            // uid:           user.uid,                        — Firebase-scoped user ID. Useful if using Firebase as your database.
            // emailVerified: user.emailVerified,              — Whether Google confirmed this email. Use on backend to reject unverified users.
            // createdAt:     user.metadata.creationTime,      — First time user signed into your app via Firebase (not their Google account creation date).
            // lastSignIn:    user.metadata.lastSignInTime,    — Last time they authenticated in your app.
            // accessToken:   result.credential?.accessToken,  — Lets you call Google APIs (Gmail, Drive, etc.) on behalf of the user.
            // idToken:       result.credential?.idToken,      — JWT to verify the user server-side. Send to backend to confirm identity.
            name:  user.displayName,
            email: user.email,
            phone: user.phoneNumber,
            photo: user.photoURL,
        };
    } catch (error) {
        if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
            return null;
        }
        throw error;
    }
}
