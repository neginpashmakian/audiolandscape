define(function () {
  function colourVertices(geometry, colours, waterLevel, mountainLevel) {
    for (let k = 0; k < geometry.faces.length; k++) {
      const face = geometry.faces[k];
      const vA = geometry.vertices[face.a];
      const vB = geometry.vertices[face.b];
      const vC = geometry.vertices[face.c];

      // Average Y height of the face
      const avgY = (vA.y + vB.y + vC.y) / 3;

      // Normalize avgY to [0, 1] between waterLevel and mountainLevel
      const t = Math.max(
        0,
        Math.min(1, (avgY - waterLevel) / (mountainLevel - waterLevel))
      );

      // Choose index from the gradient
      const index = Math.floor(t * (colours.length - 1));
      const baseColor = new THREE.Color(colours[index]);

      // Assign same color to all 3 vertices of this face
      face.vertexColors = [baseColor, baseColor, baseColor];
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
    var rowOffset;
    for (var i = 0; i < totalRows - 1; i++) {
      for (var j = 0; j < resolution * 2 - 1; j++) {
        rowOffset = i * resolution * 2;
        addFace(geometry, rowOffset + j, rowOffset + resolution * 2 + j + 1);
      }
    }
  }

  function colourFaces(geometry, colours) {
    for (var k = 0; k < geometry.faces.length; k++) {
      for (var l = 0; l < 3; l++) {
        geometry.faces[k].vertexColors[l] = new THREE.Color(colours[0]);
      }
    }
  }

  function addRow(geometry, resolution, unitsPerVertex, rowNum) {
    for (var i = 0; i < resolution * 2; i++) {
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
    for (var i = 0; i < totalRows; i++) {
      addRow(geometry, resolution, unitsPerVertex, i);
    }
    addFaces(geometry, resolution, totalRows);
    colourFaces(geometry, colours);

    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  }

  function buildMesh(geometry, includeWireframe) {
    var material = new THREE.MeshLambertMaterial({
      vertexColors: THREE.VertexColors,
    });
    if (includeWireframe) {
      return THREE.SceneUtils.createMultiMaterialObject(geometry, [
        material,
        new THREE.MeshBasicMaterial({
          color: 0x88ccff,
          wireframe: true,
        }),
      ]);
    }
    return new THREE.Mesh(this.geometry, material);
  }

  function requiredOptions(options) {
    var required = [
      "resolution",
      "numRows",
      "waterLevel",
      "mountainLevel",
      "unitsPerVertex",
      "colours",
      "cameraXRange",
      "meshX",
      "meshZ",
    ];
    required.forEach(function (key) {
      if (!options[key]) {
        throw new Error(key + " is required");
      }
    });
  }

  function Landscape(options) {
    requiredOptions(options || {});

    this.resolution = options.resolution;
    this.numRows = options.numRows;
    this.waterLevel = options.waterLevel;
    this.colours = options.colours;
    this.unitsPerVertex = options.unitsPerVertex;
    this.cameraXRange = options.cameraXRange;

    this.geometry = new THREE.Geometry();
    this.mesh = buildMesh(this.geometry, options.wireframeOverlay);
    this.mesh.position.x = options.meshX;
    this.mesh.position.z = options.meshZ;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mountainLevel = options.mountainLevel;
    this.cameraDirection = 0;
    this.lastCameraPosition = 0;

    buildGeometry(
      this.geometry,
      this.resolution,
      this.numRows,
      this.unitsPerVertex,
      this.colours
    );
  }

  Landscape.prototype.getCameraTargetY = function getCameraTargetY(cameraX) {
    var vertices = this.geometry.vertices;
    var doubleResolution = this.resolution * 2;
    var camPosToResolutionRatio = (this.resolution / this.cameraXRange) * 1.2;
    var xVertexOffset = Math.ceil(
      (cameraX * camPosToResolutionRatio) / this.unitsPerVertex
    );
    var offset = this.resolution + xVertexOffset;
    var farVertex = offset + doubleResolution * (this.numRows - 20);
    var nearVertex = offset + doubleResolution * (this.numRows - 10);
    var undernearthVertex = offset + doubleResolution * (this.numRows - 5);

    var farY = vertices[farVertex].y;
    var nearY = vertices[nearVertex].y;
    var nearLeftY = vertices[nearVertex - 2].y;
    var nearRightY = vertices[nearVertex + 2].y;
    var underneathY = vertices[undernearthVertex].y;

    return Math.max(farY, nearY, nearLeftY, nearRightY, underneathY);
  };

  Landscape.prototype.onAudioTick = function onAudioTick(frequencyData) {
    const t = performance.now() * 0.001;
    const resolution = this.resolution;
    const numRows = this.numRows;
    const geometry = this.geometry;
    const waveHeight = 10;
    const waveFreqX = 0.25;
    const waveFreqZ = 0.15;
    const audioBoost = 0.2;

    const vertices = geometry.vertices;

    for (let z = 0; z < numRows; z++) {
      for (let x = 0; x < resolution * 2; x++) {
        const i = z * resolution * 2 + x;

        const waveX = Math.sin(x * waveFreqX + t);
        const waveZ = Math.cos(z * waveFreqZ + t * 1.5);
        const freq = frequencyData[x % resolution] || 0;

        // Combined wave with slight audio variation
        vertices[i].y = waveX * waveZ * waveHeight + freq * audioBoost * 0.1;
      }
    }

    geometry.verticesNeedUpdate = true;
    colourVertices(geometry, this.colours, this.waterLevel, this.mountainLevel);
  };

  return Landscape;
});
