import { auth, db } from "../shared/firebase.js";
import { protectAdminPage } from "../shared/admin-guard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const table = document.getElementById("usersTable");
const searchInput = document.getElementById("userSearch");
const visibleCount = document.getElementById("visibleCount");
const message = document.getElementById("usersMessage");
let allUsers = [];

protectAdminPage(async (user) => {
    document.getElementById("adminEmail").textContent = user.email;
    await loadUsers();
});

async function loadUsers() {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        allUsers = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        allUsers.sort((a, b) => {
            const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        });
        renderUsers(allUsers);
    } catch (error) {
        console.error(error);
        table.innerHTML = '<tr><td colspan="4" class="table-empty">Unable to load users. Check Firestore rules.</td></tr>';
        message.textContent = error.message;
        message.className = "form-message error";
    }
}

function renderUsers(users) {
    table.innerHTML = "";
    visibleCount.textContent = users.length;

    if (users.length === 0) {
        table.innerHTML = '<tr><td colspan="4" class="table-empty">No matching users found.</td></tr>';
        return;
    }

    users.forEach((user) => {
        const row = document.createElement("tr");

        const userCell = document.createElement("td");
        const userInfo = document.createElement("div");
        userInfo.className = "table-user";

        if (user.imageUrl) {
            const image = document.createElement("img");
            image.className = "table-avatar table-photo";
            image.src = user.imageUrl;
            image.alt = "Profile";
            image.referrerPolicy = "no-referrer";
            userInfo.appendChild(image);
        } else {
            const avatar = document.createElement("span");
            avatar.className = "table-avatar";
            avatar.textContent = (user.name || user.email || "U").charAt(0).toUpperCase();
            userInfo.appendChild(avatar);
        }

        const name = document.createElement("span");
        name.textContent = user.name || "Unnamed user";
        userInfo.appendChild(name);
        userCell.appendChild(userInfo);

        const email = document.createElement("td");
        email.textContent = user.email || "—";
        const contact = document.createElement("td");
        contact.textContent = user.contactNo || "—";
        const joined = document.createElement("td");
        joined.textContent = user.createdAt?.toDate
            ? user.createdAt.toDate().toLocaleDateString()
            : "—";

        row.append(userCell, email, contact, joined);
        table.appendChild(row);
    });
}

searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    const filtered = allUsers.filter((user) =>
        [user.name, user.email, user.contactNo]
            .some((value) => String(value || "").toLowerCase().includes(term))
    );
    renderUsers(filtered);
});

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
