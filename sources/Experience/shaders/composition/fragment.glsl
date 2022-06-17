precision highp float;
precision highp int;

struct AmbientLight {
    vec3 color;
    float intensity;
};

struct HemiLight {
    vec3 groundColor;
    vec3 skyColor;
    float intensity;
    vec3 direction;
};

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
    float amplitude;
    float concentration;
};

in vec2 vUv;

uniform sampler2D uPosition;
uniform sampler2D uColor;
uniform sampler2D uNormal;
uniform sampler2D uSpecular;
uniform AmbientLight uAmbientLight;
uniform HemiLight uHemiLight;
uniform PointLight uPointLights[MAX_LIGHTS];
uniform int uPointLightsCount;

layout(location = 0) out vec4 pc_FragColor;

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

    /**
     * Lights
     */
    vec3 light;

    // Ambient
    vec3 ambientLightColor = uAmbientLight.color * uAmbientLight.intensity;
    
    // Hemi
    vec3 hemiLightDirection = normalize(uHemiLight.direction);
    float hemiLightMix = remap(dot(hemiLightDirection, normal), -1.0, 1.0, 0.0, 1.0);
    vec3 hemiLightColor = mix(uHemiLight.groundColor, uHemiLight.skyColor, hemiLightMix) * uHemiLight.intensity;

    light = ambientLightColor + hemiLightColor;

    // Points
    for(int i = 0; i < uPointLightsCount; ++i)
    {
        float lightDistance = distance(position, uPointLights[i].position);
        
        float lightIntensity = 1.0 - clamp(inverseLerp(lightDistance, 0.0, uPointLights[i].amplitude), 0.0, 1.0);
        lightIntensity = pow(lightIntensity, uPointLights[i].concentration);
        lightIntensity *= uPointLights[i].intensity;
        
        vec3 lightDirection = normalize(uPointLights[i].position - position);
        
        light += max(dot(normal, lightDirection), 0.0) * lightIntensity * uPointLights[i].color;
    }
    
    /**
     * Final color
     */
    vec3 outColor = color * light;

    // Gamma corection
    outColor.rgb = pow(outColor.rgb, vec3(1.0 / 2.2));

    // Debug
    #ifdef USE_DEBUG
        outColor.rgb = mix(outColor.rgb, color, step(0.5, 1.0 - vUv.y));
        outColor.rgb = mix(outColor.rgb, position, step(0.25, vUv.x) * step(0.5, 1.0 - vUv.y));
        outColor.rgb = mix(outColor.rgb, normal, step(0.5, vUv.x) * step(0.5, 1.0 - vUv.y));
        outColor.rgb = mix(outColor.rgb, specular, step(0.75, vUv.x) * step(0.5, 1.0 - vUv.y));
    #endif

    pc_FragColor = vec4(outColor, 1.0);
}