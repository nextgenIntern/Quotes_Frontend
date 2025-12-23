const API_BASE = "http://140.245.5.153:8001/api";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const msgEl = document.getElementById("msg");

  // Clear previous messages
  msgEl.classList.remove("text-success", "text-danger");
  msgEl.textContent = "Logging in...";

  try {
    const payload = {
      username: username,  // or email if your backend uses email for login
      password: password
    };

    console.log("Login payload:", payload);

    // Call /api/token/ endpoint
    const res = await fetch(`${API_BASE}/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    console.log("Login response:", res.status, data);

    if (!res.ok) {
      // Handle specific errors from Django REST
      let errorMsg = "Login failed. Please check your credentials.";

      if (data.detail) {
        errorMsg = data.detail;
      } else if (data.non_field_errors) {
        errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(" ") : data.non_field_errors;
      } else if (data.username || data.email) {
        errorMsg = (data.username || data.email || []).join(" ");
      }

      msgEl.classList.add("text-danger");
      msgEl.textContent = errorMsg;
      return;
    }

    // Success! Store tokens and user data
    const accessToken = data.access;
    const refreshToken = data.refresh;

    const userData = {
      name: username,
      email: username,  // update this if backend returns actual email
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0D8ABC&color=fff`,
      accessToken: accessToken,
      refreshToken: refreshToken
    };

    // Store in localStorage for navbar/profile use
    localStorage.setItem("loggedInUser", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    msgEl.classList.add("text-success");
    msgEl.textContent = "Login successful! Redirecting...";

    // Redirect to home
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (err) {
    console.error("Login error:", err);
    msgEl.classList.add("text-danger");
    msgEl.textContent = "Network error. Please check your connection.";
  }
});
