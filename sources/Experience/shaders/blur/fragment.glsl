precision highp float;
precision highp int;

in vec2 vUv;

uniform sampler2D uColor;
uniform vec2 uResolution;
uniform vec2 uDirection;
uniform float uThreshold;

layout(location = 0) out vec4 pc_FragColor;

#if (BLUR_FUNCTION == 0)
    vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction)
    {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3333333333333333) * direction;
        color += texture(image, uv) * 0.29411764705882354;
        color += texture(image, uv + (off1 / resolution)) * 0.35294117647058826;
        color += texture(image, uv - (off1 / resolution)) * 0.35294117647058826;
        return color; 
    }
#endif

#if (BLUR_FUNCTION == 1)
    vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction)
    {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * direction;
        vec2 off2 = vec2(3.2307692308) * direction;
        color += texture(image, uv) * 0.2270270270;
        color += texture(image, uv + (off1 / resolution)) * 0.3162162162;
        color += texture(image, uv - (off1 / resolution)) * 0.3162162162;
        color += texture(image, uv + (off2 / resolution)) * 0.0702702703;
        color += texture(image, uv - (off2 / resolution)) * 0.0702702703;
        return color;
    }
#endif

#if (BLUR_FUNCTION == 2)
    vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction)
    {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.411764705882353) * direction;
        vec2 off2 = vec2(3.2941176470588234) * direction;
        vec2 off3 = vec2(5.176470588235294) * direction;
        color += texture(image, uv) * 0.1964825501511404;
        color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
        color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
        color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
        color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
        color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
        color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
        return color;
    }
#endif

void main()
{
    vec3 color = vec3(0.0);

    // Buffers
    #if (BLUR_FUNCTION == 0)
        color = blur5(uColor, vUv, uResolution, uDirection).rgb - uThreshold;
    #elif (BLUR_FUNCTION == 1)
        color = blur9(uColor, vUv, uResolution, uDirection).rgb - uThreshold;
    #elif (BLUR_FUNCTION == 2)
        color = blur13(uColor, vUv, uResolution, uDirection).rgb - uThreshold;
    #endif

    color = max(vec3(0.0), color);
    
    pc_FragColor = vec4(color, 1.0);
}