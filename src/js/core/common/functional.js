// Generated by CoffeeScript 1.7.1
(function() {
  (function(OJ) {
    'use strict';
    var apply, curryLeft, filter, foldLeft, map, shiftRight;
    OJ.makeSubNameSpace("fun");
    OJ.fun.register("curryLeft", curryLeft = function(func) {
      var args, slice;
      slice = Array.prototype.slice;
      args = slice.call(arguments_, 1);
      return function() {
        return func.apply(this, args.concat(slice.call(arguments_, 0)));
      };
    });
    OJ.fun.register("foldLeft", foldLeft = function(func, newArray, oldArray) {
      var accumulation;
      accumulation = newArray;
      OJ.each(oldArray, function(val) {
        accumulation = func(accumulation, val);
      });
      return accumulation;
    });
    OJ.fun.register("map", map = function(func, array) {
      var onIteration;
      onIteration = function(accumulation, val) {
        return accumulation.concat(func(val));
      };
      return OJ.fun.foldLeft(onIteration, [], array);
    });
    OJ.fun.register("filter", filter = function(func, array) {
      var onIteration;
      onIteration = function(accumulation, val) {
        if (func(val)) {
          return accumulation.concat(val);
        } else {
          return accumulation;
        }
      };
      return OJ.fun.foldLeft(onIteration, [], array);
    });
    OJ.fun.register("shiftRight", shiftRight = function(shiftFunc, firstParam, originalArguments, context) {
      var args;
      context = context || this;
      args = Array.prototype.slice.call(originalArguments, 0);
      args.unshift(firstParam);
      return shiftFunc.apply(context, args);
    });
    OJ.fun.register("apply", apply = function(applyFunc, originalArguments, context) {
      var args;
      context = context || this;
      args = Array.prototype.slice.call(originalArguments, 0);
      return applyFunc.apply(context, args);
    });
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=functional.map
