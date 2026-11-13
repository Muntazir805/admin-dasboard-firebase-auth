import { auth } from "./shared/firebase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const form = document.getElementById("resetForm");
const email = document.getElementById("email");
const button = document.getElementById("resetBtn");
const message = document.getElementById("resetMessage");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    message.textContent = "";
    try {
        await sendPasswordResetEmail(auth, email.value.trim());
        message.textContent = "If an account exists for this email, a reset link has been sent.";
        message.className = "form-message success";
        form.reset();
    } catch (error) {
        message.textContent = error.message;
        message.className = "form-message error";
    } finally {
        button.disabled = false;
    }
});
