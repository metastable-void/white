// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: ts=2 sw=2 et ai
/**
  Copyright 2023 metastable-void

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
import './worklet-interfaces.js';
class SineOscillator extends AudioWorkletProcessor {
    constructor() {
        super(...arguments);
        this._phase = 0;
    }
    static get parameterDescriptors() {
        return [
            {
                name: "frequency",
                defaultValue: 440,
                minValue: 0,
                maxValue: 20000,
                automationRate: "a-rate",
            },
            {
                name: "phaseOffset",
                defaultValue: 0,
                automationRate: "a-rate",
            },
            {
                name: "gain",
                defaultValue: 1,
                minValue: 0,
                automationRate: "a-rate",
            },
        ];
    }
    process(inputs, outputs, parameters) {
        const blockSize = outputs[0][0].length;
        const result = new Float32Array(blockSize);
        const frequencyValues = parameters.frequency;
        const gainValues = parameters.gain;
        const phaseOffsetValues = parameters.phaseOffset;
        for (let i = 0; i < blockSize; i++) {
            const frequency = frequencyValues[i] ?? frequencyValues[0];
            const phaseIncrement = frequency / sampleRate;
            this._phase += phaseIncrement;
            result[i] = (gainValues[i] ?? gainValues[0]) * Math.sin(this._phase * Math.PI * 2 + (phaseOffsetValues[i] ?? phaseOffsetValues[0]));
        }
        for (const output of outputs) {
            for (const channel of output) {
                for (let i = 0; i < channel.length; i++) {
                    channel[i] = result[i];
                }
            }
        }
        return true;
    }
}
registerProcessor('sine-oscillator', SineOscillator);
//# sourceMappingURL=SineOscillator.js.map