const root = "http://localhost:3000/messagesOverviewPage"; // Or whatever your backend URL is
const url = new URL("/messagesOverview", root).href;

//fetch friends from server and render them onto page

//for testing
let friendsList = ["gp", "gp2", "gp3", "gp4"];

async function getFriends() {
  return await fetch(url)
    .then((res) => {
      if (res) return res.json();
      else console.log("Not successful");
    })
    .then((data) => {
      const friends = data.friends;
      const friendsContainer = document.getElementById("friends-list");
      for (friend of friends) {
        let item = document.createElement("a");
        item.href = `/messages?user=${friend}`;
        item.innerText = friend;
        friendsContainer.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
      }
    })
    .catch((error) => console.log(error));
}
getFriends();
// getFriends();
