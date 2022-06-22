import * as THREE from 'three'

import Experience from '@/Experience.js'
import CompositionMaterial from './Materials/CompositionMaterial.js'
import BlurMaterial from './Materials/BlurMaterial.js'
import FinalMaterial from './Materials/FinalMaterial.js'

export default class Renderer
{
    constructor(_options = {})
    {
        this.experience = Experience.instance
        this.scenes = this.experience.scenes
        this.rendererInstance = this.experience.rendererInstance
        this.domElement = this.experience.domElement
        this.viewport = this.experience.viewport
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.camera = this.experience.camera

        this.setInstance()
        this.setDeferred()
        this.setBloom()
        this.setComposition()
        this.setFinal()
    }

    setInstance()
    {
        this.clearColor = '#000000'

        // Renderer
        this.instance = this.rendererInstance
        this.instance.sortObjects = false
        
        this.instance.domElement.style.position = 'absolute'
        this.instance.domElement.style.top = 0
        this.instance.domElement.style.left = 0
        this.instance.domElement.style.width = '100%'
        this.instance.domElement.style.height = '100%'

        this.instance.setClearColor(this.clearColor, 0)
        this.instance.setClearAlpha(0)
        this.instance.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)

        this.context = this.instance.getContext()
        
        this.domElement.appendChild(this.instance.domElement)

        // Add stats panel
        if(this.debug.stats)
        {
            this.debug.stats.setRenderPanel(this.context)
        }

        // Debug
        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('renderer')
            // folder.open()

