import { auth, db } from "../shared/firebase.js";
import { protectAdminPage } from "../shared/admin-guard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
    serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const form = document.getElementById("categoryForm");
const nameInput = document.getElementById("categoryName");
const table = document.getElementById("categoryTable");
const total = document.getElementById("categoryTotal");
const count = document.getElementById("categoryCount");
const message = document.getElementById("categoryMessage");
const saveButton = document.getElementById("saveCategoryBtn");
const cancelButton = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");

let editingId = null;
let categories = [];

protectAdminPage(async (user) => {
    document.getElementById("adminEmail").textContent = user.email;
    await loadCategories();
});

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `form-message ${type}`;
}

async function loadCategories() {
    try {
        const snapshot = await getDocs(query(collection(db, "Category"), orderBy("createdAt", "desc")));
        categories = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        renderCategories();
    } catch (error) {
        console.error(error);
        table.innerHTML = '<tr><td colspan="4" class="table-empty">Unable to load categories. Check Firestore rules.</td></tr>';
        showMessage(error.message);
    }
}

function renderCategories() {
    table.innerHTML = "";
    total.textContent = categories.length;
    count.textContent = categories.length;

    if (categories.length === 0) {
        table.innerHTML = '<tr><td colspan="4" class="table-empty">No categories yet. Add your first category above.</td></tr>';
        return;
    }

    categories.forEach((category, index) => {
        const row = document.createElement("tr");
        const number = document.createElement("td");
        number.textContent = index + 1;

        const name = document.createElement("td");
        name.textContent = category.categoryName || "Untitled category";

        const created = document.createElement("td");
        created.textContent = category.createdAt?.toDate
            ? category.createdAt.toDate().toLocaleDateString()
            : "—";

        const actions = document.createElement("td");
        actions.className = "align-right";
        const edit = document.createElement("button");
        edit.className = "action-btn edit-btn";
        edit.type = "button";
        edit.innerHTML = '<i class="fa-regular fa-pen-to-square"></i><span>Edit</span>';
        edit.addEventListener("click", () => startEdit(category));

        const remove = document.createElement("button");
        remove.className = "action-btn delete-btn";
        remove.type = "button";
        remove.innerHTML = '<i class="fa-regular fa-trash-can"></i><span>Delete</span>';
        remove.addEventListener("click", () => removeCategory(category));

        actions.append(edit, remove);
        row.append(number, name, created, actions);
        table.appendChild(row);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const categoryName = nameInput.value.trim();

    if (!categoryName) {
        showMessage("Please enter a category name.");
        return;
    }

    const duplicate = categories.some((item) =>
        item.categoryName?.toLowerCase() === categoryName.toLowerCase() &&
        item.id !== editingId
    );
    if (duplicate) {
        showMessage("A category with this name already exists.");
        return;
    }

    saveButton.disabled = true;
    try {
        if (editingId) {
            await updateDoc(doc(db, "Category", editingId), {
                categoryName,
                updatedAt: serverTimestamp()
            });
            showMessage("Category updated successfully.", "success");
        } else {
            await addDoc(collection(db, "Category"), {
                categoryName,
                createdAt: serverTimestamp()
            });
            showMessage("Category added successfully.", "success");
        }
        resetForm();
        await loadCategories();
    } catch (error) {
        console.error(error);
        showMessage(error.message);
    } finally {
        saveButton.disabled = false;
    }
});

function startEdit(category) {
    editingId = category.id;
    nameInput.value = category.categoryName || "";
    formTitle.textContent = "Edit category";
    saveButton.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';
    cancelButton.classList.remove("hidden");
    nameInput.focus();
}

function resetForm() {
    editingId = null;
    form.reset();
    formTitle.textContent = "Add a category";
    saveButton.innerHTML = '<i class="fa-solid fa-plus"></i> Add category';
    cancelButton.classList.add("hidden");
}

cancelButton.addEventListener("click", resetForm);

async function removeCategory(category) {
    const confirmed = window.confirm(`Delete "${category.categoryName}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "Category", category.id));
        if (editingId === category.id) resetForm();
        showMessage("Category deleted successfully.", "success");
        await loadCategories();
    } catch (error) {
        console.error(error);
        showMessage(error.message);
    }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.replace("../index.html");
});

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");
document.getElementById("menuBtn").addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
});
overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
});
