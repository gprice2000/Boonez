const root = window.location.origin + "/messagesOverviewPage"; // Or whatever your backend URL is
const url = new URL("/messagesOverview", root).href;
const search = window.location.search;
document.getElementById("dash").href = `/dashboard/${search}`;
document.getElementById("friends").href = `/findFriends/${search}`;
document.getElementById("messages").href = `/messagesOverviewPage/${search}`;
//fetch friends from server and render them onto page

//for testing

async function getFriends() {
  return await fetch(url)
    .then((res) => {
      if (res) return res.json();
      else console.log("Not successful");
    })
    .then((data) => {
      if (data == "nsi") {
        window.location.href = "/login";
      }
      const friends = data.friends;
      const friendsContainer = document.getElementById("friends-list");
      for (friend of friends) {
        let item = document.createElement("div");
        item.className = "friendCnt";
        item.id = friend.username;
        let profPic = document.createElement("img");
        profPic.className = "friendPic";
        profPic.alt = `${friend.fullname}'s pic`;
        profPic.src =
          friend.profilePic != null
            ? friend.profilePic
            : "../../images/blank-profile-pic.png";
        item.appendChild(profPic);
        let friendName = document.createElement("h2");
        friendName.className = "friend-name";
        friendName.innerText = friend.fullname;
        item.appendChild(friendName);

        console.log(friend.username);
        item.onclick = () =>
          (window.location.href = `/messages?userTo=${item.id}&userFrom=${data.username}`);
        friendsContainer.appendChild(item);
      }
    })
    .catch((error) => console.log(error));
}
getFriends();
// getFriends();
