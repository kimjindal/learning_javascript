// include : underscore.js

function existy(x) {
	return x != null;
}

function thruthy(x) {
	return (x !== false) && existy(x);
}

function doWhen(condition, action) {
	if (truthy(condition))
		return action();
	else 
		return undefined;
}

function cat() {
	var head = _.first(arguments);
	if (existy(head))
		return head.concat.apply(head, _.rest(arguments));
	else 
		return [];
}

function construct(head, tail) {
	return cat([head], _.toArray(tail));
}


///////////////////////////////////////////////////////////
// A Function to Guard Against Nonexistence: fnull
///////////////////////////////////////////////////////////
/*
var nums = [1, 2, 3, null, 5];

_.reduce(nums, function(total, n) { return total * n });
// => 0

*/

function fnull(fun /*, defaults */) {
	var defaults = _.rest(arguments);

	return function(/* args */) {
		var args = _.map(arguments, function(e, i) {
			return existy(e) ? e : defaults[i];
		});

		return fun.apply(null, args);
	};
}

// var safeMult = fnull(function(total, n) { return total * n; }, 1, 1);
// _.reduce(nums, safeMult);
//=> 30

// To fix Object
function defaults(d) {
	return function(o, k) {
		var val = fnull(_.identity, d[k]);
		return o && val(o[k]);
	};
}

function doSomething(config) {
	var lookup = deafults({critical: 108});
	return lookup(config, 'critical');
}

// doSomething({critical: 9});
//=> 9

// doSomething({});
//=> 108


///////////////////////////////////////////////////////////
// Putting It All Together: Object Validators
///////////////////////////////////////////////////////////

function always(VALUE) {
	return function() {
		return VALUE;
	};
}

function checker(/* validators */) {
	var validators = _.toArray(arguments);

	return function(obj) {
		return _.reduce(validators, function(errs, check) {
			if (check(obj))
				return errs;
			else 
				return _.chain(errs).push(check.message).value();
		}, []);
	};
}

// var alwaysPasses = checker(always(true), always(true));

// alwaysPasses({});
//=> []
// var fails = always(false);
// fails.message = 'a failure in life';
// var alwaysFails = checker(fails);
//
// alwaysFails({});
//=> ['a failure in life']

function validator(message, fun) {
	var f = function(/* args */) {
		return fun.apply(fun, arguments);
	};

	f.message = message;
	return f;
}

// var gonnaFail = checker(validator('ZOMG!', always(false)));
// gonnaFail(100);
//=> ['ZOMG!']

function aMap(obj) {
	return _.isObject(obj);
}

// var checkCommand = checker(validator('must be a map', aMap));
// checkCommand({});
//=> true

function hasKeys() {
	var KEYS = _.toArray(arguments);

	var fun = function(obj) {
		return _.every(KEYS, function(k) {
			return _.has(obj, k);
		});
	};

	fun.message = cat(['Must have values for keys:'], KEYS).join(' ');
	return fun;
}

// var checkCommand = check(validator('must be a map', aMap),
//                          hasKeys('msg', 'type'));

// checkCommand({ msg: 'blash', type: 'display' });
//=> []
// checkCommand({});
//=> ["Must have values for keys: msg type"]


function invoker(NAME, METHOD) {
	return function(target /* args... */) {
		if (!existy(target)) return undefined;
		
		var targetMethod = target[NAME];
		var args = _.rest(arguments);

		return doWhen((existy(targetMethod) && METHOD === targetMethod), function() {
			return targetMethod.apply(target, args);
		});
	};
}

function dispatch(/* funs */) {
	var funs = _.toArray(arguments);
	var size = funs.length;

	return function(target /*, args */) {
		var ret;
		var args = _.rest(arguments);

		for (var funIndex = 0; funIndex < size; funIndex++) {
			var fun = funs[funIndex];
			ret = fun.apply(fun, construct(target, args));

			if (existy(ret)) return ret; 
		}

		return ret;
	};
}

// var str = dispatch(invoker('toString', Array.prototype.toString),
//                    invoker('toString', String.prototype.toString));

// str(_.range(10));

function stringReverse(s) {
	if (!_.isString(s)) return undefined;

	return s.split('').reverse().join('');
}

// var rev = dispatch(invoker('reverse', Array.prototype.reverse),
//                    stringReverse);


// var sillyReverse = dispatch(rev, always(42));

/////////////////////////////////////////////////////
// A more interesting pattern that dispatch eliminates is the switch statement manual dispatch.
/////////////////////////////////////////////////////

function performCommandHardcoded(command) {
	var result;

	switch (command.type) {
	case 'notify' :
		result = notify(command.message);
		break;
	case 'join' :
		result = changeView(command.target);
		break;
	default:
		alert(command.type);	
	}

	return result;
}

// does the notify action
// performCommandHardcoded({type:'notify', message: 'hi!'});
// does the changeView action
// performCommandHardcoded({type:'join', target: 'waiting-room'});
// pops up an alert box
// performCommandHardcoded({type:'wat'});

//////////////////////////////////////////////////////////
// 위 스위치 구문을 dispatch 패턴으로 간략화
//////////////////////////////////////////////////////////

function isa(type, action) {
	return function(obj) {
		if (type === obj.type)
			return action(obj);
	};
}

// var performCommand = dispatch( 
// 	isa('notify', function(obj) { return notify(obj.message); }),
// 	isa('join',		function(obj) { return changeView(obj.target); }),
// 	function(obj) { alert(obj.type); });


	/****************************************************
// 1. Takes a function
// 2. Return a function expecting one parameter
// Automatically Currying Parameters 
*****************************************************/

// ['11', '11', '11', '11'].map(parseInt)

function curry(func) {
  return function(arg) {
    return func(arg);
  };
}

// ['11', '11', '11', '11'].map(curry(parseInt))

function curry2(func) {
  return function(secondArg) {
    return function(firstArg) {
      return func(firstArg, secondArg);
    };
  };
}

function div(n, d) {
  return n / d;
}

// var divideBy10 = curry2(div)(10);

// var parseBinaryString = curry2(parseInt)(2);


/****************************************************
 *** Building new Functions using Curring
****************************************************/

var plays = [
  {artist: "Burial", track: "Archangel"},
  {artist: "Ben Frost", track: "Stomp"},
  {artist: "Ben Frost", track: "Stomp"},
  {artist: "Burial", track: "Archangel"},
  {artist: "Emeralds", track: "Snores"},
  {artist: "Burial", track: "Archangel"}
];

// var obj = _.countBy(plays, function(song) {
//   return [song.artist, song.track].join('-');
// });

function songToString(song) {
  return [song.artist, song.track].join('-');
}

// var songCount = curry2(_.countBy)(songToString);

///////////////////////////////////////////////////////

function curry3(fun) {
  return function(last) {
    return function(middle) {
      return function(first) {
        return fun(first, middle, last);
      };
    };
  };
}     

//                       _.uniq(play, false, songToString);
//                curry3(_.uniq)     (false)(songToString);

// var songsPlayed = curry3(_.uniq)(false)(songToString);

/////////////////////////////////////////////////
// HTML hexadecimal color
/////////////////////////////////////////////////

function toHex(n) {
  var hex = n.toString(16);
  return (hex.length < 2) ? [0, hex].join('') : hex;
}

function rgbToHexString(r, g, b) {
  return ['#', toHex(r), toHex(g), toHex(b)].join('');
}

// var blueGreenish = curry3(rgbToHexString)(255)(200);

