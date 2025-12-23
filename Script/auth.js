document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {
    const signupBtn = document.getElementById("signupBtn");
    const userMenu = document.getElementById("userMenu");
    const usernameText = document.getElementById("usernameText");
    const logoutBtn = document.getElementById("logoutBtn");

    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      signupBtn.style.display = "none";
      userMenu.style.display = "block";
      usernameText.textContent = user.username;
    } else {
      signupBtn.style.display = "block";
      userMenu.style.display = "none";
    }

    signupBtn?.addEventListener("click", () => {
      window.location.href = "signup.html";
    });

    logoutBtn?.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });

  }, 100); // wait for navbar injection

});
