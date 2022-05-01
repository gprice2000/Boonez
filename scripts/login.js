document.addEventListener('DOMContentLoaded', function() {
    console.log("origin: " + window.location.origin)
    let sub = document.getElementById("submitlogin");
    sub.addEventListener('click', async function(event) {
        event.preventDefault();
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let obj = {username, password}


        await fetch("http://localhost:3000/login", {
            method: 'POST', 
            credentials: 'same-origin',
            mode: 'same-origin',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(obj),
        })
        .then(response =>  response.json())
        .then(data => {
            console.log("data: " + data)
            if (data == 'CFU'){
                getUserError();
            } else if (data == 'PI'){
                getPassError();
            }
        })
        .catch((error) => {
            console.log("Error: " + error)
        });
    })

    function getUserError() {
        let usertext = document.getElementById("username");
        document.getElementById("wronguser").style.display = "initial";
        
    }

    function getPassError() {
        let passtext = document.getElementById("password");
        document.getElementById("wrongpass").style.display = "initial";
    }
})