# Gradient Stripe

A high-performance recreation of Stripe's animated mesh gradient effect, implemented with WebGL and customized through an interactive control panel.

[Live Demo](https://exzenter.github.io/gradient-stripe/)

## Technical Implementation: Tricks and Finesses

The fluid, organic movement of this gradient is achieved through several layered techniques in GLSL and CSS.

### 1. Fractal Brownian Motion (FBM)
Instead of using simple noise, the shader employs Fractal Brownian Motion. This technique layers multiple octaves of Simplex noise, where each successive layer has a higher frequency (lacunarity) and lower amplitude (persistence). This creates the "wispy" and detailed structures seen in the flow, rather than just smooth blobs.

### 2. Mesh Modulation
To avoid the static look of pure noise, the coordinate system is modulated by a sinusoidal mesh. By applying `sin()` and `cos()` functions to the UV coordinates with time-based offsets, the noise "warps" against itself. This simulates the look of liquid surfaces or stretched fabric.

### 3. Internal Shader Blend Modes
The most critical part of the aesthetic is how colors transition. Instead of a simple `mix()`, the shader implements professional blend modes (Multiply, Screen, Overlay, etc.) directly in the fragment shader. This allows colors to "interact" rather than just overlap, creating vibrant highlights and deep shadows that standard linear interpolation cannot achieve.

### 4. Geometry and Masking
The "stripe" effect uses a clever CSS trick. The actual WebGL canvas is a full rectangle, but its container is transformed using `skewY(-12deg)` and `overflow: hidden`. This creates the signature sharp diagonal edges that define the Stripe design language without requiring complex geometry in the canvas itself.

## Features

### Configuration Panel
* **Color Management**: Four independent color pickers with preset themes.
* **Animation Control**: Adjustable speed, turbulence, and detail (octaves).
* **Physics Simulation**: Controls for lacunarity and mesh intensity to vary the liquid behavior.
* **Visual Effects**: Built-in CSS blend modes and blur filters.

### Performance
* **GPU Acceleration**: All heavy lifting is handled by GLSL fragment shaders.
* **Zero Dependencies**: Pure JavaScript and WebGL implementation.
* **Optimized Noise**: 3-layer Simplex noise optimized for 60 FPS on mobile and desktop.

## Technical Specifications

* **Technology**: WebGL 1.0 / GLSL
* **Noise Algorithm**: Simplex Noise (Fractal)
* **Default Skew**: -12 degrees
* **Blending**: 8 shader-internal modes + 16 CSS container modes

## Usage

Open `stripe-gradient.html` in any modern browser. Use the settings panel (accessible via the gear icon) to modify the animation parameters in real-time. Settings can be exported and imported as JSON.

## Browser Support

Compatible with all browsers supporting WebGL 1.0:
* Chrome 56+
* Firefox 51+
* Safari 11+
* Edge 12+

## Credits

Inspired by the design language observed on Stripe's billing and marketing pages.
