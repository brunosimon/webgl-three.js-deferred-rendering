precision highp float;
precision highp int;

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
    float amplitude;
    float concentration;
};

uniform sampler2D uPosition;
uniform sampler2D uColor;
uniform sampler2D uNormal;
uniform sampler2D uSpecular;
uniform vec3 viewPosition;
uniform vec2 uResolution;

uniform PointLight uPointLight;

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
    vec2 uv = gl_FragCoord.xy / uResolution;

    // Buffers
    vec3 position = texture(uPosition, uv).rgb;
    vec3 color = texture(uColor, uv).rgb;
    vec3 normal = texture(uNormal, uv).rgb;

    vec2 specularShininess = texture(uSpecular, uv).rg;
    float specular = specularShininess.r;
    float shininess = specularShininess.g;

    vec3 viewDirection = normalize(viewPosition - position);

    /**
     * Lights
     */
    vec3 light;
    vec3 specularLight = vec3(0.0);

    // Points
    float lightDistance = distance(position, uPointLight.position);
    
    float lightIntensity = 1.0 - clamp(inverseLerp(lightDistance, 0.0, uPointLight.amplitude), 0.0, 1.0);
    lightIntensity = pow(lightIntensity, uPointLight.concentration);
    lightIntensity *= uPointLight.intensity;
    
    vec3 lightDirection = normalize(uPointLight.position - position);
    
    light += max(dot(normal, lightDirection), 0.0) * lightIntensity * uPointLight.color;

    vec3 reflection = normalize(reflect(- lightDirection, normal));
    float specularIntensity = max(0.0, dot(viewDirection, reflection));
    specularIntensity = pow(specularIntensity, 1.0 + shininess * 256.0 * specular);
    specularIntensity *= lightIntensity;
    specularLight += specularIntensity * uPointLight.color * specular;
    
    /**
     * Final color
     */
    vec3 outColor = color * light + specularLight;

    pc_FragColor = vec4(outColor, 1.0);
    // pc_FragColor = vec4(0.0);
    // pc_FragColor = vec4(texture(uColor, uv).rgb, 1.0);
}