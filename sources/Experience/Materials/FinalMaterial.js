import * as THREE from 'three'

import vertexShader from '../shaders/final/vertex.glsl'
import fragmentShader from '../shaders/final/fragment.glsl'

export default function(_renderTarget)
{
    const uniforms = {}
    const defines = {}

    // Buffers
    uniforms.uDiffuse = { value: _renderTarget.texture }

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