            folder
                .addColor(this, 'clearColor')
                .name('clearColor')
                .onChange(() =>
                {
                    this.instance.setClearColor(this.clearColor)
                })
        }
    }

    setDeferred()
    {
        this.deferred = {}

        this.deferred.depthTexture = new THREE.DepthTexture(this.viewport.elementWidth, this.viewport.elementHeight)
        this.deferred.renderTarget = new THREE.WebGLMultipleRenderTargets(
            this.viewport.elementWidth,
            this.viewport.elementHeight,
            4,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                // generateMipmaps: false,
                // encoding: THREE.sRGBEncoding
            }
        )

        this.deferred.renderTarget.depthTexture = this.deferred.depthTexture

        this.deferred.renderTarget.texture[0].name = 'position'
        this.deferred.renderTarget.texture[0].type = THREE.FloatType

        this.deferred.renderTarget.texture[1].name = 'color'
        this.deferred.renderTarget.texture[1].type = THREE.FloatType
        
        this.deferred.renderTarget.texture[2].name = 'normal'
        this.deferred.renderTarget.texture[2].type = THREE.FloatType
        
        this.deferred.renderTarget.texture[3].name = 'specular'
        this.deferred.renderTarget.texture[3].type = THREE.UnsignedByteType
        this.deferred.renderTarget.texture[3].format = THREE.RGFormat
    }

    setBloom()
    {
        this.bloom = {}
        this.bloom.debug = true
        this.bloom.distance = 3
        this.bloom.blurFunction = 2
        this.bloom.iterations = 3

        // Render targets
        this.bloom.renderTargetA = new THREE.WebGLRenderTarget(
            this.viewport.elementWidth,
            this.viewport.elementHeight,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                type: THREE.FloatType
            }
        )

        this.bloom.renderTargetB = this.bloom.renderTargetA.clone()

        // Scene
        this.bloom.material = new BlurMaterial(this.deferred.renderTarget, this.bloom.blurFunction)
        this.bloom.material.uniforms.uResolution.value.set(this.viewport.elementWidth * this.viewport.clampedPixelRatio, this.viewport.elementHeight * this.viewport.clampedPixelRatio)
        this.bloom.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.bloom.material
        )
        this.bloom.plane.frustumCulled = false
        this.bloom.scene = new THREE.Scene()
        this.bloom.scene.add(this.bloom.plane)

        // Debug
        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('renderer/bloom')
            folder.open()

            folder.add(this.bloom, 'distance').min(0).max(10).step(0.01)
            folder
                .add(this.bloom, 'blurFunction').min(0).max(2).step(1)
                .onChange(() =>
                {
                    this.bloom.material.defines.BLUR_FUNCTION = this.bloom.blurFunction
                    this.bloom.material.needsUpdate = true
                })
            folder.add(this.bloom, 'iterations').min(1).max(10).step(1)
        }
    }

    setComposition()
    {
        this.composition = {}
        this.composition.debug = false

        // Render targets
        this.composition.renderTarget = new THREE.WebGLRenderTarget(
            this.viewport.elementWidth,
            this.viewport.elementHeight,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                type: THREE.FloatType,
                // generateMipmaps: false,
                // encoding: THREE.sRGBEncoding
            }
        )
        this.composition.renderTarget.depthTexture = this.deferred.depthTexture

        // Scene
        this.composition.material = new CompositionMaterial(this.deferred.renderTarget, this.bloom.renderTargetA, this.composition.debug)
        this.composition.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.composition.material
        )
        this.composition.plane.frustumCulled = false
        this.composition.scene = new THREE.Scene()
        this.composition.scene.add(this.composition.plane)

        // Debug
        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('renderer/composition')
            // folder.open()

            folder
                .add(this.composition, 'debug')
                .onChange(() =>
                {
                    if(this.composition.debug)
                        this.composition.material.defines.USE_DEBUG = ''
                    else
                        delete this.composition.material.defines.USE_DEBUG

                    this.composition.material.needsUpdate = true
                })
        }
    }

    setFinal()
    {
        this.final = {}
        this.final.material = new FinalMaterial(this.composition.renderTarget)
        this.final.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.final.material
        )
        this.final.plane.frustumCulled = false
        this.final.scene = new THREE.Scene()
        this.final.scene.add(this.final.plane)
    }

    resize()
    {
        const bounding = this.domElement.getBoundingClientRect()
        this.viewport.elementWidth = bounding.width
        this.viewport.elementHeight = bounding.height

        // Instance
        this.instance.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)

        // Bloom
        this.bloom.material.uniforms.uResolution.value.set(this.viewport.elementWidth * this.viewport.clampedPixelRatio, this.viewport.elementHeight * this.viewport.clampedPixelRatio)

        // Composition
        this.composition.renderTarget.setSize(this.viewport.elementWidth * this.viewport.clampedPixelRatio, this.viewport.elementHeight * this.viewport.clampedPixelRatio)

        // Final
        this.deferred.renderTarget.setSize(this.viewport.elementWidth * this.viewport.clampedPixelRatio, this.viewport.elementHeight * this.viewport.clampedPixelRatio)
    }

    update()
    {
        // Stats
        if(this.debug.stats)
            this.debug.stats.beforeRender()
        
        // Deferred render
        this.instance.setRenderTarget(this.deferred.renderTarget)
        this.instance.autoClear = true
        this.instance.render(this.scenes.deferred, this.camera.instance)

        // Bloom
        for(let i = 0; i < this.bloom.iterations; i++)
        {
            const distance = this.bloom.distance * Math.pow((i + 1) / (this.bloom.iterations), 2)
            // console.log(distance)

            this.bloom.material.uniforms.uColor.value = i === 0 ? this.deferred.renderTarget.texture[0] : this.bloom.renderTargetA.texture
            this.bloom.material.uniforms.uDirection.value.set(distance, 0)
            this.bloom.material.uniforms.uThreshold.value = i === 0 ? 1 : 0
            this.instance.setRenderTarget(this.bloom.renderTargetB)
            this.instance.render(this.bloom.scene, this.camera.instance)

            this.bloom.material.uniforms.uColor.value = this.bloom.renderTargetB.texture
            this.bloom.material.uniforms.uDirection.value.set(0, distance)
            this.bloom.material.uniforms.uThreshold.value = 0
            this.instance.setRenderTarget(this.bloom.renderTargetA)
            this.instance.render(this.bloom.scene, this.camera.instance)
        }

        // Composition render
        this.composition.material.uniforms.uViewPosition.value.copy(this.camera.instance.position)
        this.instance.setRenderTarget(this.composition.renderTarget)
        this.instance.autoClear = false
        this.instance.render(this.composition.scene, this.camera.instance)

        // Forward render
        this.instance.autoClear = false
        this.instance.render(this.scenes.forward, this.camera.instance)
            
        // Final render
        this.instance.setRenderTarget(null)
        this.instance.autoClear = true
        this.instance.render(this.final.scene, this.camera.instance)
        
        // Stats
        if(this.debug.stats)
            this.debug.stats.afterRender()
    }

    destroy()
    {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.experienceTarget.dispose()
    }
}