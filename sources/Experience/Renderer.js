import * as THREE from 'three'

import Experience from '@/Experience.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js'

export default class Renderer
{
    constructor(_options = {})
    {
        this.experience = Experience.instance
        this.scene = this.experience.scene
        this.rendererInstance = this.experience.rendererInstance
        this.domElement = this.experience.domElement
        this.viewport = this.experience.viewport
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.camera = this.experience.camera
        
        this.usePostprocess = false

        this.setInstance()
        this.setPostProcess()
        this.setDebug()
    }

    setInstance()
    {
        this.clearColor = '#0c0c0e'

        // Renderer
        this.instance = this.rendererInstance
        this.instance.sortObjects = false
        
        this.instance.domElement.style.position = 'absolute'
        this.instance.domElement.style.top = 0
        this.instance.domElement.style.left = 0
        this.instance.domElement.style.width = '100%'
        this.instance.domElement.style.height = '100%'

        // this.instance.setClearColor(0x414141, 1)
        this.instance.setClearColor(this.clearColor, 1)
        this.instance.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)

        this.instance.physicallyCorrectLights = true
        // this.instance.outputEncoding = THREE.sRGBEncoding
        this.instance.shadowMap.enabled = this.experience.quality === 'high'
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMapping = THREE.ACESFilmicToneMapping
        this.instance.toneMappingExposure = 2.1

        this.context = this.instance.getContext()
        
        this.domElement.appendChild(this.instance.domElement)

        // Add stats panel
        if(this.debug.stats)
        {
            this.debug.stats.setRenderPanel(this.context)
        }
    }

    setPostProcess()
    {
        this.postProcess = {}

        /**
         * Passes
         */
        // Render pass
        this.postProcess.renderPass = new RenderPass(this.scene, this.camera.instance)

        // TAA
        this.postProcess.taaRenderPass = new TAARenderPass(this.scene, this.camera.instance)
        this.postProcess.taaRenderPass.enabled = false
        this.postProcess.taaRenderPass.unbiased = false

        // Bloom pass
        this.postProcess.unrealBloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.viewport.elementWidth, this.viewport.elementHeight),
            0.23,
            0.315,
            0
        )
        this.postProcess.unrealBloomPass.enabled = true

        // this.postProcess.unrealBloomPass.tintColor = {}
        // this.postProcess.unrealBloomPass.tintColor.value = '#7f00ff'
        // this.postProcess.unrealBloomPass.tintColor.instance = new THREE.Color(this.postProcess.unrealBloomPass.tintColor.value)
        
        // this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintColor = { value: this.postProcess.unrealBloomPass.tintColor.instance }
        // this.postProcess.unrealBloomPass.compositeMaterial.uniforms.uTintStrength = { value: 0.15 }
        this.postProcess.unrealBloomPass.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform sampler2D dirtTexture;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
// uniform vec3 uTintColor;
// uniform float uTintStrength;

float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}

