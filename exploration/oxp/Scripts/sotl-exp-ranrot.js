"use strict";

this.name = "SOTL Ranrot";


this.$ranrot = { high: 0, low: 0 };

this._rnd = function() {
	this.$ranrot.high = this._uint32.addMod32(
		this._uint32.shiftLeft(this.$ranrot.high,16),
		this._uint32.shiftRight(this.$ranrot.high,16)
	);
	this.$ranrot.high = this._uint32.addMod32(this.$ranrot.high,this.$ranrot.low);
	this.$ranrot.low = this._uint32.addMod32(this.$ranrot.high,this.$ranrot.low);
	return this._uint32.and(this.$ranrot.high,0x7FFFFFFF);
};

this._srand = function(seed) {
	this.$ranrot.high = seed;
	this.$ranrot.low = this._uint32.xor(seed,0xFFFFFFFF);
	/* Ranrot takes a little while to warm up with the way the seed is
	 * set.  Since this generator gets reseeded quite a lot, force this to
	 * avoid obvious patterning */
	for (var i=0;i<20;i++) {
		this._rnd();
	}
};

this._randf = function() {
	return this._rnd()/0x7FFFFFFF;
};



/* This code is a (slightly) modified version of Franz X Antesberger's
 * uint32 library - https://github.com/fxa/uint32.js/ - under the "do
 * what you want" license */

