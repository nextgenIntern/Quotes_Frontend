document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault();

  axios.post("http://140.245.5.153:8001/api/signup/", {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  })
  .then(res => {
    document.getElementById("msg").innerText = "Signup successful! Please login.";
    window.location.href = "login.html";
  })
  .catch(err => {
    document.getElementById("msg").innerText =
      err.response?.data?.detail || "Signup failed";
  });
});
