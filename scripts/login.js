document.addEventListener("DOMContentLoaded", function () {
  console.log("origin: " + window.location.origin);
  let sub = document.getElementById("submitlogin");
  sub.addEventListener("click", async function (event) {
    event.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let obj = { username, password };

    await fetch(window.location.origin + "/login", {
      method: "POST",
      credentials: "same-origin",
      mode: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data: " + data);
        if (data.info == "CFU") {
          getUserError();
        } else if (data.info == "PI") {
          getPassError();
        } else if (data.info == "match") {
          console.log("test redirect");
          if (data.accountType == "business")
            window.location.href = `/BusinessDashboard?user=${username}`;
          else window.location.href = `/dashboard?user=${username}`;
        }
      })
      .catch((error) => {
        console.log("Error: " + error);
      });
  });

  function getUserError() {
    let usertext = document.getElementById("username");
    document.getElementById("wrongpass").style.display = "none";
    document.getElementById("password").style.borderColor = "rgb(84, 84, 84)";
    document.getElementById("wronguser").style.display = "initial";
    usertext.style.borderColor = "red";
  }

  function getPassError() {
    let passtext = document.getElementById("password");
    document.getElementById("wronguser").style.display = "none";
    document.getElementById("username").style.borderColor = "rgb(84, 84, 84)";
    document.getElementById("wrongpass").style.display = "initial";
    passtext.style.borderColor = "red";
  }
});
