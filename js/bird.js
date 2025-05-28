define(function () {
  return function buildBird() {
    const bird = new THREE.Group();
    const black = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });

    // === Wing Shape: flat V ===
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(1.5, 0.5); // right wing tip
    wingShape.lineTo(0.8, 0); // right wing dip
    wingShape.lineTo(0, 0);
    wingShape.lineTo(-0.8, 0); // left wing dip
    wingShape.lineTo(-1.5, 0.5); // left wing tip
    wingShape.lineTo(0, 0); // back to center

    const wingGeom = new THREE.ShapeGeometry(wingShape);
    const wings = new THREE.Mesh(wingGeom, black);

    // Rotate slightly to lie flat
    wings.rotation.x = Math.PI / 2;
    bird.add(wings);

    // Optional: add a head bump (very minimal)
    const headGeom = new THREE.SphereGeometry(0.1, 6, 6);
    const head = new THREE.Mesh(headGeom, black);
    head.position.set(0.15, 0, 0.01);
    bird.add(head);

    // Scale larger for visibility
    bird.scale.set(2, 2, 2);

    return bird;
  };
});
