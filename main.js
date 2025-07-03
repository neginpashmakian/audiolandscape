require(["viz"], function (viz) {
  "use strict";

  function launchCrystalCavern() {
    viz({
      fogColour: 0x99ccff,
      fogMinimumDistance: 600,
      landColours: [
        0x00ffff, 0x66ffff, 0x99ccff, 0xccddff, 0xffffff, 0xeeeeff, 0xddddff,
      ],
      spotlightColour: 0xccccff,
      includeDetail: false,
      detailType: "light",
      waterColour: 0x66ccff,
      skyMap: "img/sky.jpg",
      cameraHeight: 30,
      mp3Url: "mp3/starworshipper.mp3",
      wireframeOverlay: false,
      landscapeType: "inverted",
    });
  }

  function launchSeaSky() {
    viz({
      useFog: false,
      fogMinimumDistance: 400,
      landColours: [
        0x002b5c, 0x004c99, 0x0077be, 0x00bfff, 0xaaddff, 0xe0f7fa, 0xf0f0e0,
      ],
      wireframeOverlay: true,
      spotlightColour: 0x88ccff,
      includeDetail: true,
      detailType: "foam",
      waterColour: 0x0066cc,
      skyMap: "img/sky.jpg",
      cameraHeight: 15,
      mp3Url: "mp3/morning-mood-grieg.mp3",
      landscapeType: "inverted",
      mountainLevel: 20,
    });
  }

  function launchVapor() {
    viz({
      useFog: false,
      landColours: [
        0x88ccff, 0x004477, 0x006699, 0x3399cc, 0x66ccff, 0xaaddff, 0xffffff,
      ],
      detailType: "foam",
      wireframeOverlay: true,
      spotlightColour: 0x88ccff,
      includeDetail: false,
      waterColour: 0x0066cc,
      skyMap: "img/sky.jpg",
      cameraHeight: 10,
      mp3Url: "mp3/starworshipper.mp3",
      landscapeType: "inverted",
    });
  }

  function launchVolcano() {
    viz({
      fogColour: 0x000000,
      fogMinimumDistance: 200,
      landColours: [
        0x221111, 0x442222, 0x9c2a00, 0xcf5f10, 0xcf1020, 0xcf1020, 0xcf5f10,
      ],
      spotlightColour: 0xa08f65,
      includeDetail: true,
      detailType: "light",
      waterColour: 0x9c2a00,
      skyMap: "img/cracks.jpg",
      cameraHeight: 30,
      mp3Url: "mp3/move-around.mp3",
    });
  }

  function launchHills() {
    viz({
      fogColour: 0xfff5ac,
      fogMinimumDistance: 700,
      landColours: [
        0x339900, 0x72b84f, 0xcce5bf, 0xe5f2df, 0xf2f8ef, 0xffffff, 0xefdd6f,
      ],
      spotlightColour: 0xa08f65,
      includeDetail: true,
      detailType: "tree",
      waterColour: 0x40a4df,
      skyMap: "img/sky.jpg",
      cameraHeight: 5,
      mp3Url: "mp3/morning-mood-grieg.mp3",
    });
  }

  function handleClick() {
    const introNode = document.querySelector(".intro");
    if (introNode) introNode.remove();

    const cls = this.className;
    if (cls.includes("volcano")) return launchVolcano();
    if (cls.includes("vapor")) return launchVapor();
    if (cls.includes("crystal")) return launchCrystalCavern();
    if (cls.includes("seasky")) return launchSeaSky();

    launchHills();
  }

  const links = Array.from(document.querySelectorAll(".launch"));
  links.forEach((link) => {
    link.addEventListener("click", handleClick, false);
  });
});
