
if (me) {
    location.href = "home.html";
}

function login(event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim().toLowerCase();
    let password = document.getElementById("password").value;

    if (!username || !password) {
        showMsg("errorMessage", "Please enter username and password.", true);
        return;
    }

    let user = getUser(username);

    if (!user || user.password !== password) {
        showMsg("errorMessage", "Invalid username or password.", true);
        return;
    }

    user.lastLogin = Date.now();
    save();

    localStorage.setItem("cfUser", username);
    location.href = "home.html";
}

let loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", login);
}

let togglePassword = document.getElementById("togglePassword");

if (togglePassword) {
    togglePassword.addEventListener("click", function() {
        let password = document.getElementById("password");
        let icon = this.querySelector("i");

        if (password.type === "password") {
            password.type = "text";
            if (icon) icon.className = "bi bi-eye-slash";
        } else {
            password.type = "password";
            if (icon) icon.className = "bi bi-eye";
        }
    });
}
