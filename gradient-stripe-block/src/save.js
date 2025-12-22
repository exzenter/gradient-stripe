/**
 * Gradient Stripe Block - Save Component
 */
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        color1, alpha1, color2, alpha2, color3, alpha3, color4, alpha4,
        animationSpeed, stripeAngle, stripeHeight,
        noiseScale, turbulence, octaves, lacunarity, meshIntensity,
        colorBlendMode, blendStrength, blur
    } = attributes;

    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps}>
            <div
                className="gsb-gradient-stripe-container"
                style={{
                    height: `${stripeHeight}px`,
                    transform: `skewY(${stripeAngle}deg)`,
                }}
            >
                <canvas
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
            </div>
        </div>
    );
}
