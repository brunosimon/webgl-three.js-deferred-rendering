import * as THREE from 'three'

import Debug from '@/Debug/Debug.js'
import Resources from '@/Resources.js'
import assets from '@/assets.js'
import EventEmitter from '@/EventEmitter.js'
import Viewport from '@/Viewport.js'
import Time from '@/Time.js'
import Camera from '@/Camera/Camera.js'
import Renderer from '@/Renderer.js'
import World from './World.js'

export default class Experience extends EventEmitter
{
    static instance

    constructor(_options)
    {
        super()
        
        // Singleton
        if(Experience.instance)
        {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.domElement = _options.domElement

        // Setup
        this.debug = new Debug()
        this.viewport = new Viewport({
            domElement: this.domElement
        })
        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.time = new Time()
        this.rendererInstance = new THREE.WebGLRenderer({
            // alpha: false,
            antialias: true,
            // stencil: false,
            powerPreference: 'high-performance'
        })
        this.renderer = new Renderer()
        this.resources = new Resources(this.rendererInstance, assets)

        this.resources.on('end', () =>
        {
            this.world = new World()
        })
            
        window.addEventListener('resize', () =>
        {
            this.resize()
        })

        this.update()
    }

    update()
    {
        this.debug.update()
        this.camera.update()
        this.renderer.update()

        if(this.world)
            this.world.update()

        window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        this.viewport.resize()
        this.camera.resize()
        this.renderer.resize()
    }
}