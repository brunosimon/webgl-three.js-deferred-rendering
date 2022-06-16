precision highp float;
precision highp int;

struct AmbientLight {
    vec3 color;
    float intensity;
};

struct HemiLight {
    vec3 skyColor;
    vec3 groundColor;
    float intensity;
    vec3 direction;
};

layout(location = 0) out vec4 pc_FragColor;

in vec2 vUv;

uniform sampler2D uPosition;
uniform sampler2D uColor;
uniform sampler2D uNormal;
uniform sampler2D uSpecular;
uniform AmbientLight uAmbientLight;
uniform HemiLight uHemiLight;

float inverseLerp(float v, float minValue, float maxValue)
{
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

void main()
{
    // Buffers
    vec3 position = texture(uPosition, vUv).rgb;
    vec3 color = texture(uColor, vUv).rgb;
    vec3 normal = texture(uNormal, vUv).rgb;
    vec3 specular = texture(uSpecular, vUv).rgb;

    // Base out color
    vec3 outColor = color;

    // Ambient and hemi lights
    vec3 ambientLightColor = uAmbientLight.color * uAmbientLight.intensity;
    vec3 hemiLightDirection = normalize(uHemiLight.direction);
    float hemiLightMix = remap(dot(hemiLightDirection, normal), -1.0, 1.0, 0.0, 1.0);
    vec3 hemiLightColor = mix(uHemiLight.groundColor, uHemiLight.skyColor, hemiLightMix) * uHemiLight.intensity;

    outColor *= ambientLightColor + hemiLightColor;

    // Gamma corection
    outColor.rgb = pow(outColor.rgb, vec3(1.0 / 2.2));

    pc_FragColor.rgb = color;
    pc_FragColor.rgb = mix(pc_FragColor.rgb, position, step(0.25, vUv.x));
    pc_FragColor.rgb = mix(pc_FragColor.rgb, normal, step(0.5, vUv.x));
    pc_FragColor.rgb = mix(pc_FragColor.rgb, specular, step(0.75, vUv.x));
    pc_FragColor.rgb = outColor;
    pc_FragColor.a = 1.0;
}