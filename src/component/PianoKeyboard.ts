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

import './UnitKeyboard.js';
import './UnitKeyboardAb.js';
import './UnitKeyboardC.js';

import { UnitKeyboardAbElement } from './UnitKeyboardAb.js';
import { UnitKeyboardElement } from './UnitKeyboard.js';
import { UnitKeyboardCElement } from './UnitKeyboardC.js';

export class PianoKeyboardElement extends HTMLElement {
  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot) {
      throw new Error('Failed to attach shadow root.');
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: row;
          position: relative;
          padding-block-end: 4em;
          background-color: #333;
          overflow: auto;
          overflow-block: hidden;
          overflow-inline: scroll;
          justify-content: center;
        }
      </style>
    `;

    this.shadowRoot.addEventListener('noteon', (event: Event) => {
      const ev = event as CustomEvent;
      const note = ev.detail.note;
      this.dispatchEvent(new CustomEvent('noteon', {
        detail: { note },
        bubbles: true,
      }));
    });

    this.shadowRoot.addEventListener('noteoff', (event: Event) => {
      const ev = event as CustomEvent;
      const note = ev.detail.note;
      this.dispatchEvent(new CustomEvent('noteoff', {
        detail: { note },
        bubbles: true,
      }));
    });

    const keyboard21 = document.createElement('unit-keyboard-ab') as UnitKeyboardAbElement;
    keyboard21.offset = 21;
    this.shadowRoot.appendChild(keyboard21);

    const keyboard24 = document.createElement('unit-keyboard') as UnitKeyboardElement;
    keyboard24.offset = 24;
    this.shadowRoot.appendChild(keyboard24);

    const keyboard36 = document.createElement('unit-keyboard') as UnitKeyboardElement;
    keyboard36.offset = 36;
    this.shadowRoot.appendChild(keyboard36);

    const keyboard48 = document.createElement('unit-keyboard') as UnitKeyboardElement;
    keyboard48.offset = 48;
    this.shadowRoot.appendChild(keyboard48);

    const keyboard60 = document.createElement('unit-keyboard') as UnitKeyboardElement;
    keyboard60.offset = 60;
    this.shadowRoot.appendChild(keyboard60);

    const keyboard72 = document.createElement('unit-keyboard') as UnitKeyboardElement;
    keyboard72.offset = 72;
    this.shadowRoot.appendChild(keyboard72);

    const keyboard84 = document.createElement('unit-keyboard') as UnitKeyboardElement;
    keyboard84.offset = 84;
    this.shadowRoot.appendChild(keyboard84);

    const keyboard96 = document.createElement('unit-keyboard') as UnitKeyboardElement;
    keyboard96.offset = 96;
    this.shadowRoot.appendChild(keyboard96);

    const keyboard108 = document.createElement('unit-keyboard-c') as UnitKeyboardCElement;
    keyboard108.offset = 108;
    this.shadowRoot.appendChild(keyboard108);
  }
}

customElements.define('piano-keyboard', PianoKeyboardElement);
