# 🌊 Interactive Music Visualization: Sea, Waves & Boats

This project is a **real-time 3D music visualizer** built with **Three.js**. It dynamically simulates waves, birds, and a boat that all react to the music being played. The landscape evolves with the beat, providing an immersive, artistic visualization of audio.

---

## 🚀 Features

- 🌊 Dynamic wave simulation based on music volume
- 🐦 Birds appear and flap to the beat
- 🚤 A floating boat traverses the sea
- 🎶 Visual environment reacts to frequency spectrum of the song
- ☁️ Sky and sea with customizable textures
- 💡 Real-time lighting and fog effects

---

## 📁 Project Structure

📂 project-root/
├── index.html
├── js/
│ ├── main.js # Entry point
│ ├── viz.js # Main visualization logic
│ ├── boat.js # Boat geometry and animation
│ ├── bird.js # Bird generator
│ ├── Landscape.js
│ ├── LandscapeInverted.js
│ ├── LandscapeDetails.js
│ ├── Lighting.js
│ ├── StaticDecoration.js
│ ├── Sandbox.js
│ ├── AudioData.js
│ ├── DragDropArrayBuffer.js
│ ├── LandscapeUI.js
├── mp3/
│ └── starworshipper.mp3 # Default song (replaceable)
├── img/
│ └── sky.jpg # Sky texture

yaml
Copy
Edit

---

## ▶️ How to Run the Application

> The project is **purely client-side** and does not require any backend or build step.

### ✅ Steps

1. Open index.html using Live Server in VS Code or another tool.

2. Right-click index.html → Open with Live Server

3. Or use the extension "Live Server" in VS Code

4. The application will open in your default browser at:

cpp
Copy
Edit
http://127.0.0.1:5500/

##

🎵 Using the Application
Upon launch, the visualization starts automatically with the default music file.

You can drag and drop your own .mp3 files onto the screen to visualize your music.

The boat floats forward automatically; birds spawn based on beat detection.

Waves dynamically respond to the frequency and intensity of the sound.
