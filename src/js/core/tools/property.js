// Generated by CoffeeScript 1.7.1
(function() {
  var _propertyIIFE;

  (_propertyIIFE = function(OJ) {

    /*
    Add a property to an object
    @param obj {Object} an Object onto which to add a property
    @param name {String} the property name
    @param value {Object} the value of the property. Can be any type.
    @param writable {Boolean} [writable=true] True if the property can be modified
    @param configurable {Boolean} [configurable=true] True if the property can be removed
    @param enumerable {Boolean} [enumerable=true] True if the property can be enumerated and is listed in Object.keys
     */
    var property;
    property = function(obj, name, value, writable, configurable, enumerable) {
      var isConfigurable, isEnumerable, isWritable;
      if (!obj) {
        throw new Error("Cannot define a property without an Object.");
      }
      if (typeof name !== "string") {
        throw new Error("Cannot create a property without a valid property name.");
      }
      isWritable = writable !== false;
      isConfigurable = configurable !== false;
      isEnumerable = enumerable !== false;
      Object.defineProperty(obj, name, {
        value: value,
        writable: isWritable,
        configurable: isConfigurable,
        enumerable: isEnumerable
      });
      return obj;
    };
    OJ.register("property", property);
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=property.map
