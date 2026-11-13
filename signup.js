import { auth, db } from "./shared/firebase.js";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const imageInput = document.getElementById("image");
const preview = document.getElementById("imagePreview");
const signupBtn = document.getElementById("signupBtn");
const message = document.getElementById("signupMessage");

let selectedImage = null;

// Cloudinary unsigned upload settings. Set these if you want profile photos.
// Create an unsigned upload preset in Cloudinary; never put an API secret here.
const CLOUDINARY_NAME = "ppiny588";
const CLOUDINARY_UPLOAD_PRESET = "StorageBucket";

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `form-message ${type}`;
}

imageInput.addEventListener("change", () => {
    selectedImage = imageInput.files[0] || null;
    if (!selectedImage) {
        preview.style.display = "none";
        return;
    }
    if (!selectedImage.type.startsWith("image/")) {
        showMessage("Please choose an image file.");
        imageInput.value = "";
        selectedImage = null;
        return;
    }
    if (selectedImage.size > 5 * 1024 * 1024) {
        showMessage("Image size must be 5 MB or less.");
        imageInput.value = "";
        selectedImage = null;
        return;
    }
    preview.src = URL.createObjectURL(selectedImage);
    preview.style.display = "block";
});

async function uploadProfileImage() {
    if (!selectedImage) return "";

    if (CLOUDINARY_UPLOAD_PRESET.startsWith("REPLACE_")) {
        throw new Error("Set your Cloudinary unsigned upload preset, or remove the selected profile photo.");
    }

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Image upload failed.");
    return result.secure_url || "";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    signupBtn.disabled = true;
    signupBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';
    showMessage("");

    try {
        const email = document.getElementById("email").value.trim();
        const name = document.getElementById("name").value.trim();
        const contactNo = document.getElementById("contact").value.trim();
        const password = document.getElementById("password").value;

        if (password.length < 8) {
            throw new Error("Password must contain at least 8 characters.");
        }

        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        const imageUrl = await uploadProfileImage();

        // Never save the password in Firestore. Firebase Authentication stores it securely.
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email: user.email,
            contactNo,
            imageUrl,
            createdAt: serverTimestamp()
        });

        await sendEmailVerification(user);
        await signOut(auth);

        form.reset();
        preview.style.display = "none";
        selectedImage = null;
        showMessage("Account created. Check your email to verify it, then sign in.", "success");
    } catch (error) {
        showMessage(error.message);
    } finally {
        signupBtn.disabled = false;
        signupBtn.innerHTML = 'Create account <i class="fa-solid fa-arrow-right"></i>';
    }
});
