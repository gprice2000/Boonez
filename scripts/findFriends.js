let cur_friends;
let cur_user;
const search = window.location.search;
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("dash").href = `/dashboard/${search}`;
  document.getElementById("friends").href = `/findFriends/${search}`;
  document.getElementById("messages").href = `/messagesOverviewPage/${search}`;
  getFriends();

  let but = document.getElementById("friendSub");
  but.onclick = async function (event) {
    event.preventDefault();
    document.getElementById("friendSearch").innerHTML = "";
    let fname = document
      .getElementById("fname")
      .value.replace(/\s+/g, "")
      .toLowerCase();
    let lname = document
      .getElementById("lname")
      .value.replace(/\s+/g, "")
      .toLowerCase();
    let username = document
      .getElementById("username")
      .value.replace(/\s+/g, "");
    let crn = document.getElementById("crn").value.replace(/\s+/g, "");
    let obj = { fname, lname, username, crn };

    await fetch(`${window.location.origin}/findFriend`, {
      method: "POST",
      credentials: "same-origin",
      mode: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.length != 0) {
          document.getElementById("results").innerHTML = "Results"
          searchFriend(data)
        }else {
          document.getElementById("results").innerHTML = "No Results Found"
        }      
      })
      .catch((err) => {
        console.log("Error: " + err);
      });
  };
    
	function getName(data) {
		let first = data.fname;
		let last = data.lname;
		first = first.charAt(0).toUpperCase() + first.slice(1);
		last = last.charAt(0).toUpperCase() + last.slice(1);
	    return first + " " + last;
	}

    function searchFriend(data) { 
        for (var i = 0; i < data.length ; i++) { 
            let del = document.createElement('img');
            let node = document.createElement('li');
            let img = document.createElement('img');
            let div = document.createElement('div');
            let user = data[i].username;
            let addedFriend;

            let addf = document.createElement('img');
            img.className = "friend-pic";
            addf.setAttribute("id","add");
            addedFriend = cur_friends.find(ele =>
                ele.username == user);
            node.appendChild(img);
            let fullname = getName(data[i]);
            node.appendChild(document.createTextNode(fullname));
            if(addedFriend == undefined && user != cur_user) {
                addf.src = "/images/add-user.png";
                addf.className = "addfriend";
                node.appendChild(addf);
            } else if (user != cur_user){
                del.src = "/images/del-friend.png";
                del.className = "delfriend"
                node.appendChild(del)
            }
            node.className = "friend friend-search";

            node.id = user;
            div.className = "name";
            if (data[i].profilePic == undefined) {
                img.src = "/images/blank-profile-pic.png"
            } else {
                img.src = data[i].profilePic;
            }
        

            document.querySelector('#friendSearch').appendChild(node);

            addf.addEventListener("click", (event) => {
                event.stopPropagation();
                node.removeChild(addf)
                del.src = "/images/del-friend.png";
                del.className = "delfriend"
                node.appendChild(del)
                let obj = {username: node.id,
                           fullname: fullname,
                           profilePic: img.src}
                serverCon("POST", obj,"/addFriend");
                cur_friends.push(obj);
                //let selected_friend = document.getElementById(node.id);
                //selected_friend.parentNode.removeChild(selected_friend);
                allFriends(cur_friends);

    
            })

            del.addEventListener("click",(event) => {
                event.stopPropagation();
                node.removeChild(del);
                addf.src = "/images/add-user.png";
                addf.className = "addfriend";
                node.appendChild(addf);                let obj = {username: node.id}
                cur_friends = cur_friends.filter(function(value, index, arr) {
                    return value == node.id
                })
                let selected_friend = document.getElementById(node.id);
                selected_friend.parentNode.removeChild(selected_friend);
                serverCon("POST", obj, "/delFriend");
            })

          node.addEventListener("click", (event) => {
                    console.log("event.target.id" + event.currentTarget.id)
            //redirect user to dashboard view page
                    if (event.target.id == cur_user) {
                        window.location.href = `/dashboard/${search}`;
                    } else {
                        window.location.href = `/viewDash/?user=${event.target.id}`;
                    }
                    
          });
        } 
    }
});

  function allFriends(friends) {
    document.getElementById("friendsList").innerHTML = "";
    console.log("all friens: " + friends.length);
    for (var i = 0; i < friends.length; i++) {

      let node = document.createElement("li");
      let img = document.createElement("img");
      let div = document.createElement("div");
      let del = document.createElement("img");

      node.className = "friend";
      node.id = friends[i].username;

      img.className = "friend-pic";

      del.src = "/images/del-friend.png";
      del.className = "delfriend";

      div.className = "name";
      if (friends[i].profilePic == undefined) {
        img.src = "/images/blank-profile-pic.png";
      } else {
        img.src = friends[i].profilePic;
      }
      node.appendChild(img);
      node.appendChild(document.createTextNode(friends[i].fullname));
      node.appendChild(del);
      document.querySelector("#friendsList").appendChild(node);

      del.addEventListener("click", (event) => {
        
        event.stopPropagation();
        let obj = { username: node.id };

        cur_friends = cur_friends.filter(function (value, index, arr) {
          return value == node.id
        })

        let selected_friend = document.getElementById(node.id);
        selected_friend.parentNode.removeChild(selected_friend);
        document.getElementById("friendSearch").innerHTML = "";
        serverCon("POST", obj, "/delFriend");
      })

      node.addEventListener("click", (event) => {
        //redirect user to dashboard view page
        window.location.href = `/viewDash?user=${event.target.id}`;
                      
      });
    }        
  }
async function serverCon(method, data,url) {
  await fetch(window.location.origin+ url+search, {
      method: method, 
      credentials: 'same-origin',
      mode: 'same-origin',
      headers: {
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(new_event => {
      console.log('Success:');
  })
    .catch((error) => {
      console.error("Error:");
   });
  let selected_friend = document.getElementById(node.id);
  selected_friend.parentNode.removeChild(selected_friend);
  serverCon("POST", obj, "/delFriend");
}

  function getName(data) {
    let first = data.fname;
    let last = data.lname;
    first = first.charAt(0).toUpperCase() + first.slice(1);
    last = last.charAt(0).toUpperCase() + last.slice(1);
    return first + " " + last;
  }

  async function serverCon(method, data, url) {
    await fetch(window.location.origin + url + search, {
      method: method,
      credentials: "same-origin",
      mode: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((new_event) => {
        console.log("Success:");
      })
      .catch((error) => {
        console.error("Error:");
      });
  }

  async function getFriends() {
    let allfr = document.getElementById("friendsList");
    if (allfr.innerHTML.trim() != "") {
      document.getElementById("friendsList").innerHTML = "";
    }
    await fetch(window.location.origin+"/getFriends" + search)
      .then((response) => response.json())
      .then((data) => {
        if (data == "nsi") {
          window.location.href = "/login";
        }
        cur_user = data.username;
        cur_friends = data.friends;
        console.log("getFriends: " + cur_friends);

        allFriends(data.friends);
      })
      .catch((err) => {
        console.log("Error: " + err);
      });
  }