document.addEventListener('DOMContentLoaded', function() {
	fetch('http://localhost:3000/userDashboard')
	.then(response => response.json())
	.then(data => {
		console.log('Success:'+ data.profilePic);
		let proPic = document.getElementById("profile-pic")
		proPic.src = data.profilePic;
		friendList(data);
	})
	.catch((error) => {
		console.error("Error:" + error);
	});
});

document.getElementById("allFriends").addEventListener("click", function() {
	window.location.href = "/findFriends";
})
function friendList(data) {
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
}

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
	// When the user clicks on <span> (x), close the modal

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