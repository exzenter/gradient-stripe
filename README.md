# Gradient Stripe

A recreation of Stripe's animated mesh gradient stripe with an interactive settings panel.

**🚀 [Live Demo](https://exzenter.github.io/gradient-stripe/)**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://exzenter.github.io/gradient-stripe/)
![WebGL](https://img.shields.io/badge/WebGL-enabled-blue)

## Features

### 🎨 Interactive Settings Panel
- **Color Presets**: LemonLime, Sunset, Ocean, Purple
- **Custom Colors**: 4 individual color pickers
- **Animation Speed**: 0x to 3x control
- **Stripe Angle**: -30° to +30° adjustment
- **Stripe Height**: 100px to 500px
- **Noise Scale**: 0.5x to 3x pattern size
- **Blur Amount**: 0px to 100px
- **Pause/Resume**: Animation control

### 🌀 Advanced Chaos Controls
- **Turbulence**: Controls amplitude decay per octave (0.0-1.0)
- **Octaves (Detail)**: 1-5 layers of noise for complexity
- **Lacunarity**: Frequency scaling between layers (1.0-4.0)
- **Mesh Intensity**: Blend with sinusoidal pattern (0.0-1.0)

### 🎨 Visual Effects
- **Mix Blend Mode**: 16 CSS blend modes (Normal, Multiply, Screen, Overlay, etc.)
- **Background Color**: Custom background to see blend effects

### 🌈 Internal Color Blending
- **Color Blend Mode**: 8 shader blend modes (Normal, Multiply, Screen, Overlay, Soft Light, Hard Light, Color Dodge, Color Burn)
- **Blend Strength**: Controls intensity of color blending effect (0.0-1.0)

### ⚡ Performance
- WebGL-powered GLSL shaders for GPU acceleration
- 3-layer Simplex noise for organic movement
- Smooth 60 FPS performance
- Real-time parameter updates

### 🎯 Design
- Single diagonal stripe with hard edges
- Glassmorphic settings UI
- Responsive and mobile-friendly
- Completely standalone (no dependencies)

## Usage

Simply open `stripe-gradient.html` in a modern web browser. Click the ⚙️ Settings button to customize the gradient.

## Technical Details

**Structure:**
- 250px height stripe container
- -12deg default skew transform
- Hard white boundaries against background

**Colors (Default LemonLime Palette):**
- `#1dcb5d` - Lime Green
- `#ffe85e` - Bright Yellow
- `#ffa832` - Orange/Gold
- `#ffce48` - Accent Gold

**Implementation:**
- HTML5 Canvas with WebGL
- GLSL Fragment Shaders
- Simplex Noise Algorithm
- Pure JavaScript (no frameworks)

## Browser Support

Works in all modern browsers with WebGL support:
- Chrome/Edge 56+
- Firefox 51+
- Safari 11+

## License

MIT License - feel free to use and modify!

## Credits

Inspired by the gradient design on [Stripe's Billing page](https://stripe.com/en-de/billing).
