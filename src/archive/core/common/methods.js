// Generated by CoffeeScript 1.7.1
(function() {
  (function(OJ) {
    var slice;
    slice = Array.prototype.slice;

    /*
    Take an arguments object and convert it into an Array
     */
    OJ.register("getArguments", function(args, sliceAt) {
      'use strict';
      var ret;
      sliceAt = sliceAt || 0;
      ret = slice.call(args, sliceAt);
      return ret;
    });
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=methods.map