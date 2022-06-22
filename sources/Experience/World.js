import Experience from '@/Experience.js'
import DefaultMaterial from '@/Materials/DefaultMaterial.js'
import GlowMaterial from '@/Materials/GlowMaterial.js'
import * as THREE from 'three'
import Lights from './Lights'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.resources = this.experience.resources
        this.scenes = this.experience.scenes
        this.debug = this.experience.debug
        this.time = this.experience.time

        this.setLights()
        this.setFloor()
        this.setCube()
        this.setTorusKnot()
        this.setSphere()
    }

    setLights()
    {
        this.lights = new Lights()

        this.pointLights = []

        for(let i = 0; i < 60; i++)
        {
            const point = {}

            const color = `hsl(${Math.random() * 360}, 100%, 60%)`

            point.light = this.lights.points.create({
                position: new THREE.Vector3(0, 0.01 + Math.random() * 0.5, 0),
                color,
                amplitude: 2,
                intensity: 5,
                concentration: 5
            })

            point.angle = Math.random() * Math.PI * 2
            point.distance = (1 - Math.pow(1 - Math.random(), 2)) * 5
            point.speed = Math.random() * 1
            point.timeOffset = Math.random() * Math.PI * 2

            point.sphere = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.02, 1),
                new GlowMaterial({ color: color, intensity: 5 })
            )
            this.scenes.deferred.add(point.sphere)

            this.pointLights.push(point)
        }

        this.mainLight = {}
        this.mainLight.color = '#ff8833'
        this.mainLight.intensity = 10
        this.mainLight.position = new THREE.Vector3(0, 0.5, 0)
        this.mainLight.light = this.lights.points.create({
            position: new THREE.Vector3(0, 0.5, 0),
            color: this.mainLight.color,
            amplitude: 5,
            intensity: this.mainLight.intensity,
            concentration: 2
        })

        this.mainLight.sphere = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.25, 3),
            new GlowMaterial({ color: this.mainLight.color, intensity: this.mainLight.intensity })
        )
        this.scenes.deferred.add(this.mainLight.sphere)

        
        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('world/mainLight')

            folder
                .addColor(this.mainLight, 'color')
                .onChange(() =>
                {
                    this.mainLight.sphere.material.uniforms.uColor.value.set(this.mainLight.color)
                    this.mainLight.light.color.set(this.mainLight.color)
                })

            folder
                .add(this.mainLight, 'intensity').min(1).max(50).step(0.1)
                .onChange(() =>
                {
                    this.mainLight.sphere.material.uniforms.uIntensity.value = this.mainLight.intensity
                    this.mainLight.light.intensity = this.mainLight.intensity
                })
            // folder.add(this.floor.material.uniforms.uShininess, 'value').min(0).max(256).step(1).name('shininess')
            // folder.add(this.floor.material.uniforms.uMapNormalMultiplier, 'value').min(0).max(2).step(0.001).name('mapNormalMultiplier')
        }
    }

    setFloor()
    {
        this.floor = {}
        this.resources.items.groundColor.encoding = THREE.sRGBEncoding
        this.floor.geometry = new THREE.PlaneGeometry(10, 10)
        this.floor.geometry.computeTangents()
        this.floor.material = new DefaultMaterial({
            shininess: 32,
            // color: 'red',
            mapColor: this.resources.items.groundColor,
            specular: 1,
            mapSpecular: this.resources.items.groundSpecular,
            mapNormal: this.resources.items.groundNormal,
            mapNormalMultiplier: 1
        })
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.rotation.x = - Math.PI * 0.5
        this.scenes.deferred.add(this.floor.mesh)

        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('world/floor')

            folder.add(this.floor.material.uniforms.uSpecular, 'value').min(0).max(1).step(0.001).name('specular')
            folder.add(this.floor.material.uniforms.uShininess, 'value').min(0).max(256).step(1).name('shininess')
            folder.add(this.floor.material.uniforms.uMapNormalMultiplier, 'value').min(0).max(2).step(0.001).name('mapNormalMultiplier')
        }
    }

    setCube()
    {
        this.cube = {}
        this.cube.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.cube.geometry.computeTangents()
        this.cube.material = new DefaultMaterial({
            specular: 0.25,
            shininess: 64,
            mapColor: this.resources.items.bricksColor,
            mapSpecular: this.resources.items.bricksSpecular,
            mapNormal: this.resources.items.bricksNormal
        })
        this.cube.mesh = new THREE.Mesh(this.cube.geometry, this.cube.material)
        this.cube.mesh.position.y = 0.5
        this.scenes.deferred.add(this.cube.mesh)

        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('world/cube')

            folder.add(this.cube.material.uniforms.uSpecular, 'value').min(0).max(1).step(0.001).name('specular')
            folder.add(this.cube.material.uniforms.uShininess, 'value').min(0).max(256).step(1).name('shininess')
            folder.addColor(this.cube.material.uniforms.uColor, 'value').name('color')
        }
    }

    setTorusKnot()
    {
        this.torusKnot = {}
        this.torusKnot.geometry = new THREE.TorusKnotGeometry(0.5, 0.22, 128, 32)
        this.torusKnot.geometry.computeTangents()
        this.torusKnot.material = new DefaultMaterial({
            specular: 1,
            shininess: 256,
            // color: new THREE.Color('#ffffff')
        })
        this.torusKnot.mesh = new THREE.Mesh(this.torusKnot.geometry, this.torusKnot.material)
        this.torusKnot.mesh.position.y = 0.5
        this.torusKnot.mesh.position.x = 2
        this.scenes.deferred.add(this.torusKnot.mesh)

        if(this.debug.active)
        {
            const folder = this.debug.ui.getFolder('world/torusKnot')

            folder.add(this.torusKnot.material.uniforms.uSpecular, 'value').min(0).max(1).step(0.001).name('specular')
            folder.add(this.torusKnot.material.uniforms.uShininess, 'value').min(0).max(256).step(1).name('shininess')
            folder.addColor(this.torusKnot.material.uniforms.uColor, 'value').name('color')
        }
    }

    setSphere()
    {
        this.sphere = {}
        this.sphere.geometry = new THREE.SphereGeometry(0.75, 32, 32)
        this.sphere.geometry.computeTangents()
        this.sphere.material = new DefaultMaterial({
            // color: '#ff6666',
            // intensity: 2,
            specular: 0.25,
            shininess: 128,
            mapColor: this.resources.items.woodColor,
            mapSpecular: this.resources.items.woodSpecular,
            mapNormal: this.resources.items.woodNormal
        })
        this.sphere.mesh = new THREE.Mesh(this.sphere.geometry, this.sphere.material)
        this.sphere.mesh.position.y = 0.5
        this.sphere.mesh.position.x = -2
        this.scenes.deferred.add(this.sphere.mesh)
    }

    resize()
    {
        this.lights.resize()
    }

    update()
    {
        this.lights.update()

        for(const _point of this.pointLights)
        {
            _point.angle = _point.timeOffset + this.time.elapsed * 0.4 * _point.speed
            _point.light.position.x = Math.sin(_point.angle) * _point.distance
            _point.light.position.z = Math.cos(_point.angle) * _point.distance
            _point.light.position.y = Math.sin(_point.timeOffset + this.time.elapsed * 2) * 0.5 + 0.51

            _point.sphere.position.copy(_point.light.position)
        }

        this.mainLight.position.x = Math.sin(this.time.elapsed * 0.2) * 3.5
        this.mainLight.position.z = Math.cos(this.time.elapsed * 0.2) * 3.5

        this.mainLight.light.position.copy(this.mainLight.position)
        this.mainLight.sphere.position.copy(this.mainLight.position)
    }
}