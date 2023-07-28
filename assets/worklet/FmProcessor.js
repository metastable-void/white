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
class FmProcessor extends AudioWorkletProcessor {
    constructor() {
        super(...arguments);
        this._phase = 0;
    }
    static get parameterDescriptors() {
        return [
            {
                name: "frequency",
                defaultValue: 440,
                minValue: 0.01,
                maxValue: 20000,
                automationRate: "a-rate",
            },
            {
                name: "level",
                defaultValue: 1,
                minValue: 0,
                maxValue: 1000,
                automationRate: "a-rate",
            },
            {
                name: "gain",
                defaultValue: 1,
                minValue: 0,
                maxValue: 1,
                automationRate: "a-rate",
            },
        ];
    }
    process(inputs, outputs, parameters) {
        const blockSize = outputs[0][0].length;
        const levelValues = parameters.level;
        // mix down all input channels to mono
        const processedInput = new Float32Array(blockSize);
        for (const input of inputs) {
            const channelCount = input.length;
            for (const channel of input) {
                console.assert(channel.length === blockSize);
                for (let i = 0; i < channel.length; i++) {
                    processedInput[i] += channel[i] / channelCount * levelValues[i];
                }
            }
        }
        const result = new Float32Array(blockSize);
        const frequencyValues = parameters.frequency;
        const gainValues = parameters.gain;
        for (let i = 0; i < blockSize; i++) {
            const frequency = frequencyValues[i];
            const phaseIncrement = frequency / sampleRate;
            this._phase += phaseIncrement;
            result[i] = gainValues[i] * Math.sin(this._phase * Math.PI * 2 + processedInput[i] * Math.PI * 2);
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
registerProcessor('fm-processor', FmProcessor);
//# sourceMappingURL=FmProcessor.js.map