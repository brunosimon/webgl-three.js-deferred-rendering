precision highp float;
precision highp int;

layout(location = 0) out vec4 outPosition;
layout(location = 1) out vec4 outColor;
layout(location = 2) out vec4 outNormal;
layout(location = 3) out float outSpecular;

#ifdef USE_MAPCOLOR
    uniform sampler2D uMapColor;
#endif

#ifdef USE_MAPSPECULAR
    uniform sampler2D uMapSpecular;
#endif

uniform vec3 uColor;
uniform float uSpecular;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUv;

void main()
{
    // Position
    outPosition = vec4(vPosition, 1.0);
        
    // Color
    outColor = vec4(uColor, 1.0);
        
    #ifdef USE_MAPCOLOR
        outColor *= texture(uMapColor, vUv);
    #endif

    // Normals
    outNormal = vec4(normalize(vNormal), 0.0);

    // Specular
    outSpecular = uSpecular;

    #ifdef USE_MAPSPECULAR
        outSpecular *= texture(uMapSpecular, vUv).r;
    #endif
}