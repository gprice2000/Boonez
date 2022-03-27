//TODO render previous messages, sorted by date and time
//Do it with sample data first
const root = "http://localhost:3000/messages"; // Or whatever your backend URL is

//TODO Pass recipient and sender in query string

// const url = new URL("/messagesOverview", root).href;
function parseQuery(queryString) {
  var query = {};
  var pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}
let sampleMessages = [
  {
    _id: "623fefbf6ad665f4ac91e4ae",
    userFrom: "gp",
    userTo: "gp2",
    read: false,
    messageContent: "hola",
    timeSent: 59,
    daySent: 3232022,
    timeDateString: " 3-23-2022 at 0:59",
  },
  {
    _id: "623fefbf6ad665f4ac91e4ae",
    userFrom: "gp2",
    userTo: "gp",
    read: false,
    messageContent: "bitch",
    timeSent: 109,
    daySent: 3272022,
    timeDateString: " 3-27-2022 at 1:49",
  },
  {
    _id: "623fefbf6ad665f4ac91e4ae",
    userFrom: "gp",
    userTo: "gp2",
    read: false,
    messageContent: "hey",
    timeSent: 59,
    daySent: 3272022,
    timeDateString: " 3-27-2022 at 0:59",
  },
  {
    _id: "623fefbf6ad665f4ac91e4ae",
    userFrom: "gp2",
    userTo: "gp",
    read: false,
    messageContent: "yo",
    timeSent: 49,
    daySent: 3272021,
    timeDateString: " 3-27-2022 at 0:49",
  },
  {
    _id: "623fefbf6ad665f4ac91e4ae",
    userFrom: "gp",
    userTo: "gp2",
    read: false,
    messageContent: "bon jour",
    timeSent: 55,
    daySent: 3232022,
    timeDateString: " 3-23-2022 at 0:55",
  },
];
let messageCont = document.getElementById("messages");
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
  messageArr.sort((x, y) => x.daySent + x.timeSent - (y.daySent - y.timeSent)); //Sort array by day so latest messages appear first
  // messageArr.sort((x, y) => x.timeSent - y.timeSent); //Sort array by time so latest messages appear first

  const query = parseQuery(window.location.href);
  const userFrom = query.userFrom;
  console.log(query);
  const userTo = query.userTo;
  //create a new div for each message that's appended in a container on document
  for (message of messageArr) {
    let item = document.createElement("div");
    item.innerHTML = `<p>${message.messageContent}</p>${message.timeDateString}`;
    item.className = message.userFrom == userFrom ? "userFrom" : "userTo";
    messageCont.appendChild(item);
  }
}

renderMessages(sampleMessages);
