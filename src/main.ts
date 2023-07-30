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


import { SynthesizerBuilder } from "./SynthesizerBuilder.js";
import { Synthesizer } from "./Synthesizer.js";

let synthesizer: Synthesizer | undefined;

const modulationLevelInput = document.querySelector('#mod-level') as HTMLInputElement;
const carrierLevelInput = document.querySelector('#car-level') as HTMLInputElement;

const noteNumberInput = document.querySelector('#note-number') as HTMLInputElement;
const inputModFreqSlope = document.querySelector('#mod-freq-slope') as HTMLInputElement;
const inputModFreqIntercept = document.querySelector('#mod-freq-intercept') as HTMLInputElement;
const inputCarFreqSlope = document.querySelector('#car-freq-slope') as HTMLInputElement;
const inputCarFreqIntercept = document.querySelector('#car-freq-intercept') as HTMLInputElement;

const inputModAttackDelay = document.querySelector('#mod-a-delay') as HTMLInputElement;
const inputModDecay1Delay = document.querySelector('#mod-d1-delay') as HTMLInputElement;
const inputModBreakpointLevel = document.querySelector('#mod-b-level') as HTMLInputElement;
const inputModDecay2Delay = document.querySelector('#mod-d2-delay') as HTMLInputElement;
const inputModSustainLevel = document.querySelector('#mod-s-level') as HTMLInputElement;
const inputModReleaseDelay = document.querySelector('#mod-r-delay') as HTMLInputElement;

const inputCarAttackDelay = document.querySelector('#car-a-delay') as HTMLInputElement;
const inputCarDecay1Delay = document.querySelector('#car-d1-delay') as HTMLInputElement;
const inputCarBreakpointLevel = document.querySelector('#car-b-level') as HTMLInputElement;
const inputCarDecay2Delay = document.querySelector('#car-d2-delay') as HTMLInputElement;
const inputCarSustainLevel = document.querySelector('#car-s-level') as HTMLInputElement;
const inputCarReleaseDelay = document.querySelector('#car-r-delay') as HTMLInputElement;

const getBaseFrequency = (): number => {
  const baseFrequency = 440 * Math.pow(2, (noteNumberInput.valueAsNumber - 69) / 12);
  return baseFrequency;
};

const getModulatorFrequency = (): number => {
  const baseFrequency = getBaseFrequency();
  const slope = inputModFreqSlope.valueAsNumber;
  const intercept = inputModFreqIntercept.valueAsNumber;
  const modulatorFrequency = baseFrequency * slope + intercept;
  return modulatorFrequency;
};

const getCarrierFrequency = (): number => {
  const baseFrequency = getBaseFrequency();
  const slope = inputCarFreqSlope.valueAsNumber;
  const intercept = inputCarFreqIntercept.valueAsNumber;
  const carrierFrequency = baseFrequency * slope + intercept;
  return carrierFrequency;
};

const powerForm = document.querySelector('#form-power') as HTMLFormElement;
const powerRadio = powerForm.elements.namedItem('power') as RadioNodeList;

const playButton = document.getElementById('play') as HTMLButtonElement;

