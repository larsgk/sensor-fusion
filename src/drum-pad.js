// @ts-check
import {LitElement, css, html} from 'lit-element';

import {Fusion} from './fusion';
import { AudioServer } from './audio-server';

export class DrumPad extends LitElement {
    constructor() {
        super();

        this.sample = "N/A";
    }

    static get properties() {
        return {
            sample: {type: String}
        }
    }

    static get styles() {
        return [css`
            .drum {
                border-radius: 50%;
                background: black;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border: 10px solid #800;
                background-color: #d99449;
            }
        `
        ]
    }

    render() {
        return html`
            <div class="drum" @pointerdown=${this.pdown} @pointerup=${this.pup}></div>
        `;
    }

    pdown(evt) {
        AudioServer.checkInitAudio();
        // console.log('pointerdown, vol =', Fusion.velocity);
        Fusion.pushEvt({sample:this.sample});
    }

    pup() {
        // console.log('pointerup');
    }
}
customElements.define('drum-pad', DrumPad);