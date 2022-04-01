document.addEventListener('DOMContentLoaded', function() {
    let proPic = document.getElementById("profile-pic");
	fetch('http://localhost:3000/userDashboard')
	.then(response => response.json())
	.then(data => {
		console.log('Success:'+ data.profilePic);
		let proPic = document.getElementById("profile-pic")
		proPic.src = data.profilePic;
	})
	.catch((error) => {
		console.error("Error:" + error);
	});
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