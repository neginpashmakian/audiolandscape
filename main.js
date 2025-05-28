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
      // darker blue for the sky/fog
      fogMinimumDistance: 400,
      landColours: [
        0x002b5c, // deep ocean (navy blue)
        0x004c99, // mid ocean (dark blue)
        0x0077be, // light blue
        0x00bfff, // turquoise / tropical shallows
        0xaaddff, // very shallow water
        0xe0f7fa, // near-surface / wave crest
        0xf0f0e0, // white foam / sunlit highlight
      ],
      // gradient from sea depth to coral/sand
      wireframeOverlay: true,
      spotlightColour: 0x88ccff,
      includeDetail: true,
      wireframeOverlay: true,
      detailType: "foam", // can simulate floating sparkles or bubbles
      waterColour: 0x0066cc, // bright blue sea
      skyMap: "img/sky.jpg", // ⬅️ use a new image if possible
      cameraHeight: 15,
      mp3Url: "mp3/starworshipper.mp3",

      landscapeType: "inverted",
      mountainLevel: 20, // use normal if you want sea on bottom
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
    var introNode = document.querySelector(".intro");
    document.body.removeChild(introNode);

    if (this.className.indexOf("volcano") > -1) {
      return launchVolcano();
    }
    if (this.className.indexOf("vapor") > -1) {
      return launchVapor();
    }
    if (this.className.indexOf("crystal") > -1) {
      return launchCrystalCavern();
    }
    if (this.className.indexOf("seasky") > -1) {
      return launchSeaSky();
    }

    launchHills();
  }

  var links = Array.apply(null, document.querySelectorAll(".launch"));
  links.forEach(function (link) {
    link.addEventListener("click", handleClick, false);
  });
});
