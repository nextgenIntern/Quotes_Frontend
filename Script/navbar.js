async function loadNavbar() {
  try {
    const res = await fetch("navbar.html");
    document.getElementById("navbar-container").innerHTML = await res.text();
    setupNavbar();
  } catch (err) {
    console.error("Failed to load navbar:", err);
  }
}

function setupNavbar() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = localStorage.getItem("accessToken");

  const signupBtn = document.getElementById("signupBtn");
  const userMenu = document.getElementById("userMenu");
  const usernameText = document.getElementById("usernameText");
  const userAvatar = document.getElementById("userAvatar");
  // const userAvatarmobile = document.getElementById("userAvatarmobile");

  if (token && user) {
    signupBtn?.classList.add("d-none");
    userMenu?.classList.remove("d-none");

    usernameText.innerText = user.name || "User";
    // / Display username
    usernameText.innerText = user.name || "User";


    const avatar = user.avatar || "assets/images/default-avatar.png";
    if (userAvatar) userAvatar.src = avatar;
    // if (userAvatarmobile) userAvatarmobile.src = avatar;
  }

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  setActiveNav();
}

function setActiveNav() {
  const currentPage = location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href")?.toLowerCase();
    if (href === currentPage) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", loadNavbar);
