//fetch dashboard info, no data can be edited
document.addEventListener('DOMContentLoaded', function() {
	const search = window.location.search;
    console.log("search: " + search)
    fetchDash();

	async function fetchDash() {
		await fetch("http://localhost:3000/viewDashboard/" + search)///?user=${}`)
		.then(response =>  response.json())
		.then(data => {
			let doc = data.doc;
			if (doc.profilePic != null) {
				let proPic = document.getElementById("profile-pic")
				proPic.src = doc.profilePic;
			}
			if (doc.classes.length != 0) {
				courseList(doc.classes);
			} 
			if (doc.aboutme != null) {
				getAboutMe(doc.aboutme);
			}
			if (doc.friends.length != 0) {
				friendList(data)
			}
		})
		.catch((error) => {
			console.log("Error: " + error)
		});
	}
	
	function getAboutMe(aboutme){
		console.log(aboutme)
		let txtbox = document.getElementById("aboutme");
		txtbox.value = aboutme;

	}



	function courseList(courses) {
		console.log("courses: " + courses)
		for (var i = 0; i < courses.length; i++) {
			let node = document.createElement('li');
			let div = document.createElement('div');
			node.className = "course";
			node.appendChild(document.createTextNode(courses[i]));
			document.querySelector("#courseList").appendChild(node);
		}
	}

	function friendList(data) {
		let doc = data.doc;
		let friends = doc.friends;
		let numoffriends = friends.length;
		for (var i = 0; i < 10 ; i++) {
			console.log("data.cur_user: " + data.cur_user)
			console.log("value of numoffr: " + numoffriends)
			console.log("i : " + i)
			//console.log("friend: " + friends[i].username)

			if (i > numoffriends ) {break;}
			if (data.cur_user == friends[i].username) {
				numoffriends -= 1;
				continue;}
			console.log("friend: " + friends[i].username)

			let node = document.createElement('li');
			let img = document.createElement('img');
			let div = document.createElement('div');
			//user id is stored in node id , this way we can keep track upon 
			//element click.'
			node.id = friends[i].username;
			if (friends[i].profilePic == undefined) {
				img.src = "/images/blank-profile-pic.png"
			} else {
				img.src = friends[i].profilePic;
			}
			
			
			node.addEventListener("click", (event) => {
				//redirect user to dashboard view page
				console.log("friend: " + event.target.id)
				window.location.href = `/viewDash/?user=${event.target.id}`;

			});
			
			node.className = "friend";
			div.className = "name";
			node.appendChild(img);
			node.appendChild(document.createTextNode(friends[i].fullname));
			document.querySelector('#friendsList').appendChild(node);
		}
	}
});

async function serverCon(method, data,url) {
	
	await fetch('http://localhost:3000'+url, {
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

	})
	.catch((error) => {
		console.error("Error: " + error);
		/*
		if (method == 'DELETE') {
			console.log("DELETE")
			window.location.replace(window.location.pathname + window.location.search);}
		*/
	});
}