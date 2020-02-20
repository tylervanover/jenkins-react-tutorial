import { sum } from '../src/sum';
// var maths = require('../src/sum');

it ('sums two numbers', () => {
    expect(sum(1, 2)).toEqual(3);
    expect(sum(2, 2)).toEqual(4);
});