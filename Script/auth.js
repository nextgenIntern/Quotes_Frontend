// Script/auth.js

/* ================= TOKEN STORAGE ================= */

function saveTokens(access, refresh) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);

  console.log("✅ Access Token:", access);
  console.log("✅ Refresh Token:", refresh);
  logTokenExpiry(access);
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function clearAuth() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= TOKEN EXPIRY ================= */

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function logTokenExpiry(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return;

  const expiry = new Date(payload.exp * 1000);
  console.log("⏳ Token expires at:", expiry.toLocaleString());
}

/* ================= AUTO REFRESH ================= */

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return clearAuth();

  try {
    const res = await fetch(API.REFRESH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    saveTokens(data.access, refresh);
    return data.access;

  } catch (err) {
    console.error("❌ Token refresh failed");
    clearAuth();
  }
}

/* ================= AUTH FETCH (IMPORTANT) ================= */
async function authFetch(url, options = {}) {
  let token = getAccessToken();

  // 👇 ADD THIS
  console.log("🔐 authFetch token:", token);

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  let res = await fetch(url, options);

  // 👇 ADD THIS
  console.log("📡 API:", url, "STATUS:", res.status);

  if (res.status === 401) {
    console.warn("🔁 Token expired → refreshing");
    token = await refreshAccessToken();

    options.headers.Authorization = `Bearer ${token}`;
    res = await fetch(url, options);

    // 👇 ADD THIS
    console.log("🔁 Retry status:", res.status);
  }

  return res;
}

// d

/* ================= GLOBAL EXPORT ================= */
window.saveTokens = saveTokens;
window.authFetch = authFetch;
window.clearAuth = clearAuth;
