import Experience from '@/Experience.js'
import DefaultMaterial from '@/Materials/DefaultMaterial.js'
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
        this.setForwardSphere()
    }

    setLights()
    {
        this.lights = new Lights()

        this.pointLights = []

        for(let i = 0; i < 100; i++)
        {
            const point = this.lights.points.create({
                position: new THREE.Vector3(0, 0.01 + Math.random() * 0.5, 0),
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                amplitude: 2,
                intensity: 5,
                concentration: 5
            })
            point.angle = Math.random() * Math.PI * 2
            point.distance = (1 - Math.pow(1 - Math.random(), 2)) * 5
            point.speed = Math.random() * 1

            this.pointLights.push(point)
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

    setForwardSphere()
    {
        this.forwardSphere = {}
        this.forwardSphere.geometry = new THREE.SphereGeometry(0.49, 32, 32)
        this.forwardSphere.material = new THREE.MeshBasicMaterial({ color: 'lime' })
        this.forwardSphere.mesh = new THREE.Mesh(this.forwardSphere.geometry, this.forwardSphere.material)
        this.forwardSphere.mesh.position.y = 0.5
        this.forwardSphere.mesh.position.x = -1
        this.scenes.forward.add(this.forwardSphere.mesh)
    }

    update()
    {
        this.lights.update()

        for(const _point of this.pointLights)
        {
            _point.angle = (this.time.elapsed + 999) * _point.speed
            _point.position.x = Math.sin(_point.angle) * _point.distance
            _point.position.z = Math.cos(_point.angle) * _point.distance
            // _point.position.y = 0.25
        }

        this.forwardSphere.mesh.position.x = Math.sin(this.time.elapsed) * 4
    }
}