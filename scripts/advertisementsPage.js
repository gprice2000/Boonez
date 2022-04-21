async function getAdvertisements() {
  let url = new URL(window.location.href + "/fetchAds");
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      //send array of message objects
      console.log(data);
      //   renderAds(data);
    });
}

function renderAds(adsArr) {
  let adCont = document.getElementById("ad-cont");
  for (ad of adsArr) {
    console.dir(ad);
    let adItem = document.createElement("div");
    adItem.className = "advertisement";
    adItem.style.backgroundImage = `linear-gradient(
      rgba(255, 255, 255, 0.75), 
      rgba(255, 255, 255, 0.75)
    ),url(${ad.imglink})`;

    let adTitle = document.createElement("h1");
    adTitle.innerText = ad.adhead;

    adItem.onclick = () => window.open(ad.weblink, "__blank");
    adItem.appendChild(adTitle);
    adCont.appendChild(adItem);
  }
}

// getAdvertisements();

let testData = [
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
  {
    adhead: "WingStop",
    compname: "WingStop",
    category: "Food",
    adbody: "We have the best wings and beer in the area!",
    imglink:
      "https://cdn.winsightmedia.com/platform/files/public/2021-04/background/Wingstop-Exterior-Day_1617293539.jpg?VersionId=2tqBKPS8kpAM1GJeS12hIMaWUoO1kdn3",
    weblink: "https://www.wingstop.com/",
  },
];

renderAds(testData);
