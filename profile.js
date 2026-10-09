
requireLogin();

if (!me) {
    throw new Error("Please sign in first.");
}

let navUsername = document.getElementById("navUsername");

if (navUsername) navUsername.textContent = me.name;

let logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
        event.preventDefault();
        logout();
    });
}

document.getElementById("profilePic").src = pic(me.username);
document.getElementById("name").textContent = me.name;
document.getElementById("profileUsername").textContent = "@" + me.username;
document.getElementById("phone").textContent = me.phone;
document.getElementById("email").textContent = me.email;
document.getElementById("city").textContent = me.city;

let html = "";

me.friends.forEach(username => {
    let friend = getUser(username);
    if (!friend) return;

    let rating = me.ratings[username]
        ? ratingIcons[me.ratings[username] - 1]
        : "Not rated";

    html += `<div class="col-md-4 col-sm-6">
        <div class="content-card h-100 p-3">
            <div class="d-flex align-items-center gap-3">
                <img class="profile-picture" src="${pic(username)}" alt="${safe(friend.name)}">
                <div>
                    <h3 class="h6 mb-1">${safe(friend.name)}</h3>
                    <small class="text-secondary">Last login ${timeAgo(friend.lastLogin)}</small>
                </div>
            </div>
            <span class="badge bg-primary mt-3">${safe(rating)}</span>
        </div>
    </div>`;
});

document.getElementById("profileFriends").innerHTML = html ||
    `<p class="text-secondary">No friends yet.</p>`;
