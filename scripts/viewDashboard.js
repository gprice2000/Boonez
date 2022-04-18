//fetch dashboard info, no data can be edited
document.addEventListener('DOMContentLoaded', function() {
	const search = window.location.search;
    console.log("search: " + search)
    fetchDash();

	async function fetchDash() {
		await fetch("http://localhost:3000/viewDashboard/" + search)///?user=${}`)
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
			friendList(data.friends)
		})
		.catch((error) => {
			console.log("Error: " + error)
		});
	}
});