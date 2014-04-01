// Generated by CoffeeScript 1.7.1
(function() {
  (function(OJ) {

    /*
    Create an HTML Element through ThinDom
     */
    var component;
    component = function(options, owner, tagName) {
      var ret;
      if (options == null) {
        options = OJ.object();
      }
      if (!tagName.startsWith('x-')) {
        tagName = 'x-' + tagName;
      }
      ret = OJ.element(tagName, options.props, options.styles);
      return OJ.nodes.factory(ret, owner);
    };
    OJ.register('component', component);
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=component.map