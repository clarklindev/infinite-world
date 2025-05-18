import * as THREE from 'three'
import Game from '@/Game.js'
import View from '@/View/View.js'
import State from '@/State/State.js'
import PlayerMaterial from './Materials/PlayerMaterial.js'

export default class OtherPlayers {
    constructor() {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.view = View.getInstance()
        this.scene = this.view.scene

        this.players = new Map()
    }

    update() {
        const sunState = this.state.sun

        // Remove players that are no longer present
        for(const [id, mesh] of this.players) {
            if(!this.state.otherPlayers.has(id)) {
                this.scene.remove(mesh)
                this.players.delete(id)
            }
        }

        // Update or add players
        for(const [id, player] of this.state.otherPlayers) {
            let mesh = this.players.get(id)

            // Create new player mesh if needed
            if(!mesh) {
                const material = new PlayerMaterial()
                material.uniforms.uColor.value = new THREE.Color('#fff8d6')
                material.uniforms.uSunPosition.value = new THREE.Vector3()

                mesh = new THREE.Mesh(
                    new THREE.CapsuleGeometry(0.5, 0.8, 3, 16),
                    material
                )
                mesh.geometry.translate(0, 0.9, 0)
                this.scene.add(mesh)
                this.players.set(id, mesh)
            }

            // Update position and rotation
            mesh.position.set(
                player.position[0],
                player.position[1],
                player.position[2]
            )
            mesh.rotation.y = player.rotation

            // Update material
            mesh.material.uniforms.uSunPosition.value.set(
                sunState.position.x,
                sunState.position.y,
                sunState.position.z
            )
        }
    }
}