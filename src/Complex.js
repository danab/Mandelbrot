export default class Complex {
	constructor([a, b]) {
		this.a = a;
		this.b = b;
	}

	static Add(c1, c2) {
		const { a, b } = c1;
		const { a: c, b: d } = c2;
		return new Complex([a + c, b + d]);
	}

	static Mult(c1, c2) {
		const { a, b } = c1;
		const { a: c, b: d } = c2;
		return new Complex([a * c - b * d, a * d + b * c]);
	}

	static Square(c1) {
		return Complex.Mult(c1, c1);
	}

	magnitude() {
		return Math.sqrt(Math.pow(this.a, 2) + Math.pow(this.b, 2));
	}
}
