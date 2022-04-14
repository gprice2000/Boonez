document.addEventListener('DOMContentLoaded', function() {
	const search = window.location.search;
	document.getElementById("dash").href = `/dashboard/${search}`;
	document.getElementById("friends").href = `/findFriends/${search}`;
	document.getElementById("messages").href = `/messagesOverviewPage/${search}`;
	document.getElementById("picForm").action = `/profilePicture/${search}`;
	fetchDash();

	async function fetchDash() {
		await fetch("http://localhost:3000/userDashboard/" + search)///?user=${}`)
		.then(response =>  response.json())
		.then(data => {
			if (data == "nsi") {
				window.location.href = "/login";
			}
			if (data.profilePic != null) {
				let proPic = document.getElementById("profile-pic")
				proPic.src = data.profilePic;
			}
			friendList(data)
		})
		.catch((error) => {
			console.log("Error: " + error)
		});
	}

	function friendList(data) {
		for (var i = 0; i < 10 ; i++) {
			if (i >= data.friends.length) {break;}
			let node = document.createElement('li');
			let img = document.createElement('img');
			let div = document.createElement('div');

			//user id is stored in node id , this way we can keep track upon 
			//element click.
			node.id = data.friends[i].username;
			if (data.friends[i].profilePic == undefined) {
				img.src = "/images/blank-profile-pic.png"
			} else {
				img.src = data.friends[i].profilePic;
			}
			node.addEventListener("click", (event) => {
				//redirect user to dashboard view page
			});
			node.className = "friend";
			div.className = "name";
			node.appendChild(img);
			node.appendChild(document.createTextNode(data.friends[i].fullname));
			document.querySelector('#friendsList').appendChild(node);
		}
	}


	document.getElementById("allFriends").addEventListener("click", function() {
		window.location.href = "/findFriends/" + search;
	})
});

function setProf() {
	let picLink = document.getElementById("PicLink");
	let picSub = document.getElementById("PicSub");
	let proPic = document.getElementById("profile-pic")
	picSub.onclick = function() {
		proPic.src = picLink.value;
	}
	let modal = document.getElementById("picModal");
	modal.style.display = "block";
	var span = document.getElementsByClassName("close")[0];
	//when user clicks x modal closes
	span.onclick = function() {
		modal.style.display = "none";
	}
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
}