import{
    auth , 
    googleProvider
} from "./firebase";
import {
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';

export const authService = {
    async signInWithGoogle() {
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    },
    //Signup
    async signUp(email, password, name) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        return result.user;
    },
    // Emai/Password Signin
    async signIn(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    },
    async signOut() {
        await signOut(auth);
    },
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    },
    getCurrentUser() {
        return auth.currentUser;
    }
};