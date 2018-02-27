import Fractal from './Fractal';

import './App.css';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const svg = document.getElementById('svg');

const canvasWidth = 400;
const wrapperWidth = 500;
const xMargin = (wrapperWidth - canvasWidth) / 2;
ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasWidth;

const options = {
	canvas,
	svg,
	pixels: canvasWidth
};
const fractal = new Fractal(options);

const zoomIn = document.getElementById('zoom-in');
const zoomOut = document.getElementById('zoom-out');

zoomIn.addEventListener('click', fractal.zoomIn);
zoomOut.addEventListener('click', fractal.zoomOut);

let dragging, draggingInitial;
const inBounds = e => {
	const { offsetX, offsetY } = e;
	return offsetX > xMargin && offsetX < canvasWidth + xMargin && offsetY < 400;
};
svg.addEventListener('mousedown', e => {
	if (inBounds(e)) {
		dragging = true;
		draggingInitial = [e.offsetX, e.offsetY];
	}
});

svg.addEventListener('mousemove', e => {
	if (dragging && inBounds(e)) {
		const x = e.offsetX - draggingInitial[0];
		const y = e.offsetY - draggingInitial[1];
		fractal.translate(x, y);
	}
});

document.addEventListener('mouseup', () => {
	if (dragging) {
		fractal.endTranslate();
	}
	dragging = false;
});
