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

import { SineOscillatorNode } from "./interface/SineOscillatorNode.js";
import { WhiteNoiseNode } from "./interface/WhiteNoiseNode.js";
import { EnvelopeNode } from "./interface/EnvelopeNode.js";

export class Synthesizer {
  public readonly context: AudioContext;

  public constructor(context: AudioContext) {
    this.context = context;
  }

  public get destination(): AudioDestinationNode {
    return this.context.destination;
  }

  private createAudioWorkletNode(name: string, options: AudioWorkletNodeOptions | undefined): AudioWorkletNode {
    const node = new AudioWorkletNode(this.context, name, options);
    node.onprocessorerror = (ev) => {
      console.error(ev);
    };
    return node;
  }

  public createWhiteNoiseNode(): WhiteNoiseNode {
    const node = this.createAudioWorkletNode('white-noise-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    }) as AudioWorkletNode & {
      gain: AudioParam;
    };
    node.gain = node.parameters.get('gain')!;
    return node;
  }

  public createSineOscillatorNode(): SineOscillatorNode {
    const node = this.createAudioWorkletNode('sine-oscillator', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    }) as AudioWorkletNode & {
      frequency: AudioParam;
      phaseOffset: AudioParam;
      gain: AudioParam;
    };
    node.frequency = node.parameters.get('frequency')!;
    node.phaseOffset = node.parameters.get('phaseOffset')!;
    node.gain = node.parameters.get('gain')!;
    return node;
  }

  public createEnvelopeNode(): EnvelopeNode {
    const node = this.createAudioWorkletNode('envelope-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    }) as AudioWorkletNode & {
      note: AudioParam;
      attackDelay: AudioParam;
      decayDelay: AudioParam;
      sustainLevel: AudioParam;
      releaseDelay: AudioParam;
    };
    node.note = node.parameters.get('note')!;
    node.attackDelay = node.parameters.get('attackDelay')!;
    node.decayDelay = node.parameters.get('decayDelay')!;
    node.sustainLevel = node.parameters.get('sustainLevel')!;
    node.releaseDelay = node.parameters.get('releaseDelay')!;
    return node;
  }
}
