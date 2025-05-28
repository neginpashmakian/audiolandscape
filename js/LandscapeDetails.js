define(["js/tree", "js/pointLight", "js/waveFoam"], function (
  treeBuilder,
  pointLight,
  waveFoam
) {
  "use strict";

  function buildDetailItem(position, type) {
    var detailItem;

    if (type === "tree") {
      detailItem = treeBuilder();
    } else if (type === "light") {
      detailItem = pointLight();
    } else if (type === "foam") {
      console.log("🟢 Creating foam detail");
      detailItem = waveFoam();
    }

    detailItem.position.add(position);

    return detailItem;
  }

  function addRandomDetail(
    geometry,
    resolution,
    waterLevel,
    mountainLevel,
    offset,
    type
  ) {
    var candidateVertices = [];
    var y;
    for (var i = 0; i < resolution * 2; i++) {
      y = geometry.vertices[i].y;
      if (y > waterLevel + 3 && y < mountainLevel) {
        candidateVertices.push(i);
      }
    }
    if (!candidateVertices.length) {
      return;
    }

    var chosenVertex =
      candidateVertices[Math.floor(Math.random() * candidateVertices.length)];
    var mesh = buildDetailItem(geometry.vertices[chosenVertex], type);
    mesh.position.add(offset);
    return mesh;
  }

  function destroyMesh(sandbox, mesh) {
    var childMesh;
    if (mesh.children) {
      for (
        var i = 0, numChildren = mesh.children.length;
        i < numChildren;
        i++
      ) {
        childMesh = mesh.children[i];
        sandbox.remove(childMesh);
      }
    }
    sandbox.remove(mesh);
  }

  function requiredOptions(options) {
    var required = [
      "resolution",
      "numRows",
      "waterLevel",
      "offsetX",
      "offsetZ",
    ];
    required.forEach(function (key) {
      if (!options[key]) {
        throw new Error(key + " is required");
      }
    });
  }

  function LandscapeDetails(options) {
    requiredOptions(options || {});

    this.resolution = options.resolution;
    this.numRows = options.numRows;
    this.waterLevel = options.waterLevel;
    this.offset = new THREE.Vector3(options.offsetX, 0, options.offsetZ);
    this.zUnitsPerVertex = 5;
    this.type = options.type;

    this.items = [];
  }

  LandscapeDetails.prototype.addDetail = function addDetail(geometry) {
    var newMesh = addRandomDetail(
      geometry,
      this.resolution,
      this.waterLevel,
      50,
      this.offset,
      this.type
    );
    if (newMesh) {
      this.items.push(newMesh);
      return newMesh;
    }
  };

  LandscapeDetails.prototype.moveDetails = function moveDetails() {
    if (!this.items.length) return;

    const zUnits = this.zUnitsPerVertex;
    const t = performance.now() * 0.002;

    this.items.forEach(function (mesh) {
      mesh.position.z -= zUnits;

      // Bob up and down like waves
      const waveMotion = Math.sin(t + mesh.position.x * 0.2) * 0.6;
      mesh.position.y = 1 + waveMotion;

      // Optional: slight breathing pulse
      const scale = 0.8 + 0.2 * Math.sin(t + mesh.position.z * 0.1);
      mesh.scale.set(scale, scale, scale);
    });
  };

  LandscapeDetails.prototype.cullExpiredItems = function cullExpiredItems(
    sandbox
  ) {
    this.items = this.items.reduce(function (memo, mesh) {
      if (mesh.position.z > -400) {
        memo.push(mesh);
      } else {
        destroyMesh(sandbox, mesh);
      }
      return memo;
    }, []);
  };

  LandscapeDetails.prototype.onTick = function (sandbox, geometry, addDetail) {
    if (addDetail) {
      var detail = this.addDetail(geometry);
      if (detail) {
        sandbox.add(detail);
        console.log("🟢 Foam mesh added to scene:", detail.position.clone());
      }
    }
    this.moveDetails();
    this.cullExpiredItems(sandbox);
  };

  return LandscapeDetails;
});
