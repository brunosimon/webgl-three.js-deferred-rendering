import * as THREE from 'three'

import vertexShader from '../shaders/blur/vertex.glsl'
import fragmentShader from '../shaders/blur/fragment.glsl'

export default function(_renderTarget, _blurFunction = 0)
{
    const uniforms = {}
    const defines = {}

    // Buffers
    uniforms.uColor = { value: typeof _renderTarget.texture === 'array' ? _renderTarget.texture[0] : _renderTarget.texture }

    // Resolution
    uniforms.uResolution = { value: new THREE.Vector2(1280, 1024) }

    // Direction
    uniforms.uDirection = { value: new THREE.Vector2(1, 0) }

    // Direction
    uniforms.uThreshold = { value: 1 }

    defines.BLUR_FUNCTION = _blurFunction

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