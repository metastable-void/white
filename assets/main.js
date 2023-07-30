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
let synthesizer;
const modulationLevelInput = document.querySelector('#level');
const noteNumberInput = document.querySelector('#note-number');
const inputModFreqSlope = document.querySelector('#mod-freq-slope');
const inputModFreqIntercept = document.querySelector('#mod-freq-intercept');
const inputCarFreqSlope = document.querySelector('#car-freq-slope');
const inputCarFreqIntercept = document.querySelector('#car-freq-intercept');
const getBaseFrequency = () => {
    const baseFrequency = 440 * Math.pow(2, (noteNumberInput.valueAsNumber - 69) / 12);
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
const playButton = document.getElementById('play');
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
            const modulatorEnvelope = synthesizer.createEnvelopeNode();
            const fmNode = synthesizer.createSineOscillatorNode();
            fmNode.frequency.value = getCarrierFrequency();
            const carrierEnvelope = synthesizer.createEnvelopeNode();
            modulator.connect(modulatorEnvelope);
            modulatorEnvelope.connect(fmNode.phaseOffset);
            fmNode.connect(carrierEnvelope);
            carrierEnvelope.connect(synthesizer.destination);
            playButton.addEventListener('mousedown', () => {
                modulatorEnvelope.note.value = 1;
                carrierEnvelope.note.value = 1;
                console.log('mousedown');
            });
            playButton.addEventListener('mouseup', () => {
                modulatorEnvelope.note.value = 0;
                carrierEnvelope.note.value = 0;
                console.log('mouseup');
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
//# sourceMappingURL=main.js.map