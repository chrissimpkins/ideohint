"use strict";

function collidePotential(y, env) {
	var A = env.A, C = env.C, S = env.S, P = env.P, avaliables = env.avaliables, sym = env.symmetry;
	var p = 0, n = y.length;
	for (var j = 0; j < n; j++) {
		for (var k = 0; k < j; k++) {
			if (y[j] === y[k]) {
				// Alignment
				p += A[j][k];
			}
			else if (y[j] <= y[k] + env.avaliables[j].properWidth) {
				// collide
				p += C[j][k];
			}
			if (j !== k && sym[j][k]) {
				if (y[j] !== y[k]) {
					// symmetry break
					p += S[j][k];
				}
			} else {
				if (y[j] < y[k]) {
					// swap
					p += S[j][k];
				}
			}
		}
	}
	return p;
}
function ablationPotential(y, env) {
	var avaliables = env.avaliables, triplets = env.triplets;
	var blueFuzz = env.strategy.BLUEZONE_WIDTH;
	var p = 0;
	var n = y.length;
	var ymin = env.ppem, ymax = -env.ppem;
	for (var j = 0; j < n; j++) {
		if (y[j] > ymax) ymax = y[j];
		if (y[j] < ymin) ymin = y[j];
	}
	var ymaxt = Math.max(ymax, env.glyphTop);
	var ymint = Math.min(ymin, env.glyphBottom);
	for (var j = 0; j < y.length; j++) {
		p += avaliables[j].ablationCoeff * env.uppx
			* Math.abs(y[j] - avaliables[j].center);
		p += env.strategy.COEFF_PORPORTION_DISTORTION * env.uppx
			* Math.abs(y[j] - (ymin + avaliables[j].proportion * (ymax - ymin)));
		if (y[j] > avaliables[j].softHigh) {
			p += env.strategy.COEFF_PORPORTION_DISTORTION * env.uppx * Math.min(1, y[j] - avaliables[j].softHigh)
		}
	}
	for (var t = 0; t < triplets.length; t++) {
		var j = triplets[t][0], k = triplets[t][1], w = triplets[t][2], d = triplets[t][3];
		if (!(y[j] > y[k] && y[k] > y[w])) continue;
		var spacejk = y[j] - y[k] - avaliables[j].properWidth;
		var spacekw = y[k] - y[w] - avaliables[k].properWidth;
		if (d >= env.uppx && spacejk < spacekw
			|| d <= -env.uppx && spacejk > spacekw
			|| d < env.uppx && d > -env.uppx && (spacejk - spacekw > 1 || spacejk - spacekw < -1)) {
			p += (env.C[j][k] + env.C[k][w]) * env.strategy.COEFF_DISTORT;
		}
	}
	return p;
}

function Individual(y, env) {
	this.gene = y;
	this.collidePotential = collidePotential(y, env);
	this.ablationPotential = env.noAblation ? 0 : ablationPotential(y, env);
	this.fitness = 1 / (1 + Math.max(0, this.collidePotential * 8 + this.ablationPotential / 16));
}

module.exports = Individual;
