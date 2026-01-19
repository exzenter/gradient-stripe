/**
 * Gradient Stripe Block - Editor Component
 */
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    InnerBlocks,
    useInnerBlocksProps,
    PanelColorSettings,
    BlockControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    ToggleControl,
    TextareaControl,
    Button,
    ToolbarGroup,
    ToolbarButton,
    __experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { seen as previewIcon } from '@wordpress/icons';

export default function Edit({ attributes, setAttributes }) {
    const {
        stripeMode, stripeOverflow, minHeight, tagName,
        color1, color2, color3, color4,
        animationSpeed, stripeAngle, stripeHeight, stripeTranslateX, stripeTranslateY,
        noiseScale, turbulence, octaves, lacunarity, meshIntensity,
        colorBlendMode, blendStrength, blur, blurIsolation, ignoreGlobalPadding, importExportJson
    } = attributes;

    const [toastMessage, setToastMessage] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const TagName = tagName || 'div';

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

    // HTML element options
    const tagNameOptions = [
        { label: 'Div', value: 'div' },
        { label: 'Header', value: 'header' },
        { label: 'Main', value: 'main' },
        { label: 'Section', value: 'section' },
        { label: 'Article', value: 'article' },
        { label: 'Aside', value: 'aside' },
        { label: 'Footer', value: 'footer' },
    ];

    // WebGL Preview - only loads when showPreview is true
    useEffect(() => {
        if (!showPreview || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

        // Full shader with blend modes (same as frontend)
        const vertexShaderSource = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
        const fragmentShaderSource = `
            precision highp float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec3 u_color1, u_color2, u_color3, u_color4;
            uniform float u_noiseScale, u_turbulence, u_octaves, u_lacunarity, u_meshIntensity;
            uniform float u_colorBlendMode, u_blendStrength;
            
            vec3 blendMultiply(vec3 base, vec3 blend) { return base * blend; }
            vec3 blendScreen(vec3 base, vec3 blend) { return 1.0 - (1.0 - base) * (1.0 - blend); }
            vec3 blendOverlay(vec3 base, vec3 blend) {
                return vec3(
                    base.r < 0.5 ? 2.0 * base.r * blend.r : 1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r),
                    base.g < 0.5 ? 2.0 * base.g * blend.g : 1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g),
                    base.b < 0.5 ? 2.0 * base.b * blend.b : 1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b)
                );
            }
            vec3 blendSoftLight(vec3 base, vec3 blend) {
                return vec3(
                    blend.r < 0.5 ? base.r - (1.0 - 2.0 * blend.r) * base.r * (1.0 - base.r) : base.r + (2.0 * blend.r - 1.0) * (sqrt(base.r) - base.r),
                    blend.g < 0.5 ? base.g - (1.0 - 2.0 * blend.g) * base.g * (1.0 - base.g) : base.g + (2.0 * blend.g - 1.0) * (sqrt(base.g) - base.g),
                    blend.b < 0.5 ? base.b - (1.0 - 2.0 * blend.b) * base.b * (1.0 - base.b) : base.b + (2.0 * blend.b - 1.0) * (sqrt(base.b) - base.b)
                );
            }
            vec3 blendHardLight(vec3 base, vec3 blend) { return blendOverlay(blend, base); }
            vec3 blendColorDodge(vec3 base, vec3 blend) {
                return vec3(
                    blend.r >= 1.0 ? 1.0 : min(1.0, base.r / (1.0 - blend.r)),
                    blend.g >= 1.0 ? 1.0 : min(1.0, base.g / (1.0 - blend.g)),
                    blend.b >= 1.0 ? 1.0 : min(1.0, base.b / (1.0 - blend.b))
                );
            }
            vec3 blendColorBurn(vec3 base, vec3 blend) {
                return vec3(
                    blend.r <= 0.0 ? 0.0 : max(0.0, 1.0 - (1.0 - base.r) / blend.r),
                    blend.g <= 0.0 ? 0.0 : max(0.0, 1.0 - (1.0 - base.g) / blend.g),
                    blend.b <= 0.0 ? 0.0 : max(0.0, 1.0 - (1.0 - base.b) / blend.b)
                );
            }
            vec3 applyBlendMode(vec3 base, vec3 blend, float mode) {
                vec3 r;
                if (mode < 0.5) r = mix(base, blend, 0.5);
                else if (mode < 1.5) r = blendMultiply(base, blend);
                else if (mode < 2.5) r = blendScreen(base, blend);
                else if (mode < 3.5) r = blendOverlay(base, blend);
                else if (mode < 4.5) r = blendSoftLight(base, blend);
                else if (mode < 5.5) r = blendHardLight(base, blend);
                else if (mode < 6.5) r = blendColorDodge(base, blend);
                else r = blendColorBurn(base, blend);
                return r;
            }
            
            vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x / 289.0) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m*m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 a0 = x - floor(x + 0.5);
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            float fbm(vec2 p, float time) {
                float value = 0.0, amplitude = 0.5, frequency = 1.0;
                for (int i = 0; i < 5; i++) {
                    if (float(i) >= u_octaves) break;
                    value += amplitude * snoise(p * frequency + vec2(time * 0.0004 * (0.5 + float(i) * 0.2), time * 0.0004 * (0.3 - float(i) * 0.1)));
                    amplitude *= u_turbulence;
                    frequency *= u_lacunarity;
                }
                return value;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float n = fbm(gl_FragCoord.xy * 0.0015 / u_noiseScale, u_time);
                float mesh = sin(uv.x * 3.0 + u_time * 0.001) * cos(uv.y * 2.0 - u_time * 0.0008);
                n = n * (1.0 - u_meshIntensity) + mesh * u_meshIntensity;
                float t = smoothstep(0.0, 1.0, (n + 1.0) * 0.5);
                
                vec3 finalColor;
                vec3 blended;
                float m;
                
                if (t < 0.33) {
                    m = smoothstep(0.0, 0.33, t) * 3.0;
                    blended = applyBlendMode(u_color1, u_color2, u_colorBlendMode);
                    finalColor = mix(u_color1, mix(u_color2, blended, u_blendStrength), m);
                } else if (t < 0.66) {
                    m = (t - 0.33) / 0.33;
                    blended = applyBlendMode(u_color2, u_color3, u_colorBlendMode);
                    finalColor = mix(u_color2, mix(u_color3, blended, u_blendStrength), m);
                } else {
                    m = (t - 0.66) / 0.34;
                    blended = applyBlendMode(u_color3, u_color4, u_colorBlendMode);
                    finalColor = mix(u_color3, mix(u_color4, blended, u_blendStrength), m);
                }
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(program, 'a_position');
        const resLoc = gl.getUniformLocation(program, 'u_resolution');
        const timeLoc = gl.getUniformLocation(program, 'u_time');
        const c1Loc = gl.getUniformLocation(program, 'u_color1');
        const c2Loc = gl.getUniformLocation(program, 'u_color2');
        const c3Loc = gl.getUniformLocation(program, 'u_color3');
        const c4Loc = gl.getUniformLocation(program, 'u_color4');
        const nsLoc = gl.getUniformLocation(program, 'u_noiseScale');
        const turbLoc = gl.getUniformLocation(program, 'u_turbulence');
        const octLoc = gl.getUniformLocation(program, 'u_octaves');
        const lacLoc = gl.getUniformLocation(program, 'u_lacunarity');
        const meshLoc = gl.getUniformLocation(program, 'u_meshIntensity');
        const blendModeLoc = gl.getUniformLocation(program, 'u_colorBlendMode');
        const blendStrLoc = gl.getUniformLocation(program, 'u_blendStrength');

        const hexToRgb = (hex) => {
            const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return r ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255] : [0, 0, 0];
        };

        let time = 0;
        const render = () => {
            if (!showPreview) return;
            time += animationSpeed;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(program);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.uniform1f(timeLoc, time);
            gl.uniform3fv(c1Loc, hexToRgb(color1));
            gl.uniform3fv(c2Loc, hexToRgb(color2));
            gl.uniform3fv(c3Loc, hexToRgb(color3));
            gl.uniform3fv(c4Loc, hexToRgb(color4));
            gl.uniform1f(nsLoc, noiseScale);
            gl.uniform1f(turbLoc, turbulence);
            gl.uniform1f(octLoc, octaves);
            gl.uniform1f(lacLoc, lacunarity);
            gl.uniform1f(meshLoc, meshIntensity);
            gl.uniform1f(blendModeLoc, colorBlendMode);
            gl.uniform1f(blendStrLoc, blendStrength);
            gl.enableVertexAttribArray(posLoc);
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationRef.current = requestAnimationFrame(render);
        };
        render();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [showPreview, color1, color2, color3, color4, animationSpeed, noiseScale, turbulence, octaves, lacunarity, meshIntensity, colorBlendMode, blendStrength]);

    // Export settings
    const exportSettings = () => {
        const settings = {
            colors: { color1: { hex: color1 }, color2: { hex: color2 }, color3: { hex: color3 }, color4: { hex: color4 } },
            animation: { speed: animationSpeed, angle: stripeAngle, height: stripeHeight, translateX: stripeTranslateX, translateY: stripeTranslateY },
            chaos: { noiseScale, turbulence, octaves, lacunarity, meshIntensity },
            blend: { colorBlendMode, blendStrength },
            effects: { blur, blurIsolation },
            layout: { stripeMode, stripeOverflow, minHeight, ignoreGlobalPadding }
        };
        const json = JSON.stringify(settings, null, 2);
        setAttributes({ importExportJson: json });
        navigator.clipboard.writeText(json).then(() => { setToastMessage('📋 Copied!'); setTimeout(() => setToastMessage(''), 2000); });
    };

    // Import settings
    const importSettings = () => {
        try {
            const s = JSON.parse(importExportJson);
            const a = {};
            if (s.colors) { ['1', '2', '3', '4'].forEach(i => { if (s.colors['color' + i]) { a['color' + i] = s.colors['color' + i].hex; } }); }
            if (s.animation) { ['speed', 'angle', 'height', 'translateX', 'translateY'].forEach(k => { if (s.animation[k] !== undefined) a[k === 'speed' ? 'animationSpeed' : k === 'angle' ? 'stripeAngle' : k === 'height' ? 'stripeHeight' : 'stripeTranslate' + k.slice(-1).toUpperCase()] = s.animation[k]; }); }
            if (s.chaos) Object.assign(a, s.chaos);
            if (s.blend) { if (s.blend.colorBlendMode !== undefined) a.colorBlendMode = s.blend.colorBlendMode; if (s.blend.blendStrength !== undefined) a.blendStrength = s.blend.blendStrength; }
            if (s.effects?.blur !== undefined) a.blur = s.effects.blur;
            if (s.effects?.blurIsolation !== undefined) a.blurIsolation = s.effects.blurIsolation;
            if (s.layout) { if (s.layout.stripeMode !== undefined) a.stripeMode = s.layout.stripeMode; if (s.layout.stripeOverflow !== undefined) a.stripeOverflow = s.layout.stripeOverflow; if (s.layout.minHeight) a.minHeight = s.layout.minHeight; if (s.layout.ignoreGlobalPadding !== undefined) a.ignoreGlobalPadding = s.layout.ignoreGlobalPadding; }
            setAttributes(a);
            setToastMessage('✅ Imported!'); setTimeout(() => setToastMessage(''), 2000);
        } catch (e) { setToastMessage('❌ Invalid JSON'); setTimeout(() => setToastMessage(''), 2000); }
    };

    const blockProps = useBlockProps({
        className: `${stripeOverflow ? 'gsb-overflow-visible' : ''} ${blurIsolation ? 'gsb-blur-isolated' : ''} ${ignoreGlobalPadding ? 'gsb-ignore-global-padding' : ''}`.trim(),
        style: { minHeight: minHeight || undefined }
    });
    const innerBlocksProps = useInnerBlocksProps({ className: 'gsb-gradient-content' }, { renderAppender: InnerBlocks.DefaultBlockAppender });
    const stripeTransform = stripeMode ? `skewY(${stripeAngle}deg) translate(${stripeTranslateX}px, ${stripeTranslateY}px)` : 'none';

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon={previewIcon}
                        label={showPreview ? 'Hide Preview' : 'Show Preview'}
                        isPressed={showPreview}
                        onClick={() => setShowPreview(!showPreview)}
                    />
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Layout', 'gradient-stripe-block')} initialOpen={true}>
                    <ToggleControl label="Stripe Mode" help={stripeMode ? 'Diagonal stripe' : 'Full background'} checked={stripeMode} onChange={(v) => setAttributes({ stripeMode: v })} />
                    <UnitControl label="Minimum Height" value={minHeight} onChange={(v) => setAttributes({ minHeight: v })} />
                    <SelectControl label="HTML Element" value={tagName} options={tagNameOptions} onChange={(v) => setAttributes({ tagName: v })} />
                    <ToggleControl
                        label="Ignore Global Padding"
                        help={ignoreGlobalPadding ? 'Background extends to full width' : 'Respects theme padding'}
                        checked={ignoreGlobalPadding}
                        onChange={(v) => setAttributes({ ignoreGlobalPadding: v })}
                    />
                    {stripeMode && (
                        <>
                            <RangeControl label="Angle" value={stripeAngle} onChange={(v) => setAttributes({ stripeAngle: v })} min={-45} max={45} />
                            <RangeControl label="Height" value={stripeHeight} onChange={(v) => setAttributes({ stripeHeight: v })} min={50} max={800} step={10} />
                            <RangeControl label="Position X" value={stripeTranslateX} onChange={(v) => setAttributes({ stripeTranslateX: v })} min={-500} max={500} step={5} />
                            <RangeControl label="Position Y" value={stripeTranslateY} onChange={(v) => setAttributes({ stripeTranslateY: v })} min={-500} max={500} step={5} />
                            <ToggleControl label="Overflow Visible" help={stripeOverflow ? 'Extends beyond block' : 'Clipped at edge'} checked={stripeOverflow} onChange={(v) => setAttributes({ stripeOverflow: v })} />
                        </>
                    )}
                </PanelBody>
                <PanelColorSettings title="Gradient Colors" initialOpen={false} colorSettings={[
                    { value: color1, onChange: (v) => setAttributes({ color1: v || '#1dcb5d' }), label: 'Color 1' },
                    { value: color2, onChange: (v) => setAttributes({ color2: v || '#ffe85e' }), label: 'Color 2' },
                    { value: color3, onChange: (v) => setAttributes({ color3: v || '#ffa832' }), label: 'Color 3' },
                    { value: color4, onChange: (v) => setAttributes({ color4: v || '#ffce48' }), label: 'Color 4' },
                ]} />

                <PanelBody title="Animation" initialOpen={false}>
                    <RangeControl label="Speed" value={animationSpeed} onChange={(v) => setAttributes({ animationSpeed: v })} min={0} max={25} step={0.1} />
                </PanelBody>
                <PanelBody title="🌀 Chaos" initialOpen={false}>
                    <RangeControl label="Noise Scale" value={noiseScale} onChange={(v) => setAttributes({ noiseScale: v })} min={0.5} max={3} step={0.1} />
                    <RangeControl label="Turbulence" value={turbulence} onChange={(v) => setAttributes({ turbulence: v })} min={0} max={1} step={0.05} />
                    <RangeControl label="Octaves" value={octaves} onChange={(v) => setAttributes({ octaves: v })} min={1} max={5} />
                    <RangeControl label="Lacunarity" value={lacunarity} onChange={(v) => setAttributes({ lacunarity: v })} min={1} max={4} step={0.1} />
                    <RangeControl label="Mesh" value={meshIntensity} onChange={(v) => setAttributes({ meshIntensity: v })} min={0} max={1} step={0.05} />
                </PanelBody>
                <PanelBody title="🌈 Blending" initialOpen={false}>
                    <SelectControl label="Mode" value={colorBlendMode} options={blendModeOptions} onChange={(v) => setAttributes({ colorBlendMode: parseInt(v) })} />
                    <RangeControl label="Strength" value={blendStrength} onChange={(v) => setAttributes({ blendStrength: v })} min={0} max={1} step={0.05} />
                    <RangeControl label="Blur" value={blur} onChange={(v) => setAttributes({ blur: v })} min={0} max={100} step={1} />
                    <ToggleControl label="Sharp Edges" help="Clips blur at container edges and isolates blending" checked={blurIsolation} onChange={(v) => setAttributes({ blurIsolation: v })} />
                </PanelBody>
                <PanelBody title="📋 Import/Export" initialOpen={false}>
                    <Button isPrimary onClick={exportSettings} style={{ marginBottom: '8px', width: '100%' }}>📤 Export</Button>
                    <TextareaControl value={importExportJson} onChange={(v) => setAttributes({ importExportJson: v })} placeholder="Paste JSON..." rows={3} />
                    <Button isSecondary onClick={importSettings} style={{ width: '100%' }}>📥 Import</Button>
                    {toastMessage && <p style={{ marginTop: '8px', padding: '6px', background: '#10b981', color: 'white', borderRadius: '4px', textAlign: 'center' }}>{toastMessage}</p>}
                </PanelBody>
            </InspectorControls>

            <TagName {...blockProps}>
                <div className={`gsb-gradient-stripe-container ${stripeMode ? 'gsb-stripe-mode' : 'gsb-background-mode'}`} style={{ height: stripeMode ? `${stripeHeight}px` : '100%', transform: stripeTransform }}>
                    {showPreview ? (
                        <canvas ref={canvasRef} className="gsb-gradient-canvas" style={{ filter: blur > 0 ? `blur(${blur}px)` : 'none' }}></canvas>
                    ) : (
                        <div className="gsb-gradient-placeholder" style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${color1} 0%, ${color2} 33%, ${color3} 66%, ${color4} 100%)`, opacity: 0.7 }}></div>
                    )}
                </div>
                <div {...innerBlocksProps} />
            </TagName>
        </>
    );
}
