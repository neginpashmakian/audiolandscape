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
  Bird
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

    var stats = makeStats();
    var resolution = 64;
    var numRows = 105;
    var waterLevel = 1;
    var useFog = config.useFog === false ? false : true;
    var systemX = -390;
    var systemZ = 115;

    var sandbox = new Sandbox();

    // ✅ Add this right after sandbox is created:
    if (config.skyMap) {
      const loader = new THREE.TextureLoader();
      loader.load(config.skyMap, function (texture) {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;

        // ✅ Create a large flat plane for the sky
        const geometry = new THREE.PlaneGeometry(10000, 5000); // wide and tall
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const skyPlane = new THREE.Mesh(geometry, material);
        skyPlane.position.set(0, 1500, -4000); // Y up, Z back
        skyPlane.rotation.x = 0; // face forward
        sandbox.scene.add(skyPlane);
      });
    }

    if (useFog) {
      sandbox.scene.fog = new THREE.Fog(config.fogColour, 0, 800);
    }

    var cameraTargetY = 0;
    var cameraAccel = 0;
    var landscape;
    var landscapeOptions = {
      resolution: resolution,
      numRows: numRows,
      waterLevel: waterLevel,
      mountainLevel: config.mountainLevel || 50,
      unitsPerVertex: 6,
      colours: config.landColours,
      cameraXRange: 150 / 2,
      meshX: systemX,
      meshZ: systemZ,
      wireframeOverlay: config.wireframeOverlay,
    };

    if (config.landscapeType === "inverted") {
      landscape = new LandscapeInverted(landscapeOptions);
    } else {
      landscape = new Landscape(landscapeOptions);
    }

    var landscapeDetails = new LandscapeDetails({
      resolution: resolution,
      numRows: numRows,
      waterLevel: waterLevel,
      offsetX: systemX,
      offsetZ: systemZ,
      type: config.detailType,
    });

    var lighting = new Lighting({
      resolution: resolution,
      spotlightX: -52,
      spotlightZ: 900,
      spotlightColour: config.spotlightColour,
    });

    var staticDecoration = new StaticDecoration({
      waterLevel: waterLevel,
      waterColour: config.waterColour,
      skyMap: config.skyMap,
    });

    function moveCamera() {
      //   const t = performance.now() * 0.002;
      //   const waveHeight = 4; // bob amplitude

      var delta = cameraTargetY - sandbox.camera.position.y;
      var accelChange = delta / 100;

      cameraAccel += accelChange;
      cameraAccel *= 0.9;
      sandbox.camera.position.y += cameraAccel;

      //   // 👇 Add bobbing effect
      //   const wave = Math.sin(t) * waveHeight;

      //   sandbox.camera.position.y = cameraTargetY + wave;

      // Prevent clipping below
      if (sandbox.camera.position.y < 6) {
        sandbox.camera.position.y = 6;
      }
    }

    var audio = new AudioData({
      bufferWidth: resolution,
      onTick: function (freqArray) {
        // Update terrain & lighting
        landscape.onAudioTick(freqArray);
        lighting.onAudioTick(freqArray);

        // Optional detail (trees, lights, foam)
        if (config.includeDetail) {
          landscapeDetails.onTick(
            sandbox,
            landscape.geometry,
            stats.getFPS() > 30
          );
        }

        // Camera follows terrain
        cameraTargetY =
          landscape.getCameraTargetY(sandbox.camera.position.x) +
          config.cameraHeight;

        // === 🎶 Beat Detection ===
        let sum = 0;
        for (let i = 0; i < freqArray.length; i++) {
          sum += freqArray[i];
        }
        const avgVolume = sum / freqArray.length;
        const bass = (freqArray[0] + freqArray[1] + freqArray[2]) / 3;

        // ✅ Spawn bird on beat (bass or overall volume)
        if (bass > 190 || avgVolume > 160) {
          if (Math.random() < 0.4) {
            const bird = Bird();
            bird.position.set(
              Math.random() * 100 - 50, // X
              70 + Math.random() * 20, // Y (fly height)
              100 // Z (spawn distance)
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

      //   birds.forEach((bird) => {
      //     bird.position.z -= 1.5;

      //     // Wing animation
      //     const t = performance.now() * 0.005;
      //     const flap = Math.sin(t + bird.position.x) * 0.3;

      //     const leftWing = bird.getObjectByName("wingLeft");
      //     const rightWing = bird.getObjectByName("wingRight");

      //     if (leftWing && rightWing) {
      //       leftWing.rotation.z = flap;
      //       rightWing.rotation.z = -flap;
      //     }
      //   });

      // Remove out-of-view birds
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

    sandbox.add(staticDecoration.getObjects());
    sandbox.add(landscape.mesh);
    sandbox.add(lighting.getLighting());

    var ui = new LandscapeUI();
    ui.onDragAudio(function (arrayBuffer) {
      audio.onLoadAudio(arrayBuffer);
    });
    ui.onPlayDefault(function () {
      audio.loadUrl(config.mp3Url);
    });

    sandbox.appendTo(document.body);
    // const testBird = Bird();
    // testBird.position.set(0, 80, 0);
    // sandbox.add(testBird);
    // birds.push(testBird);

    // const testBird = Bird();
    // testBird.position.set(0, 80, 0); // Directly in front of camera
    // sandbox.add(testBird);

    document.body.appendChild(ui.domNode);

    requestAnimationFrame(tick);
  };
});
