import * as THREE from 'three'

import vertexShader from '../shaders/pointLight/vertex.glsl'
import fragmentShader from '../shaders/pointLight/fragment.glsl'

export default function(_renderTarget)
{
    const uniforms = {}
    const defines = {}

    // Buffers
    uniforms.uColor = { value: _renderTarget.texture[0] }
    uniforms.uPosition = { value: _renderTarget.texture[1] }
    uniforms.uNormal = { value: _renderTarget.texture[2] }
    uniforms.uSpecular = { value: _renderTarget.texture[3] }

    // Point lights
    uniforms.uPointLight = {
        value:
        {
            position: new THREE.Vector3(1, 0.1, - 2),
            color: new THREE.Color('orange'),
            intensity: 3,
            amplitude: 5,
            concentration: 5
        }
    }

    // View
    uniforms.uViewPosition = { value: new THREE.Vector3(5, 5, -5) }
    uniforms.uResolution = { value: new THREE.Vector2(1280, 1024) }

    // Final material
    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        depthWrite: false,
        depthTest: false,
        side: THREE.BackSide,
        depthFunc: THREE.GreaterDepth,
        blending: THREE.AdditiveBlending,
        // transparent: true,
        uniforms,
        defines,
        vertexShader,
        fragmentShader
    } )

    return material
}