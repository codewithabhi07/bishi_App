import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    updateProfile,
    signOut
} from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authSection = document.getElementById('auth-section');
    const appShell = document.getElementById('app-shell');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    // Toggle Forms
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Monitor Auth State
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userData = {
                name: user.displayName || 'User',
                email: user.email,
                uid: user.uid
            };
            await Store.setCurrentUser(userData);
            initApp(userData);
        } else {
            await Store.logout();
            authSection.classList.remove('hidden');
            appShell.classList.add('hidden');
        }
    });

    // Handle Registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            UI.showToast('Registration successful!');
            registerForm.reset();
        } catch (error) {
            console.error("Auth Error Code:", error.code);
            console.error("Auth Error Message:", error.message);
            
            let userMessage = error.message;
            switch (error.code) {
                case 'auth/operation-not-allowed':
                    userMessage = 'Registration is currently disabled. Please enable Email/Password in Firebase Console.';
                    break;
                case 'auth/weak-password':
                    userMessage = 'Password should be at least 6 characters.';
                    break;
                case 'auth/email-already-in-use':
                    userMessage = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    userMessage = 'Please enter a valid email address.';
                    break;
            }
            UI.showToast(userMessage, 'error');
        }
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            UI.showToast('Login successful!');
        } catch (error) {
            UI.showToast('Invalid email or password', 'error');
        }
    });

    // Handle Logout
    document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            location.reload();
        } catch (error) {
            UI.showToast('Logout failed', 'error');
        }
    });

    async function initApp(user) {
        authSection.classList.add('hidden');
        appShell.classList.remove('hidden');
        document.getElementById('user-display-name').textContent = user.name;
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
        
        // Load initial dashboard
        if (window.Dashboard) await window.Dashboard.render();
        if (window.Groups) await window.Groups.updateDropdowns();
    }
});
