import * as d3 from 'd3';

import Complex from './Complex';

const maxIterations = 60;
const xMargin = 50;
const zoom = 3 / 5;

const iterate = ci => {
	let curr = ci;
	for (var i = 0; i < maxIterations; i++) {
		curr = Complex.Add(Complex.Square(curr), ci);
		if (curr.magnitude() > 16) {
			break;
		}
	}

	return i;
};

const hueScale = d3
	.scaleLinear()
	.range([0, 255])
	.domain([1, maxIterations]);

export default class Fractal {
	constructor(options) {
		this.options = options;
		this.canvas = options.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.dims = this.setupDims(this.options);
		this.setupAxes();
		this.setScales();
		this.draw();
		this.drawAxes();
		this.bindFns();
	}

	bindFns() {
		this.zoomIn = this.zoomIn.bind(this);
		this.zoomOut = this.zoomOut.bind(this);
		this.translate = this.translate.bind(this);
		this.endTranslate = this.endTranslate.bind(this);
	}

	setupDims(options) {
		const { range = 3.1, minX = -2.5, minY = -1 * range / 2 } = options;
		return {
			range,
			minX,
			minY,
			maxX: minX + range,
			maxY: minY + range
		};
	}

	computeDims(rangeMultiplier) {
		const centerX = this.dims.minX + this.dims.range / 2;
		const centerY = this.dims.minY + this.dims.range / 2;
		const range = this.dims.range * rangeMultiplier;
		this.dims = {
			range,
			minX: centerX - range / 2,
			minY: centerY - range / 2,
			maxX: centerX + range / 2,
			maxY: centerY + range / 2
		};
	}

	// Just make the elements to hold the axes
	setupAxes() {
		const { svg, pixels } = this.options;
		this.xAxisEl = d3
			.select(svg)
			.append('g')
			.attr('transform', 'translate(' + [xMargin, pixels] + ')')
			.attr('class', 'x-axis');

		this.yAxisEl = d3
			.select(svg)
			.append('g')
			.attr('transform', 'translate(' + [pixels + xMargin, 0] + ')')
			.attr('class', 'y-axis');
	}

	createScale(dims) {
		const { minX, maxX, minY, maxY } = dims;
		const { pixels } = this.options;
		const xAxisScale = d3
			.scaleLinear()
			.domain([minX, maxX])
			.range([0, pixels]);

		const yAxisScale = d3
			.scaleLinear()
			.domain([minY, maxY])
			.range([pixels, 0]);

		return { xAxisScale, yAxisScale };
	}

	setScales() {
		const { xAxisScale, yAxisScale } = this.createScale(this.dims);
		this.xAxisScale = xAxisScale;
		this.yAxisScale = yAxisScale;
	}

	draw() {
		const { ctx, xAxisScale, yAxisScale } = this;
		const { pixels } = this.options;
		for (var i = 0; i < pixels; i++) {
			for (var j = 0; j < pixels; j++) {
				const x = xAxisScale.invert(i);
				const y = yAxisScale.invert(j);

				const iters = iterate(new Complex([x, y]));
				if (iters === maxIterations) {
					ctx.fillStyle = 'black';
				} else {
					ctx.fillStyle = `hsl( ${hueScale(iters)}, 40%, 40%)`;
				}
				ctx.fillRect(i, j, 1, 1);
			}
		}
		this.saveImage();
	}

	saveImage() {
		if (!this.imageEl) {
			this.imageEl = new Image();
		}
		this.imageEl.src = this.canvas.toDataURL();
	}
	drawAxes(xAxisScale = this.xAxisScale, yAxisScale = this.yAxisScale) {
		const xAxis = d3.axisBottom().scale(xAxisScale);
		const yAxis = d3.axisRight().scale(yAxisScale);
		this.xAxisEl.call(xAxis);
		this.yAxisEl.call(yAxis);
	}

	zoomIn() {
		const { pixels } = this.options;
		const offset = 0.5 * (pixels - pixels * (1 / zoom));
		this.ctx.drawImage(
			this.imageEl,
			offset,
			offset,
			pixels * 1 / zoom,
			pixels * 1 / zoom
		);
		// Allow a paint to happen
		setTimeout(() => this.changeZoom(zoom), 0);
	}

	zoomOut() {
		const { pixels } = this.options;
		this.fillCheckers();
		const offset = (zoom - 1) * pixels / -2;
		this.ctx.drawImage(
			this.imageEl,
			offset,
			offset,
			pixels * zoom,
			pixels * zoom
		);

		// Allow a paint to happen
		setTimeout(() => this.changeZoom(1 / zoom), 0);
	}

	changeZoom(multiplier) {
		this.computeDims(multiplier);
		this.setScales();
		this.drawAxes();
		this.draw();
	}

	translate(x, y) {
		const { range } = this.dims;
		// // Save, to use on endTranslate
		this.tempDims = this.setupDims({
			range,
			minX: this.xAxisScale.invert(-1 * x),
			minY: this.yAxisScale.invert(this.options.pixels - y)
		});
		const { xAxisScale, yAxisScale } = this.createScale(this.tempDims);
		this.drawAxes(xAxisScale, yAxisScale);

		// Move image
		this.fillCheckers();
		this.ctx.drawImage(this.imageEl, x, y);
	}

	fillCheckers() {
		const squares = 30;
		const width = this.options.pixels / squares;
		for (var i = 0; i < squares; i++) {
			for (var j = 0; j < squares; j++) {
				this.ctx.fillStyle = (i + j) % 2 ? '#E0E0DE' : '#B3B3B3';
				this.ctx.fillRect(i * width, j * width, width, width);
			}
		}
	}

	endTranslate() {
		this.dims = this.tempDims;
		this.setScales();
		this.drawAxes();
		this.draw();
	}
}
