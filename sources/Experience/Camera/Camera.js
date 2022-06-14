import * as THREE from 'three'
import Experience from '@/Experience.js'
import DefaultCamera from '@/Camera/DefaultCamera.js'
import DebugCamera from '@/Camera/DebugCamera.js'

export default class Camera
{
    constructor(_options)
    {
        // Options
        this.experience = Experience.instance
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.viewport = this.experience.viewport
        this.domElement = this.experience.domElement
        this.scene = this.experience.scene

        // Set up
        this.mode = 'debugCamera' // defaultCamera \ debugCamera

        this.setInstance()
        this.setDefaultCamera()
        this.setDebugCamera()
        this.setDebug()

        this[this.mode].activate()
    }

    setInstance()
    {
        // Set up
        this.instance = new THREE.PerspectiveCamera(
            12, // 12
            this.viewport.elementWidth / this.viewport.elementHeight,
            0.1,
            150
        )
        this.instance.rotation.reorder('YXZ')

        this.scene.add(this.instance)
    }

    setDefaultCamera()
    {
        // Set up
        this.defaultCamera = new DefaultCamera({
            time: this.time,
            baseInstance: this.instance,
            domElement: this.domElement
        })
    }

    setDebugCamera()
    {
        this.debugCamera = new DebugCamera({
            time: this.time,
            baseInstance: this.instance,
            domElement: this.domElement
        })

        if(this.mode === 'debugCamera')
        {
            this.debugCamera.activate()
        }
    }

    setDebug()
    {
        const debug = this.experience.debug

        if(!debug.active)
            return

        // General
        const folder = debug.ui.getFolder('camera')
        // folder.open()

        folder
            .add(
                this,
                'mode',
                {
                    'default': 'defaultCamera',
                    'debug': 'debugCamera'
                }
            )
            .name('mode')
            .onChange(() =>
            {
                if(this.mode === 'defaultCamera')
                {
                    this.debugCamera.deactivate()
                    this.defaultCamera.activate()
                }
                else
                {
                    this.defaultCamera.deactivate()
                    this.debugCamera.activate()
                }
            })
    }

    resize()
    {
        this.instance.aspect = this.viewport.elementWidth / this.viewport.elementHeight
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        this.debugCamera.update()

        this.instance.position.copy(this[this.mode].instance.position)
        this.instance.quaternion.copy(this[this.mode].instance.quaternion)
        this.instance.updateMatrixWorld() // To be used in projection
    }

    destroy()
    {
        this.defaultCamera.destroy()
        this.debugCamera.destroy()
    }
}
