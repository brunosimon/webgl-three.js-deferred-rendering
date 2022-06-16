import Experience from '@/Experience.js'
import DefaultMaterial from '@/Materials/DefaultMaterial.js'
import * as THREE from 'three'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.resources = this.experience.resources
        this.scene = this.experience.scene

        this.setFloor()
        this.setCube()
        this.setTorusKnot()
        this.setSphere()
    }

    setFloor()
    {
        this.floor = {}
        this.floor.geometry = new THREE.PlaneGeometry(10, 10)
        this.floor.material = new DefaultMaterial({
            // color: 'red',
            mapColor: this.resources.items.groundColor,
            // specular: 1,
            mapSpecular: this.resources.items.groundSpecular
        })
        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.rotation.x = - Math.PI * 0.5
        this.scene.add(this.floor.mesh)
    }

    setCube()
    {
        this.cube = {}
        this.cube.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.cube.material = new DefaultMaterial()
        this.cube.mesh = new THREE.Mesh(this.cube.geometry, this.cube.material)
        this.cube.mesh.position.y = 0.5
        this.scene.add(this.cube.mesh)
    }

    setTorusKnot()
    {
        this.torusKnot = {}
        this.torusKnot.geometry = new THREE.TorusKnotGeometry(0.5, 0.22, 64, 32)
        this.torusKnot.material = new DefaultMaterial({
            specular: 1,
            color: new THREE.Color('green')
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
        this.sphere.material = new DefaultMaterial({
            // color: 'blue'
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