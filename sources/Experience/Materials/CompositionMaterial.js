import * as THREE from 'three'

import vertexShader from '../shaders/composition/vertex.glsl'
import fragmentShader from '../shaders/composition/fragment.glsl'

export default function(_renderTargets, debug = false)
{
    const uniforms = {}
    const defines = {}

    // Buffers
    uniforms.uPosition = { value: _renderTargets.texture[0] }
    uniforms.uColor = { value: _renderTargets.texture[1] }
    uniforms.uNormal = { value: _renderTargets.texture[2] }
    uniforms.uSpecular = { value: _renderTargets.texture[3] }

    // Ambient light
    uniforms.uAmbientLight = {
        value:
        {
            color: new THREE.Color('white'),
            intensity: 1
        }
    }

    // Hemi light
    uniforms.uHemiLight = {
        value:
        {
            groundColor: new THREE.Color('green'),
            skyColor: new THREE.Color('orange'),
            intensity: 1,
            direction: new THREE.Vector3(1.0, 1.0, 1.0)
        }
    }

    // Debug
    if(debug)
        defines.USE_DEBUG = ''

    // Final material
    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms,
        defines,
        vertexShader,
        fragmentShader
    } )

    return material
}