const root = "http://localhost:3000/messagesOverviewPage"; // Or whatever your backend URL is
const url = new URL("/messagesOverview", root).href;

//fetch friends from server and render them onto page

//for testing

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
        item.href = `/messages?userTo=${friend}&userFrom=${data.username}`;
        item.innerText = friend;
        friendsContainer.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
      }
    })
    .catch((error) => console.log(error));
}
getFriends();
// getFriends();