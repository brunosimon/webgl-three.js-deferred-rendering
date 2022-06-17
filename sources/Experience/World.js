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
        this.scene = this.experience.scene

        this.lights = new Lights()

        this.setFloor()
        this.setCube()
        this.setTorusKnot()
        this.setSphere()
    }

    setFloor()
    {
        this.floor = {}
        this.resources.items.groundColor.encoding = THREE.sRGBEncoding
        this.floor.geometry = new THREE.PlaneGeometry(10, 10)
        this.floor.geometry.computeTangents()
        this.floor.material = new DefaultMaterial({
            // color: 'red',
            mapColor: this.resources.items.groundColor,
            // specular: 1,
            mapSpecular: this.resources.items.groundSpecular,
            mapNormal: this.resources.items.groundNormal
        })
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.rotation.x = - Math.PI * 0.5
        this.scene.add(this.floor.mesh)
    }

    setCube()
    {
        this.cube = {}
        this.cube.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.cube.geometry.computeTangents()
        this.cube.material = new DefaultMaterial({
            specular: 0.25,
            mapColor: this.resources.items.bricksColor,
            mapSpecular: this.resources.items.bricksSpecular,
            mapNormal: this.resources.items.bricksNormal
        })
        this.cube.mesh = new THREE.Mesh(this.cube.geometry, this.cube.material)
        this.cube.mesh.position.y = 0.5
        this.scene.add(this.cube.mesh)
    }

    setTorusKnot()
    {
        this.torusKnot = {}
        this.torusKnot.geometry = new THREE.TorusKnotGeometry(0.5, 0.22, 128, 32)
        this.torusKnot.geometry.computeTangents()
        this.torusKnot.material = new DefaultMaterial({
            shininess: 256,
            specular: 1,
            // color: new THREE.Color('#ffffff')
        })
        this.torusKnot.mesh = new THREE.Mesh(this.torusKnot.geometry, this.torusKnot.material)
        this.torusKnot.mesh.position.y = 0.5
        this.torusKnot.mesh.position.x = 2
        this.scene.add(this.torusKnot.mesh)
    }

    setSphere()
    {
        this.sphere = {}
        this.sphere.geometry = new THREE.SphereGeometry(0.75, 32, 32)
        this.sphere.geometry.computeTangents()
        this.sphere.material = new DefaultMaterial({
            specular: 0.25,
            mapColor: this.resources.items.woodColor,
            mapSpecular: this.resources.items.woodSpecular,
            mapNormal: this.resources.items.woodNormal
        })
        this.sphere.mesh = new THREE.Mesh(this.sphere.geometry, this.sphere.material)
        this.sphere.mesh.position.y = 0.5
        this.sphere.mesh.position.x = -2
        this.scene.add(this.sphere.mesh)
    }

    update()
    {
    }
}