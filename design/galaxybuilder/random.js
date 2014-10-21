/**
 * Stop-start seed implementation of Ranrot
 * ranrot.seed(int)
 * ranrot.fill(likely number of numbers needed)
 * ranrot.setStart(place to start in sequence)
 * ranrot.rand(max) // int from sequence position
 * ranrot.randf()   // float 0..1 from sequence position
 */

(function() {

	var uint32 = require("uint32");

	var random = {}

	var _ranrot = { high: 0, low: 0 }

	var _sequence = [];
	var _seqctr = 0;
	var _seqptr = 0;
	var _seqBlockSize = 1000;
	
	var $rnd = function () {
		_ranrot.high = uint32.addMod32(
			uint32.shiftLeft(_ranrot.high,16),
			uint32.shiftRight(_ranrot.high,16)
		);
		_ranrot.high = uint32.addMod32(_ranrot.high,_ranrot.low);
		_ranrot.low = uint32.addMod32(_ranrot.high,_ranrot.low);
		return uint32.and(_ranrot.high,0x7FFFFFFF);
	};

	var $obtain = function() {
		if (_seqptr >= _seqctr) {
			throw "Out of random numbers";
		}
		var val = _sequence[Math.floor(_seqptr/_seqBlockSize)][_seqptr%_seqBlockSize];
		_seqptr++;
		return val;
	};
	
	random.seed = function (seed) {
		_ranrot.high = seed;
		_ranrot.low = uint32.xor(seed,0xFFFFFFFF);
		$rnd();
		$rnd();		
		$rnd();
	};
	
	random.fill = function (depth) {
		if (_ranrot.high == 0) {
			throw "Ranrot not yet seeded";
		}
		for (var i=0;i<depth;i++) {
			if (!_sequence[Math.floor(_seqctr/_seqBlockSize)])
			{
				_sequence[Math.floor(_seqctr/_seqBlockSize)] = [];
			}
			_sequence[Math.floor(_seqctr/_seqBlockSize)][_seqctr%_seqBlockSize] = $rnd();
			_seqctr++;
		}
	}

	random.rand = function (max) {
		return Math.floor($obtain() * max / 0x7FFFFFFF);
	};

	random.randf = function () {
		return $obtain() / 0x7FFFFFFF;
	};

	random.setStart = function(start) {
		_seqptr = start;
		if (_seqptr >= _seqctr)
		{
			throw "Out of random numbers";
		}
	};


	module.exports = random;

}());