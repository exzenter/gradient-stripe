/**
 * Gradient Stripe Block - Frontend WebGL Script
 * Initializes the gradient animation on all gradient stripe blocks
 */
(function () {
    'use strict';

    // Vertex shader source
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Fragment shader source with mesh gradient and blend modes
    const fragmentShaderSource = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        uniform vec3 u_color4;
        uniform float u_noiseScale;
        uniform float u_turbulence;
        uniform float u_octaves;
        uniform float u_lacunarity;
        uniform float u_meshIntensity;
        uniform float u_colorBlendMode;
        uniform float u_blendStrength;

        // Blend mode functions
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
            vec3 result;
            if (mode < 0.5) result = mix(base, blend, 0.5);
            else if (mode < 1.5) result = blendMultiply(base, blend);
            else if (mode < 2.5) result = blendScreen(base, blend);
            else if (mode < 3.5) result = blendOverlay(base, blend);
            else if (mode < 4.5) result = blendSoftLight(base, blend);
            else if (mode < 5.5) result = blendHardLight(base, blend);
            else if (mode < 6.5) result = blendColorDodge(base, blend);
            else result = blendColorBurn(base, blend);
            return result;
        }

        // Simplex noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        // Fractal Brownian Motion
        float fbm(vec2 p, float time) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            float timeScale = 0.0004;
            for (int i = 0; i < 5; i++) {
                if (float(i) >= u_octaves) break;
                value += amplitude * snoise(p * frequency + vec2(time * timeScale * (0.5 + float(i) * 0.2), time * timeScale * (0.3 - float(i) * 0.1)));
                amplitude *= u_turbulence;
                frequency *= u_lacunarity;
            }
            return value;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 pos = gl_FragCoord.xy;
            float scale = 0.0015 / u_noiseScale;
            float combinedNoise = fbm(pos * scale, u_time);
            vec2 meshFreq = vec2(3.0, 2.0);
            float meshNoise = sin(uv.x * meshFreq.x + u_time * 0.001) * cos(uv.y * meshFreq.y - u_time * 0.0008);
            combinedNoise = combinedNoise * (1.0 - u_meshIntensity) + meshNoise * u_meshIntensity;
            float t = (combinedNoise + 1.0) * 0.5;
            t = smoothstep(0.0, 1.0, t);
            
            vec3 finalColor;
            vec3 blendedColor;
            float mixFactor;
            
            if (t < 0.33) {
                mixFactor = smoothstep(0.0, 0.33, t) * 3.0;
                blendedColor = applyBlendMode(u_color1, u_color2, u_colorBlendMode);
                finalColor = mix(u_color1, mix(u_color2, blendedColor, u_blendStrength), mixFactor);
            } else if (t < 0.66) {
                mixFactor = (t - 0.33) / 0.33;
                blendedColor = applyBlendMode(u_color2, u_color3, u_colorBlendMode);
                finalColor = mix(u_color2, mix(u_color3, blendedColor, u_blendStrength), mixFactor);
            } else {
                mixFactor = (t - 0.66) / 0.34;
                blendedColor = applyBlendMode(u_color3, u_color4, u_colorBlendMode);
                finalColor = mix(u_color3, mix(u_color4, blendedColor, u_blendStrength), mixFactor);
            }
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // Helper functions
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    }

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    // Initialize a gradient canvas
    function initGradient(canvas) {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            canvas.style.background = 'linear-gradient(90deg, #1dcb5d, #ffe85e, #ffa832)';
            return;
        }

        // Get settings from data attributes
        const color1 = hexToRgb(canvas.dataset.color1 || '#1dcb5d');
        const color2 = hexToRgb(canvas.dataset.color2 || '#ffe85e');
        const color3 = hexToRgb(canvas.dataset.color3 || '#ffa832');
        const color4 = hexToRgb(canvas.dataset.color4 || '#ffce48');
        const speed = parseFloat(canvas.dataset.speed) || 1;
        const noiseScale = parseFloat(canvas.dataset.noiseScale) || 1;
        const turbulence = parseFloat(canvas.dataset.turbulence) || 0.7;
        const octaves = parseFloat(canvas.dataset.octaves) || 3;
        const lacunarity = parseFloat(canvas.dataset.lacunarity) || 2;
        const meshIntensity = parseFloat(canvas.dataset.meshIntensity) || 0.3;
        const colorBlendMode = parseFloat(canvas.dataset.colorBlendMode) || 0;
        const blendStrength = parseFloat(canvas.dataset.blendStrength) || 1;

        // Create shaders and program
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);

        // Set up geometry
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        // Get locations
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const color1Location = gl.getUniformLocation(program, 'u_color1');
        const color2Location = gl.getUniformLocation(program, 'u_color2');
        const color3Location = gl.getUniformLocation(program, 'u_color3');
        const color4Location = gl.getUniformLocation(program, 'u_color4');
        const noiseScaleLocation = gl.getUniformLocation(program, 'u_noiseScale');
        const turbulenceLocation = gl.getUniformLocation(program, 'u_turbulence');
        const octavesLocation = gl.getUniformLocation(program, 'u_octaves');
        const lacunarityLocation = gl.getUniformLocation(program, 'u_lacunarity');
        const meshIntensityLocation = gl.getUniformLocation(program, 'u_meshIntensity');
        const colorBlendModeLocation = gl.getUniformLocation(program, 'u_colorBlendMode');
        const blendStrengthLocation = gl.getUniformLocation(program, 'u_blendStrength');

        let time = 0;
        const container = canvas.parentElement;

        function resize() {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        function render() {
            time += speed;
            gl.clearColor(1, 1, 1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            // Set uniforms
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, time);
            gl.uniform3f(color1Location, color1.r, color1.g, color1.b);
            gl.uniform3f(color2Location, color2.r, color2.g, color2.b);
            gl.uniform3f(color3Location, color3.r, color3.g, color3.b);
            gl.uniform3f(color4Location, color4.r, color4.g, color4.b);
            gl.uniform1f(noiseScaleLocation, noiseScale);
            gl.uniform1f(turbulenceLocation, turbulence);
            gl.uniform1f(octavesLocation, octaves);
            gl.uniform1f(lacunarityLocation, lacunarity);
            gl.uniform1f(meshIntensityLocation, meshIntensity);
            gl.uniform1f(colorBlendModeLocation, colorBlendMode);
            gl.uniform1f(blendStrengthLocation, blendStrength);

            // Set up position attribute
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            // Draw
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        }

        resize();
        window.addEventListener('resize', resize);
        render();
    }

    // Initialize all gradient canvases on page load
    document.addEventListener('DOMContentLoaded', function () {
        const canvases = document.querySelectorAll('.gsb-gradient-canvas');
        canvases.forEach(initGradient);
    });
})();
