// signup.js
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  if (!signupForm) return; // ✅ important

  const msgEl = document.getElementById("msg");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    msgEl.className = "";
    msgEl.textContent = "Creating account...";

    if (!username || !email || !password) {
      msgEl.classList.add("text-danger");
      msgEl.textContent = "All fields are required!";
      return;
    }

    try {
      const res = await fetch(API.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json().catch(() => ({}));
      console.log("Signup response:", data);

      if (!res.ok) {
        const errors = [];
        if (data.username) errors.push(data.username.join(" "));
        if (data.email) errors.push(data.email.join(" "));
        if (data.password) errors.push(data.password.join(" "));
        if (data.detail) errors.push(data.detail);

        msgEl.classList.add("text-danger");
        msgEl.textContent = errors.length ? errors.join(" | ") : "Signup failed";
        return;
      }

      // 🔹 If backend returns tokens (optional)
      if (data.access && data.refresh) {
        saveTokens(data.access, data.refresh);

        localStorage.setItem("loggedInUser", JSON.stringify({
          name: username,
          email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`
        }));

        msgEl.classList.add("text-success");
        msgEl.textContent = "Account created! Redirecting...";

        setTimeout(() => window.location.href = "index.html", 800);
      } else {
        // 🔹 Standard flow: go to login
        msgEl.classList.add("text-success");
        msgEl.textContent = "Account created! Please login.";

        setTimeout(() => window.location.href = "login.html", 1000);
      }

    } catch (err) {
      console.error("Signup error:", err);
      msgEl.classList.add("text-danger");
      msgEl.textContent = "Network error. Try again.";
    }
  });

  // 👁 Password toggle
  const toggle = document.getElementById("togglePassword");
  toggle?.addEventListener("click", () => {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
  });
});
