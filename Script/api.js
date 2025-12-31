async function fetchWithAuth(url, options = {}) {
  let token = getAccessToken();

  if (!token || isTokenExpired(token)) {
    console.log("🔄 Token expired, refreshing...");
    token = await refreshAccessToken();
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}
