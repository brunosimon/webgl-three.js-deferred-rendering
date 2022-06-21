import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class DebugCamera
{
    constructor(_options)
    {
        this.time = _options.time
        this.baseInstance = _options.baseInstance
        this.domElement = _options.domElement

        this.active = false
        this.instance = this.baseInstance.clone()
        this.instance.position.set(20, 15, 20)
        // this.instance.position.multiplyScalar(1.35)
        
        this.orbitControls = new OrbitControls(this.instance, this.domElement)
        this.orbitControls.enabled = this.active
        this.orbitControls.screenSpacePanning = true
        this.orbitControls.enableKeys = false
        this.orbitControls.zoomSpeed = 0.25
        this.orbitControls.enableDamping = true
        this.orbitControls.update()
    }

    update()
    {
        if(!this.active)
        {
            return
        }

        this.orbitControls.update()
    }

    activate()
    {
        this.active = true
        this.orbitControls.enabled = true
    }

    deactivate()
    {
        this.active = false
        this.orbitControls.enabled = false
    }

    destroy()
    {
        this.orbitControls.dispose()
    }
}
