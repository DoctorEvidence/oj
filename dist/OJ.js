(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var OJ, ajax, config, optsFromUrl;

OJ = require('../oj');

config = {};

config.onSuccess = function(opts, data, url) {
  var response;
  response = {};
  OJ.extend(response, data);
  opts.onSuccess(response);
  if (OJ.LOG_ALL_AJAX) {
    OJ.console.table([
      {
        Webservice: opts.ajaxOpts.url,
        StartTime: opts.startTime,
        EndTime: new Date()
      }
    ]);
  }
};

config.onError = function(xmlHttpRequest, textStatus, param1, opts) {
  if (opts == null) {
    opts = OJ.object();
  }
  if (textStatus !== 'abort') {
    if (OJ.LOG_ALL_AJAX_ERRORS) {
      OJ.console.table([
        {
          Webservice: opts.ajaxOpts.url,
          Data: opts.ajaxOpts.data,
          Failed: textStatus,
          State: xmlHttpRequest.state(),
          Status: xmlHttpRequest.status,
          StatusText: xmlHttpRequest.statusText,
          ReadyState: xmlHttpRequest.readyState,
          ResponseText: xmlHttpRequest.responseText
        }
      ]);
    }
    opts.onError(textStatus);
  }
};

optsFromUrl = function(opts) {
  var url;
  if (OJ.is.string(opts)) {
    url = opts;
    opts = OJ.object();
    opts.add('ajaxOpts', OJ.object());
    opts.ajaxOpts.add('url', url);
  }
  return opts;
};

config.execRequest = function(verb, opts) {
  var defaults, getJQueryDeferred, promise;
  if (verb == null) {
    verb = 'GET';
  }
  defaults = {
    ajaxOpts: {
      url: '',
      data: {},
      type: verb,
      xhrFields: {
        withCredentials: true
      },
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    },
    onSuccess: OJ.noop,
    onError: OJ.noop,
    onComplete: OJ.noop,
    overrideError: false,
    watchGlobal: true,
    useCache: false
  };
  opts = optsFromUrl(opts);
  OJ.extend(defaults, opts, true);
  defaults.startTime = new Date();
  if (false === OJ.is.nullOrEmpty(defaults.ajaxOpts.data)) {
    if (defaults.ajaxOpts.verb === 'GET') {
      defaults.ajaxOpts.data = OJ.params(defaults.ajaxOpts.data);
    } else {
      defaults.ajaxOpts.data = OJ.serialize(defaults.ajaxOpts.data);
    }
  }
  getJQueryDeferred = function(watchGlobal) {
    var ret;
    ret = $.ajax(defaults.ajaxOpts);
    ret.done(function(data, textStatus, jqXHR) {
      return config.onSuccess(defaults, data);
    });
    ret.fail(function(jqXHR, textStatus, errorText) {
      return config.onError(jqXHR, textStatus, errorText, defaults);
    });
    ret.always(function(xmlHttpRequest, textStatus) {
      return defaults.onComplete(xmlHttpRequest, textStatus);
    });
    return OJ.async.ajaxPromise(ret);
  };
  promise = getJQueryDeferred(defaults.watchGlobal);
  return promise;
};

ajax = {};

ajax.post = function(opts) {
  return config.execRequest('POST', opts);
};

ajax.get = function(opts) {
  return config.execRequest('GET', opts);
};

ajax["delete"] = function(opts) {
  return config.execRequest('DELETE', opts);
};

ajax.put = function(opts) {
  return config.execRequest('PUT', opts);
};

OJ.async.register('ajax', ajax);

module.exports = ajax;


},{"../oj":58}],2:[function(require,module,exports){
var OJ, ajaxPromise, all, defr;

OJ = require('../oj');

ajaxPromise = function(ajax) {
  var promise;
  promise = Promise.resolve(ajax);
  promise.abort = ajax.abort;
  promise.readyState = ajax.readyState;
  return promise;
};

all = function(initArray) {
  var promise, reqs;
  reqs = initArray || [];
  promise = Promise.all(reqs);
  promise.push = function(item) {
    reqs.push(item);
  };
  return promise;
};

defr = function(func) {
  var ret;
  if (func == null) {
    func = OJ.noop;
  }
  ret = Promise.method(func);
  return ret;
};

OJ.async.register('defer', defr);

OJ.async.register('all', all);

OJ.async.register('ajaxPromise', ajaxPromise);

module.exports = {
  defer: defr,
  all: all,
  ajaxPromise: ajaxPromise
};


},{"../oj":58}],3:[function(require,module,exports){
var OJ, array2D, className, cmpnt, component, nodeName;

OJ = require('../oj');

require('../ojInit');

component = require('../dom/component');

array2D = require('../tools/array2D');

nodeName = 'x-grid';

className = 'grid';

OJ.components.members[className] = nodeName;

cmpnt = function(options, owner) {
  var defaults, fillMissing, ret, rows, tiles;
  defaults = {
    tileSizes: {
      smallSpan: '',
      mediumSpan: '',
      largeSpan: ''
    },
    props: {
      "class": 'grid'
    }
  };
  OJ.extend(defaults, options, true);
  ret = component(defaults, owner, nodeName);
  rows = [];
  tiles = array2D();
  fillMissing = function() {
    return tiles.each(function(rowNo, colNo, val) {
      var row;
      if (!val) {
        row = ret.row(rowNo);
        return row.make('tile', colNo, {});
      }
    });
  };
  ret.add('row', function(rowNo) {
    var nuRow;
    if (rowNo == null) {
      rowNo = rows.length - 1 || 1;
    }
    nuRow = rows[rowNo - 1];
    if (!nuRow) {
      while (rows.length < rowNo) {
        nuRow = ret.make('div', {
          props: {
            "class": 'row'
          }
        });
        rows.push(nuRow);
      }
      nuRow.add('tile', function(colNo, opts) {
        var nuTile;
        opts = OJ.extend(OJ.extend({}, defaults.tileSizes), opts);
        nuTile = OJ.components.tile(opts, nuRow);
        tiles.set(rowNo, colNo, nuTile);
        return nuTile;
      });
    }
    return nuRow;
  });
  ret.add('tile', function(rowNo, colNo, opts) {
    var i, row, tile, tryTile;
    if (!rowNo || rowNo < 1) {
      rowNo = 1;
    }
    if (!colNo || colNo < 1) {
      colNo = 1;
    }
    row = ret.row(rowNo);
    tile = tiles.get(rowNo, colNo);
    if (!tile) {
      i = 0;
      while (i < colNo) {
        i += 1;
        tryTile = tiles.get(rowNo, i);
        if (!tryTile) {
          if (i === colNo) {
            tile = row.make('tile', opts);
          } else if (!tile) {
            row.make('tile');
          }
        }
      }
    }
    fillMissing();
    return tile;
  });
  return ret;
};

OJ.components.register(className, cmpnt);

module.exports = cmpnt;


},{"../dom/component":15,"../oj":58,"../ojInit":59,"../tools/array2D":61}],4:[function(require,module,exports){
var OJ, className, cmpnt, component, nodeName, uuid;

OJ = require('../oj');

require('../ojInit');

component = require('../dom/component');

uuid = require('../tools/uuid');

nodeName = 'x-input-group';

className = 'inputgroup';

OJ.components.members[className] = nodeName;

cmpnt = function(options, owner) {
  var defaults, forId, group, ret;
  forId = uuid();
  defaults = {
    props: {
      "class": 'form-group'
    },
    events: {
      change: OJ.noop
    },
    "for": forId,
    labelText: '',
    inputOpts: {
      props: {
        id: forId,
        type: 'text',
        "class": '',
        placeholder: '',
        value: ''
      }
    }
  };
  OJ.extend(defaults, options, true);
  ret = component(defaults, owner, nodeName);
  group = ret.make('div', {
    props: {
      "class": 'form-group'
    }
  });
  ret.groupLabel = group.make('label', {
    props: {
      "for": forId
    },
    text: defaults.labelText
  });
  defaults.inputOpts.props["class"] += ' form-control';
  ret.groupInput = group.make('input', defaults.inputOpts);
  ret.groupValue = function() {
    return ret.groupInput.val();
  };
  return ret;
};

OJ.components.register(className, cmpnt);

module.exports = cmpnt;


},{"../dom/component":15,"../oj":58,"../ojInit":59,"../tools/uuid":73}],5:[function(require,module,exports){
var OJ, className, cmpnt, component, nodeName;

OJ = require('../oj');

require('../ojInit');

component = require('../dom/component');

nodeName = 'x-tabs';

className = 'tabs';

OJ.components.members[className] = nodeName;

cmpnt = function(options, owner) {
  var content, defaults, first, ret, tabs;
  defaults = {
    tabs: {},
    props: {
      "class": ''
    }
  };
  OJ.extend(defaults, options, true);
  ret = component(defaults, owner, nodeName);
  tabs = ret.make('ul', {
    props: {
      "class": 'nav nav-tabs'
    }
  });
  content = ret.make('div', {
    props: {
      "class": 'tab-content'
    }
  });
  first = true;
  OJ.each(defaults.tabs, function(tabVal, tabName) {
    var a, tabClass, tabContentClass;
    tabClass = '';
    if (first) {
      first = false;
      tabClass = 'active';
    }
    a = tabs.make('li', {
      props: {
        "class": tabClass
      }
    }).make('a', {
      text: tabName,
      props: {
        href: '#' + tabName,
        'data-toggle': 'tab'
      },
      events: {
        click: function() {
          return a.$.tab('show');
        }
      }
    });
    tabContentClass = 'tab-pane ' + tabClass;
    return ret.add(tabName, content.make('div', {
      props: {
        "class": tabContentClass,
        id: tabName
      }
    }));
  });
  return ret;
};

OJ.components.register(className, cmpnt);

module.exports = cmpnt;


},{"../dom/component":15,"../oj":58,"../ojInit":59}],6:[function(require,module,exports){
var OJ, className, cmpnt, component, nodeName;

OJ = require('../oj');

require('../ojInit');

component = require('../dom/component');

nodeName = 'x-tile';

className = 'tile';

OJ.components.members[className] = nodeName;

cmpnt = function(options, owner) {
  var defaults, ret;
  defaults = {
    width: {
      xs: '',
      sm: '',
      md: '',
      lg: ''
    },
    props: {
      "class": 'tile'
    }
  };
  OJ.extend(defaults, options, true);
  if (defaults.width.xs) {
    defaults.props["class"] += ' col-xs-' + defaults.width.xs;
  }
  if (defaults.width.sm) {
    defaults.props["class"] += ' col-sm-' + defaults.width.sm;
  }
  if (defaults.width.md) {
    defaults.props["class"] += ' col-md-' + defaults.width.md;
  }
  if (defaults.width.lg) {
    defaults.props["class"] += ' col-lg-' + defaults.width.lg;
  }
  ret = OJ.component(defaults, owner, nodeName);
  return ret;
};

OJ.components.register(className, cmpnt);

module.exports = cmpnt;


},{"../dom/component":15,"../oj":58,"../ojInit":59}],7:[function(require,module,exports){
var OJ, cntrl, control, controlName, friendlyName;

OJ = require('../oj');

require('../ojInit');

control = require('../dom/control');

controlName = 'y-icon';

friendlyName = 'icon';

OJ.controls.members[friendlyName] = controlName;

cntrl = function(options, owner) {
  var className, classNameBase, defaults, isToggled, ret;
  defaults = {
    iconOpts: {
      name: '',
      stackedIcon: '',
      swapIcon: '',
      size: false,
      color: '',
      library: '',
      isFixedWidth: false,
      isList: false,
      isSpinner: false
    },
    props: {
      "class": ''
    },
    rootNodeType: 'span'
  };
  OJ.extend(defaults, options);
  ret = control(defaults, owner, controlName);
  isToggled = false;
  classNameBase = 'fa ';
  if (defaults.iconOpts.isFixedWidth) {
    classNameBase += 'fa-fw ';
  }
  if (defaults.iconOpts.isList) {
    classNameBase += 'fa-li ';
  }
  if (defaults.iconOpts.isSpinner) {
    classNameBase += 'fa-spin ';
  }
  if (defaults.iconOpts.size) {
    if (defaults.iconOpts.size > 1 && defaults.iconOpts.size <= 5) {
      classNameBase += 'fa-' + defaults.iconOpts.size + 'x ';
    }
  }
  className = classNameBase + 'fa-' + defaults.iconOpts.name;
  ret.myIcon = ret.make('i', {
    props: {
      "class": className
    }
  });
  ret.toggleIcon = function() {
    var newIcon;
    if (defaults.iconOpts.swapIcon) {
      newIcon = defaults.iconOpts.name;
      isToggled = !isToggled;
      if (isToggled) {
        ret.myIcon.$.removeClass('fa-' + newIcon);
        newIcon = defaults.iconOpts.swapIcon;
      } else {
        ret.myIcon.$.removeClass('fa-' + defaults.iconOpts.swapIcon);
      }
      return ret.myIcon.$.addClass('fa-' + newIcon);
    }
  };
  return ret;
};

OJ.controls.register(friendlyName, cntrl);

module.exports = cntrl;


},{"../dom/control":16,"../oj":58,"../ojInit":59}],8:[function(require,module,exports){
var OJ, getDateFromDnJson;

OJ = require('../oj');

getDateFromDnJson = function(dnDate) {
  var arr, dnDateStr, localOffset, offset, ret, ticks;
  dnDateStr = OJ.to.string(dnDate);
  ret = void 0;
  ticks = void 0;
  offset = void 0;
  localOffset = void 0;
  arr = void 0;
  ret = OJ.dateTimeMinValue;
  if (false === OJ.is.nullOrEmpty(dnDateStr)) {
    dnDateStr = dnDateStr.replace('/', '');
    dnDateStr = dnDateStr.replace('Date', '');
    dnDateStr = dnDateStr.replace('(', '');
    dnDateStr = dnDateStr.replace(')', '');
    arr = dnDateStr.split('-');
    if (arr.length > 1) {
      ticks = OJ.to.number(arr[0]);
      offset = OJ.to.number(arr[1]);
      localOffset = new Date().getTimezoneOffset();
      ret = new Date(ticks - ((localOffset + (offset / 100 * 60)) * 1000));
    } else if (arr.length === 1) {
      ticks = OJ.to.number(arr[0]);
      ret = new Date(ticks);
    }
  }
  ret;
  OJ.register('getDateFromDnJson', getDateFromDnJson);
  return modules.exports = getDateFromDnJson;
};


},{"../oj":58}],9:[function(require,module,exports){
var OJ, method, tryExec;

OJ = require('../oj');

tryExec = function(tryFunc) {
  'use strict';
  var error, exception, ret, that;
  ret = false;
  that = this;
  try {
    if (OJ.is.method(tryFunc)) {
      ret = tryFunc.apply(that, Array.prototype.slice.call(arguments, 1));
    }
  } catch (error) {
    exception = error;
    if ((exception.name === 'TypeError' || exception.type === 'called_non_callable') && exception.type === 'non_object_property_load') {
      OJ.console.info('Ignoring exception: ', exception);
    } else {
      OJ.console.error(exception);
    }
  } finally {

  }
  return ret;
};

method = function(tryFunc) {
  'use strict';
  var that;
  that = this;
  return function() {
    var args;
    args = Array.prototype.slice.call(arguments, 0);
    args.unshift(tryFunc);
    return OJ.tryExec.apply(that, args);
  };
};

OJ.register('method', method);

OJ.register('tryExec', tryExec);

module.exports = {
  method: method,
  tryExec: tryExec
};


},{"../oj":58}],10:[function(require,module,exports){
var OJ, number;

OJ = require('../oj');

number = Object.create(null);

Object.defineProperty(number, 'isNaN', {
  value: (Number && Number.isNaN ? Number.isNaN : isNaN)
});

Object.defineProperty(number, 'isFinite', {
  value: (Number && Number.isFinite ? Number.isFinite : isFinite)
});

Object.defineProperty(number, 'MAX_VALUE', {
  value: (Number && Number.MAX_VALUE ? Number.MAX_VALUE : 1.7976931348623157e+308)
});

Object.defineProperty(number, 'MIN_VALUE', {
  value: (Number && Number.MIN_VALUE ? Number.MIN_VALUE : 5e-324)
});

OJ.register('number', number);

module.exports = number;


},{"../oj":58}],11:[function(require,module,exports){
(function (global){
var $, OJ, _, func, isMethod, property, retObj, to;

OJ = require('../oj');

$ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

isMethod = require('../tools/is');

property = require('./property');

func = require('./function');

to = require('../tools/to');

retObj = {
  object: function(obj) {
    if (obj == null) {
      obj = {};
    }

    /*
    Add a property to the object and return it
     */
    obj.add = function(name, val) {
      property(obj, name, val);
      return obj;
    };
    obj.add('each', function(callback) {
      var each;
      each = require('../tools/each');
      return each(obj, function(val, key) {
        if (key !== 'each' && key !== 'add') {
          return callback(val, key);
        }
      });
    });
    return obj;
  },
  isInstanceOf: function(name, obj) {
    return retObj.contains(name, obj) && to.bool(obj[name]);
  },
  contains: function(object, index) {
    var ret;
    ret = false;
    if (object) {
      ret = _.contains(object, index);
    }
    return ret;
  },
  compare: function(obj1, obj2) {
    return _.isEqual(obj1, obj2);
  },
  clone: function(data) {
    return _.cloneDeep(data(true));
  },
  serialize: function(data) {
    var ret;
    ret = '';
    func.tryExec(function() {
      ret = JSON.stringify(data);
    });
    return ret || '';
  },
  deserialize: function(data) {
    var ret;
    ret = {};
    if (data) {
      func.tryExec(function() {
        ret = $.parseJSON(data);
      });
      if (isMethod.nullOrEmpty(ret)) {
        ret = {};
      }
    }
    return ret;
  },
  params: function(data, delimiter) {
    var each, ret;
    if (delimiter == null) {
      delimiter = '&';
    }
    ret = '';
    if (delimiter === '&') {
      func.tryExec(function() {
        ret = $.param(data);
      });
    } else {
      each = require('../tools/each');
      each(data, function(val, key) {
        if (ret.length > 0) {
          ret += delimiter;
        }
        ret += key + '=' + val;
      });
    }
    return to.string(ret);
  },
  extend: function(destObj, srcObj, deepCopy) {
    var key, ret, value;
    if (deepCopy == null) {
      deepCopy = false;
    }
    ret = destObj || {};
    for (key in srcObj) {
      value = srcObj[key];
      if (deepCopy && value && $.isPlainObject(value) && $.isPlainObject(ret[key])) {
        this.extend(ret[key], value, true);
      } else {
        ret[key] = value;
      }
    }
    return ret;
  }
};

OJ.register('object', retObj.object);

OJ.register('isInstanceOf', retObj.isInstanceOf);

OJ.register('contains', retObj.contains);

OJ.register('compare', retObj.compare);

OJ.register('clone', retObj.clone);

OJ.register('serialize', retObj.serialize);

OJ.register('deserialize', retObj.deserialize);

OJ.register('params', retObj.params);

OJ.register('extend', retObj.extend);

module.exports = retObj;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58,"../tools/each":65,"../tools/is":67,"../tools/to":72,"./function":9,"./property":12}],12:[function(require,module,exports){
var OJ, property;

OJ = require('../oj');


/*
Add a property to an object
 */

property = function(obj, name, value, writable, configurable, enumerable) {
  if (!obj) {
    throw new Error('Cannot define a property without an Object.');
  }
  if (name == null) {
    throw new Error('Cannot create a property without a valid property name.');
  }
  obj[name] = value;
  return obj;
};

OJ.register('property', property);

module.exports = property;


},{"../oj":58}],13:[function(require,module,exports){
var OJ, delimitedString;

OJ = require('../oj');

delimitedString = function(string, opts) {
  var defaults, retObj;
  defaults = {
    newLineToDelimiter: true,
    spaceToDelimiter: true,
    removeDuplicates: true,
    delimiter: ",",
    initString: OJ.to.string(string)
  };
  retObj = {
    array: [],
    delimited: function() {
      return retObj.array.join(defaults.delimiter);
    },
    string: function(delimiter) {
      var ret;
      if (delimiter == null) {
        delimiter = defaults.delimiter;
      }
      ret = '';
      OJ.each(retObj.array, function(val) {
        if (ret.length > 0) {
          ret += delimiter;
        }
        ret += val;
      });
      return ret;
    },
    toString: function() {
      return retObj.string();
    },
    add: function(str) {
      retObj.array.push(defaults.parse(str));
      defaults.deleteDuplicates();
      return retObj;
    },
    remove: function(str) {
      var remove;
      remove = function(array) {
        return array.filter(function(item) {
          if (item !== str) {
            return true;
          }
        });
      };
      retObj.array = remove(retObj.array);
      return retObj;
    },
    count: function() {
      return retObj.array.length;
    },
    contains: function(str, caseSensitive) {
      var isCaseSensitive, match;
      isCaseSensitive = OJ.to.bool(caseSensitive);
      str = OJ.to.string(str).trim();
      if (false === isCaseSensitive) {
        str = str.toLowerCase();
      }
      match = retObj.array.filter(function(matStr) {
        return (isCaseSensitive && OJ.to.string(matStr).trim() === str) || OJ.to.string(matStr).trim().toLowerCase() === str;
      });
      return match.length > 0;
    },
    each: function(callBack) {
      return retObj.array.forEach(callBack);
    }
  };
  defaults.parse = function(str) {
    var ret;
    ret = OJ.to.string(str);
    if (defaults.newLineToDelimiter) {
      while (ret.indexOf("\n") !== -1) {
        ret = ret.replace(/\n/g, defaults.delimiter);
      }
    }
    if (defaults.spaceToDelimiter) {
      while (ret.indexOf(" ") !== -1) {
        ret = ret.replace(RegExp(" ", "g"), defaults.delimiter);
      }
    }
    while (ret.indexOf(",,") !== -1) {
      ret = ret.replace(/,,/g, defaults.delimiter);
    }
    return ret;
  };
  defaults.deleteDuplicates = function() {
    if (defaults.removeDuplicates) {
      (function() {
        var unique;
        unique = function(array) {
          var seen;
          seen = new Set();
          return array.filter(function(item) {
            if (false === seen.has(item)) {
              seen.add(item);
              return true;
            }
          });
        };
        retObj.array = unique(retObj.array);
      })();
    }
  };
  (function(a) {
    if (a.length > 1 && false === OJ.is.plainObject(opts)) {
      OJ.each(a, function(val) {
        if (false === OJ.is.nullOrEmpty(val)) {
          retObj.array.push(val);
        }
      });
    } else if (string && string.length > 0) {
      OJ.extend(defaults, opts);
      delimitedString = defaults.parse(string);
      defaults.initString = delimitedString;
      retObj.array = delimitedString.split(defaults.delimiter);
    }
    defaults.deleteDuplicates();
  })(arguments);
  return retObj;
};

OJ.register('delimitedString', delimitedString);

module.exports = delimitedString;


},{"../oj":58}],14:[function(require,module,exports){
(function (global){
var Node, OJ, _, body, ojBody;

OJ = require('../oj');

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

Node = require('./node');


/*
Persist a handle on the body node
 */

if (typeof document !== 'undefined') {
  body = document.body;
} else {
  body = null;
}

ojBody = new Node;

ojBody.element = body;

OJ.register('body', ojBody);

module.exports = ojBody;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58,"./node":21}],15:[function(require,module,exports){
var OJ, component, nodeFactory, obj;

OJ = require('../oj');

nodeFactory = require('./nodeFactory');

obj = require('../core/object');

component = function(options, owner, tagName) {
  var ret, rootNodeType, widget;
  if (options == null) {
    options = obj.object();
  }
  if (!tagName.startsWith('x-')) {
    tagName = 'x-' + tagName;
  }
  widget = nodeFactory(tagName, obj.object(), owner, false);
  rootNodeType = options.rootNodeType || OJ['DEFAULT_COMPONENT_ROOT_NODETYPE'] || 'div';
  ret = widget.make(rootNodeType, options);
  ret.componentName = tagName;
  ret.remove = widget.remove;
  return ret;
};

OJ.register('component', component);

module.exports = component;


},{"../core/object":11,"../oj":58,"./nodeFactory":22}],16:[function(require,module,exports){
var OJ, control, nodeFactory, obj;

OJ = require('../oj');

nodeFactory = require('./nodeFactory');

obj = require('../core/object');


/*
Create a set of HTML Elements through ThinDom
 */

control = function(options, owner, tagName) {
  var ret, rootNodeType;
  if (options == null) {
    options = obj.object();
  }
  if (!tagName.startsWith('y-')) {
    tagName = 'y-' + tagName;
  }
  rootNodeType = options.rootNodeType || OJ['DEFAULT_COMPONENT_ROOT_NODETYPE'] || 'div';
  ret = nodeFactory(rootNodeType, options, owner, false);
  ret.add('controlName', tagName);
  return ret;
};

OJ.register('control', control);

module.exports = control;


},{"../core/object":11,"../oj":58,"./nodeFactory":22}],17:[function(require,module,exports){
(function (global){
var $, Node, OJ, ThinDOM, _, element;

OJ = require('../oj');

$ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

Node = require('./node');

ThinDOM = (typeof window !== "undefined" ? window['ThinDOM'] : typeof global !== "undefined" ? global['ThinDOM'] : null);

element = {

  /*
  Restore an HTML Element through ThinDom
   */
  restoreElement: function(el, tag) {
    var node;
    if (tag == null) {
      tag = el.nodeName;
    }
    el.ofWrapper || (node = new Node);
    node.element = el;
    return node;
  }
};

OJ.register('restoreElement', element.restoreElement);

OJ.register('isElementInDom', function(elementId) {
  return false === OJ.is.nullOrEmpty(OJ.getElement(elementId));
});

OJ.register('getElement', function(id) {
  if (typeof document !== 'undefined') {
    return document.getElementById(id);
  }
});

module.exports = element;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58,"./node":21}],18:[function(require,module,exports){
var OJ, fragment, nodeFactory;

OJ = require('../oj');

nodeFactory = require('./nodeFactory');

fragment = function() {
  var frag, ret;
  ret = null;
  if (typeof document !== 'undefined') {
    fragment = document.createDocumentFragment();
    frag = new ThinDOM(null, null, fragment);
    frag.isInDOM = true;
    ret = nodeFactory(frag);
  }
  return ret;
};

OJ.register('fragment', fragment);

module.exports = fragment;


},{"../oj":58,"./nodeFactory":22}],19:[function(require,module,exports){
var OJ, all, closed, exports, fn, i, len, loopName, nodeFactory, obj, open;

OJ = require('../oj');

require('../ojInit');

obj = require('../core/object');

nodeFactory = require('./nodeFactory');

closed = ['abbr', 'acronym', 'applet', 'article', 'aside', 'audio', 'b', 'bdo', 'big', 'blockquote', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'html', 'i', 'iframe', 'ins', 'kbd', 'label', 'legend', 'li', 'map', 'mark', 'menu', 'meter', 'nav', 'noframes', 'noscript', 'object', 'optgroup', 'option', 'output', 'p', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'small', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'tbody', 'td', 'tfoot', 'th', 'time', 'title', 'tr', 'tt', 'u', 'var', 'video', 'xmp'];

open = 'area base col command css embed hr img keygen meta param source track wbr'.split(' ');

all = closed.concat(open);

exports = {};

fn = function(tag) {
  var method;
  method = function(options, owner, calledFromFactory) {
    var defaults, ret;
    if (owner == null) {
      owner = OJ.body;
    }
    if (calledFromFactory == null) {
      calledFromFactory = false;
    }
    defaults = {
      props: {},
      styles: {},
      events: {}
    };
    obj.extend(defaults, options);
    ret = nodeFactory(tag, defaults, owner, calledFromFactory);
    return ret;
  };
  method.defaultBehavior = true;
  OJ.nodes.register(tag, method);
  return exports[tag] = method;
};
for (i = 0, len = all.length; i < len; i++) {
  loopName = all[i];
  fn(loopName);
}

module.exports = exports;


},{"../core/object":11,"../oj":58,"../ojInit":59,"./nodeFactory":22}],20:[function(require,module,exports){
var OJ, input;

OJ = require('../oj');


/*
Create an OJ Input Object through OJ.nodes.input
 */

input = function(options, owner) {
  var ret;
  if (options == null) {
    options = OJ.object();
  }
  if (!owner) {
    throw new Error('Cannot create an input without a parent');
  }
  if (!options.props || !options.props.type) {
    throw new Error('Cannot create an input without an input type');
  }
  ret = owner.make('input', options);
  ret.add('inputName', options.props.type);
  return ret;
};

OJ.register('input', input);

module.exports = input;


},{"../oj":58}],21:[function(require,module,exports){
(function (global){
var $, Node, OJ, methods;

OJ = require('../oj');

$ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

methods = {};

Node = (function() {
  function Node(parent) {}

  Node.prototype.make = function(tagName, options) {
    var method, newOJNode;
    if (tagName.make) {
      return tagName.make(this, options);
    } else {
      method = methods[tagName];
      if (method) {
        return method(options);
      } else {
        method = OJ.nodes[tagName] || OJ.components[tagName] || OJ.controls[tagName] || OJ.inputs[tagName];
        if (method && !method.defaultBehavior) {
          return method(options, this);
        } else {
          newOJNode = new Node();
          newOJNode.element = ojCreateElement(this.element, tagName, options);
          return newOJNode;
        }
      }
    }
  };

  Node.prototype.add = function(name, value) {
    this[name] = value;
    return this.element.ojWrapper = this;
  };

  Node.prototype.get = function(name) {
    var parent, value;
    value = this[name];
    if (value === void 0) {
      parent = this.element;
      while (parent = parent.parentNode) {
        if (parent.ojWrapper) {
          return parent.ojWrapper.get(name);
        }
      }
    } else {
      return value;
    }
  };

  Node.prototype.show = function() {
    this.$.show();
    return ojCreateElement.onShow(this.element);
  };

  Node.prototype.disable = function() {
    this.$.attr('disabled', 'disabled');
    return this.$.addClass('disabled', 'disabled');
  };

  Node.prototype.enable = function() {
    this.$.removeAttr('disabled');
    return this.$.removeClass('disabled');
  };

  return Node;

})();

['on', 'empty', 'text', 'removeClass', 'addClass', 'hasClass', 'hide', 'attr', 'removeAttr', 'css', 'remove', 'append', 'val', 'html', 'prop', 'trigger'].forEach(function(method) {
  return Node.prototype[method] = function() {
    var jQueryWrapper;
    jQueryWrapper = this.$;
    return jQueryWrapper[method].apply(jQueryWrapper, arguments);
  };
});

Object.defineProperty(Node.prototype, '$', {
  get: function() {
    var jQueryWrapper;
    jQueryWrapper = $(this.element);
    Object.defineProperty(this, '$', {
      value: jQueryWrapper
    });
    return jQueryWrapper;
  }
});

module.exports = OJ.Node = Node;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58}],22:[function(require,module,exports){
(function (global){
var Node, NodeFactory, OJ, ThinDOM, _, defaultCreateElement, getNodeFromFactory, make,
  slice = [].slice;

OJ = require('../oj');

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

ThinDOM = (typeof window !== "undefined" ? window['ThinDOM'] : typeof global !== "undefined" ? global['ThinDOM'] : null);

Node = require('./node');

NodeFactory = (function() {
  NodeFactory.prototype.ojNode = null;

  NodeFactory.get = function(id, tagName) {
    var el, ret, thinEl;
    if (tagName == null) {
      tagName = 'div';
    }
    ret = null;
    el = document.getElementById(id);
    if (el) {
      thinEl = OJ.restoreElement(el, tagName);
    }
    if (thinEl) {
      ret = new NodeFactory(null, null, null, false, thinEl);
    }
    return ret;
  };

  NodeFactory.prototype._makeAdd = function(tagName, count) {
    return (function(_this) {
      return function(opts) {
        var method, nu;
        method = OJ.nodes[tagName] || OJ.components[tagName] || OJ.controls[tagName] || OJ.inputs[tagName];
        if (method) {
          nu = method(opts, _this.ojNode);
        } else {
          nu = OJ.component(null, _this.ojNode, tagName);
        }
        return nu;
      };
    })(this);
  };

  NodeFactory.prototype._makeUniqueId = function(count) {
    var id;
    if (OJ.GENERATE_UNIQUE_IDS) {
      count += 1;
      if (count <= this.owner.count) {
        count = this.owner.count + 1;
      }
      this.owner.count = count;
      if (!this.ojNode.getId()) {
        id = this.owner.getId() || '';
        id += this.ojNode.tagName + count;
        this.ojNode.attr('id', id);
      }
    }
  };

  NodeFactory.prototype._bindEvents = function() {
    if (this.ojNode) {
      return _.forOwn(this.options.events, (function(_this) {
        return function(val, key) {
          var callback, isMethod;
          isMethod = require('../tools/is');
          if (isMethod.method(val)) {
            callback = function() {
              var event;
              event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
              return val.apply(null, event);
            };
            _this.ojNode.$.on(key, callback);
            _this.ojNode.add(key, callback);
            return null;
          }
        };
      })(this));
    }
  };

  function NodeFactory(tag1, options1, owner1, thinNode) {
    this.tag = tag1;
    this.options = options1;
    this.owner = owner1;
    this.thinNode = thinNode != null ? thinNode : null;
    if (this.tag && !this.thinNode) {
      this.thinNode = new ThinDOM(this.tag, this.options.props);
      this.thinNode.add('tagName', this.tag);
      this.thinNode.css(this.options.styles);
      if (this.options.text) {
        this.thinNode.text(this.options.text);
      }
    }
    if (this.owner) {
      this.make();
    }
  }

  NodeFactory.prototype.addMakeMethod = function(count) {
    var methods;
    methods = OJ.object();
    this.ojNode.make = (function(_this) {
      return function(tagName, opts) {
        var method;
        method = methods[tagName];
        if (!method) {
          method = _this._makeAdd(tagName, _this.ojNode, count);
          methods[tagName] = method;
        }
        return method(opts);
      };
    })(this);
    return this.ojNode;
  };

  NodeFactory.prototype.make = function() {
    var count, finalize, ref;
    this.ojNode = null;
    if ((ref = this.thinNode) != null ? ref.isFullyInit : void 0) {
      this.ojNode = this.thinNode;
    } else {
      this.ojNode = new Node(this.thinNode, this.owner);
      count = (this.owner.count + 1) || 1;
      if (this.thinNode.tagName !== 'body' && !this.thinNode.isInDOM && !this.ojNode.isInDOM) {
        this._makeUniqueId(count);
        this.owner.append(this.ojNode[0]);
        this._bindEvents();
      }
      this.thinNode.isInDOM = true;
      this.ojNode.isInDOM = true;
      this.addMakeMethod(count);
      this.ojNode.isFullyInit = true;
      finalize = _.once(this.ojNode.finalize || OJ.noop);
      this.ojNode.finalize = finalize;
      finalize(this.ojNode);
    }
    return this.ojNode;
  };

  return NodeFactory;

})();

defaultCreateElement = function(parent, tag, options) {
  var key, newElement, ref, ref1, ref2, value;
  newElement = document.createElement(tag);
  if (options) {
    ref = options.props;
    for (key in ref) {
      value = ref[key];
      newElement.setAttribute(key, value);
    }
    ref1 = options.events;
    for (key in ref1) {
      value = ref1[key];
      $(newElement).on(key, value);
    }
    ref2 = options.styles;
    for (key in ref2) {
      value = ref2[key];
      $(newElement).css(key, value);
    }
    value = options.text;
    if (value !== void 0) {
      $(newElement).text(value);
    }
  }
  return parent != null ? parent.appendChild(newElement) : void 0;
};

getNodeFromFactory = function(tag, options, owner, isCalledFromFactory, node) {
  var newOJNode;
  newOJNode = new Node();
  if (!window.ojCreateElement) {
    window.ojCreateElement = defaultCreateElement;
  }
  newOJNode.element = ojCreateElement(owner.element, tag || 'div', options);
  return newOJNode;
};

OJ.register('nodeFactory', getNodeFromFactory);

make = function(tag, options) {
  var newOJNode;
  newOJNode = new Node();
  newOJNode.element = ojCreateElement(null, tag || 'div', options);
  return newOJNode;
};

OJ.register('make', make);

module.exports = getNodeFromFactory;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58,"../tools/is":67,"./node":21}],23:[function(require,module,exports){
var OJ, node, nodeFactory, nodeName,
  slice = [].slice;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

nodeName = 'a';

node = function(options, owner, calledFromFactory) {
  var click, defaults, newClick, ret, toggle, toggleState;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {
      id: '',
      "class": '',
      text: '',
      href: 'javaScript:void(0);',
      type: '',
      title: '',
      rel: '',
      media: '',
      target: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  toggleState = 'off';
  toggle = function() {
    if (toggleState === 'on') {
      toggleState = 'off';
    } else {
      if (toggleState === 'off') {
        toggleState = 'on';
      }
    }
  };
  if (defaults.events.click !== OJ.noop) {
    click = defaults.events.click;
    newClick = function() {
      var event, retVal;
      event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      toggle();
      retVal = click.apply(null, event);
      if (defaults.href === '#') {
        retVal = false;
      }
      return retVal;
    };
    defaults.events.click = newClick;
  } else {
    defaults.events.click = toggle;
  }
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58}],24:[function(require,module,exports){
var OJ, node, nodeFactory, nodeName, to;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

to = require('../tools/to');

nodeName = 'br';

node = function(options, owner, calledFromFactory) {
  var defaults, i, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {},
    styles: {},
    events: {
      click: OJ.noop
    },
    number: 1
  };
  OJ.extend(defaults, options, true);
  i = 0;
  while (i < to.number(defaults.number)) {
    ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
    i += 1;
  }
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58,"../tools/to":72}],25:[function(require,module,exports){
var OJ, node, nodeFactory, nodeName;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

nodeName = 'form';

node = function(options, owner, calledFromFactory) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {
      action: '',
      method: '',
      name: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  ret.add('validator', ret.$.validate({
    highlight: function(element) {
      var $elm;
      $elm = $(element);
      $elm.attr('OJ_invalid', '1');
      $elm.animate({
        backgroundColor: 'red'
      });
      return null;
    },
    unhighlight: function(element) {
      var $elm;
      $elm = $(element);
      if ($elm.attr('OJ_invalid') === '1') {
        $elm.css('background-color', 'yellow');
        $elm.attr('OJ_invalid', '0');
        setTimeout((function() {
          return $elm.animate({
            backgroundColor: 'transparent'
          });
        }), 500);
      }
      return null;
    }
  }));
  ret.add('isFormValid', function() {
    return ret.$.valid() && (!ret.validator.invalidElements() || ret.validator.invalidElements().length === 0);
  });
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58}],26:[function(require,module,exports){
var OJ, enums, node, nodeFactory, nodeName,
  slice = [].slice;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

enums = require('../tools/enums');

nodeName = 'input';

node = function(options, owner, calledFromFactory) {
  var defaults, newChange, newClick, newFocusout, oldChange, oldClick, oldFocusout, ret, syncValue, thisType;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {
      type: 'text',
      value: ''
    },
    styles: {},
    events: {
      click: OJ.noop,
      change: OJ.noop,
      focusout: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  if (!defaults.props.type || !enums.inputTypes[defaults.props.type]) {
    throw new Error('No matching input type for {' + defaults.props.type + '} could be found.');
  }
  thisType = enums.inputTypes[defaults.props.type];
  syncValue = function() {
    switch (thisType) {
      case enums.inputTypes.checkbox:
        ret.value = ret.$.is(':checked');
        break;
      case enums.inputTypes.radio:
        ret.value = ret.$.find(':checked').val();
        break;
      default:
        ret.value = ret.val();
    }
    defaults.props.value = ret.value;
    return ret.value;
  };

  /*
    Click binding. If the caller defined a click handler,
    wrap it, sync the value of the input first,
    then call the defined click handler with the latest value.
   */
  oldClick = defaults.events.click;
  if (oldClick && oldClick !== OJ.noop) {
    newClick = function() {
      var event;
      event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      syncValue();
      return oldClick.apply(null, [ret.value].concat(slice.call(event)));
    };
    defaults.events.click = newClick;
  }

  /*
    Change binding. If the caller defined a change handler,
    wrap it, sync the value of the input first,
    then call the defined change handler with the latest value.
   */
  oldChange = defaults.events.change;
  if (oldChange && oldChange !== OJ.noop) {
    newChange = function() {
      var event;
      event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      syncValue();
      return oldChange.apply(null, [ret.value].concat(slice.call(event)));
    };
    defaults.events.change = newChange;
  }

  /*
    On Focus Out binding. Always use the event to update the internal
    value of the control; and if the caller defined a focusout event,
    wrap it and invoke it with the latest value
   */
  oldFocusout = defaults.events.focusout;
  newFocusout = function() {
    var event;
    event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    syncValue();
    if (oldFocusout && oldFocusout !== OJ.noop) {
      return oldFocusout.apply(null, [ret.value].concat(slice.call(event)));
    }
  };
  defaults.events.focusout = newFocusout;
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  ret.value = defaults.props.value;
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58,"../tools/enums":66}],27:[function(require,module,exports){
var OJ, node, nodeFactory, nodeName;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

nodeName = 'ol';

node = function(options, owner, calledFromFactory) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {},
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58}],28:[function(require,module,exports){
var OJ, node, nodeFactory, nodeName,
  slice = [].slice;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

nodeName = 'select';

node = function(options, owner, calledFromFactory) {
  var change, click, defaults, hasEmpty, newChange, newClick, ret, syncValue, value, values;
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {
      selected: '',
      multiple: false
    },
    styles: {},
    values: [],
    events: {
      click: OJ.noop,
      change: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  value = '';
  values = [];
  hasEmpty = false;
  syncValue = function() {
    return value = ret.val();
  };
  if (defaults.events.click !== OJ.noop) {
    click = defaults.events.click;
    newClick = function() {
      var event, retval;
      event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      retval = click.apply(null, event);
      syncValue();
      return retval;
    };
    defaults.events.click = newClick;
  }
  if (defaults.events.change !== OJ.noop) {
    change = defaults.events.change;
    newChange = function() {
      var event, retval;
      event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      retval = change.apply(null, event);
      syncValue();
      return retval;
    };
    defaults.events.change = newChange;
  }
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  ret.add('selectedData', function(propName) {
    var dataset;
    ret = '';
    if (ret.$.find('option:selected') && ret.$.find('option:selected')[0]) {
      dataset = ret.$.find('option:selected')[0].dataset;
      if (dataset) {
        ret = dataset[propName];
      }
    }
    return ret;
  });
  ret.add('selectedText', function() {
    return ret.$.find('option:selected').text();
  });
  ret.add('selectedVal', function() {
    value = ret.val();
    return value;
  });
  ret.add('addOption', function(value, text, selected, disabled) {
    var add, isEmpty, option, val;
    if (text == null) {
      text = value;
    }
    if (selected == null) {
      selected = false;
    }
    if (disabled == null) {
      disabled = false;
    }
    isEmpty = _.isEmpty(value);
    add = false;
    if (isEmpty && false === hasEmpty) {
      hasEmpty = true;
      add = true;
    }
    if (false === add && false === isEmpty) {
      add = true;
    }
    if (add) {
      val = {
        text: text,
        props: {
          value: value
        }
      };
      if (selected) {
        val.selected = selected;
      }
      if (disabled) {
        val.disabled = disabled;
      }
      option = ret.make('option', val);
      return option;
    }
  });
  ret.add('addOptions', function(options) {
    values = _.union(values, options);
    OJ.each(options, (function(val) {
      value = ret.addOption(val);
      return values.push(value);
    }), false);
    return values;
  });
  ret.add('resetOptions', function(values) {
    ret.empty();
    values = values;
    ret.addOptions(values);
    return ret;
  });
  ret.add('removeOption', function(valueToRemove) {
    var i, selectControl;
    values.splice(values.indexOf(valueToRemove), 1);
    selectControl = ret[0];
    i = 0;
    while (i < selectControl.length) {
      if (selectControl.options[i].value === valueToRemove) {
        selectControl.remove(i);
      }
      i++;
    }
    return null;
  });
  if (defaults.values.length > 0) {
    ret.addOptions(defaults.values);
  }
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58}],29:[function(require,module,exports){
(function (global){
var $, JsonToTable, OJ, _, array2D, node, nodeFactory, nodeName;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

array2D = require('../tools/array2D');

$ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

JsonToTable = require('../tools/JsonToTable');

nodeName = 'table';


/*
Create an HTML table. Provides helper methods to create Columns and Cells.
 */

node = function(options, owner, calledFromFactory) {
  var cells, columnCount, defaults, fillMissing, init, loadCells, ret, rows, tbody, thead, theadRow;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    data: null,
    props: {
      cellpadding: 0,
      cellspacing: 0,
      align: '',
      width: '',
      cellalign: 'left',
      cellvalign: 'top',
      "class": ''
    },
    styles: {},
    events: {},
    cells: {
      "class": '',
      align: '',
      'vertical-align': '',
      cellpadding: '',
      margin: ''
    },
    thead: {},
    tbody: {},
    firstAlignRight: false,
    oddAlignRight: false
  };
  rows = [];
  cells = array2D();
  columnCount = 0;
  OJ.extend(defaults, options, true);
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  tbody = null;
  thead = null;
  theadRow = null;
  init = _.once(function() {
    var j2t, jBody, jHead, jTbl, tblStr;
    if (defaults.data) {
      j2t = new JsonToTable(defaults.data);
      tblStr = j2t.table;
    }
    if (tblStr) {
      jTbl = $(tblStr);
      jHead = jTbl.find('thead');
      ret.$.append(jHead);
      thead = el.restoreElement(jHead[0]);
      theadRow = el.restoreElement(thead[0].rows[0]);
      jBody = jTbl.find('tbody');
      ret.$.append(jBody);
      tbody = el.restoreElement(jBody[0]);
      loadCells();
    } else {
      thead = ret.make('thead', defaults.thead);
      theadRow = thead.make('tr');
      tbody = ret.make('tbody', defaults.tbody);
      rows.push(tbody.make('tr'));
    }
    return ret;
  });
  loadCells = function() {
    var c, memCell, memRow, r, results;
    r = 0;
    results = [];
    while (tbody[0].rows.length > r) {
      c = 0;
      memRow = el.restoreElement(tbody[0].rows[r]);
      rows.push(memRow);
      while (tbody[0].rows[r].cells.length > c) {
        memCell = cells.get(r + 1, c + 1);
        if (!memCell) {
          memCell = el.restoreElement(tbody[0].rows[r].cells[c]);
          cells.set(r + 1, c + 1, memCell);
        }
        c += 1;
      }
      results.push(r += 1);
    }
    return results;
  };
  fillMissing = function() {
    return cells.each(function(rowNo, colNo, val) {
      var row;
      if (!val) {
        row = ret.row(rowNo);
        return row.cell(colNo, {});
      }
    });
  };
  ret.add('column', function(colNo, colName) {
    var i, nativeTh, th;
    ret.init();
    columnCount += 1;
    th = null;
    i = 0;
    while (thead[0].rows[0].cells.length < colNo) {
      nativeTh = thead[0].rows[0].cells[i];
      if (!nativeTh) {
        th = theadRow.make('th', {});
      } else {
        th = el.restoreElement(nativeTh, 'th');
      }
      i += 1;
    }
    if (!th) {
      nativeTh = thead[0].rows[0].cells[colNo - 1];
      th = el.restoreElement(nativeTh, 'th');
    }
    th.text(colName);
    return th;
  });
  ret.add('row', function(rowNo, opts) {
    var row;
    row = rows[rowNo - 1];
    if (!row) {
      while (rows.length < rowNo) {
        row = tbody.make('tr', {});
        rows.push(row);
      }
    }
    if (!row.cell) {
      row.add('cell', function(colNo, opts) {
        var cell;
        cell = OJ.nodes.td(opts, row);
        cells.set(rowNo, colNo, cell);
        return cell;
      });
    }
    return row;
  });
  ret.add('cell', function(rowNo, colNo, opts) {
    var cell, i, nuOpts, row, tryCell;
    if (rowNo < 1) {
      rowNo = 1;
    }
    if (colNo < 1) {
      colNo = 1;
    }
    if (columnCount > 0 && colNo - 1 > columnCount) {
      throw new Error('A column name has not been defined for this position {' + rowNo + 'x' + colNo + '}.');
    }
    row = ret.row(rowNo);
    cell = cells.get(rowNo, colNo);
    if (!cell) {
      i = 0;
      while (i < colNo) {
        i += 1;
        if (i === colNo) {
          nuOpts = OJ.extend({
            props: defaults.cells
          }, opts);
          cell = row.cell(colNo, nuOpts);
        } else {
          tryCell = cells.get(rowNo, i);
          if (!tryCell) {
            tryCell = row.cell(i, {
              props: defaults.cells
            });
          }
        }
      }
    }
    return cell;
  });
  init();
  ret.add('thead', thead);
  ret.add('tbody', tbody);
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../dom/nodeFactory":22,"../oj":58,"../tools/JsonToTable":60,"../tools/array2D":61}],30:[function(require,module,exports){
var OJ, enums, node, nodeFactory, nodeName,
  slice = [].slice;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

enums = require('../tools/enums');

nodeName = 'textarea';

node = function(options, owner, calledFromFactory) {
  var change, click, defaults, newChange, newClick, ret, syncValue, value;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {
      name: '',
      placeholder: '',
      value: '',
      text: '',
      maxlength: '',
      autofocus: false,
      isRequired: false,
      rows: 3,
      cols: 25,
      disabled: false,
      readonly: false,
      form: '',
      wrap: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  value = defaults.props.value;
  syncValue = function() {
    switch (defaults.props.type) {
      case enums.inputTypes.checkbox:
        return value = ret.$.is(':checked');
      case enums.inputTypes.radio:
        return value = ret.$.find(':checked').val();
      default:
        return value = ret.val();
    }
  };
  if (defaults.events.click !== OJ.noop) {
    click = defaults.events.click;
    newClick = function() {
      var event, retval;
      event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      retval = click.apply(null, event);
      syncValue();
      return retval;
    };
    defaults.events.click = newClick;
  }
  if (defaults.events.change !== OJ.noop) {
    change = defaults.events.change;
    newChange = function() {
      var event, retval;
      event = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      retval = change.apply(null, event);
      syncValue();
      return retval;
    };
    defaults.events.change = newChange;
  }
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58,"../tools/enums":66}],31:[function(require,module,exports){
var OJ, node, nodeFactory, nodeName;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

nodeName = 'thead';

node = function(options, owner, calledFromFactory) {
  var cells, defaults, ret, rows;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {},
    styles: {},
    events: {
      click: OJ.noop
    },
    number: 1
  };
  OJ.extend(defaults, options, true);
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  rows = [];
  cells = {};
  ret.add('cell', function(rowNo, colNo) {
    var cell, idx, row, td;
    init();
    if (rowNo < 1) {
      rowNo = 1;
    }
    if (colNo < 1) {
      colNo = 1;
    }
    row = rows[rowNo - 1];
    if (!row) {
      while (rows.length < rowNo) {
        row = OJ.nodes.tr({}, tbody, false);
        rows.push(row);
      }
    }
    td = row[0].cells[colNo];
    if (td) {
      cell = el.restoreElement(td, 'td');
    }
    if (!td) {
      while (row[0].cells.length < colNo) {
        idx = row[0].cells.length;
        td = row[0].cells[idx - 1];
        if (td && idx === colNo) {
          cell = el.restoreElement(td, 'td');
        } else {
          cell = OJ.nodes.td({
            props: defaults.cells
          }, row, false);
        }
      }
    }
    if (!cell.isValid) {
      nodeFactory(cell, row, rowNo + colNo);
    }
    return cell;
  });
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58}],32:[function(require,module,exports){
var OJ, node, nodeFactory, nodeName;

OJ = require('../oj');

nodeFactory = require('../dom/nodeFactory');

nodeName = 'ul';

node = function(options, owner, calledFromFactory) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  if (calledFromFactory == null) {
    calledFromFactory = false;
  }
  defaults = {
    props: {},
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = nodeFactory(nodeName, defaults, owner, calledFromFactory);
  return ret;
};

OJ.nodes.register(nodeName, node);

module.exports = node;


},{"../dom/nodeFactory":22,"../oj":58}],33:[function(require,module,exports){
require('./oj');

require('./ojInit');

require('./async/ajax');

require('./async/promise');

require('./components/grid');

require('./components/inputgroup');

require('./components/tabs');

require('./components/tile');

require('./controls/icon');

require('./core/date');

require('./core/function');

require('./core/number');

require('./core/object');

require('./core/string');

require('./dom/nodeFactory');

require('./dom/body');

require('./dom/component');

require('./dom/control');

require('./dom/node');

require('./dom/element');

require('./dom/fragment');

require('./dom/generics');

require('./dom/input');

require('./elements/a');

require('./elements/br');

require('./elements/form');

require('./elements/input');

require('./elements/ol');

require('./elements/select');

require('./elements/table');

require('./elements/textarea');

require('./elements/thead');

require('./elements/ul');

require('./inputs/buttoninput');

require('./inputs/checkbox');

require('./inputs/color');

require('./inputs/date');

require('./inputs/datetime');

require('./inputs/datetimelocal');

require('./inputs/email');

require('./inputs/file');

require('./inputs/hidden');

require('./inputs/imageinput');

require('./inputs/month');

require('./inputs/number');

require('./inputs/password');

require('./inputs/radio');

require('./inputs/range');

require('./inputs/reset');

require('./inputs/search');

require('./inputs/submit');

require('./inputs/tel');

require('./inputs/textinput');

require('./inputs/time');

require('./inputs/url');

require('./inputs/week');

require('./tools/array2D');

require('./tools/console');

require('./tools/cookie');

require('./tools/defer');

require('./tools/each');

require('./tools/enums');

require('./tools/is');

require('./tools/noty');

require('./tools/pubsub');

require('./tools/queryString');

require('./tools/ranges');

require('./tools/to');

require('./tools/uuid');


},{"./async/ajax":1,"./async/promise":2,"./components/grid":3,"./components/inputgroup":4,"./components/tabs":5,"./components/tile":6,"./controls/icon":7,"./core/date":8,"./core/function":9,"./core/number":10,"./core/object":11,"./core/string":13,"./dom/body":14,"./dom/component":15,"./dom/control":16,"./dom/element":17,"./dom/fragment":18,"./dom/generics":19,"./dom/input":20,"./dom/node":21,"./dom/nodeFactory":22,"./elements/a":23,"./elements/br":24,"./elements/form":25,"./elements/input":26,"./elements/ol":27,"./elements/select":28,"./elements/table":29,"./elements/textarea":30,"./elements/thead":31,"./elements/ul":32,"./inputs/buttoninput":35,"./inputs/checkbox":36,"./inputs/color":37,"./inputs/date":38,"./inputs/datetime":39,"./inputs/datetimelocal":40,"./inputs/email":41,"./inputs/file":42,"./inputs/hidden":43,"./inputs/imageinput":44,"./inputs/month":45,"./inputs/number":46,"./inputs/password":47,"./inputs/radio":48,"./inputs/range":49,"./inputs/reset":50,"./inputs/search":51,"./inputs/submit":52,"./inputs/tel":53,"./inputs/textinput":54,"./inputs/time":55,"./inputs/url":56,"./inputs/week":57,"./oj":58,"./ojInit":59,"./tools/array2D":61,"./tools/console":62,"./tools/cookie":63,"./tools/defer":64,"./tools/each":65,"./tools/enums":66,"./tools/is":67,"./tools/noty":68,"./tools/pubsub":69,"./tools/queryString":70,"./tools/ranges":71,"./tools/to":72,"./tools/uuid":73}],34:[function(require,module,exports){
(function (global){
var thisGlobal;

thisGlobal = (typeof global !== 'undefined' && global ? global : (typeof self !== 'undefined' && self ? self : (typeof window !== 'undefined' && window ? window : this)));

module.exports = thisGlobal;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],35:[function(require,module,exports){
var OJ, inpt, input, inputName, obj;

OJ = require('../oj');

obj = require('../core/object');

input = require('../dom/input');

inputName = 'buttoninput';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: 'button',
      src: '',
      alt: '',
      height: '',
      width: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  obj.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../oj":58}],36:[function(require,module,exports){
var OJ, inpt, input, inputName, obj;

OJ = require('../oj');

obj = require('../core/object');

input = require('../dom/input');

inputName = 'checkbox';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    checked: false,
    indeterminate: false,
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  obj.extend(defaults, options, true);
  ret = input(defaults, owner);
  if (defaults.checked) {
    ret.attr('checked', true);
  } else if (defaults.indeterminate) {
    ret.attr('indeterminate', true);
  }
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../oj":58}],37:[function(require,module,exports){
var OJ, inpt, input, inputName, obj;

OJ = require('../oj');

obj = require('../core/object');

input = require('../dom/input');

inputName = 'color';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  obj.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../oj":58}],38:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

input = require('../dom/input');

inputName = 'date';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../oj":58}],39:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'datetime';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],40:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'datetime-local';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],41:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'email';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName,
      multiple: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],42:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'file';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName,
      accept: '',
      multiple: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],43:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'hidden';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],44:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'imageinput';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: 'image',
      src: '',
      alt: '',
      height: '',
      width: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],45:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'month';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],46:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'number';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],47:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'password';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName,
      maxlength: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],48:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'radio';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName,
      name: '',
      value: '',
      checked: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],49:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'range';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName,
      min: 0,
      max: 100,
      value: 50,
      step: 1
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],50:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'reset';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],51:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'search';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],52:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'submit';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],53:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'tel';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName,
      pattern: '',
      maxlength: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],54:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'textinput';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: 'text',
      autocomplete: 'on',
      autosave: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],55:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'time';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],56:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'url';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName,
      pattern: '',
      maxlength: ''
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],57:[function(require,module,exports){
var OJ, inpt, input, inputName;

OJ = require('../oj');

require('../core/object');

require('../dom/nodeFactory');

input = require('../dom/input');

inputName = 'week';

inpt = function(options, owner) {
  var defaults, ret;
  if (owner == null) {
    owner = OJ.body;
  }
  defaults = {
    props: {
      type: inputName
    },
    styles: {},
    events: {
      click: OJ.noop
    }
  };
  OJ.extend(defaults, options, true);
  ret = input(defaults, owner);
  return ret;
};

OJ.inputs.register(inputName, inpt);

module.exports = inpt;


},{"../core/object":11,"../dom/input":20,"../dom/nodeFactory":22,"../oj":58}],58:[function(require,module,exports){
(function (global){
var NsTree, makeTheJuice, nameSpaceName, thisDocument, thisGlobal, utilLib;

thisGlobal = require('./global');

utilLib = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

nameSpaceName = 'OJ';


/*
boot strap name method into Object prototype
 */

Object.defineProperties(Object.prototype, {
  getInstanceName: {
    value: function() {
      var funcNameRegex, results;
      funcNameRegex = /function (.{1,})\(/;
      results = funcNameRegex.exec(this.constructor.toString());
      if (results && results.length > 1) {
        return results[1];
      } else {
        return '';
      }
    }
  }
});


/*
An internal representation of the namespace tree
 */

NsTree = {};

makeTheJuice = function() {

  /*
  Internal nameSpaceName method to create new 'sub' namespaces on arbitrary child objects.
   */
  var NsOut, dependsOn, makeNameSpace, nsInternal;
  makeNameSpace = function(spacename, tree) {

    /*
    The derived instance to be constructed
     */
    var Base, Class;
    Base = function(nsName) {
      var members, nsTree, proto;
      proto = this;
      tree[nsName] = tree[nsName] || {};
      nsTree = tree[nsName];
      members = {};
      Object.defineProperty(this, 'members', {
        value: members

        /*
        Register (e.g. 'Lift') an Object into the prototype of the namespace.
        This Object will be readable/executable but is otherwise immutable.
         */
      });
      Object.defineProperty(this, 'register', {
        value: function(name, obj, enumerable) {
          'use strict';
          if ((typeof name !== 'string') || name === '') {
            throw new Error('Cannot lift a new property without a valid name.');
          }
          if (!obj) {
            throw new Error('Cannot lift a new property without a valid property instance.');
          }
          if (proto[name]) {
            throw new Error('Property named ' + name + ' is already defined on ' + spacename + '.');
          }
          members[name] = members[name] || name;
          nsTree[name] = nsTree[name] || {
            name: name,
            type: typeof obj,
            instance: (obj.getInstanceName ? obj.getInstanceName() : 'unknown')
          };
          Object.defineProperty(proto, name, {
            value: obj,
            enumerable: false !== enumerable
          });
          nsInternal.alertDependents(nsName + '.' + spacename + '.' + name);
          return obj;
        }
      });

      /*
      Create a new, static namespace on the current parent (e.g. nsName.to... || nsName.is...)
       */
      proto.register('makeSubNameSpace', (function(subNameSpace) {
        'use strict';
        var newNameSpace;
        if ((typeof subNameSpace !== 'string') || subNameSpace === '') {
          throw new Error('Cannot create a new sub namespace without a valid name.');
        }
        if (proto.subNameSpace) {
          throw new Error('Sub namespace named ' + subNameSpace + ' is already defined on ' + spacename + '.');
        }
        nsInternal.alertDependents(nsName + '.' + subNameSpace);
        newNameSpace = makeNameSpace(subNameSpace, nsTree);
        if (subNameSpace !== 'constants') {
          newNameSpace.register('constants', makeNameSpace('constants', nsTree), false);
        }
        proto.register(subNameSpace, newNameSpace, false);
        return newNameSpace;
      }), false);
    };

    /*
    An internal mechanism to represent the instance of this namespace
    @constructor
    @internal
    @memberOf makeNameSpace
     */
    Class = new Function('return function ' + spacename + '(){}')();
    Class.prototype = new Base(spacename);
    return new Class(spacename);
  };

  /*
  'Depend' an Object upon another member of this namespace, upon another namespace,
  or upon a member of another namespace
   */
  dependsOn = function(dependencies, callBack, imports) {
    'use strict';
    var missing, nsMembers, ret;
    ret = false;
    nsMembers = nsInternal.getNsMembers();
    if (dependencies && dependencies.length > 0 && callBack) {
      missing = dependencies.filter(function(depen) {
        return nsMembers.indexOf(depen) === -1 && (!imports || imports !== depen);
      });
      if (missing.length === 0) {
        ret = true;
        callBack();
      } else {
        nsInternal.dependents.push(function(imports) {
          return dependsOn(missing, callBack, imports);
        });
      }
    }
    return ret;
  };
  nsInternal = {
    dependents: []

    /*
    Fetches the registered properties and methods on the namespace and its child namespaces
     */
  };
  Object.defineProperty(nsInternal, 'getNsMembers', {
    value: function() {
      var members, recurseTree;
      recurseTree = function(key, lastKey) {
        if (typeof key === 'string') {
          members.push(lastKey + '.' + key);
        }
        if (utilLib.isPlainObject(key)) {
          Object.keys(key).forEach(function(k) {
            if (typeof k === 'string') {
              members.push(lastKey + '.' + k);
            }
            if (utilLib.isPlainObject(key[k])) {
              recurseTree(key[k], lastKey + '.' + k);
            }
          });
        }
      };
      members = [];
      Object.keys(NsTree[nameSpaceName]).forEach(function(key) {
        if (utilLib.isPlainObject(NsTree[nameSpaceName][key])) {
          recurseTree(NsTree[nameSpaceName][key], nameSpaceName);
        }
      });
      return members;
    }
  });

  /*
  To support dependency management, when a property is lifted onto the namespace, notify dependents to initialize
   */
  Object.defineProperty(nsInternal, 'alertDependents', {
    value: function(imports) {
      var deps;
      deps = nsInternal.dependents.filter(function(depOn) {
        return false === depOn(imports);
      });
      if (Array.isArray(deps)) {
        return nsInternal.dependents = deps;
      }
    }
  });
  NsTree[nameSpaceName] = {};
  NsOut = makeNameSpace(nameSpaceName, NsTree[nameSpaceName]);

  /*
  Cache a handle on the vendor (probably jQuery) on the root namespace
   */
  NsOut.register('?', utilLib, false);

  /*
  Cache the tree (useful for documentation/visualization/debugging)
   */
  NsOut.register('tree', NsTree[nameSpaceName], false);

  /*
  Cache the name space name
   */
  NsOut.register('name', nameSpaceName, false);
  NsOut.register('dependsOn', dependsOn, false);
  return NsOut;
};


/*
Actually define the OJ NameSpace
 */

Object.defineProperty(thisGlobal, nameSpaceName, {
  value: makeTheJuice()
});

OJ.register('global', thisGlobal);

thisDocument = {};

if (typeof document !== 'undefined') {
  thisDocument = document;
}

OJ.register('document', thisDocument);

OJ.register('noop', function() {});

module.exports = OJ;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./global":34}],59:[function(require,module,exports){
(function (global){
var OJ, _, subNameSpaces;

OJ = require('./oj');

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

subNameSpaces = ['errors', 'enums', 'instanceOf', 'nodes', 'db', 'components', 'controls', 'inputs', 'notifications', 'cookie', 'async'];

_.each(subNameSpaces, function(name) {
  return OJ.makeSubNameSpace(name);
});

OJ['GENERATE_UNIQUE_IDS'] = false;

OJ['DEFAULT_COMPONENT_ROOT_NODETYPE'] = 'div';

OJ['TRACK_ON_ERROR'] = false;

OJ['LOG_ALL_AJAX'] = false;

OJ['LOG_ALL_AJAX_ERRORS'] = false;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./oj":58}],60:[function(require,module,exports){

/*
Return just the keys from the input array, optionally only for the specified search_value
version: 1109.2015
discuss at: http://phpjs.org/functions/array_keys
+   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
+      input by: Brett Zamir (http://brett-zamir.me)
+   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
+   improved by: jd
+   improved by: Brett Zamir (http://brett-zamir.me)
+   input by: P
+   bugfixed by: Brett Zamir (http://brett-zamir.me)
example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
returns 1: {0: 'firstname', 1: 'surname'}
 */
var JsonToTable, array_keys;

array_keys = function(input, search_value, argStrict) {
  var include, key, search, strict, tmp_arr;
  search = typeof search_value !== "undefined";
  tmp_arr = [];
  strict = !!argStrict;
  include = true;
  key = "";
  if (input && typeof input === "object" && input.change_key_case) {
    return input.keys(search_value, argStrict);
  }
  for (key in input) {
    if (input.hasOwnProperty(key)) {
      include = true;
      if (search) {
        if (strict && input[key] !== search_value) {
          include = false;
        } else {
          if (input[key] !== search_value) {
            include = false;
          }
        }
      }
      if (include) {
        tmp_arr[tmp_arr.length] = key;
      }
    }
  }
  return tmp_arr;
};


/**
Convert a Javascript Oject array or String array to an HTML table
JSON parsing has to be made before function call
It allows use of other JSON parsing methods like jQuery.parseJSON
http(s)://, ftp://, file:// and javascript:; links are automatically computed

JSON data samples that should be parsed and then can be converted to an HTML table
var objectArray = '[{"Total":"34","Version":"1.0.4","Office":"New York"},{"Total":"67","Version":"1.1.0","Office":"Paris"}]';
var stringArray = '["New York","Berlin","Paris","Marrakech","Moscow"]';
var nestedTable = '[{ key1: "val1", key2: "val2", key3: { tableId: "tblIdNested1", tableClassName: "clsNested", linkText: "Download", data: [{ subkey1: "subval1", subkey2: "subval2", subkey3: "subval3" }] } }]';

Code sample to create a HTML table Javascript String
var jsonHtmlTable = ConvertJsonToTable(eval(dataString), 'jsonTable', null, 'Download');

Code sample explaned
- eval is used to parse a JSON dataString
- table HTML id attribute will be 'jsonTable'
- table HTML class attribute will not be added
- 'Download' text will be displayed instead of the link itself

@author Afshin Mehrabani <afshin dot meh at gmail dot com>

@class ConvertJsonToTable

@method ConvertJsonToTable

@param parsedJson object Parsed JSON data
@param tableId string Optional table id
@param tableClassName string Optional table css class name
@param linkText string Optional text replacement for link pattern

@return string Converted JSON to HTML table
 */

JsonToTable = (function() {
  JsonToTable.prototype.table = null;

  function JsonToTable(parsedJson, tableId, tableClassName, linkText) {
    var classMarkup, headers, i, idMarkup, isStringArray, isUrl, italic, j, javascriptRegExp, link, tb, tbCon, tbl, tdRow, th, thCon, thRow, tr, trCon, urlRegExp, value;
    italic = "<i>{0}</i>";
    link = (linkText ? "<a href=\"{0}\">" + linkText + "</a>" : "<a href=\"{0}\">{0}</a>");
    idMarkup = (tableId ? " id=\"" + tableId + "\"" : "");
    classMarkup = (tableClassName ? " class=\"" + tableClassName + "\"" : "");
    tbl = "<table border=\"1\" cellpadding=\"1\" cellspacing=\"1\"" + idMarkup + classMarkup + ">{0}{1}</table>";
    th = "<thead>{0}</thead>";
    tb = "<tbody>{0}</tbody>";
    tr = "<tr>{0}</tr>";
    thRow = "<th>{0}</th>";
    tdRow = "<td>{0}</td>";
    thCon = "";
    tbCon = "";
    trCon = "";
    if (parsedJson) {
      isStringArray = typeof parsedJson[0] === "string";
      headers = void 0;
      if (isStringArray) {
        thCon += thRow.format("value");
      } else {
        if (typeof parsedJson[0] === "object") {
          headers = array_keys(parsedJson[0]);
          i = 0;
          while (i < headers.length) {
            thCon += thRow.format(headers[i]);
            i++;
          }
        }
      }
      th = th.format(tr.format(thCon));
      if (isStringArray) {
        i = 0;
        while (i < parsedJson.length) {
          tbCon += tdRow.format(parsedJson[i]);
          trCon += tr.format(tbCon);
          tbCon = "";
          i++;
        }
      } else {
        if (headers) {
          urlRegExp = new RegExp(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/g);
          javascriptRegExp = new RegExp(/(^javascript:[\s\S]*;$)/g);
          i = 0;
          while (i < parsedJson.length) {
            j = 0;
            while (j < headers.length) {
              value = parsedJson[i][headers[j]];
              isUrl = urlRegExp.test(value) || javascriptRegExp.test(value);
              if (isUrl) {
                tbCon += tdRow.format(link.format(value));
              } else {
                if (value) {
                  if (typeof value === "object") {
                    tbCon += tdRow.format(ConvertJsonToTable(eval(value.data), value.tableId, value.tableClassName, value.linkText));
                  } else {
                    tbCon += tdRow.format(value);
                  }
                } else {
                  tbCon += tdRow.format(italic.format(value).toUpperCase());
                }
              }
              j++;
            }
            trCon += tr.format(tbCon);
            tbCon = "";
            i++;
          }
        }
      }
      tb = tb.format(trCon);
      tbl = tbl.format(th, tb);
    }
    this.table = tbl;
  }

  return JsonToTable;

})();

module.exports = JsonToTable;


},{}],61:[function(require,module,exports){
var OJ, array2D;

OJ = require('../oj');

array2D = function(initLength, initWidth) {
  var array, extend, maxLength, maxWidth, ret;
  array = [];
  maxLength = 0;
  maxWidth = 0;
  ret = {
    get: function(rowNo, colNo) {
      return extend(rowNo, colNo);
    },
    set: function(rowNo, colNo, val) {
      var colIdx, rowIdx;
      ret.get(rowNo, colNo);
      rowIdx = rowNo - 1;
      colIdx = colNo - 1;
      return array[rowIdx][colIdx] = val;
    },
    each: function(callBack) {
      return _.each(array, function(columns, row) {
        return _.each(array[row], function(val, col) {
          var colIdx, rowIdx;
          rowIdx = row + 1;
          colIdx = col + 1;
          return callBack(rowIdx, colIdx, val);
        });
      });
    },
    width: function() {
      return maxWidth;
    },
    length: function() {
      return maxLength;
    }
  };

  /*
  Guarantee that the dimensions of the array are always backed by values at every position
   */
  extend = function(length, width) {
    var i, tryRow;
    if (!length || length < 1) {
      length = 1;
    }
    if (!width || width < 1) {
      width = 1;
    }
    if (maxLength < length) {
      maxLength = length;
    }
    if (array.length > maxLength) {
      maxLength = array.length;
    }
    if (maxWidth < width) {
      maxWidth = width;
    }
    i = 0;
    while (i < maxLength) {
      tryRow = array[i];
      if (!tryRow) {
        tryRow = [];
        array.push(tryRow);
      }
      if (maxWidth < tryRow.length) {
        maxWidth = tryRow.length;
      }
      if (tryRow.length < maxWidth) {
        tryRow.length = maxWidth;
      }
      i += 1;
    }
    return array[length - 1][width - 1];
  };
  extend(initLength, initWidth);
  return ret;
};

OJ.register('array2D', array2D);

module.exports = array2D;


},{"../oj":58}],62:[function(require,module,exports){
var OJ, console, methodLength, methods,
  slice = [].slice;

OJ = require('../oj');

methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'memory', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'timeline', 'timelineEnd', 'trace', 'warn'];

methodLength = methods.length;

console = OJ.global.console || {};

OJ.makeSubNameSpace('console');


/*
1. Stub out any missing methods with noop
2. Define the available methods on the OJ.console object
 */

while (methodLength--) {
  (function() {
    var method;
    method = methods[methodLength];
    if (!console[method]) {
      console[method] = OJ.noop;
    }
    return OJ.console.register(method, function() {
      var params;
      params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console[method].apply(console, params);
    });
  })();
}

module.exports = console;


},{"../oj":58}],63:[function(require,module,exports){
(function (global){
var $, OJ, all, cookies, del, deleteAll, get, set;

OJ = require('../oj');

$ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);


/*
Setup settings
$.cookie.raw = true
$.cookie.json = true
  
Setup defaults
https://github.com/carhartl/jquery-cookie/
$.cookie.defaults.expires = 365
$.cookie.defaults.path = '/'
$.cookie.defaults.domain = 'oj.com'
 */

if (!$ || !$.cookie) {
  throw new Error('jQuery Cookie is a required dependency.');
}

$.cookie.defaults.secure = false;

cookies = {};

get = function(cookieName, type) {
  var ret;
  ret = '';
  if (cookieName) {
    if (type) {
      ret = $.cookie(cookieName, type);
    } else {
      ret = $.cookie(cookieName);
    }
    if (ret) {
      return cookies[cookieName] = ret;
    }
  }
};

all = function() {
  var ret;
  ret = $.cookie();
  return ret;
};

set = function(cookieName, value, opts) {
  var ret;
  ret = '';
  if (cookieName) {
    cookies[cookieName] = value;
    if (opts) {
      ret = $.cookie(cookieName, value, opts);
    } else {
      ret = $.cookie(cookieName, value);
    }
  }
  return ret;
};

del = function(cookieName, opts) {
  if (cookieName) {
    if (opts) {
      $.removeCookie(cookieName, opts);
    } else {
      $.removeCookie(cookieName);
    }
    delete cookies[cookieName];
  }
};

deleteAll = function() {
  cookies = {};
  OJ.each(OJ.cookie.all, function(val, key) {
    return OJ.cookie["delete"](key);
  });
};

OJ.cookie.register('deleteAll', deleteAll);

OJ.cookie.register('delete', del);

OJ.cookie.register('set', set);

OJ.cookie.register('get', get);

OJ.cookie.register('all', all);

module.exports = {
  deleteAll: deleteAll,
  "delete": del,
  set: set,
  get: get,
  all: all
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58}],64:[function(require,module,exports){
var OJ, defer;

OJ = require('../oj');

defer = function(method, waitMs) {
  if (waitMs && setTimeout) {
    setTimeout(method, waitMs);
  }
  return (new Promise(function(resolve) {
    return resolve();
  })).then(method);
};

OJ.register('defer', defer);

module.exports = defer;


},{"../oj":58}],65:[function(require,module,exports){
var OJ, canEach, each;

OJ = require('../oj');

canEach = function(obj) {
  return OJ.is.plainObject(obj) || OJ.is.object(obj) || OJ.is.array(obj);
};

each = function(obj, onEach, recursive) {
  if (canEach(obj)) {
    _.forOwn(obj, function(val, key) {
      var quit;
      if (onEach && (val || key)) {
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

OJ.register('each', each);

module.exports = each;


},{"../oj":58}],66:[function(require,module,exports){
var OJ, inputTypes, unknown;

OJ = require('../oj');

unknown = 'unknown';

inputTypes = {
  button: {
    id: 0,
    name: 'button',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  checkbox: {
    id: 1,
    name: 'checkbox',
    placeholder: false,
    autocomplete: false,
    value: {
      required: true,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  color: {
    id: 2,
    name: 'color',
    placeholder: false,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  date: {
    id: 3,
    name: 'date',
    placeholder: false,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  datetime: {
    id: 4,
    name: 'datetime',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  'datetime-local': {
    id: 5,
    name: 'datetime-local',
    placeholder: false,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  email: {
    id: 6,
    name: 'email',
    placeholder: true,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  file: {
    id: 7,
    name: 'file',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: false
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  hidden: {
    id: 8,
    name: 'hidden',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  image: {
    id: 9,
    name: 'image',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  month: {
    id: 10,
    name: 'month',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  number: {
    id: 11,
    name: 'number',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  password: {
    id: 12,
    name: 'password',
    placeholder: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  radio: {
    id: 13,
    name: 'radio',
    placeholder: false,
    autocomplete: false,
    value: {
      required: true,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  range: {
    id: 14,
    name: 'range',
    placeholder: false,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  reset: {
    id: 15,
    name: 'reset',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  search: {
    id: 16,
    name: 'search',
    placeholder: true,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  submit: {
    id: 17,
    name: 'submit',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  tel: {
    id: 18,
    name: 'button',
    placeholder: true,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  },
  text: {
    id: 19,
    name: 'text',
    placeholder: true,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  time: {
    id: 20,
    name: 'time',
    placeholder: false,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  url: {
    id: 21,
    name: 'url',
    placeholder: true,
    autocomplete: true,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '200px',
    defaultsize: '25'
  },
  week: {
    id: 22,
    name: 'week',
    placeholder: false,
    autocomplete: false,
    value: {
      required: false,
      allowed: true
    },
    defaultwidth: '',
    defaultsize: '25'
  }
};

OJ.enums.register('unknown', unknown);

OJ.enums.register('inputTypes', inputTypes);

module.exports = {
  unknown: unknown,
  inputTypes: inputTypes
};


},{"../oj":58}],67:[function(require,module,exports){
(function (global){
var $, IS, OJ, _;

OJ = require('../oj');

$ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

IS = (function() {
  function IS() {}

  IS.bool = function(boolean) {
    return _.isBoolean(boolean);
  };

  IS.arrayNullOrEmpty = function(arr) {
    return _.isEmpty(arr);
  };

  IS.stringNullOrEmpty = function(str) {
    return str && (!str.length || str.length === 0 || !str.trim || !str.trim());
  };

  IS.numberNullOrEmpty = function(num) {
    return !num || isNaN(num) || !num.toPrecision;
  };

  IS.dateNullOrEmpty = function(dt) {
    return !dt || !dt.getTime;
  };

  IS.objectNullOrEmpty = function(obj) {
    return _.isEmpty(obj || !Object.keys(obj) || Object.keys(obj).length === 0);
  };

  IS.plainObject = function(obj) {
    return _.isPlainObject(obj);
  };

  IS.object = function(obj) {
    return _.isObject(obj);
  };

  IS.date = function(dt) {
    return _.isDate(dt);
  };


  /*
  Determines if a value is an instance of a Number and not NaN*
   */

  IS.number = function(num) {
    var number;
    number = require('../core/number');
    return typeof num === 'number' && false === (number.isNaN(num) || false === number.isFinite(num) || number.MAX_VALUE === num || number.MIN_VALUE === num);
  };


  /*
  Determines if a value is convertible to a Number
   */

  IS.numeric = function(num) {
    var nuNum, ret, to;
    ret = this.number(num);
    if (!ret) {
      to = require('./to');
      nuNum = to.number(num);
      ret = this.number(nuNum);
    }
    return ret;
  };

  IS.elementInDom = function(elementId) {
    return false === this.nullOrEmpty(document.getElementById(elementId));
  };

  IS.array = function(obj) {
    return _.isArray(obj);
  };

  IS.string = function(str) {
    return _.isString(str);
  };

  IS["true"] = function(obj) {
    return obj === true || obj === 'true' || obj === 1 || obj === '1';
  };

  IS["false"] = function(obj) {
    return obj === false || obj === 'false' || obj === 0 || obj === '0';
  };

  IS.trueOrFalse = function(obj) {
    return this["true"](obj || this["false"](obj));
  };

  IS.nullOrEmpty = function(obj, checkLength) {
    return _.isEmpty(obj) || _.isUndefined(obj) || _.isNull(obj) || _.isNaN(obj);
  };

  IS.nullOrUndefined = function(obj, checkLength) {
    return _.isUndefined(obj) || _.isNull(obj) || _.isNaN(obj);
  };

  IS["instanceof"] = function(name, obj) {
    return obj.type === name || obj instanceof name;
  };

  IS.method = function(obj) {
    return obj !== OJ.noop && _.isFunction(obj);
  };


  /*
  Deprecated. Left for backwards compatibility. Use is.method instead.
   */

  IS.func = IS.method;

  return IS;

})();

OJ.register('is', IS);

module.exports = IS;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../core/number":10,"../oj":58,"./to":72}],68:[function(require,module,exports){
(function (global){
var OJ, makeNoty, noty;

OJ = require('../oj');

noty = (typeof window !== "undefined" ? window['noty'] : typeof global !== "undefined" ? global['noty'] : null);

makeNoty = function(options, owner) {
  var defaults, ret;
  defaults = {
    layout: 'topRight',
    theme: 'defaultTheme',
    type: 'alert',
    text: '',
    dismissQueue: true,
    template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
    animation: {
      open: {
        height: 'toggle'
      },
      close: {
        height: 'toggle'
      },
      easing: 'swing',
      speed: 500
    },
    timeout: 5000,
    force: false,
    modal: false,
    maxVisible: 5,
    killer: false,
    closeWith: ['click'],
    callback: {
      onShow: OJ.noop,
      afterShow: OJ.noop,
      onClose: OJ.noop,
      afterClose: OJ.noop
    },
    buttons: false
  };
  OJ.extend(defaults, options, true);
  ret = noty(defaults);
  return ret;
};

OJ.notifications.register('noty', makeNoty);

module.exports = makeNoty;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58}],69:[function(require,module,exports){
(function (global){
var OJ, PubSub, events, ps, subscribers, tokens;

OJ = require('../oj');

PubSub = (typeof window !== "undefined" ? window['PubSub'] : typeof global !== "undefined" ? global['PubSub'] : null);

tokens = {};

subscribers = [];

events = {};

ps = {
  getEventName: function(event) {
    return event.toUpperCase().replace(' ', '_');
  },
  subscribe: function(event, method) {
    var eventName, token;
    eventName = ps.getEventName(event);
    if (!events[eventName]) {
      events[eventName] = [];
    }
    token = PubSub.subscribe(eventName, method);
    tokens[token] = token;
    subscribers.push(method);
    events[eventName].push(method);
    return token;
  },
  publish: function(event, data) {
    var eventName;
    eventName = ps.getEventName(event);
    if (events[eventName]) {
      PubSub.publish(eventName, data);
    } else {
      OJ.console.info('Event named {' + event + '} is not recognized.');
    }
  },
  unsubscribe: function(tokenOrMethod) {
    if (OJ.is.method(tokenOrMethod)) {
      if (-1 !== subscribers.indexOf(tokenOrMethod)) {
        PubSub.unsubscribe(tokenOrMethod);
        subscribers = _.remove(subscribers, function(method) {
          return method === tokenOrMethod;
        });
      } else {
        OJ.console.info('Event method is not recognized.');
      }
    } else {
      if (tokens[tokenOrMethod]) {
        PubSub.unsubscribe(tokenOrMethod);
        delete tokens[tokenOrMethod];
      }
    }
  },
  unsubscribeAll: function() {
    OJ.each(tokens, function(token) {
      return unsubscribe(token);
    });
    subscribers = [];
    events = {};
  },
  unsubscribeEvent: function(event) {
    var eventName;
    eventName = ps.getEventName(event);
    if (events[eventName]) {
      OJ.each(events[eventName], function(method) {
        return unsubscribe(method);
      });
    } else {
      OJ.console.info('Event named {' + event + '} is not recognized.');
    }
    delete events[eventName];
  }
};

Object.seal(ps);

Object.freeze(ps);

OJ.register('getEventName', ps.getEventName);

OJ.register('publish', ps.publish);

OJ.register('subscribe', ps.subscribe);

OJ.register('unsubscribe', ps.unsubscribe);

OJ.register('unsubscribeAll', ps.unsubscribeAll);

OJ.register('unsubscribeEvent', ps.unsubscribeEvent);

module.exports = ps;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58}],70:[function(require,module,exports){
var OJ, queryString;

OJ = require('../oj');


/*
http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 */

queryString = function(param) {
  var i, params, prm, ret;
  ret = {};
  if (OJ.global.location) {
    params = OJ.global.location.search.substr(1).split('&');
    if (params) {
      i = 0;
      while (i < params.length) {
        prm = params[i].split('=');
        if (prm.length === 2) {
          ret[prm[0]] = OJ.global.decodeURIComponent(prm[1].replace(/\+/g, " "));
        }
        i += 1;
      }
    }
  }
  return ret;
};

OJ.register('queryString', queryString);

module.exports = queryString;


},{"../oj":58}],71:[function(require,module,exports){
(function (global){
var OJ, _, each, obj, rng,
  slice = [].slice;

OJ = require('../oj');

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

obj = require('../core/object');

each = require('./each');

rng = {
  range: function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return _.range.apply(_, params);
  },
  rangeMin: function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return _.min.apply(_, params);
  },
  rangeMax: function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return _.max.apply(_, params);
  },

  /*
  Take an array of string values and a number of partitions to create.
  Uses the first letter of each string value in the array to convert to unique code character (lower case)
  Builds a int range based on unique code chars.
   */
  stringToSubRanges: function(n, range) {
    var charRange, i, oldGetRange, ret, subRange;
    if (n == null) {
      n = 6;
    }
    if (range == null) {
      range = [];
    }
    charRange = [];
    each(range, function(val) {
      var char;
      char = val.trim()[0].toLowerCase();
      if (false === obj.contains(charRange, char)) {
        return charRange.push(char.charCodeAt());
      }
    });
    ret = rng.toSubRanges(n, charRange);
    i = 0;
    while (i < n) {
      i += 1;
      subRange = ret[i];
      subRange.map(String.fromCharCode);
    }
    oldGetRange = ret.getRange;
    ret.getRange = function(val) {
      var char, idx;
      char = val.trim()[0].toLowerCase().charCodeAt();
      idx = oldGetRange(char);
      return idx;
    };
    return ret;
  },

  /*
  Take an array of int values and a number of partitions to create.
  Divides the original array into the specified number of sub arrays.
  Overflow is passed to the final partition.
   */
  toSubRanges: function(n, range) {
    var chunkVal, distance, i, jump, map, rangeHigh, rangeLow, ret, subRange, subRangeSize, subRanges;
    if (n == null) {
      n = 6;
    }
    if (range == null) {
      range = [];
    }
    ret = obj.object();
    rangeLow = rng.rangeMin(range);
    rangeHigh = rng.rangeMax(range);
    distance = rangeHigh - rangeLow;
    subRangeSize = distance / n;
    subRanges = ret.add('ranges', obj.object());
    chunkVal = rangeLow;
    map = obj.object();
    i = 0;
    while (i < n) {
      i += 1;
      if (i < n) {
        jump = Math.round(subRangeSize);
      } else {
        jump = Math.floor(subRangeSize);
        if (chunkVal + jump <= rangeHigh) {
          jump += rangeHigh - chunkVal - jump + 1;
        }
      }
      subRange = rng.range(chunkVal, chunkVal + jump);
      each(subRange, function(val) {
        return map.add(val, i);
      });
      subRanges[i] = subRange;
      chunkVal += jump;
    }
    ret.add('getRange', function(val) {
      return map[val];
    });
    return ret;
  }
};

Object.seal(rng);

Object.freeze(rng);

OJ.register('ranges', rng);

module.exports = rng;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../core/object":11,"../oj":58,"./each":65}],72:[function(require,module,exports){
(function (global){
var $, IS, OJ, TO, _;

OJ = require('../oj');

$ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

IS = require('./is');

TO = (function() {
  function TO() {}

  TO.bool = function(str) {
    var retBool;
    retBool = IS['true'](str);
    if (retBool === false || retBool !== true) {
      retBool = false;
    }
    return retBool;
  };

  TO.ES5_ToBool = function(val) {
    return val !== false && val !== 0 && val !== '' && val !== null && typeof val !== 'undefined' && (typeof val !== 'number' || !isNaN(val));
  };

  TO.dateFromTicks = function(tickStr) {
    var arr, localOffset, offset, ret, ticks, ticsDateTime;
    ticsDateTime = this.string(tickStr);
    ret = void 0;
    ticks = void 0;
    offset = void 0;
    localOffset = void 0;
    arr = void 0;
    if (false === IS.nullOrEmpty(ticsDateTime)) {
      ticsDateTime = ticsDateTime.replace('/', '');
      ticsDateTime = ticsDateTime.replace('Date', '');
      ticsDateTime = ticsDateTime.replace('(', '');
      ticsDateTime = ticsDateTime.replace(')', '');
      arr = ticsDateTime.split('-');
      if (arr.length > 1) {
        ticks = this.number(arr[0]);
        offset = this.number(arr[1]);
        localOffset = new Date().getTimezoneOffset();
        ret = new Date(ticks - ((localOffset + (offset / 100 * 60)) * 1000));
      } else if (arr.length === 1) {
        ticks = this.number(arr[0]);
        ret = new Date(ticks);
      }
    }
    return ret;
  };

  TO.binary = function(obj) {
    var ret;
    ret = NaN;
    if (obj === 0 || obj === '0' || obj === '' || obj === false || this.string(obj).toLowerCase().trim() === 'false') {
      ret = 0;
    } else {
      if (obj === 1 || obj === '1' || obj === true || this.string(obj).toLowerCase().trim() === 'true') {
        ret = 1;
      }
    }
    return ret;
  };

  TO.number = function(inputNum, defaultNum) {
    var retVal, tryGetNumber;
    tryGetNumber = (function(_this) {
      return function(val) {
        var ret, tryGet;
        ret = NaN;
        if (IS.number(val)) {
          ret = val;
        } else if (IS.string(val) || IS.bool(val)) {
          tryGet = function(value) {
            var num;
            num = _this.binary(value);
            if (!IS.number(num) && value) {
              num = +value;
            }
            if (!IS.number(num)) {
              num = _.parseInt(value, 0);
            }
            return num;
          };
          ret = tryGet(val);
        }
        return ret;
      };
    })(this);
    retVal = tryGetNumber(inputNum);
    if (!IS.number(retVal)) {
      retVal = tryGetNumber(defaultNum);
      if (!IS.number(retVal)) {
        retVal = Number.NaN;
      }
    }
    return retVal;
  };

  TO.string = function(inputStr, defaultStr) {
    var ret1, ret2, retVal, tryGetString;
    tryGetString = (function(_this) {
      return function(str) {
        var ret;
        ret = void 0;
        if (IS.string(str)) {
          ret = str;
        } else {
          ret = '';
          if (IS.bool(str) || IS.number(str) || IS.date(str)) {
            ret = str.toString();
          }
        }
        return ret;
      };
    })(this);
    ret1 = tryGetString(inputStr);
    ret2 = tryGetString(defaultStr);
    retVal = '';
    if (ret1.length !== 0) {
      retVal = ret1;
    } else if (ret1 === ret2 || ret2.length === 0) {
      retVal = ret1;
    } else {
      retVal = ret2;
    }
    return retVal;
  };

  return TO;

})();

OJ.register('to', TO);

module.exports = TO;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../oj":58,"./is":67}],73:[function(require,module,exports){
var OJ, createFauxUUID;

OJ = require('../oj');


/*
Generates a random string that complies to the RFC 4122 specification for GUID/UUID.
(e.g. 'B42A153F-1D9A-4F92-9903-92C11DD684D2')
While not a true UUID, for the purposes of this application, it should be sufficient.
 */

createFauxUUID = function() {
  var hexDigits, i, s, uuid;
  s = [];
  s.length = 36;
  hexDigits = '0123456789abcdef';
  i = 0;
  while (i < 36) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    i += 1;
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  uuid = s.join('');
  return uuid;
};

OJ.register('createUUID', createFauxUUID);

module.exports = createFauxUUID;


},{"../oj":58}]},{},[33])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVlL2FzeW5jL2FqYXguY29mZmVlIiwic3JjL2NvZmZlZS9hc3luYy9wcm9taXNlLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy9ncmlkLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy9pbnB1dGdyb3VwLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy90YWJzLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy90aWxlLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29udHJvbHMvaWNvbi5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvZGF0ZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvZnVuY3Rpb24uY29mZmVlIiwic3JjL2NvZmZlZS9jb3JlL251bWJlci5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvb2JqZWN0LmNvZmZlZSIsInNyYy9jb2ZmZWUvY29yZS9wcm9wZXJ0eS5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvc3RyaW5nLmNvZmZlZSIsInNyYy9jb2ZmZWUvZG9tL2JvZHkuY29mZmVlIiwic3JjL2NvZmZlZS9kb20vY29tcG9uZW50LmNvZmZlZSIsInNyYy9jb2ZmZWUvZG9tL2NvbnRyb2wuY29mZmVlIiwic3JjL2NvZmZlZS9kb20vZWxlbWVudC5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9mcmFnbWVudC5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9nZW5lcmljcy5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9pbnB1dC5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9ub2RlLmNvZmZlZSIsInNyYy9jb2ZmZWUvZG9tL25vZGVGYWN0b3J5LmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvYS5jb2ZmZWUiLCJzcmMvY29mZmVlL2VsZW1lbnRzL2JyLmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvZm9ybS5jb2ZmZWUiLCJzcmMvY29mZmVlL2VsZW1lbnRzL2lucHV0LmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvb2wuY29mZmVlIiwic3JjL2NvZmZlZS9lbGVtZW50cy9zZWxlY3QuY29mZmVlIiwic3JjL2NvZmZlZS9lbGVtZW50cy90YWJsZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2VsZW1lbnRzL3RleHRhcmVhLmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvdGhlYWQuY29mZmVlIiwic3JjL2NvZmZlZS9lbGVtZW50cy91bC5jb2ZmZWUiLCJzcmMvY29mZmVlL2VudHJ5cG9pbnQuY29mZmVlIiwic3JjL2NvZmZlZS9nbG9iYWwuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvYnV0dG9uaW5wdXQuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvY2hlY2tib3guY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvY29sb3IuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvZGF0ZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy9kYXRldGltZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy9kYXRldGltZWxvY2FsLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL2VtYWlsLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL2ZpbGUuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvaGlkZGVuLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL2ltYWdlaW5wdXQuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvbW9udGguY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvbnVtYmVyLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3Bhc3N3b3JkLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3JhZGlvLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3JhbmdlLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3Jlc2V0LmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3NlYXJjaC5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy9zdWJtaXQuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvdGVsLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3RleHRpbnB1dC5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy90aW1lLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3VybC5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy93ZWVrLmNvZmZlZSIsInNyYy9jb2ZmZWUvb2ouY29mZmVlIiwic3JjL2NvZmZlZS9vakluaXQuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9Kc29uVG9UYWJsZS5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL2FycmF5MkQuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9jb25zb2xlLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvY29va2llLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvZGVmZXIuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9lYWNoLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvZW51bXMuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9pcy5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL25vdHkuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9wdWJzdWIuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9xdWVyeVN0cmluZy5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL3Jhbmdlcy5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL3RvLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvdXVpZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIE9KLCBhamF4LCBjb25maWcsIG9wdHNGcm9tVXJsO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbmNvbmZpZyA9IHt9O1xuXG5jb25maWcub25TdWNjZXNzID0gZnVuY3Rpb24ob3B0cywgZGF0YSwgdXJsKSB7XG4gIHZhciByZXNwb25zZTtcbiAgcmVzcG9uc2UgPSB7fTtcbiAgT0ouZXh0ZW5kKHJlc3BvbnNlLCBkYXRhKTtcbiAgb3B0cy5vblN1Y2Nlc3MocmVzcG9uc2UpO1xuICBpZiAoT0ouTE9HX0FMTF9BSkFYKSB7XG4gICAgT0ouY29uc29sZS50YWJsZShbXG4gICAgICB7XG4gICAgICAgIFdlYnNlcnZpY2U6IG9wdHMuYWpheE9wdHMudXJsLFxuICAgICAgICBTdGFydFRpbWU6IG9wdHMuc3RhcnRUaW1lLFxuICAgICAgICBFbmRUaW1lOiBuZXcgRGF0ZSgpXG4gICAgICB9XG4gICAgXSk7XG4gIH1cbn07XG5cbmNvbmZpZy5vbkVycm9yID0gZnVuY3Rpb24oeG1sSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIHBhcmFtMSwgb3B0cykge1xuICBpZiAob3B0cyA9PSBudWxsKSB7XG4gICAgb3B0cyA9IE9KLm9iamVjdCgpO1xuICB9XG4gIGlmICh0ZXh0U3RhdHVzICE9PSAnYWJvcnQnKSB7XG4gICAgaWYgKE9KLkxPR19BTExfQUpBWF9FUlJPUlMpIHtcbiAgICAgIE9KLmNvbnNvbGUudGFibGUoW1xuICAgICAgICB7XG4gICAgICAgICAgV2Vic2VydmljZTogb3B0cy5hamF4T3B0cy51cmwsXG4gICAgICAgICAgRGF0YTogb3B0cy5hamF4T3B0cy5kYXRhLFxuICAgICAgICAgIEZhaWxlZDogdGV4dFN0YXR1cyxcbiAgICAgICAgICBTdGF0ZTogeG1sSHR0cFJlcXVlc3Quc3RhdGUoKSxcbiAgICAgICAgICBTdGF0dXM6IHhtbEh0dHBSZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgICBTdGF0dXNUZXh0OiB4bWxIdHRwUmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICAgIFJlYWR5U3RhdGU6IHhtbEh0dHBSZXF1ZXN0LnJlYWR5U3RhdGUsXG4gICAgICAgICAgUmVzcG9uc2VUZXh0OiB4bWxIdHRwUmVxdWVzdC5yZXNwb25zZVRleHRcbiAgICAgICAgfVxuICAgICAgXSk7XG4gICAgfVxuICAgIG9wdHMub25FcnJvcih0ZXh0U3RhdHVzKTtcbiAgfVxufTtcblxub3B0c0Zyb21VcmwgPSBmdW5jdGlvbihvcHRzKSB7XG4gIHZhciB1cmw7XG4gIGlmIChPSi5pcy5zdHJpbmcob3B0cykpIHtcbiAgICB1cmwgPSBvcHRzO1xuICAgIG9wdHMgPSBPSi5vYmplY3QoKTtcbiAgICBvcHRzLmFkZCgnYWpheE9wdHMnLCBPSi5vYmplY3QoKSk7XG4gICAgb3B0cy5hamF4T3B0cy5hZGQoJ3VybCcsIHVybCk7XG4gIH1cbiAgcmV0dXJuIG9wdHM7XG59O1xuXG5jb25maWcuZXhlY1JlcXVlc3QgPSBmdW5jdGlvbih2ZXJiLCBvcHRzKSB7XG4gIHZhciBkZWZhdWx0cywgZ2V0SlF1ZXJ5RGVmZXJyZWQsIHByb21pc2U7XG4gIGlmICh2ZXJiID09IG51bGwpIHtcbiAgICB2ZXJiID0gJ0dFVCc7XG4gIH1cbiAgZGVmYXVsdHMgPSB7XG4gICAgYWpheE9wdHM6IHtcbiAgICAgIHVybDogJycsXG4gICAgICBkYXRhOiB7fSxcbiAgICAgIHR5cGU6IHZlcmIsXG4gICAgICB4aHJGaWVsZHM6IHtcbiAgICAgICAgd2l0aENyZWRlbnRpYWxzOiB0cnVlXG4gICAgICB9LFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCdcbiAgICB9LFxuICAgIG9uU3VjY2VzczogT0oubm9vcCxcbiAgICBvbkVycm9yOiBPSi5ub29wLFxuICAgIG9uQ29tcGxldGU6IE9KLm5vb3AsXG4gICAgb3ZlcnJpZGVFcnJvcjogZmFsc2UsXG4gICAgd2F0Y2hHbG9iYWw6IHRydWUsXG4gICAgdXNlQ2FjaGU6IGZhbHNlXG4gIH07XG4gIG9wdHMgPSBvcHRzRnJvbVVybChvcHRzKTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRzLCB0cnVlKTtcbiAgZGVmYXVsdHMuc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcbiAgaWYgKGZhbHNlID09PSBPSi5pcy5udWxsT3JFbXB0eShkZWZhdWx0cy5hamF4T3B0cy5kYXRhKSkge1xuICAgIGlmIChkZWZhdWx0cy5hamF4T3B0cy52ZXJiID09PSAnR0VUJykge1xuICAgICAgZGVmYXVsdHMuYWpheE9wdHMuZGF0YSA9IE9KLnBhcmFtcyhkZWZhdWx0cy5hamF4T3B0cy5kYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmYXVsdHMuYWpheE9wdHMuZGF0YSA9IE9KLnNlcmlhbGl6ZShkZWZhdWx0cy5hamF4T3B0cy5kYXRhKTtcbiAgICB9XG4gIH1cbiAgZ2V0SlF1ZXJ5RGVmZXJyZWQgPSBmdW5jdGlvbih3YXRjaEdsb2JhbCkge1xuICAgIHZhciByZXQ7XG4gICAgcmV0ID0gJC5hamF4KGRlZmF1bHRzLmFqYXhPcHRzKTtcbiAgICByZXQuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgICAgcmV0dXJuIGNvbmZpZy5vblN1Y2Nlc3MoZGVmYXVsdHMsIGRhdGEpO1xuICAgIH0pO1xuICAgIHJldC5mYWlsKGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRleHQpIHtcbiAgICAgIHJldHVybiBjb25maWcub25FcnJvcihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUZXh0LCBkZWZhdWx0cyk7XG4gICAgfSk7XG4gICAgcmV0LmFsd2F5cyhmdW5jdGlvbih4bWxIdHRwUmVxdWVzdCwgdGV4dFN0YXR1cykge1xuICAgICAgcmV0dXJuIGRlZmF1bHRzLm9uQ29tcGxldGUoeG1sSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMpO1xuICAgIH0pO1xuICAgIHJldHVybiBPSi5hc3luYy5hamF4UHJvbWlzZShyZXQpO1xuICB9O1xuICBwcm9taXNlID0gZ2V0SlF1ZXJ5RGVmZXJyZWQoZGVmYXVsdHMud2F0Y2hHbG9iYWwpO1xuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbmFqYXggPSB7fTtcblxuYWpheC5wb3N0ID0gZnVuY3Rpb24ob3B0cykge1xuICByZXR1cm4gY29uZmlnLmV4ZWNSZXF1ZXN0KCdQT1NUJywgb3B0cyk7XG59O1xuXG5hamF4LmdldCA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgcmV0dXJuIGNvbmZpZy5leGVjUmVxdWVzdCgnR0VUJywgb3B0cyk7XG59O1xuXG5hamF4W1wiZGVsZXRlXCJdID0gZnVuY3Rpb24ob3B0cykge1xuICByZXR1cm4gY29uZmlnLmV4ZWNSZXF1ZXN0KCdERUxFVEUnLCBvcHRzKTtcbn07XG5cbmFqYXgucHV0ID0gZnVuY3Rpb24ob3B0cykge1xuICByZXR1cm4gY29uZmlnLmV4ZWNSZXF1ZXN0KCdQVVQnLCBvcHRzKTtcbn07XG5cbk9KLmFzeW5jLnJlZ2lzdGVyKCdhamF4JywgYWpheCk7XG5cbm1vZHVsZS5leHBvcnRzID0gYWpheDtcblxuIiwidmFyIE9KLCBhamF4UHJvbWlzZSwgYWxsLCBkZWZyO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbmFqYXhQcm9taXNlID0gZnVuY3Rpb24oYWpheCkge1xuICB2YXIgcHJvbWlzZTtcbiAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShhamF4KTtcbiAgcHJvbWlzZS5hYm9ydCA9IGFqYXguYWJvcnQ7XG4gIHByb21pc2UucmVhZHlTdGF0ZSA9IGFqYXgucmVhZHlTdGF0ZTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5hbGwgPSBmdW5jdGlvbihpbml0QXJyYXkpIHtcbiAgdmFyIHByb21pc2UsIHJlcXM7XG4gIHJlcXMgPSBpbml0QXJyYXkgfHwgW107XG4gIHByb21pc2UgPSBQcm9taXNlLmFsbChyZXFzKTtcbiAgcHJvbWlzZS5wdXNoID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJlcXMucHVzaChpdGVtKTtcbiAgfTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5kZWZyID0gZnVuY3Rpb24oZnVuYykge1xuICB2YXIgcmV0O1xuICBpZiAoZnVuYyA9PSBudWxsKSB7XG4gICAgZnVuYyA9IE9KLm5vb3A7XG4gIH1cbiAgcmV0ID0gUHJvbWlzZS5tZXRob2QoZnVuYyk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5hc3luYy5yZWdpc3RlcignZGVmZXInLCBkZWZyKTtcblxuT0ouYXN5bmMucmVnaXN0ZXIoJ2FsbCcsIGFsbCk7XG5cbk9KLmFzeW5jLnJlZ2lzdGVyKCdhamF4UHJvbWlzZScsIGFqYXhQcm9taXNlKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlZmVyOiBkZWZyLFxuICBhbGw6IGFsbCxcbiAgYWpheFByb21pc2U6IGFqYXhQcm9taXNlXG59O1xuXG4iLCJ2YXIgT0osIGFycmF5MkQsIGNsYXNzTmFtZSwgY21wbnQsIGNvbXBvbmVudCwgbm9kZU5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vb2pJbml0Jyk7XG5cbmNvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2RvbS9jb21wb25lbnQnKTtcblxuYXJyYXkyRCA9IHJlcXVpcmUoJy4uL3Rvb2xzL2FycmF5MkQnKTtcblxubm9kZU5hbWUgPSAneC1ncmlkJztcblxuY2xhc3NOYW1lID0gJ2dyaWQnO1xuXG5PSi5jb21wb25lbnRzLm1lbWJlcnNbY2xhc3NOYW1lXSA9IG5vZGVOYW1lO1xuXG5jbXBudCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgZmlsbE1pc3NpbmcsIHJldCwgcm93cywgdGlsZXM7XG4gIGRlZmF1bHRzID0ge1xuICAgIHRpbGVTaXplczoge1xuICAgICAgc21hbGxTcGFuOiAnJyxcbiAgICAgIG1lZGl1bVNwYW46ICcnLFxuICAgICAgbGFyZ2VTcGFuOiAnJ1xuICAgIH0sXG4gICAgcHJvcHM6IHtcbiAgICAgIFwiY2xhc3NcIjogJ2dyaWQnXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBjb21wb25lbnQoZGVmYXVsdHMsIG93bmVyLCBub2RlTmFtZSk7XG4gIHJvd3MgPSBbXTtcbiAgdGlsZXMgPSBhcnJheTJEKCk7XG4gIGZpbGxNaXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRpbGVzLmVhY2goZnVuY3Rpb24ocm93Tm8sIGNvbE5vLCB2YWwpIHtcbiAgICAgIHZhciByb3c7XG4gICAgICBpZiAoIXZhbCkge1xuICAgICAgICByb3cgPSByZXQucm93KHJvd05vKTtcbiAgICAgICAgcmV0dXJuIHJvdy5tYWtlKCd0aWxlJywgY29sTm8sIHt9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0LmFkZCgncm93JywgZnVuY3Rpb24ocm93Tm8pIHtcbiAgICB2YXIgbnVSb3c7XG4gICAgaWYgKHJvd05vID09IG51bGwpIHtcbiAgICAgIHJvd05vID0gcm93cy5sZW5ndGggLSAxIHx8IDE7XG4gICAgfVxuICAgIG51Um93ID0gcm93c1tyb3dObyAtIDFdO1xuICAgIGlmICghbnVSb3cpIHtcbiAgICAgIHdoaWxlIChyb3dzLmxlbmd0aCA8IHJvd05vKSB7XG4gICAgICAgIG51Um93ID0gcmV0Lm1ha2UoJ2RpdicsIHtcbiAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgXCJjbGFzc1wiOiAncm93J1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJvd3MucHVzaChudVJvdyk7XG4gICAgICB9XG4gICAgICBudVJvdy5hZGQoJ3RpbGUnLCBmdW5jdGlvbihjb2xObywgb3B0cykge1xuICAgICAgICB2YXIgbnVUaWxlO1xuICAgICAgICBvcHRzID0gT0ouZXh0ZW5kKE9KLmV4dGVuZCh7fSwgZGVmYXVsdHMudGlsZVNpemVzKSwgb3B0cyk7XG4gICAgICAgIG51VGlsZSA9IE9KLmNvbXBvbmVudHMudGlsZShvcHRzLCBudVJvdyk7XG4gICAgICAgIHRpbGVzLnNldChyb3dObywgY29sTm8sIG51VGlsZSk7XG4gICAgICAgIHJldHVybiBudVRpbGU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG51Um93O1xuICB9KTtcbiAgcmV0LmFkZCgndGlsZScsIGZ1bmN0aW9uKHJvd05vLCBjb2xObywgb3B0cykge1xuICAgIHZhciBpLCByb3csIHRpbGUsIHRyeVRpbGU7XG4gICAgaWYgKCFyb3dObyB8fCByb3dObyA8IDEpIHtcbiAgICAgIHJvd05vID0gMTtcbiAgICB9XG4gICAgaWYgKCFjb2xObyB8fCBjb2xObyA8IDEpIHtcbiAgICAgIGNvbE5vID0gMTtcbiAgICB9XG4gICAgcm93ID0gcmV0LnJvdyhyb3dObyk7XG4gICAgdGlsZSA9IHRpbGVzLmdldChyb3dObywgY29sTm8pO1xuICAgIGlmICghdGlsZSkge1xuICAgICAgaSA9IDA7XG4gICAgICB3aGlsZSAoaSA8IGNvbE5vKSB7XG4gICAgICAgIGkgKz0gMTtcbiAgICAgICAgdHJ5VGlsZSA9IHRpbGVzLmdldChyb3dObywgaSk7XG4gICAgICAgIGlmICghdHJ5VGlsZSkge1xuICAgICAgICAgIGlmIChpID09PSBjb2xObykge1xuICAgICAgICAgICAgdGlsZSA9IHJvdy5tYWtlKCd0aWxlJywgb3B0cyk7XG4gICAgICAgICAgfSBlbHNlIGlmICghdGlsZSkge1xuICAgICAgICAgICAgcm93Lm1ha2UoJ3RpbGUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZmlsbE1pc3NpbmcoKTtcbiAgICByZXR1cm4gdGlsZTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5jb21wb25lbnRzLnJlZ2lzdGVyKGNsYXNzTmFtZSwgY21wbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNtcG50O1xuXG4iLCJ2YXIgT0osIGNsYXNzTmFtZSwgY21wbnQsIGNvbXBvbmVudCwgbm9kZU5hbWUsIHV1aWQ7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vb2pJbml0Jyk7XG5cbmNvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2RvbS9jb21wb25lbnQnKTtcblxudXVpZCA9IHJlcXVpcmUoJy4uL3Rvb2xzL3V1aWQnKTtcblxubm9kZU5hbWUgPSAneC1pbnB1dC1ncm91cCc7XG5cbmNsYXNzTmFtZSA9ICdpbnB1dGdyb3VwJztcblxuT0ouY29tcG9uZW50cy5tZW1iZXJzW2NsYXNzTmFtZV0gPSBub2RlTmFtZTtcblxuY21wbnQgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lcikge1xuICB2YXIgZGVmYXVsdHMsIGZvcklkLCBncm91cCwgcmV0O1xuICBmb3JJZCA9IHV1aWQoKTtcbiAgZGVmYXVsdHMgPSB7XG4gICAgcHJvcHM6IHtcbiAgICAgIFwiY2xhc3NcIjogJ2Zvcm0tZ3JvdXAnXG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNoYW5nZTogT0oubm9vcFxuICAgIH0sXG4gICAgXCJmb3JcIjogZm9ySWQsXG4gICAgbGFiZWxUZXh0OiAnJyxcbiAgICBpbnB1dE9wdHM6IHtcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGlkOiBmb3JJZCxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBcImNsYXNzXCI6ICcnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJycsXG4gICAgICAgIHZhbHVlOiAnJ1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gY29tcG9uZW50KGRlZmF1bHRzLCBvd25lciwgbm9kZU5hbWUpO1xuICBncm91cCA9IHJldC5tYWtlKCdkaXYnLCB7XG4gICAgcHJvcHM6IHtcbiAgICAgIFwiY2xhc3NcIjogJ2Zvcm0tZ3JvdXAnXG4gICAgfVxuICB9KTtcbiAgcmV0Lmdyb3VwTGFiZWwgPSBncm91cC5tYWtlKCdsYWJlbCcsIHtcbiAgICBwcm9wczoge1xuICAgICAgXCJmb3JcIjogZm9ySWRcbiAgICB9LFxuICAgIHRleHQ6IGRlZmF1bHRzLmxhYmVsVGV4dFxuICB9KTtcbiAgZGVmYXVsdHMuaW5wdXRPcHRzLnByb3BzW1wiY2xhc3NcIl0gKz0gJyBmb3JtLWNvbnRyb2wnO1xuICByZXQuZ3JvdXBJbnB1dCA9IGdyb3VwLm1ha2UoJ2lucHV0JywgZGVmYXVsdHMuaW5wdXRPcHRzKTtcbiAgcmV0Lmdyb3VwVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmV0Lmdyb3VwSW5wdXQudmFsKCk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5jb21wb25lbnRzLnJlZ2lzdGVyKGNsYXNzTmFtZSwgY21wbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNtcG50O1xuXG4iLCJ2YXIgT0osIGNsYXNzTmFtZSwgY21wbnQsIGNvbXBvbmVudCwgbm9kZU5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vb2pJbml0Jyk7XG5cbmNvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2RvbS9jb21wb25lbnQnKTtcblxubm9kZU5hbWUgPSAneC10YWJzJztcblxuY2xhc3NOYW1lID0gJ3RhYnMnO1xuXG5PSi5jb21wb25lbnRzLm1lbWJlcnNbY2xhc3NOYW1lXSA9IG5vZGVOYW1lO1xuXG5jbXBudCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBjb250ZW50LCBkZWZhdWx0cywgZmlyc3QsIHJldCwgdGFicztcbiAgZGVmYXVsdHMgPSB7XG4gICAgdGFiczoge30sXG4gICAgcHJvcHM6IHtcbiAgICAgIFwiY2xhc3NcIjogJydcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGNvbXBvbmVudChkZWZhdWx0cywgb3duZXIsIG5vZGVOYW1lKTtcbiAgdGFicyA9IHJldC5tYWtlKCd1bCcsIHtcbiAgICBwcm9wczoge1xuICAgICAgXCJjbGFzc1wiOiAnbmF2IG5hdi10YWJzJ1xuICAgIH1cbiAgfSk7XG4gIGNvbnRlbnQgPSByZXQubWFrZSgnZGl2Jywge1xuICAgIHByb3BzOiB7XG4gICAgICBcImNsYXNzXCI6ICd0YWItY29udGVudCdcbiAgICB9XG4gIH0pO1xuICBmaXJzdCA9IHRydWU7XG4gIE9KLmVhY2goZGVmYXVsdHMudGFicywgZnVuY3Rpb24odGFiVmFsLCB0YWJOYW1lKSB7XG4gICAgdmFyIGEsIHRhYkNsYXNzLCB0YWJDb250ZW50Q2xhc3M7XG4gICAgdGFiQ2xhc3MgPSAnJztcbiAgICBpZiAoZmlyc3QpIHtcbiAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICB0YWJDbGFzcyA9ICdhY3RpdmUnO1xuICAgIH1cbiAgICBhID0gdGFicy5tYWtlKCdsaScsIHtcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIFwiY2xhc3NcIjogdGFiQ2xhc3NcbiAgICAgIH1cbiAgICB9KS5tYWtlKCdhJywge1xuICAgICAgdGV4dDogdGFiTmFtZSxcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGhyZWY6ICcjJyArIHRhYk5hbWUsXG4gICAgICAgICdkYXRhLXRvZ2dsZSc6ICd0YWInXG4gICAgICB9LFxuICAgICAgZXZlbnRzOiB7XG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gYS4kLnRhYignc2hvdycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGFiQ29udGVudENsYXNzID0gJ3RhYi1wYW5lICcgKyB0YWJDbGFzcztcbiAgICByZXR1cm4gcmV0LmFkZCh0YWJOYW1lLCBjb250ZW50Lm1ha2UoJ2RpdicsIHtcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIFwiY2xhc3NcIjogdGFiQ29udGVudENsYXNzLFxuICAgICAgICBpZDogdGFiTmFtZVxuICAgICAgfVxuICAgIH0pKTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5jb21wb25lbnRzLnJlZ2lzdGVyKGNsYXNzTmFtZSwgY21wbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNtcG50O1xuXG4iLCJ2YXIgT0osIGNsYXNzTmFtZSwgY21wbnQsIGNvbXBvbmVudCwgbm9kZU5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vb2pJbml0Jyk7XG5cbmNvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2RvbS9jb21wb25lbnQnKTtcblxubm9kZU5hbWUgPSAneC10aWxlJztcblxuY2xhc3NOYW1lID0gJ3RpbGUnO1xuXG5PSi5jb21wb25lbnRzLm1lbWJlcnNbY2xhc3NOYW1lXSA9IG5vZGVOYW1lO1xuXG5jbXBudCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBkZWZhdWx0cyA9IHtcbiAgICB3aWR0aDoge1xuICAgICAgeHM6ICcnLFxuICAgICAgc206ICcnLFxuICAgICAgbWQ6ICcnLFxuICAgICAgbGc6ICcnXG4gICAgfSxcbiAgICBwcm9wczoge1xuICAgICAgXCJjbGFzc1wiOiAndGlsZSdcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIGlmIChkZWZhdWx0cy53aWR0aC54cykge1xuICAgIGRlZmF1bHRzLnByb3BzW1wiY2xhc3NcIl0gKz0gJyBjb2wteHMtJyArIGRlZmF1bHRzLndpZHRoLnhzO1xuICB9XG4gIGlmIChkZWZhdWx0cy53aWR0aC5zbSkge1xuICAgIGRlZmF1bHRzLnByb3BzW1wiY2xhc3NcIl0gKz0gJyBjb2wtc20tJyArIGRlZmF1bHRzLndpZHRoLnNtO1xuICB9XG4gIGlmIChkZWZhdWx0cy53aWR0aC5tZCkge1xuICAgIGRlZmF1bHRzLnByb3BzW1wiY2xhc3NcIl0gKz0gJyBjb2wtbWQtJyArIGRlZmF1bHRzLndpZHRoLm1kO1xuICB9XG4gIGlmIChkZWZhdWx0cy53aWR0aC5sZykge1xuICAgIGRlZmF1bHRzLnByb3BzW1wiY2xhc3NcIl0gKz0gJyBjb2wtbGctJyArIGRlZmF1bHRzLndpZHRoLmxnO1xuICB9XG4gIHJldCA9IE9KLmNvbXBvbmVudChkZWZhdWx0cywgb3duZXIsIG5vZGVOYW1lKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmNvbXBvbmVudHMucmVnaXN0ZXIoY2xhc3NOYW1lLCBjbXBudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gY21wbnQ7XG5cbiIsInZhciBPSiwgY250cmwsIGNvbnRyb2wsIGNvbnRyb2xOYW1lLCBmcmllbmRseU5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vb2pJbml0Jyk7XG5cbmNvbnRyb2wgPSByZXF1aXJlKCcuLi9kb20vY29udHJvbCcpO1xuXG5jb250cm9sTmFtZSA9ICd5LWljb24nO1xuXG5mcmllbmRseU5hbWUgPSAnaWNvbic7XG5cbk9KLmNvbnRyb2xzLm1lbWJlcnNbZnJpZW5kbHlOYW1lXSA9IGNvbnRyb2xOYW1lO1xuXG5jbnRybCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBjbGFzc05hbWUsIGNsYXNzTmFtZUJhc2UsIGRlZmF1bHRzLCBpc1RvZ2dsZWQsIHJldDtcbiAgZGVmYXVsdHMgPSB7XG4gICAgaWNvbk9wdHM6IHtcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgc3RhY2tlZEljb246ICcnLFxuICAgICAgc3dhcEljb246ICcnLFxuICAgICAgc2l6ZTogZmFsc2UsXG4gICAgICBjb2xvcjogJycsXG4gICAgICBsaWJyYXJ5OiAnJyxcbiAgICAgIGlzRml4ZWRXaWR0aDogZmFsc2UsXG4gICAgICBpc0xpc3Q6IGZhbHNlLFxuICAgICAgaXNTcGlubmVyOiBmYWxzZVxuICAgIH0sXG4gICAgcHJvcHM6IHtcbiAgICAgIFwiY2xhc3NcIjogJydcbiAgICB9LFxuICAgIHJvb3ROb2RlVHlwZTogJ3NwYW4nXG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucyk7XG4gIHJldCA9IGNvbnRyb2woZGVmYXVsdHMsIG93bmVyLCBjb250cm9sTmFtZSk7XG4gIGlzVG9nZ2xlZCA9IGZhbHNlO1xuICBjbGFzc05hbWVCYXNlID0gJ2ZhICc7XG4gIGlmIChkZWZhdWx0cy5pY29uT3B0cy5pc0ZpeGVkV2lkdGgpIHtcbiAgICBjbGFzc05hbWVCYXNlICs9ICdmYS1mdyAnO1xuICB9XG4gIGlmIChkZWZhdWx0cy5pY29uT3B0cy5pc0xpc3QpIHtcbiAgICBjbGFzc05hbWVCYXNlICs9ICdmYS1saSAnO1xuICB9XG4gIGlmIChkZWZhdWx0cy5pY29uT3B0cy5pc1NwaW5uZXIpIHtcbiAgICBjbGFzc05hbWVCYXNlICs9ICdmYS1zcGluICc7XG4gIH1cbiAgaWYgKGRlZmF1bHRzLmljb25PcHRzLnNpemUpIHtcbiAgICBpZiAoZGVmYXVsdHMuaWNvbk9wdHMuc2l6ZSA+IDEgJiYgZGVmYXVsdHMuaWNvbk9wdHMuc2l6ZSA8PSA1KSB7XG4gICAgICBjbGFzc05hbWVCYXNlICs9ICdmYS0nICsgZGVmYXVsdHMuaWNvbk9wdHMuc2l6ZSArICd4ICc7XG4gICAgfVxuICB9XG4gIGNsYXNzTmFtZSA9IGNsYXNzTmFtZUJhc2UgKyAnZmEtJyArIGRlZmF1bHRzLmljb25PcHRzLm5hbWU7XG4gIHJldC5teUljb24gPSByZXQubWFrZSgnaScsIHtcbiAgICBwcm9wczoge1xuICAgICAgXCJjbGFzc1wiOiBjbGFzc05hbWVcbiAgICB9XG4gIH0pO1xuICByZXQudG9nZ2xlSWNvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuZXdJY29uO1xuICAgIGlmIChkZWZhdWx0cy5pY29uT3B0cy5zd2FwSWNvbikge1xuICAgICAgbmV3SWNvbiA9IGRlZmF1bHRzLmljb25PcHRzLm5hbWU7XG4gICAgICBpc1RvZ2dsZWQgPSAhaXNUb2dnbGVkO1xuICAgICAgaWYgKGlzVG9nZ2xlZCkge1xuICAgICAgICByZXQubXlJY29uLiQucmVtb3ZlQ2xhc3MoJ2ZhLScgKyBuZXdJY29uKTtcbiAgICAgICAgbmV3SWNvbiA9IGRlZmF1bHRzLmljb25PcHRzLnN3YXBJY29uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0Lm15SWNvbi4kLnJlbW92ZUNsYXNzKCdmYS0nICsgZGVmYXVsdHMuaWNvbk9wdHMuc3dhcEljb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldC5teUljb24uJC5hZGRDbGFzcygnZmEtJyArIG5ld0ljb24pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmNvbnRyb2xzLnJlZ2lzdGVyKGZyaWVuZGx5TmFtZSwgY250cmwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNudHJsO1xuXG4iLCJ2YXIgT0osIGdldERhdGVGcm9tRG5Kc29uO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbmdldERhdGVGcm9tRG5Kc29uID0gZnVuY3Rpb24oZG5EYXRlKSB7XG4gIHZhciBhcnIsIGRuRGF0ZVN0ciwgbG9jYWxPZmZzZXQsIG9mZnNldCwgcmV0LCB0aWNrcztcbiAgZG5EYXRlU3RyID0gT0oudG8uc3RyaW5nKGRuRGF0ZSk7XG4gIHJldCA9IHZvaWQgMDtcbiAgdGlja3MgPSB2b2lkIDA7XG4gIG9mZnNldCA9IHZvaWQgMDtcbiAgbG9jYWxPZmZzZXQgPSB2b2lkIDA7XG4gIGFyciA9IHZvaWQgMDtcbiAgcmV0ID0gT0ouZGF0ZVRpbWVNaW5WYWx1ZTtcbiAgaWYgKGZhbHNlID09PSBPSi5pcy5udWxsT3JFbXB0eShkbkRhdGVTdHIpKSB7XG4gICAgZG5EYXRlU3RyID0gZG5EYXRlU3RyLnJlcGxhY2UoJy8nLCAnJyk7XG4gICAgZG5EYXRlU3RyID0gZG5EYXRlU3RyLnJlcGxhY2UoJ0RhdGUnLCAnJyk7XG4gICAgZG5EYXRlU3RyID0gZG5EYXRlU3RyLnJlcGxhY2UoJygnLCAnJyk7XG4gICAgZG5EYXRlU3RyID0gZG5EYXRlU3RyLnJlcGxhY2UoJyknLCAnJyk7XG4gICAgYXJyID0gZG5EYXRlU3RyLnNwbGl0KCctJyk7XG4gICAgaWYgKGFyci5sZW5ndGggPiAxKSB7XG4gICAgICB0aWNrcyA9IE9KLnRvLm51bWJlcihhcnJbMF0pO1xuICAgICAgb2Zmc2V0ID0gT0oudG8ubnVtYmVyKGFyclsxXSk7XG4gICAgICBsb2NhbE9mZnNldCA9IG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgIHJldCA9IG5ldyBEYXRlKHRpY2tzIC0gKChsb2NhbE9mZnNldCArIChvZmZzZXQgLyAxMDAgKiA2MCkpICogMTAwMCkpO1xuICAgIH0gZWxzZSBpZiAoYXJyLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGlja3MgPSBPSi50by5udW1iZXIoYXJyWzBdKTtcbiAgICAgIHJldCA9IG5ldyBEYXRlKHRpY2tzKTtcbiAgICB9XG4gIH1cbiAgcmV0O1xuICBPSi5yZWdpc3RlcignZ2V0RGF0ZUZyb21Ebkpzb24nLCBnZXREYXRlRnJvbURuSnNvbik7XG4gIHJldHVybiBtb2R1bGVzLmV4cG9ydHMgPSBnZXREYXRlRnJvbURuSnNvbjtcbn07XG5cbiIsInZhciBPSiwgbWV0aG9kLCB0cnlFeGVjO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnRyeUV4ZWMgPSBmdW5jdGlvbih0cnlGdW5jKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGVycm9yLCBleGNlcHRpb24sIHJldCwgdGhhdDtcbiAgcmV0ID0gZmFsc2U7XG4gIHRoYXQgPSB0aGlzO1xuICB0cnkge1xuICAgIGlmIChPSi5pcy5tZXRob2QodHJ5RnVuYykpIHtcbiAgICAgIHJldCA9IHRyeUZ1bmMuYXBwbHkodGhhdCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGV4Y2VwdGlvbiA9IGVycm9yO1xuICAgIGlmICgoZXhjZXB0aW9uLm5hbWUgPT09ICdUeXBlRXJyb3InIHx8IGV4Y2VwdGlvbi50eXBlID09PSAnY2FsbGVkX25vbl9jYWxsYWJsZScpICYmIGV4Y2VwdGlvbi50eXBlID09PSAnbm9uX29iamVjdF9wcm9wZXJ0eV9sb2FkJykge1xuICAgICAgT0ouY29uc29sZS5pbmZvKCdJZ25vcmluZyBleGNlcHRpb246ICcsIGV4Y2VwdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIE9KLmNvbnNvbGUuZXJyb3IoZXhjZXB0aW9uKTtcbiAgICB9XG4gIH0gZmluYWxseSB7XG5cbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxubWV0aG9kID0gZnVuY3Rpb24odHJ5RnVuYykge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciB0aGF0O1xuICB0aGF0ID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzO1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIGFyZ3MudW5zaGlmdCh0cnlGdW5jKTtcbiAgICByZXR1cm4gT0oudHJ5RXhlYy5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfTtcbn07XG5cbk9KLnJlZ2lzdGVyKCdtZXRob2QnLCBtZXRob2QpO1xuXG5PSi5yZWdpc3RlcigndHJ5RXhlYycsIHRyeUV4ZWMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0aG9kOiBtZXRob2QsXG4gIHRyeUV4ZWM6IHRyeUV4ZWNcbn07XG5cbiIsInZhciBPSiwgbnVtYmVyO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbm51bWJlciA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShudW1iZXIsICdpc05hTicsIHtcbiAgdmFsdWU6IChOdW1iZXIgJiYgTnVtYmVyLmlzTmFOID8gTnVtYmVyLmlzTmFOIDogaXNOYU4pXG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KG51bWJlciwgJ2lzRmluaXRlJywge1xuICB2YWx1ZTogKE51bWJlciAmJiBOdW1iZXIuaXNGaW5pdGUgPyBOdW1iZXIuaXNGaW5pdGUgOiBpc0Zpbml0ZSlcbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkobnVtYmVyLCAnTUFYX1ZBTFVFJywge1xuICB2YWx1ZTogKE51bWJlciAmJiBOdW1iZXIuTUFYX1ZBTFVFID8gTnVtYmVyLk1BWF9WQUxVRSA6IDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4KVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShudW1iZXIsICdNSU5fVkFMVUUnLCB7XG4gIHZhbHVlOiAoTnVtYmVyICYmIE51bWJlci5NSU5fVkFMVUUgPyBOdW1iZXIuTUlOX1ZBTFVFIDogNWUtMzI0KVxufSk7XG5cbk9KLnJlZ2lzdGVyKCdudW1iZXInLCBudW1iZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51bWJlcjtcblxuIiwidmFyICQsIE9KLCBfLCBmdW5jLCBpc01ldGhvZCwgcHJvcGVydHksIHJldE9iaiwgdG87XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcblxuXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcblxuaXNNZXRob2QgPSByZXF1aXJlKCcuLi90b29scy9pcycpO1xuXG5wcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJvcGVydHknKTtcblxuZnVuYyA9IHJlcXVpcmUoJy4vZnVuY3Rpb24nKTtcblxudG8gPSByZXF1aXJlKCcuLi90b29scy90bycpO1xuXG5yZXRPYmogPSB7XG4gIG9iamVjdDogZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICBvYmogPSB7fTtcbiAgICB9XG5cbiAgICAvKlxuICAgIEFkZCBhIHByb3BlcnR5IHRvIHRoZSBvYmplY3QgYW5kIHJldHVybiBpdFxuICAgICAqL1xuICAgIG9iai5hZGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpIHtcbiAgICAgIHByb3BlcnR5KG9iaiwgbmFtZSwgdmFsKTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcbiAgICBvYmouYWRkKCdlYWNoJywgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHZhciBlYWNoO1xuICAgICAgZWFjaCA9IHJlcXVpcmUoJy4uL3Rvb2xzL2VhY2gnKTtcbiAgICAgIHJldHVybiBlYWNoKG9iaiwgZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gJ2VhY2gnICYmIGtleSAhPT0gJ2FkZCcpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodmFsLCBrZXkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9LFxuICBpc0luc3RhbmNlT2Y6IGZ1bmN0aW9uKG5hbWUsIG9iaikge1xuICAgIHJldHVybiByZXRPYmouY29udGFpbnMobmFtZSwgb2JqKSAmJiB0by5ib29sKG9ialtuYW1lXSk7XG4gIH0sXG4gIGNvbnRhaW5zOiBmdW5jdGlvbihvYmplY3QsIGluZGV4KSB7XG4gICAgdmFyIHJldDtcbiAgICByZXQgPSBmYWxzZTtcbiAgICBpZiAob2JqZWN0KSB7XG4gICAgICByZXQgPSBfLmNvbnRhaW5zKG9iamVjdCwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuICBjb21wYXJlOiBmdW5jdGlvbihvYmoxLCBvYmoyKSB7XG4gICAgcmV0dXJuIF8uaXNFcXVhbChvYmoxLCBvYmoyKTtcbiAgfSxcbiAgY2xvbmU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gXy5jbG9uZURlZXAoZGF0YSh0cnVlKSk7XG4gIH0sXG4gIHNlcmlhbGl6ZTogZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciByZXQ7XG4gICAgcmV0ID0gJyc7XG4gICAgZnVuYy50cnlFeGVjKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldCB8fCAnJztcbiAgfSxcbiAgZGVzZXJpYWxpemU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgcmV0O1xuICAgIHJldCA9IHt9O1xuICAgIGlmIChkYXRhKSB7XG4gICAgICBmdW5jLnRyeUV4ZWMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldCA9ICQucGFyc2VKU09OKGRhdGEpO1xuICAgICAgfSk7XG4gICAgICBpZiAoaXNNZXRob2QubnVsbE9yRW1wdHkocmV0KSkge1xuICAgICAgICByZXQgPSB7fTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSxcbiAgcGFyYW1zOiBmdW5jdGlvbihkYXRhLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgZWFjaCwgcmV0O1xuICAgIGlmIChkZWxpbWl0ZXIgPT0gbnVsbCkge1xuICAgICAgZGVsaW1pdGVyID0gJyYnO1xuICAgIH1cbiAgICByZXQgPSAnJztcbiAgICBpZiAoZGVsaW1pdGVyID09PSAnJicpIHtcbiAgICAgIGZ1bmMudHJ5RXhlYyhmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0ID0gJC5wYXJhbShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBlYWNoID0gcmVxdWlyZSgnLi4vdG9vbHMvZWFjaCcpO1xuICAgICAgZWFjaChkYXRhLCBmdW5jdGlvbih2YWwsIGtleSkge1xuICAgICAgICBpZiAocmV0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXQgKz0gZGVsaW1pdGVyO1xuICAgICAgICB9XG4gICAgICAgIHJldCArPSBrZXkgKyAnPScgKyB2YWw7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRvLnN0cmluZyhyZXQpO1xuICB9LFxuICBleHRlbmQ6IGZ1bmN0aW9uKGRlc3RPYmosIHNyY09iaiwgZGVlcENvcHkpIHtcbiAgICB2YXIga2V5LCByZXQsIHZhbHVlO1xuICAgIGlmIChkZWVwQ29weSA9PSBudWxsKSB7XG4gICAgICBkZWVwQ29weSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXQgPSBkZXN0T2JqIHx8IHt9O1xuICAgIGZvciAoa2V5IGluIHNyY09iaikge1xuICAgICAgdmFsdWUgPSBzcmNPYmpba2V5XTtcbiAgICAgIGlmIChkZWVwQ29weSAmJiB2YWx1ZSAmJiAkLmlzUGxhaW5PYmplY3QodmFsdWUpICYmICQuaXNQbGFpbk9iamVjdChyZXRba2V5XSkpIHtcbiAgICAgICAgdGhpcy5leHRlbmQocmV0W2tleV0sIHZhbHVlLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cbn07XG5cbk9KLnJlZ2lzdGVyKCdvYmplY3QnLCByZXRPYmoub2JqZWN0KTtcblxuT0oucmVnaXN0ZXIoJ2lzSW5zdGFuY2VPZicsIHJldE9iai5pc0luc3RhbmNlT2YpO1xuXG5PSi5yZWdpc3RlcignY29udGFpbnMnLCByZXRPYmouY29udGFpbnMpO1xuXG5PSi5yZWdpc3RlcignY29tcGFyZScsIHJldE9iai5jb21wYXJlKTtcblxuT0oucmVnaXN0ZXIoJ2Nsb25lJywgcmV0T2JqLmNsb25lKTtcblxuT0oucmVnaXN0ZXIoJ3NlcmlhbGl6ZScsIHJldE9iai5zZXJpYWxpemUpO1xuXG5PSi5yZWdpc3RlcignZGVzZXJpYWxpemUnLCByZXRPYmouZGVzZXJpYWxpemUpO1xuXG5PSi5yZWdpc3RlcigncGFyYW1zJywgcmV0T2JqLnBhcmFtcyk7XG5cbk9KLnJlZ2lzdGVyKCdleHRlbmQnLCByZXRPYmouZXh0ZW5kKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXRPYmo7XG5cbiIsInZhciBPSiwgcHJvcGVydHk7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxuXG4vKlxuQWRkIGEgcHJvcGVydHkgdG8gYW4gb2JqZWN0XG4gKi9cblxucHJvcGVydHkgPSBmdW5jdGlvbihvYmosIG5hbWUsIHZhbHVlLCB3cml0YWJsZSwgY29uZmlndXJhYmxlLCBlbnVtZXJhYmxlKSB7XG4gIGlmICghb2JqKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZGVmaW5lIGEgcHJvcGVydHkgd2l0aG91dCBhbiBPYmplY3QuJyk7XG4gIH1cbiAgaWYgKG5hbWUgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNyZWF0ZSBhIHByb3BlcnR5IHdpdGhvdXQgYSB2YWxpZCBwcm9wZXJ0eSBuYW1lLicpO1xuICB9XG4gIG9ialtuYW1lXSA9IHZhbHVlO1xuICByZXR1cm4gb2JqO1xufTtcblxuT0oucmVnaXN0ZXIoJ3Byb3BlcnR5JywgcHJvcGVydHkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3BlcnR5O1xuXG4iLCJ2YXIgT0osIGRlbGltaXRlZFN0cmluZztcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5kZWxpbWl0ZWRTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcsIG9wdHMpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXRPYmo7XG4gIGRlZmF1bHRzID0ge1xuICAgIG5ld0xpbmVUb0RlbGltaXRlcjogdHJ1ZSxcbiAgICBzcGFjZVRvRGVsaW1pdGVyOiB0cnVlLFxuICAgIHJlbW92ZUR1cGxpY2F0ZXM6IHRydWUsXG4gICAgZGVsaW1pdGVyOiBcIixcIixcbiAgICBpbml0U3RyaW5nOiBPSi50by5zdHJpbmcoc3RyaW5nKVxuICB9O1xuICByZXRPYmogPSB7XG4gICAgYXJyYXk6IFtdLFxuICAgIGRlbGltaXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmV0T2JqLmFycmF5LmpvaW4oZGVmYXVsdHMuZGVsaW1pdGVyKTtcbiAgICB9LFxuICAgIHN0cmluZzogZnVuY3Rpb24oZGVsaW1pdGVyKSB7XG4gICAgICB2YXIgcmV0O1xuICAgICAgaWYgKGRlbGltaXRlciA9PSBudWxsKSB7XG4gICAgICAgIGRlbGltaXRlciA9IGRlZmF1bHRzLmRlbGltaXRlcjtcbiAgICAgIH1cbiAgICAgIHJldCA9ICcnO1xuICAgICAgT0ouZWFjaChyZXRPYmouYXJyYXksIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICBpZiAocmV0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXQgKz0gZGVsaW1pdGVyO1xuICAgICAgICB9XG4gICAgICAgIHJldCArPSB2YWw7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcbiAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmV0T2JqLnN0cmluZygpO1xuICAgIH0sXG4gICAgYWRkOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHJldE9iai5hcnJheS5wdXNoKGRlZmF1bHRzLnBhcnNlKHN0cikpO1xuICAgICAgZGVmYXVsdHMuZGVsZXRlRHVwbGljYXRlcygpO1xuICAgICAgcmV0dXJuIHJldE9iajtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgcmVtb3ZlO1xuICAgICAgcmVtb3ZlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgaWYgKGl0ZW0gIT09IHN0cikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICByZXRPYmouYXJyYXkgPSByZW1vdmUocmV0T2JqLmFycmF5KTtcbiAgICAgIHJldHVybiByZXRPYmo7XG4gICAgfSxcbiAgICBjb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmV0T2JqLmFycmF5Lmxlbmd0aDtcbiAgICB9LFxuICAgIGNvbnRhaW5zOiBmdW5jdGlvbihzdHIsIGNhc2VTZW5zaXRpdmUpIHtcbiAgICAgIHZhciBpc0Nhc2VTZW5zaXRpdmUsIG1hdGNoO1xuICAgICAgaXNDYXNlU2Vuc2l0aXZlID0gT0oudG8uYm9vbChjYXNlU2Vuc2l0aXZlKTtcbiAgICAgIHN0ciA9IE9KLnRvLnN0cmluZyhzdHIpLnRyaW0oKTtcbiAgICAgIGlmIChmYWxzZSA9PT0gaXNDYXNlU2Vuc2l0aXZlKSB7XG4gICAgICAgIHN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgICAgbWF0Y2ggPSByZXRPYmouYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKG1hdFN0cikge1xuICAgICAgICByZXR1cm4gKGlzQ2FzZVNlbnNpdGl2ZSAmJiBPSi50by5zdHJpbmcobWF0U3RyKS50cmltKCkgPT09IHN0cikgfHwgT0oudG8uc3RyaW5nKG1hdFN0cikudHJpbSgpLnRvTG93ZXJDYXNlKCkgPT09IHN0cjtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1hdGNoLmxlbmd0aCA+IDA7XG4gICAgfSxcbiAgICBlYWNoOiBmdW5jdGlvbihjYWxsQmFjaykge1xuICAgICAgcmV0dXJuIHJldE9iai5hcnJheS5mb3JFYWNoKGNhbGxCYWNrKTtcbiAgICB9XG4gIH07XG4gIGRlZmF1bHRzLnBhcnNlID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgdmFyIHJldDtcbiAgICByZXQgPSBPSi50by5zdHJpbmcoc3RyKTtcbiAgICBpZiAoZGVmYXVsdHMubmV3TGluZVRvRGVsaW1pdGVyKSB7XG4gICAgICB3aGlsZSAocmV0LmluZGV4T2YoXCJcXG5cIikgIT09IC0xKSB7XG4gICAgICAgIHJldCA9IHJldC5yZXBsYWNlKC9cXG4vZywgZGVmYXVsdHMuZGVsaW1pdGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRlZmF1bHRzLnNwYWNlVG9EZWxpbWl0ZXIpIHtcbiAgICAgIHdoaWxlIChyZXQuaW5kZXhPZihcIiBcIikgIT09IC0xKSB7XG4gICAgICAgIHJldCA9IHJldC5yZXBsYWNlKFJlZ0V4cChcIiBcIiwgXCJnXCIpLCBkZWZhdWx0cy5kZWxpbWl0ZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAocmV0LmluZGV4T2YoXCIsLFwiKSAhPT0gLTEpIHtcbiAgICAgIHJldCA9IHJldC5yZXBsYWNlKC8sLC9nLCBkZWZhdWx0cy5kZWxpbWl0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9O1xuICBkZWZhdWx0cy5kZWxldGVEdXBsaWNhdGVzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGRlZmF1bHRzLnJlbW92ZUR1cGxpY2F0ZXMpIHtcbiAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHVuaXF1ZTtcbiAgICAgICAgdW5pcXVlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICAgICAgICB2YXIgc2VlbjtcbiAgICAgICAgICBzZWVuID0gbmV3IFNldCgpO1xuICAgICAgICAgIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaWYgKGZhbHNlID09PSBzZWVuLmhhcyhpdGVtKSkge1xuICAgICAgICAgICAgICBzZWVuLmFkZChpdGVtKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldE9iai5hcnJheSA9IHVuaXF1ZShyZXRPYmouYXJyYXkpO1xuICAgICAgfSkoKTtcbiAgICB9XG4gIH07XG4gIChmdW5jdGlvbihhKSB7XG4gICAgaWYgKGEubGVuZ3RoID4gMSAmJiBmYWxzZSA9PT0gT0ouaXMucGxhaW5PYmplY3Qob3B0cykpIHtcbiAgICAgIE9KLmVhY2goYSwgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIGlmIChmYWxzZSA9PT0gT0ouaXMubnVsbE9yRW1wdHkodmFsKSkge1xuICAgICAgICAgIHJldE9iai5hcnJheS5wdXNoKHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nICYmIHN0cmluZy5sZW5ndGggPiAwKSB7XG4gICAgICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdHMpO1xuICAgICAgZGVsaW1pdGVkU3RyaW5nID0gZGVmYXVsdHMucGFyc2Uoc3RyaW5nKTtcbiAgICAgIGRlZmF1bHRzLmluaXRTdHJpbmcgPSBkZWxpbWl0ZWRTdHJpbmc7XG4gICAgICByZXRPYmouYXJyYXkgPSBkZWxpbWl0ZWRTdHJpbmcuc3BsaXQoZGVmYXVsdHMuZGVsaW1pdGVyKTtcbiAgICB9XG4gICAgZGVmYXVsdHMuZGVsZXRlRHVwbGljYXRlcygpO1xuICB9KShhcmd1bWVudHMpO1xuICByZXR1cm4gcmV0T2JqO1xufTtcblxuT0oucmVnaXN0ZXIoJ2RlbGltaXRlZFN0cmluZycsIGRlbGltaXRlZFN0cmluZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVsaW1pdGVkU3RyaW5nO1xuXG4iLCJ2YXIgTm9kZSwgT0osIF8sIGJvZHksIG9qQm9keTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5fID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xuXG5Ob2RlID0gcmVxdWlyZSgnLi9ub2RlJyk7XG5cblxuLypcblBlcnNpc3QgYSBoYW5kbGUgb24gdGhlIGJvZHkgbm9kZVxuICovXG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xufSBlbHNlIHtcbiAgYm9keSA9IG51bGw7XG59XG5cbm9qQm9keSA9IG5ldyBOb2RlO1xuXG5vakJvZHkuZWxlbWVudCA9IGJvZHk7XG5cbk9KLnJlZ2lzdGVyKCdib2R5Jywgb2pCb2R5KTtcblxubW9kdWxlLmV4cG9ydHMgPSBvakJvZHk7XG5cbiIsInZhciBPSiwgY29tcG9uZW50LCBub2RlRmFjdG9yeSwgb2JqO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSgnLi9ub2RlRmFjdG9yeScpO1xuXG5vYmogPSByZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5jb21wb25lbnQgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lciwgdGFnTmFtZSkge1xuICB2YXIgcmV0LCByb290Tm9kZVR5cGUsIHdpZGdldDtcbiAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgIG9wdGlvbnMgPSBvYmoub2JqZWN0KCk7XG4gIH1cbiAgaWYgKCF0YWdOYW1lLnN0YXJ0c1dpdGgoJ3gtJykpIHtcbiAgICB0YWdOYW1lID0gJ3gtJyArIHRhZ05hbWU7XG4gIH1cbiAgd2lkZ2V0ID0gbm9kZUZhY3RvcnkodGFnTmFtZSwgb2JqLm9iamVjdCgpLCBvd25lciwgZmFsc2UpO1xuICByb290Tm9kZVR5cGUgPSBvcHRpb25zLnJvb3ROb2RlVHlwZSB8fCBPSlsnREVGQVVMVF9DT01QT05FTlRfUk9PVF9OT0RFVFlQRSddIHx8ICdkaXYnO1xuICByZXQgPSB3aWRnZXQubWFrZShyb290Tm9kZVR5cGUsIG9wdGlvbnMpO1xuICByZXQuY29tcG9uZW50TmFtZSA9IHRhZ05hbWU7XG4gIHJldC5yZW1vdmUgPSB3aWRnZXQucmVtb3ZlO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0oucmVnaXN0ZXIoJ2NvbXBvbmVudCcsIGNvbXBvbmVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29tcG9uZW50O1xuXG4iLCJ2YXIgT0osIGNvbnRyb2wsIG5vZGVGYWN0b3J5LCBvYmo7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxubm9kZUZhY3RvcnkgPSByZXF1aXJlKCcuL25vZGVGYWN0b3J5Jyk7XG5cbm9iaiA9IHJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cblxuLypcbkNyZWF0ZSBhIHNldCBvZiBIVE1MIEVsZW1lbnRzIHRocm91Z2ggVGhpbkRvbVxuICovXG5cbmNvbnRyb2wgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lciwgdGFnTmFtZSkge1xuICB2YXIgcmV0LCByb290Tm9kZVR5cGU7XG4gIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICBvcHRpb25zID0gb2JqLm9iamVjdCgpO1xuICB9XG4gIGlmICghdGFnTmFtZS5zdGFydHNXaXRoKCd5LScpKSB7XG4gICAgdGFnTmFtZSA9ICd5LScgKyB0YWdOYW1lO1xuICB9XG4gIHJvb3ROb2RlVHlwZSA9IG9wdGlvbnMucm9vdE5vZGVUeXBlIHx8IE9KWydERUZBVUxUX0NPTVBPTkVOVF9ST09UX05PREVUWVBFJ10gfHwgJ2Rpdic7XG4gIHJldCA9IG5vZGVGYWN0b3J5KHJvb3ROb2RlVHlwZSwgb3B0aW9ucywgb3duZXIsIGZhbHNlKTtcbiAgcmV0LmFkZCgnY29udHJvbE5hbWUnLCB0YWdOYW1lKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLnJlZ2lzdGVyKCdjb250cm9sJywgY29udHJvbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udHJvbDtcblxuIiwidmFyICQsIE5vZGUsIE9KLCBUaGluRE9NLCBfLCBlbGVtZW50O1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG5cbl8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5cbk5vZGUgPSByZXF1aXJlKCcuL25vZGUnKTtcblxuVGhpbkRPTSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydUaGluRE9NJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydUaGluRE9NJ10gOiBudWxsKTtcblxuZWxlbWVudCA9IHtcblxuICAvKlxuICBSZXN0b3JlIGFuIEhUTUwgRWxlbWVudCB0aHJvdWdoIFRoaW5Eb21cbiAgICovXG4gIHJlc3RvcmVFbGVtZW50OiBmdW5jdGlvbihlbCwgdGFnKSB7XG4gICAgdmFyIG5vZGU7XG4gICAgaWYgKHRhZyA9PSBudWxsKSB7XG4gICAgICB0YWcgPSBlbC5ub2RlTmFtZTtcbiAgICB9XG4gICAgZWwub2ZXcmFwcGVyIHx8IChub2RlID0gbmV3IE5vZGUpO1xuICAgIG5vZGUuZWxlbWVudCA9IGVsO1xuICAgIHJldHVybiBub2RlO1xuICB9XG59O1xuXG5PSi5yZWdpc3RlcigncmVzdG9yZUVsZW1lbnQnLCBlbGVtZW50LnJlc3RvcmVFbGVtZW50KTtcblxuT0oucmVnaXN0ZXIoJ2lzRWxlbWVudEluRG9tJywgZnVuY3Rpb24oZWxlbWVudElkKSB7XG4gIHJldHVybiBmYWxzZSA9PT0gT0ouaXMubnVsbE9yRW1wdHkoT0ouZ2V0RWxlbWVudChlbGVtZW50SWQpKTtcbn0pO1xuXG5PSi5yZWdpc3RlcignZ2V0RWxlbWVudCcsIGZ1bmN0aW9uKGlkKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZWxlbWVudDtcblxuIiwidmFyIE9KLCBmcmFnbWVudCwgbm9kZUZhY3Rvcnk7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxubm9kZUZhY3RvcnkgPSByZXF1aXJlKCcuL25vZGVGYWN0b3J5Jyk7XG5cbmZyYWdtZW50ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmcmFnLCByZXQ7XG4gIHJldCA9IG51bGw7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgZnJhZyA9IG5ldyBUaGluRE9NKG51bGwsIG51bGwsIGZyYWdtZW50KTtcbiAgICBmcmFnLmlzSW5ET00gPSB0cnVlO1xuICAgIHJldCA9IG5vZGVGYWN0b3J5KGZyYWcpO1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5yZWdpc3RlcignZnJhZ21lbnQnLCBmcmFnbWVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJhZ21lbnQ7XG5cbiIsInZhciBPSiwgYWxsLCBjbG9zZWQsIGV4cG9ydHMsIGZuLCBpLCBsZW4sIGxvb3BOYW1lLCBub2RlRmFjdG9yeSwgb2JqLCBvcGVuO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL29qSW5pdCcpO1xuXG5vYmogPSByZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5ub2RlRmFjdG9yeSA9IHJlcXVpcmUoJy4vbm9kZUZhY3RvcnknKTtcblxuY2xvc2VkID0gWydhYmJyJywgJ2Fjcm9ueW0nLCAnYXBwbGV0JywgJ2FydGljbGUnLCAnYXNpZGUnLCAnYXVkaW8nLCAnYicsICdiZG8nLCAnYmlnJywgJ2Jsb2NrcXVvdGUnLCAnYnV0dG9uJywgJ2NhbnZhcycsICdjYXB0aW9uJywgJ2NlbnRlcicsICdjaXRlJywgJ2NvZGUnLCAnY29sZ3JvdXAnLCAnZGF0YWxpc3QnLCAnZGQnLCAnZGVsJywgJ2RldGFpbHMnLCAnZGZuJywgJ2RpcicsICdkaXYnLCAnZGwnLCAnZHQnLCAnZW0nLCAnZmllbGRzZXQnLCAnZmlnY2FwdGlvbicsICdmaWd1cmUnLCAnZm9udCcsICdmb290ZXInLCAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnLCAnaGVhZCcsICdoZWFkZXInLCAnaGdyb3VwJywgJ2h0bWwnLCAnaScsICdpZnJhbWUnLCAnaW5zJywgJ2tiZCcsICdsYWJlbCcsICdsZWdlbmQnLCAnbGknLCAnbWFwJywgJ21hcmsnLCAnbWVudScsICdtZXRlcicsICduYXYnLCAnbm9mcmFtZXMnLCAnbm9zY3JpcHQnLCAnb2JqZWN0JywgJ29wdGdyb3VwJywgJ29wdGlvbicsICdvdXRwdXQnLCAncCcsICdwcmUnLCAncHJvZ3Jlc3MnLCAncScsICdycCcsICdydCcsICdydWJ5JywgJ3MnLCAnc2FtcCcsICdzZWN0aW9uJywgJ3NtYWxsJywgJ3NwYW4nLCAnc3RyaWtlJywgJ3N0cm9uZycsICdzdHlsZScsICdzdWInLCAnc3VtbWFyeScsICdzdXAnLCAndGJvZHknLCAndGQnLCAndGZvb3QnLCAndGgnLCAndGltZScsICd0aXRsZScsICd0cicsICd0dCcsICd1JywgJ3ZhcicsICd2aWRlbycsICd4bXAnXTtcblxub3BlbiA9ICdhcmVhIGJhc2UgY29sIGNvbW1hbmQgY3NzIGVtYmVkIGhyIGltZyBrZXlnZW4gbWV0YSBwYXJhbSBzb3VyY2UgdHJhY2sgd2JyJy5zcGxpdCgnICcpO1xuXG5hbGwgPSBjbG9zZWQuY29uY2F0KG9wZW4pO1xuXG5leHBvcnRzID0ge307XG5cbmZuID0gZnVuY3Rpb24odGFnKSB7XG4gIHZhciBtZXRob2Q7XG4gIG1ldGhvZCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeSkge1xuICAgIHZhciBkZWZhdWx0cywgcmV0O1xuICAgIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgICBvd25lciA9IE9KLmJvZHk7XG4gICAgfVxuICAgIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgICBjYWxsZWRGcm9tRmFjdG9yeSA9IGZhbHNlO1xuICAgIH1cbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHByb3BzOiB7fSxcbiAgICAgIHN0eWxlczoge30sXG4gICAgICBldmVudHM6IHt9XG4gICAgfTtcbiAgICBvYmouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICByZXQgPSBub2RlRmFjdG9yeSh0YWcsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG4gIG1ldGhvZC5kZWZhdWx0QmVoYXZpb3IgPSB0cnVlO1xuICBPSi5ub2Rlcy5yZWdpc3Rlcih0YWcsIG1ldGhvZCk7XG4gIHJldHVybiBleHBvcnRzW3RhZ10gPSBtZXRob2Q7XG59O1xuZm9yIChpID0gMCwgbGVuID0gYWxsLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gIGxvb3BOYW1lID0gYWxsW2ldO1xuICBmbihsb29wTmFtZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcblxuIiwidmFyIE9KLCBpbnB1dDtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5cbi8qXG5DcmVhdGUgYW4gT0ogSW5wdXQgT2JqZWN0IHRocm91Z2ggT0oubm9kZXMuaW5wdXRcbiAqL1xuXG5pbnB1dCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciByZXQ7XG4gIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICBvcHRpb25zID0gT0oub2JqZWN0KCk7XG4gIH1cbiAgaWYgKCFvd25lcikge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNyZWF0ZSBhbiBpbnB1dCB3aXRob3V0IGEgcGFyZW50Jyk7XG4gIH1cbiAgaWYgKCFvcHRpb25zLnByb3BzIHx8ICFvcHRpb25zLnByb3BzLnR5cGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgYW4gaW5wdXQgd2l0aG91dCBhbiBpbnB1dCB0eXBlJyk7XG4gIH1cbiAgcmV0ID0gb3duZXIubWFrZSgnaW5wdXQnLCBvcHRpb25zKTtcbiAgcmV0LmFkZCgnaW5wdXROYW1lJywgb3B0aW9ucy5wcm9wcy50eXBlKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLnJlZ2lzdGVyKCdpbnB1dCcsIGlucHV0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dDtcblxuIiwidmFyICQsIE5vZGUsIE9KLCBtZXRob2RzO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG5cbm1ldGhvZHMgPSB7fTtcblxuTm9kZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gTm9kZShwYXJlbnQpIHt9XG5cbiAgTm9kZS5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKHRhZ05hbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgbWV0aG9kLCBuZXdPSk5vZGU7XG4gICAgaWYgKHRhZ05hbWUubWFrZSkge1xuICAgICAgcmV0dXJuIHRhZ05hbWUubWFrZSh0aGlzLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWV0aG9kID0gbWV0aG9kc1t0YWdOYW1lXTtcbiAgICAgIGlmIChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIG1ldGhvZChvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1ldGhvZCA9IE9KLm5vZGVzW3RhZ05hbWVdIHx8IE9KLmNvbXBvbmVudHNbdGFnTmFtZV0gfHwgT0ouY29udHJvbHNbdGFnTmFtZV0gfHwgT0ouaW5wdXRzW3RhZ05hbWVdO1xuICAgICAgICBpZiAobWV0aG9kICYmICFtZXRob2QuZGVmYXVsdEJlaGF2aW9yKSB7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZChvcHRpb25zLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdPSk5vZGUgPSBuZXcgTm9kZSgpO1xuICAgICAgICAgIG5ld09KTm9kZS5lbGVtZW50ID0gb2pDcmVhdGVFbGVtZW50KHRoaXMuZWxlbWVudCwgdGFnTmFtZSwgb3B0aW9ucyk7XG4gICAgICAgICAgcmV0dXJuIG5ld09KTm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBOb2RlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXNbbmFtZV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50Lm9qV3JhcHBlciA9IHRoaXM7XG4gIH07XG5cbiAgTm9kZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBwYXJlbnQsIHZhbHVlO1xuICAgIHZhbHVlID0gdGhpc1tuYW1lXTtcbiAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgcGFyZW50ID0gdGhpcy5lbGVtZW50O1xuICAgICAgd2hpbGUgKHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgIGlmIChwYXJlbnQub2pXcmFwcGVyKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcmVudC5valdyYXBwZXIuZ2V0KG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgTm9kZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJC5zaG93KCk7XG4gICAgcmV0dXJuIG9qQ3JlYXRlRWxlbWVudC5vblNob3codGhpcy5lbGVtZW50KTtcbiAgfTtcblxuICBOb2RlLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgcmV0dXJuIHRoaXMuJC5hZGRDbGFzcygnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgfTtcblxuICBOb2RlLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiQucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gdGhpcy4kLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICB9O1xuXG4gIHJldHVybiBOb2RlO1xuXG59KSgpO1xuXG5bJ29uJywgJ2VtcHR5JywgJ3RleHQnLCAncmVtb3ZlQ2xhc3MnLCAnYWRkQ2xhc3MnLCAnaGFzQ2xhc3MnLCAnaGlkZScsICdhdHRyJywgJ3JlbW92ZUF0dHInLCAnY3NzJywgJ3JlbW92ZScsICdhcHBlbmQnLCAndmFsJywgJ2h0bWwnLCAncHJvcCcsICd0cmlnZ2VyJ10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgcmV0dXJuIE5vZGUucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgalF1ZXJ5V3JhcHBlcjtcbiAgICBqUXVlcnlXcmFwcGVyID0gdGhpcy4kO1xuICAgIHJldHVybiBqUXVlcnlXcmFwcGVyW21ldGhvZF0uYXBwbHkoalF1ZXJ5V3JhcHBlciwgYXJndW1lbnRzKTtcbiAgfTtcbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTm9kZS5wcm90b3R5cGUsICckJywge1xuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBqUXVlcnlXcmFwcGVyO1xuICAgIGpRdWVyeVdyYXBwZXIgPSAkKHRoaXMuZWxlbWVudCk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICckJywge1xuICAgICAgdmFsdWU6IGpRdWVyeVdyYXBwZXJcbiAgICB9KTtcbiAgICByZXR1cm4galF1ZXJ5V3JhcHBlcjtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gT0ouTm9kZSA9IE5vZGU7XG5cbiIsInZhciBOb2RlLCBOb2RlRmFjdG9yeSwgT0osIFRoaW5ET00sIF8sIGRlZmF1bHRDcmVhdGVFbGVtZW50LCBnZXROb2RlRnJvbUZhY3RvcnksIG1ha2UsXG4gIHNsaWNlID0gW10uc2xpY2U7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxuXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcblxuVGhpbkRPTSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydUaGluRE9NJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydUaGluRE9NJ10gOiBudWxsKTtcblxuTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpO1xuXG5Ob2RlRmFjdG9yeSA9IChmdW5jdGlvbigpIHtcbiAgTm9kZUZhY3RvcnkucHJvdG90eXBlLm9qTm9kZSA9IG51bGw7XG5cbiAgTm9kZUZhY3RvcnkuZ2V0ID0gZnVuY3Rpb24oaWQsIHRhZ05hbWUpIHtcbiAgICB2YXIgZWwsIHJldCwgdGhpbkVsO1xuICAgIGlmICh0YWdOYW1lID09IG51bGwpIHtcbiAgICAgIHRhZ05hbWUgPSAnZGl2JztcbiAgICB9XG4gICAgcmV0ID0gbnVsbDtcbiAgICBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoZWwpIHtcbiAgICAgIHRoaW5FbCA9IE9KLnJlc3RvcmVFbGVtZW50KGVsLCB0YWdOYW1lKTtcbiAgICB9XG4gICAgaWYgKHRoaW5FbCkge1xuICAgICAgcmV0ID0gbmV3IE5vZGVGYWN0b3J5KG51bGwsIG51bGwsIG51bGwsIGZhbHNlLCB0aGluRWwpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9O1xuXG4gIE5vZGVGYWN0b3J5LnByb3RvdHlwZS5fbWFrZUFkZCA9IGZ1bmN0aW9uKHRhZ05hbWUsIGNvdW50KSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9wdHMpIHtcbiAgICAgICAgdmFyIG1ldGhvZCwgbnU7XG4gICAgICAgIG1ldGhvZCA9IE9KLm5vZGVzW3RhZ05hbWVdIHx8IE9KLmNvbXBvbmVudHNbdGFnTmFtZV0gfHwgT0ouY29udHJvbHNbdGFnTmFtZV0gfHwgT0ouaW5wdXRzW3RhZ05hbWVdO1xuICAgICAgICBpZiAobWV0aG9kKSB7XG4gICAgICAgICAgbnUgPSBtZXRob2Qob3B0cywgX3RoaXMub2pOb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBudSA9IE9KLmNvbXBvbmVudChudWxsLCBfdGhpcy5vak5vZGUsIHRhZ05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gIH07XG5cbiAgTm9kZUZhY3RvcnkucHJvdG90eXBlLl9tYWtlVW5pcXVlSWQgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIHZhciBpZDtcbiAgICBpZiAoT0ouR0VORVJBVEVfVU5JUVVFX0lEUykge1xuICAgICAgY291bnQgKz0gMTtcbiAgICAgIGlmIChjb3VudCA8PSB0aGlzLm93bmVyLmNvdW50KSB7XG4gICAgICAgIGNvdW50ID0gdGhpcy5vd25lci5jb3VudCArIDE7XG4gICAgICB9XG4gICAgICB0aGlzLm93bmVyLmNvdW50ID0gY291bnQ7XG4gICAgICBpZiAoIXRoaXMub2pOb2RlLmdldElkKCkpIHtcbiAgICAgICAgaWQgPSB0aGlzLm93bmVyLmdldElkKCkgfHwgJyc7XG4gICAgICAgIGlkICs9IHRoaXMub2pOb2RlLnRhZ05hbWUgKyBjb3VudDtcbiAgICAgICAgdGhpcy5vak5vZGUuYXR0cignaWQnLCBpZCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIE5vZGVGYWN0b3J5LnByb3RvdHlwZS5fYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLm9qTm9kZSkge1xuICAgICAgcmV0dXJuIF8uZm9yT3duKHRoaXMub3B0aW9ucy5ldmVudHMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2ssIGlzTWV0aG9kO1xuICAgICAgICAgIGlzTWV0aG9kID0gcmVxdWlyZSgnLi4vdG9vbHMvaXMnKTtcbiAgICAgICAgICBpZiAoaXNNZXRob2QubWV0aG9kKHZhbCkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudDtcbiAgICAgICAgICAgICAgZXZlbnQgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbC5hcHBseShudWxsLCBldmVudCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXMub2pOb2RlLiQub24oa2V5LCBjYWxsYmFjayk7XG4gICAgICAgICAgICBfdGhpcy5vak5vZGUuYWRkKGtleSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBOb2RlRmFjdG9yeSh0YWcxLCBvcHRpb25zMSwgb3duZXIxLCB0aGluTm9kZSkge1xuICAgIHRoaXMudGFnID0gdGFnMTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zMTtcbiAgICB0aGlzLm93bmVyID0gb3duZXIxO1xuICAgIHRoaXMudGhpbk5vZGUgPSB0aGluTm9kZSAhPSBudWxsID8gdGhpbk5vZGUgOiBudWxsO1xuICAgIGlmICh0aGlzLnRhZyAmJiAhdGhpcy50aGluTm9kZSkge1xuICAgICAgdGhpcy50aGluTm9kZSA9IG5ldyBUaGluRE9NKHRoaXMudGFnLCB0aGlzLm9wdGlvbnMucHJvcHMpO1xuICAgICAgdGhpcy50aGluTm9kZS5hZGQoJ3RhZ05hbWUnLCB0aGlzLnRhZyk7XG4gICAgICB0aGlzLnRoaW5Ob2RlLmNzcyh0aGlzLm9wdGlvbnMuc3R5bGVzKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudGV4dCkge1xuICAgICAgICB0aGlzLnRoaW5Ob2RlLnRleHQodGhpcy5vcHRpb25zLnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5vd25lcikge1xuICAgICAgdGhpcy5tYWtlKCk7XG4gICAgfVxuICB9XG5cbiAgTm9kZUZhY3RvcnkucHJvdG90eXBlLmFkZE1ha2VNZXRob2QgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIHZhciBtZXRob2RzO1xuICAgIG1ldGhvZHMgPSBPSi5vYmplY3QoKTtcbiAgICB0aGlzLm9qTm9kZS5tYWtlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odGFnTmFtZSwgb3B0cykge1xuICAgICAgICB2YXIgbWV0aG9kO1xuICAgICAgICBtZXRob2QgPSBtZXRob2RzW3RhZ05hbWVdO1xuICAgICAgICBpZiAoIW1ldGhvZCkge1xuICAgICAgICAgIG1ldGhvZCA9IF90aGlzLl9tYWtlQWRkKHRhZ05hbWUsIF90aGlzLm9qTm9kZSwgY291bnQpO1xuICAgICAgICAgIG1ldGhvZHNbdGFnTmFtZV0gPSBtZXRob2Q7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1ldGhvZChvcHRzKTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMub2pOb2RlO1xuICB9O1xuXG4gIE5vZGVGYWN0b3J5LnByb3RvdHlwZS5tYWtlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvdW50LCBmaW5hbGl6ZSwgcmVmO1xuICAgIHRoaXMub2pOb2RlID0gbnVsbDtcbiAgICBpZiAoKHJlZiA9IHRoaXMudGhpbk5vZGUpICE9IG51bGwgPyByZWYuaXNGdWxseUluaXQgOiB2b2lkIDApIHtcbiAgICAgIHRoaXMub2pOb2RlID0gdGhpcy50aGluTm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vak5vZGUgPSBuZXcgTm9kZSh0aGlzLnRoaW5Ob2RlLCB0aGlzLm93bmVyKTtcbiAgICAgIGNvdW50ID0gKHRoaXMub3duZXIuY291bnQgKyAxKSB8fCAxO1xuICAgICAgaWYgKHRoaXMudGhpbk5vZGUudGFnTmFtZSAhPT0gJ2JvZHknICYmICF0aGlzLnRoaW5Ob2RlLmlzSW5ET00gJiYgIXRoaXMub2pOb2RlLmlzSW5ET00pIHtcbiAgICAgICAgdGhpcy5fbWFrZVVuaXF1ZUlkKGNvdW50KTtcbiAgICAgICAgdGhpcy5vd25lci5hcHBlbmQodGhpcy5vak5vZGVbMF0pO1xuICAgICAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnRoaW5Ob2RlLmlzSW5ET00gPSB0cnVlO1xuICAgICAgdGhpcy5vak5vZGUuaXNJbkRPTSA9IHRydWU7XG4gICAgICB0aGlzLmFkZE1ha2VNZXRob2QoY291bnQpO1xuICAgICAgdGhpcy5vak5vZGUuaXNGdWxseUluaXQgPSB0cnVlO1xuICAgICAgZmluYWxpemUgPSBfLm9uY2UodGhpcy5vak5vZGUuZmluYWxpemUgfHwgT0oubm9vcCk7XG4gICAgICB0aGlzLm9qTm9kZS5maW5hbGl6ZSA9IGZpbmFsaXplO1xuICAgICAgZmluYWxpemUodGhpcy5vak5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vak5vZGU7XG4gIH07XG5cbiAgcmV0dXJuIE5vZGVGYWN0b3J5O1xuXG59KSgpO1xuXG5kZWZhdWx0Q3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKHBhcmVudCwgdGFnLCBvcHRpb25zKSB7XG4gIHZhciBrZXksIG5ld0VsZW1lbnQsIHJlZiwgcmVmMSwgcmVmMiwgdmFsdWU7XG4gIG5ld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gIGlmIChvcHRpb25zKSB7XG4gICAgcmVmID0gb3B0aW9ucy5wcm9wcztcbiAgICBmb3IgKGtleSBpbiByZWYpIHtcbiAgICAgIHZhbHVlID0gcmVmW2tleV07XG4gICAgICBuZXdFbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgcmVmMSA9IG9wdGlvbnMuZXZlbnRzO1xuICAgIGZvciAoa2V5IGluIHJlZjEpIHtcbiAgICAgIHZhbHVlID0gcmVmMVtrZXldO1xuICAgICAgJChuZXdFbGVtZW50KS5vbihrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgcmVmMiA9IG9wdGlvbnMuc3R5bGVzO1xuICAgIGZvciAoa2V5IGluIHJlZjIpIHtcbiAgICAgIHZhbHVlID0gcmVmMltrZXldO1xuICAgICAgJChuZXdFbGVtZW50KS5jc3Moa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHZhbHVlID0gb3B0aW9ucy50ZXh0O1xuICAgIGlmICh2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAkKG5ld0VsZW1lbnQpLnRleHQodmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyZW50ICE9IG51bGwgPyBwYXJlbnQuYXBwZW5kQ2hpbGQobmV3RWxlbWVudCkgOiB2b2lkIDA7XG59O1xuXG5nZXROb2RlRnJvbUZhY3RvcnkgPSBmdW5jdGlvbih0YWcsIG9wdGlvbnMsIG93bmVyLCBpc0NhbGxlZEZyb21GYWN0b3J5LCBub2RlKSB7XG4gIHZhciBuZXdPSk5vZGU7XG4gIG5ld09KTm9kZSA9IG5ldyBOb2RlKCk7XG4gIGlmICghd2luZG93Lm9qQ3JlYXRlRWxlbWVudCkge1xuICAgIHdpbmRvdy5vakNyZWF0ZUVsZW1lbnQgPSBkZWZhdWx0Q3JlYXRlRWxlbWVudDtcbiAgfVxuICBuZXdPSk5vZGUuZWxlbWVudCA9IG9qQ3JlYXRlRWxlbWVudChvd25lci5lbGVtZW50LCB0YWcgfHwgJ2RpdicsIG9wdGlvbnMpO1xuICByZXR1cm4gbmV3T0pOb2RlO1xufTtcblxuT0oucmVnaXN0ZXIoJ25vZGVGYWN0b3J5JywgZ2V0Tm9kZUZyb21GYWN0b3J5KTtcblxubWFrZSA9IGZ1bmN0aW9uKHRhZywgb3B0aW9ucykge1xuICB2YXIgbmV3T0pOb2RlO1xuICBuZXdPSk5vZGUgPSBuZXcgTm9kZSgpO1xuICBuZXdPSk5vZGUuZWxlbWVudCA9IG9qQ3JlYXRlRWxlbWVudChudWxsLCB0YWcgfHwgJ2RpdicsIG9wdGlvbnMpO1xuICByZXR1cm4gbmV3T0pOb2RlO1xufTtcblxuT0oucmVnaXN0ZXIoJ21ha2UnLCBtYWtlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXROb2RlRnJvbUZhY3Rvcnk7XG5cbiIsInZhciBPSiwgbm9kZSwgbm9kZUZhY3RvcnksIG5vZGVOYW1lLFxuICBzbGljZSA9IFtdLnNsaWNlO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbm5vZGVOYW1lID0gJ2EnO1xuXG5ub2RlID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5KSB7XG4gIHZhciBjbGljaywgZGVmYXVsdHMsIG5ld0NsaWNrLCByZXQsIHRvZ2dsZSwgdG9nZ2xlU3RhdGU7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgaWQ6ICcnLFxuICAgICAgXCJjbGFzc1wiOiAnJyxcbiAgICAgIHRleHQ6ICcnLFxuICAgICAgaHJlZjogJ2phdmFTY3JpcHQ6dm9pZCgwKTsnLFxuICAgICAgdHlwZTogJycsXG4gICAgICB0aXRsZTogJycsXG4gICAgICByZWw6ICcnLFxuICAgICAgbWVkaWE6ICcnLFxuICAgICAgdGFyZ2V0OiAnJ1xuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICB0b2dnbGVTdGF0ZSA9ICdvZmYnO1xuICB0b2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodG9nZ2xlU3RhdGUgPT09ICdvbicpIHtcbiAgICAgIHRvZ2dsZVN0YXRlID0gJ29mZic7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0b2dnbGVTdGF0ZSA9PT0gJ29mZicpIHtcbiAgICAgICAgdG9nZ2xlU3RhdGUgPSAnb24nO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgaWYgKGRlZmF1bHRzLmV2ZW50cy5jbGljayAhPT0gT0oubm9vcCkge1xuICAgIGNsaWNrID0gZGVmYXVsdHMuZXZlbnRzLmNsaWNrO1xuICAgIG5ld0NsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXZlbnQsIHJldFZhbDtcbiAgICAgIGV2ZW50ID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICB0b2dnbGUoKTtcbiAgICAgIHJldFZhbCA9IGNsaWNrLmFwcGx5KG51bGwsIGV2ZW50KTtcbiAgICAgIGlmIChkZWZhdWx0cy5ocmVmID09PSAnIycpIHtcbiAgICAgICAgcmV0VmFsID0gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0VmFsO1xuICAgIH07XG4gICAgZGVmYXVsdHMuZXZlbnRzLmNsaWNrID0gbmV3Q2xpY2s7XG4gIH0gZWxzZSB7XG4gICAgZGVmYXVsdHMuZXZlbnRzLmNsaWNrID0gdG9nZ2xlO1xuICB9XG4gIHJldCA9IG5vZGVGYWN0b3J5KG5vZGVOYW1lLCBkZWZhdWx0cywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5KTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLm5vZGVzLnJlZ2lzdGVyKG5vZGVOYW1lLCBub2RlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuXG4iLCJ2YXIgT0osIG5vZGUsIG5vZGVGYWN0b3J5LCBub2RlTmFtZSwgdG87XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxubm9kZUZhY3RvcnkgPSByZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxudG8gPSByZXF1aXJlKCcuLi90b29scy90bycpO1xuXG5ub2RlTmFtZSA9ICdicic7XG5cbm5vZGUgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpIHtcbiAgdmFyIGRlZmF1bHRzLCBpLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge30sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfSxcbiAgICBudW1iZXI6IDFcbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgaSA9IDA7XG4gIHdoaWxlIChpIDwgdG8ubnVtYmVyKGRlZmF1bHRzLm51bWJlcikpIHtcbiAgICByZXQgPSBub2RlRmFjdG9yeShub2RlTmFtZSwgZGVmYXVsdHMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeSk7XG4gICAgaSArPSAxO1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5ub2Rlcy5yZWdpc3Rlcihub2RlTmFtZSwgbm9kZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZTtcblxuIiwidmFyIE9KLCBub2RlLCBub2RlRmFjdG9yeSwgbm9kZU5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxubm9kZUZhY3RvcnkgPSByZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxubm9kZU5hbWUgPSAnZm9ybSc7XG5cbm5vZGUgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgYWN0aW9uOiAnJyxcbiAgICAgIG1ldGhvZDogJycsXG4gICAgICBuYW1lOiAnJ1xuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBub2RlRmFjdG9yeShub2RlTmFtZSwgZGVmYXVsdHMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeSk7XG4gIHJldC5hZGQoJ3ZhbGlkYXRvcicsIHJldC4kLnZhbGlkYXRlKHtcbiAgICBoaWdobGlnaHQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciAkZWxtO1xuICAgICAgJGVsbSA9ICQoZWxlbWVudCk7XG4gICAgICAkZWxtLmF0dHIoJ09KX2ludmFsaWQnLCAnMScpO1xuICAgICAgJGVsbS5hbmltYXRlKHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmVkJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIHVuaGlnaGxpZ2h0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgJGVsbTtcbiAgICAgICRlbG0gPSAkKGVsZW1lbnQpO1xuICAgICAgaWYgKCRlbG0uYXR0cignT0pfaW52YWxpZCcpID09PSAnMScpIHtcbiAgICAgICAgJGVsbS5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAneWVsbG93Jyk7XG4gICAgICAgICRlbG0uYXR0cignT0pfaW52YWxpZCcsICcwJyk7XG4gICAgICAgIHNldFRpbWVvdXQoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkZWxtLmFuaW1hdGUoe1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pLCA1MDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9KSk7XG4gIHJldC5hZGQoJ2lzRm9ybVZhbGlkJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJldC4kLnZhbGlkKCkgJiYgKCFyZXQudmFsaWRhdG9yLmludmFsaWRFbGVtZW50cygpIHx8IHJldC52YWxpZGF0b3IuaW52YWxpZEVsZW1lbnRzKCkubGVuZ3RoID09PSAwKTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5ub2Rlcy5yZWdpc3Rlcihub2RlTmFtZSwgbm9kZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZTtcblxuIiwidmFyIE9KLCBlbnVtcywgbm9kZSwgbm9kZUZhY3RvcnksIG5vZGVOYW1lLFxuICBzbGljZSA9IFtdLnNsaWNlO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmVudW1zID0gcmVxdWlyZSgnLi4vdG9vbHMvZW51bXMnKTtcblxubm9kZU5hbWUgPSAnaW5wdXQnO1xuXG5ub2RlID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5KSB7XG4gIHZhciBkZWZhdWx0cywgbmV3Q2hhbmdlLCBuZXdDbGljaywgbmV3Rm9jdXNvdXQsIG9sZENoYW5nZSwgb2xkQ2xpY2ssIG9sZEZvY3Vzb3V0LCByZXQsIHN5bmNWYWx1ZSwgdGhpc1R5cGU7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgdmFsdWU6ICcnXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3AsXG4gICAgICBjaGFuZ2U6IE9KLm5vb3AsXG4gICAgICBmb2N1c291dDogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgaWYgKCFkZWZhdWx0cy5wcm9wcy50eXBlIHx8ICFlbnVtcy5pbnB1dFR5cGVzW2RlZmF1bHRzLnByb3BzLnR5cGVdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBtYXRjaGluZyBpbnB1dCB0eXBlIGZvciB7JyArIGRlZmF1bHRzLnByb3BzLnR5cGUgKyAnfSBjb3VsZCBiZSBmb3VuZC4nKTtcbiAgfVxuICB0aGlzVHlwZSA9IGVudW1zLmlucHV0VHlwZXNbZGVmYXVsdHMucHJvcHMudHlwZV07XG4gIHN5bmNWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpc1R5cGUpIHtcbiAgICAgIGNhc2UgZW51bXMuaW5wdXRUeXBlcy5jaGVja2JveDpcbiAgICAgICAgcmV0LnZhbHVlID0gcmV0LiQuaXMoJzpjaGVja2VkJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBlbnVtcy5pbnB1dFR5cGVzLnJhZGlvOlxuICAgICAgICByZXQudmFsdWUgPSByZXQuJC5maW5kKCc6Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldC52YWx1ZSA9IHJldC52YWwoKTtcbiAgICB9XG4gICAgZGVmYXVsdHMucHJvcHMudmFsdWUgPSByZXQudmFsdWU7XG4gICAgcmV0dXJuIHJldC52YWx1ZTtcbiAgfTtcblxuICAvKlxuICAgIENsaWNrIGJpbmRpbmcuIElmIHRoZSBjYWxsZXIgZGVmaW5lZCBhIGNsaWNrIGhhbmRsZXIsXG4gICAgd3JhcCBpdCwgc3luYyB0aGUgdmFsdWUgb2YgdGhlIGlucHV0IGZpcnN0LFxuICAgIHRoZW4gY2FsbCB0aGUgZGVmaW5lZCBjbGljayBoYW5kbGVyIHdpdGggdGhlIGxhdGVzdCB2YWx1ZS5cbiAgICovXG4gIG9sZENsaWNrID0gZGVmYXVsdHMuZXZlbnRzLmNsaWNrO1xuICBpZiAob2xkQ2xpY2sgJiYgb2xkQ2xpY2sgIT09IE9KLm5vb3ApIHtcbiAgICBuZXdDbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV2ZW50O1xuICAgICAgZXZlbnQgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIHN5bmNWYWx1ZSgpO1xuICAgICAgcmV0dXJuIG9sZENsaWNrLmFwcGx5KG51bGwsIFtyZXQudmFsdWVdLmNvbmNhdChzbGljZS5jYWxsKGV2ZW50KSkpO1xuICAgIH07XG4gICAgZGVmYXVsdHMuZXZlbnRzLmNsaWNrID0gbmV3Q2xpY2s7XG4gIH1cblxuICAvKlxuICAgIENoYW5nZSBiaW5kaW5nLiBJZiB0aGUgY2FsbGVyIGRlZmluZWQgYSBjaGFuZ2UgaGFuZGxlcixcbiAgICB3cmFwIGl0LCBzeW5jIHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQgZmlyc3QsXG4gICAgdGhlbiBjYWxsIHRoZSBkZWZpbmVkIGNoYW5nZSBoYW5kbGVyIHdpdGggdGhlIGxhdGVzdCB2YWx1ZS5cbiAgICovXG4gIG9sZENoYW5nZSA9IGRlZmF1bHRzLmV2ZW50cy5jaGFuZ2U7XG4gIGlmIChvbGRDaGFuZ2UgJiYgb2xkQ2hhbmdlICE9PSBPSi5ub29wKSB7XG4gICAgbmV3Q2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXZlbnQ7XG4gICAgICBldmVudCA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgc3luY1ZhbHVlKCk7XG4gICAgICByZXR1cm4gb2xkQ2hhbmdlLmFwcGx5KG51bGwsIFtyZXQudmFsdWVdLmNvbmNhdChzbGljZS5jYWxsKGV2ZW50KSkpO1xuICAgIH07XG4gICAgZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSA9IG5ld0NoYW5nZTtcbiAgfVxuXG4gIC8qXG4gICAgT24gRm9jdXMgT3V0IGJpbmRpbmcuIEFsd2F5cyB1c2UgdGhlIGV2ZW50IHRvIHVwZGF0ZSB0aGUgaW50ZXJuYWxcbiAgICB2YWx1ZSBvZiB0aGUgY29udHJvbDsgYW5kIGlmIHRoZSBjYWxsZXIgZGVmaW5lZCBhIGZvY3Vzb3V0IGV2ZW50LFxuICAgIHdyYXAgaXQgYW5kIGludm9rZSBpdCB3aXRoIHRoZSBsYXRlc3QgdmFsdWVcbiAgICovXG4gIG9sZEZvY3Vzb3V0ID0gZGVmYXVsdHMuZXZlbnRzLmZvY3Vzb3V0O1xuICBuZXdGb2N1c291dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBldmVudDtcbiAgICBldmVudCA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHN5bmNWYWx1ZSgpO1xuICAgIGlmIChvbGRGb2N1c291dCAmJiBvbGRGb2N1c291dCAhPT0gT0oubm9vcCkge1xuICAgICAgcmV0dXJuIG9sZEZvY3Vzb3V0LmFwcGx5KG51bGwsIFtyZXQudmFsdWVdLmNvbmNhdChzbGljZS5jYWxsKGV2ZW50KSkpO1xuICAgIH1cbiAgfTtcbiAgZGVmYXVsdHMuZXZlbnRzLmZvY3Vzb3V0ID0gbmV3Rm9jdXNvdXQ7XG4gIHJldCA9IG5vZGVGYWN0b3J5KG5vZGVOYW1lLCBkZWZhdWx0cywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5KTtcbiAgcmV0LnZhbHVlID0gZGVmYXVsdHMucHJvcHMudmFsdWU7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5ub2Rlcy5yZWdpc3Rlcihub2RlTmFtZSwgbm9kZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZTtcblxuIiwidmFyIE9KLCBub2RlLCBub2RlRmFjdG9yeSwgbm9kZU5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxubm9kZUZhY3RvcnkgPSByZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxubm9kZU5hbWUgPSAnb2wnO1xuXG5ub2RlID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5KSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBpZiAoY2FsbGVkRnJvbUZhY3RvcnkgPT0gbnVsbCkge1xuICAgIGNhbGxlZEZyb21GYWN0b3J5ID0gZmFsc2U7XG4gIH1cbiAgZGVmYXVsdHMgPSB7XG4gICAgcHJvcHM6IHt9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gbm9kZUZhY3Rvcnkobm9kZU5hbWUsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0oubm9kZXMucmVnaXN0ZXIobm9kZU5hbWUsIG5vZGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGU7XG5cbiIsInZhciBPSiwgbm9kZSwgbm9kZUZhY3RvcnksIG5vZGVOYW1lLFxuICBzbGljZSA9IFtdLnNsaWNlO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbm5vZGVOYW1lID0gJ3NlbGVjdCc7XG5cbm5vZGUgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpIHtcbiAgdmFyIGNoYW5nZSwgY2xpY2ssIGRlZmF1bHRzLCBoYXNFbXB0eSwgbmV3Q2hhbmdlLCBuZXdDbGljaywgcmV0LCBzeW5jVmFsdWUsIHZhbHVlLCB2YWx1ZXM7XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgc2VsZWN0ZWQ6ICcnLFxuICAgICAgbXVsdGlwbGU6IGZhbHNlXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIHZhbHVlczogW10sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcCxcbiAgICAgIGNoYW5nZTogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgdmFsdWUgPSAnJztcbiAgdmFsdWVzID0gW107XG4gIGhhc0VtcHR5ID0gZmFsc2U7XG4gIHN5bmNWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZSA9IHJldC52YWwoKTtcbiAgfTtcbiAgaWYgKGRlZmF1bHRzLmV2ZW50cy5jbGljayAhPT0gT0oubm9vcCkge1xuICAgIGNsaWNrID0gZGVmYXVsdHMuZXZlbnRzLmNsaWNrO1xuICAgIG5ld0NsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXZlbnQsIHJldHZhbDtcbiAgICAgIGV2ZW50ID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICByZXR2YWwgPSBjbGljay5hcHBseShudWxsLCBldmVudCk7XG4gICAgICBzeW5jVmFsdWUoKTtcbiAgICAgIHJldHVybiByZXR2YWw7XG4gICAgfTtcbiAgICBkZWZhdWx0cy5ldmVudHMuY2xpY2sgPSBuZXdDbGljaztcbiAgfVxuICBpZiAoZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSAhPT0gT0oubm9vcCkge1xuICAgIGNoYW5nZSA9IGRlZmF1bHRzLmV2ZW50cy5jaGFuZ2U7XG4gICAgbmV3Q2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXZlbnQsIHJldHZhbDtcbiAgICAgIGV2ZW50ID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICByZXR2YWwgPSBjaGFuZ2UuYXBwbHkobnVsbCwgZXZlbnQpO1xuICAgICAgc3luY1ZhbHVlKCk7XG4gICAgICByZXR1cm4gcmV0dmFsO1xuICAgIH07XG4gICAgZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSA9IG5ld0NoYW5nZTtcbiAgfVxuICByZXQgPSBub2RlRmFjdG9yeShub2RlTmFtZSwgZGVmYXVsdHMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeSk7XG4gIHJldC5hZGQoJ3NlbGVjdGVkRGF0YScsIGZ1bmN0aW9uKHByb3BOYW1lKSB7XG4gICAgdmFyIGRhdGFzZXQ7XG4gICAgcmV0ID0gJyc7XG4gICAgaWYgKHJldC4kLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpICYmIHJldC4kLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpWzBdKSB7XG4gICAgICBkYXRhc2V0ID0gcmV0LiQuZmluZCgnb3B0aW9uOnNlbGVjdGVkJylbMF0uZGF0YXNldDtcbiAgICAgIGlmIChkYXRhc2V0KSB7XG4gICAgICAgIHJldCA9IGRhdGFzZXRbcHJvcE5hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbiAgcmV0LmFkZCgnc2VsZWN0ZWRUZXh0JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJldC4kLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLnRleHQoKTtcbiAgfSk7XG4gIHJldC5hZGQoJ3NlbGVjdGVkVmFsJywgZnVuY3Rpb24oKSB7XG4gICAgdmFsdWUgPSByZXQudmFsKCk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KTtcbiAgcmV0LmFkZCgnYWRkT3B0aW9uJywgZnVuY3Rpb24odmFsdWUsIHRleHQsIHNlbGVjdGVkLCBkaXNhYmxlZCkge1xuICAgIHZhciBhZGQsIGlzRW1wdHksIG9wdGlvbiwgdmFsO1xuICAgIGlmICh0ZXh0ID09IG51bGwpIHtcbiAgICAgIHRleHQgPSB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKHNlbGVjdGVkID09IG51bGwpIHtcbiAgICAgIHNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChkaXNhYmxlZCA9PSBudWxsKSB7XG4gICAgICBkaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpc0VtcHR5ID0gXy5pc0VtcHR5KHZhbHVlKTtcbiAgICBhZGQgPSBmYWxzZTtcbiAgICBpZiAoaXNFbXB0eSAmJiBmYWxzZSA9PT0gaGFzRW1wdHkpIHtcbiAgICAgIGhhc0VtcHR5ID0gdHJ1ZTtcbiAgICAgIGFkZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChmYWxzZSA9PT0gYWRkICYmIGZhbHNlID09PSBpc0VtcHR5KSB7XG4gICAgICBhZGQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoYWRkKSB7XG4gICAgICB2YWwgPSB7XG4gICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgdmFsLnNlbGVjdGVkID0gc2VsZWN0ZWQ7XG4gICAgICB9XG4gICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgdmFsLmRpc2FibGVkID0gZGlzYWJsZWQ7XG4gICAgICB9XG4gICAgICBvcHRpb24gPSByZXQubWFrZSgnb3B0aW9uJywgdmFsKTtcbiAgICAgIHJldHVybiBvcHRpb247XG4gICAgfVxuICB9KTtcbiAgcmV0LmFkZCgnYWRkT3B0aW9ucycsIGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YWx1ZXMgPSBfLnVuaW9uKHZhbHVlcywgb3B0aW9ucyk7XG4gICAgT0ouZWFjaChvcHRpb25zLCAoZnVuY3Rpb24odmFsKSB7XG4gICAgICB2YWx1ZSA9IHJldC5hZGRPcHRpb24odmFsKTtcbiAgICAgIHJldHVybiB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgfSksIGZhbHNlKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9KTtcbiAgcmV0LmFkZCgncmVzZXRPcHRpb25zJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgcmV0LmVtcHR5KCk7XG4gICAgdmFsdWVzID0gdmFsdWVzO1xuICAgIHJldC5hZGRPcHRpb25zKHZhbHVlcyk7XG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG4gIHJldC5hZGQoJ3JlbW92ZU9wdGlvbicsIGZ1bmN0aW9uKHZhbHVlVG9SZW1vdmUpIHtcbiAgICB2YXIgaSwgc2VsZWN0Q29udHJvbDtcbiAgICB2YWx1ZXMuc3BsaWNlKHZhbHVlcy5pbmRleE9mKHZhbHVlVG9SZW1vdmUpLCAxKTtcbiAgICBzZWxlY3RDb250cm9sID0gcmV0WzBdO1xuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgc2VsZWN0Q29udHJvbC5sZW5ndGgpIHtcbiAgICAgIGlmIChzZWxlY3RDb250cm9sLm9wdGlvbnNbaV0udmFsdWUgPT09IHZhbHVlVG9SZW1vdmUpIHtcbiAgICAgICAgc2VsZWN0Q29udHJvbC5yZW1vdmUoaSk7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9KTtcbiAgaWYgKGRlZmF1bHRzLnZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0LmFkZE9wdGlvbnMoZGVmYXVsdHMudmFsdWVzKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuT0oubm9kZXMucmVnaXN0ZXIobm9kZU5hbWUsIG5vZGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGU7XG5cbiIsInZhciAkLCBKc29uVG9UYWJsZSwgT0osIF8sIGFycmF5MkQsIG5vZGUsIG5vZGVGYWN0b3J5LCBub2RlTmFtZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5ub2RlRmFjdG9yeSA9IHJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5fID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xuXG5hcnJheTJEID0gcmVxdWlyZSgnLi4vdG9vbHMvYXJyYXkyRCcpO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xuXG5Kc29uVG9UYWJsZSA9IHJlcXVpcmUoJy4uL3Rvb2xzL0pzb25Ub1RhYmxlJyk7XG5cbm5vZGVOYW1lID0gJ3RhYmxlJztcblxuXG4vKlxuQ3JlYXRlIGFuIEhUTUwgdGFibGUuIFByb3ZpZGVzIGhlbHBlciBtZXRob2RzIHRvIGNyZWF0ZSBDb2x1bW5zIGFuZCBDZWxscy5cbiAqL1xuXG5ub2RlID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5KSB7XG4gIHZhciBjZWxscywgY29sdW1uQ291bnQsIGRlZmF1bHRzLCBmaWxsTWlzc2luZywgaW5pdCwgbG9hZENlbGxzLCByZXQsIHJvd3MsIHRib2R5LCB0aGVhZCwgdGhlYWRSb3c7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBkYXRhOiBudWxsLFxuICAgIHByb3BzOiB7XG4gICAgICBjZWxscGFkZGluZzogMCxcbiAgICAgIGNlbGxzcGFjaW5nOiAwLFxuICAgICAgYWxpZ246ICcnLFxuICAgICAgd2lkdGg6ICcnLFxuICAgICAgY2VsbGFsaWduOiAnbGVmdCcsXG4gICAgICBjZWxsdmFsaWduOiAndG9wJyxcbiAgICAgIFwiY2xhc3NcIjogJydcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7fSxcbiAgICBjZWxsczoge1xuICAgICAgXCJjbGFzc1wiOiAnJyxcbiAgICAgIGFsaWduOiAnJyxcbiAgICAgICd2ZXJ0aWNhbC1hbGlnbic6ICcnLFxuICAgICAgY2VsbHBhZGRpbmc6ICcnLFxuICAgICAgbWFyZ2luOiAnJ1xuICAgIH0sXG4gICAgdGhlYWQ6IHt9LFxuICAgIHRib2R5OiB7fSxcbiAgICBmaXJzdEFsaWduUmlnaHQ6IGZhbHNlLFxuICAgIG9kZEFsaWduUmlnaHQ6IGZhbHNlXG4gIH07XG4gIHJvd3MgPSBbXTtcbiAgY2VsbHMgPSBhcnJheTJEKCk7XG4gIGNvbHVtbkNvdW50ID0gMDtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gbm9kZUZhY3Rvcnkobm9kZU5hbWUsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpO1xuICB0Ym9keSA9IG51bGw7XG4gIHRoZWFkID0gbnVsbDtcbiAgdGhlYWRSb3cgPSBudWxsO1xuICBpbml0ID0gXy5vbmNlKGZ1bmN0aW9uKCkge1xuICAgIHZhciBqMnQsIGpCb2R5LCBqSGVhZCwgalRibCwgdGJsU3RyO1xuICAgIGlmIChkZWZhdWx0cy5kYXRhKSB7XG4gICAgICBqMnQgPSBuZXcgSnNvblRvVGFibGUoZGVmYXVsdHMuZGF0YSk7XG4gICAgICB0YmxTdHIgPSBqMnQudGFibGU7XG4gICAgfVxuICAgIGlmICh0YmxTdHIpIHtcbiAgICAgIGpUYmwgPSAkKHRibFN0cik7XG4gICAgICBqSGVhZCA9IGpUYmwuZmluZCgndGhlYWQnKTtcbiAgICAgIHJldC4kLmFwcGVuZChqSGVhZCk7XG4gICAgICB0aGVhZCA9IGVsLnJlc3RvcmVFbGVtZW50KGpIZWFkWzBdKTtcbiAgICAgIHRoZWFkUm93ID0gZWwucmVzdG9yZUVsZW1lbnQodGhlYWRbMF0ucm93c1swXSk7XG4gICAgICBqQm9keSA9IGpUYmwuZmluZCgndGJvZHknKTtcbiAgICAgIHJldC4kLmFwcGVuZChqQm9keSk7XG4gICAgICB0Ym9keSA9IGVsLnJlc3RvcmVFbGVtZW50KGpCb2R5WzBdKTtcbiAgICAgIGxvYWRDZWxscygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGVhZCA9IHJldC5tYWtlKCd0aGVhZCcsIGRlZmF1bHRzLnRoZWFkKTtcbiAgICAgIHRoZWFkUm93ID0gdGhlYWQubWFrZSgndHInKTtcbiAgICAgIHRib2R5ID0gcmV0Lm1ha2UoJ3Rib2R5JywgZGVmYXVsdHMudGJvZHkpO1xuICAgICAgcm93cy5wdXNoKHRib2R5Lm1ha2UoJ3RyJykpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbiAgbG9hZENlbGxzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGMsIG1lbUNlbGwsIG1lbVJvdywgciwgcmVzdWx0cztcbiAgICByID0gMDtcbiAgICByZXN1bHRzID0gW107XG4gICAgd2hpbGUgKHRib2R5WzBdLnJvd3MubGVuZ3RoID4gcikge1xuICAgICAgYyA9IDA7XG4gICAgICBtZW1Sb3cgPSBlbC5yZXN0b3JlRWxlbWVudCh0Ym9keVswXS5yb3dzW3JdKTtcbiAgICAgIHJvd3MucHVzaChtZW1Sb3cpO1xuICAgICAgd2hpbGUgKHRib2R5WzBdLnJvd3Nbcl0uY2VsbHMubGVuZ3RoID4gYykge1xuICAgICAgICBtZW1DZWxsID0gY2VsbHMuZ2V0KHIgKyAxLCBjICsgMSk7XG4gICAgICAgIGlmICghbWVtQ2VsbCkge1xuICAgICAgICAgIG1lbUNlbGwgPSBlbC5yZXN0b3JlRWxlbWVudCh0Ym9keVswXS5yb3dzW3JdLmNlbGxzW2NdKTtcbiAgICAgICAgICBjZWxscy5zZXQociArIDEsIGMgKyAxLCBtZW1DZWxsKTtcbiAgICAgICAgfVxuICAgICAgICBjICs9IDE7XG4gICAgICB9XG4gICAgICByZXN1bHRzLnB1c2gociArPSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG4gIGZpbGxNaXNzaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNlbGxzLmVhY2goZnVuY3Rpb24ocm93Tm8sIGNvbE5vLCB2YWwpIHtcbiAgICAgIHZhciByb3c7XG4gICAgICBpZiAoIXZhbCkge1xuICAgICAgICByb3cgPSByZXQucm93KHJvd05vKTtcbiAgICAgICAgcmV0dXJuIHJvdy5jZWxsKGNvbE5vLCB7fSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldC5hZGQoJ2NvbHVtbicsIGZ1bmN0aW9uKGNvbE5vLCBjb2xOYW1lKSB7XG4gICAgdmFyIGksIG5hdGl2ZVRoLCB0aDtcbiAgICByZXQuaW5pdCgpO1xuICAgIGNvbHVtbkNvdW50ICs9IDE7XG4gICAgdGggPSBudWxsO1xuICAgIGkgPSAwO1xuICAgIHdoaWxlICh0aGVhZFswXS5yb3dzWzBdLmNlbGxzLmxlbmd0aCA8IGNvbE5vKSB7XG4gICAgICBuYXRpdmVUaCA9IHRoZWFkWzBdLnJvd3NbMF0uY2VsbHNbaV07XG4gICAgICBpZiAoIW5hdGl2ZVRoKSB7XG4gICAgICAgIHRoID0gdGhlYWRSb3cubWFrZSgndGgnLCB7fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aCA9IGVsLnJlc3RvcmVFbGVtZW50KG5hdGl2ZVRoLCAndGgnKTtcbiAgICAgIH1cbiAgICAgIGkgKz0gMTtcbiAgICB9XG4gICAgaWYgKCF0aCkge1xuICAgICAgbmF0aXZlVGggPSB0aGVhZFswXS5yb3dzWzBdLmNlbGxzW2NvbE5vIC0gMV07XG4gICAgICB0aCA9IGVsLnJlc3RvcmVFbGVtZW50KG5hdGl2ZVRoLCAndGgnKTtcbiAgICB9XG4gICAgdGgudGV4dChjb2xOYW1lKTtcbiAgICByZXR1cm4gdGg7XG4gIH0pO1xuICByZXQuYWRkKCdyb3cnLCBmdW5jdGlvbihyb3dObywgb3B0cykge1xuICAgIHZhciByb3c7XG4gICAgcm93ID0gcm93c1tyb3dObyAtIDFdO1xuICAgIGlmICghcm93KSB7XG4gICAgICB3aGlsZSAocm93cy5sZW5ndGggPCByb3dObykge1xuICAgICAgICByb3cgPSB0Ym9keS5tYWtlKCd0cicsIHt9KTtcbiAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghcm93LmNlbGwpIHtcbiAgICAgIHJvdy5hZGQoJ2NlbGwnLCBmdW5jdGlvbihjb2xObywgb3B0cykge1xuICAgICAgICB2YXIgY2VsbDtcbiAgICAgICAgY2VsbCA9IE9KLm5vZGVzLnRkKG9wdHMsIHJvdyk7XG4gICAgICAgIGNlbGxzLnNldChyb3dObywgY29sTm8sIGNlbGwpO1xuICAgICAgICByZXR1cm4gY2VsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcm93O1xuICB9KTtcbiAgcmV0LmFkZCgnY2VsbCcsIGZ1bmN0aW9uKHJvd05vLCBjb2xObywgb3B0cykge1xuICAgIHZhciBjZWxsLCBpLCBudU9wdHMsIHJvdywgdHJ5Q2VsbDtcbiAgICBpZiAocm93Tm8gPCAxKSB7XG4gICAgICByb3dObyA9IDE7XG4gICAgfVxuICAgIGlmIChjb2xObyA8IDEpIHtcbiAgICAgIGNvbE5vID0gMTtcbiAgICB9XG4gICAgaWYgKGNvbHVtbkNvdW50ID4gMCAmJiBjb2xObyAtIDEgPiBjb2x1bW5Db3VudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGNvbHVtbiBuYW1lIGhhcyBub3QgYmVlbiBkZWZpbmVkIGZvciB0aGlzIHBvc2l0aW9uIHsnICsgcm93Tm8gKyAneCcgKyBjb2xObyArICd9LicpO1xuICAgIH1cbiAgICByb3cgPSByZXQucm93KHJvd05vKTtcbiAgICBjZWxsID0gY2VsbHMuZ2V0KHJvd05vLCBjb2xObyk7XG4gICAgaWYgKCFjZWxsKSB7XG4gICAgICBpID0gMDtcbiAgICAgIHdoaWxlIChpIDwgY29sTm8pIHtcbiAgICAgICAgaSArPSAxO1xuICAgICAgICBpZiAoaSA9PT0gY29sTm8pIHtcbiAgICAgICAgICBudU9wdHMgPSBPSi5leHRlbmQoe1xuICAgICAgICAgICAgcHJvcHM6IGRlZmF1bHRzLmNlbGxzXG4gICAgICAgICAgfSwgb3B0cyk7XG4gICAgICAgICAgY2VsbCA9IHJvdy5jZWxsKGNvbE5vLCBudU9wdHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeUNlbGwgPSBjZWxscy5nZXQocm93Tm8sIGkpO1xuICAgICAgICAgIGlmICghdHJ5Q2VsbCkge1xuICAgICAgICAgICAgdHJ5Q2VsbCA9IHJvdy5jZWxsKGksIHtcbiAgICAgICAgICAgICAgcHJvcHM6IGRlZmF1bHRzLmNlbGxzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNlbGw7XG4gIH0pO1xuICBpbml0KCk7XG4gIHJldC5hZGQoJ3RoZWFkJywgdGhlYWQpO1xuICByZXQuYWRkKCd0Ym9keScsIHRib2R5KTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLm5vZGVzLnJlZ2lzdGVyKG5vZGVOYW1lLCBub2RlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuXG4iLCJ2YXIgT0osIGVudW1zLCBub2RlLCBub2RlRmFjdG9yeSwgbm9kZU5hbWUsXG4gIHNsaWNlID0gW10uc2xpY2U7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxubm9kZUZhY3RvcnkgPSByZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxuZW51bXMgPSByZXF1aXJlKCcuLi90b29scy9lbnVtcycpO1xuXG5ub2RlTmFtZSA9ICd0ZXh0YXJlYSc7XG5cbm5vZGUgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpIHtcbiAgdmFyIGNoYW5nZSwgY2xpY2ssIGRlZmF1bHRzLCBuZXdDaGFuZ2UsIG5ld0NsaWNrLCByZXQsIHN5bmNWYWx1ZSwgdmFsdWU7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgbmFtZTogJycsXG4gICAgICBwbGFjZWhvbGRlcjogJycsXG4gICAgICB2YWx1ZTogJycsXG4gICAgICB0ZXh0OiAnJyxcbiAgICAgIG1heGxlbmd0aDogJycsXG4gICAgICBhdXRvZm9jdXM6IGZhbHNlLFxuICAgICAgaXNSZXF1aXJlZDogZmFsc2UsXG4gICAgICByb3dzOiAzLFxuICAgICAgY29sczogMjUsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICByZWFkb25seTogZmFsc2UsXG4gICAgICBmb3JtOiAnJyxcbiAgICAgIHdyYXA6ICcnXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHZhbHVlID0gZGVmYXVsdHMucHJvcHMudmFsdWU7XG4gIHN5bmNWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAoZGVmYXVsdHMucHJvcHMudHlwZSkge1xuICAgICAgY2FzZSBlbnVtcy5pbnB1dFR5cGVzLmNoZWNrYm94OlxuICAgICAgICByZXR1cm4gdmFsdWUgPSByZXQuJC5pcygnOmNoZWNrZWQnKTtcbiAgICAgIGNhc2UgZW51bXMuaW5wdXRUeXBlcy5yYWRpbzpcbiAgICAgICAgcmV0dXJuIHZhbHVlID0gcmV0LiQuZmluZCgnOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB2YWx1ZSA9IHJldC52YWwoKTtcbiAgICB9XG4gIH07XG4gIGlmIChkZWZhdWx0cy5ldmVudHMuY2xpY2sgIT09IE9KLm5vb3ApIHtcbiAgICBjbGljayA9IGRlZmF1bHRzLmV2ZW50cy5jbGljaztcbiAgICBuZXdDbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV2ZW50LCByZXR2YWw7XG4gICAgICBldmVudCA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgcmV0dmFsID0gY2xpY2suYXBwbHkobnVsbCwgZXZlbnQpO1xuICAgICAgc3luY1ZhbHVlKCk7XG4gICAgICByZXR1cm4gcmV0dmFsO1xuICAgIH07XG4gICAgZGVmYXVsdHMuZXZlbnRzLmNsaWNrID0gbmV3Q2xpY2s7XG4gIH1cbiAgaWYgKGRlZmF1bHRzLmV2ZW50cy5jaGFuZ2UgIT09IE9KLm5vb3ApIHtcbiAgICBjaGFuZ2UgPSBkZWZhdWx0cy5ldmVudHMuY2hhbmdlO1xuICAgIG5ld0NoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV2ZW50LCByZXR2YWw7XG4gICAgICBldmVudCA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgcmV0dmFsID0gY2hhbmdlLmFwcGx5KG51bGwsIGV2ZW50KTtcbiAgICAgIHN5bmNWYWx1ZSgpO1xuICAgICAgcmV0dXJuIHJldHZhbDtcbiAgICB9O1xuICAgIGRlZmF1bHRzLmV2ZW50cy5jaGFuZ2UgPSBuZXdDaGFuZ2U7XG4gIH1cbiAgcmV0ID0gbm9kZUZhY3Rvcnkobm9kZU5hbWUsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0oubm9kZXMucmVnaXN0ZXIobm9kZU5hbWUsIG5vZGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGU7XG5cbiIsInZhciBPSiwgbm9kZSwgbm9kZUZhY3RvcnksIG5vZGVOYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbm5vZGVOYW1lID0gJ3RoZWFkJztcblxubm9kZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeSkge1xuICB2YXIgY2VsbHMsIGRlZmF1bHRzLCByZXQsIHJvd3M7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge30sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfSxcbiAgICBudW1iZXI6IDFcbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gbm9kZUZhY3Rvcnkobm9kZU5hbWUsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpO1xuICByb3dzID0gW107XG4gIGNlbGxzID0ge307XG4gIHJldC5hZGQoJ2NlbGwnLCBmdW5jdGlvbihyb3dObywgY29sTm8pIHtcbiAgICB2YXIgY2VsbCwgaWR4LCByb3csIHRkO1xuICAgIGluaXQoKTtcbiAgICBpZiAocm93Tm8gPCAxKSB7XG4gICAgICByb3dObyA9IDE7XG4gICAgfVxuICAgIGlmIChjb2xObyA8IDEpIHtcbiAgICAgIGNvbE5vID0gMTtcbiAgICB9XG4gICAgcm93ID0gcm93c1tyb3dObyAtIDFdO1xuICAgIGlmICghcm93KSB7XG4gICAgICB3aGlsZSAocm93cy5sZW5ndGggPCByb3dObykge1xuICAgICAgICByb3cgPSBPSi5ub2Rlcy50cih7fSwgdGJvZHksIGZhbHNlKTtcbiAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICB9XG4gICAgfVxuICAgIHRkID0gcm93WzBdLmNlbGxzW2NvbE5vXTtcbiAgICBpZiAodGQpIHtcbiAgICAgIGNlbGwgPSBlbC5yZXN0b3JlRWxlbWVudCh0ZCwgJ3RkJyk7XG4gICAgfVxuICAgIGlmICghdGQpIHtcbiAgICAgIHdoaWxlIChyb3dbMF0uY2VsbHMubGVuZ3RoIDwgY29sTm8pIHtcbiAgICAgICAgaWR4ID0gcm93WzBdLmNlbGxzLmxlbmd0aDtcbiAgICAgICAgdGQgPSByb3dbMF0uY2VsbHNbaWR4IC0gMV07XG4gICAgICAgIGlmICh0ZCAmJiBpZHggPT09IGNvbE5vKSB7XG4gICAgICAgICAgY2VsbCA9IGVsLnJlc3RvcmVFbGVtZW50KHRkLCAndGQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjZWxsID0gT0oubm9kZXMudGQoe1xuICAgICAgICAgICAgcHJvcHM6IGRlZmF1bHRzLmNlbGxzXG4gICAgICAgICAgfSwgcm93LCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFjZWxsLmlzVmFsaWQpIHtcbiAgICAgIG5vZGVGYWN0b3J5KGNlbGwsIHJvdywgcm93Tm8gKyBjb2xObyk7XG4gICAgfVxuICAgIHJldHVybiBjZWxsO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLm5vZGVzLnJlZ2lzdGVyKG5vZGVOYW1lLCBub2RlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlO1xuXG4iLCJ2YXIgT0osIG5vZGUsIG5vZGVGYWN0b3J5LCBub2RlTmFtZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5ub2RlRmFjdG9yeSA9IHJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5ub2RlTmFtZSA9ICd1bCc7XG5cbm5vZGUgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnkpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGlmIChjYWxsZWRGcm9tRmFjdG9yeSA9PSBudWxsKSB7XG4gICAgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge30sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBub2RlRmFjdG9yeShub2RlTmFtZSwgZGVmYXVsdHMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeSk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5ub2Rlcy5yZWdpc3Rlcihub2RlTmFtZSwgbm9kZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZTtcblxuIiwicmVxdWlyZSgnLi9vaicpO1xuXG5yZXF1aXJlKCcuL29qSW5pdCcpO1xuXG5yZXF1aXJlKCcuL2FzeW5jL2FqYXgnKTtcblxucmVxdWlyZSgnLi9hc3luYy9wcm9taXNlJyk7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy9ncmlkJyk7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy9pbnB1dGdyb3VwJyk7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy90YWJzJyk7XG5cbnJlcXVpcmUoJy4vY29tcG9uZW50cy90aWxlJyk7XG5cbnJlcXVpcmUoJy4vY29udHJvbHMvaWNvbicpO1xuXG5yZXF1aXJlKCcuL2NvcmUvZGF0ZScpO1xuXG5yZXF1aXJlKCcuL2NvcmUvZnVuY3Rpb24nKTtcblxucmVxdWlyZSgnLi9jb3JlL251bWJlcicpO1xuXG5yZXF1aXJlKCcuL2NvcmUvb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vY29yZS9zdHJpbmcnKTtcblxucmVxdWlyZSgnLi9kb20vbm9kZUZhY3RvcnknKTtcblxucmVxdWlyZSgnLi9kb20vYm9keScpO1xuXG5yZXF1aXJlKCcuL2RvbS9jb21wb25lbnQnKTtcblxucmVxdWlyZSgnLi9kb20vY29udHJvbCcpO1xuXG5yZXF1aXJlKCcuL2RvbS9ub2RlJyk7XG5cbnJlcXVpcmUoJy4vZG9tL2VsZW1lbnQnKTtcblxucmVxdWlyZSgnLi9kb20vZnJhZ21lbnQnKTtcblxucmVxdWlyZSgnLi9kb20vZ2VuZXJpY3MnKTtcblxucmVxdWlyZSgnLi9kb20vaW5wdXQnKTtcblxucmVxdWlyZSgnLi9lbGVtZW50cy9hJyk7XG5cbnJlcXVpcmUoJy4vZWxlbWVudHMvYnInKTtcblxucmVxdWlyZSgnLi9lbGVtZW50cy9mb3JtJyk7XG5cbnJlcXVpcmUoJy4vZWxlbWVudHMvaW5wdXQnKTtcblxucmVxdWlyZSgnLi9lbGVtZW50cy9vbCcpO1xuXG5yZXF1aXJlKCcuL2VsZW1lbnRzL3NlbGVjdCcpO1xuXG5yZXF1aXJlKCcuL2VsZW1lbnRzL3RhYmxlJyk7XG5cbnJlcXVpcmUoJy4vZWxlbWVudHMvdGV4dGFyZWEnKTtcblxucmVxdWlyZSgnLi9lbGVtZW50cy90aGVhZCcpO1xuXG5yZXF1aXJlKCcuL2VsZW1lbnRzL3VsJyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL2J1dHRvbmlucHV0Jyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL2NoZWNrYm94Jyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL2NvbG9yJyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL2RhdGUnKTtcblxucmVxdWlyZSgnLi9pbnB1dHMvZGF0ZXRpbWUnKTtcblxucmVxdWlyZSgnLi9pbnB1dHMvZGF0ZXRpbWVsb2NhbCcpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9lbWFpbCcpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9maWxlJyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL2hpZGRlbicpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9pbWFnZWlucHV0Jyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL21vbnRoJyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL251bWJlcicpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9wYXNzd29yZCcpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9yYWRpbycpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9yYW5nZScpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9yZXNldCcpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy9zZWFyY2gnKTtcblxucmVxdWlyZSgnLi9pbnB1dHMvc3VibWl0Jyk7XG5cbnJlcXVpcmUoJy4vaW5wdXRzL3RlbCcpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy90ZXh0aW5wdXQnKTtcblxucmVxdWlyZSgnLi9pbnB1dHMvdGltZScpO1xuXG5yZXF1aXJlKCcuL2lucHV0cy91cmwnKTtcblxucmVxdWlyZSgnLi9pbnB1dHMvd2VlaycpO1xuXG5yZXF1aXJlKCcuL3Rvb2xzL2FycmF5MkQnKTtcblxucmVxdWlyZSgnLi90b29scy9jb25zb2xlJyk7XG5cbnJlcXVpcmUoJy4vdG9vbHMvY29va2llJyk7XG5cbnJlcXVpcmUoJy4vdG9vbHMvZGVmZXInKTtcblxucmVxdWlyZSgnLi90b29scy9lYWNoJyk7XG5cbnJlcXVpcmUoJy4vdG9vbHMvZW51bXMnKTtcblxucmVxdWlyZSgnLi90b29scy9pcycpO1xuXG5yZXF1aXJlKCcuL3Rvb2xzL25vdHknKTtcblxucmVxdWlyZSgnLi90b29scy9wdWJzdWInKTtcblxucmVxdWlyZSgnLi90b29scy9xdWVyeVN0cmluZycpO1xuXG5yZXF1aXJlKCcuL3Rvb2xzL3JhbmdlcycpO1xuXG5yZXF1aXJlKCcuL3Rvb2xzL3RvJyk7XG5cbnJlcXVpcmUoJy4vdG9vbHMvdXVpZCcpO1xuXG4iLCJ2YXIgdGhpc0dsb2JhbDtcblxudGhpc0dsb2JhbCA9ICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiBnbG9iYWwgPyBnbG9iYWwgOiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmIHNlbGYgPyBzZWxmIDogKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyA/IHdpbmRvdyA6IHRoaXMpKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGhpc0dsb2JhbDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lLCBvYmo7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxub2JqID0gcmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxuaW5wdXQgPSByZXF1aXJlKCcuLi9kb20vaW5wdXQnKTtcblxuaW5wdXROYW1lID0gJ2J1dHRvbmlucHV0JztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogJ2J1dHRvbicsXG4gICAgICBzcmM6ICcnLFxuICAgICAgYWx0OiAnJyxcbiAgICAgIGhlaWdodDogJycsXG4gICAgICB3aWR0aDogJydcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgb2JqLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWUsIG9iajtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5vYmogPSByZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5pbnB1dCA9IHJlcXVpcmUoJy4uL2RvbS9pbnB1dCcpO1xuXG5pbnB1dE5hbWUgPSAnY2hlY2tib3gnO1xuXG5pbnB0ID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGRlZmF1bHRzID0ge1xuICAgIGNoZWNrZWQ6IGZhbHNlLFxuICAgIGluZGV0ZXJtaW5hdGU6IGZhbHNlLFxuICAgIHByb3BzOiB7XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgb2JqLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIGlmIChkZWZhdWx0cy5jaGVja2VkKSB7XG4gICAgcmV0LmF0dHIoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgfSBlbHNlIGlmIChkZWZhdWx0cy5pbmRldGVybWluYXRlKSB7XG4gICAgcmV0LmF0dHIoJ2luZGV0ZXJtaW5hdGUnLCB0cnVlKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lLCBvYmo7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxub2JqID0gcmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxuaW5wdXQgPSByZXF1aXJlKCcuLi9kb20vaW5wdXQnKTtcblxuaW5wdXROYW1lID0gJ2NvbG9yJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIG9iai5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBpbnB1dChkZWZhdWx0cywgb3duZXIpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICdkYXRlJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICdkYXRldGltZSc7XG5cbmlucHQgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lcikge1xuICB2YXIgZGVmYXVsdHMsIHJldDtcbiAgaWYgKG93bmVyID09IG51bGwpIHtcbiAgICBvd25lciA9IE9KLmJvZHk7XG4gIH1cbiAgZGVmYXVsdHMgPSB7XG4gICAgcHJvcHM6IHtcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBpbnB1dChkZWZhdWx0cywgb3duZXIpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5pbnB1dCA9IHJlcXVpcmUoJy4uL2RvbS9pbnB1dCcpO1xuXG5pbnB1dE5hbWUgPSAnZGF0ZXRpbWUtbG9jYWwnO1xuXG5pbnB0ID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGRlZmF1bHRzID0ge1xuICAgIHByb3BzOiB7XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gaW5wdXQoZGVmYXVsdHMsIG93bmVyKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmlucHV0cy5yZWdpc3RlcihpbnB1dE5hbWUsIGlucHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHQ7XG5cbiIsInZhciBPSiwgaW5wdCwgaW5wdXQsIGlucHV0TmFtZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5yZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5yZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxuaW5wdXQgPSByZXF1aXJlKCcuLi9kb20vaW5wdXQnKTtcblxuaW5wdXROYW1lID0gJ2VtYWlsJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lLFxuICAgICAgbXVsdGlwbGU6ICcnXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICdmaWxlJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lLFxuICAgICAgYWNjZXB0OiAnJyxcbiAgICAgIG11bHRpcGxlOiAnJ1xuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBpbnB1dChkZWZhdWx0cywgb3duZXIpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5pbnB1dCA9IHJlcXVpcmUoJy4uL2RvbS9pbnB1dCcpO1xuXG5pbnB1dE5hbWUgPSAnaGlkZGVuJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICdpbWFnZWlucHV0JztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgIHNyYzogJycsXG4gICAgICBhbHQ6ICcnLFxuICAgICAgaGVpZ2h0OiAnJyxcbiAgICAgIHdpZHRoOiAnJ1xuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBpbnB1dChkZWZhdWx0cywgb3duZXIpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5pbnB1dCA9IHJlcXVpcmUoJy4uL2RvbS9pbnB1dCcpO1xuXG5pbnB1dE5hbWUgPSAnbW9udGgnO1xuXG5pbnB0ID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGRlZmF1bHRzID0ge1xuICAgIHByb3BzOiB7XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gaW5wdXQoZGVmYXVsdHMsIG93bmVyKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmlucHV0cy5yZWdpc3RlcihpbnB1dE5hbWUsIGlucHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHQ7XG5cbiIsInZhciBPSiwgaW5wdCwgaW5wdXQsIGlucHV0TmFtZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5yZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5yZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxuaW5wdXQgPSByZXF1aXJlKCcuLi9kb20vaW5wdXQnKTtcblxuaW5wdXROYW1lID0gJ251bWJlcic7XG5cbmlucHQgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lcikge1xuICB2YXIgZGVmYXVsdHMsIHJldDtcbiAgaWYgKG93bmVyID09IG51bGwpIHtcbiAgICBvd25lciA9IE9KLmJvZHk7XG4gIH1cbiAgZGVmYXVsdHMgPSB7XG4gICAgcHJvcHM6IHtcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBpbnB1dChkZWZhdWx0cywgb3duZXIpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5pbnB1dCA9IHJlcXVpcmUoJy4uL2RvbS9pbnB1dCcpO1xuXG5pbnB1dE5hbWUgPSAncGFzc3dvcmQnO1xuXG5pbnB0ID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGRlZmF1bHRzID0ge1xuICAgIHByb3BzOiB7XG4gICAgICB0eXBlOiBpbnB1dE5hbWUsXG4gICAgICBtYXhsZW5ndGg6ICcnXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICdyYWRpbyc7XG5cbmlucHQgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lcikge1xuICB2YXIgZGVmYXVsdHMsIHJldDtcbiAgaWYgKG93bmVyID09IG51bGwpIHtcbiAgICBvd25lciA9IE9KLmJvZHk7XG4gIH1cbiAgZGVmYXVsdHMgPSB7XG4gICAgcHJvcHM6IHtcbiAgICAgIHR5cGU6IGlucHV0TmFtZSxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgdmFsdWU6ICcnLFxuICAgICAgY2hlY2tlZDogJydcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gaW5wdXQoZGVmYXVsdHMsIG93bmVyKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmlucHV0cy5yZWdpc3RlcihpbnB1dE5hbWUsIGlucHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHQ7XG5cbiIsInZhciBPSiwgaW5wdCwgaW5wdXQsIGlucHV0TmFtZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5yZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5yZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxuaW5wdXQgPSByZXF1aXJlKCcuLi9kb20vaW5wdXQnKTtcblxuaW5wdXROYW1lID0gJ3JhbmdlJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lLFxuICAgICAgbWluOiAwLFxuICAgICAgbWF4OiAxMDAsXG4gICAgICB2YWx1ZTogNTAsXG4gICAgICBzdGVwOiAxXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICdyZXNldCc7XG5cbmlucHQgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lcikge1xuICB2YXIgZGVmYXVsdHMsIHJldDtcbiAgaWYgKG93bmVyID09IG51bGwpIHtcbiAgICBvd25lciA9IE9KLmJvZHk7XG4gIH1cbiAgZGVmYXVsdHMgPSB7XG4gICAgcHJvcHM6IHtcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBpbnB1dChkZWZhdWx0cywgb3duZXIpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5pbnB1dCA9IHJlcXVpcmUoJy4uL2RvbS9pbnB1dCcpO1xuXG5pbnB1dE5hbWUgPSAnc2VhcmNoJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICdzdWJtaXQnO1xuXG5pbnB0ID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGRlZmF1bHRzID0ge1xuICAgIHByb3BzOiB7XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gaW5wdXQoZGVmYXVsdHMsIG93bmVyKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmlucHV0cy5yZWdpc3RlcihpbnB1dE5hbWUsIGlucHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHQ7XG5cbiIsInZhciBPSiwgaW5wdCwgaW5wdXQsIGlucHV0TmFtZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5yZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5yZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxuaW5wdXQgPSByZXF1aXJlKCcuLi9kb20vaW5wdXQnKTtcblxuaW5wdXROYW1lID0gJ3RlbCc7XG5cbmlucHQgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lcikge1xuICB2YXIgZGVmYXVsdHMsIHJldDtcbiAgaWYgKG93bmVyID09IG51bGwpIHtcbiAgICBvd25lciA9IE9KLmJvZHk7XG4gIH1cbiAgZGVmYXVsdHMgPSB7XG4gICAgcHJvcHM6IHtcbiAgICAgIHR5cGU6IGlucHV0TmFtZSxcbiAgICAgIHBhdHRlcm46ICcnLFxuICAgICAgbWF4bGVuZ3RoOiAnJ1xuICAgIH0sXG4gICAgc3R5bGVzOiB7fSxcbiAgICBldmVudHM6IHtcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgfVxuICB9O1xuICBPSi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuICByZXQgPSBpbnB1dChkZWZhdWx0cywgb3duZXIpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0ouaW5wdXRzLnJlZ2lzdGVyKGlucHV0TmFtZSwgaW5wdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdDtcblxuIiwidmFyIE9KLCBpbnB0LCBpbnB1dCwgaW5wdXROYW1lO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbnJlcXVpcmUoJy4uL2NvcmUvb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4uL2RvbS9ub2RlRmFjdG9yeScpO1xuXG5pbnB1dCA9IHJlcXVpcmUoJy4uL2RvbS9pbnB1dCcpO1xuXG5pbnB1dE5hbWUgPSAndGV4dGlucHV0JztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgYXV0b2NvbXBsZXRlOiAnb24nLFxuICAgICAgYXV0b3NhdmU6ICcnXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICd0aW1lJztcblxuaW5wdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIG93bmVyKSB7XG4gIHZhciBkZWZhdWx0cywgcmV0O1xuICBpZiAob3duZXIgPT0gbnVsbCkge1xuICAgIG93bmVyID0gT0ouYm9keTtcbiAgfVxuICBkZWZhdWx0cyA9IHtcbiAgICBwcm9wczoge1xuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgfSxcbiAgICBzdHlsZXM6IHt9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2xpY2s6IE9KLm5vb3BcbiAgICB9XG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IGlucHV0KGRlZmF1bHRzLCBvd25lcik7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5pbnB1dHMucmVnaXN0ZXIoaW5wdXROYW1lLCBpbnB0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB0O1xuXG4iLCJ2YXIgT0osIGlucHQsIGlucHV0LCBpbnB1dE5hbWU7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxucmVxdWlyZSgnLi4vY29yZS9vYmplY3QnKTtcblxucmVxdWlyZSgnLi4vZG9tL25vZGVGYWN0b3J5Jyk7XG5cbmlucHV0ID0gcmVxdWlyZSgnLi4vZG9tL2lucHV0Jyk7XG5cbmlucHV0TmFtZSA9ICd1cmwnO1xuXG5pbnB0ID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGRlZmF1bHRzID0ge1xuICAgIHByb3BzOiB7XG4gICAgICB0eXBlOiBpbnB1dE5hbWUsXG4gICAgICBwYXR0ZXJuOiAnJyxcbiAgICAgIG1heGxlbmd0aDogJydcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gaW5wdXQoZGVmYXVsdHMsIG93bmVyKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmlucHV0cy5yZWdpc3RlcihpbnB1dE5hbWUsIGlucHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHQ7XG5cbiIsInZhciBPSiwgaW5wdCwgaW5wdXQsIGlucHV0TmFtZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5yZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5yZXF1aXJlKCcuLi9kb20vbm9kZUZhY3RvcnknKTtcblxuaW5wdXQgPSByZXF1aXJlKCcuLi9kb20vaW5wdXQnKTtcblxuaW5wdXROYW1lID0gJ3dlZWsnO1xuXG5pbnB0ID0gZnVuY3Rpb24ob3B0aW9ucywgb3duZXIpIHtcbiAgdmFyIGRlZmF1bHRzLCByZXQ7XG4gIGlmIChvd25lciA9PSBudWxsKSB7XG4gICAgb3duZXIgPSBPSi5ib2R5O1xuICB9XG4gIGRlZmF1bHRzID0ge1xuICAgIHByb3BzOiB7XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICB9LFxuICAgIHN0eWxlczoge30sXG4gICAgZXZlbnRzOiB7XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIH1cbiAgfTtcbiAgT0ouZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcbiAgcmV0ID0gaW5wdXQoZGVmYXVsdHMsIG93bmVyKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLmlucHV0cy5yZWdpc3RlcihpbnB1dE5hbWUsIGlucHQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHQ7XG5cbiIsInZhciBOc1RyZWUsIG1ha2VUaGVKdWljZSwgbmFtZVNwYWNlTmFtZSwgdGhpc0RvY3VtZW50LCB0aGlzR2xvYmFsLCB1dGlsTGliO1xuXG50aGlzR2xvYmFsID0gcmVxdWlyZSgnLi9nbG9iYWwnKTtcblxudXRpbExpYiA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcblxubmFtZVNwYWNlTmFtZSA9ICdPSic7XG5cblxuLypcbmJvb3Qgc3RyYXAgbmFtZSBtZXRob2QgaW50byBPYmplY3QgcHJvdG90eXBlXG4gKi9cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoT2JqZWN0LnByb3RvdHlwZSwge1xuICBnZXRJbnN0YW5jZU5hbWU6IHtcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZnVuY05hbWVSZWdleCwgcmVzdWx0cztcbiAgICAgIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb24gKC57MSx9KVxcKC87XG4gICAgICByZXN1bHRzID0gZnVuY05hbWVSZWdleC5leGVjKHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKSk7XG4gICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNbMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuXG4vKlxuQW4gaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5hbWVzcGFjZSB0cmVlXG4gKi9cblxuTnNUcmVlID0ge307XG5cbm1ha2VUaGVKdWljZSA9IGZ1bmN0aW9uKCkge1xuXG4gIC8qXG4gIEludGVybmFsIG5hbWVTcGFjZU5hbWUgbWV0aG9kIHRvIGNyZWF0ZSBuZXcgJ3N1YicgbmFtZXNwYWNlcyBvbiBhcmJpdHJhcnkgY2hpbGQgb2JqZWN0cy5cbiAgICovXG4gIHZhciBOc091dCwgZGVwZW5kc09uLCBtYWtlTmFtZVNwYWNlLCBuc0ludGVybmFsO1xuICBtYWtlTmFtZVNwYWNlID0gZnVuY3Rpb24oc3BhY2VuYW1lLCB0cmVlKSB7XG5cbiAgICAvKlxuICAgIFRoZSBkZXJpdmVkIGluc3RhbmNlIHRvIGJlIGNvbnN0cnVjdGVkXG4gICAgICovXG4gICAgdmFyIEJhc2UsIENsYXNzO1xuICAgIEJhc2UgPSBmdW5jdGlvbihuc05hbWUpIHtcbiAgICAgIHZhciBtZW1iZXJzLCBuc1RyZWUsIHByb3RvO1xuICAgICAgcHJvdG8gPSB0aGlzO1xuICAgICAgdHJlZVtuc05hbWVdID0gdHJlZVtuc05hbWVdIHx8IHt9O1xuICAgICAgbnNUcmVlID0gdHJlZVtuc05hbWVdO1xuICAgICAgbWVtYmVycyA9IHt9O1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdtZW1iZXJzJywge1xuICAgICAgICB2YWx1ZTogbWVtYmVyc1xuXG4gICAgICAgIC8qXG4gICAgICAgIFJlZ2lzdGVyIChlLmcuICdMaWZ0JykgYW4gT2JqZWN0IGludG8gdGhlIHByb3RvdHlwZSBvZiB0aGUgbmFtZXNwYWNlLlxuICAgICAgICBUaGlzIE9iamVjdCB3aWxsIGJlIHJlYWRhYmxlL2V4ZWN1dGFibGUgYnV0IGlzIG90aGVyd2lzZSBpbW11dGFibGUuXG4gICAgICAgICAqL1xuICAgICAgfSk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JlZ2lzdGVyJywge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24obmFtZSwgb2JqLCBlbnVtZXJhYmxlKSB7XG4gICAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAgIGlmICgodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB8fCBuYW1lID09PSAnJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbGlmdCBhIG5ldyBwcm9wZXJ0eSB3aXRob3V0IGEgdmFsaWQgbmFtZS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFvYmopIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGxpZnQgYSBuZXcgcHJvcGVydHkgd2l0aG91dCBhIHZhbGlkIHByb3BlcnR5IGluc3RhbmNlLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocHJvdG9bbmFtZV0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgbmFtZWQgJyArIG5hbWUgKyAnIGlzIGFscmVhZHkgZGVmaW5lZCBvbiAnICsgc3BhY2VuYW1lICsgJy4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWVtYmVyc1tuYW1lXSA9IG1lbWJlcnNbbmFtZV0gfHwgbmFtZTtcbiAgICAgICAgICBuc1RyZWVbbmFtZV0gPSBuc1RyZWVbbmFtZV0gfHwge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGVvZiBvYmosXG4gICAgICAgICAgICBpbnN0YW5jZTogKG9iai5nZXRJbnN0YW5jZU5hbWUgPyBvYmouZ2V0SW5zdGFuY2VOYW1lKCkgOiAndW5rbm93bicpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIG5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBvYmosXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSAhPT0gZW51bWVyYWJsZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG5zSW50ZXJuYWwuYWxlcnREZXBlbmRlbnRzKG5zTmFtZSArICcuJyArIHNwYWNlbmFtZSArICcuJyArIG5hbWUpO1xuICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvKlxuICAgICAgQ3JlYXRlIGEgbmV3LCBzdGF0aWMgbmFtZXNwYWNlIG9uIHRoZSBjdXJyZW50IHBhcmVudCAoZS5nLiBuc05hbWUudG8uLi4gfHwgbnNOYW1lLmlzLi4uKVxuICAgICAgICovXG4gICAgICBwcm90by5yZWdpc3RlcignbWFrZVN1Yk5hbWVTcGFjZScsIChmdW5jdGlvbihzdWJOYW1lU3BhY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgbmV3TmFtZVNwYWNlO1xuICAgICAgICBpZiAoKHR5cGVvZiBzdWJOYW1lU3BhY2UgIT09ICdzdHJpbmcnKSB8fCBzdWJOYW1lU3BhY2UgPT09ICcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIGEgbmV3IHN1YiBuYW1lc3BhY2Ugd2l0aG91dCBhIHZhbGlkIG5hbWUuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb3RvLnN1Yk5hbWVTcGFjZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3ViIG5hbWVzcGFjZSBuYW1lZCAnICsgc3ViTmFtZVNwYWNlICsgJyBpcyBhbHJlYWR5IGRlZmluZWQgb24gJyArIHNwYWNlbmFtZSArICcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgbnNJbnRlcm5hbC5hbGVydERlcGVuZGVudHMobnNOYW1lICsgJy4nICsgc3ViTmFtZVNwYWNlKTtcbiAgICAgICAgbmV3TmFtZVNwYWNlID0gbWFrZU5hbWVTcGFjZShzdWJOYW1lU3BhY2UsIG5zVHJlZSk7XG4gICAgICAgIGlmIChzdWJOYW1lU3BhY2UgIT09ICdjb25zdGFudHMnKSB7XG4gICAgICAgICAgbmV3TmFtZVNwYWNlLnJlZ2lzdGVyKCdjb25zdGFudHMnLCBtYWtlTmFtZVNwYWNlKCdjb25zdGFudHMnLCBuc1RyZWUpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG8ucmVnaXN0ZXIoc3ViTmFtZVNwYWNlLCBuZXdOYW1lU3BhY2UsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIG5ld05hbWVTcGFjZTtcbiAgICAgIH0pLCBmYWxzZSk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgQW4gaW50ZXJuYWwgbWVjaGFuaXNtIHRvIHJlcHJlc2VudCB0aGUgaW5zdGFuY2Ugb2YgdGhpcyBuYW1lc3BhY2VcbiAgICBAY29uc3RydWN0b3JcbiAgICBAaW50ZXJuYWxcbiAgICBAbWVtYmVyT2YgbWFrZU5hbWVTcGFjZVxuICAgICAqL1xuICAgIENsYXNzID0gbmV3IEZ1bmN0aW9uKCdyZXR1cm4gZnVuY3Rpb24gJyArIHNwYWNlbmFtZSArICcoKXt9JykoKTtcbiAgICBDbGFzcy5wcm90b3R5cGUgPSBuZXcgQmFzZShzcGFjZW5hbWUpO1xuICAgIHJldHVybiBuZXcgQ2xhc3Moc3BhY2VuYW1lKTtcbiAgfTtcblxuICAvKlxuICAnRGVwZW5kJyBhbiBPYmplY3QgdXBvbiBhbm90aGVyIG1lbWJlciBvZiB0aGlzIG5hbWVzcGFjZSwgdXBvbiBhbm90aGVyIG5hbWVzcGFjZSxcbiAgb3IgdXBvbiBhIG1lbWJlciBvZiBhbm90aGVyIG5hbWVzcGFjZVxuICAgKi9cbiAgZGVwZW5kc09uID0gZnVuY3Rpb24oZGVwZW5kZW5jaWVzLCBjYWxsQmFjaywgaW1wb3J0cykge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgbWlzc2luZywgbnNNZW1iZXJzLCByZXQ7XG4gICAgcmV0ID0gZmFsc2U7XG4gICAgbnNNZW1iZXJzID0gbnNJbnRlcm5hbC5nZXROc01lbWJlcnMoKTtcbiAgICBpZiAoZGVwZW5kZW5jaWVzICYmIGRlcGVuZGVuY2llcy5sZW5ndGggPiAwICYmIGNhbGxCYWNrKSB7XG4gICAgICBtaXNzaW5nID0gZGVwZW5kZW5jaWVzLmZpbHRlcihmdW5jdGlvbihkZXBlbikge1xuICAgICAgICByZXR1cm4gbnNNZW1iZXJzLmluZGV4T2YoZGVwZW4pID09PSAtMSAmJiAoIWltcG9ydHMgfHwgaW1wb3J0cyAhPT0gZGVwZW4pO1xuICAgICAgfSk7XG4gICAgICBpZiAobWlzc2luZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0ID0gdHJ1ZTtcbiAgICAgICAgY2FsbEJhY2soKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5zSW50ZXJuYWwuZGVwZW5kZW50cy5wdXNoKGZ1bmN0aW9uKGltcG9ydHMpIHtcbiAgICAgICAgICByZXR1cm4gZGVwZW5kc09uKG1pc3NpbmcsIGNhbGxCYWNrLCBpbXBvcnRzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH07XG4gIG5zSW50ZXJuYWwgPSB7XG4gICAgZGVwZW5kZW50czogW11cblxuICAgIC8qXG4gICAgRmV0Y2hlcyB0aGUgcmVnaXN0ZXJlZCBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzIG9uIHRoZSBuYW1lc3BhY2UgYW5kIGl0cyBjaGlsZCBuYW1lc3BhY2VzXG4gICAgICovXG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuc0ludGVybmFsLCAnZ2V0TnNNZW1iZXJzJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBtZW1iZXJzLCByZWN1cnNlVHJlZTtcbiAgICAgIHJlY3Vyc2VUcmVlID0gZnVuY3Rpb24oa2V5LCBsYXN0S2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG1lbWJlcnMucHVzaChsYXN0S2V5ICsgJy4nICsga2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXRpbExpYi5pc1BsYWluT2JqZWN0KGtleSkpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhrZXkpLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBrID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBtZW1iZXJzLnB1c2gobGFzdEtleSArICcuJyArIGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHV0aWxMaWIuaXNQbGFpbk9iamVjdChrZXlba10pKSB7XG4gICAgICAgICAgICAgIHJlY3Vyc2VUcmVlKGtleVtrXSwgbGFzdEtleSArICcuJyArIGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgbWVtYmVycyA9IFtdO1xuICAgICAgT2JqZWN0LmtleXMoTnNUcmVlW25hbWVTcGFjZU5hbWVdKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpZiAodXRpbExpYi5pc1BsYWluT2JqZWN0KE5zVHJlZVtuYW1lU3BhY2VOYW1lXVtrZXldKSkge1xuICAgICAgICAgIHJlY3Vyc2VUcmVlKE5zVHJlZVtuYW1lU3BhY2VOYW1lXVtrZXldLCBuYW1lU3BhY2VOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbWVtYmVycztcbiAgICB9XG4gIH0pO1xuXG4gIC8qXG4gIFRvIHN1cHBvcnQgZGVwZW5kZW5jeSBtYW5hZ2VtZW50LCB3aGVuIGEgcHJvcGVydHkgaXMgbGlmdGVkIG9udG8gdGhlIG5hbWVzcGFjZSwgbm90aWZ5IGRlcGVuZGVudHMgdG8gaW5pdGlhbGl6ZVxuICAgKi9cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5zSW50ZXJuYWwsICdhbGVydERlcGVuZGVudHMnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKGltcG9ydHMpIHtcbiAgICAgIHZhciBkZXBzO1xuICAgICAgZGVwcyA9IG5zSW50ZXJuYWwuZGVwZW5kZW50cy5maWx0ZXIoZnVuY3Rpb24oZGVwT24pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlID09PSBkZXBPbihpbXBvcnRzKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVwcykpIHtcbiAgICAgICAgcmV0dXJuIG5zSW50ZXJuYWwuZGVwZW5kZW50cyA9IGRlcHM7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgTnNUcmVlW25hbWVTcGFjZU5hbWVdID0ge307XG4gIE5zT3V0ID0gbWFrZU5hbWVTcGFjZShuYW1lU3BhY2VOYW1lLCBOc1RyZWVbbmFtZVNwYWNlTmFtZV0pO1xuXG4gIC8qXG4gIENhY2hlIGEgaGFuZGxlIG9uIHRoZSB2ZW5kb3IgKHByb2JhYmx5IGpRdWVyeSkgb24gdGhlIHJvb3QgbmFtZXNwYWNlXG4gICAqL1xuICBOc091dC5yZWdpc3RlcignPycsIHV0aWxMaWIsIGZhbHNlKTtcblxuICAvKlxuICBDYWNoZSB0aGUgdHJlZSAodXNlZnVsIGZvciBkb2N1bWVudGF0aW9uL3Zpc3VhbGl6YXRpb24vZGVidWdnaW5nKVxuICAgKi9cbiAgTnNPdXQucmVnaXN0ZXIoJ3RyZWUnLCBOc1RyZWVbbmFtZVNwYWNlTmFtZV0sIGZhbHNlKTtcblxuICAvKlxuICBDYWNoZSB0aGUgbmFtZSBzcGFjZSBuYW1lXG4gICAqL1xuICBOc091dC5yZWdpc3RlcignbmFtZScsIG5hbWVTcGFjZU5hbWUsIGZhbHNlKTtcbiAgTnNPdXQucmVnaXN0ZXIoJ2RlcGVuZHNPbicsIGRlcGVuZHNPbiwgZmFsc2UpO1xuICByZXR1cm4gTnNPdXQ7XG59O1xuXG5cbi8qXG5BY3R1YWxseSBkZWZpbmUgdGhlIE9KIE5hbWVTcGFjZVxuICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzR2xvYmFsLCBuYW1lU3BhY2VOYW1lLCB7XG4gIHZhbHVlOiBtYWtlVGhlSnVpY2UoKVxufSk7XG5cbk9KLnJlZ2lzdGVyKCdnbG9iYWwnLCB0aGlzR2xvYmFsKTtcblxudGhpc0RvY3VtZW50ID0ge307XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIHRoaXNEb2N1bWVudCA9IGRvY3VtZW50O1xufVxuXG5PSi5yZWdpc3RlcignZG9jdW1lbnQnLCB0aGlzRG9jdW1lbnQpO1xuXG5PSi5yZWdpc3Rlcignbm9vcCcsIGZ1bmN0aW9uKCkge30pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9KO1xuXG4iLCJ2YXIgT0osIF8sIHN1Yk5hbWVTcGFjZXM7XG5cbk9KID0gcmVxdWlyZSgnLi9vaicpO1xuXG5fID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xuXG5zdWJOYW1lU3BhY2VzID0gWydlcnJvcnMnLCAnZW51bXMnLCAnaW5zdGFuY2VPZicsICdub2RlcycsICdkYicsICdjb21wb25lbnRzJywgJ2NvbnRyb2xzJywgJ2lucHV0cycsICdub3RpZmljYXRpb25zJywgJ2Nvb2tpZScsICdhc3luYyddO1xuXG5fLmVhY2goc3ViTmFtZVNwYWNlcywgZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gT0oubWFrZVN1Yk5hbWVTcGFjZShuYW1lKTtcbn0pO1xuXG5PSlsnR0VORVJBVEVfVU5JUVVFX0lEUyddID0gZmFsc2U7XG5cbk9KWydERUZBVUxUX0NPTVBPTkVOVF9ST09UX05PREVUWVBFJ10gPSAnZGl2JztcblxuT0pbJ1RSQUNLX09OX0VSUk9SJ10gPSBmYWxzZTtcblxuT0pbJ0xPR19BTExfQUpBWCddID0gZmFsc2U7XG5cbk9KWydMT0dfQUxMX0FKQVhfRVJST1JTJ10gPSBmYWxzZTtcblxuIiwiXG4vKlxuUmV0dXJuIGp1c3QgdGhlIGtleXMgZnJvbSB0aGUgaW5wdXQgYXJyYXksIG9wdGlvbmFsbHkgb25seSBmb3IgdGhlIHNwZWNpZmllZCBzZWFyY2hfdmFsdWVcbnZlcnNpb246IDExMDkuMjAxNVxuZGlzY3VzcyBhdDogaHR0cDovL3BocGpzLm9yZy9mdW5jdGlvbnMvYXJyYXlfa2V5c1xuKyAgIG9yaWdpbmFsIGJ5OiBLZXZpbiB2YW4gWm9ubmV2ZWxkIChodHRwOi8va2V2aW4udmFuem9ubmV2ZWxkLm5ldClcbisgICAgICBpbnB1dCBieTogQnJldHQgWmFtaXIgKGh0dHA6Ly9icmV0dC16YW1pci5tZSlcbisgICBidWdmaXhlZCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cDovL2tldmluLnZhbnpvbm5ldmVsZC5uZXQpXG4rICAgaW1wcm92ZWQgYnk6IGpkXG4rICAgaW1wcm92ZWQgYnk6IEJyZXR0IFphbWlyIChodHRwOi8vYnJldHQtemFtaXIubWUpXG4rICAgaW5wdXQgYnk6IFBcbisgICBidWdmaXhlZCBieTogQnJldHQgWmFtaXIgKGh0dHA6Ly9icmV0dC16YW1pci5tZSlcbmV4YW1wbGUgMTogYXJyYXlfa2V5cygge2ZpcnN0bmFtZTogJ0tldmluJywgc3VybmFtZTogJ3ZhbiBab25uZXZlbGQnfSApO1xucmV0dXJucyAxOiB7MDogJ2ZpcnN0bmFtZScsIDE6ICdzdXJuYW1lJ31cbiAqL1xudmFyIEpzb25Ub1RhYmxlLCBhcnJheV9rZXlzO1xuXG5hcnJheV9rZXlzID0gZnVuY3Rpb24oaW5wdXQsIHNlYXJjaF92YWx1ZSwgYXJnU3RyaWN0KSB7XG4gIHZhciBpbmNsdWRlLCBrZXksIHNlYXJjaCwgc3RyaWN0LCB0bXBfYXJyO1xuICBzZWFyY2ggPSB0eXBlb2Ygc2VhcmNoX3ZhbHVlICE9PSBcInVuZGVmaW5lZFwiO1xuICB0bXBfYXJyID0gW107XG4gIHN0cmljdCA9ICEhYXJnU3RyaWN0O1xuICBpbmNsdWRlID0gdHJ1ZTtcbiAga2V5ID0gXCJcIjtcbiAgaWYgKGlucHV0ICYmIHR5cGVvZiBpbnB1dCA9PT0gXCJvYmplY3RcIiAmJiBpbnB1dC5jaGFuZ2Vfa2V5X2Nhc2UpIHtcbiAgICByZXR1cm4gaW5wdXQua2V5cyhzZWFyY2hfdmFsdWUsIGFyZ1N0cmljdCk7XG4gIH1cbiAgZm9yIChrZXkgaW4gaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgaW5jbHVkZSA9IHRydWU7XG4gICAgICBpZiAoc2VhcmNoKSB7XG4gICAgICAgIGlmIChzdHJpY3QgJiYgaW5wdXRba2V5XSAhPT0gc2VhcmNoX3ZhbHVlKSB7XG4gICAgICAgICAgaW5jbHVkZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChpbnB1dFtrZXldICE9PSBzZWFyY2hfdmFsdWUpIHtcbiAgICAgICAgICAgIGluY2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpbmNsdWRlKSB7XG4gICAgICAgIHRtcF9hcnJbdG1wX2Fyci5sZW5ndGhdID0ga2V5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdG1wX2Fycjtcbn07XG5cblxuLyoqXG5Db252ZXJ0IGEgSmF2YXNjcmlwdCBPamVjdCBhcnJheSBvciBTdHJpbmcgYXJyYXkgdG8gYW4gSFRNTCB0YWJsZVxuSlNPTiBwYXJzaW5nIGhhcyB0byBiZSBtYWRlIGJlZm9yZSBmdW5jdGlvbiBjYWxsXG5JdCBhbGxvd3MgdXNlIG9mIG90aGVyIEpTT04gcGFyc2luZyBtZXRob2RzIGxpa2UgalF1ZXJ5LnBhcnNlSlNPTlxuaHR0cChzKTovLywgZnRwOi8vLCBmaWxlOi8vIGFuZCBqYXZhc2NyaXB0OjsgbGlua3MgYXJlIGF1dG9tYXRpY2FsbHkgY29tcHV0ZWRcblxuSlNPTiBkYXRhIHNhbXBsZXMgdGhhdCBzaG91bGQgYmUgcGFyc2VkIGFuZCB0aGVuIGNhbiBiZSBjb252ZXJ0ZWQgdG8gYW4gSFRNTCB0YWJsZVxudmFyIG9iamVjdEFycmF5ID0gJ1t7XCJUb3RhbFwiOlwiMzRcIixcIlZlcnNpb25cIjpcIjEuMC40XCIsXCJPZmZpY2VcIjpcIk5ldyBZb3JrXCJ9LHtcIlRvdGFsXCI6XCI2N1wiLFwiVmVyc2lvblwiOlwiMS4xLjBcIixcIk9mZmljZVwiOlwiUGFyaXNcIn1dJztcbnZhciBzdHJpbmdBcnJheSA9ICdbXCJOZXcgWW9ya1wiLFwiQmVybGluXCIsXCJQYXJpc1wiLFwiTWFycmFrZWNoXCIsXCJNb3Njb3dcIl0nO1xudmFyIG5lc3RlZFRhYmxlID0gJ1t7IGtleTE6IFwidmFsMVwiLCBrZXkyOiBcInZhbDJcIiwga2V5MzogeyB0YWJsZUlkOiBcInRibElkTmVzdGVkMVwiLCB0YWJsZUNsYXNzTmFtZTogXCJjbHNOZXN0ZWRcIiwgbGlua1RleHQ6IFwiRG93bmxvYWRcIiwgZGF0YTogW3sgc3Via2V5MTogXCJzdWJ2YWwxXCIsIHN1YmtleTI6IFwic3VidmFsMlwiLCBzdWJrZXkzOiBcInN1YnZhbDNcIiB9XSB9IH1dJztcblxuQ29kZSBzYW1wbGUgdG8gY3JlYXRlIGEgSFRNTCB0YWJsZSBKYXZhc2NyaXB0IFN0cmluZ1xudmFyIGpzb25IdG1sVGFibGUgPSBDb252ZXJ0SnNvblRvVGFibGUoZXZhbChkYXRhU3RyaW5nKSwgJ2pzb25UYWJsZScsIG51bGwsICdEb3dubG9hZCcpO1xuXG5Db2RlIHNhbXBsZSBleHBsYW5lZFxuLSBldmFsIGlzIHVzZWQgdG8gcGFyc2UgYSBKU09OIGRhdGFTdHJpbmdcbi0gdGFibGUgSFRNTCBpZCBhdHRyaWJ1dGUgd2lsbCBiZSAnanNvblRhYmxlJ1xuLSB0YWJsZSBIVE1MIGNsYXNzIGF0dHJpYnV0ZSB3aWxsIG5vdCBiZSBhZGRlZFxuLSAnRG93bmxvYWQnIHRleHQgd2lsbCBiZSBkaXNwbGF5ZWQgaW5zdGVhZCBvZiB0aGUgbGluayBpdHNlbGZcblxuQGF1dGhvciBBZnNoaW4gTWVocmFiYW5pIDxhZnNoaW4gZG90IG1laCBhdCBnbWFpbCBkb3QgY29tPlxuXG5AY2xhc3MgQ29udmVydEpzb25Ub1RhYmxlXG5cbkBtZXRob2QgQ29udmVydEpzb25Ub1RhYmxlXG5cbkBwYXJhbSBwYXJzZWRKc29uIG9iamVjdCBQYXJzZWQgSlNPTiBkYXRhXG5AcGFyYW0gdGFibGVJZCBzdHJpbmcgT3B0aW9uYWwgdGFibGUgaWRcbkBwYXJhbSB0YWJsZUNsYXNzTmFtZSBzdHJpbmcgT3B0aW9uYWwgdGFibGUgY3NzIGNsYXNzIG5hbWVcbkBwYXJhbSBsaW5rVGV4dCBzdHJpbmcgT3B0aW9uYWwgdGV4dCByZXBsYWNlbWVudCBmb3IgbGluayBwYXR0ZXJuXG5cbkByZXR1cm4gc3RyaW5nIENvbnZlcnRlZCBKU09OIHRvIEhUTUwgdGFibGVcbiAqL1xuXG5Kc29uVG9UYWJsZSA9IChmdW5jdGlvbigpIHtcbiAgSnNvblRvVGFibGUucHJvdG90eXBlLnRhYmxlID0gbnVsbDtcblxuICBmdW5jdGlvbiBKc29uVG9UYWJsZShwYXJzZWRKc29uLCB0YWJsZUlkLCB0YWJsZUNsYXNzTmFtZSwgbGlua1RleHQpIHtcbiAgICB2YXIgY2xhc3NNYXJrdXAsIGhlYWRlcnMsIGksIGlkTWFya3VwLCBpc1N0cmluZ0FycmF5LCBpc1VybCwgaXRhbGljLCBqLCBqYXZhc2NyaXB0UmVnRXhwLCBsaW5rLCB0YiwgdGJDb24sIHRibCwgdGRSb3csIHRoLCB0aENvbiwgdGhSb3csIHRyLCB0ckNvbiwgdXJsUmVnRXhwLCB2YWx1ZTtcbiAgICBpdGFsaWMgPSBcIjxpPnswfTwvaT5cIjtcbiAgICBsaW5rID0gKGxpbmtUZXh0ID8gXCI8YSBocmVmPVxcXCJ7MH1cXFwiPlwiICsgbGlua1RleHQgKyBcIjwvYT5cIiA6IFwiPGEgaHJlZj1cXFwiezB9XFxcIj57MH08L2E+XCIpO1xuICAgIGlkTWFya3VwID0gKHRhYmxlSWQgPyBcIiBpZD1cXFwiXCIgKyB0YWJsZUlkICsgXCJcXFwiXCIgOiBcIlwiKTtcbiAgICBjbGFzc01hcmt1cCA9ICh0YWJsZUNsYXNzTmFtZSA/IFwiIGNsYXNzPVxcXCJcIiArIHRhYmxlQ2xhc3NOYW1lICsgXCJcXFwiXCIgOiBcIlwiKTtcbiAgICB0YmwgPSBcIjx0YWJsZSBib3JkZXI9XFxcIjFcXFwiIGNlbGxwYWRkaW5nPVxcXCIxXFxcIiBjZWxsc3BhY2luZz1cXFwiMVxcXCJcIiArIGlkTWFya3VwICsgY2xhc3NNYXJrdXAgKyBcIj57MH17MX08L3RhYmxlPlwiO1xuICAgIHRoID0gXCI8dGhlYWQ+ezB9PC90aGVhZD5cIjtcbiAgICB0YiA9IFwiPHRib2R5PnswfTwvdGJvZHk+XCI7XG4gICAgdHIgPSBcIjx0cj57MH08L3RyPlwiO1xuICAgIHRoUm93ID0gXCI8dGg+ezB9PC90aD5cIjtcbiAgICB0ZFJvdyA9IFwiPHRkPnswfTwvdGQ+XCI7XG4gICAgdGhDb24gPSBcIlwiO1xuICAgIHRiQ29uID0gXCJcIjtcbiAgICB0ckNvbiA9IFwiXCI7XG4gICAgaWYgKHBhcnNlZEpzb24pIHtcbiAgICAgIGlzU3RyaW5nQXJyYXkgPSB0eXBlb2YgcGFyc2VkSnNvblswXSA9PT0gXCJzdHJpbmdcIjtcbiAgICAgIGhlYWRlcnMgPSB2b2lkIDA7XG4gICAgICBpZiAoaXNTdHJpbmdBcnJheSkge1xuICAgICAgICB0aENvbiArPSB0aFJvdy5mb3JtYXQoXCJ2YWx1ZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyc2VkSnNvblswXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGhlYWRlcnMgPSBhcnJheV9rZXlzKHBhcnNlZEpzb25bMF0pO1xuICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgIHdoaWxlIChpIDwgaGVhZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoQ29uICs9IHRoUm93LmZvcm1hdChoZWFkZXJzW2ldKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoID0gdGguZm9ybWF0KHRyLmZvcm1hdCh0aENvbikpO1xuICAgICAgaWYgKGlzU3RyaW5nQXJyYXkpIHtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgcGFyc2VkSnNvbi5sZW5ndGgpIHtcbiAgICAgICAgICB0YkNvbiArPSB0ZFJvdy5mb3JtYXQocGFyc2VkSnNvbltpXSk7XG4gICAgICAgICAgdHJDb24gKz0gdHIuZm9ybWF0KHRiQ29uKTtcbiAgICAgICAgICB0YkNvbiA9IFwiXCI7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaGVhZGVycykge1xuICAgICAgICAgIHVybFJlZ0V4cCA9IG5ldyBSZWdFeHAoLyhcXGIoaHR0cHM/fGZ0cHxmaWxlKTpcXC9cXC9bLUEtWjAtOSsmQCNcXC8lPz1+X3whOiwuO10qWy1BLVowLTkrJkAjXFwvJT1+X3xdKS9nKTtcbiAgICAgICAgICBqYXZhc2NyaXB0UmVnRXhwID0gbmV3IFJlZ0V4cCgvKF5qYXZhc2NyaXB0OltcXHNcXFNdKjskKS9nKTtcbiAgICAgICAgICBpID0gMDtcbiAgICAgICAgICB3aGlsZSAoaSA8IHBhcnNlZEpzb24ubGVuZ3RoKSB7XG4gICAgICAgICAgICBqID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChqIDwgaGVhZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZWRKc29uW2ldW2hlYWRlcnNbal1dO1xuICAgICAgICAgICAgICBpc1VybCA9IHVybFJlZ0V4cC50ZXN0KHZhbHVlKSB8fCBqYXZhc2NyaXB0UmVnRXhwLnRlc3QodmFsdWUpO1xuICAgICAgICAgICAgICBpZiAoaXNVcmwpIHtcbiAgICAgICAgICAgICAgICB0YkNvbiArPSB0ZFJvdy5mb3JtYXQobGluay5mb3JtYXQodmFsdWUpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGJDb24gKz0gdGRSb3cuZm9ybWF0KENvbnZlcnRKc29uVG9UYWJsZShldmFsKHZhbHVlLmRhdGEpLCB2YWx1ZS50YWJsZUlkLCB2YWx1ZS50YWJsZUNsYXNzTmFtZSwgdmFsdWUubGlua1RleHQpKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRiQ29uICs9IHRkUm93LmZvcm1hdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHRiQ29uICs9IHRkUm93LmZvcm1hdChpdGFsaWMuZm9ybWF0KHZhbHVlKS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJDb24gKz0gdHIuZm9ybWF0KHRiQ29uKTtcbiAgICAgICAgICAgIHRiQ29uID0gXCJcIjtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRiID0gdGIuZm9ybWF0KHRyQ29uKTtcbiAgICAgIHRibCA9IHRibC5mb3JtYXQodGgsIHRiKTtcbiAgICB9XG4gICAgdGhpcy50YWJsZSA9IHRibDtcbiAgfVxuXG4gIHJldHVybiBKc29uVG9UYWJsZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBKc29uVG9UYWJsZTtcblxuIiwidmFyIE9KLCBhcnJheTJEO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbmFycmF5MkQgPSBmdW5jdGlvbihpbml0TGVuZ3RoLCBpbml0V2lkdGgpIHtcbiAgdmFyIGFycmF5LCBleHRlbmQsIG1heExlbmd0aCwgbWF4V2lkdGgsIHJldDtcbiAgYXJyYXkgPSBbXTtcbiAgbWF4TGVuZ3RoID0gMDtcbiAgbWF4V2lkdGggPSAwO1xuICByZXQgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbihyb3dObywgY29sTm8pIHtcbiAgICAgIHJldHVybiBleHRlbmQocm93Tm8sIGNvbE5vKTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24ocm93Tm8sIGNvbE5vLCB2YWwpIHtcbiAgICAgIHZhciBjb2xJZHgsIHJvd0lkeDtcbiAgICAgIHJldC5nZXQocm93Tm8sIGNvbE5vKTtcbiAgICAgIHJvd0lkeCA9IHJvd05vIC0gMTtcbiAgICAgIGNvbElkeCA9IGNvbE5vIC0gMTtcbiAgICAgIHJldHVybiBhcnJheVtyb3dJZHhdW2NvbElkeF0gPSB2YWw7XG4gICAgfSxcbiAgICBlYWNoOiBmdW5jdGlvbihjYWxsQmFjaykge1xuICAgICAgcmV0dXJuIF8uZWFjaChhcnJheSwgZnVuY3Rpb24oY29sdW1ucywgcm93KSB7XG4gICAgICAgIHJldHVybiBfLmVhY2goYXJyYXlbcm93XSwgZnVuY3Rpb24odmFsLCBjb2wpIHtcbiAgICAgICAgICB2YXIgY29sSWR4LCByb3dJZHg7XG4gICAgICAgICAgcm93SWR4ID0gcm93ICsgMTtcbiAgICAgICAgICBjb2xJZHggPSBjb2wgKyAxO1xuICAgICAgICAgIHJldHVybiBjYWxsQmFjayhyb3dJZHgsIGNvbElkeCwgdmFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtYXhXaWR0aDtcbiAgICB9LFxuICAgIGxlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbWF4TGVuZ3RoO1xuICAgIH1cbiAgfTtcblxuICAvKlxuICBHdWFyYW50ZWUgdGhhdCB0aGUgZGltZW5zaW9ucyBvZiB0aGUgYXJyYXkgYXJlIGFsd2F5cyBiYWNrZWQgYnkgdmFsdWVzIGF0IGV2ZXJ5IHBvc2l0aW9uXG4gICAqL1xuICBleHRlbmQgPSBmdW5jdGlvbihsZW5ndGgsIHdpZHRoKSB7XG4gICAgdmFyIGksIHRyeVJvdztcbiAgICBpZiAoIWxlbmd0aCB8fCBsZW5ndGggPCAxKSB7XG4gICAgICBsZW5ndGggPSAxO1xuICAgIH1cbiAgICBpZiAoIXdpZHRoIHx8IHdpZHRoIDwgMSkge1xuICAgICAgd2lkdGggPSAxO1xuICAgIH1cbiAgICBpZiAobWF4TGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgICBtYXhMZW5ndGggPSBsZW5ndGg7XG4gICAgfVxuICAgIGlmIChhcnJheS5sZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAgIG1heExlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKG1heFdpZHRoIDwgd2lkdGgpIHtcbiAgICAgIG1heFdpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgbWF4TGVuZ3RoKSB7XG4gICAgICB0cnlSb3cgPSBhcnJheVtpXTtcbiAgICAgIGlmICghdHJ5Um93KSB7XG4gICAgICAgIHRyeVJvdyA9IFtdO1xuICAgICAgICBhcnJheS5wdXNoKHRyeVJvdyk7XG4gICAgICB9XG4gICAgICBpZiAobWF4V2lkdGggPCB0cnlSb3cubGVuZ3RoKSB7XG4gICAgICAgIG1heFdpZHRoID0gdHJ5Um93Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGlmICh0cnlSb3cubGVuZ3RoIDwgbWF4V2lkdGgpIHtcbiAgICAgICAgdHJ5Um93Lmxlbmd0aCA9IG1heFdpZHRoO1xuICAgICAgfVxuICAgICAgaSArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXlbbGVuZ3RoIC0gMV1bd2lkdGggLSAxXTtcbiAgfTtcbiAgZXh0ZW5kKGluaXRMZW5ndGgsIGluaXRXaWR0aCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5PSi5yZWdpc3RlcignYXJyYXkyRCcsIGFycmF5MkQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5MkQ7XG5cbiIsInZhciBPSiwgY29uc29sZSwgbWV0aG9kTGVuZ3RoLCBtZXRob2RzLFxuICBzbGljZSA9IFtdLnNsaWNlO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbm1ldGhvZHMgPSBbJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJywgJ2V4Y2VwdGlvbicsICdncm91cCcsICdncm91cENvbGxhcHNlZCcsICdncm91cEVuZCcsICdpbmZvJywgJ2xvZycsICdtZW1vcnknLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsICd0aW1lU3RhbXAnLCAndGltZWxpbmUnLCAndGltZWxpbmVFbmQnLCAndHJhY2UnLCAnd2FybiddO1xuXG5tZXRob2RMZW5ndGggPSBtZXRob2RzLmxlbmd0aDtcblxuY29uc29sZSA9IE9KLmdsb2JhbC5jb25zb2xlIHx8IHt9O1xuXG5PSi5tYWtlU3ViTmFtZVNwYWNlKCdjb25zb2xlJyk7XG5cblxuLypcbjEuIFN0dWIgb3V0IGFueSBtaXNzaW5nIG1ldGhvZHMgd2l0aCBub29wXG4yLiBEZWZpbmUgdGhlIGF2YWlsYWJsZSBtZXRob2RzIG9uIHRoZSBPSi5jb25zb2xlIG9iamVjdFxuICovXG5cbndoaWxlIChtZXRob2RMZW5ndGgtLSkge1xuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1ldGhvZDtcbiAgICBtZXRob2QgPSBtZXRob2RzW21ldGhvZExlbmd0aF07XG4gICAgaWYgKCFjb25zb2xlW21ldGhvZF0pIHtcbiAgICAgIGNvbnNvbGVbbWV0aG9kXSA9IE9KLm5vb3A7XG4gICAgfVxuICAgIHJldHVybiBPSi5jb25zb2xlLnJlZ2lzdGVyKG1ldGhvZCwgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFyYW1zO1xuICAgICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICByZXR1cm4gY29uc29sZVttZXRob2RdLmFwcGx5KGNvbnNvbGUsIHBhcmFtcyk7XG4gICAgfSk7XG4gIH0pKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29uc29sZTtcblxuIiwidmFyICQsIE9KLCBhbGwsIGNvb2tpZXMsIGRlbCwgZGVsZXRlQWxsLCBnZXQsIHNldDtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xuXG5cbi8qXG5TZXR1cCBzZXR0aW5nc1xuJC5jb29raWUucmF3ID0gdHJ1ZVxuJC5jb29raWUuanNvbiA9IHRydWVcbiAgXG5TZXR1cCBkZWZhdWx0c1xuaHR0cHM6Ly9naXRodWIuY29tL2NhcmhhcnRsL2pxdWVyeS1jb29raWUvXG4kLmNvb2tpZS5kZWZhdWx0cy5leHBpcmVzID0gMzY1XG4kLmNvb2tpZS5kZWZhdWx0cy5wYXRoID0gJy8nXG4kLmNvb2tpZS5kZWZhdWx0cy5kb21haW4gPSAnb2ouY29tJ1xuICovXG5cbmlmICghJCB8fCAhJC5jb29raWUpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdqUXVlcnkgQ29va2llIGlzIGEgcmVxdWlyZWQgZGVwZW5kZW5jeS4nKTtcbn1cblxuJC5jb29raWUuZGVmYXVsdHMuc2VjdXJlID0gZmFsc2U7XG5cbmNvb2tpZXMgPSB7fTtcblxuZ2V0ID0gZnVuY3Rpb24oY29va2llTmFtZSwgdHlwZSkge1xuICB2YXIgcmV0O1xuICByZXQgPSAnJztcbiAgaWYgKGNvb2tpZU5hbWUpIHtcbiAgICBpZiAodHlwZSkge1xuICAgICAgcmV0ID0gJC5jb29raWUoY29va2llTmFtZSwgdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldCA9ICQuY29va2llKGNvb2tpZU5hbWUpO1xuICAgIH1cbiAgICBpZiAocmV0KSB7XG4gICAgICByZXR1cm4gY29va2llc1tjb29raWVOYW1lXSA9IHJldDtcbiAgICB9XG4gIH1cbn07XG5cbmFsbCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0O1xuICByZXQgPSAkLmNvb2tpZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuc2V0ID0gZnVuY3Rpb24oY29va2llTmFtZSwgdmFsdWUsIG9wdHMpIHtcbiAgdmFyIHJldDtcbiAgcmV0ID0gJyc7XG4gIGlmIChjb29raWVOYW1lKSB7XG4gICAgY29va2llc1tjb29raWVOYW1lXSA9IHZhbHVlO1xuICAgIGlmIChvcHRzKSB7XG4gICAgICByZXQgPSAkLmNvb2tpZShjb29raWVOYW1lLCB2YWx1ZSwgb3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldCA9ICQuY29va2llKGNvb2tpZU5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbmRlbCA9IGZ1bmN0aW9uKGNvb2tpZU5hbWUsIG9wdHMpIHtcbiAgaWYgKGNvb2tpZU5hbWUpIHtcbiAgICBpZiAob3B0cykge1xuICAgICAgJC5yZW1vdmVDb29raWUoY29va2llTmFtZSwgb3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQucmVtb3ZlQ29va2llKGNvb2tpZU5hbWUpO1xuICAgIH1cbiAgICBkZWxldGUgY29va2llc1tjb29raWVOYW1lXTtcbiAgfVxufTtcblxuZGVsZXRlQWxsID0gZnVuY3Rpb24oKSB7XG4gIGNvb2tpZXMgPSB7fTtcbiAgT0ouZWFjaChPSi5jb29raWUuYWxsLCBmdW5jdGlvbih2YWwsIGtleSkge1xuICAgIHJldHVybiBPSi5jb29raWVbXCJkZWxldGVcIl0oa2V5KTtcbiAgfSk7XG59O1xuXG5PSi5jb29raWUucmVnaXN0ZXIoJ2RlbGV0ZUFsbCcsIGRlbGV0ZUFsbCk7XG5cbk9KLmNvb2tpZS5yZWdpc3RlcignZGVsZXRlJywgZGVsKTtcblxuT0ouY29va2llLnJlZ2lzdGVyKCdzZXQnLCBzZXQpO1xuXG5PSi5jb29raWUucmVnaXN0ZXIoJ2dldCcsIGdldCk7XG5cbk9KLmNvb2tpZS5yZWdpc3RlcignYWxsJywgYWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlbGV0ZUFsbDogZGVsZXRlQWxsLFxuICBcImRlbGV0ZVwiOiBkZWwsXG4gIHNldDogc2V0LFxuICBnZXQ6IGdldCxcbiAgYWxsOiBhbGxcbn07XG5cbiIsInZhciBPSiwgZGVmZXI7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxuZGVmZXIgPSBmdW5jdGlvbihtZXRob2QsIHdhaXRNcykge1xuICBpZiAod2FpdE1zICYmIHNldFRpbWVvdXQpIHtcbiAgICBzZXRUaW1lb3V0KG1ldGhvZCwgd2FpdE1zKTtcbiAgfVxuICByZXR1cm4gKG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICB9KSkudGhlbihtZXRob2QpO1xufTtcblxuT0oucmVnaXN0ZXIoJ2RlZmVyJywgZGVmZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmVyO1xuXG4iLCJ2YXIgT0osIGNhbkVhY2gsIGVhY2g7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxuY2FuRWFjaCA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gT0ouaXMucGxhaW5PYmplY3Qob2JqKSB8fCBPSi5pcy5vYmplY3Qob2JqKSB8fCBPSi5pcy5hcnJheShvYmopO1xufTtcblxuZWFjaCA9IGZ1bmN0aW9uKG9iaiwgb25FYWNoLCByZWN1cnNpdmUpIHtcbiAgaWYgKGNhbkVhY2gob2JqKSkge1xuICAgIF8uZm9yT3duKG9iaiwgZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgICAgIHZhciBxdWl0O1xuICAgICAgaWYgKG9uRWFjaCAmJiAodmFsIHx8IGtleSkpIHtcbiAgICAgICAgcXVpdCA9IG9uRWFjaCh2YWwsIGtleSk7XG4gICAgICAgIGlmIChmYWxzZSA9PT0gcXVpdCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRydWUgPT09IHJlY3Vyc2l2ZSkge1xuICAgICAgICBlYWNoKHZhbCwgb25FYWNoLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuT0oucmVnaXN0ZXIoJ2VhY2gnLCBlYWNoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBlYWNoO1xuXG4iLCJ2YXIgT0osIGlucHV0VHlwZXMsIHVua25vd247XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxudW5rbm93biA9ICd1bmtub3duJztcblxuaW5wdXRUeXBlcyA9IHtcbiAgYnV0dG9uOiB7XG4gICAgaWQ6IDAsXG4gICAgbmFtZTogJ2J1dHRvbicsXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlLFxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2UsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJycsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgY2hlY2tib3g6IHtcbiAgICBpZDogMSxcbiAgICBuYW1lOiAnY2hlY2tib3gnLFxuICAgIHBsYWNlaG9sZGVyOiBmYWxzZSxcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJycsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgY29sb3I6IHtcbiAgICBpZDogMixcbiAgICBuYW1lOiAnY29sb3InLFxuICAgIHBsYWNlaG9sZGVyOiBmYWxzZSxcbiAgICBhdXRvY29tcGxldGU6IHRydWUsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJycsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgZGF0ZToge1xuICAgIGlkOiAzLFxuICAgIG5hbWU6ICdkYXRlJyxcbiAgICBwbGFjZWhvbGRlcjogZmFsc2UsXG4gICAgYXV0b2NvbXBsZXRlOiB0cnVlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBhbGxvd2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0d2lkdGg6ICcyMDBweCcsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgZGF0ZXRpbWU6IHtcbiAgICBpZDogNCxcbiAgICBuYW1lOiAnZGF0ZXRpbWUnLFxuICAgIHBsYWNlaG9sZGVyOiBmYWxzZSxcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBhbGxvd2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0d2lkdGg6ICcyMDBweCcsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgJ2RhdGV0aW1lLWxvY2FsJzoge1xuICAgIGlkOiA1LFxuICAgIG5hbWU6ICdkYXRldGltZS1sb2NhbCcsXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlLFxuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZSxcbiAgICB2YWx1ZToge1xuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgYWxsb3dlZDogdHJ1ZVxuICAgIH0sXG4gICAgZGVmYXVsdHdpZHRoOiAnMjAwcHgnLFxuICAgIGRlZmF1bHRzaXplOiAnMjUnXG4gIH0sXG4gIGVtYWlsOiB7XG4gICAgaWQ6IDYsXG4gICAgbmFtZTogJ2VtYWlsJyxcbiAgICBwbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICBhdXRvY29tcGxldGU6IHRydWUsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJzIwMHB4JyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9LFxuICBmaWxlOiB7XG4gICAgaWQ6IDcsXG4gICAgbmFtZTogJ2ZpbGUnLFxuICAgIHBsYWNlaG9sZGVyOiBmYWxzZSxcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBhbGxvd2VkOiBmYWxzZVxuICAgIH0sXG4gICAgZGVmYXVsdHdpZHRoOiAnJyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9LFxuICBoaWRkZW46IHtcbiAgICBpZDogOCxcbiAgICBuYW1lOiAnaGlkZGVuJyxcbiAgICBwbGFjZWhvbGRlcjogZmFsc2UsXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZSxcbiAgICB2YWx1ZToge1xuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgYWxsb3dlZDogdHJ1ZVxuICAgIH0sXG4gICAgZGVmYXVsdHdpZHRoOiAnJyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9LFxuICBpbWFnZToge1xuICAgIGlkOiA5LFxuICAgIG5hbWU6ICdpbWFnZScsXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlLFxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2UsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJycsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgbW9udGg6IHtcbiAgICBpZDogMTAsXG4gICAgbmFtZTogJ21vbnRoJyxcbiAgICBwbGFjZWhvbGRlcjogZmFsc2UsXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZSxcbiAgICB2YWx1ZToge1xuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgYWxsb3dlZDogdHJ1ZVxuICAgIH0sXG4gICAgZGVmYXVsdHdpZHRoOiAnJyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9LFxuICBudW1iZXI6IHtcbiAgICBpZDogMTEsXG4gICAgbmFtZTogJ251bWJlcicsXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlLFxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2UsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJzIwMHB4JyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9LFxuICBwYXNzd29yZDoge1xuICAgIGlkOiAxMixcbiAgICBuYW1lOiAncGFzc3dvcmQnLFxuICAgIHBsYWNlaG9sZGVyOiB0cnVlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBhbGxvd2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0d2lkdGg6ICcyMDBweCcsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgcmFkaW86IHtcbiAgICBpZDogMTMsXG4gICAgbmFtZTogJ3JhZGlvJyxcbiAgICBwbGFjZWhvbGRlcjogZmFsc2UsXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZSxcbiAgICB2YWx1ZToge1xuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICBhbGxvd2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0d2lkdGg6ICcnLFxuICAgIGRlZmF1bHRzaXplOiAnMjUnXG4gIH0sXG4gIHJhbmdlOiB7XG4gICAgaWQ6IDE0LFxuICAgIG5hbWU6ICdyYW5nZScsXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlLFxuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZSxcbiAgICB2YWx1ZToge1xuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgYWxsb3dlZDogdHJ1ZVxuICAgIH0sXG4gICAgZGVmYXVsdHdpZHRoOiAnJyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9LFxuICByZXNldDoge1xuICAgIGlkOiAxNSxcbiAgICBuYW1lOiAncmVzZXQnLFxuICAgIHBsYWNlaG9sZGVyOiBmYWxzZSxcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBhbGxvd2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0d2lkdGg6ICcnLFxuICAgIGRlZmF1bHRzaXplOiAnMjUnXG4gIH0sXG4gIHNlYXJjaDoge1xuICAgIGlkOiAxNixcbiAgICBuYW1lOiAnc2VhcmNoJyxcbiAgICBwbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICBhdXRvY29tcGxldGU6IHRydWUsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJycsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgc3VibWl0OiB7XG4gICAgaWQ6IDE3LFxuICAgIG5hbWU6ICdzdWJtaXQnLFxuICAgIHBsYWNlaG9sZGVyOiBmYWxzZSxcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBhbGxvd2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0d2lkdGg6ICcnLFxuICAgIGRlZmF1bHRzaXplOiAnMjUnXG4gIH0sXG4gIHRlbDoge1xuICAgIGlkOiAxOCxcbiAgICBuYW1lOiAnYnV0dG9uJyxcbiAgICBwbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICBhdXRvY29tcGxldGU6IHRydWUsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJycsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgdGV4dDoge1xuICAgIGlkOiAxOSxcbiAgICBuYW1lOiAndGV4dCcsXG4gICAgcGxhY2Vob2xkZXI6IHRydWUsXG4gICAgYXV0b2NvbXBsZXRlOiB0cnVlLFxuICAgIHZhbHVlOiB7XG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICBhbGxvd2VkOiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0d2lkdGg6ICcyMDBweCcsXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcbiAgfSxcbiAgdGltZToge1xuICAgIGlkOiAyMCxcbiAgICBuYW1lOiAndGltZScsXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlLFxuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZSxcbiAgICB2YWx1ZToge1xuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgYWxsb3dlZDogdHJ1ZVxuICAgIH0sXG4gICAgZGVmYXVsdHdpZHRoOiAnMjAwcHgnLFxuICAgIGRlZmF1bHRzaXplOiAnMjUnXG4gIH0sXG4gIHVybDoge1xuICAgIGlkOiAyMSxcbiAgICBuYW1lOiAndXJsJyxcbiAgICBwbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICBhdXRvY29tcGxldGU6IHRydWUsXG4gICAgdmFsdWU6IHtcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGFsbG93ZWQ6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHR3aWR0aDogJzIwMHB4JyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9LFxuICB3ZWVrOiB7XG4gICAgaWQ6IDIyLFxuICAgIG5hbWU6ICd3ZWVrJyxcbiAgICBwbGFjZWhvbGRlcjogZmFsc2UsXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZSxcbiAgICB2YWx1ZToge1xuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgYWxsb3dlZDogdHJ1ZVxuICAgIH0sXG4gICAgZGVmYXVsdHdpZHRoOiAnJyxcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuICB9XG59O1xuXG5PSi5lbnVtcy5yZWdpc3RlcigndW5rbm93bicsIHVua25vd24pO1xuXG5PSi5lbnVtcy5yZWdpc3RlcignaW5wdXRUeXBlcycsIGlucHV0VHlwZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdW5rbm93bjogdW5rbm93bixcbiAgaW5wdXRUeXBlczogaW5wdXRUeXBlc1xufTtcblxuIiwidmFyICQsIElTLCBPSiwgXztcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xuXG5fID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xuXG5JUyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSVMoKSB7fVxuXG4gIElTLmJvb2wgPSBmdW5jdGlvbihib29sZWFuKSB7XG4gICAgcmV0dXJuIF8uaXNCb29sZWFuKGJvb2xlYW4pO1xuICB9O1xuXG4gIElTLmFycmF5TnVsbE9yRW1wdHkgPSBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gXy5pc0VtcHR5KGFycik7XG4gIH07XG5cbiAgSVMuc3RyaW5nTnVsbE9yRW1wdHkgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyICYmICghc3RyLmxlbmd0aCB8fCBzdHIubGVuZ3RoID09PSAwIHx8ICFzdHIudHJpbSB8fCAhc3RyLnRyaW0oKSk7XG4gIH07XG5cbiAgSVMubnVtYmVyTnVsbE9yRW1wdHkgPSBmdW5jdGlvbihudW0pIHtcbiAgICByZXR1cm4gIW51bSB8fCBpc05hTihudW0pIHx8ICFudW0udG9QcmVjaXNpb247XG4gIH07XG5cbiAgSVMuZGF0ZU51bGxPckVtcHR5ID0gZnVuY3Rpb24oZHQpIHtcbiAgICByZXR1cm4gIWR0IHx8ICFkdC5nZXRUaW1lO1xuICB9O1xuXG4gIElTLm9iamVjdE51bGxPckVtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNFbXB0eShvYmogfHwgIU9iamVjdC5rZXlzKG9iaikgfHwgT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDApO1xuICB9O1xuXG4gIElTLnBsYWluT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNQbGFpbk9iamVjdChvYmopO1xuICB9O1xuXG4gIElTLm9iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzT2JqZWN0KG9iaik7XG4gIH07XG5cbiAgSVMuZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XG4gICAgcmV0dXJuIF8uaXNEYXRlKGR0KTtcbiAgfTtcblxuXG4gIC8qXG4gIERldGVybWluZXMgaWYgYSB2YWx1ZSBpcyBhbiBpbnN0YW5jZSBvZiBhIE51bWJlciBhbmQgbm90IE5hTipcbiAgICovXG5cbiAgSVMubnVtYmVyID0gZnVuY3Rpb24obnVtKSB7XG4gICAgdmFyIG51bWJlcjtcbiAgICBudW1iZXIgPSByZXF1aXJlKCcuLi9jb3JlL251bWJlcicpO1xuICAgIHJldHVybiB0eXBlb2YgbnVtID09PSAnbnVtYmVyJyAmJiBmYWxzZSA9PT0gKG51bWJlci5pc05hTihudW0pIHx8IGZhbHNlID09PSBudW1iZXIuaXNGaW5pdGUobnVtKSB8fCBudW1iZXIuTUFYX1ZBTFVFID09PSBudW0gfHwgbnVtYmVyLk1JTl9WQUxVRSA9PT0gbnVtKTtcbiAgfTtcblxuXG4gIC8qXG4gIERldGVybWluZXMgaWYgYSB2YWx1ZSBpcyBjb252ZXJ0aWJsZSB0byBhIE51bWJlclxuICAgKi9cblxuICBJUy5udW1lcmljID0gZnVuY3Rpb24obnVtKSB7XG4gICAgdmFyIG51TnVtLCByZXQsIHRvO1xuICAgIHJldCA9IHRoaXMubnVtYmVyKG51bSk7XG4gICAgaWYgKCFyZXQpIHtcbiAgICAgIHRvID0gcmVxdWlyZSgnLi90bycpO1xuICAgICAgbnVOdW0gPSB0by5udW1iZXIobnVtKTtcbiAgICAgIHJldCA9IHRoaXMubnVtYmVyKG51TnVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfTtcblxuICBJUy5lbGVtZW50SW5Eb20gPSBmdW5jdGlvbihlbGVtZW50SWQpIHtcbiAgICByZXR1cm4gZmFsc2UgPT09IHRoaXMubnVsbE9yRW1wdHkoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElkKSk7XG4gIH07XG5cbiAgSVMuYXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaik7XG4gIH07XG5cbiAgSVMuc3RyaW5nID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIF8uaXNTdHJpbmcoc3RyKTtcbiAgfTtcblxuICBJU1tcInRydWVcIl0gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gJ3RydWUnIHx8IG9iaiA9PT0gMSB8fCBvYmogPT09ICcxJztcbiAgfTtcblxuICBJU1tcImZhbHNlXCJdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gZmFsc2UgfHwgb2JqID09PSAnZmFsc2UnIHx8IG9iaiA9PT0gMCB8fCBvYmogPT09ICcwJztcbiAgfTtcblxuICBJUy50cnVlT3JGYWxzZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0aGlzW1widHJ1ZVwiXShvYmogfHwgdGhpc1tcImZhbHNlXCJdKG9iaikpO1xuICB9O1xuXG4gIElTLm51bGxPckVtcHR5ID0gZnVuY3Rpb24ob2JqLCBjaGVja0xlbmd0aCkge1xuICAgIHJldHVybiBfLmlzRW1wdHkob2JqKSB8fCBfLmlzVW5kZWZpbmVkKG9iaikgfHwgXy5pc051bGwob2JqKSB8fCBfLmlzTmFOKG9iaik7XG4gIH07XG5cbiAgSVMubnVsbE9yVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqLCBjaGVja0xlbmd0aCkge1xuICAgIHJldHVybiBfLmlzVW5kZWZpbmVkKG9iaikgfHwgXy5pc051bGwob2JqKSB8fCBfLmlzTmFOKG9iaik7XG4gIH07XG5cbiAgSVNbXCJpbnN0YW5jZW9mXCJdID0gZnVuY3Rpb24obmFtZSwgb2JqKSB7XG4gICAgcmV0dXJuIG9iai50eXBlID09PSBuYW1lIHx8IG9iaiBpbnN0YW5jZW9mIG5hbWU7XG4gIH07XG5cbiAgSVMubWV0aG9kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAhPT0gT0oubm9vcCAmJiBfLmlzRnVuY3Rpb24ob2JqKTtcbiAgfTtcblxuXG4gIC8qXG4gIERlcHJlY2F0ZWQuIExlZnQgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LiBVc2UgaXMubWV0aG9kIGluc3RlYWQuXG4gICAqL1xuXG4gIElTLmZ1bmMgPSBJUy5tZXRob2Q7XG5cbiAgcmV0dXJuIElTO1xuXG59KSgpO1xuXG5PSi5yZWdpc3RlcignaXMnLCBJUyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSVM7XG5cbiIsInZhciBPSiwgbWFrZU5vdHksIG5vdHk7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxubm90eSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wydub3R5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydub3R5J10gOiBudWxsKTtcblxubWFrZU5vdHkgPSBmdW5jdGlvbihvcHRpb25zLCBvd25lcikge1xuICB2YXIgZGVmYXVsdHMsIHJldDtcbiAgZGVmYXVsdHMgPSB7XG4gICAgbGF5b3V0OiAndG9wUmlnaHQnLFxuICAgIHRoZW1lOiAnZGVmYXVsdFRoZW1lJyxcbiAgICB0eXBlOiAnYWxlcnQnLFxuICAgIHRleHQ6ICcnLFxuICAgIGRpc21pc3NRdWV1ZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJub3R5X21lc3NhZ2VcIj48c3BhbiBjbGFzcz1cIm5vdHlfdGV4dFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibm90eV9jbG9zZVwiPjwvZGl2PjwvZGl2PicsXG4gICAgYW5pbWF0aW9uOiB7XG4gICAgICBvcGVuOiB7XG4gICAgICAgIGhlaWdodDogJ3RvZ2dsZSdcbiAgICAgIH0sXG4gICAgICBjbG9zZToge1xuICAgICAgICBoZWlnaHQ6ICd0b2dnbGUnXG4gICAgICB9LFxuICAgICAgZWFzaW5nOiAnc3dpbmcnLFxuICAgICAgc3BlZWQ6IDUwMFxuICAgIH0sXG4gICAgdGltZW91dDogNTAwMCxcbiAgICBmb3JjZTogZmFsc2UsXG4gICAgbW9kYWw6IGZhbHNlLFxuICAgIG1heFZpc2libGU6IDUsXG4gICAga2lsbGVyOiBmYWxzZSxcbiAgICBjbG9zZVdpdGg6IFsnY2xpY2snXSxcbiAgICBjYWxsYmFjazoge1xuICAgICAgb25TaG93OiBPSi5ub29wLFxuICAgICAgYWZ0ZXJTaG93OiBPSi5ub29wLFxuICAgICAgb25DbG9zZTogT0oubm9vcCxcbiAgICAgIGFmdGVyQ2xvc2U6IE9KLm5vb3BcbiAgICB9LFxuICAgIGJ1dHRvbnM6IGZhbHNlXG4gIH07XG4gIE9KLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZSk7XG4gIHJldCA9IG5vdHkoZGVmYXVsdHMpO1xuICByZXR1cm4gcmV0O1xufTtcblxuT0oubm90aWZpY2F0aW9ucy5yZWdpc3Rlcignbm90eScsIG1ha2VOb3R5KTtcblxubW9kdWxlLmV4cG9ydHMgPSBtYWtlTm90eTtcblxuIiwidmFyIE9KLCBQdWJTdWIsIGV2ZW50cywgcHMsIHN1YnNjcmliZXJzLCB0b2tlbnM7XG5cbk9KID0gcmVxdWlyZSgnLi4vb2onKTtcblxuUHViU3ViID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ1B1YlN1YiddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUHViU3ViJ10gOiBudWxsKTtcblxudG9rZW5zID0ge307XG5cbnN1YnNjcmliZXJzID0gW107XG5cbmV2ZW50cyA9IHt9O1xuXG5wcyA9IHtcbiAgZ2V0RXZlbnROYW1lOiBmdW5jdGlvbihldmVudCkge1xuICAgIHJldHVybiBldmVudC50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoJyAnLCAnXycpO1xuICB9LFxuICBzdWJzY3JpYmU6IGZ1bmN0aW9uKGV2ZW50LCBtZXRob2QpIHtcbiAgICB2YXIgZXZlbnROYW1lLCB0b2tlbjtcbiAgICBldmVudE5hbWUgPSBwcy5nZXRFdmVudE5hbWUoZXZlbnQpO1xuICAgIGlmICghZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgIGV2ZW50c1tldmVudE5hbWVdID0gW107XG4gICAgfVxuICAgIHRva2VuID0gUHViU3ViLnN1YnNjcmliZShldmVudE5hbWUsIG1ldGhvZCk7XG4gICAgdG9rZW5zW3Rva2VuXSA9IHRva2VuO1xuICAgIHN1YnNjcmliZXJzLnB1c2gobWV0aG9kKTtcbiAgICBldmVudHNbZXZlbnROYW1lXS5wdXNoKG1ldGhvZCk7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9LFxuICBwdWJsaXNoOiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgIHZhciBldmVudE5hbWU7XG4gICAgZXZlbnROYW1lID0gcHMuZ2V0RXZlbnROYW1lKGV2ZW50KTtcbiAgICBpZiAoZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKGV2ZW50TmFtZSwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE9KLmNvbnNvbGUuaW5mbygnRXZlbnQgbmFtZWQgeycgKyBldmVudCArICd9IGlzIG5vdCByZWNvZ25pemVkLicpO1xuICAgIH1cbiAgfSxcbiAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uKHRva2VuT3JNZXRob2QpIHtcbiAgICBpZiAoT0ouaXMubWV0aG9kKHRva2VuT3JNZXRob2QpKSB7XG4gICAgICBpZiAoLTEgIT09IHN1YnNjcmliZXJzLmluZGV4T2YodG9rZW5Pck1ldGhvZCkpIHtcbiAgICAgICAgUHViU3ViLnVuc3Vic2NyaWJlKHRva2VuT3JNZXRob2QpO1xuICAgICAgICBzdWJzY3JpYmVycyA9IF8ucmVtb3ZlKHN1YnNjcmliZXJzLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kID09PSB0b2tlbk9yTWV0aG9kO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9KLmNvbnNvbGUuaW5mbygnRXZlbnQgbWV0aG9kIGlzIG5vdCByZWNvZ25pemVkLicpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodG9rZW5zW3Rva2VuT3JNZXRob2RdKSB7XG4gICAgICAgIFB1YlN1Yi51bnN1YnNjcmliZSh0b2tlbk9yTWV0aG9kKTtcbiAgICAgICAgZGVsZXRlIHRva2Vuc1t0b2tlbk9yTWV0aG9kXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHVuc3Vic2NyaWJlQWxsOiBmdW5jdGlvbigpIHtcbiAgICBPSi5lYWNoKHRva2VucywgZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgIHJldHVybiB1bnN1YnNjcmliZSh0b2tlbik7XG4gICAgfSk7XG4gICAgc3Vic2NyaWJlcnMgPSBbXTtcbiAgICBldmVudHMgPSB7fTtcbiAgfSxcbiAgdW5zdWJzY3JpYmVFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZXZlbnROYW1lO1xuICAgIGV2ZW50TmFtZSA9IHBzLmdldEV2ZW50TmFtZShldmVudCk7XG4gICAgaWYgKGV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICBPSi5lYWNoKGV2ZW50c1tldmVudE5hbWVdLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHVuc3Vic2NyaWJlKG1ldGhvZCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgT0ouY29uc29sZS5pbmZvKCdFdmVudCBuYW1lZCB7JyArIGV2ZW50ICsgJ30gaXMgbm90IHJlY29nbml6ZWQuJyk7XG4gICAgfVxuICAgIGRlbGV0ZSBldmVudHNbZXZlbnROYW1lXTtcbiAgfVxufTtcblxuT2JqZWN0LnNlYWwocHMpO1xuXG5PYmplY3QuZnJlZXplKHBzKTtcblxuT0oucmVnaXN0ZXIoJ2dldEV2ZW50TmFtZScsIHBzLmdldEV2ZW50TmFtZSk7XG5cbk9KLnJlZ2lzdGVyKCdwdWJsaXNoJywgcHMucHVibGlzaCk7XG5cbk9KLnJlZ2lzdGVyKCdzdWJzY3JpYmUnLCBwcy5zdWJzY3JpYmUpO1xuXG5PSi5yZWdpc3RlcigndW5zdWJzY3JpYmUnLCBwcy51bnN1YnNjcmliZSk7XG5cbk9KLnJlZ2lzdGVyKCd1bnN1YnNjcmliZUFsbCcsIHBzLnVuc3Vic2NyaWJlQWxsKTtcblxuT0oucmVnaXN0ZXIoJ3Vuc3Vic2NyaWJlRXZlbnQnLCBwcy51bnN1YnNjcmliZUV2ZW50KTtcblxubW9kdWxlLmV4cG9ydHMgPSBwcztcblxuIiwidmFyIE9KLCBxdWVyeVN0cmluZztcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5cbi8qXG5odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzkwMTExNS9ob3ctY2FuLWktZ2V0LXF1ZXJ5LXN0cmluZy12YWx1ZXMtaW4tamF2YXNjcmlwdFxuICovXG5cbnF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24ocGFyYW0pIHtcbiAgdmFyIGksIHBhcmFtcywgcHJtLCByZXQ7XG4gIHJldCA9IHt9O1xuICBpZiAoT0ouZ2xvYmFsLmxvY2F0aW9uKSB7XG4gICAgcGFyYW1zID0gT0ouZ2xvYmFsLmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkuc3BsaXQoJyYnKTtcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBpID0gMDtcbiAgICAgIHdoaWxlIChpIDwgcGFyYW1zLmxlbmd0aCkge1xuICAgICAgICBwcm0gPSBwYXJhbXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgaWYgKHBybS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICByZXRbcHJtWzBdXSA9IE9KLmdsb2JhbC5kZWNvZGVVUklDb21wb25lbnQocHJtWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICAgICAgICB9XG4gICAgICAgIGkgKz0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbk9KLnJlZ2lzdGVyKCdxdWVyeVN0cmluZycsIHF1ZXJ5U3RyaW5nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBxdWVyeVN0cmluZztcblxuIiwidmFyIE9KLCBfLCBlYWNoLCBvYmosIHJuZyxcbiAgc2xpY2UgPSBbXS5zbGljZTtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5fID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xuXG5vYmogPSByZXF1aXJlKCcuLi9jb3JlL29iamVjdCcpO1xuXG5lYWNoID0gcmVxdWlyZSgnLi9lYWNoJyk7XG5cbnJuZyA9IHtcbiAgcmFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIF8ucmFuZ2UuYXBwbHkoXywgcGFyYW1zKTtcbiAgfSxcbiAgcmFuZ2VNaW46IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJhbXM7XG4gICAgcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIF8ubWluLmFwcGx5KF8sIHBhcmFtcyk7XG4gIH0sXG4gIHJhbmdlTWF4OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyYW1zO1xuICAgIHBhcmFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJldHVybiBfLm1heC5hcHBseShfLCBwYXJhbXMpO1xuICB9LFxuXG4gIC8qXG4gIFRha2UgYW4gYXJyYXkgb2Ygc3RyaW5nIHZhbHVlcyBhbmQgYSBudW1iZXIgb2YgcGFydGl0aW9ucyB0byBjcmVhdGUuXG4gIFVzZXMgdGhlIGZpcnN0IGxldHRlciBvZiBlYWNoIHN0cmluZyB2YWx1ZSBpbiB0aGUgYXJyYXkgdG8gY29udmVydCB0byB1bmlxdWUgY29kZSBjaGFyYWN0ZXIgKGxvd2VyIGNhc2UpXG4gIEJ1aWxkcyBhIGludCByYW5nZSBiYXNlZCBvbiB1bmlxdWUgY29kZSBjaGFycy5cbiAgICovXG4gIHN0cmluZ1RvU3ViUmFuZ2VzOiBmdW5jdGlvbihuLCByYW5nZSkge1xuICAgIHZhciBjaGFyUmFuZ2UsIGksIG9sZEdldFJhbmdlLCByZXQsIHN1YlJhbmdlO1xuICAgIGlmIChuID09IG51bGwpIHtcbiAgICAgIG4gPSA2O1xuICAgIH1cbiAgICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgICAgcmFuZ2UgPSBbXTtcbiAgICB9XG4gICAgY2hhclJhbmdlID0gW107XG4gICAgZWFjaChyYW5nZSwgZnVuY3Rpb24odmFsKSB7XG4gICAgICB2YXIgY2hhcjtcbiAgICAgIGNoYXIgPSB2YWwudHJpbSgpWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoZmFsc2UgPT09IG9iai5jb250YWlucyhjaGFyUmFuZ2UsIGNoYXIpKSB7XG4gICAgICAgIHJldHVybiBjaGFyUmFuZ2UucHVzaChjaGFyLmNoYXJDb2RlQXQoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0ID0gcm5nLnRvU3ViUmFuZ2VzKG4sIGNoYXJSYW5nZSk7XG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBuKSB7XG4gICAgICBpICs9IDE7XG4gICAgICBzdWJSYW5nZSA9IHJldFtpXTtcbiAgICAgIHN1YlJhbmdlLm1hcChTdHJpbmcuZnJvbUNoYXJDb2RlKTtcbiAgICB9XG4gICAgb2xkR2V0UmFuZ2UgPSByZXQuZ2V0UmFuZ2U7XG4gICAgcmV0LmdldFJhbmdlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICB2YXIgY2hhciwgaWR4O1xuICAgICAgY2hhciA9IHZhbC50cmltKClbMF0udG9Mb3dlckNhc2UoKS5jaGFyQ29kZUF0KCk7XG4gICAgICBpZHggPSBvbGRHZXRSYW5nZShjaGFyKTtcbiAgICAgIHJldHVybiBpZHg7XG4gICAgfTtcbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIC8qXG4gIFRha2UgYW4gYXJyYXkgb2YgaW50IHZhbHVlcyBhbmQgYSBudW1iZXIgb2YgcGFydGl0aW9ucyB0byBjcmVhdGUuXG4gIERpdmlkZXMgdGhlIG9yaWdpbmFsIGFycmF5IGludG8gdGhlIHNwZWNpZmllZCBudW1iZXIgb2Ygc3ViIGFycmF5cy5cbiAgT3ZlcmZsb3cgaXMgcGFzc2VkIHRvIHRoZSBmaW5hbCBwYXJ0aXRpb24uXG4gICAqL1xuICB0b1N1YlJhbmdlczogZnVuY3Rpb24obiwgcmFuZ2UpIHtcbiAgICB2YXIgY2h1bmtWYWwsIGRpc3RhbmNlLCBpLCBqdW1wLCBtYXAsIHJhbmdlSGlnaCwgcmFuZ2VMb3csIHJldCwgc3ViUmFuZ2UsIHN1YlJhbmdlU2l6ZSwgc3ViUmFuZ2VzO1xuICAgIGlmIChuID09IG51bGwpIHtcbiAgICAgIG4gPSA2O1xuICAgIH1cbiAgICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgICAgcmFuZ2UgPSBbXTtcbiAgICB9XG4gICAgcmV0ID0gb2JqLm9iamVjdCgpO1xuICAgIHJhbmdlTG93ID0gcm5nLnJhbmdlTWluKHJhbmdlKTtcbiAgICByYW5nZUhpZ2ggPSBybmcucmFuZ2VNYXgocmFuZ2UpO1xuICAgIGRpc3RhbmNlID0gcmFuZ2VIaWdoIC0gcmFuZ2VMb3c7XG4gICAgc3ViUmFuZ2VTaXplID0gZGlzdGFuY2UgLyBuO1xuICAgIHN1YlJhbmdlcyA9IHJldC5hZGQoJ3JhbmdlcycsIG9iai5vYmplY3QoKSk7XG4gICAgY2h1bmtWYWwgPSByYW5nZUxvdztcbiAgICBtYXAgPSBvYmoub2JqZWN0KCk7XG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBuKSB7XG4gICAgICBpICs9IDE7XG4gICAgICBpZiAoaSA8IG4pIHtcbiAgICAgICAganVtcCA9IE1hdGgucm91bmQoc3ViUmFuZ2VTaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGp1bXAgPSBNYXRoLmZsb29yKHN1YlJhbmdlU2l6ZSk7XG4gICAgICAgIGlmIChjaHVua1ZhbCArIGp1bXAgPD0gcmFuZ2VIaWdoKSB7XG4gICAgICAgICAganVtcCArPSByYW5nZUhpZ2ggLSBjaHVua1ZhbCAtIGp1bXAgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdWJSYW5nZSA9IHJuZy5yYW5nZShjaHVua1ZhbCwgY2h1bmtWYWwgKyBqdW1wKTtcbiAgICAgIGVhY2goc3ViUmFuZ2UsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gbWFwLmFkZCh2YWwsIGkpO1xuICAgICAgfSk7XG4gICAgICBzdWJSYW5nZXNbaV0gPSBzdWJSYW5nZTtcbiAgICAgIGNodW5rVmFsICs9IGp1bXA7XG4gICAgfVxuICAgIHJldC5hZGQoJ2dldFJhbmdlJywgZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gbWFwW3ZhbF07XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufTtcblxuT2JqZWN0LnNlYWwocm5nKTtcblxuT2JqZWN0LmZyZWV6ZShybmcpO1xuXG5PSi5yZWdpc3RlcigncmFuZ2VzJywgcm5nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBybmc7XG5cbiIsInZhciAkLCBJUywgT0osIFRPLCBfO1xuXG5PSiA9IHJlcXVpcmUoJy4uL29qJyk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG5cbl8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5cbklTID0gcmVxdWlyZSgnLi9pcycpO1xuXG5UTyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gVE8oKSB7fVxuXG4gIFRPLmJvb2wgPSBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgcmV0Qm9vbDtcbiAgICByZXRCb29sID0gSVNbJ3RydWUnXShzdHIpO1xuICAgIGlmIChyZXRCb29sID09PSBmYWxzZSB8fCByZXRCb29sICE9PSB0cnVlKSB7XG4gICAgICByZXRCb29sID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiByZXRCb29sO1xuICB9O1xuXG4gIFRPLkVTNV9Ub0Jvb2wgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gdmFsICE9PSBmYWxzZSAmJiB2YWwgIT09IDAgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgKHR5cGVvZiB2YWwgIT09ICdudW1iZXInIHx8ICFpc05hTih2YWwpKTtcbiAgfTtcblxuICBUTy5kYXRlRnJvbVRpY2tzID0gZnVuY3Rpb24odGlja1N0cikge1xuICAgIHZhciBhcnIsIGxvY2FsT2Zmc2V0LCBvZmZzZXQsIHJldCwgdGlja3MsIHRpY3NEYXRlVGltZTtcbiAgICB0aWNzRGF0ZVRpbWUgPSB0aGlzLnN0cmluZyh0aWNrU3RyKTtcbiAgICByZXQgPSB2b2lkIDA7XG4gICAgdGlja3MgPSB2b2lkIDA7XG4gICAgb2Zmc2V0ID0gdm9pZCAwO1xuICAgIGxvY2FsT2Zmc2V0ID0gdm9pZCAwO1xuICAgIGFyciA9IHZvaWQgMDtcbiAgICBpZiAoZmFsc2UgPT09IElTLm51bGxPckVtcHR5KHRpY3NEYXRlVGltZSkpIHtcbiAgICAgIHRpY3NEYXRlVGltZSA9IHRpY3NEYXRlVGltZS5yZXBsYWNlKCcvJywgJycpO1xuICAgICAgdGljc0RhdGVUaW1lID0gdGljc0RhdGVUaW1lLnJlcGxhY2UoJ0RhdGUnLCAnJyk7XG4gICAgICB0aWNzRGF0ZVRpbWUgPSB0aWNzRGF0ZVRpbWUucmVwbGFjZSgnKCcsICcnKTtcbiAgICAgIHRpY3NEYXRlVGltZSA9IHRpY3NEYXRlVGltZS5yZXBsYWNlKCcpJywgJycpO1xuICAgICAgYXJyID0gdGljc0RhdGVUaW1lLnNwbGl0KCctJyk7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGlja3MgPSB0aGlzLm51bWJlcihhcnJbMF0pO1xuICAgICAgICBvZmZzZXQgPSB0aGlzLm51bWJlcihhcnJbMV0pO1xuICAgICAgICBsb2NhbE9mZnNldCA9IG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgICAgcmV0ID0gbmV3IERhdGUodGlja3MgLSAoKGxvY2FsT2Zmc2V0ICsgKG9mZnNldCAvIDEwMCAqIDYwKSkgKiAxMDAwKSk7XG4gICAgICB9IGVsc2UgaWYgKGFyci5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgdGlja3MgPSB0aGlzLm51bWJlcihhcnJbMF0pO1xuICAgICAgICByZXQgPSBuZXcgRGF0ZSh0aWNrcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgVE8uYmluYXJ5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJldDtcbiAgICByZXQgPSBOYU47XG4gICAgaWYgKG9iaiA9PT0gMCB8fCBvYmogPT09ICcwJyB8fCBvYmogPT09ICcnIHx8IG9iaiA9PT0gZmFsc2UgfHwgdGhpcy5zdHJpbmcob2JqKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gJ2ZhbHNlJykge1xuICAgICAgcmV0ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9iaiA9PT0gMSB8fCBvYmogPT09ICcxJyB8fCBvYmogPT09IHRydWUgfHwgdGhpcy5zdHJpbmcob2JqKS50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgIHJldCA9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgVE8ubnVtYmVyID0gZnVuY3Rpb24oaW5wdXROdW0sIGRlZmF1bHROdW0pIHtcbiAgICB2YXIgcmV0VmFsLCB0cnlHZXROdW1iZXI7XG4gICAgdHJ5R2V0TnVtYmVyID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHZhciByZXQsIHRyeUdldDtcbiAgICAgICAgcmV0ID0gTmFOO1xuICAgICAgICBpZiAoSVMubnVtYmVyKHZhbCkpIHtcbiAgICAgICAgICByZXQgPSB2YWw7XG4gICAgICAgIH0gZWxzZSBpZiAoSVMuc3RyaW5nKHZhbCkgfHwgSVMuYm9vbCh2YWwpKSB7XG4gICAgICAgICAgdHJ5R2V0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBudW07XG4gICAgICAgICAgICBudW0gPSBfdGhpcy5iaW5hcnkodmFsdWUpO1xuICAgICAgICAgICAgaWYgKCFJUy5udW1iZXIobnVtKSAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgICBudW0gPSArdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIUlTLm51bWJlcihudW0pKSB7XG4gICAgICAgICAgICAgIG51bSA9IF8ucGFyc2VJbnQodmFsdWUsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldCA9IHRyeUdldCh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIHJldFZhbCA9IHRyeUdldE51bWJlcihpbnB1dE51bSk7XG4gICAgaWYgKCFJUy5udW1iZXIocmV0VmFsKSkge1xuICAgICAgcmV0VmFsID0gdHJ5R2V0TnVtYmVyKGRlZmF1bHROdW0pO1xuICAgICAgaWYgKCFJUy5udW1iZXIocmV0VmFsKSkge1xuICAgICAgICByZXRWYWwgPSBOdW1iZXIuTmFOO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0VmFsO1xuICB9O1xuXG4gIFRPLnN0cmluZyA9IGZ1bmN0aW9uKGlucHV0U3RyLCBkZWZhdWx0U3RyKSB7XG4gICAgdmFyIHJldDEsIHJldDIsIHJldFZhbCwgdHJ5R2V0U3RyaW5nO1xuICAgIHRyeUdldFN0cmluZyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICByZXQgPSB2b2lkIDA7XG4gICAgICAgIGlmIChJUy5zdHJpbmcoc3RyKSkge1xuICAgICAgICAgIHJldCA9IHN0cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXQgPSAnJztcbiAgICAgICAgICBpZiAoSVMuYm9vbChzdHIpIHx8IElTLm51bWJlcihzdHIpIHx8IElTLmRhdGUoc3RyKSkge1xuICAgICAgICAgICAgcmV0ID0gc3RyLnRvU3RyaW5nKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIHJldDEgPSB0cnlHZXRTdHJpbmcoaW5wdXRTdHIpO1xuICAgIHJldDIgPSB0cnlHZXRTdHJpbmcoZGVmYXVsdFN0cik7XG4gICAgcmV0VmFsID0gJyc7XG4gICAgaWYgKHJldDEubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXRWYWwgPSByZXQxO1xuICAgIH0gZWxzZSBpZiAocmV0MSA9PT0gcmV0MiB8fCByZXQyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0VmFsID0gcmV0MTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0VmFsID0gcmV0MjtcbiAgICB9XG4gICAgcmV0dXJuIHJldFZhbDtcbiAgfTtcblxuICByZXR1cm4gVE87XG5cbn0pKCk7XG5cbk9KLnJlZ2lzdGVyKCd0bycsIFRPKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUTztcblxuIiwidmFyIE9KLCBjcmVhdGVGYXV4VVVJRDtcblxuT0ogPSByZXF1aXJlKCcuLi9vaicpO1xuXG5cbi8qXG5HZW5lcmF0ZXMgYSByYW5kb20gc3RyaW5nIHRoYXQgY29tcGxpZXMgdG8gdGhlIFJGQyA0MTIyIHNwZWNpZmljYXRpb24gZm9yIEdVSUQvVVVJRC5cbihlLmcuICdCNDJBMTUzRi0xRDlBLTRGOTItOTkwMy05MkMxMURENjg0RDInKVxuV2hpbGUgbm90IGEgdHJ1ZSBVVUlELCBmb3IgdGhlIHB1cnBvc2VzIG9mIHRoaXMgYXBwbGljYXRpb24sIGl0IHNob3VsZCBiZSBzdWZmaWNpZW50LlxuICovXG5cbmNyZWF0ZUZhdXhVVUlEID0gZnVuY3Rpb24oKSB7XG4gIHZhciBoZXhEaWdpdHMsIGksIHMsIHV1aWQ7XG4gIHMgPSBbXTtcbiAgcy5sZW5ndGggPSAzNjtcbiAgaGV4RGlnaXRzID0gJzAxMjM0NTY3ODlhYmNkZWYnO1xuICBpID0gMDtcbiAgd2hpbGUgKGkgPCAzNikge1xuICAgIHNbaV0gPSBoZXhEaWdpdHMuc3Vic3RyKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDB4MTApLCAxKTtcbiAgICBpICs9IDE7XG4gIH1cbiAgc1sxNF0gPSAnNCc7XG4gIHNbMTldID0gaGV4RGlnaXRzLnN1YnN0cigoc1sxOV0gJiAweDMpIHwgMHg4LCAxKTtcbiAgc1s4XSA9IHNbMTNdID0gc1sxOF0gPSBzWzIzXSA9ICctJztcbiAgdXVpZCA9IHMuam9pbignJyk7XG4gIHJldHVybiB1dWlkO1xufTtcblxuT0oucmVnaXN0ZXIoJ2NyZWF0ZVVVSUQnLCBjcmVhdGVGYXV4VVVJRCk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRmF1eFVVSUQ7XG5cbiJdfQ==
