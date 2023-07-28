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

class EnvelopeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      {
        name: "note",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate",
      },
      {
        name: "attackDelay",
        defaultValue: 100,
        minValue: 0,
        maxValue: 60000,
        automationRate: "a-rate",
      },
      {
        name: "decayDelay",
        defaultValue: 100,
        minValue: 0,
        maxValue: 60000,
        automationRate: "a-rate",
      },
      {
        name: "sustainLevel",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate",
      },
      {
        name: "releaseDelay",
        defaultValue: 100,
        minValue: 0,
        maxValue: 60000,
        automationRate: "a-rate",
      },
    ];
  }

  private static readonly STATE_OFF = 0;
  private static readonly STATE_ATTACK = 1;
  private static readonly STATE_DECAY = 2;
  private static readonly STATE_SUSTAIN = 3;
  private static readonly STATE_RELEASE = 4;

  private _gain = 0;
  private _currentState = EnvelopeProcessor.STATE_OFF;
  private _currentStateInitialGain = 0;
  private _currentStateSampleCounter = 0;
  private _currentStateMaxSampleCount: number | null = null;

  public override process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
    const blockSize = outputs[0]![0]!.length;

    const monoInput = new Float32Array(blockSize);
    for (const input of inputs) {
      const channelCount = input.length;
      for (let i = 0; i < blockSize; i++) {
        let sum = 0;
        for (let j = 0; j < channelCount; j++) {
          sum += input[j]![i]!;
        }
        monoInput[i] = sum / channelCount;
      }
    }

    const result = new Float32Array(blockSize);
    const noteValues = parameters.note!;
    const attackDelayValues = parameters.attackDelay!;
    const decayDelayValues = parameters.decayDelay!;
    const sustainLevelValues = parameters.sustainLevel!;
    const releaseDelayValues = parameters.releaseDelay!;

    for (let i = 0; i < blockSize; i++) {
      const isNoteOn = noteValues[i]! >= 0.5;
      if (isNoteOn && this._currentState != EnvelopeProcessor.STATE_ATTACK && this._currentState != EnvelopeProcessor.STATE_DECAY && this._currentState != EnvelopeProcessor.STATE_SUSTAIN) {
        this._currentState = EnvelopeProcessor.STATE_ATTACK;
        this._currentStateInitialGain = this._gain;
        this._currentStateSampleCounter = 0;
        this._currentStateMaxSampleCount = Math.trunc(attackDelayValues[i]! * sampleRate / 1000);
      } else if (!isNoteOn && this._currentState != EnvelopeProcessor.STATE_OFF && this._currentState != EnvelopeProcessor.STATE_RELEASE) {
        this._currentState = EnvelopeProcessor.STATE_RELEASE;
        this._currentStateInitialGain = this._gain;
        this._currentStateSampleCounter = 0;
        this._currentStateMaxSampleCount = Math.trunc(releaseDelayValues[i]! * sampleRate / 1000);
      }
      switch (this._currentState) {
        case EnvelopeProcessor.STATE_OFF: {
          this._gain = 0;
          break;
        }

        case EnvelopeProcessor.STATE_ATTACK: {
          this._currentStateSampleCounter++;
          this._gain = this._currentStateInitialGain + (1 - this._currentStateInitialGain) * this._currentStateSampleCounter / this._currentStateMaxSampleCount!;
          if (this._currentStateSampleCounter >= this._currentStateMaxSampleCount!) {
            this._currentState = EnvelopeProcessor.STATE_DECAY;
            this._currentStateInitialGain = 1;
            this._currentStateSampleCounter = 0;
            this._currentStateMaxSampleCount = Math.trunc(decayDelayValues[i]! * sampleRate / 1000);
          }
          break;
        }

        case EnvelopeProcessor.STATE_DECAY: {
          this._currentStateSampleCounter++;
          this._gain = this._currentStateInitialGain + (sustainLevelValues[i]! - this._currentStateInitialGain) * this._currentStateSampleCounter / this._currentStateMaxSampleCount!;
          if (this._currentStateSampleCounter >= this._currentStateMaxSampleCount!) {
            this._currentState = EnvelopeProcessor.STATE_SUSTAIN;
            this._currentStateInitialGain = sustainLevelValues[i]!;
            this._currentStateSampleCounter = 0;
            this._currentStateMaxSampleCount = null;
          }
          break;
        }

        case EnvelopeProcessor.STATE_SUSTAIN: {
          this._gain = sustainLevelValues[i]!;
          break;
        }

        case EnvelopeProcessor.STATE_RELEASE: {
          this._currentStateSampleCounter++;
          this._gain = this._currentStateInitialGain * (1 - this._currentStateSampleCounter / this._currentStateMaxSampleCount!);
          if (this._currentStateSampleCounter >= this._currentStateMaxSampleCount!) {
            this._currentState = EnvelopeProcessor.STATE_OFF;
            this._currentStateInitialGain = 0;
            this._currentStateSampleCounter = 0;
            this._currentStateMaxSampleCount = null;
          }
          break;
        }
      }

      result[i] = this._gain * monoInput[i]!;
    }

    for (const output of outputs) {
      for (const channel of output) {
        for (let i = 0; i < channel.length; i++) {
          channel[i] = result[i]!;
        }
      }
    }
    return true;
  }
}

registerProcessor('envelope-processor', EnvelopeProcessor);
