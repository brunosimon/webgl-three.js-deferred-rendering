import * as THREE from 'three'

import vertexShader from '../shaders/glow/vertex.glsl'
import fragmentShader from '../shaders/glow/fragment.glsl'

export default function()
{
    const material = new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        uniforms:
        {
            uFresnelOffset: { value: -0.25 },
            uFresnelScale: { value: 1.5 },
            uFresnelPower: { value: 3 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material
}