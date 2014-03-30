// Generated by CoffeeScript 1.7.1
(function() {
  var __slice = [].slice;

  (function(OJ) {

    /*
     Bind all event handlers
     */
    var bindEvents, body, element, thinBody;
    bindEvents = function(el, events) {
      if (el.node) {
        return _.forOwn(events, function(val, key) {
          var callback;
          if (_.isFunction(val && val !== _.noop)) {
            callback = function() {
              var event;
              event = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              return val.apply(null, event);
            };
            el.$.bind(key, callback);
            el.add(key, callback);
          }
        });
      }
    };

    /*
    Create an HTML Element through ThinDom
     */
    element = function(tag, props, styles, events) {
      var ret;
      ret = OJ.object();
      ret.add('node', new ThinDOM(tag, props));
      ret.add('tagName', tag);
      ret.node.css(styles);
      ret.add('css', ret.node.css);
      ret.add('append', ret.node.append);
      ret.add('html', ret.node.html);
      ret.add('text', ret.node.text);
      ret.add('attr', ret.node.attr);
      ret.add('$', $(ret.node.get()));
      ret.add('0', ret.node.get());
      bindEvents(ret, events);
      return ret;
    };
    OJ.register('element', element);

    /*
    Persist a handle on the body ode
     */
    if (typeof document !== 'undefined') {
      body = document.body;
    } else {
      body = null;
    }
    thinBody = new ThinDOM(null, null, body);
    thinBody.getId = function() {
      return 'body';
    };
    OJ.register('body', thinBody);
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=element.map