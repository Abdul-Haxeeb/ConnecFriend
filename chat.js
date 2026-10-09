
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

let select = document.getElementById("chatWith");
let messageList = document.getElementById("messages");

data.users.filter(user => user.username !== me.username).forEach(user => {
    let option = document.createElement("option");
    option.value = user.username;
    option.textContent = user.name +
        (me.friends.includes(user.username) ? " (friend)" : " (member)");

    select.appendChild(option);
});

let to = new URLSearchParams(location.search).get("to");

if (to && getUser(to) && to !== me.username) {
    select.value = to;
}

function renderMessages() {
    let other = select.value;

    if (!other) {
        messageList.innerHTML =
            `<p class="text-secondary">Select a member to view messages.</p>`;
        return;
    }

    let messages = data.messages.filter(message =>
        (message.from === me.username && message.to === other) ||
        (message.from === other && message.to === me.username)
    ).sort((a, b) => a.time - b.time);

    let html = "";

    messages.forEach(message => {
        let mine = message.from === me.username;

        html += `<div class="d-flex mb-3 ${mine ? "justify-content-end" : ""}">
            <div class="rounded-3 px-3 py-2 ${mine ? "bg-primary text-white" : "border"}" style="max-width: 80%;">
                <div class="text-break">${safe(message.text)}</div>
                <small>${timeAgo(message.time)}</small>
            </div>
        </div>`;
    });

    messageList.innerHTML = html ||
        `<p class="text-secondary">No messages yet. Start the conversation.</p>`;
}

function sendMessage(event) {
    event.preventDefault();

    let text = document.getElementById("messageText").value.trim();

    if (!select.value) {
        showMsg("chatMsg", "Please select a member.", true);
        return;
    }

    if (!text) {
        showMsg("chatMsg", "Message cannot be empty.", true);
        return;
    }

    data.messages.push({
        from: me.username,
        to: select.value,
        text: text,
        time: Date.now()
    });

    save();
    document.getElementById("messageText").value = "";
    showMsg("chatMsg", "Message sent.", false);
    renderMessages();
}

select.addEventListener("change", renderMessages);
document.getElementById("messageForm").addEventListener("submit", sendMessage);

renderMessages();
