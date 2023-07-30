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

import { Synthesizer } from "./Synthesizer.js";
import { SineOscillatorNode } from "./interface/SineOscillatorNode.js";
import { GainEnvelopeNode } from "./interface/GainEnvelopeNode.js";

export class Operator extends EventTarget implements AudioNode {
  channelCount: number;
  channelCountMode: ChannelCountMode;
  channelInterpretation: ChannelInterpretation;
  readonly context: BaseAudioContext;
  readonly numberOfInputs: number;
  readonly numberOfOutputs: number;

  readonly oscillator: SineOscillatorNode;
  readonly envelope: GainEnvelopeNode;

  constructor(synth: Synthesizer) {
    super();
    this.context = synth.context;
    this.numberOfInputs = 0;
    this.numberOfOutputs = 1;
    this.channelCount = 1;
    this.channelCountMode = 'explicit';
    this.channelInterpretation = 'speakers';

    this.oscillator = synth.createSineOscillatorNode();
    this.envelope = synth.createGainEnvelopeNode();

    this.oscillator.connect(this.envelope);
  }

  connect(destinationNode: AudioNode, output?: number | undefined, input?: number | undefined): AudioNode;
  connect(destinationParam: AudioParam, output?: number | undefined): void;
  connect(destinationNode: AudioNode | AudioParam, output?: number, input?: number): void | AudioNode {
    if (destinationNode instanceof AudioParam) {
      this.envelope.connect(destinationNode, output);
      return;
    }
    return this.envelope.connect(destinationNode, output, input);
  }

  disconnect(): void;
  disconnect(output: number): void;
  disconnect(destinationNode: AudioNode): void;
  disconnect(destinationNode: AudioNode, output: number): void;
  disconnect(destinationNode: AudioNode, output: number, input: number): void;
  disconnect(destinationParam: AudioParam): void;
  disconnect(destinationParam: AudioParam, output: number): void;
  disconnect(destinationNode?: unknown, output?: unknown, input?: unknown): void {
    throw new Error("Method not implemented.");
  }
}
