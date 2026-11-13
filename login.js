import { auth } from "./shared/firebase.js";
import { ADMIN_EMAIL } from "./shared/admin-config.js";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const googleBtn = document.getElementById("googleBtn");
const message = document.getElementById("loginMessage");

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `form-message ${type}`;
}

function goToAdmin(user) {
    if (
        user &&
        user.email &&
        user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        user.emailVerified
    ) {
        window.location.replace("admin/index.html");
        return true;
    }
    return false;
}

// If the administrator is already signed in, skip the login page.
onAuthStateChanged(auth, (user) => {
    if (user) goToAdmin(user);
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    showMessage("");

    try {
        const result = await signInWithEmailAndPassword(
            auth,
            emailInput.value.trim(),
            passwordInput.value
        );

        if (!result.user.emailVerified) {
            await signOut(auth);
            showMessage("Please verify your email address before signing in.");
            return;
        }

        if (!goToAdmin(result.user)) {
            await signOut(auth);
            showMessage("This account does not have administrator access.");
        }
    } catch (error) {
        showMessage(error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Sign in</span><i class="fa-solid fa-arrow-right"></i>';
    }
});

googleBtn.addEventListener("click", async () => {
    googleBtn.disabled = true;
    showMessage("");
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (!goToAdmin(result.user)) {
            await signOut(auth);
            showMessage("This Google account is not the configured administrator account.");
        }
    } catch (error) {
        showMessage(error.message);
    } finally {
        googleBtn.disabled = false;
    }
});

document.getElementById("togglePassword").addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    document.querySelector("#togglePassword i").className =
        isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
});
