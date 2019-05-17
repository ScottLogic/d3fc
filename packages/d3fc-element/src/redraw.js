/* eslint-env browser */

import * as data from './data';

const find = (element) => element.tagName === 'D3FC-GROUP'
  ? [element, ...element.querySelectorAll('d3fc-canvas, d3fc-group, d3fc-svg')]
  : [element];

const size = (element) => {
    const pixelRatio = (element.useDevicePixelRatio && global.devicePixelRatio != null) ? global.devicePixelRatio : 1;
    return {
        pixelRatio,
        width: element.clientWidth * pixelRatio,
        height: element.clientHeight * pixelRatio
    };
};

const measure = (element) => {
    const { width: previousWidth, height: previousHeight } = data.get(element);
    const { pixelRatio, width, height } = size(element);
    const resized = width !== previousWidth || height !== previousHeight;
    data.set(element, { pixelRatio, width, height, resized });
};

if (typeof CustomEvent !== 'function') {
    throw new Error('d3fc-element depends on CustomEvent. Make sure that you load a polyfill in older browsers. See README.');
}

const initialise = (element) => {
    const eData = data.get(element);
    const { width, height } = size(element);
    const { width: previousWidth, height: previousHeight } = eData.initial || {};

    if (width !== previousWidth || height !== previousHeight) {
        data.set(element, Object.assign({ initial: { width, height } }, eData));

        const event = new CustomEvent('initialise', { detail: { width, height } });
        element.dispatchEvent(event);
    }
};

const resize = (element) => {
    const detail = data.get(element);
    const event = new CustomEvent('measure', { detail });
    element.dispatchEvent(event);
};

const draw = (element) => {
    const detail = data.get(element);
    const event = new CustomEvent('draw', { detail });
    element.dispatchEvent(event);
};

export default (elements) => {
    const allElements = elements.map(find)
      .reduce((a, b) => a.concat(b));
    allElements.forEach(initialise);
    allElements.forEach(initialise);
    allElements.forEach(measure);
    allElements.forEach(resize);
    allElements.forEach(draw);
};
