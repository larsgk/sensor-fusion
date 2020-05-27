---
title: Web Sensor Fusion Experiment
published: true
description: Combining accelerometer & touch for pointer velocity
tags: LitElement, Accelerometer, Web, Music
---

Playing music and doing odd experiments with hardware and software are some of [my favorite things](https://www.youtube.com/watch?v=4_PUZkJ79BE).

However, playing virtual instruments on touch devices is quite far from the feeling of real instruments and I've always wondered how this could be improved. Volume control and tactile feedback are major issues and for quite some time, I've been wondering how to get around those.

Currently, working with web, I decided to make a quick sensor fusion experiment utilizing the [accelerometer](https://www.w3.org/TR/accelerometer) (one of the [Generic Sensor APIs](https://www.w3.org/TR/generic-sensor/)), augmenting touch events to capture hit velocity for a more natural feel while playing drums or piano keys.

Here is the [demo](https://larsgk.github.io/sensor-fusion)

NOTE: It's only been tested on Chrome for Android.

# Capturing accelerometer data

A long, long time ago (web tech time .. actually just a few earth years), sensor APIs were done ad-hoc, sometimes rushed a bit by mobile device  manufacturers, who needed support for some killer feature in products in the pipeline.  This resulted in very different APIs of varying quality scattered around in the Web APIs.  Fortunately, some bright minds got together to clean up the mess and the result was the [Generic Sensor API](https://www.w3.org/TR/generic-sensor/), bringing order to the chaos and much joy to web developers.

For example, here's what it's like to get accelerometer data with the spiffy new APIs:

```javascript
const accelerometer = new Accelerometer({frequency: 60});

...

accelerometer.addEventListener('reading', () => {
    console.log(`(x,y,z) = ${accelerometer.x},${accelerometer.y},${accelerometer.z}`);
}
```

# Fusion with touch events

Accelerometer data flows in continuously at 60Hz and pointer events can happen anytime - hopefully, not long after the user touches the screen -
so I was considering different approaches to get a proper velocity on a touch event:

 * Adding accelerometer and touch events on streams that would merge and get processed - possibly off main thread
 * Utilizing WebAssembly for analyzing accelerometer curve data (faster) for a low latency response
 * Jumping on the ML wagon, using TensorflowJS and do some magical model

However, slightly lazy and hit by the COVID-19 cabin fever, I decided to just hack away toward a Pythagorean (shortest path :)) solution
and it actually turned out better than expected!

*NOTE: If you have an idea of how to improve the solution I made, possibly going for one of the approaches mentioned above, I'd love to see how it works out - please do a fork or a PR and tell me about it!*

I built a very simple 'fusion engine' that ingests the flowing accelerometer data and also is the receiver of touch events. As touch events mainly affect the Z axis and we need to compensate for gravity (and angles), using a simple diff between samples, gives us a fair measurement of hit force, regardless of device to earth angle.

As the accelerometer only samples at 60Hz and hits on the screen can happen anytime, there is a high likelihood of the tip of the acceleration sample being just before or just after the touch event is received. Also, the acceleration goes both ways (+/-) so I decided to do a cheap fast decaying envelope over the absolute Z axis samples.

When a touch event is registered, it is sent to the fusion logic, is held for a sample and the max envelope reading is applied before the event is replayed back to whomever is listening. Low latency on audible feedback is very important when playing musical instruments, so we can't afford spending too many 60Hz readings before playing the sound. Hence, only one subsequent sample is used before firing the event.

```javascript
    pushEvt(evt) {
        evt._velocity = this.velocity;
        this.evts.push(evt);
    }

    initialize() {
        let oldZ;

        accelerometer.addEventListener('reading', () => {
            if (oldZ !== undefined) {

                this.velocity *= 0.3;
                this.velocity = Math.max(accelerometer.z - oldZ, this.velocity);

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
```

# Last but not least

Besides the awesome [vanillaJS](http://vanilla-js.com/) framework, [LitElement](https://lit-element.polymer-project.org/), used for this demo, is really great for both quick tech demos and larger enterprise apps.

If you are not familiar with those, I can definitely recommend that you try them out!

Thanks to [@kennethrohde](https://twitter.com/kennethrohde), [@anssik](https://twitter.com/anssik) and [@justinfagnani](https://twitter.com/justinfagnani) for providing the foundation for this demo.

