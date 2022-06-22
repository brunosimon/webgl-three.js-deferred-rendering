import * as THREE from 'three'

import vertexShader from '../shaders/composition/vertex.glsl'
import fragmentShader from '../shaders/composition/fragment.glsl'

export default function(_deferredRenderTarget, _bloomRenderTarget, debug = false)
{
    const uniforms = {}
    const defines = {}

    // Buffers
    uniforms.uColor = { value: _deferredRenderTarget.texture[0] }
    uniforms.uPosition = { value: _deferredRenderTarget.texture[1] }
    uniforms.uNormal = { value: _deferredRenderTarget.texture[2] }
    uniforms.uSpecular = { value: _deferredRenderTarget.texture[3] }
    uniforms.uBloom = { value: _bloomRenderTarget.texture }

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

    // // Point lights
    // uniforms.uPointLights = {
    //     value:
    //     [
    //         {
    //             position: new THREE.Vector3(1, 0.1, - 2),
    //             color: new THREE.Color('orange'),
    //             intensity: 3,
    //             amplitude: 5,
    //             concentration: 5
    //         },
    //         {
    //             position: new THREE.Vector3(- 2, 0.1, - 2),
    //             color: new THREE.Color('cyan'),
    //             intensity: 3,
    //             amplitude: 5,
    //             concentration: 5
    //         },
    //         {
    //             position: new THREE.Vector3(- 1.5, 0.1, 2),
    //             color: new THREE.Color('red'),
    //             intensity: 3,
    //             amplitude: 5,
    //             concentration: 5
    //         }
    //     ]
    // }
    // uniforms.uPointLightsCount = { value: 3 }
    // defines.MAX_LIGHTS = 3

    // View
    uniforms.uViewPosition = { value: new THREE.Vector3(5, 5, -5) }

    // Debug
    if(debug)
        defines.USE_DEBUG = ''

    // Final material
    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        depthWrite: false,
        depthTest: false,
        // transparent: true,
        uniforms,
        defines,
        vertexShader,
        fragmentShader
    } )

    return material
}