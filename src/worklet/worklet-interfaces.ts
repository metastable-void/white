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

declare global {
  interface AudioWorkletProcessor {
    readonly port: MessagePort;
    process(
      inputs: Float32Array[][],
      outputs: Float32Array[][],
      parameters: Record<string, Float32Array>
    ): boolean;
  }
  
  interface AudioParamDescriptor {
    name: string;
    automationRate?: 'a-rate' | 'k-rate';
    minValue?: number;
    maxValue?: number;
    defaultValue?: number;
  }

  // eslint-disable-next-line no-var
  var currentFrame: number;

  // eslint-disable-next-line no-var
  var currentTime: number;

  // eslint-disable-next-line no-var
  var sampleRate: number;

  // eslint-disable-next-line no-var
  var registerProcessor: (
    name: string,
    processorCtor: (new (
      options?: AudioWorkletNodeOptions
    ) => AudioWorkletProcessor) & {
      parameterDescriptors?: AudioParamDescriptor[];
    }
  ) => void;

  // eslint-disable-next-line no-var
  var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
  };
}

export {};
