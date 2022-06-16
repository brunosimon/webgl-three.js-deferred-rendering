in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vPosition;
out vec3 vNormal;
out vec2 vUv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Normal
    vec3 transformedNormal = normalMatrix * normal;

    // Varyings
    vPosition = modelPosition.xyz;
    vNormal = transformedNormal;
    vUv = uv;
}