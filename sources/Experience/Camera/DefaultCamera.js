import * as THREE from 'three'

export default class DefaultCamera
{
    constructor(_options)
    {
        this.time = _options.time
        this.baseInstance = _options.baseInstance

        this.active = false

        this.instance = this.baseInstance.clone()
        this.instance.position.set(15, 15, 15)
        this.instance.rotation.reorder('YXZ')
    }

    activate()
    {
        this.active = true
    }

    deactivate()
    {
        this.active = false
    }

    destroy()
    {
    }
}
