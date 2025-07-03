define(["js/DragDropArrayBuffer"], function (DragDropArrayBuffer) {
  var locked = false;

  function LandscapeUI() {
    // ✅ Create an empty DOM container — you control what goes inside from viz.js
    this.domNode = document.createElement("div");
    this.domNode.className = "LandscapeUI";
  }

  // ✅ Handle default MP3 file click (triggered manually in viz.js)
  LandscapeUI.prototype.onPlayDefault = function (callback) {
    var domNode = this.domNode;
    domNode.addEventListener(
      "click",
      function () {
        if (locked) return;
        domNode.remove(); // Optional: remove UI after interaction
        callback();
      },
      false
    );
  };

  // ✅ Handle drag & drop of MP3 files
  LandscapeUI.prototype.onDragAudio = function (callback) {
    var domNode = this.domNode;
    domNode.addEventListener("drop", function () {
      locked = true;
    });
    DragDropArrayBuffer.init(this.domNode, function (arrayBuffer) {
      domNode.remove(); // Optional: remove UI after drop
      callback(arrayBuffer);
    });
  };

  return LandscapeUI;
});
