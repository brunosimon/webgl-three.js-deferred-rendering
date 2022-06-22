precision highp float;
precision highp int;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outPosition;
layout(location = 2) out vec4 outNormal;
layout(location = 3) out vec2 outSpecular;

#ifdef USE_MAPCOLOR
    uniform sampler2D uMapColor;
#endif

uniform vec3 uColor;
uniform float uIntensity;

in vec3 vPosition;
in vec2 vUv;

void main()
{
    // Position
    outPosition = vec4(vPosition, 1.0);
        
    // Color
    outColor = vec4(uColor, 1.0) * uIntensity;
        
    #ifdef USE_MAPCOLOR
        outColor *= texture(uMapColor, vUv);
    #endif

    // Specular
    outSpecular = vec2(0.0, 0.0);

    // Normal
    outNormal = vec4(0.0);
}