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

export class SynthesizerBuilder {
  public static readonly WORKLET_PATHS: string[] = [
    'assets/worklet/WhiteNoiseProcessor.js',
    'assets/worklet/SineOscillator.js',
    'assets/worklet/EnvelopeProcessor.js',
  ];

  public workletPaths: string[] = SynthesizerBuilder.WORKLET_PATHS;

  public constructor() {
    // Do nothing.
  }

  /**
   * Should be called on user interaction to prevent errors.
   */
  public async build(): Promise<Synthesizer> {
    const context = new AudioContext({
      sampleRate: 48000,
    });
    await Promise.all(this.workletPaths.map((worklet) => context.audioWorklet.addModule(worklet)));
    return new Synthesizer(context);
  }
}
