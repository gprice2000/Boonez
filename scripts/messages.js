var socket = io();

const query = parseQuery(window.location.href);

const userFrom = query.userFrom;
const userTo = query.userTo;

socket.on("private message", function (msgData) {
  console.log(msgData);
  let message = [];
  let date_ob = new Date();

  const userFrom = msgData.user;
  const userTo = msgData.recipient;

  var ts = Math.round(date_ob.getTime() / 1000);
  message[0] = {
    userFrom: userFrom,
    userTo: userTo,
    read: false,
    messageContent: msgData.msg,
    unixTime: ts,
    timeSent: Number(`${date_ob.getHours()}${date_ob.getMinutes()}`),
    daySent: Number(
      `${date_ob.getMonth() + 1}${date_ob.getDate()}${date_ob.getFullYear()}`
    ),
    timeDateString: `${date_ob.toLocaleDateString()} at ${date_ob.toLocaleTimeString()}`,
  };
  renderMessages(message);
});
//Event listener for when recipient sends a message back
// });
const root = window.location.href;

function parseQuery(queryString) {
  var query = {};
  var pairs = queryString.split("?")[1].split("&");

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

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

function getFriends() {
  let friendUrl = root.split("?");
  friendUrl = friendUrl[0] + "/getFriends?" + friendUrl[1];
  const friendsListUrl = new URL(friendUrl);
  fetch(friendsListUrl)
    .then((res) => res.json())
    .then((data) => {
      renderFriends(data);
    });
}
//Take in array of friend objects, display in side pane
function renderFriends(friendsList) {
  const query = parseQuery(window.location.href);
  const userFrom = query.userFrom;

  //create a new div for each friend in current users friendslist
  let friendsCont = document.getElementById("friends");
  for (friend of friendsList) {
    let item = document.createElement("div");
    item.innerHTML =
      `<img class=${"profile-pic"} src=${"../../images/blank-profile-pic.png"} alt=${
        friend.username
      }'s profile picture></img>` +
      `<p class='friend-name'>${friend.fname} ${friend.lname}</p>`;

    item.className = "friend-item";
    item.id = `${friend.username}`;

    //give friend a link to a new message box
    item.addEventListener("click", () => {
      window.location.href = `/messages?userTo=${item.id}&userFrom=${userFrom}`;
    });
    friendsCont.appendChild(item);
  }
}

var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", (e) => {
  const query = parseQuery(window.location.href);
  const userFrom = query.userFrom;
  const userTo = query.userTo;
  e.preventDefault();
  let msg = "";
  if (input.value) {
    msg = input.value;

    let userData = {
      user: userFrom,
      usersocket: socket.id,
      recipient: userTo,
      msg: msg,
    };
    socket.emit("private message", userData);
    input.value = "";
  }
});

//Display message recipient in message box
let recipBar = document.getElementById("message-recip");
recipBar.innerText = parseQuery(window.location.href).userTo;

getMessages(); //get and render messages from db
getFriends(); //get and render friends from db
