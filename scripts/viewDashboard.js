//fetch dashboard info, no data can be edited
let cur_user;
let cur_session;
document.addEventListener('DOMContentLoaded', function() {
	const search = window.location.search;
	console.log("search at start: " + search)
	document.getElementById("dash").href = `/dashboard/${search}`;
	document.getElementById("friends").href = `/findFriends/${search}`;
	document.getElementById("messages").href = `/messagesOverviewPage/${search}`;
    fetchDash();

	async function fetchDash() {
		await fetch(window.location.origin+ "/viewDashboard" + search)
		.then(response =>  response.json())
		.then(data => {
			console.log("data: " + data)
			let doc = data.doc;
			let cur_session = data.cur_session;
			console.log("cur_session: " + cur_session)
			cur_user = data.cur_user;
			if (data == "nsi") {
				window.location.href = "/login";
			}
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
			getName(doc);
			friendList(doc.friends);
		})
		.catch((error) => {
			console.log("Error: " + error)
		});
	}

	function getName(data) {
		let first = data.fname;
		let last = data.lname;
		first = first.charAt(0).toUpperCase() + first.slice(1);
		last = last.charAt(0).toUpperCase() + last.slice(1);

		document.getElementById("student-name").innerHTML = first + " " + last;
	}
	function getAboutMe(text){
		let aboutme_body = document.getElementById("am-content");
		aboutme_body.innerHTML = text;
	}

	function courseList(courses) {
		for (var i = 0; i < courses.length; i++) {
			let node = document.createElement('li');
			let div = document.createElement('div');

			node.id = courses[i];
			node.className = "course";
			node.appendChild(document.createTextNode(courses[i]));
			document.querySelector("#course-list").appendChild(node);
		}
	}

	function friendList(data) {
		for (var i = 0; i < 10 ; i++) {
			if (i >= data.length) {break;}
			let node = document.createElement('li');
			let img = document.createElement('img');
			let div = document.createElement('div');

			node.id = data[i].username;
			if (data[i].profilePic == undefined) {
				img.src = "/images/blank-profile-pic.png"
			} else {
				img.src = data[i].profilePic;
			}
			
			
			node.addEventListener("click", (event) => {
				//redirect user to dashboard view page
				console.log("cur_user: " + cur_user)
				console.log("event.target.id: " + event.target.id)
				if (event.target.id == cur_user) {
					window.location.href = `/dashboard?user=${cur_user}`;
				}
				else {
					window.location.href = `/viewDash/?user=${event.target.id}`;
				}
			});

			node.className = "friend";
			div.className = "name";
			node.appendChild(img);
			node.appendChild(document.createTextNode(data[i].fullname));
			document.querySelector('#friends-list').appendChild(node);
		}
	}
});

async function serverCon(method, data,url) {
	
	await fetch(window.location.origin+ url, {
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