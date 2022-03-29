let MAX_N = 100;
let MAX_GEN = 1000;

let input = {
	'a': Math.PI,
	'b': Math.sqrt(2),
	'c': Math.random() * 30,
	'd': Math.random() * 30,
	'e': Math.E
};

setInterval(() => {
	input.c = Math.random() * 30;
}, 30);

setInterval(() => {
	input.d = Math.random() * 30;
}, 40);


let inputKeys = Object.keys(input);
let inputKeysLength = inputKeys.length;

class GA {
	constructor() {
		this.gen = 0;
		for(var i = 0;i < MAX_N;i++) {
			this.X1[i] = this.create();
		}
	}
	run() {
		this.gen++;
		this.generation();
		if(this.gen % 100 == 0) console.log('generation', this.gen, this.X1[0].score, JSON.stringify(this.X1[0]).match(/:/g).length);
		//if(this.gen % 100 == 0) console.log(this.gen, JSON.stringify(this.X1[0]), JSON.stringify(this.X1[1]));
		if(this.gen >= MAX_GEN || this.X1[0].score === 0) {
			console.log('complete', this.gen, JSON.stringify(this.X1[0]));
			process.exit(1);
		} else {
			setTimeout(() => { this.run(); });
		}
	}
	generation() {
		let arr;
		for(var i = 0;i < MAX_N;i++) {
			this.X2[i] = this.X1[i];
			if(i < MAX_N*0.8) this.Xr[i] = this.mutate(this.X2[i]);
			else if(i < MAX_N*0.9) this.Xr[i] = this.create();
			else this.Xr[i] = this.combine(this.X2[0], this.X2[MAX_N-i]);
		}

		//this.Xr[MAX_N-1] = this.combine(this.X2[0], this.X2[1]);
		//this.Xr[MAX_N-2] = this.combine(this.X2[0], this.X2[2]);
		//this.Xr[MAX_N-3] = this.combine(this.X2[0], this.X2[3]);

		arr = this.X2.concat(this.Xr);
		arr.sort((a, b) => {
			return (a.score - b.score);
		});
		for(var i = 0;i < MAX_N;i++) {
			this.X1[i] = JSON.parse(JSON.stringify(arr[i]));
		}
	}
	combine(l, r) {
		let c;
		l = JSON.parse(JSON.stringify(l));
		r = JSON.parse(JSON.stringify(r));

		delete l.score;
		delete r.score;

		c = {
			op: '*',
			l: 0.5,
			r: {
				op: '+',
				l,
				r
			}
		}

		this.score(c);

		return c;
	}
	create() {
		let indi = {
			op: this.randomOp(),
			l: {
				op: this.randomOp(),
				l: this.randomAnd(),
				r: this.randomAnd()
			},
			r: {
				op: this.randomOp(),
				l: this.randomAnd(),
				r: this.randomAnd()
			}
		};

		this.score(indi);
		return indi;
	}
	mutate(indi) {
		indi = JSON.parse(JSON.stringify(indi));
		if(this.random() < 0.0125) {
			indi.op = this.randomOp();
		}
		let arr = [ indi ];
		for(var i = 0;i < arr.length;i++) ((indi) => {
			switch(typeof indi.l) {
				case 'object':
					if(this.random() < 0.01) {
						delete indi.l;
						indi.l = this.randomAnd();
					} else {
						arr.push(indi.l);
						if(this.random() < 0.0125) {
							indi.l.op = this.randomOp();
						}
					}
					break;
				default:
					if(this.random() < 0.025) {
						indi.l = this.randomAnd();
					}
					break;
			}
			switch(typeof indi.r) {
				case 'object':
					if(this.random() < 0.01) {
						delete indi.r;
						indi.r = this.randomAnd();
					} else {
						arr.push(indi.r);
						if(this.random() < 0.025) {
							indi.r.op = this.randomOp();
						}
					}
					break;
				default:
					if(this.random() < 0.025) {
						indi.r = this.randomAnd();
					}
					break;
			}
		})(arr[i]);

		this.score(indi);
		return indi;
	}
	random() {
		return Math.random();
	}
	randomOp() {
		return '-*+'.charAt(Math.floor(Math.random() * 3));
	}
	randomAnd() {
		let rand = this.random();
		if(rand < 0.2) {
			return {
				op: this.randomOp(),
				l: this.randomAnd(),
				r: this.randomAnd()
			}
		} else if(rand < 0.6) {
			return inputKeys[ Math.floor(this.random()*inputKeysLength) ];
		} else {
			return this.random()*100;
		}
	}
	eval(indi) {
		switch (typeof indi) {
			case 'number': return indi;
			case 'string': return input[indi];
		}
		switch (indi.op) {
			case '-':
				return this.eval(indi.l) - this.eval(indi.r);
			case '*':
				return this.eval(indi.l) * this.eval(indi.r);
			default:
				return this.eval(indi.l) + this.eval(indi.r);
		}
	}
	score(indi) {
		//3x^2 + 4x
		let target = ((input.d * input.d * input.d) * 6) + ((input.d * input.d) * 3) + (input.d * 4) + 1;
		let target2 = (input.d + 4) * (input.c + 3);
		let len = JSON.stringify(indi).match(/:/g).length;
		indi.score = Math.abs((target+target2) - this.eval(indi)) * ((len >= 30) ? 1 + (len-30)*0.01 : 1);
		//indi.score = Math.abs((Math.PI * Math.PI) - this.eval(indi)) * ((len >= 30) ? 1 + (len-30)*0.01 : 1);
	}
}

GA.prototype.gen = 0;
GA.prototype.X1 = [];
GA.prototype.X2 = [];
GA.prototype.Xr = [];


let ga = new GA();
ga.run();