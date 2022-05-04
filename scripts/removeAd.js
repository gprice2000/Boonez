async function getAdvertisements() {
  let url = new URL(
    window.location.origin + "/getUsersAds" + window.location.search
  );
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      //send array of message objects

      renderAdForm(data);
    });
}

function renderAdForm(adsArr) {
  let adCont = document.getElementById("ad-cont");
  let count = 0;
  for (ad of adsArr) {
    console.dir(ad);
    let adItem = document.createElement("div");
    adItem.className = "advertisement";
    adItem.style.backgroundImage = `linear-gradient(
      rgba(255, 255, 255, 0.60), 
      rgba(255, 255, 255, 0.60)
    ),url(${ad.imglink})`;
    let checkBox = document.createElement("input");
    checkBox.className = "checkRemove";
    checkBox.type = "checkbox";
    checkBox.name = `remove_${count}`;
    checkBox.value = ad._id;
    // checkBox.onclick = () => (checkBox.checked = !checkBox.checked);
    adItem.appendChild(checkBox);
    let adComp = document.createElement("h1");
    adComp.className = "comp-name";
    adComp.innerText = ad.compname;
    adItem.appendChild(adComp);
    let adTitle = document.createElement("h1");
    adTitle.className = "head";
    adTitle.innerText = ad.adhead;

    adItem.appendChild(adTitle);

    let adBody = document.createElement("p");
    adBody.className = "adbody";
    adBody.innerText = ad.adbody;
    adItem.appendChild(adBody);

    adCont.appendChild(adItem);
    count++;
  }
}

getAdvertisements();
