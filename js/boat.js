define(function () {
  return function buildBoat() {
    const boat = new THREE.Group();

    // === Hull ===
    const hullGeom = new THREE.CylinderGeometry(0.8, 2.5, 6, 12);
    const hullMat = new THREE.MeshLambertMaterial({
      color: 0xcc5500, // 🔶 Bright orange-brown wood tone
    });
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.rotation.z = Math.PI / 2;
    boat.add(hull);

    // === Steering Wheel (decorative) ===
    const wheelGeom = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
    const wheelMat = new THREE.MeshLambertMaterial({
      color: 0xffff66, // 🟡 bright yellow for visibility
      emissive: 0x333300, // subtle glow
    });
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.position.set(1.2, 0.5, 0);
    boat.add(wheel);

    // === Water Splashes ===
    const splashGeom = new THREE.SphereGeometry(0.2, 6, 6);
    const splashMat = new THREE.MeshLambertMaterial({
      color: 0x99ddff, // 💧 brighter splash color
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

    // === Position & Scale ===
    boat.scale.set(6, 6, 6);
    boat.position.set(0, 5, 100);
    boat.name = "boat";

    return boat;
  };
});
