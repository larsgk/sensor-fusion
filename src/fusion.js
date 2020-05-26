// @ts-check

let accelerometer = undefined;
export const buf = new Float64Array(256);
export const buf2 = new Float64Array(256);
export const evtbuf = new Float64Array(256);

export const Fusion = new class extends EventTarget {

    constructor() {
        super();
        console.log('Init');
        accelerometer = new Accelerometer({frequency: 60});

        this.initialize();

        this.velocity = 0;

        this.evts = [];
    }

    pushEvt(evt) {
        evt._velocity = this.velocity;
        this.evts.push(evt);
    }

    initialize() {
        let oldZ;

        accelerometer.addEventListener('reading', () => {
            if (oldZ !== undefined) {

                buf.copyWithin(1, 0, 255);
                buf[0] = accelerometer.z - oldZ;

                this.velocity *= 0.3;
                this.velocity = Math.max(Math.abs(buf[0]), this.velocity);

                buf2.copyWithin(1, 0, 255);
                buf2[0] = this.velocity;

                evtbuf.copyWithin(1, 0, 255);
                evtbuf[0] = this.evts.length * this.velocity;

                this.dispatchEvent(new CustomEvent('sample'));

                this.evts.forEach(evt => {
                    // Insert velocity and forward...
                    evt._velocity = Math.max(evt._velocity, this.velocity);
                    this.dispatchEvent(new CustomEvent('replay-event', {detail: evt}));
                });
                this.evts = [];
            }
            oldZ = accelerometer.z;
        });

        accelerometer.start();
    }
}


