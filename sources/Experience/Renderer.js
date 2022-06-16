import * as THREE from 'three'

import Experience from '@/Experience.js'
import CompositionMaterial from './Materials/CompositionMaterial.js'

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
        
        this.setInstance()
        this.setComposition()
        this.setDebug()
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

    setComposition()
    {
        this.composition = {}

        this.composition.renderTargets = new THREE.WebGLMultipleRenderTargets(
            this.viewport.elementWidth,
            this.viewport.elementHeight,
            4
        )

        for(const _texture of this.composition.renderTargets.texture)
        {
            _texture.minFilter = THREE.NearestFilter
            _texture.magFilter = THREE.NearestFilter
            // _texture.generateMipmaps = true
            // _texture.encoding = THREE.sRGBEncoding
        }

        this.composition.renderTargets.texture[0].name = 'position'
        this.composition.renderTargets.texture[0].type = THREE.FloatType

        this.composition.renderTargets.texture[1].name = 'color'
        this.composition.renderTargets.texture[1].type = THREE.UnsignedByteType
        
        this.composition.renderTargets.texture[2].name = 'normal'
        this.composition.renderTargets.texture[2].type = THREE.FloatType
        
        this.composition.renderTargets.texture[3].name = 'specular'
        this.composition.renderTargets.texture[3].type = THREE.UnsignedByteType
        this.composition.renderTargets.texture[3].format = THREE.RedFormat


        this.composition.scene = new THREE.Scene()
        this.composition.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        this.composition.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new CompositionMaterial(this.composition.renderTargets)
        )
        this.composition.scene.add(this.composition.plane)
    }

    resize()
    {
        const bounding = this.domElement.getBoundingClientRect()
        this.viewport.elementWidth = bounding.width
        this.viewport.elementHeight = bounding.height

        // Instance
        this.instance.setSize(this.viewport.elementWidth, this.viewport.elementHeight)
        this.instance.setPixelRatio(this.viewport.clampedPixelRatio)
    }

    update()
    {
        if(this.debug.stats)
            this.debug.stats.beforeRender()

        // Render scene
        this.instance.setRenderTarget(this.composition.renderTargets)
        this.instance.render(this.scene, this.camera.instance)

        // Render composition
        this.instance.setRenderTarget(null)
        this.instance.render(this.composition.scene, this.composition.camera)
        
        // this.instance.render(this.scene, this.camera.instance)

        if(this.debug.stats)
            this.debug.stats.afterRender()
    }

    destroy()
    {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.experienceTarget.dispose()
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
    }
}