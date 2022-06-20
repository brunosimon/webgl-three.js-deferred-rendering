import Experience from '@/Experience.js'
import * as THREE from 'three'

export default class Lights
{
    constructor()
    {
        this.experience = new Experience()
        this.scenes = this.experience.scenes
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer

        this.setAmbient()
        this.setHemi()
        this.setPoints()
    }

    setAmbient()
    {
        this.ambient = {}
        this.ambient.color = new THREE.Color('white')
        this.ambient.intensity = 0
        this.ambient.updateUniforms = () =>
        {
            this.renderer.composition.material.uniforms.uAmbientLight.value.color = this.ambient.color
            this.renderer.composition.material.uniforms.uAmbientLight.value.intensity = this.ambient.intensity
        }
        this.ambient.updateUniforms()
        
        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('lights/ambient')

            folder.addColor(this.ambient, 'color').onChange(this.ambient.updateUniforms)
            folder.add(this.ambient, 'intensity').min(0).max(2).step(0.01).onChange(this.ambient.updateUniforms)
        }
    }

    setHemi()
    {
        this.hemi = {}
        this.hemi.groundColor = new THREE.Color('#3300ff')
        this.hemi.skyColor = new THREE.Color('#ff6600')
        this.hemi.intensity = 0
        this.hemi.direction = new THREE.Vector3(-0.2, 0.2, 0.09)
        this.hemi.updateUniforms = () =>
        {
            this.renderer.composition.material.uniforms.uHemiLight.value.groundColor = this.hemi.groundColor
            this.renderer.composition.material.uniforms.uHemiLight.value.skyColor = this.hemi.skyColor
            this.renderer.composition.material.uniforms.uHemiLight.value.intensity = this.hemi.intensity
            this.renderer.composition.material.uniforms.uHemiLight.value.direction = this.hemi.direction
        }
        this.hemi.updateUniforms()
        
        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('lights/hemi')

            folder.addColor(this.hemi, 'groundColor').onChange(this.hemi.updateUniforms)
            folder.addColor(this.hemi, 'skyColor').onChange(this.hemi.updateUniforms)
            folder.add(this.hemi, 'intensity').min(0).max(2).step(0.01).onChange(this.hemi.updateUniforms)
            folder.add(this.hemi.direction, 'x').min(-1).max(1).step(0.01).onChange(this.hemi.updateUniforms)
            folder.add(this.hemi.direction, 'y').min(-1).max(1).step(0.01).onChange(this.hemi.updateUniforms)
            folder.add(this.hemi.direction, 'z').min(-1).max(1).step(0.01).onChange(this.hemi.updateUniforms)
        }
    }

    setPoints()
    {
        this.points = {}
        this.points.max = 100
        this.points.items = []
        this.points.needsUpdate = false

        this.points.create = (_parameters = {}) =>
        {
            const point = {}

            // Position
            if(typeof _parameters.position === 'undefined' || !(_parameters.position instanceof THREE.Vector3))
                point.position = new THREE.Vector3()
            else
                point.position = _parameters.position
            
            // Color
            if(typeof _parameters.color === 'undefined')
                point.color = new THREE.Color(0xffffff)
            else if(_parameters.color instanceof THREE.Color)
            {
                point.color = _parameters.color
            }
            else
            {
                point.color = new THREE.Color(_parameters.color)
            }
            
            // Intensity
            if(typeof _parameters.intensity === 'number')
                point.intensity = _parameters.intensity
            else
                point.intensity = 3
            
            // Amplitude
            if(typeof _parameters.amplitude === 'number')
                point.amplitude = _parameters.amplitude
            else
                point.amplitude = 5
            
            // Concentration
            if(typeof _parameters.concentration === 'number')
                point.concentration = _parameters.concentration
            else
                point.concentration = 5
           
            this.points.items.push(point)

            // Update
            this.points.needsUpdate = true

            // Return
            return point
        }
        
        this.points.updateUniforms = () =>
        {
            // Count
            this.renderer.composition.material.uniforms.uPointLightsCount.value = this.points.items.length

            // Lights
            const uPointLights = [...this.points.items]
            
            const dummyLight = {
                position: new THREE.Vector3(0, 0, 0),
                color: new THREE.Color(),
                intensity: 0,
                amplitude: 0,
                concentration: 0
            }

            // Fill with dummy lights
            for(let i = this.points.items.length; i < this.points.max; i++)
                uPointLights.push(dummyLight)
            this.renderer.composition.material.uniforms.uPointLights.value = uPointLights

            // Max changed
            if(this.points.max !== this.renderer.composition.material.defines.MAX_LIGHTS)
            {
                this.renderer.composition.material.defines.MAX_LIGHTS = this.points.max
                this.renderer.composition.material.needsUpdate = true
            }
        }
    }

    update()
    {
        if(this.points.needsUpdate)
        {
            this.points.needsUpdate = false
            this.points.updateUniforms()
        }
    }
}