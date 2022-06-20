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

    // Shininess
    const shininess = typeof _parameters.shininess === 'undefined' ? 32 : _parameters.shininess
    uniforms.uShininess = { value: shininess }

    // Map specular
    if(typeof _parameters.mapSpecular !== 'undefined')
    {
        defines.USE_MAPSPECULAR = ''

        uniforms.uMapSpecular = { value: _parameters.mapSpecular }
    }

    // Map normal
    if(typeof _parameters.mapNormal !== 'undefined')
    {
        defines.USE_MAPNORMAL = ''

        uniforms.uMapNormal = { value: _parameters.mapNormal }

        const mapNormalMultiplier = typeof _parameters.mapNormalMultiplier === 'undefined' ? 1 : _parameters.mapNormalMultiplier
        uniforms.uMapNormalMultiplier = { value: mapNormalMultiplier }
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