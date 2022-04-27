document.addEventListener("DOMContentLoaded", function () {
  const search = window.location.search;
  // document.getElementById("dash").href = `/dashboard/${search}`;
  // document.getElementById("friends").href = `/findFriends/${search}`;
  // document.getElementById("messages").href = `/messagesOverviewPage/${search}`;
  document.getElementById("picForm").action = `/profilePicture/${search}`;
  fetchDash();

  async function fetchDash() {
    console.log(search);
    await fetch("http://localhost:3000/businessDashboard/" + search) ///?user=${}`)
      .then((response) => response.json())
      .then((data) => {
        if (data == "nsi") {
          window.location.href = "/login";
        }
        if (data.profilePic != null) {
          let proPic = document.getElementById("profile-pic");
          proPic.src = data.profilePic;
        }

        if (data.aboutme != null) {
          console.log("data.aboutme: " + data.aboutme);
          getAboutMe(data.aboutme);
        }
        friendList(data.friends);
      })
      .catch((error) => {
        console.log("Error: " + error);
      });
  }

  function getAboutMe(text) {
    let aboutme_body = document.getElementById("am-content");
    aboutme_body.innerHTML = text;
  }
});

async function serverCon(method, data, url) {
  await fetch("http://localhost:3000" + url, {
    method: method,
    credentials: "same-origin",
    mode: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((new_event) => {})
    .catch((error) => {
      console.error("Error: " + error);
      /*
		if (method == 'DELETE') {
			console.log("DELETE")
			window.location.replace(window.location.pathname + window.location.search);}
		*/
    });
}

function setAboutMe() {
  let modal = document.getElementById("aboutModal");
  let text = document.getElementById("aboutmeText");
  let savebtn = document.getElementById("amSub");
  modal.style.display = "initial";

  /*
	window.onclick = function(event) {
		console.log("about me modal outside window click: " + event)
		console.log("event target: " + event.target)
		console.log("modal : " + modal)
		if (event.target == modal) {
			console.log("x click")
			modal.style.display = "none";
		}
	}
	*/

  document.getElementById("closeabout").onclick = function () {
    modal.style.display = "none";
  };
  savebtn.onclick = function (event) {
    modal.style.display = "none";
    document.getElementById("am-content").innerHTML = text.value;
    event.preventDefault();
    console.log(text.value);
    serverCon("POST", { aboutme: text.value }, "/aboutMe");
    console.log(event.target);
  };
}

function getCourseList() {
  let classModal = document.getElementById("classModal");
  classModal.style.display = "initial";
  let classForm = document.querySelector("#courseform");
  let classes = [];

  classForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    for (let pair of formData.entries()) {
      if (pair[1] != "") {
        classes.push(pair[1].replace(/\s+/g, ""));
      }
    }
    console.log("classes: " + classes);
    fetch("http://localhost:3000/courses", {
      method: "POST",
      credentials: "same-origin",
      mode: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classes),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.log("Error: " + error);
      });
    classModal.style.display = "none";
  });

  var span = document.getElementById("closecourse");
  //when user clicks x modal closes
  span.onclick = function () {
    classModal.style.display = "none";
  };

  /*
		for(let i = 0; i < 8; i++) {

			console.log(classForm.get("course0"));
		}*/
}
function setProf() {
  let picLink = document.getElementById("PicLink");
  let picSub = document.getElementById("PicSub");
  let proPic = document.getElementById("profile-pic");
  picSub.onclick = function () {
    proPic.src = picLink.value;
  };
  let modal = document.getElementById("picModal");
  modal.style.display = "block";
  var span = document.getElementById("closePic");
  //when user clicks x modal closes
  span.onclick = function () {
    modal.style.display = "none";
  };
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
