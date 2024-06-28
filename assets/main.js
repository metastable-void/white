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
import './component/PianoKeyboard.js';
import { SynthesizerBuilder } from "./SynthesizerBuilder.js";
import { Temperament } from './processor/Temperament.js';
let synthesizer;
const modulationLevelInput = document.querySelector('#mod-level');
const carrierLevelInput = document.querySelector('#car-level');
const inputModFreqSlope = document.querySelector('#mod-freq-slope');
const inputModFreqIntercept = document.querySelector('#mod-freq-intercept');
const inputCarFreqSlope = document.querySelector('#car-freq-slope');
const inputCarFreqIntercept = document.querySelector('#car-freq-intercept');
const inputModAttackDelay = document.querySelector('#mod-a-delay');
const inputModDecay1Delay = document.querySelector('#mod-d1-delay');
const inputModBreakpointLevel = document.querySelector('#mod-b-level');
const inputModDecay2Delay = document.querySelector('#mod-d2-delay');
const inputModSustainLevel = document.querySelector('#mod-s-level');
const inputModReleaseDelay = document.querySelector('#mod-r-delay');
const inputCarAttackDelay = document.querySelector('#car-a-delay');
const inputCarDecay1Delay = document.querySelector('#car-d1-delay');
const inputCarBreakpointLevel = document.querySelector('#car-b-level');
const inputCarDecay2Delay = document.querySelector('#car-d2-delay');
const inputCarSustainLevel = document.querySelector('#car-s-level');
const inputCarReleaseDelay = document.querySelector('#car-r-delay');
const inputKeyboardSize = document.querySelector('#keyboard-size');
const pianoKeyboard = document.querySelector('#piano-keyboard');
let noteNumber = 69;
const noteNumberChangeHandlers = [];
const changeNoteNumber = (n) => {
    noteNumber = Math.max(0, Math.min(127, 0 | n));
    noteNumberChangeHandlers.forEach((handler) => handler(noteNumber));
};
const playHandlers = [];
const play = () => {
    playHandlers.forEach((handler) => handler());
};
const stopPlayingHandlers = [];
const stopPlaying = () => {
    stopPlayingHandlers.forEach((handler) => handler());
};
pianoKeyboard.addEventListener('noteon', (ev) => {
    const noteNumber = ev.detail.note;
    console.log(noteNumber, getBaseFrequency());
    changeNoteNumber(noteNumber);
    play();
});
pianoKeyboard.addEventListener('noteoff', () => {
    stopPlaying();
});
const temperamentForm = document.querySelector('#form-temperament');
const temperamentRadio = temperamentForm.elements.namedItem('temperament');
const EQUAL_TEMPERAMENT = Temperament.STANDARD_12_TONE_EQUAL_TEMPERAMENT;
const JUST_INTONATION = Temperament.pythagorean(Temperament.getCustomBaseNote(60, 440));
const getNoteFrequency = (noteNumber) => {
    if (temperamentRadio.value === 'equal') {
        return EQUAL_TEMPERAMENT.getFrequency(noteNumber);
    }
    return JUST_INTONATION.getFrequency(noteNumber);
};
const getBaseFrequency = () => {
    const baseFrequency = getNoteFrequency(noteNumber);
    return baseFrequency;
};
const getModulatorFrequency = () => {
    const baseFrequency = getBaseFrequency();
    const slope = inputModFreqSlope.valueAsNumber;
    const intercept = inputModFreqIntercept.valueAsNumber;
    const modulatorFrequency = baseFrequency * slope + intercept;
    return modulatorFrequency;
};
const getCarrierFrequency = () => {
    const baseFrequency = getBaseFrequency();
    const slope = inputCarFreqSlope.valueAsNumber;
    const intercept = inputCarFreqIntercept.valueAsNumber;
    const carrierFrequency = baseFrequency * slope + intercept;
    return carrierFrequency;
};
const powerForm = document.querySelector('#form-power');
const powerRadio = powerForm.elements.namedItem('power');
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
            playHandlers.push(() => {
                modulatorEnvelope.note.value = 1;
                carrierEnvelope.note.value = 1;
            });
            stopPlayingHandlers.push(() => {
                modulatorEnvelope.note.value = 0;
                carrierEnvelope.note.value = 0;
            });
            noteNumberChangeHandlers.push(() => {
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
    }
    else if (synthesizer.context.state === 'suspended') {
        synthesizer.context.resume();
    }
};
const turnOff = () => {
    if (synthesizer && synthesizer.context.state === 'running') {
        synthesizer.context.suspend();
    }
};
powerRadio.forEach((node) => {
    const radio = node;
    radio.addEventListener('change', () => {
        if (radio.value === '1' && radio.checked) {
            turnOn();
        }
        else if (radio.value === '0' && radio.checked) {
            turnOff();
        }
    });
});
pianoKeyboard.style.fontSize = `${inputKeyboardSize.valueAsNumber}px`;
inputKeyboardSize.addEventListener('change', () => {
    pianoKeyboard.style.fontSize = `${inputKeyboardSize.valueAsNumber}px`;
});
//# sourceMappingURL=main.js.map