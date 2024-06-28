// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: ts=2 sw=2 et ai
/**
  Copyright 2024 metastable-void

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  @file
*/

/**
 * Pitch scale of a temperament
 */
export type TemperamentScale = Readonly<Float64Array>;

/**
 * Base note of a temperament
 */
export interface BaseNote {
  /**
   * Integer note number of the base note
   */
  readonly noteNumber: number;

  /**
   * Frequency of the base note in Hz
   */
  readonly pitch: number;
}

export class Temperament {
  readonly scale: TemperamentScale;
  readonly basePitch: number;
  readonly baseNoteNumber: number;

  public constructor(scale: TemperamentScale | number[], baseNote: BaseNote = { noteNumber: 69, pitch: 440 }) {
    const scaleTypedArray = new Float64Array(scale);
    scaleTypedArray.forEach((value) => {
      if (isNaN(value) || value <= 0 || !isFinite(value)) {
        throw new Error('Temperament scale must have positive values.');
      }
    });
    scaleTypedArray.sort((a, b) => a - b);
    if (scaleTypedArray.length < 2) {
      throw new Error('Temperament scale must have at least two values.');
    }
    const firstScaleValue = scaleTypedArray[0]!;
    const lastScaleValue = scaleTypedArray[scaleTypedArray.length - 1]!;
    const scaleRatio = lastScaleValue / firstScaleValue;
    if (scaleRatio < 1.001) {
      throw new Error('Temperament scale values must be distinct.');
    }
    this.scale = scaleTypedArray.map((value) => value / firstScaleValue);

    const basePitch = baseNote.pitch;
    const baseNoteNumber = baseNote.noteNumber;
    if (isNaN(basePitch) || basePitch <= 0 || !isFinite(basePitch)) {
      throw new Error('Base pitch must be a positive number.');
    }
    this.basePitch = Number(basePitch);
    this.baseNoteNumber = baseNoteNumber | 0;
    if (this.baseNoteNumber !== baseNoteNumber) {
      throw new Error('Base note number must be an integer.');
    }
  }

  public static getFrequency(temperament: Temperament, noteNumber: number): number {
    if (noteNumber !== (noteNumber | 0)) {
      throw new Error('Note number must be an integer.');
    }

    const baseNoteNumber = temperament.baseNoteNumber;
    const basePitch = temperament.basePitch;
    const scale = temperament.scale;
    const scaleCount = scale.length - 1;
    const noteNumberDifference = noteNumber - baseNoteNumber;
    const noteNumberRemainder = ((noteNumberDifference % scaleCount) + scaleCount) % scaleCount;
    const noteNumberOctaves = (noteNumberDifference - noteNumberRemainder) / scaleCount;
    const scaleRatio = scale[scaleCount]!;

    return basePitch * Math.pow(scaleRatio, noteNumberOctaves) * scale[noteNumberRemainder]!;
  }

  public getFrequency(noteNumber: number): number {
    return Temperament.getFrequency(this, noteNumber);
  }
}

export namespace Temperament {
  export function nToneEqualTemperament(n: number, intervalRatio: number = 2, baseNote: BaseNote = { noteNumber: 69, pitch: 440 }): Temperament {
    if (n < 2) {
      throw new Error('Equal temperament must have at least two notes.');
    }
    if (n !== (n | 0)) {
      throw new Error('Equal temperament must have an integer number of notes.');
    }

    if (isNaN(intervalRatio) || intervalRatio <= 0 || !isFinite(intervalRatio)) {
      throw new Error('Equal temperament must have a positive interval ratio.');
    }
    if (intervalRatio <= 1.001) {
      throw new Error('Equal temperament must have distinct interval ratios.');
    }

    intervalRatio = Number(intervalRatio);

    const scale = new Float64Array(n);
    for (let i = 0; i <= n; i++) {
      scale[i] = Math.pow(intervalRatio, i / n);
    }
    return new Temperament(scale, baseNote);
  }

  export function custom12ToneEqualTemperament(a4: number = 440): Temperament {
    return nToneEqualTemperament(12, 2, { noteNumber: 69, pitch: a4 });
  }

  function getCustomNoteFrequency(noteNumber: number, a4: number = 440): number {
    return a4 * Math.pow(2, (noteNumber - Temperament.STANDARD_A4_NOTE) / 12);
  }

  export function getCustomBaseNote(baseNoteNumber: number, a4: number = 440): BaseNote {
    return { noteNumber: baseNoteNumber, pitch: getCustomNoteFrequency(baseNoteNumber, a4) };
  }

  /**
   * A type of just intonation. Included as a reference.
   */
  export function pythagorean(baseNote: BaseNote): Temperament {
    return new Temperament([1, 256 / 243, 9 / 8, 32 / 27, 81 / 64, 4 / 3, 729 / 512, 3 / 2, 128 / 81, 27 / 16, 16 / 9, 243 / 128, 2], baseNote);
  }

  export const STANDARD_12_TONE_EQUAL_TEMPERAMENT = custom12ToneEqualTemperament(440);

  export const STANDARD_A4_FREQUENCY = 440;

  export const STANDARD_C4_NOTE = 60;
  export const STANDARD_C4_SHARP_NOTE = 61;
  export const STANDARD_D4_NOTE = 62;
  export const STANDARD_D4_SHARP_NOTE = 63;
  export const STANDARD_E4_NOTE = 64;
  export const STANDARD_F4_NOTE = 65;
  export const STANDARD_F4_SHARP_NOTE = 66;
  export const STANDARD_G4_NOTE = 67;
  export const STANDARD_G4_SHARP_NOTE = 68;
  export const STANDARD_A4_NOTE = 69;
  export const STANDARD_A4_SHARP_NOTE = 70;
  export const STANDARD_B4_NOTE = 71;
}
