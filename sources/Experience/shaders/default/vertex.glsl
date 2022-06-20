in vec3 position;
in vec3 normal;
in vec3 tangent;
in vec2 uv;

out vec3 vPosition;
out vec3 vNormal;
out vec2 vUv;

#ifdef USE_MAPNORMAL
    out mat3 vTBN;
#endif

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vPosition = modelPosition.xyz;

    // Normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    vNormal = modelNormal.xyz;

    #ifdef USE_MAPNORMAL
        // vec3 bitangent = cross(normal, tangent);
        vec3 T = normalize(vec3(modelMatrix * vec4(tangent, 0.0)));
        vec3 N = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
        T = normalize(T - dot(T, N) * N);
        vec3 B = cross(N, T);
        mat3 TBN = mat3(T, B, N);
        vTBN = TBN;
    #endif

    // UV
    vUv = uv;
}