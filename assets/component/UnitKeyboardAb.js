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
export class UnitKeyboardAbElement extends HTMLElement {
    constructor() {
        super();
        this.offset = 0;
        this.activeNotesByPointerId = new Map();
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
        }

        button {
          font-size: inherit;
          text-indent: -9999px;
          overflow: hidden;
          border: none;
          appearance: none;
          box-sizing: border-box;
          padding: 0;
          outline: none !important;
          -webkit-user-select: none;
          user-select: none;
          touch-action: none;
        }

        .black {
          background-color: #000;
          position: absolute;
          inset-block-start: 0;
          block-size: 4rem;
          inline-size: 2.25em;
        }

        .black.active {
          background-color: #555;
        }

        .white {
          background-color: #fff;
          block-size: 8rem;
          inline-size: 4em;
          box-shadow: inset 0 0 0 1px #888;
        }

        .white.active {
          background-color: #ccc;
        }

        #a-sharp {
          inset-inline-start: 3.5em;
        }
      </style>
      <button id="a" class="white">A</button>
      <button id="a-sharp" class="black">A#</button>
      <button id="b" class="white">B</button>
    `;
        const buttons = Array.from(this.shadowRoot.querySelectorAll('button'));
        buttons.forEach(n => n.addEventListener('gotpointercapture', e => e.target.releasePointerCapture(e.pointerId)));
        this.shadowRoot.addEventListener('touchstart', (event) => {
            event.preventDefault();
        });
        this.shadowRoot.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            const ev = event;
            const button = event.target;
            const index = buttons.indexOf(button);
            if (index === -1) {
                return;
            }
            const note = index + this.offset;
            const pointerId = ev.pointerId;
            this.activeNotesByPointerId.set(pointerId, note);
            this.dispatchEvent(new CustomEvent('noteon', {
                detail: {
                    note,
                },
                bubbles: true,
            }));
            button.classList.add('active');
        });
        this.shadowRoot.addEventListener('pointerup', (event) => {
            event.preventDefault();
            const ev = event;
            const button = event.target;
            const index = buttons.indexOf(button);
            if (index === -1) {
                return;
            }
            const note = index + this.offset;
            const pointerId = ev.pointerId;
            this.activeNotesByPointerId.delete(pointerId);
            this.dispatchEvent(new CustomEvent('noteoff', {
                detail: {
                    note,
                },
                bubbles: true,
            }));
            button.classList.remove('active');
        });
        this.shadowRoot.addEventListener('pointerout', (event) => {
            event.preventDefault();
            const ev = event;
            const button = event.target;
            const index = buttons.indexOf(button);
            if (index === -1) {
                return;
            }
            const note = index + this.offset;
            const pointerId = ev.pointerId;
            this.activeNotesByPointerId.delete(pointerId);
            this.dispatchEvent(new CustomEvent('noteoff', {
                detail: {
                    note,
                },
                bubbles: true,
            }));
            button.classList.remove('active');
        });
        this.shadowRoot.addEventListener('pointerover', (event) => {
            event.preventDefault();
            const ev = event;
            const button = event.target;
            const index = buttons.indexOf(button);
            if (index === -1) {
                return;
            }
            if (ev.buttons === 0) {
                return;
            }
            const note = index + this.offset;
            const pointerId = ev.pointerId;
            this.activeNotesByPointerId.set(pointerId, note);
            this.dispatchEvent(new CustomEvent('noteon', {
                detail: {
                    note,
                },
                bubbles: true,
            }));
            button.classList.add('active');
        });
    }
}
customElements.define('unit-keyboard-ab', UnitKeyboardAbElement);
//# sourceMappingURL=UnitKeyboardAb.js.map