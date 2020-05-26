// @ts-check
import {LitElement, css, html} from 'lit-element';

import './drum-pad';

import {Fusion, buf as samplebuf, buf2 as envelope, evtbuf} from './fusion';

import {AudioServer} from './audio-server';

export class MainApp extends LitElement {
    static get styles() {
        return [css`
            :host {
                user-select: none;
            }

            drum-pad {
                position: fixed;
            }

            #pad1 {
                right: 140px;
                bottom: 10px;
                width: 130px;
                height: 130px;
            }

            #pad2 {
                right: 250px;
                bottom: 120px;
                width: 145px;
                height: 145px;
            }

            #pad3 {
                right: 10px;
                bottom: 120px;
                width: 160px;
                height: 160px;
            }
            `
        ];
    }

    constructor() {
        super();

        this.paintGraph = this.paintGraph.bind(this);
    }

    render() {
        return html`<h1>Sensor Fusion Experiment</h1>
            <h3>Accelerometer + touch</h3>
            <drum-pad id="pad1" sample="drum1"></drum-pad>
            <drum-pad id="pad2" sample="drum2"></drum-pad>
            <drum-pad id="pad3" sample="drum3"></drum-pad>
            <canvas width=256 height=200></canvas>
        `;
    }

    firstUpdated() {
        this.graph = this.shadowRoot.querySelector('canvas');

        this.ctx = this.graph.getContext("2d");

        Fusion.addEventListener('sample', () => requestAnimationFrame(this.paintGraph));

        Fusion.addEventListener('replay-event', e => {
            console.log('ReplyEvent', e.detail);
            AudioServer.playEffect(e.detail.sample, Math.log(1 + e.detail._velocity)*0.5);
        });

        AudioServer.loadEffect('./assets/audio/xconga_1.ogg','drum1');
        AudioServer.loadEffect('./assets/audio/xconga_2.ogg','drum2');
        AudioServer.loadEffect('./assets/audio/xconga_3.ogg','drum3');
    }

    plotBuf(buf, color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        let y = 100 - 5 * buf[0];
        this.ctx.moveTo(255,y);
        let x = 254;
        let i = 1
        while(x >= 0 && i < buf.length) {
            y = 100 - 5 * buf[i];
            this.ctx.lineTo(x,y);
            x--;
            i++;
        }
        this.ctx.stroke();
    }

    paintGraph() {
        this.ctx.clearRect(0,0,256,200);
        this.plotBuf(samplebuf, 'blue');
        this.plotBuf(envelope, 'green');
        this.plotBuf(evtbuf, 'red');
    }
}
customElements.define('main-app', MainApp);