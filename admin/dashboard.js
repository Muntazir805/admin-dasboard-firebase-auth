import { auth, db } from "../shared/firebase.js";
import { protectAdminPage } from "../shared/admin-guard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
    collection, getCountFromServer, getDocs
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const userCount = document.getElementById("userCount");
const categoryCount = document.getElementById("categoryCount");
const recentUsers = document.getElementById("recentUsers");
const dashboardMessage = document.getElementById("dashboardMessage");

protectAdminPage(async (user) => {
    document.getElementById("adminEmail").textContent = user.email;
    await loadDashboard();
});

async function loadDashboard() {
    try {
        const usersRef = collection(db, "users");
        const categoriesRef = collection(db, "Category");

        const [usersTotal, categoriesTotal, allUsersSnapshot] = await Promise.all([
            getCountFromServer(usersRef),
            getCountFromServer(categoriesRef),
            getDocs(usersRef)
        ]);

        userCount.textContent = usersTotal.data().count;
        categoryCount.textContent = categoriesTotal.data().count;
        recentUsers.innerHTML = "";

        const latestUsers = allUsersSnapshot.docs
            .map((documentSnapshot) => documentSnapshot.data())
            .sort((a, b) => {
                const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return dateB - dateA;
            })
            .slice(0, 5);

        if (latestUsers.length === 0) {
            recentUsers.innerHTML = '<tr><td colspan="4" class="table-empty">No users registered yet.</td></tr>';
            return;
        }

        latestUsers.forEach((user) => {
            const row = document.createElement("tr");

            const userCell = document.createElement("td");
            const userInfo = document.createElement("div");
            userInfo.className = "table-user";
            const avatar = document.createElement("span");
            avatar.className = "table-avatar";
            avatar.textContent = (user.name || user.email || "U").charAt(0).toUpperCase();
            const name = document.createElement("span");
            name.textContent = user.name || "Unnamed user";
            userInfo.append(avatar, name);
            userCell.appendChild(userInfo);

            const emailCell = document.createElement("td");
            emailCell.textContent = user.email || "—";
            const contactCell = document.createElement("td");
            contactCell.textContent = user.contactNo || "—";
            const dateCell = document.createElement("td");
            dateCell.textContent = user.createdAt?.toDate
                ? user.createdAt.toDate().toLocaleDateString()
                : "—";

            row.append(userCell, emailCell, contactCell, dateCell);
            recentUsers.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        dashboardMessage.textContent = "Could not load dashboard data. Check your Firestore rules and collection names.";
        dashboardMessage.className = "form-message error";
        userCount.textContent = "—";
        categoryCount.textContent = "—";
    }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.replace("../index.html");
});

setupMobileNavigation();

function setupMobileNavigation() {
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
}
