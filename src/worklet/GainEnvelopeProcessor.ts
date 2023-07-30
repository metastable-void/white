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

class GainEnvelopeProcessor extends AudioWorkletProcessor {
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
        name: "gain",
        defaultValue: 1,
        minValue: 0,
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
        name: "decay1Delay",
        defaultValue: 100,
        minValue: 0,
        maxValue: 60000,
        automationRate: "a-rate",
      },
      {
        name: "breakpointLevel",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate",
      },
      {
        name: "decay2Delay",
        defaultValue: 0,
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
  private static readonly STATE_DECAY1 = 2;
  private static readonly STATE_DECAY2 = 3;
  private static readonly STATE_SUSTAIN = 4;
  private static readonly STATE_RELEASE = 5;

  private static readonly NOTE_ON_STATES: ReadonlySet<number> = new Set([
    GainEnvelopeProcessor.STATE_ATTACK,
    GainEnvelopeProcessor.STATE_DECAY1,
    GainEnvelopeProcessor.STATE_DECAY2,
    GainEnvelopeProcessor.STATE_SUSTAIN,
  ]);

  private _gain = 0;
  private _currentState = GainEnvelopeProcessor.STATE_OFF;
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
    const gainValues = parameters.gain!;
    const attackDelayValues = parameters.attackDelay!;
    const decay1DelayValues = parameters.decay1Delay!;
    const breakpointLevelValues = parameters.breakpointLevel!;
    const decay2DelayValues = parameters.decay2Delay!;
    const sustainLevelValues = parameters.sustainLevel!;
    const releaseDelayValues = parameters.releaseDelay!;

    for (let i = 0; i < blockSize; i++) {
      const noteValue = noteValues[i] ?? noteValues[0]!;
      const gainValue = gainValues[i] ?? gainValues[0]!;
      const attackDelayValue = attackDelayValues[i] ?? attackDelayValues[0]!;
      const decay1DelayValue = decay1DelayValues[i] ?? decay1DelayValues[0]!;
      const breakpointLevelValue = breakpointLevelValues[i] ?? breakpointLevelValues[0]!;
      const decay2DelayValue = decay2DelayValues[i] ?? decay2DelayValues[0]!;
      const sustainLevelValue = sustainLevelValues[i] ?? sustainLevelValues[0]!;
      const releaseDelayValue = releaseDelayValues[i] ?? releaseDelayValues[0]!;

      const isNoteOn = noteValue >= 0.5;
      if (isNoteOn && !GainEnvelopeProcessor.NOTE_ON_STATES.has(this._currentState)) {
        this._currentState = GainEnvelopeProcessor.STATE_ATTACK;
        this._currentStateInitialGain = this._gain;
        this._currentStateSampleCounter = 0;
        this._currentStateMaxSampleCount = Math.trunc(attackDelayValue * sampleRate / 1000);
      } else if (!isNoteOn && GainEnvelopeProcessor.NOTE_ON_STATES.has(this._currentState)) {
        this._currentState = GainEnvelopeProcessor.STATE_RELEASE;
        this._currentStateInitialGain = this._gain;
        this._currentStateSampleCounter = 0;
        this._currentStateMaxSampleCount = Math.trunc(releaseDelayValue * sampleRate / 1000);
      }

      const setGainOff = () => {
        this._gain = 0;
      };

      const setGainAttack = () => {
        if (this._currentStateMaxSampleCount === 0) {
          this._currentState = GainEnvelopeProcessor.STATE_DECAY1;
          this._currentStateInitialGain = 1;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = Math.trunc(decay1DelayValue * sampleRate / 1000);
          setGainDecay1();
          return;
        }

        this._currentStateSampleCounter++;
        this._gain = this._currentStateInitialGain + (1 - this._currentStateInitialGain) * this._currentStateSampleCounter / this._currentStateMaxSampleCount!;
        if (this._currentStateSampleCounter >= this._currentStateMaxSampleCount!) {
          this._currentState = GainEnvelopeProcessor.STATE_DECAY1;
          this._currentStateInitialGain = 1;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = Math.trunc(decay1DelayValue * sampleRate / 1000);
        }
      };

      const setGainDecay1 = () => {
        if (this._currentStateMaxSampleCount === 0) {
          this._currentState = GainEnvelopeProcessor.STATE_DECAY2;
          this._currentStateInitialGain = breakpointLevelValue;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = Math.trunc(decay2DelayValue * sampleRate / 1000);
          setGainDecay2();
          return;
        }

        this._currentStateSampleCounter++;
        this._gain = this._currentStateInitialGain + (breakpointLevelValue - this._currentStateInitialGain) * this._currentStateSampleCounter / this._currentStateMaxSampleCount!;
        if (this._currentStateSampleCounter >= this._currentStateMaxSampleCount!) {
          this._currentState = GainEnvelopeProcessor.STATE_DECAY2;
          this._currentStateInitialGain = breakpointLevelValue;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = Math.trunc(decay2DelayValue * sampleRate / 1000);
        }
      };

      const setGainDecay2 = () => {
        if (this._currentStateMaxSampleCount === 0) {
          this._currentState = GainEnvelopeProcessor.STATE_SUSTAIN;
          this._currentStateInitialGain = sustainLevelValue;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = null;
          setGainSustain();
          return;
        }

        this._currentStateSampleCounter++;
        this._gain = this._currentStateInitialGain + (sustainLevelValue - this._currentStateInitialGain) * this._currentStateSampleCounter / this._currentStateMaxSampleCount!;
        if (this._currentStateSampleCounter >= this._currentStateMaxSampleCount!) {
          this._currentState = GainEnvelopeProcessor.STATE_SUSTAIN;
          this._currentStateInitialGain = sustainLevelValue;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = null;
        }
      };

      const setGainSustain = () => {
        this._gain = sustainLevelValue;
      };

      const setGainRelease = () => {
        if (this._currentStateMaxSampleCount === 0) {
          this._currentState = GainEnvelopeProcessor.STATE_OFF;
          this._currentStateInitialGain = 0;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = null;
          setGainOff();
          return;
        }

        this._currentStateSampleCounter++;
        this._gain = this._currentStateInitialGain * (1 - this._currentStateSampleCounter / this._currentStateMaxSampleCount!);
        if (this._currentStateSampleCounter >= this._currentStateMaxSampleCount!) {
          this._currentState = GainEnvelopeProcessor.STATE_OFF;
          this._currentStateInitialGain = 0;
          this._currentStateSampleCounter = 0;
          this._currentStateMaxSampleCount = null;
        }
      };

      switch (this._currentState) {
        case GainEnvelopeProcessor.STATE_OFF: {
          setGainOff();
          break;
        }

        case GainEnvelopeProcessor.STATE_ATTACK: {
          setGainAttack();
          break;
        }

        case GainEnvelopeProcessor.STATE_DECAY1: {
          setGainDecay1();
          break;
        }

        case GainEnvelopeProcessor.STATE_DECAY2: {
          setGainDecay2();
          break;
        }

        case GainEnvelopeProcessor.STATE_SUSTAIN: {
          setGainSustain();
          break;
        }

        case GainEnvelopeProcessor.STATE_RELEASE: {
          setGainRelease();
          break;
        }
      }

      result[i] = gainValue * this._gain * monoInput[i]!;
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

registerProcessor('gain-envelope-processor', GainEnvelopeProcessor);
