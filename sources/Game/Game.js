import Debug from '@/Debug/Debug.js'
import State from '@/State/State.js'
import View from '@/View/View.js'
import { createClient } from '@supabase/supabase-js'

export default class Game
{
    static instance

    static getInstance()
    {
        return Game.instance
    }

    constructor()
    {
        if(Game.instance)
            return Game.instance

        Game.instance = this

        this.seed = 'p'
        this.debug = new Debug()
        this.state = new State()
        this.view = new View()
        
        // Initialize Supabase
        this.supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        )

        // Subscribe to player updates
        this.supabase
            .channel('players')
            .on('presence', { event: 'sync' }, () => {
                const players = this.getPlayers()
                this.state.updatePlayers(players)
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                console.log('A player has joined:', newPresences)
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                console.log('A player has left:', leftPresences)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await this.trackPresence()
                }
            })

        window.addEventListener('resize', () =>
        {
            this.resize()
        })

        this.update()
    }

    async trackPresence() {
        const player = this.state.player
        await this.supabase.channel('players').track({
            id: crypto.randomUUID(),
            position: player.position.current,
            rotation: player.rotation
        })
    }

    getPlayers() {
        const channel = this.supabase.channel('players')
        const presenceState = channel.presenceState()
        return Object.values(presenceState).flat()
    }

    update()
    {
        this.state.update()
        this.view.update()

        window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        this.state.resize()
        this.view.resize()
    }

    destroy()
    {
        
    }
}