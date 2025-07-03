define([
  "js/Landscape",
  "js/LandscapeInverted",
  "js/LandscapeDetails",
  "js/Lighting",
  "js/StaticDecoration",
  "js/Sandbox",
  "js/AudioData",
  "js/DragDropArrayBuffer",
  "js/LandscapeUI",
  "js/bird",
  "js/boat",
], function (
  Landscape,
  LandscapeInverted,
  LandscapeDetails,
  Lighting,
  StaticDecoration,
  Sandbox,
  AudioData,
  DragDropArrayBuffer,
  LandscapeUI,
  Bird,
  buildBoat
) {
  "use strict";

  return function viz(config) {
    function makeStats() {
      var stats = new Stats();
      stats.domElement.style.position = "absolute";
      stats.domElement.style.top = 0;
      document.body.appendChild(stats.domElement);
      return stats;
    }

    let birds = [];
    let boat;
    let audioStarted = false;

    const stats = makeStats();
    const resolution = 64;
    const numRows = 105;
    const waterLevel = 1;
    const useFog = config.useFog !== false;
    const systemX = -390;
    const systemZ = 115;

    const sandbox = new Sandbox();

    if (config.skyMap) {
      const loader = new THREE.TextureLoader();
      loader.load(config.skyMap, function (texture) {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;

        const geometry = new THREE.PlaneGeometry(10000, 5000);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const skyPlane = new THREE.Mesh(geometry, material);
        skyPlane.position.set(0, 1500, -4000);
        skyPlane.rotation.x = 0;
        sandbox.scene.add(skyPlane);
      });
    }

    if (useFog) {
      sandbox.scene.fog = new THREE.Fog(config.fogColour, 0, 800);
    }

    const landscapeOptions = {
      resolution,
      numRows,
      waterLevel,
      mountainLevel: config.mountainLevel || 50,
      unitsPerVertex: 6,
      colours: config.landColours,
      cameraXRange: 75,
      meshX: systemX,
      meshZ: systemZ,
      wireframeOverlay: config.wireframeOverlay,
    };

    const landscape =
      config.landscapeType === "inverted"
        ? new LandscapeInverted(landscapeOptions)
        : new Landscape(landscapeOptions);

    const landscapeDetails = new LandscapeDetails({
      resolution,
      numRows,
      waterLevel,
      offsetX: systemX,
      offsetZ: systemZ,
      type: config.detailType,
    });

    const lighting = new Lighting({
      resolution,
      spotlightX: -52,
      spotlightZ: 900,
      spotlightColour: config.spotlightColour,
    });

    const staticDecoration = new StaticDecoration({
      waterLevel,
      waterColour: config.waterColour,
      skyMap: config.skyMap,
    });

    let cameraTargetY = 0;
    let cameraAccel = 0;

    function moveCamera() {
      const delta = cameraTargetY - sandbox.camera.position.y;
      const accelChange = delta / 100;
      cameraAccel += accelChange;
      cameraAccel *= 0.9;
      sandbox.camera.position.y += cameraAccel;
      if (sandbox.camera.position.y < 6) sandbox.camera.position.y = 6;
    }

    const audio = new AudioData({
      bufferWidth: resolution,
      onTick: function (freqArray) {
        landscape.onAudioTick(freqArray);
        lighting.onAudioTick(freqArray);

        if (config.includeDetail) {
          landscapeDetails.onTick(
            sandbox,
            landscape.geometry,
            stats.getFPS() > 30
          );
        }

        cameraTargetY =
          landscape.getCameraTargetY(sandbox.camera.position.x) +
          config.cameraHeight;

        // === Beat Detection ===
        let sum = 0;
        for (let i = 0; i < freqArray.length; i++) sum += freqArray[i];
        const avgVolume = sum / freqArray.length;
        const bass = (freqArray[0] + freqArray[1] + freqArray[2]) / 3;

        if (bass > 190 || avgVolume > 160) {
          if (Math.random() < 0.4) {
            const bird = Bird();
            bird.position.set(
              Math.random() * 100 - 50,
              70 + Math.random() * 20,
              100
            );
            sandbox.add(bird);
            birds.push(bird);
            console.log(
              "🎶 Bird spawned on beat! Avg:",
              avgVolume.toFixed(1),
              "Bass:",
              bass.toFixed(1)
            );
          }
        }
      },
    });

    // === Add Boat ===
    boat = buildBoat();
    boat.position.set(0, 4, 100);
    sandbox.add(boat);

    function tick() {
      requestAnimationFrame(tick);
      stats.begin();
      sandbox.render();
      moveCamera();

      birds.forEach((bird) => {
        bird.position.z -= 1.5;
        const t = performance.now() * 0.005;
        const flap = Math.sin(t + bird.position.x) * 0.3;
        const leftWing = bird.getObjectByName("wingLeft");
        const rightWing = bird.getObjectByName("wingRight");
        if (leftWing && rightWing) {
          leftWing.rotation.z = flap;
          rightWing.rotation.z = -flap;
        }
      });

      birds = birds.filter((b) => {
        if (b.position.z < -400) {
          sandbox.remove(b);
          return false;
        }
        return true;
      });

      if (useFog) {
        sandbox.scene.fog.far =
          config.fogMinimumDistance + lighting.spotlight.position.y;
        sandbox.scene.fog.near = lighting.spotlight.position.y / 2;
      }

      stats.end();
    }

    // === Add to scene ===
    sandbox.add(staticDecoration.getObjects());
    sandbox.add(landscape.mesh);
    sandbox.add(lighting.getLighting());

    const ui = new LandscapeUI();

    // === Drag-and-drop handler ===
    ui.onDragAudio(function (arrayBuffer) {
      if (audioStarted) return;
      audioStarted = true;
      ui.domNode.remove();
      audio.onLoadAudio(arrayBuffer);
    });

    // === MP3 Play Button ===
    const playButton = document.createElement("div");
    playButton.innerText = "Drag MP3 file,\nor click to playssss";
    playButton.style.cursor = "pointer";
    playButton.style.textAlign = "center";
    playButton.style.whiteSpace = "pre-line";
    playButton.style.border = "2px dashed #333";
    playButton.style.borderRadius = "20px";
    playButton.style.padding = "10px 20px";
    playButton.style.background = "rgba(255, 255, 255, 0.3)";
    playButton.onclick = function () {
      if (audioStarted) return;
      audioStarted = true;
      ui.domNode.remove();
      audio.loadUrl(config.mp3Url);
    };

    // === Microphone Button ===
    const micButton = document.createElement("div");
    micButton.innerText = "Use\nMicrophone\nInput 🎤";
    micButton.style.marginTop = "20px";
    micButton.style.cursor = "pointer";
    micButton.style.textAlign = "center";
    micButton.style.whiteSpace = "pre-line";
    micButton.style.border = "2px dashed #333";
    micButton.style.borderRadius = "20px";
    micButton.style.padding = "10px 20px";
    micButton.style.background = "rgba(255, 255, 255, 0.3)";
    micButton.onclick = function () {
      if (audioStarted) return;
      audioStarted = true;
      ui.domNode.remove();
      audio.useMicInput();
    };

    // === Add buttons to UI ===
    ui.domNode.appendChild(playButton);
    ui.domNode.appendChild(micButton);

    sandbox.appendTo(document.body);
    document.body.appendChild(ui.domNode);
    requestAnimationFrame(tick);
  };
});
