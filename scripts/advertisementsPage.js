async function getAdvertisements() {
  let url = new URL(window.location.href + "/fetchAds");
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      //send array of message objects
      // console.log(data);
      renderAds(data);
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
    adTitle.className = "ad-head";
    adTitle.innerText = ad.adhead;

    adItem.onclick = () => window.open(adItem.id, "__blank");
    adItem.appendChild(adTitle);

    let adBody = document.createElement("p");
    adBody.className = "ad-body";
    adBody.innerText = ad.adbody;
    adItem.appendChild(adBody);

    adCont.appendChild(adItem);
  }
}

getAdvertisements();
