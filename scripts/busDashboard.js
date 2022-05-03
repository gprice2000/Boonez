let cur_user;
document.addEventListener("DOMContentLoaded", function () {
  const search = window.location.search;
  document.getElementById("dash").href = `/BusinessDashboard${search}`;
  document.getElementById("advertisements").href = `/viewAdvertisements`;
  document.getElementById("removeAdvertisements").href = `/removeAd${search}`;
  document.getElementById("createAdvertisements").href = `/createAd${search}`;
  fetchDash();

  async function fetchDash() {
    console.log(search);
    // console.log(window.location.origin);
    // console.log(window.location.origin + "/businessDashboard" + search);

    await fetch(window.location.origin + "/fetchBusinessDashboard") ///?user=${}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        cur_user = data;
        if (data == "nsi") {
          window.location.href = "/login";
        }
        if (data.profilePic != null) {
          let proPic = document.getElementById("profile-pic");
          proPic.src = data.profilePic;
        }

        // if (data.classes.length != 0) {
        //   courseList(data.classes);
        // }
        if (data.aboutme != null) {
          console.log("data.aboutme: " + data.aboutme);
          getAboutMe(data.aboutme);
        }
        getName(data);
        friendList(data.friends);
      })
      .catch((error) => {
        console.log("Error: " + error);
      });
  }

  function getName(data) {
    document.getElementById("business-name").innerHTML = data.name;
  }

  function getAboutMe(text) {
    let aboutme_body = document.getElementById("am-content");
    aboutme_body.innerText = text;
  }
});

async function serverCon(method, data, url) {
  await fetch(window.location.origin + url, {
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
    });
}

function setAboutMe() {
  let modal = document.getElementById("about-modal");
  let text = document.getElementById("about-me-text");
  let savebtn = document.getElementById("amSub");
  text.value = cur_user.aboutme;
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
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
  document.getElementById("close").onclick = function () {
    modal.style.display = "none";
  };
  savebtn.onclick = function (event) {
    modal.style.display = "none";
    document.getElementById("am-content").innerHTML = text.value;
    event.preventDefault();
    console.log(text.value);
    serverCon("POST", { aboutme: text.value }, "/busAboutMe");
    console.log(event.target);
  };
}

function setProf() {
  let picLink = document.getElementById("PicLink");
  let picSub = document.getElementById("PicSub");
  let proPic = document.getElementById("profile-pic");
  picSub.onclick = function () {
    proPic.src = picLink.value;
  };
  let modal = document.getElementById("profile-pic-modal");
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