void main() {
    vec4 color = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );

    // color.rgb = mix(color.rgb, uTintColor, uTintStrength);
    gl_FragColor = color;
    gl_FragColor = LinearTosRGB( color );
}
        `

        this.postProcess.finalPass = new ShaderPass({
            uniforms:
            {
                tDiffuse: { value: null }
            },
            vertexShader: `
                varying vec2 vUv;

                void main()
                {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,

            fragmentShader:`
                #include <common>

                uniform sampler2D tDiffuse;

                varying vec2 vUv;

                void main()
                {
                    vec4 color = texture2D(tDiffuse, vUv);
                    gl_FragColor = color;
                }
            `
        })

        /**
         * Effect composer
         */
        this.experienceTarget = new THREE.WebGLRenderTarget(
            this.viewport.elementWidth,
            this.viewport.elementHeight,
            {
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                // encoding: THREE.sRGBEncoding
            }
        )
        this.postProcess.composer = new EffectComposer(this.instance, this.experienceTarget)
        this.postProcess.composer.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.postProcess.composer.setPixelRatio(this.viewport.clampedPixelRatio)

        this.postProcess.composer.addPass(this.postProcess.renderPass)
        // this.postProcess.composer.addPass(this.postProcess.taaRenderPass)
        // this.postProcess.composer.addPass(this.postProcess.unrealBloomPass)
        this.postProcess.composer.addPass(this.postProcess.finalPass)
    }

    resize()
    {
        const bounding = this.domElement.getBoundingClientRect()
        this.viewport.elementWidth = bounding.width
        this.viewport.elementHeight = bounding.height

        // Instance
        this.instance.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)

        // Post process
        this.postProcess.composer.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.postProcess.composer.setPixelRatio(this.viewport.clampedPixelRatio)
    }

    update()
    {
        if(this.debug.stats)
            this.debug.stats.beforeRender()

        if(this.usePostprocess)
            this.postProcess.composer.render()
        else
            this.instance.render(this.scene, this.camera.instance)

        if(this.debug.stats)
            this.debug.stats.afterRender()
    }

    destroy()
    {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.experienceTarget.dispose()
        this.postProcess.composer.renderTarget1.dispose()
        this.postProcess.composer.renderTarget2.dispose()
    }

    setDebug()
    {
        const debug = this.experience.debug

        if(!debug.active)
            return

        // General
        const folder = debug.ui.getFolder('renderer')
        // folder.open()

        folder
            .addColor(this, 'clearColor')
            .name('clearColor')
            .onChange(() =>
            {
                this.instance.setClearColor(this.clearColor)
            })
        
        folder.add(this, 'usePostprocess').name('usePostprocess')

        // Tone mapping
        const toneMappingFolder = debug.ui.getFolder('renderer/toneMapping')

        toneMappingFolder
            .add(
                this.instance,
                'toneMapping',
                {
                    'NoToneMapping': THREE.NoToneMapping,
                    'LinearToneMapping': THREE.LinearToneMapping,
                    'ReinhardToneMapping': THREE.ReinhardToneMapping,
                    'CineonToneMapping': THREE.CineonToneMapping,
                    'ACESFilmicToneMapping': THREE.ACESFilmicToneMapping,
                }
            )
            .name('toneMapping')

        toneMappingFolder.add(this.instance, 'toneMappingExposure').min(0).max(5).step(0.001).name('exposure')

        // TAA pass
        const taaPassFolder = debug.ui.getFolder('renderer/taaPass')
        taaPassFolder.add(this.postProcess.taaRenderPass, 'enabled').name('enabled')
        taaPassFolder
            .add(
                this.postProcess.taaRenderPass,
                'sampleLevel',
                {
                    'Level 0: 1 Sample': 0,
                    'Level 1: 2 Samples': 1,
                    'Level 2: 4 Samples': 2,
                    'Level 3: 8 Samples': 3,
                    'Level 4: 16 Samples': 4,
                    'Level 5: 32 Samples': 5
                }
            )
            .name('sampleLevel')
            // .onFinishChange(() =>
            // {
            //     this.postProcess.taaRenderPass.sampleLevel = param.TAASampleLevel;
            // })

        // Unreal Bloom pass
        const unrealBloomPassFolder = debug.ui.getFolder('renderer/unrealBloomPass')
        unrealBloomPassFolder.add(this.postProcess.unrealBloomPass, 'enabled').name('enabled')
        unrealBloomPassFolder.add(this.postProcess.unrealBloomPass, 'strength').min(0).max(3).name('strength')
        unrealBloomPassFolder.add(this.postProcess.unrealBloomPass, 'radius').min(0).max(3).name('radius')
        unrealBloomPassFolder.add(this.postProcess.unrealBloomPass, 'threshold').min(0).max(3).name('threshold')
        
        // console.log(this.postProcess.unrealBloomPass.strength)
        // console.log(this.postProcess.unrealBloomPass.radius)
    }
}