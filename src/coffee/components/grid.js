// Generated by CoffeeScript 1.7.1
(function() {
  (function(OJ) {
    var className, nodeName;
    nodeName = 'x-grid';
    className = 'grid';
    OJ.components.members[nodeName] = className;
    OJ.components.register(className, function(options, owner) {
      var defaults, ret;
      defaults = {
        props: {
          "class": 'grid'
        }
      };
      OJ.extend(defaults, options);
      ret = OJ.component(defaults, owner, nodeName);
      return ret;
    });
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=grid.map