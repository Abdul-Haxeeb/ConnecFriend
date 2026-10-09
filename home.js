
requireLogin();

if (!me) {
    throw new Error("Please sign in first.");
}

let navUsername = document.getElementById("navUsername");

if (navUsername) {
    navUsername.textContent = me.name;
}

let welcomeHeading = document.getElementById("welcomeHeading");

if (welcomeHeading) {
    welcomeHeading.textContent = "Welcome, " + me.name + "!";
}

let logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
        event.preventDefault();
        logout();
    });
}

function myFriends() {
    return me.friends.map(getUser).filter(Boolean)
        .sort((a, b) => b.lastLogin - a.lastLogin);
}

function personRow(user, subtitle, actions) {
    return `<div class="d-flex align-items-center gap-2">
        <img class="profile-picture" src="${pic(user.username)}" alt="${safe(user.name)}">
        <div class="flex-grow-1">
            <div class="fw-semibold">${safe(user.name)}</div>
            <small class="text-secondary">${safe(subtitle)}</small>
        </div>
        ${actions || ""}
    </div>`;
}

function renderFriends() {
    let list = document.getElementById("friendList");
    let html = "";

    myFriends().forEach(friend => {
        let actions = `<button class="btn btn-sm btn-outline-primary mt-2" onclick="openChat('${friend.username}')">Message</button>`;

        html += `<li class="list-group-item">
            ${personRow(friend, "Last login " + timeAgo(friend.lastLogin), "")}
            <div class="d-flex flex-wrap gap-1 mt-2">`;

        ratingIcons.forEach((icon, i) => {
            let style = me.ratings[friend.username] === i + 1
                ? "btn-primary" : "btn-outline-primary";

            html += `<button class="btn btn-sm ${style}" onclick="rate('${friend.username}', ${i + 1})">${icon}</button>`;
        });

        html += `</div>${actions}</li>`;
    });

    list.innerHTML = html ||
        `<li class="list-group-item">No friends yet.</li>`;
}

function rate(username, value) {
    if (!me.friends.includes(username)) return;

    me.ratings[username] = value;
    save();
    renderFriends();
}

function renderShareOptions() {
    let area = document.getElementById("shareFriends");

    area.innerHTML = me.friends.map(username => {
        let friend = getUser(username);
        if (!friend) return "";

        return `<div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="share-${username}" value="${username}">
            <label class="form-check-label" for="share-${username}">${safe(friend.name)}</label>
        </div>`;
    }).join("");
}

function toggleShare() {
    let audience = document.getElementById("postAudience");
    let area = document.getElementById("shareFriends");

    area.hidden = audience.value !== "selected";
}

function shareNews(event) {
    event.preventDefault();

    let text = document.getElementById("postText").value.trim();
    let audience = document.getElementById("postAudience").value;
    let sharedWith = "all";

    if (!text) {
        showMsg("shareMessage", "Please write something before sharing.", true);
        return;
    }

    if (audience === "selected") {
        sharedWith = [...document.querySelectorAll("#shareFriends input:checked")]
            .map(input => input.value);

        if (sharedWith.length === 0) {
            showMsg("shareMessage", "Select at least one friend.", true);
            return;
        }
    }

    data.posts.push({
        id: Date.now(),
        author: me.username,
        text: text,
        time: Date.now(),
        sharedWith: sharedWith,
        likes: [],
        dislikes: []
    });

    save();
    document.getElementById("postText").value = "";
    document.getElementById("postAudience").value = "all";
    document.querySelectorAll("#shareFriends input").forEach(input => {
        input.checked = false;
    });

    toggleShare();
    showMsg("shareMessage", "Your update has been shared.", false);
    renderFeed();
}

function canSee(post) {
    if (post.author === me.username) return true;
    if (!me.friends.includes(post.author)) return false;

    return post.sharedWith === "all" ||
        (Array.isArray(post.sharedWith) &&
        post.sharedWith.includes(me.username));
}

function renderFeed() {
    let feed = document.getElementById("newsFeed");

    let posts = data.posts.filter(canSee).sort((a, b) => {
        let userA = getUser(a.author);
        let userB = getUser(b.author);

        if (!userA || !userB) return 0;

        return userB.lastLogin - userA.lastLogin || b.time - a.time;
    });

    let html = "";

    posts.forEach(post => {
        let author = getUser(post.author);
        if (!author) return;

        let audience = post.sharedWith === "all"
            ? "All friends"
            : post.sharedWith.map(username => {
                let friend = getUser(username);
                return friend ? friend.name : "";
            }).filter(Boolean).join(", ");

        html += `<article class="content-card feed-post">
            <div class="post-header">
                <img src="${pic(author.username)}" alt="${safe(author.name)}" class="profile-picture">
                <div class="post-person">
                    <h3>${safe(author.name)}</h3>
                    <p>Last login ${timeAgo(author.lastLogin)}</p>
                </div>
                <span class="post-type">Update</span>
            </div>

            <p class="post-content">${safe(post.text)}</p>
            <small class="text-secondary d-block mb-3">Posted ${timeAgo(post.time)} · ${safe(audience)}</small>

            <div class="post-reactions">
                ${reactionButton(post, "likes", "like", "Like", "bi-hand-thumbs-up")}
                ${reactionButton(post, "dislikes", "dislike", "Dislike", "bi-hand-thumbs-down")}
            </div>
        </article>`;
    });

    feed.innerHTML = html || `<p class="text-secondary">No updates to show yet.</p>`;
}