(function (exporter) {
    'use strict';

    var POW_2_32 = 0x0100000000;
    var POW_2_52 = 0x10000000000000;

    //
    //  Creating and Extracting
    //

    /**
     *  Creates an uint32 from the given bytes in big endian order.
     *  @param {Number} highByte the high byte
     *  @param {Number} secondHighByte the 2nd high byte
     *  @param {Number} thirdHighByte the 3rd high byte
     *  @param {Number} lowByte the low byte
     *  @returns highByte concat secondHighByte concat thirdHighByte concat lowByte
     */
    exporter.fromBytesBigEndian = function (highByte, secondHighByte, thirdHighByte, lowByte) {
        return ((highByte << 24) | (secondHighByte << 16) | (thirdHighByte << 8) | lowByte) >>> 0;
    };

    /**
     *  Returns the byte.
     *  e.g. when byteNo is 0, the high byte is returned, when byteNo = 3 the low byte is returned.
     *  @param {Number} uint32value the source to be extracted
     *  @param {Number} byteNo 0-3 the byte number, 0 is the high byte, 3 the low byte
     *  @returns {Number} the 0-255 byte according byteNo
     */
    exporter.getByteBigEndian = function (uint32value, byteNo) {
        return (uint32value >>> (8 * (3 - byteNo))) & 0xff;
    };

    /**
     *  Returns the bytes as array.
     *  @param {Number} uint32value the source to be extracted
     *  @returns {Array} the array [highByte, 2ndHighByte, 3rdHighByte, lowByte]
     */
    exporter.getBytesBigEndian = function (uint32value) {
        return [
            exporter.getByteBigEndian(uint32value, 0),
            exporter.getByteBigEndian(uint32value, 1),
            exporter.getByteBigEndian(uint32value, 2),
            exporter.getByteBigEndian(uint32value, 3)
        ];
    };

    /**
     *  Converts a given uin32 to a hex string including leading zeros.
     *  @param {Number} uint32value the uint32 to be stringified
     *  @param {Number} optionalMinLength the optional (default 8)
     */
    exporter.toHex = function (uint32value, optionalMinLength) {
        optionalMinLength = optionalMinLength || 8;
        var result = uint32value.toString(16);
        if (result.length < optionalMinLength) {
            result = new Array(optionalMinLength - result.length + 1).join('0') + result;
        }
        return result;
    };

    /**
     *  Converts a number to an uint32.
     *  @param {Number} number the number to be converted.
     *  @return {Number} an uint32 value
     */
    exporter.toUint32 = function (number) {
        // the shift operator forces js to perform the internal ToUint32 (see ecmascript spec 9.6)
        return number >>> 0;
    };

    /**
     *  Returns the part above the uint32 border.
     *  Depending to the javascript engine, that are the 54-32 = 22 high bits
     *  @param {Number} number the number to extract the high part
     *  @return {Number} the high part of the number
     */
    exporter.highPart = function (number) {
        return exporter.toUint32(number / POW_2_32);
    };

    //
    //  Bitwise Logical Operators
    //

    /**
     *  Returns a bitwise OR operation on two or more values.
     *  @param {Number} uint32val0 first uint32 value
     *  @param {Number} argv one or more uint32 values
     *  @return {Number} the bitwise OR uint32 value
     */
    exporter.or = function (uint32val0, argv) {
        var result = uint32val0;
        for (var index = 1; index < arguments.length; index += 1) {
            result = (result | arguments[index]);
        }
        return result >>> 0;
    };

    /**
     *  Returns a bitwise AND operation on two or more values.
     *  @param {Number} uint32val0 first uint32 value
     *  @param {Number} argv one or more uint32 values
     *  @return {Number} the bitwise AND uint32 value
     */
    exporter.and = function (uint32val0, argv) {
        var result = uint32val0;
        for (var index = 1; index < arguments.length; index += 1) {
            result = (result & arguments[index]);
        }
        return result >>> 0;
    };

    /**
     *  Returns a bitwise XOR operation on two or more values.
     *  @param {Number} uint32val0 first uint32 value
     *  @param {Number} argv one or more uint32 values
     *  @return {Number} the bitwise XOR uint32 value
     */
    exporter.xor = function (uint32val0, argv) {
        var result = uint32val0;
        for (var index = 1; index < arguments.length; index += 1) {
            result = (result ^ arguments[index]);
        }
        return result >>> 0;
    };

    exporter.not = function (uint32val) {
        return (~uint32val) >>> 0;
    };

    //
    // Shifting and Rotating
    //

    /**
     *  Returns the uint32 representation of a << operation.
     *  @param {Number} uint32val the word to be shifted
     *  @param {Number} numBits the number of bits to be shifted (0-31)
     *  @returns {Number} the uint32 value of the shifted word
     */
    exporter.shiftLeft = function (uint32val, numBits) {
        return (uint32val << numBits) >>> 0;
    };

    /**
     *  Returns the uint32 representation of a >>> operation.
     *  @param {Number} uint32val the word to be shifted
     *  @param {Number} numBits the number of bits to be shifted (0-31)
     *  @returns {Number} the uint32 value of the shifted word
     */
    exporter.shiftRight = function (uint32val, numBits) {
        return uint32val >>> numBits;
    };

    exporter.rotateLeft = function (uint32val, numBits) {
        return (((uint32val << numBits) >>> 0) | (uint32val >>> (32 - numBits))) >>> 0;
    };

    exporter.rotateRight = function (uint32val, numBits) {
        return (((uint32val) >>> (numBits)) | ((uint32val) << (32 - numBits)) >>> 0) >>> 0;
    };

    //
    // Logical Gates
    //

    /**
     *  Bitwise choose bits from y or z, as a bitwise x ? y : z
     */
    exporter.choose = function (x, y, z) {
        return ((x & (y ^ z)) ^ z) >>> 0;
    };

    /**
     * Majority gate for three parameters. Takes bitwise the majority of x, y and z,
     * @see https://en.wikipedia.org/wiki/Majority_function
     */
    exporter.majority = function (x, y, z) {
        return ((x & (y | z)) | (y & z)) >>> 0;
    };

    //
    //  Arithmetic
    //

    /**
     *  Adds the given values modulus 2^32.
     *  @returns the sum of the given values modulus 2^32
     */
    exporter.addMod32 = function (uint32val0/*, optionalValues*/) {
        var result = uint32val0;
        for (var index = 1; index < arguments.length; index += 1) {
            result += arguments[index];
        }
        return result >>> 0;
    };

    /**
     *  Returns the log base 2 of the given value. That is the number of the highest set bit.
     *  @param {Number} uint32val the value, the log2 is calculated of
     *  @return {Number} the logarithm base 2, an integer between 0 and 31
     */
    exporter.log2 = function (uint32val) {
        return Math.floor(Math.log(uint32val) / Math.LN2);
    };

    /**
     *  Returns the the low and the high uint32 of the multiplication.
     *  @param {Number} factor1 an uint32
     *  @param {Number} factor2 an uint32
     *  @param {Uint32Array[2]} resultUint32Array2 the Array, where the result will be written to
     *  @returns undefined
     */
    exporter.mult = function (factor1, factor2, resultUint32Array2) {
        var high16 =  ((factor1 & 0xffff0000) >>> 0) * factor2;
        var low16 = (factor1 & 0x0000ffff) * factor2;
        // the addition is dangerous, because the result will be rounded, so the result depends on the lowest bits, which will be cut away!
        var carry = ((exporter.toUint32(high16) + exporter.toUint32(low16)) >= POW_2_32) ? 1 : 0;
        resultUint32Array2[0] = (exporter.highPart(high16) + exporter.highPart(low16) + carry) >>> 0;
        resultUint32Array2[1] = ((high16 >>> 0) + (low16 >>> 0));// >>> 0;
    };

}) (this._uint32 = {});
