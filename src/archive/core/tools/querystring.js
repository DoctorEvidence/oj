// Generated by CoffeeScript 1.7.1
(function() {
  (function() {
    OJ.register("queryString", function() {
      "use strict";
      var ojInternal, ret;
      ret = {};
      ojInternal = {
        e: "",
        a: /\+/g,
        r: /([^&=]+)=?([^&]*)/g,
        d: function(s) {
          return decodeURIComponent(s.replace(ojInternal.a, " "));
        },
        q: OJ.window.location().search.substring(1)
      };
      while (ojInternal.e = ojInternal.r.exec(ojInternal.q)) {
        ret[ojInternal.d(ojInternal.e[1])] = ojInternal.d(ojInternal.e[2]);
      }
      if (false === OJ.contains(ret, "pageName")) {
        ret.pageName = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
      }
      return ret;
    });
  })();

}).call(this);

//# sourceMappingURL=querystring.map
