function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function saveTokens(access, refresh) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);

  const decoded = parseJwt(access);
  console.log("🔐 Access Token:", access);
  console.log(
    "⏰ Access Token Expiry:",
    new Date(decoded.exp * 1000).toLocaleString()
  );
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function isTokenExpired(token) {
  const decoded = parseJwt(token);
  if (!decoded) return true;
  return decoded.exp < Date.now() / 1000;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  const res = await fetch(API.REFRESH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken })
  });

  const data = await res.json();
  saveTokens(data.access, refreshToken);
  return data.access;
}
