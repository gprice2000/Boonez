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
        console.log("SUCCESS: " + data[0].lname)
        /*
        for (var i = 0; i < data.friends.length ; i++) {
            console.log(data.friends[i])
            let node = document.createElement('li');
            let img = document.createElement('img');
            let div = document.createElement('div');
            node.className = "friend";
            div.className = "name";
            img.src = data.friends.profilePic;
            node.appendChild(img);
            //name of friend
            node.appendChild(document.createTextNode(data.friends.name));
            document.querySelector('#friendsList').appendChild(node);
        }
        */
    }
})
