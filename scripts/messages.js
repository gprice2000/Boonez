//TODO render previous messages, sorted by date and time
//Do it with sample data first
const root = window.location.href;
//TODO Pass recipient and sender in query string

// const url = new URL("/messagesOverview", root).href;
function parseQuery(queryString) {
  var query = {};
  var pairs = queryString.split("?")[1].split("&");

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}
// let sampleMessages = [
//   {
//     _id: "623fefbf6ad665f4ac91e4ae",
//     userFrom: "gp",
//     userTo: "gp2",
//     read: false,
//     messageContent: "hola",
//     timeSent: 59,
//     daySent: 3232022,
//     timeDateString: " 3-23-2022 at 0:59",
//   },
//   {
//     _id: "623fefbf6ad665f4ac91e4ae",
//     userFrom: "gp2",
//     userTo: "gp",
//     read: false,
//     messageContent: "bitch",
//     timeSent: 109,
//     daySent: 3272022,
//     timeDateString: " 3-27-2022 at 1:49",
//   },
//   {
//     _id: "623fefbf6ad665f4ac91e4ae",
//     userFrom: "gp",
//     userTo: "gp2",
//     read: false,
//     messageContent: "hey",
//     timeSent: 59,
//     daySent: 3272022,
//     timeDateString: " 3-27-2022 at 0:59",
//   },
//   {
//     _id: "623fefbf6ad665f4ac91e4ae",
//     userFrom: "gp2",
//     userTo: "gp",
//     read: false,
//     messageContent:
//       "AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
//     timeSent: 49,
//     daySent: 3272021,
//     timeDateString: " 3-27-2022 at 0:49",
//   },
//   {
//     _id: "623fefbf6ad665f4ac91e4ae",
//     userFrom: "gp",
//     userTo: "gp2",
//     read: false,
//     messageContent: "bon jour",
//     timeSent: 55,
//     daySent: 3232022,
//     timeDateString: " 3-23-2022 at 0:55",
//   },
// ];
let newUrl = root.split("?");
newUrl = newUrl[0] + "/getMessages?" + newUrl[1];

let messageCont = document.getElementById("messages");

const url = new URL(newUrl);
async function getMessages() {
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      //send array of message objects
      renderMessages(data);
    });
}

//Used for dom manipulation
//Takes array of message objects as input
function renderMessages(messageArr) {
  messageArr.sort((x, y) => x.unixTime - y.unixTime);

  // messageArr.sort((x, y) => x.timeSent - y.timeSent); //Sort array by time so latest messages appear first

  const query = parseQuery(window.location.href);

  const userFrom = query.userFrom;
  const userTo = query.userTo;

  //create a new div for each message that's appended in a container on document
  for (message of messageArr) {
    let item = document.createElement("div");
    item.innerHTML = `<p>${message.messageContent}</p>${message.timeDateString}`;
    item.className = message.userFrom == userFrom ? "userFrom" : "userTo";
    console.log(item.className);
    messageCont.appendChild(item);
  }
}

async function getFriends() {
  let friendUrl = root.split("?");
  friendUrl = friendUrl[0] + "/getFriends?" + friendUrl[1];
  const friendsListUrl = new url(friendUrl);

  await fetch(friendsListUrl)
    .then((res) => res.json)
    .then((data) => {
      renderFriends(data);
    });
}
//Take in array of friend objects, display in side pane
function renderFriends(friendsList) {
  // const query = parseQuery(window.location.href);
  // console.log(query);
  // const userFrom = query.userFrom;
  //create a new div for each friend in current users friendslist
  let friendsCont = document.getElementById("friends");
  for (friend of friendsList) {
    let item = document.createElement("div");
    item.innerHTML =
      `<img src=${"../images/blank-profile-pic.png"} alt=${
        friend.username
      }'s profile picture></img>` +
      `<a href=${`/messages?userTo=${friend.username}&userFrom=${"test"}`}>${
        friend.fname
      } ${friend.lname}</a>`;

    item.className = "friend-item";
    item.id = `${friend.username}`;
    friendsCont.appendChild(item);
  }
}

let sampleFriends = [
  {
    fname: "gabe",
    lname: "price",
    username: "gp",
    password: "$2a$10$tsTLIu.2U5O3z1oYwRbJVu60e6GJ2.llKMSUeSb3DMF.qEuzkqCje",
    email: "gp@gmail.com",
  },
  {
    fname: "Jacob",
    lname: "Mazzarese",
    username: "jvmazz",
    password: "$2a$10$tsTLIu.2U5O3z1oYwRbJVu60e6GJ2.llKMSUeSb3DMF.qEuzkqCje",
    email: "gp@gmail.com",
  },
  {
    fname: "Joe",
    lname: "Mama",
    username: "yourmom",
    password: "$2a$10$tsTLIu.2U5O3z1oYwRbJVu60e6GJ2.llKMSUeSb3DMF.qEuzkqCje",
    email: "gp@gmail.com",
  },
];

// document.querySelectorAll(".friend-item").addEventListener("click", () => {
//   let newUrl = root.split("?");
//   newUrl = newUrl[0] + `userTo=${}`;
//   window.location.href = {};
// });

// var socket = io();

// var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let msg = "";
  if (input.value) {
    msg = input.value;
    // socket.emit("chat message", input.value);
    input.value = "";
  }
  let message = [];
  let date_ob = new Date();
  const query = parseQuery(window.location.href);
  const userFrom = query.userFrom;
  const userTo = query.userTo;
  var ts = Math.round(date_ob.getTime() / 1000);
  message[0] = {
    userFrom: userFrom,
    userTo: userTo,
    read: false,
    messageContent: msg,
    unixTime: ts,
    timeSent: Number(`${date_ob.getHours()}${date_ob.getMinutes()}`),
    daySent: Number(
      `${date_ob.getMonth() + 1}${date_ob.getDate()}${date_ob.getFullYear()}`
    ),
    timeDateString: `${date_ob.toLocaleDateString()} at ${date_ob.toLocaleTimeString()}`,
  };
  renderMessages(message);
});

// socket.on("chat message", (msg) => {
//   // var item = document.createElement("li");
//   console.log(socket.id);
//   let message = [];
//   let date_ob = new Date();
//   const query = parseQuery(window.location.href);
//   const userFrom = query.userFrom;
//   const userTo = query.userTo;
//   var ts = Math.round(date_ob.getTime() / 1000);
//   message[0] = {
//     userFrom: userFrom,
//     userTo: userTo,
//     read: false,
//     messageContent: msg,
//     unixTime: ts,
//     timeSent: Number(`${date_ob.getHours()}${date_ob.getMinutes()}`),
//     daySent: Number(
//       `${date_ob.getMonth() + 1}${date_ob.getDate()}${date_ob.getFullYear()}`
//     ),
//     timeDateString: `${date_ob.toLocaleDateString()} at ${date_ob.toLocaleTimeString()}`,
//   };
//   renderMessages(message);
//   // item.textContent = msg;
//   // messages.appendChild(item);
//   // window.scrollTo(0, document.body.scrollHeight);
// });
renderFriends(sampleFriends);
// getMessages();
// getFriends()
