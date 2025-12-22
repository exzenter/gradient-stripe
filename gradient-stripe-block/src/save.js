/**
 * Gradient Stripe Block - Save Component
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        stripeMode, stripeOverflow, minHeight, tagName,
        color1, color2, color3, color4,
        animationSpeed, stripeAngle, stripeHeight, stripeTranslateX, stripeTranslateY,
        noiseScale, turbulence, octaves, lacunarity, meshIntensity,
        colorBlendMode, blendStrength, blur, blurIsolation
    } = attributes;

    const TagName = tagName || 'div';

    const blockProps = useBlockProps.save({
        className: `${stripeOverflow ? 'gsb-overflow-visible' : ''} ${blurIsolation ? 'gsb-blur-isolated' : ''}`.trim(),
        style: {
            minHeight: minHeight || undefined,
        },
    });

    const stripeTransform = stripeMode
        ? `skewY(${stripeAngle}deg) translate(${stripeTranslateX || 0}px, ${stripeTranslateY || 0}px)`
        : 'none';

    return (
        <TagName {...blockProps}>
            <div
                className={`gsb-gradient-stripe-container ${stripeMode ? 'gsb-stripe-mode' : 'gsb-background-mode'}`}
                style={{
                    height: stripeMode ? `${stripeHeight}px` : '100%',
                    transform: stripeTransform,
                }}
            >
                <canvas
                    className="gsb-gradient-canvas"
                    data-color1={color1}
                    data-color2={color2}
                    data-color3={color3}
                    data-color4={color4}
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
            <div className="gsb-gradient-content">
                <InnerBlocks.Content />
            </div>
        </TagName>
    );
}
