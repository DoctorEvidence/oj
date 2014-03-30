// Generated by CoffeeScript 1.7.1
(function() {
  (function(OJ) {

    /*
    True if the object is a true Object or Array
    @param obj {Object}
     */
    var canEach, each;
    canEach = function(obj) {
      return obj && (typeof obj === "object" || Array.isArray(obj));
    };

    /*
    Iterate an object with optional callBack and recursion
    @param obj {Object} an Object to iterate
    @param onEach {Function} [onEach=undefined] call back to exec
    @param recursive {Boolean} if true, recurse the object
     */
    each = function(obj, onEach, recursive) {
      if (onEach == null) {
        onEach = _.noop;
      }
      if (recursive == null) {
        recursive = true;
      }
      if (canEach(obj)) {
        _.forEach(obj, function(val, key) {
          var quit;
          if (onEach && key) {
            quit = onEach(val, key);
            if (false === quit) {
              return false;
            }
          }
          if (true === recursive) {
            each(val, onEach, true);
          }
        });
      }
    };
    OJ.register("each", each);
  })((typeof global !== "undefined" && global ? global : (typeof window !== "undefined" ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=each.map
