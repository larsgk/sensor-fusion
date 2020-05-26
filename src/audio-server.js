// @ts-check

export const AudioServer = new class extends EventTarget {

    constructor() {
        super();

        this.effects = new Map();
        this.ctx = new AudioContext();
    }

    checkInitAudio() {
        if (!this._initialized) {
            this.ctx.resume();
        }
        this._initialized = true;
    }

    async loadEffect(sample, name) {
        const res = await fetch(sample);
        const data = await res.arrayBuffer();
        this.ctx.decodeAudioData(data , buffer => {
            this.effects.set(name, buffer);
        });
    }

    playEffect(name, volume) {
        if (!this.effects.has(name)) return;

        const source = this.ctx.createBufferSource();
        source.buffer = this.effects.get(name);

        const gainNode = this.ctx.createGain();

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        gainNode.gain.value = volume;

        source.start(0);
    }
}


