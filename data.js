let minute = 60000;

let seed = {
    users: [
        { username: "haseebdope", password: "haseeb123", name: "Haseeb Dope", gender: "Male", phone: "0300-1111111", email: "haseebdope@connecfriend.com", city: "Islamabad", lastLogin: Date.now() - 300 * minute, friends: ["ali", "mubashir"], ratings: {}, invites: [], ignored: [], avatar: "https://i.pravatar.cc/100?u=haseebdope" },
        { username: "farhan", password: "farhan5050", name: "Farhan", gender: "Male", phone: "0300-2222222", email: "farhan@connecfriend.com", city: "Islamabad", lastLogin: Date.now() - 15 * minute, friends: ["mubashir"], ratings: {}, invites: [], ignored: [], avatar: "https://i.pravatar.cc/100?u=farhan" },
        { username: "mubashir", password: "mubashir5050", name: "Mubashir", gender: "Male", phone: "0300-3333333", email: "mubashir@connecfriend.com", city: "Rawalpindi", lastLogin: Date.now() - 90 * minute, friends: ["haseebdope", "farhan"], ratings: {}, invites: [], ignored: [], avatar: "https://i.pravatar.cc/100?u=mubashir" },
        { username: "ali", password: "ali1234", name: "Ali", gender: "Male", phone: "0300-4444444", email: "ali@connecfriend.com", city: "Lahore", lastLogin: Date.now() - 5 * minute, friends: ["haseebdope"], ratings: {}, invites: [], ignored: [], avatar: "https://i.pravatar.cc/100?u=ali" },
        { username: "momina", password: "momina5050", name: "Momina", gender: "Female", phone: "0300-5555555", email: "momina@connecfriend.com", city: "Islamabad", lastLogin: Date.now() - 200 * minute, friends: [], ratings: {}, invites: [], ignored: [], avatar: "https://i.pravatar.cc/100?u=momina" }
    ],
    posts: [
        { id: 1, author: "ali", text: "Just finished my web development project!", time: Date.now() - 10 * minute, sharedWith: "all", likes: ["mubashir"], dislikes: [] },
        { id: 2, author: "mubashir", text: "Anyone up for cricket this weekend?", time: Date.now() - 100 * minute, sharedWith: "all", likes: [], dislikes: ["ali"] },
        { id: 3, author: "farhan", text: "Working on my next assignment. Almost done!", time: Date.now() - 30 * minute, sharedWith: "all", likes: ["haseebdope"], dislikes: [] },
        { id: 4, author: "momina", text: "Had a productive day today!", time: Date.now() - 60 * minute, sharedWith: "all", likes: [], dislikes: [] }
    ],
    messages: [
        { from: "ali", to: "haseebdope", text: "Hey, how are you?", time: Date.now() - 20 * minute },
        { from: "farhan", to: "mubashir", text: "Are you coming to university tomorrow?", time: Date.now() - 40 * minute }
    ]
};

let data;

try {
    data = JSON.parse(localStorage.getItem("cfData")) || seed;
} catch {
    data = seed;
}

if (!data.users || !data.users.some(user => user.username === "haseebdope")) {
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
    let user = getUser(username);
    return user && user.avatar ? user.avatar : "https://i.pravatar.cc/100?u=" + encodeURIComponent(username);
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
