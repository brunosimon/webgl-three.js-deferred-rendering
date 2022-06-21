precision highp float;
precision highp int;

in vec2 vUv;

uniform sampler2D uDiffuse;

layout(location = 0) out vec4 pc_FragColor;

void main()
{
    pc_FragColor = texture(uDiffuse, vUv);

    // Gamma corection
    pc_FragColor.rgb = pow(pc_FragColor.rgb, vec3(1.0 / 2.2));
}