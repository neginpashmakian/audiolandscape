define(function () {
  function colourVertices(geometry, colours, waterLevel, mountainLevel) {
    for (var k = 0; k < geometry.faces.length; k++) {
      var aVertexY = geometry.vertices[geometry.faces[k].a].y;
      var bVertexY = geometry.vertices[geometry.faces[k].b].y;
      var cVertexY = geometry.vertices[geometry.faces[k].c].y;

      if (
        aVertexY > mountainLevel ||
        bVertexY > mountainLevel ||
        cVertexY > mountainLevel
      ) {
        var aIndex = Math.floor((aVertexY - mountainLevel) / 2);
        var bIndex = Math.floor((bVertexY - mountainLevel) / 2);
        var cIndex = Math.floor((cVertexY - mountainLevel) / 2);
        aIndex = Math.max(0, Math.min(5, aIndex));
        bIndex = Math.max(0, Math.min(5, bIndex));
        cIndex = Math.max(0, Math.min(5, cIndex));

        geometry.faces[k].vertexColors[0] = new THREE.Color(colours[aIndex]);
        geometry.faces[k].vertexColors[1] = new THREE.Color(colours[bIndex]);
        geometry.faces[k].vertexColors[2] = new THREE.Color(colours[cIndex]);
      } else {
        if (aVertexY > waterLevel && aVertexY < waterLevel + 1) {
          geometry.faces[k].vertexColors[0] = new THREE.Color(colours[6]);
          geometry.faces[k].resetSandA = true;
        } else if (aVertexY > waterLevel + 1 && geometry.faces[k].resetSandA) {
          geometry.faces[k].vertexColors[0] = new THREE.Color(colours[0]);
          geometry.faces[k].resetSandA = false;
        }
        if (bVertexY > waterLevel && bVertexY < waterLevel + 1) {
          geometry.faces[k].vertexColors[1] = new THREE.Color(colours[6]);
          geometry.faces[k].resetSandB = true;
        } else if (bVertexY > waterLevel + 1 && geometry.faces[k].resetSandB) {
          geometry.faces[k].vertexColors[1] = new THREE.Color(colours[0]);
          geometry.faces[k].resetSandB = false;
        }
        if (cVertexY > waterLevel && cVertexY < waterLevel + 1) {
          geometry.faces[k].vertexColors[2] = new THREE.Color(colours[6]);
          geometry.faces[k].resetSandC = true;
        } else if (cVertexY > waterLevel + 1 && geometry.faces[k].resetSandC) {
          geometry.faces[k].vertexColors[2] = new THREE.Color(colours[0]);
          geometry.faces[k].resetSandC = false;
        }
      }
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
    for (var i = 0; i < totalRows - 1; i++) {
      for (var j = 0; j < resolution * 2 - 1; j++) {
        var rowOffset = i * resolution * 2;
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

  function buildMesh(geometry) {
    var material = new THREE.MeshLambertMaterial({
      vertexColors: THREE.VertexColors,
    });
    return new THREE.Mesh(geometry, material);
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
    this.mesh = buildMesh(this.geometry);
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
    const t = performance.now() * 0.0005; // slow animation speed
    const resolution = this.resolution;
    const numRows = this.numRows;
    const geometry = this.geometry;

    const waveHeight = 6;
    const noiseScale = 0.1;
    const audioBoost = 0.2;

    const vertices = geometry.vertices;

    for (let z = 0; z < numRows; z++) {
      for (let x = 0; x < resolution * 2; x++) {
        const i = z * resolution * 2 + x;

        const nx = x * noiseScale;
        const nz = z * noiseScale;
        const noiseVal = noise.perlin2(nx + t, nz + t);
        const freq = frequencyData[x % resolution] || 0;

        vertices[i].y = noiseVal * waveHeight + freq * audioBoost * 0.1;
      }
    }

    geometry.verticesNeedUpdate = true;
    geometry.computeVertexNormals();
    colourVertices(geometry, this.colours, this.waterLevel, this.mountainLevel);
  };

  return Landscape;
});
