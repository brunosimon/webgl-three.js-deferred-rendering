import * as THREE from 'three'

import vertexShader from '../shaders/glow/vertex.glsl'
import fragmentShader from '../shaders/glow/fragment.glsl'

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

    // Intensity
    const intensity = typeof _parameters.intensity === 'undefined' ? 1 : _parameters.intensity
    uniforms.uIntensity = { value: intensity }

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