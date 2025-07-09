define(function () {
  return function buildBoat() {
    const boat = new THREE.Group();

    // === Hull ===
    const hullGeom = new THREE.CylinderGeometry(0.8, 2.5, 6, 12);
    const hullMat = new THREE.MeshLambertMaterial({ color: 0xcc5500 });
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.rotation.z = Math.PI / 2;
    boat.add(hull);

    // === Steering Wheel ===
    const wheelGeom = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
    const wheelMat = new THREE.MeshLambertMaterial({
      color: 0xffff66,
      emissive: 0x333300,
    });
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.position.set(1.2, 0.5, 0);
    boat.add(wheel);

    // === Water Splashes ===
    const splashGeom = new THREE.SphereGeometry(0.2, 6, 6);
    const splashMat = new THREE.MeshLambertMaterial({
      color: 0x99ddff,
      transparent: true,
      opacity: 0.6,
    });
    for (let i = 0; i < 10; i++) {
      const splash = new THREE.Mesh(splashGeom, splashMat);
      splash.position.set(
        -2 - Math.random(),
        Math.random() * 0.8 - 0.4,
        Math.random() * 0.5 - 0.25
      );
      boat.add(splash);
    }

    // === Mast ===
    const mastGeom = new THREE.CylinderGeometry(0.05, 0.05, 6, 8);
    const mastMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const mast = new THREE.Mesh(mastGeom, mastMat);
    mast.position.set(0.5, 3, 0);
    boat.add(mast);

    // === Sail (curved triangle facing camera) ===
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0);
    sailShape.lineTo(0, 5);
    sailShape.quadraticCurveTo(2, 2.5, 0, 0); // curved sail

    const sailGeom = new THREE.ShapeGeometry(sailShape);
    const sailMat = new THREE.MeshLambertMaterial({
      color: 0x005577,
      side: THREE.DoubleSide,
    });
    const sail = new THREE.Mesh(sailGeom, sailMat);
    sail.rotation.y = Math.PI / 2; // face the camera directly
    sail.position.set(0.5, 0.5, 0); // attach to mast base
    boat.add(sail);

    // === Scale, Position & Orientation for visibility ===
    boat.scale.set(6, 6, 6);
    boat.position.set(0, 5, 100);
    boat.rotation.y = -Math.PI / 5; // rotate boat slightly toward camera
    boat.name = "boat";

    return boat;
  };
});
