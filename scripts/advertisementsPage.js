const search = window.location.search;
document.addEventListener("DOMContentLoaded", function () {

  async function getAdvertisements() {
    
    let url = new URL(window.location.href + "/fetchAds");
    await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("data: " + data)
        //check if user is signed in first
        if (data == "nsi") {
          window.location.href = "/login";
        }
        console.log("data.account type: " + data.type)
        if (data.type != "personal") {
          console.log("business")
            document.getElementById("personal").style.display = "none";
            document.getElementById("business").style.display = "initial";
            document.getElementById("bus-dash").href = `/BusinessDashboard${search}`;
            //document.getElementById("bus-advertisements").href = `/viewAdvertisements`;
            document.getElementById("bus-removeAdvertisements").href = `/removeAd${search}`;
            document.getElementById("bus-createAdvertisements").href = `/createAd${search}`;
        } else {
          console.log("personal")

            document.getElementById("dash").href = `/dashboard${search}`;
            document.getElementById("friends").href = `/findFriends${search}`;
            document.getElementById("messages").href = `/messagesOverviewPage${search}`;
          }

        //send array of message objects
        //console.log(data);
        renderAds(data.data);
      });
  }

  function renderAds(adsArr) {
    let adCont = document.getElementById("ad-cont");
    for (ad of adsArr) {
      console.dir(ad);
      let adItem = document.createElement("div");
      adItem.className = "advertisement";
      adItem.id = ad.weblink;
      adItem.style.backgroundImage = `linear-gradient(
        rgba(255, 255, 255, 0.60), 
        rgba(255, 255, 255, 0.60)
      ),url(${ad.imglink})`;
      let adComp = document.createElement("h1");
      adComp.className = "comp-name";
      adComp.innerText = ad.compname;
      adItem.appendChild(adComp);
      let adTitle = document.createElement("h1");
      adTitle.className = "head";
      adTitle.innerText = ad.adhead;

      adItem.onclick = () => window.open(adItem.id, "__blank");
      adItem.appendChild(adTitle);

      let adBody = document.createElement("p");
      adBody.className = "adbody";
      adBody.innerText = ad.adbody;
      adItem.appendChild(adBody);

      adCont.appendChild(adItem);
    }
  }
  let dash = document.getElementById("dash");
  dash.addEventListener("click", () => {
    window.history.go(-1);
  });
  getAdvertisements();
});
