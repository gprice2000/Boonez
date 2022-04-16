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
			if (data.classes.length != 0) {
				courseList(data.classes);
			} else {
				getCourseList();
			}
			if (data.aboutme != null) {
				getAboutMe();
			}
			else {
				setAboutMe();
			}
			friendList(data.friends)
		})
		.catch((error) => {
			console.log("Error: " + error)
		});
	}

	function setAboutMe(){
		document.getElementById()

	}

	function getAboutMe(){

	}

	function getCourseList() {
		console.log("getcourselist")
		let classModal = document.getElementById("classModal");
		classModal.style.display = "initial";
		let classForm = document.querySelector("#courseform");
		let classes = [];


		classForm.addEventListener('submit', (event) => {
			event.preventDefault();
			const formData = new FormData(event.target)
			for(let pair of formData.entries()) {
				if (pair[1] != "") {classes.push(pair[1].replace(/\s+/g, ''))}
			}
			console.log("classes: " + classes)
			fetch("http://localhost:3000/courses",
				{
					method: 'POST', 
					credentials: 'same-origin',
					mode: 'same-origin',
					headers: {
						'Content-Type' : 'application/json',
					},
					body: JSON.stringify(classes),
				})
			.then(response =>  response.json())
			.then(data => {

			})
			.catch((error) => {
				console.log("Error: " + error)
			});			classModal.style.display = "none";


		})

			/*
			for(let i = 0; i < 8; i++) {

				console.log(classForm.get("course0"));
			}*/
		

	}


	function courseList(courses) {
		for (var i = 0; i < courses.length; i++) {
			let node = document.createElement('li');
			let div = document.createElement('div');

			node.id = courses[i];
			node.className = "course";
			node.appendChild(document.createTextNode(courses[i]));
			document.querySelector("#courseList").appendChild(node);
		}
	}

	function friendList(data) {
		for (var i = 0; i < 10 ; i++) {
			if (i >= data.length) {break;}
			let node = document.createElement('li');
			let img = document.createElement('img');
			let div = document.createElement('div');

			//user id is stored in node id , this way we can keep track upon 
			//element click.
			node.id = data[i].username;
			if (data[i].profilePic == undefined) {
				img.src = "/images/blank-profile-pic.png"
			} else {
				img.src = data[i].profilePic;
			}
			node.addEventListener("click", (event) => {
				//redirect user to dashboard view page
			});
			node.className = "friend";
			div.className = "name";
			node.appendChild(img);
			node.appendChild(document.createTextNode(data[i].fullname));
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