const turnOn = () => {
  if (!synthesizer) {
    const builder = new SynthesizerBuilder();
    builder.build().then((synth) => {
      synthesizer = synth;

      const modulator = synthesizer.createSineOscillatorNode();
      modulator.frequency.value = getModulatorFrequency();

      modulator.gain.value = modulationLevelInput.valueAsNumber;
      modulationLevelInput.addEventListener('change', () => {
        modulator.gain.value = modulationLevelInput.valueAsNumber;
      });

      const modulatorEnvelope = synthesizer.createGainEnvelopeNode();
      modulatorEnvelope.attackDelay.value = inputModAttackDelay.valueAsNumber;

      inputModAttackDelay.addEventListener('change', () => {
        modulatorEnvelope.attackDelay.value = inputModAttackDelay.valueAsNumber;
      });

      modulatorEnvelope.decay1Delay.value = inputModDecay1Delay.valueAsNumber;

      inputModDecay1Delay.addEventListener('change', () => {
        modulatorEnvelope.decay1Delay.value = inputModDecay1Delay.valueAsNumber;
      });

      modulatorEnvelope.breakpointLevel.value = inputModBreakpointLevel.valueAsNumber;

      inputModBreakpointLevel.addEventListener('change', () => {
        modulatorEnvelope.breakpointLevel.value = inputModBreakpointLevel.valueAsNumber;
      });

      modulatorEnvelope.decay2Delay.value = inputModDecay2Delay.valueAsNumber;

      inputModDecay2Delay.addEventListener('change', () => {
        modulatorEnvelope.decay2Delay.value = inputModDecay2Delay.valueAsNumber;
      });

      modulatorEnvelope.sustainLevel.value = inputModSustainLevel.valueAsNumber;

      inputModSustainLevel.addEventListener('change', () => {
        modulatorEnvelope.sustainLevel.value = inputModSustainLevel.valueAsNumber;
      });

      modulatorEnvelope.releaseDelay.value = inputModReleaseDelay.valueAsNumber;

      inputModReleaseDelay.addEventListener('change', () => {
        modulatorEnvelope.releaseDelay.value = inputModReleaseDelay.valueAsNumber;
      });

      const fmNode = synthesizer.createSineOscillatorNode();
      fmNode.frequency.value = getCarrierFrequency();

      fmNode.gain.value = carrierLevelInput.valueAsNumber;
      carrierLevelInput.addEventListener('change', () => {
        fmNode.gain.value = carrierLevelInput.valueAsNumber;
      });

      const carrierEnvelope = synthesizer.createGainEnvelopeNode();

      carrierEnvelope.attackDelay.value = inputCarAttackDelay.valueAsNumber;

      inputCarAttackDelay.addEventListener('change', () => {
        carrierEnvelope.attackDelay.value = inputCarAttackDelay.valueAsNumber;
      });

      carrierEnvelope.decay1Delay.value = inputCarDecay1Delay.valueAsNumber;

      inputCarDecay1Delay.addEventListener('change', () => {
        carrierEnvelope.decay1Delay.value = inputCarDecay1Delay.valueAsNumber;
      });

      carrierEnvelope.breakpointLevel.value = inputCarBreakpointLevel.valueAsNumber;

      inputCarBreakpointLevel.addEventListener('change', () => {
        carrierEnvelope.breakpointLevel.value = inputCarBreakpointLevel.valueAsNumber;
      });

      carrierEnvelope.decay2Delay.value = inputCarDecay2Delay.valueAsNumber;

      inputCarDecay2Delay.addEventListener('change', () => {
        carrierEnvelope.decay2Delay.value = inputCarDecay2Delay.valueAsNumber;
      });

      carrierEnvelope.sustainLevel.value = inputCarSustainLevel.valueAsNumber;

      inputCarSustainLevel.addEventListener('change', () => {
        carrierEnvelope.sustainLevel.value = inputCarSustainLevel.valueAsNumber;
      });

      carrierEnvelope.releaseDelay.value = inputCarReleaseDelay.valueAsNumber;

      inputCarReleaseDelay.addEventListener('change', () => {
        carrierEnvelope.releaseDelay.value = inputCarReleaseDelay.valueAsNumber;
      });

      modulator.connect(modulatorEnvelope);
      modulatorEnvelope.connect(fmNode.phaseOffset);
      fmNode.connect(carrierEnvelope);
      carrierEnvelope.connect(synthesizer.destination);

      playButton.addEventListener('touchstart', (ev) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      });

      playButton.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        modulatorEnvelope.note.value = 1;
        carrierEnvelope.note.value = 1;
      });

      playButton.addEventListener('pointerup', (ev) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        modulatorEnvelope.note.value = 0;
        carrierEnvelope.note.value = 0;
      });

      noteNumberInput.addEventListener('change', () => {
        fmNode.frequency.value = getCarrierFrequency();
        modulator.frequency.value = getModulatorFrequency();
      });

      inputModFreqSlope.addEventListener('change', () => {
        modulator.frequency.value = getModulatorFrequency();
      });

      inputModFreqIntercept.addEventListener('change', () => {
        modulator.frequency.value = getModulatorFrequency();
      });

      inputCarFreqSlope.addEventListener('change', () => {
        fmNode.frequency.value = getCarrierFrequency();
      });

      inputCarFreqIntercept.addEventListener('change', () => {
        fmNode.frequency.value = getCarrierFrequency();
      });
    });
  } else if (synthesizer.context.state === 'suspended') {
    synthesizer.context.resume();
  }
};

const turnOff = () => {
  if (synthesizer && synthesizer.context.state === 'running') {
    synthesizer.context.suspend();
  }
};

powerRadio.forEach((node) => {
  const radio = node as HTMLInputElement;
  radio.addEventListener('change', () => {
    if (radio.value === '1' && radio.checked) {
      turnOn();
    } else if (radio.value === '0' && radio.checked) {
      turnOff();
    }
  });
});