function reactionButton(post, type, label, text, icon) {
    let active = post[type].includes(me.username);

    return `<button type="button" class="reaction-btn ${active ? "reaction-selected" : ""}"
        onclick="react(${post.id}, '${type}')">
        <i class="bi ${icon}"></i> ${text}
        <span>${post[type].length}</span>
    </button>`;
}

function react(id, type) {
    let post = data.posts.find(post => post.id === id);
    if (!post) return;

    let other = type === "likes" ? "dislikes" : "likes";

    post[other] = post[other].filter(username => username !== me.username);

    if (post[type].includes(me.username)) {
        post[type] = post[type].filter(username => username !== me.username);
    } else {
        post[type].push(me.username);
    }

    save();
    renderFeed();
}

function renderRequests() {
    let list = document.getElementById("requestList");
    let html = "";

    me.invites.forEach(username => {
        let user = getUser(username);
        if (!user) return;

        html += `<li class="list-group-item">
            ${personRow(user, "Wants to be your friend", "")}
            <div class="d-flex gap-2 mt-2">
                <button class="btn btn-sm btn-primary" onclick="accept('${username}')">Accept</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="decline('${username}')">Decline</button>
            </div>
        </li>`;
    });

    list.innerHTML = html ||
        `<li class="list-group-item">No pending requests.</li>`;
}

function accept(username) {
    let user = getUser(username);
    if (!user || !me.invites.includes(username)) return;

    if (me.ignored.includes(username) || user.ignored.includes(me.username)) {
        decline(username);
        return;
    }

    if (!me.friends.includes(username)) me.friends.push(username);
    if (!user.friends.includes(me.username)) user.friends.push(me.username);

    me.invites = me.invites.filter(name => name !== username);
    user.invites = user.invites.filter(name => name !== me.username);

    save();
    renderAll();
}

function decline(username) {
    let user = getUser(username);

    me.invites = me.invites.filter(name => name !== username);

    if (user) {
        user.invites = user.invites.filter(name => name !== me.username);
    }

    save();
    renderAll();
}

function renderPeople() {
    let list = document.getElementById("peopleList");
    let html = "";

    data.users.filter(user =>
        user.username !== me.username &&
        !me.friends.includes(user.username)
    ).forEach(user => {
        let requested = user.invites.includes(me.username);
        let ignored = me.ignored.includes(user.username);

        html += `<li class="list-group-item">
            ${personRow(user, user.city, "")}
            <div class="d-flex flex-wrap gap-2 mt-2">
                <button class="btn btn-sm btn-primary" onclick="invite('${user.username}')">
                    ${requested ? "Requested" : "Invite"}
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="toggleIgnore('${user.username}')">
                    ${ignored ? "Unignore" : "Ignore"}
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="openChat('${user.username}')">Message</button>
            </div>
        </li>`;
    });

    list.innerHTML = html ||
        `<li class="list-group-item">No new members.</li>`;
}

function invite(username) {
    let user = getUser(username);
    if (!user) return;

    if (user.ignored.includes(me.username)) {
        showMsg("inviteMsg", user.name + " has ignored you. Request blocked.", true);
    } else if (me.ignored.includes(username)) {
        showMsg("inviteMsg", "Unignore this member before sending a request.", true);
    } else if (user.invites.includes(me.username)) {
        showMsg("inviteMsg", "You have already sent this request.", true);
    } else if (me.invites.includes(username)) {
        showMsg("inviteMsg", "This member has already requested you. Accept above.", true);
    } else {
        user.invites.push(me.username);
        save();
        renderPeople();
        showMsg("inviteMsg", "Friend request sent to " + user.name + ".", false);
    }
}

function toggleIgnore(username) {
    let user = getUser(username);
    if (!user) return;

    if (me.ignored.includes(username)) {
        me.ignored = me.ignored.filter(name => name !== username);
    } else {
        me.ignored.push(username);
        me.invites = me.invites.filter(name => name !== username);
        user.invites = user.invites.filter(name => name !== me.username);
    }

    save();
    renderAll();
}

function renderAll() {
    renderFriends();
    renderShareOptions();
    renderFeed();
    renderRequests();
    renderPeople();
}

document.getElementById("postForm").addEventListener("submit", shareNews);
document.getElementById("postAudience").addEventListener("change", toggleShare);

renderAll();
toggleShare();
