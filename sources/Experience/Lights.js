import Experience from '@/Experience.js'
import * as THREE from 'three'

export default class Lights
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer

        this.setAmbient()
        this.setHemi()
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
        this.hemi.intensity = 1
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

    update()
    {
    }
}