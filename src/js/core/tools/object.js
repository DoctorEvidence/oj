// Generated by CoffeeScript 1.7.1
(function() {
  var _propertyIIFE;

  (_propertyIIFE = function(OJ) {

    /*
    Create an instance of Object
    @param properties {Object} [properties={}] properties to define on the Object
    @param inheritsFromPrototype {Prototype} [inheritsFromPrototype=null] The prototype to inherit from
     */
    var compare, object;
    object = function(properties, inheritsFromPrototype) {
      var obj;
      if (!inheritsFromPrototype) {
        inheritsFromPrototype = null;
      }
      if (!properties) {
        properties = {};
      }
      obj = Object.create(inheritsFromPrototype, properties);

      /*
      Add a property to the object and return it
       */
      OJ.property(obj, "add", (function(name, val, writable, configurable, enumerable) {
        return OJ.property(obj, name, val, writable, configurable, enumerable);
      }), false, false, false);
      return obj;
    };
    OJ.register("object", object);
    OJ.register("isInstanceOf", function(name, obj) {
      'use strict';
      return OJ.contains(name, obj) && OJ.bool(obj[name]);
    });
    OJ.register("contains", function(object, index) {
      'use strict';
      var ret;
      ret = false;
      if (false === OJ.isNullOrUndefined(object)) {
        if (OJ.isArray(object)) {
          ret = object.indexOf(index) !== -1;
        }
        if (false === ret && object.hasOwnProperty(index)) {
          ret = true;
        }
      }
      return ret;
    });

    /*
    Compares two objects, serialized to strings, stripped of whitespace
     */
    compare = function(obj1, obj2) {
      var string1, string2;
      string1 = "";
      string2 = "";
      if (obj1) {
        string1 = OJ.serialize(obj1).trim().replace(" ", "");
      }
      if (obj2) {
        string2 = OJ.serialize(obj2).trim().replace(" ", "");
      }
      return string1 === string2;
    };
    OJ.register("compare", compare);
    OJ.register("clone", function(data) {
      'use strict';
      return JSON.parse(JSON.stringify(data));
    });
    OJ.register("serialize", function(data) {
      'use strict';
      var ret;
      ret = "";
      OJ.tryExec(function() {
        ret = JSON.stringify(data);
      });
      return ret || "";
    });
    OJ.register("deserialize", function(data) {
      'use strict';
      var ret;
      ret = {};
      if (data) {
        OJ.tryExec(function() {
          ret = window.$.parseJSON(data);
        });
        if (OJ.isNullOrEmpty(ret)) {
          ret = {};
        }
      }
      return ret;
    });
    OJ.register("params", function(data, delimiter) {
      var ret;
      ret = "";
      delimiter = delimiter || "&";
      if (delimiter === "&") {
        OJ.tryExec(function() {
          ret = $.param(data);
        });
      } else {
        OJ.each(data, function(val, key) {
          if (ret.length > 0) {
            ret += delimiter;
          }
          ret += key + "=" + val;
        });
      }
      return OJ.string(ret);
    });
    OJ.register("extend", function(destObj, srcObj, deepCopy) {
      'use strict';
      var ret;
      ret = destObj || {};
      if (arguments_.length === 3) {
        ret = window.$.extend(OJ.bool(deepCopy), ret, srcObj);
      } else {
        ret = window.$.extend(ret, srcObj);
      }
      return ret;
    });
    OJ.register("count", function(obj) {
      'use strict';
      var count, prop;
      count = 0;
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          count++;
        }
      }
      return count;
    });
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=object.map
