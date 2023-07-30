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
class WhiteNoiseProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: "gain",
                defaultValue: 1,
                minValue: 0,
                automationRate: "a-rate",
            },
        ];
    }
    process(inputs, outputs, parameters) {
        const gainValues = parameters.gain;
        for (const output of outputs) {
            for (const channel of output) {
                for (let i = 0; i < channel.length; i++) {
                    channel[i] = (Math.random() * 2 - 1) * (gainValues[i] ?? gainValues[0]);
                }
            }
        }
        return true;
    }
}
registerProcessor('white-noise-processor', WhiteNoiseProcessor);
//# sourceMappingURL=WhiteNoiseProcessor.js.map