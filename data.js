
let minute = 60000;

let seed = {
    users: [
        { username: "haseeb", password: "1234", name: "Abdul Haseeb", phone: "0300-1111111", email: "haseeb@connecfriend.com", city: "Islamabad", lastLogin: Date.now() - 300 * minute, friends: ["ali", "atif"], ratings: {}, invites: [], ignored: [] },
        { username: "ali", password: "1234", name: "Ali", phone: "0300-2222222", email: "ali@connecfriend.com", city: "Lahore", lastLogin: Date.now() - 5 * minute, friends: ["haseeb", "atif"], ratings: {}, invites: [], ignored: [] },
        { username: "atif", password: "1234", name: "Atif", phone: "0300-3333333", email: "atif@connecfriend.com", city: "Karachi", lastLogin: Date.now() - 90 * minute, friends: ["haseeb", "ali"], ratings: {}, invites: [], ignored: [] },
        { username: "sara", password: "1234", name: "Sara", phone: "0300-5555555", email: "sara@connecfriend.com", city: "Multan", lastLogin: Date.now() - 200 * minute, friends: [], ratings: {}, invites: [], ignored: ["haseeb"] },
        { username: "hamza", password: "1234", name: "Hamza", phone: "0300-6666666", email: "hamza@connecfriend.com", city: "Quetta", lastLogin: Date.now() - 600 * minute, friends: [], ratings: {}, invites: [], ignored: [] }
    ],
    posts: [
        { id: 1, author: "ali", text: "Just finished my web development project!", time: Date.now() - 10 * minute, sharedWith: "all", likes: ["atif"], dislikes: [] },
        { id: 2, author: "atif", text: "Anyone up for cricket this weekend?", time: Date.now() - 100 * minute, sharedWith: "all", likes: [], dislikes: ["ali"] }
    ],
    messages: [
        { from: "ali", to: "haseeb", text: "Hey, how are you?", time: Date.now() - 20 * minute }
    ]
};

let data;

try {
    data = JSON.parse(localStorage.getItem("cfData")) || seed;
} catch {
    data = seed;
}

if (!data.users || !data.users.some(user => user.username === "haseeb")) {
    data = seed;
    localStorage.removeItem("cfUser");
}

function save() {
    localStorage.setItem("cfData", JSON.stringify(data));
}

function getUser(username) {
    return data.users.find(user => user.username === username);
}

let me = getUser(localStorage.getItem("cfUser"));

function requireLogin() {
    if (!me) {
        location.href = "index.html";
    }
}

function logout() {
    localStorage.removeItem("cfUser");
    location.href = "index.html";
}

function pic(username) {
    return "https://i.pravatar.cc/100?u=" + encodeURIComponent(username);
}

function timeAgo(time) {
    let minutes = Math.floor((Date.now() - time) / minute);

    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + " min ago";
    if (minutes < 1440) return Math.floor(minutes / 60) + " hours ago";

    return Math.floor(minutes / 1440) + " days ago";
}

function safe(text) {
    let div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

function showMsg(id, text, isError) {
    let element = document.getElementById(id);

    if (element) {
        element.textContent = text;
        element.className = "small mt-2 mb-0 " +
            (isError ? "text-danger" : "text-success");
    }
}

let ratingIcons = ["🤪 Stupid", "😎 Cool", "🤝 Trustworthy"];

function openChat(username) {
    if (getUser(username) && username !== me?.username) {
        location.href = "messages.html?to=" + encodeURIComponent(username);
    }
}

save();
