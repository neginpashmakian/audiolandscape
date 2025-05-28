define(function () {
  return function buildFoam() {
    const geometry = new THREE.CircleGeometry(1.2, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const foam = new THREE.Mesh(geometry, material);

    // Flattened to sit on surface
    foam.rotation.x = -Math.PI / 2;

    // Random size
    const s = 0.6 + Math.random() * 0.8;
    foam.scale.set(s, s, s);

    // Initial elevation
    foam.position.y = 0.5;

    console.log("🌊 Foam detail created");
    return foam;
  };
});
