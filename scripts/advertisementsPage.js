function getAdvertisements() {}

async function renderAds() {
  let ads = await getAdvertisements();

  for (ad of ads) {
    let adCont = document.createElement("div");
    adCont.id = "advertisement";
  }
}

renderAds();
