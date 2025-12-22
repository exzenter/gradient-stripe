/**
 * Gradient Stripe Block - Editor Component
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    ColorPicker,
    TextareaControl,
    Button,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    BaseControl,
} from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';

export default function Edit({ attributes, setAttributes }) {
    const {
        color1, alpha1, color2, alpha2, color3, alpha3, color4, alpha4,
        animationSpeed, stripeAngle, stripeHeight,
        noiseScale, turbulence, octaves, lacunarity, meshIntensity,
        colorBlendMode, blendStrength, blur, importExportJson
    } = attributes;

    const blockProps = useBlockProps();
    const canvasRef = useRef(null);
    const [toastMessage, setToastMessage] = useState('');

    // Color blend mode options
    const blendModeOptions = [
        { label: 'Normal (Mix)', value: 0 },
        { label: 'Multiply', value: 1 },
        { label: 'Screen', value: 2 },
        { label: 'Overlay', value: 3 },
        { label: 'Soft Light', value: 4 },
        { label: 'Hard Light', value: 5 },
        { label: 'Color Dodge', value: 6 },
        { label: 'Color Burn', value: 7 },
    ];

    // Export settings
    const exportSettings = () => {
        const settings = {
            colors: {
                color1: { hex: color1, alpha: alpha1 },
                color2: { hex: color2, alpha: alpha2 },
                color3: { hex: color3, alpha: alpha3 },
                color4: { hex: color4, alpha: alpha4 },
            },
            animation: { speed: animationSpeed, angle: stripeAngle, height: stripeHeight },
            chaos: { noiseScale, turbulence, octaves, lacunarity, meshIntensity },
            blend: { colorBlendMode, blendStrength },
            effects: { blur }
        };
        const json = JSON.stringify(settings, null, 2);
        setAttributes({ importExportJson: json });
        navigator.clipboard.writeText(json).then(() => {
            setToastMessage('📋 Settings copied to clipboard!');
            setTimeout(() => setToastMessage(''), 3000);
        });
    };

    // Import settings
    const importSettings = () => {
        try {
            const settings = JSON.parse(importExportJson);
            const newAttrs = {};

            if (settings.colors) {
                if (settings.colors.color1) {
                    newAttrs.color1 = settings.colors.color1.hex;
                    newAttrs.alpha1 = settings.colors.color1.alpha;
                }
                if (settings.colors.color2) {
                    newAttrs.color2 = settings.colors.color2.hex;
                    newAttrs.alpha2 = settings.colors.color2.alpha;
                }
                if (settings.colors.color3) {
                    newAttrs.color3 = settings.colors.color3.hex;
                    newAttrs.alpha3 = settings.colors.color3.alpha;
                }
                if (settings.colors.color4) {
                    newAttrs.color4 = settings.colors.color4.hex;
                    newAttrs.alpha4 = settings.colors.color4.alpha;
                }
            }
            if (settings.animation) {
                if (settings.animation.speed !== undefined) newAttrs.animationSpeed = settings.animation.speed;
                if (settings.animation.angle !== undefined) newAttrs.stripeAngle = settings.animation.angle;
                if (settings.animation.height !== undefined) newAttrs.stripeHeight = settings.animation.height;
            }
            if (settings.chaos) {
                if (settings.chaos.noiseScale !== undefined) newAttrs.noiseScale = settings.chaos.noiseScale;
                if (settings.chaos.turbulence !== undefined) newAttrs.turbulence = settings.chaos.turbulence;
                if (settings.chaos.octaves !== undefined) newAttrs.octaves = settings.chaos.octaves;
                if (settings.chaos.lacunarity !== undefined) newAttrs.lacunarity = settings.chaos.lacunarity;
                if (settings.chaos.meshIntensity !== undefined) newAttrs.meshIntensity = settings.chaos.meshIntensity;
            }
            if (settings.blend) {
                if (settings.blend.colorBlendMode !== undefined) newAttrs.colorBlendMode = settings.blend.colorBlendMode;
                if (settings.blend.blendStrength !== undefined) newAttrs.blendStrength = settings.blend.blendStrength;
            }
            if (settings.effects) {
                if (settings.effects.blur !== undefined) newAttrs.blur = settings.effects.blur;
            }

            setAttributes(newAttrs);
            setToastMessage('✅ Settings imported successfully!');
            setTimeout(() => setToastMessage(''), 3000);
        } catch (e) {
            setToastMessage('❌ Invalid JSON format');
            setTimeout(() => setToastMessage(''), 3000);
        }
    };

    return (
        <>
            <InspectorControls>
                {/* Color Settings */}
                <PanelBody title={__('Colors', 'gradient-stripe-block')} initialOpen={true}>
                    <VStack spacing={4}>
                        {[1, 2, 3, 4].map(i => (
                            <BaseControl key={i} label={`Color ${i}`}>
                                <HStack>
                                    <ColorPicker
                                        color={attributes[`color${i}`]}
                                        onChange={(value) => setAttributes({ [`color${i}`]: value })}
                                        enableAlpha={false}
                                    />
                                </HStack>
                                <RangeControl
                                    label="Alpha"
                                    value={attributes[`alpha${i}`]}
                                    onChange={(value) => setAttributes({ [`alpha${i}`]: value })}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                />
                            </BaseControl>
                        ))}
                    </VStack>
                </PanelBody>

                {/* Animation Settings */}
                <PanelBody title={__('Animation', 'gradient-stripe-block')} initialOpen={false}>
                    <RangeControl
                        label="Speed"
                        value={animationSpeed}
                        onChange={(value) => setAttributes({ animationSpeed: value })}
                        min={0}
                        max={3}
                        step={0.1}
                    />
                    <RangeControl
                        label="Stripe Angle"
                        value={stripeAngle}
                        onChange={(value) => setAttributes({ stripeAngle: value })}
                        min={-30}
                        max={30}
                        step={1}
                    />
                    <RangeControl
                        label="Stripe Height"
                        value={stripeHeight}
                        onChange={(value) => setAttributes({ stripeHeight: value })}
                        min={100}
                        max={500}
                        step={10}
                    />
                </PanelBody>

                {/* Chaos Settings */}
                <PanelBody title={__('🌀 Chaos Settings', 'gradient-stripe-block')} initialOpen={false}>
                    <RangeControl
                        label="Noise Scale"
                        value={noiseScale}
                        onChange={(value) => setAttributes({ noiseScale: value })}
                        min={0.5}
                        max={3}
                        step={0.1}
                    />
                    <RangeControl
                        label="Turbulence"
                        value={turbulence}
                        onChange={(value) => setAttributes({ turbulence: value })}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                    <RangeControl
                        label="Octaves (Detail)"
                        value={octaves}
                        onChange={(value) => setAttributes({ octaves: value })}
                        min={1}
                        max={5}
                        step={1}
                    />
                    <RangeControl
                        label="Lacunarity"
                        value={lacunarity}
                        onChange={(value) => setAttributes({ lacunarity: value })}
                        min={1}
                        max={4}
                        step={0.1}
                    />
                    <RangeControl
                        label="Mesh Intensity"
                        value={meshIntensity}
                        onChange={(value) => setAttributes({ meshIntensity: value })}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                </PanelBody>

                {/* Blend Settings */}
                <PanelBody title={__('🌈 Color Blending', 'gradient-stripe-block')} initialOpen={false}>
                    <SelectControl
                        label="Blend Mode"
                        value={colorBlendMode}
                        options={blendModeOptions}
                        onChange={(value) => setAttributes({ colorBlendMode: parseInt(value) })}
                    />
                    <RangeControl
                        label="Blend Strength"
                        value={blendStrength}
                        onChange={(value) => setAttributes({ blendStrength: value })}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                    <RangeControl
                        label="Blur Amount"
                        value={blur}
                        onChange={(value) => setAttributes({ blur: value })}
                        min={0}
                        max={100}
                        step={5}
                    />
                </PanelBody>

                {/* Import/Export */}
                <PanelBody title={__('📋 Import / Export', 'gradient-stripe-block')} initialOpen={false}>
                    <Button isPrimary onClick={exportSettings} style={{ marginBottom: '10px', width: '100%' }}>
                        📤 Export to Clipboard
                    </Button>
                    <TextareaControl
                        label="Settings JSON"
                        value={importExportJson}
                        onChange={(value) => setAttributes({ importExportJson: value })}
                        placeholder="Paste JSON here..."
                    />
                    <Button isSecondary onClick={importSettings} style={{ width: '100%' }}>
                        📥 Import Settings
                    </Button>
                    {toastMessage && (
                        <p style={{ marginTop: '10px', padding: '8px', background: '#10b981', color: 'white', borderRadius: '4px' }}>
                            {toastMessage}
                        </p>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div
                    className="gsb-gradient-stripe-container"
                    style={{
                        height: `${stripeHeight}px`,
                        transform: `skewY(${stripeAngle}deg)`,
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        className="gsb-gradient-canvas"
                        data-color1={color1}
                        data-alpha1={alpha1}
                        data-color2={color2}
                        data-alpha2={alpha2}
                        data-color3={color3}
                        data-alpha3={alpha3}
                        data-color4={color4}
                        data-alpha4={alpha4}
                        data-speed={animationSpeed}
                        data-noise-scale={noiseScale}
                        data-turbulence={turbulence}
                        data-octaves={octaves}
                        data-lacunarity={lacunarity}
                        data-mesh-intensity={meshIntensity}
                        data-color-blend-mode={colorBlendMode}
                        data-blend-strength={blendStrength}
                        data-blur={blur}
                        style={{
                            filter: blur > 0 ? `blur(${blur}px)` : 'none'
                        }}
                    ></canvas>
                    <div className="gsb-preview-overlay">
                        <span>🎨 Gradient Stripe Preview</span>
                    </div>
                </div>
            </div>
        </>
    );
}
