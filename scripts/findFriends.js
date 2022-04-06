document.addEventListener('DOMContentLoaded', function() {
    let but = document.getElementById("friendSub");
    but.onclick = function(event) {
        event.preventDefault();
        let fname = document.getElementById("fname").value;
        let lname = document.getElementById("lname").value;
        let username = document.getElementById("username").value;
        let obj = {fname,lname,username};
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
            friendList(data)
        })
        .catch((err) => {
            console.log("Error: " + err)
        })
    }


    function friendList(data) {       
        let node = document.createElement('li');
        let img = document.createElement('img');
        let div = document.createElement('div');
        let usr = document.createElement('input');
        let addf = document.createElement('img'); 
        for (var i = 0; i < data.length ; i++) {

            usr.setAttribute("type","hidden");
            usr.setAttribute("value",data[i].username);
            addf.src = "/images/add-user.png";
            addf.className = "addfriend";
            node.className = "friend";
            div.className = "name";
            if (data.profilePic == undefined) {
                img.src = "/images/blank-profile-pic.png"
            } else {
                img.src = data.profilePic;
            }
            node.appendChild(img);
            node.appendChild(addf);
            node.appendChild(usr);
            //name of friend
            let fullname = data[i].fname + ' ' + data[i].lname;
            node.appendChild(document.createTextNode(fullname));
            document.querySelector('#friendsList').appendChild(node);
        }
        addf.addEventListener("click", () => {
            console.log("add : " + usr.value)
            let obj = {username: usr.value}
            serverCon("POST", obj,"/addFriend");
        })
        
    }

    function serverCon(method, data,url) {
        fetch('http://localhost:3000'+url, {
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
});
