let cur_user;
document.addEventListener("DOMContentLoaded", function () {
  const search = window.location.search;
  document.getElementById("dash").href = `/dashboard${search}`;
  document.getElementById("friends").href = `/findFriends${search}`;
  document.getElementById("messages").href = `/messagesOverviewPage${search}`;
  document.getElementById("picForm").action = `/profilePicture${search}`;
  fetchDash();

  async function fetchDash() {
    await fetch(window.location.origin + "/userDashboard" + search) ///?user=${}`)
      .then((response) => response.json())
      .then((data) => {
        cur_user = data;
        if (data == "nsi") {
          window.location.href = "/login";
        }
        if (data.profilePic != null) {
          let proPic = document.getElementById("profile-pic");
          proPic.src = data.profilePic;
        }
        if (data.classes.length != 0) {
          courseList(data.classes);
        }
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
    let first = data.fname;
    let last = data.lname;
    first = first.charAt(0).toUpperCase() + first.slice(1);
    last = last.charAt(0).toUpperCase() + last.slice(1);

    document.getElementById("student-name").innerHTML = first + " " + last;
  }

  function getAboutMe(text) {
    let aboutme_body = document.getElementById("am-content");
    aboutme_body.innerHTML = text;
  }

  function courseList(courses) {
    for (var i = 0; i < courses.length; i++) {
      let node = document.createElement("li");
      let div = document.createElement("div");

      node.id = courses[i];
      node.className = "course";
      node.appendChild(document.createTextNode(courses[i]));
      document.querySelector("#course-list").appendChild(node);
    }
  }

  function friendList(data) {
    for (var i = 0; i < 10; i++) {
      if (i >= data.length) {
        break;
      }
      let node = document.createElement("li");
      let img = document.createElement("img");
      let div = document.createElement("div");
      //user hidden data
    
      node.id = data[i].username;
      if (data[i].profilePic == undefined) {
        img.src = "/images/blank-profile-pic.png";
      } else {
        img.src = data[i].profilePic;
      }

      if (i >= data.length) {
        break;
      }
   

      node.id = data[i].username;
      if (data[i].profilePic == undefined) {
        img.src = "/images/blank-profile-pic.png";
      } else {
        img.src = data[i].profilePic;
      }

      node.addEventListener("click", (event) => {
        //redirect user to dashboard view page
        window.location.href = `/viewDash?user=${event.target.id}`;
      });

      node.className = "friend";
      div.className = "name";
      node.appendChild(img);
      node.appendChild(document.createTextNode(data[i].fullname));
      document.querySelector("#friends-list").appendChild(node);
    }
  }

  document.getElementById("all-friends").addEventListener("click", function () {
    window.location.href = "/findFriends/" + search;
  });
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
    serverCon("POST", { aboutme: text.value }, "/aboutMe");
    console.log(event.target);
  };
}

function getCourseList() {
  let classModal = document.getElementById("class-modal");
  classModal.style.display = "initial";
  let classForm = document.getElementById("courseSub");
  let classes = [];

  classForm.onclick = async function (event) {
    classModal.style.display = "none";
    event.preventDefault();
    console.log("test clas form");
    const formData = new FormData(document.getElementById("courseform"));
    for (let pair of formData.entries()) {
      if (pair[1] != "") {
        classes.push(pair[1].replace(/\s+/g, ""));
      }
    }
    await fetch(window.location.origin + "/courses", {
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
  };

  var span = document.getElementById("closecourse");
  //when user clicks x modal closes
  span.onclick = function () {
    classModal.style.display = "none";
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
