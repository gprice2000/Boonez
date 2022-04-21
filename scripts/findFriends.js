        //add delete friend functionality
let cur_friends;
let cur_user;
const search = window.location.search;
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("dash").href = `/dashboard/${search}`;
	document.getElementById("friends").href = `/findFriends/${search}`;
	document.getElementById("messages").href = `/messagesOverviewPage/${search}`;
    getFriends()

    let but = document.getElementById("friendSub");
    but.onclick = function(event) {
        event.preventDefault();
        document.getElementById("friendSearch").innerHTML = "";
        let fname = document.getElementById("fname").value.replace(/\s+/g,'').toLowerCase();
        let lname = document.getElementById("lname").value.replace(/\s+/g, '').toLowerCase();
        let username = document.getElementById("username").value.replace(/\s+/g, '');
        let crn = document.getElementById("crn").value.replace(/\s+/g, '');
        let obj = {items: [fname,lname,username,crn]};
        fetch('http://localhost:3000/findFriend', {
            method: 'POST', 
            credentials: 'same-origin',
            mode: 'same-origin',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(obj),
        })
        .then(response => response.json())
        .then(data => {
            searchFriend(data)
        })
        .catch((err) => {
            console.log("Error: " + err)
        })
    }


    function allFriends(data) {
        let del = document.createElement('img');
        for (var i = 0; i < data.friends.length ; i++) {
            let node = document.createElement('li');
            let img = document.createElement('img');
            let div = document.createElement('div');
            let del = document.createElement('img');

            node.className = "friend";
            node.id = data.friends[i].username;
            //added delete friend image 
            //del.src = "/images/"
            del.src = "/images/del-friend.png";
            del.className = "delfriend"
            node.appendChild(del)
            
            node.addEventListener("click", (event) => {
                //redirect user to dashboard view page
            });
            div.className = "name";
            if (data.friends[i].profilePic == undefined) {
                img.src = "/images/blank-profile-pic.png"
            } else {
                img.src = data.friends[i].profilePic;
            }
            node.appendChild(img);
            //name of friend 
            node.appendChild(document.createTextNode(data.friends[i].fullname));
            document.querySelector('#friendsList').appendChild(node);
            del.addEventListener("click",(event) => {
                console.log("event: " + event.target.innerHTML)
                let obj = {username: node.id}
                serverCon("POST", obj, "/delFriend");
                getFriends();
            })
        }        
    }

    function searchFriend(data) { 
        let addf = document.createElement('img');
        let del = document.createElement('img');
        for (var i = 0; i < data.length ; i++) { 
            let user = data[i].username;
            let node = document.createElement('li');
            let img = document.createElement('img');
            let div = document.createElement('div');
            let addedFriend;

            addedFriend = cur_friends.find(ele =>
                ele.username == user);

            if(addedFriend == undefined && user != cur_user) {
                addf.src = "/images/add-user.png";
                addf.className = "addfriend";
                node.appendChild(addf);
            } else if (user != cur_user){
                del.src = "/images/del-friend.png";
                del.className = "delfriend"
                node.appendChild(del)
            }
            node.className = "friend";
            node.id = user;
            div.className = "name";
            if (data[i].profilePic == undefined) {
                img.src = "/images/blank-profile-pic.png"
            } else {
                img.src = data[i].profilePic;
            }
            node.appendChild(img);
            let fullname = data[i].fname
                           + ' ' + data[i].lname;

            node.appendChild(document.createTextNode(fullname));
            document.querySelector('#friendSearch').appendChild(node);
            del.addEventListener("click",(event) => {
                console.log("event: " + event.target.innerHTML)
                let obj = {username: node.id}
                serverCon("POST", obj, "/delFriend");
                getFriends();
            })
            addf.addEventListener("click", (event) => {
                console.log("add : " + node.id)
                let obj = {username: node.id}
                serverCon("POST", obj,"/addFriend");
                getFriends();
                document.getElementById(node.id).innerHTML = "";
    
            })
        }


        
    }

    function serverCon(method, data,url) {
        fetch('http://localhost:3000'+url+'/'+search, {
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
    }

    function getFriends() {
        let allfr = document.getElementById("friendsList")
        if(allfr.innerHTML.trim() != "") {
        document.getElementById("friendsList").innerHTML = '';
        }
        fetch('http://localhost:3000/getFriends/' + search)
        .then(response => response.json())
        .then(data => {
            if (data == "nsi") {
                window.location.href = "/login";
            }
            cur_user = data.username;
            cur_friends = data.friends;
            allFriends(data);
        })
        .catch((err) => {
            console.log("Error: " + err)
        })
    }
});
