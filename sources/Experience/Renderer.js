import * as THREE from 'three'

import Experience from '@/Experience.js'
import CompositionMaterial from './Materials/CompositionMaterial.js'
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

        // this.instance.setClearColor(0x414141, 1)
        // this.instance.autoClear = false
        this.instance.setClearColor(this.clearColor, 0)
        this.instance.setClearAlpha(0)
        this.instance.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)

        // this.instance.physicallyCorrectLights = true
        // this.instance.outputEncoding = THREE.sRGBEncoding
        // this.instance.shadowMap.enabled = this.experience.quality === 'high'
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // this.instance.toneMapping = THREE.CineonToneMapping
        // this.instance.toneMapping = THREE.ACESFilmicToneMapping
        // this.instance.toneMappingExposure = 2.1

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
        this.deferred.debug = false

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
        this.deferred.renderTarget.texture[1].type = THREE.UnsignedByteType
        
        this.deferred.renderTarget.texture[2].name = 'normal'
        this.deferred.renderTarget.texture[2].type = THREE.FloatType
        
        this.deferred.renderTarget.texture[3].name = 'specular'
        this.deferred.renderTarget.texture[3].type = THREE.UnsignedByteType
        this.deferred.renderTarget.texture[3].format = THREE.RGFormat
    }

    setComposition()
    {
        this.composition = {}
        this.composition.debug = false

        this.composition.renderTarget = new THREE.WebGLRenderTarget(
            this.viewport.elementWidth,
            this.viewport.elementHeight,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                // generateMipmaps: false,
                // encoding: THREE.sRGBEncoding
            }
        )
        this.composition.renderTarget.depthTexture = this.deferred.depthTexture

        this.composition.material = new CompositionMaterial(this.deferred.renderTarget, this.composition.debug)
        this.composition.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.composition.material
        )
        this.composition.plane.frustumCulled = false
        this.scenes.composition.add(this.composition.plane)

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
        this.scenes.final.add(this.final.plane)
    }

    resize()
    {
        const bounding = this.domElement.getBoundingClientRect()
        this.viewport.elementWidth = bounding.width
        this.viewport.elementHeight = bounding.height

        // Instance
        this.instance.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)

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
        this.instance.render(this.scenes.deferred, this.camera.instance)
        this.instance.autoClear = false

        // Composition render
        this.composition.material.uniforms.uViewPosition.value.copy(this.camera.instance.position)
        this.instance.setRenderTarget(this.composition.renderTarget)
        this.instance.render(this.scenes.composition, this.camera.instance)
            
        // Forward render
        this.instance.render(this.scenes.forward, this.camera.instance)
        this.instance.autoClear = true

        // Final render
        this.instance.setRenderTarget(null)
        this.instance.render(this.scenes.final, this.camera.instance)
        
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