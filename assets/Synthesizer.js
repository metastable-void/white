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
export class Synthesizer {
    constructor(context) {
        this.context = context;
    }
    get destination() {
        return this.context.destination;
    }
    createAudioWorkletNode(name, options) {
        const node = new AudioWorkletNode(this.context, name, options);
        node.onprocessorerror = (ev) => {
            console.error(ev);
        };
        return node;
    }
    createWhiteNoiseNode() {
        const node = this.createAudioWorkletNode('white-noise-processor', {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [1],
        });
        node.gain = node.parameters.get('gain');
        return node;
    }
    createSineOscillatorNode() {
        const node = this.createAudioWorkletNode('sine-oscillator', {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [1],
        });
        node.frequency = node.parameters.get('frequency');
        node.phaseOffset = node.parameters.get('phaseOffset');
        node.gain = node.parameters.get('gain');
        return node;
    }
    createGainEnvelopeNode() {
        const node = this.createAudioWorkletNode('gain-envelope-processor', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
        });
        node.note = node.parameters.get('note');
        node.gain = node.parameters.get('gain');
        node.attackDelay = node.parameters.get('attackDelay');
        node.decay1Delay = node.parameters.get('decay1Delay');
        node.breakpointLevel = node.parameters.get('breakpointLevel');
        node.decay2Delay = node.parameters.get('decay2Delay');
        node.sustainLevel = node.parameters.get('sustainLevel');
        node.releaseDelay = node.parameters.get('releaseDelay');
        return node;
    }
}
//# sourceMappingURL=Synthesizer.js.map