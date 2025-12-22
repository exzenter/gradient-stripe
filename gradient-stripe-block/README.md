# Gradient Stripe Block - WordPress Plugin

A beautiful animated mesh gradient stripe Gutenberg block inspired by Stripe's design.

## Installation

1. Copy the `gradient-stripe-block` folder to `wp-content/plugins/`
2. Run `npm install` in the plugin folder
3. Run `npm run build` to compile the block
4. Activate the plugin in WordPress admin

## Features

All settings from the HTML version are available in the block editor:

- **Colors** - 4 custom colors with alpha/transparency
- **Animation** - Speed, angle, height controls
- **Chaos** - Noise scale, turbulence, octaves, lacunarity, mesh intensity
- **Blend Modes** - 8 internal color blend modes + blend strength
- **Effects** - Blur amount
- **Import/Export** - Copy/paste JSON settings

## Usage

1. Add a new block in the editor
2. Search for "Gradient Stripe"
3. Configure settings in the sidebar
4. Save and view on frontend

## Development

```bash
npm install
npm run start  # Watch mode
npm run build  # Production build
```

## License

MIT
