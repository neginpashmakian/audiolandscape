define(function () {
  function colourVertices(
    geometry,
    colours,
    waterLevel,
    mountainLevel,
    avgVolume,
    waterColour
  ) {
    const verts = geometry.vertices;
    const maxZ = Math.abs(verts[verts.length - 1].z);
    const seaColor = new THREE.Color(waterColour);

    function computeVertexColor(y, z) {
      const heightAboveWater = y - waterLevel;
      const zFade = 1.0 - Math.min(1, Math.abs(z) / maxZ);

      let color;
      if (heightAboveWater < 0.5) {
        const brightness = 0.5 + 0.5 * Math.max(0, heightAboveWater / 0.5);
        color = seaColor.clone().multiplyScalar(brightness);
      } else {
        const t = Math.min(1, heightAboveWater / (mountainLevel - waterLevel));
        const index = Math.floor(t * (colours.length - 1));
        const baseColor = new THREE.Color(colours[index]);

        const volumeFade = 1.0 - Math.min(1, avgVolume / 80);
        color = baseColor.clone().lerp(seaColor, volumeFade * 0.6);
      }

      return color.lerp(new THREE.Color("#000000"), 1 - zFade);
    }

    for (let k = 0; k < geometry.faces.length; k++) {
      const face = geometry.faces[k];
      const vA = verts[face.a];
      const vB = verts[face.b];
      const vC = verts[face.c];

      face.vertexColors = [
        computeVertexColor(vA.y, vA.z),
        computeVertexColor(vB.y, vB.z),
        computeVertexColor(vC.y, vC.z),
      ];
    }

    geometry.colorsNeedUpdate = true;
  }

  function addFace(geometry, bottomLeftVertex, topRightVertex) {
    geometry.faces.push(
      new THREE.Face3(bottomLeftVertex, bottomLeftVertex + 1, topRightVertex)
    );
    geometry.faces.push(
      new THREE.Face3(topRightVertex, topRightVertex - 1, bottomLeftVertex)
    );
  }

  function addFaces(geometry, resolution, totalRows) {
    for (let i = 0; i < totalRows - 1; i++) {
      for (let j = 0; j < resolution * 2 - 1; j++) {
        const rowOffset = i * resolution * 2;
        addFace(geometry, rowOffset + j, rowOffset + resolution * 2 + j + 1);
      }
    }
  }

  function colourFaces(geometry, colours) {
    for (let k = 0; k < geometry.faces.length; k++) {
      geometry.faces[k].vertexColors = [
        new THREE.Color(colours[0]),
        new THREE.Color(colours[0]),
        new THREE.Color(colours[0]),
      ];
    }
  }

  function addRow(geometry, resolution, unitsPerVertex, rowNum) {
    for (let i = 0; i < resolution * 2; i++) {
      geometry.vertices.push(
        new THREE.Vector3(i * unitsPerVertex, 0, -rowNum * 5)
      );
    }
  }

  function buildGeometry(
    geometry,
    resolution,
    totalRows,
    unitsPerVertex,
    colours
  ) {
    for (let i = 0; i < totalRows; i++) {
      addRow(geometry, resolution, unitsPerVertex, i);
    }
    addFaces(geometry, resolution, totalRows);
    colourFaces(geometry, colours);

    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  }

  function buildMesh(geometry) {
    return new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({
        vertexColors: THREE.VertexColors,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        flatShading: false,
      })
    );
  }

  function requiredOptions(options) {
    const required = [
      "resolution",
      "numRows",
      "waterLevel",
      "mountainLevel",
      "unitsPerVertex",
      "colours",
      "cameraXRange",
      "meshX",
      "meshZ",
      "waterColour",
    ];
    required.forEach((key) => {
      if (!options[key]) throw new Error(`${key} is required`);
    });
  }

  function Landscape(options) {
    requiredOptions(options || {});

    this.resolution = options.resolution;
    this.numRows = options.numRows;
    this.waterLevel = options.waterLevel;
    this.mountainLevel = options.mountainLevel;
    this.colours = options.colours;
    this.unitsPerVertex = options.unitsPerVertex;
    this.cameraXRange = options.cameraXRange;
    this.waterColour = options.waterColour;

    this.geometry = new THREE.Geometry();
    this.mesh = buildMesh(this.geometry);
    this.mesh.position.x = options.meshX;
    this.mesh.position.z = options.meshZ;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    buildGeometry(
      this.geometry,
      this.resolution,
      this.numRows,
      this.unitsPerVertex,
      this.colours
    );
  }

  Landscape.prototype.getCameraTargetY = function (cameraX) {
    const vertices = this.geometry.vertices;
    const doubleResolution = this.resolution * 2;
    const scale = (this.resolution / this.cameraXRange) * 1.2;
    const xOffset = Math.ceil((cameraX * scale) / this.unitsPerVertex);
    const offset = this.resolution + xOffset;
    const far = offset + doubleResolution * (this.numRows - 20);
    const near = offset + doubleResolution * (this.numRows - 10);
    const under = offset + doubleResolution * (this.numRows - 5);

    return Math.max(
      vertices[far]?.y || 0,
      vertices[near]?.y || 0,
      vertices[near - 2]?.y || 0,
      vertices[near + 2]?.y || 0,
      vertices[under]?.y || 0
    );
  };

  Landscape.prototype.onAudioTick = function (frequencyData) {
    const t = performance.now() * 0.002;
    const resolution = this.resolution;
    const numRows = this.numRows;
    const geometry = this.geometry;

    const baseWaveHeight = 6;
    const waveFreqX = 0.15;
    const waveFreqZ = 0.1;
    const audioBoost = 0.25;
    const smoothingFactor = 0.6;

    const avgVolume =
      frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length;
    const dynamicWaveHeight = baseWaveHeight + avgVolume * 0.05;

    const vertices = geometry.vertices;
    for (let z = 0; z < numRows; z++) {
      const rowPhase = z * 0.3;
      for (let x = 0; x < resolution * 2; x++) {
        const i = z * resolution * 2 + x;
        const freq = frequencyData[x % resolution] || 0;

        const wave =
          Math.sin(x * waveFreqX + t + rowPhase) * Math.cos(z * waveFreqZ + t);

        const targetY = wave * dynamicWaveHeight + freq * audioBoost * 0.05;

        vertices[i].y =
          vertices[i].y * (1 - smoothingFactor) + targetY * smoothingFactor;
      }
    }

    geometry.verticesNeedUpdate = true;
    geometry.computeVertexNormals();

    colourVertices(
      geometry,
      this.colours,
      this.waterLevel,
      this.mountainLevel,
      avgVolume,
      this.waterColour
    );
  };

  return Landscape;
});
