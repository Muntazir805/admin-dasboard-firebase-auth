import { auth } from "./firebase.js";
import { ADMIN_EMAIL } from "./admin-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

export function protectAdminPage(onAllowed) {
    onAuthStateChanged(auth, (user) => {
        const isAdmin = user &&
            user.email &&
            user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
            user.emailVerified;

        if (!isAdmin) {
            window.location.replace("../index.html");
            return;
        }

        if (typeof onAllowed === "function") {
            onAllowed(user);
        }
    });
}
