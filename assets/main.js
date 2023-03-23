"use strict";
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
const _context = new AudioContext();
const addModulePromise = _context.audioWorklet.addModule('assets/worklet/WhiteProcessor.js');
const getContext = () => addModulePromise.then(() => _context);
const getWhiteNoiseNode = async () => {
    const context = await getContext();
    const node = new AudioWorkletNode(context, 'white-noise-processor');
    return node;
};
const gainNode = new GainNode(_context, { gain: 0 });
gainNode.connect(_context.destination);
getWhiteNoiseNode().then(async (node) => {
    node.connect(gainNode);
});
const toggleWhiteNoise = async () => {
    const context = await getContext();
    if (context.state === 'suspended') {
        context.resume();
    }
    gainNode.gain.value = gainNode.gain.value < 0.5 ? 1 : 0;
};
const playButton = document.getElementById('play');
playButton.addEventListener('click', toggleWhiteNoise);
//# sourceMappingURL=main.js.map