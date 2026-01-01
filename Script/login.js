// login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return; // ✅ VERY IMPORTANT

  const msgEl = document.getElementById("msg");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;

    msgEl.className = "";
    msgEl.textContent = "Logging in...";

    if (!username || !password) {
      msgEl.classList.add("text-danger");
      msgEl.textContent = "Username and password required";
      return;
    }

    try {
      console.log("Login payload:", { username });

      const res = await fetch(API.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json().catch(() => ({}));
      console.log("Login response:", res.status, data);

      if (!res.ok) {
        msgEl.classList.add("text-danger");
        msgEl.textContent =
          data.detail ||
          data.non_field_errors?.join(" ") ||
          "Invalid credentials";
        return;
      }

      // ✅ SAVE TOKENS
      saveTokens(data.access, data.refresh);

      // ✅ LOG TOKEN EXPIRY (VERY IMPORTANT)
      logTokenExpiry(data.access);

      // ✅ SAVE USER FOR NAVBAR
      localStorage.setItem("loggedInUser", JSON.stringify({
        name: username,
        email: username,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`
      }));

      msgEl.classList.add("text-success");
      msgEl.textContent = "Login successful! Redirecting...";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);

    } catch (err) {
      console.error("Login error:", err);
      msgEl.classList.add("text-danger");
      msgEl.textContent = "Network error. Try again.";
    }
  });
});

/* ================= TOKEN EXPIRY LOGGER ================= */
function logTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = new Date(payload.exp * 1000);
    console.log("Access token expires at:", exp.toLocaleString());
  } catch {
    console.warn("Could not decode token expiry");
  }
}
// 👁 Password toggle
  const toggle = document.getElementById("togglePassword");
  toggle?.addEventListener("click", () => {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
  });



