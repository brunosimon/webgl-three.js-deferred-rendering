import * as THREE from 'three'

import vertexShader from '../shaders/default/vertex.glsl'
import fragmentShader from '../shaders/default/fragment.glsl'

export default function(_parameters = {})
{
    const uniforms = {}
    const defines = {}

    // Color
    const color = typeof _parameters.color === 'undefined' ? new THREE.Color(0xffffff) : (_parameters.color instanceof THREE.Color ? _parameters.color : new THREE.Color(_parameters.color))
    uniforms.uColor = { value: color }

    // Map color
    if(typeof _parameters.mapColor !== 'undefined')
    {
        defines.USE_MAPCOLOR = ''

        uniforms.uMapColor = { value: _parameters.mapColor }
    }

    // Specular
    const specular = typeof _parameters.specular === 'undefined' ? (typeof _parameters.mapSpecular !== 'undefined' ? 1 : 0) : _parameters.specular
    uniforms.uSpecular = { value: specular }

    // Map specular
    if(typeof _parameters.mapSpecular !== 'undefined')
    {
        defines.USE_MAPSPECULAR = ''

        uniforms.uMapSpecular = { value: _parameters.mapSpecular }
    }

    // Final material
    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        // transparent: true,
        // depthTest: false,
        uniforms,
        defines,
        vertexShader,
        fragmentShader
    })

    return material
}