precision highp float;
precision highp int;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outPosition;
layout(location = 2) out vec4 outNormal;
layout(location = 3) out vec2 outSpecular;

#ifdef USE_MAPCOLOR
    uniform sampler2D uMapColor;
#endif

#ifdef USE_MAPSPECULAR
    uniform sampler2D uMapSpecular;
#endif

in vec3 vNormal;
#ifdef USE_MAPNORMAL
    uniform sampler2D uMapNormal;
    uniform float uMapNormalMultiplier;
    in mat3 vTBN;
#endif

uniform vec3 uColor;
uniform float uSpecular;
uniform float uShininess;

in vec3 vPosition;
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

    // Specular
    outSpecular = vec2(uSpecular, uShininess / 256.0);

    #ifdef USE_MAPSPECULAR
        outSpecular.r *= texture(uMapSpecular, vUv).r;
    #endif

    // Normal
    #ifdef USE_MAPNORMAL
        outNormal.rgb = texture(uMapNormal, vUv).rgb * 2.0 - 1.0;
        outNormal.rgb = normalize(vTBN * outNormal.rgb);
        outNormal.rgb = mix(vNormal.rgb, outNormal.rgb, uMapNormalMultiplier);
        // outNormal.rgb = normalize(outNormal.rgb);
    #else
        outNormal = vec4(normalize(vNormal), 0.0);
    #endif
}