# Gradient Stripe

A recreation of Stripe's animated mesh gradient stripe with an interactive settings panel.

![Gradient Stripe Demo](https://img.shields.io/badge/demo-live-brightgreen)
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
