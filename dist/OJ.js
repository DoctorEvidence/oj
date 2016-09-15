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
  promise.then(function() {
    return delete promise.abort;
  });
  promise.error(function() {
    return delete promise.abort;
  });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVlL2FzeW5jL2FqYXguY29mZmVlIiwic3JjL2NvZmZlZS9hc3luYy9wcm9taXNlLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy9ncmlkLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy9pbnB1dGdyb3VwLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy90YWJzLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29tcG9uZW50cy90aWxlLmNvZmZlZSIsInNyYy9jb2ZmZWUvY29udHJvbHMvaWNvbi5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvZGF0ZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvZnVuY3Rpb24uY29mZmVlIiwic3JjL2NvZmZlZS9jb3JlL251bWJlci5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvb2JqZWN0LmNvZmZlZSIsInNyYy9jb2ZmZWUvY29yZS9wcm9wZXJ0eS5jb2ZmZWUiLCJzcmMvY29mZmVlL2NvcmUvc3RyaW5nLmNvZmZlZSIsInNyYy9jb2ZmZWUvZG9tL2JvZHkuY29mZmVlIiwic3JjL2NvZmZlZS9kb20vY29tcG9uZW50LmNvZmZlZSIsInNyYy9jb2ZmZWUvZG9tL2NvbnRyb2wuY29mZmVlIiwic3JjL2NvZmZlZS9kb20vZWxlbWVudC5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9mcmFnbWVudC5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9nZW5lcmljcy5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9pbnB1dC5jb2ZmZWUiLCJzcmMvY29mZmVlL2RvbS9ub2RlLmNvZmZlZSIsInNyYy9jb2ZmZWUvZG9tL25vZGVGYWN0b3J5LmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvYS5jb2ZmZWUiLCJzcmMvY29mZmVlL2VsZW1lbnRzL2JyLmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvZm9ybS5jb2ZmZWUiLCJzcmMvY29mZmVlL2VsZW1lbnRzL2lucHV0LmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvb2wuY29mZmVlIiwic3JjL2NvZmZlZS9lbGVtZW50cy9zZWxlY3QuY29mZmVlIiwic3JjL2NvZmZlZS9lbGVtZW50cy90YWJsZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2VsZW1lbnRzL3RleHRhcmVhLmNvZmZlZSIsInNyYy9jb2ZmZWUvZWxlbWVudHMvdGhlYWQuY29mZmVlIiwic3JjL2NvZmZlZS9lbGVtZW50cy91bC5jb2ZmZWUiLCJzcmMvY29mZmVlL2VudHJ5cG9pbnQuY29mZmVlIiwic3JjL2NvZmZlZS9nbG9iYWwuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvYnV0dG9uaW5wdXQuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvY2hlY2tib3guY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvY29sb3IuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvZGF0ZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy9kYXRldGltZS5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy9kYXRldGltZWxvY2FsLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL2VtYWlsLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL2ZpbGUuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvaGlkZGVuLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL2ltYWdlaW5wdXQuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvbW9udGguY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvbnVtYmVyLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3Bhc3N3b3JkLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3JhZGlvLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3JhbmdlLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3Jlc2V0LmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3NlYXJjaC5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy9zdWJtaXQuY29mZmVlIiwic3JjL2NvZmZlZS9pbnB1dHMvdGVsLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3RleHRpbnB1dC5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy90aW1lLmNvZmZlZSIsInNyYy9jb2ZmZWUvaW5wdXRzL3VybC5jb2ZmZWUiLCJzcmMvY29mZmVlL2lucHV0cy93ZWVrLmNvZmZlZSIsInNyYy9jb2ZmZWUvb2ouY29mZmVlIiwic3JjL2NvZmZlZS9vakluaXQuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9Kc29uVG9UYWJsZS5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL2FycmF5MkQuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9jb25zb2xlLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvY29va2llLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvZGVmZXIuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9lYWNoLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvZW51bXMuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9pcy5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL25vdHkuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9wdWJzdWIuY29mZmVlIiwic3JjL2NvZmZlZS90b29scy9xdWVyeVN0cmluZy5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL3Jhbmdlcy5jb2ZmZWUiLCJzcmMvY29mZmVlL3Rvb2xzL3RvLmNvZmZlZSIsInNyYy9jb2ZmZWUvdG9vbHMvdXVpZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxJQUFBOztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsT0FBUjs7QUFFTCxNQUFBLEdBQVM7O0FBR1QsTUFBTSxDQUFDLFNBQVAsR0FBbUIsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEdBQWI7QUFDakIsTUFBQTtFQUFBLFFBQUEsR0FBVztFQUNYLEVBQUUsQ0FBQyxNQUFILENBQVUsUUFBVixFQUFvQixJQUFwQjtF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LElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLElBQTNCLENBQWpCLEVBQW1ELENBQW5EO0lBQ1AsQ0FBQSxJQUFLO0VBRlA7RUFHQSxDQUFFLENBQUEsRUFBQSxDQUFGLEdBQVE7RUFDUixDQUFFLENBQUEsRUFBQSxDQUFGLEdBQVEsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsQ0FBQyxDQUFFLENBQUEsRUFBQSxDQUFGLEdBQVEsR0FBVCxDQUFBLEdBQWdCLEdBQWpDLEVBQXNDLENBQXRDO0VBQ1IsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUUsQ0FBQSxFQUFBLENBQUYsR0FBUSxDQUFFLENBQUEsRUFBQSxDQUFGLEdBQVEsQ0FBRSxDQUFBLEVBQUEsQ0FBRixHQUFRO0VBQy9CLElBQUEsR0FBTyxDQUFDLENBQUMsSUFBRixDQUFPLEVBQVA7U0FDUDtBQWhCZTs7QUFrQmpCLEVBQUUsQ0FBQyxRQUFILENBQVksWUFBWixFQUEwQixjQUExQjs7QUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjICMgYWpheFxuXG5PSiA9IHJlcXVpcmUgJy4uL29qJ1xuXG5jb25maWcgPSB7fVxuICBcbiMgZGVmaW5lIGEgc3RhbmRhcmQgb24gc3VjY2VzcyBoYW5kbGVyLCB3cml0ZSBvdXQgdGhlIHJlcXVlc3Qgc3RhdHMgdG8gYSB0YWJsZVxuY29uZmlnLm9uU3VjY2VzcyA9IChvcHRzLCBkYXRhLCB1cmwpIC0+XG4gIHJlc3BvbnNlID0ge31cbiAgT0ouZXh0ZW5kIHJlc3BvbnNlLCBkYXRhXG4gIG9wdHMub25TdWNjZXNzIHJlc3BvbnNlXG4gIGlmIE9KLkxPR19BTExfQUpBWFxuICAgIE9KLmNvbnNvbGUudGFibGUgW1xuICAgICAgV2Vic2VydmljZTogb3B0cy5hamF4T3B0cy51cmxcbiAgICAgIFN0YXJ0VGltZTogb3B0cy5zdGFydFRpbWVcbiAgICAgIEVuZFRpbWU6IG5ldyBEYXRlKClcbiAgICBdIFxuICByZXR1cm5cbiAgXG4jIGRlZmluZSBhIHN0YW5kYXJkIG9uIGVycm9yIGhhbmRsZXIsIHdyaXRlIG91dCB0aGUgcmVxdWVzdCBlcnJvciBjb25leHQgdG8gYSB0YWJsZVxuY29uZmlnLm9uRXJyb3IgPSAoeG1sSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIHBhcmFtMSwgb3B0cyA9IE9KLm9iamVjdCgpKSAtPlxuICBpZiB0ZXh0U3RhdHVzIGlzbnQgJ2Fib3J0J1xuICAgIGlmIE9KLkxPR19BTExfQUpBWF9FUlJPUlNcbiAgICAgIE9KLmNvbnNvbGUudGFibGUgW1xuICAgICAgICBXZWJzZXJ2aWNlOiBvcHRzLmFqYXhPcHRzLnVybFxuICAgICAgICBEYXRhOiBvcHRzLmFqYXhPcHRzLmRhdGFcbiAgICAgICAgRmFpbGVkOiB0ZXh0U3RhdHVzXG4gICAgICAgIFN0YXRlOiB4bWxIdHRwUmVxdWVzdC5zdGF0ZSgpXG4gICAgICAgIFN0YXR1czogeG1sSHR0cFJlcXVlc3Quc3RhdHVzXG4gICAgICAgIFN0YXR1c1RleHQ6IHhtbEh0dHBSZXF1ZXN0LnN0YXR1c1RleHRcbiAgICAgICAgUmVhZHlTdGF0ZTogeG1sSHR0cFJlcXVlc3QucmVhZHlTdGF0ZVxuICAgICAgICBSZXNwb25zZVRleHQ6IHhtbEh0dHBSZXF1ZXN0LnJlc3BvbnNlVGV4dFxuICAgICAgXVxuXG4gICAgb3B0cy5vbkVycm9yIHRleHRTdGF0dXNcbiAgcmV0dXJuXG4gIFxuIyBpbiB0aGUgY2FzZSB3aGVyZSBgb3B0c2AgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gb2JqZWN0XG5vcHRzRnJvbVVybCA9IChvcHRzKSAtPlxuICBpZiBPSi5pcy5zdHJpbmcgb3B0c1xuICAgIHVybCA9IG9wdHNcbiAgICBvcHRzID0gT0oub2JqZWN0KClcbiAgICBvcHRzLmFkZCAnYWpheE9wdHMnLCBPSi5vYmplY3QoKVxuICAgIG9wdHMuYWpheE9wdHMuYWRkICd1cmwnLCB1cmxcbiAgb3B0c1xuICBcbiMgZGVmaW5lIGEgc3RhbmRhcmQgYGV4ZWNgIG1ldGhvZCB0byBoYW5kbGUgYWxsIHJlcXVlc3QgdmVyYnMuIFVzZXMgdGhlIFtqUXVlcnkuYWpheF0oaHR0cDovL2FwaS5qcXVlcnkuY29tL2NhdGVnb3J5L2FqYXgvKSBBUEkuXG4jIGBleGVjUmVxdWVzdGAgcmV0dXJucyBhIHByb21pc2UgcmVwcmVzZW50IHRoZSBhY3R1YWwgQUpBWCBjYWxsLlxuICBcbiMgLSBgdmVyYmAgZGVmYXVsdCB2YWx1ZSA9ICdHRVQnXG4jIC0gYG9wdHNgIG9iamVjdFxuIyAtLSBgb3B0cy5hamF4T3B0c2Agb2JqZWN0IGZvciBhbGwgalF1ZXJ5J3MgYWpheC1zcGVjaWZpYyBwcm9wZXJ0aWVzLlxuY29uZmlnLmV4ZWNSZXF1ZXN0ID0gKHZlcmIgPSAnR0VUJywgb3B0cykgLT5cbiAgZGVmYXVsdHMgPVxuICAgIGFqYXhPcHRzOlxuICAgICAgdXJsOiAnJ1xuICAgICAgZGF0YToge31cbiAgICAgIHR5cGU6IHZlcmJcbiAgICAgIHhockZpZWxkczpcbiAgICAgICAgd2l0aENyZWRlbnRpYWxzOiB0cnVlXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnXG4gICAgICAgIFxuICAgIG9uU3VjY2VzczogT0oubm9vcFxuICAgIG9uRXJyb3I6IE9KLm5vb3BcbiAgICBvbkNvbXBsZXRlOiBPSi5ub29wXG4gICAgb3ZlcnJpZGVFcnJvcjogZmFsc2VcbiAgICB3YXRjaEdsb2JhbDogdHJ1ZVxuICAgIHVzZUNhY2hlOiBmYWxzZVxuICAgIFxuICBvcHRzID0gb3B0c0Zyb21Vcmwgb3B0c1xuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdHMsIHRydWVcbiAgICBcbiAgZGVmYXVsdHMuc3RhcnRUaW1lID0gbmV3IERhdGUoKVxuICAgIFxuICBpZiBmYWxzZSBpcyBPSi5pcy5udWxsT3JFbXB0eSBkZWZhdWx0cy5hamF4T3B0cy5kYXRhXG4gICAgIyBHRVQgcmVxdWVzdHMgZXhwZWN0IHF1ZXJ5U3RyaW5nIHBhcmFtZXRlcnNcbiAgICBpZiBkZWZhdWx0cy5hamF4T3B0cy52ZXJiIGlzICdHRVQnXG4gICAgICBkZWZhdWx0cy5hamF4T3B0cy5kYXRhID0gT0oucGFyYW1zIGRlZmF1bHRzLmFqYXhPcHRzLmRhdGFcbiAgICAjIGFsbCBvdGhlciByZXF1ZXN0cyB0YWtlIGFuIG9iamVjdFxuICAgIGVsc2VcbiAgICAgIGRlZmF1bHRzLmFqYXhPcHRzLmRhdGEgPSBPSi5zZXJpYWxpemUgZGVmYXVsdHMuYWpheE9wdHMuZGF0YVxuICAgIFxuICBnZXRKUXVlcnlEZWZlcnJlZCA9ICh3YXRjaEdsb2JhbCkgLT5cbiAgICByZXQgPSAkLmFqYXggZGVmYXVsdHMuYWpheE9wdHNcbiAgICAgIFxuICAgIHJldC5kb25lIChkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikgLT5cbiAgICAgIGNvbmZpZy5vblN1Y2Nlc3MgZGVmYXVsdHMsIGRhdGFcblxuICAgIHJldC5mYWlsIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUZXh0KSAtPlxuICAgICAgY29uZmlnLm9uRXJyb3IganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGV4dCwgZGVmYXVsdHNcbiAgXG4gICAgcmV0LmFsd2F5cyAoeG1sSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMpIC0+XG4gICAgICBkZWZhdWx0cy5vbkNvbXBsZXRlIHhtbEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzXG5cbiAgICBPSi5hc3luYy5hamF4UHJvbWlzZSByZXRcblxuICBwcm9taXNlID0gZ2V0SlF1ZXJ5RGVmZXJyZWQoZGVmYXVsdHMud2F0Y2hHbG9iYWwpXG4gIHByb21pc2VcbiAgXG5hamF4ID0ge31cbiAgXG4jICMjIHBvc3RcbiMgW09KXShvai5odG1sKS5hamF4LnBvc3Q6IGluc2VydCBhIG5ldyBvYmplY3Qgb3IgaW5pdCBhIGZvcm0gcG9zdFxuICBcbiMgLSBgb3B0c2AgY2FuIGJlIGFuIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIHJlcXVlc3QuXG4jIC0gYG9wdHNgIGNhbiBhbHNvIGJlIGEgc3RyaW5nLCByZXByZXNlbnRpbmcgdGhlIFVSTCB0byBoaXQuIFxuYWpheC5wb3N0ID0gKG9wdHMpIC0+XG4gIGNvbmZpZy5leGVjUmVxdWVzdCAnUE9TVCcsIG9wdHNcbiAgXG4jICMjIGdldFxuIyBbT0pdKG9qLmh0bWwpLmFqYXguZ2V0OiBnZXQgYW4gZXhpc3Rpbmcgb2JqZWN0XG4gIFxuIyAtIGBvcHRzYCBjYW4gYmUgYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgcmVxdWVzdC5cbiMgLSBgb3B0c2AgY2FuIGFsc28gYmUgYSBzdHJpbmcsIHJlcHJlc2VudGluZyB0aGUgVVJMIHRvIGhpdC5cbiNcbmFqYXguZ2V0ID0gKG9wdHMpIC0+XG4gIGNvbmZpZy5leGVjUmVxdWVzdCAnR0VUJywgb3B0c1xuXG4jICMjIGRlbGV0ZVxuIyBbT0pdKG9qLmh0bWwpLmFqYXguZGVsZXRlOiBkZWxldGUgYW4gZXhpc3Rpbmcgb2JqZWN0XG4gIFxuIyAtIGBvcHRzYCBjYW4gYmUgYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgcmVxdWVzdC5cbiMgLSBgb3B0c2AgY2FuIGFsc28gYmUgYSBzdHJpbmcsIHJlcHJlc2VudGluZyB0aGUgVVJMIHRvIGhpdC5cbmFqYXguZGVsZXRlID0gKG9wdHMpIC0+XG4gIGNvbmZpZy5leGVjUmVxdWVzdCAnREVMRVRFJywgb3B0c1xuXG4jICMjIHB1dFxuIyBbT0pdKG9qLmh0bWwpLmFqYXgucHV0OiB1cGRhdGUgYW4gZXhpc3Rpbmcgb2JqZWN0XG4gIFxuIyAtIGBvcHRzYCBjYW4gYmUgYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGUgcmVxdWVzdC5cbiMgLSBgb3B0c2AgY2FuIGFsc28gYmUgYSBzdHJpbmcsIHJlcHJlc2VudGluZyB0aGUgVVJMIHRvIGhpdC5cbmFqYXgucHV0ID0gKG9wdHMpIC0+XG4gIGNvbmZpZy5leGVjUmVxdWVzdCAnUFVUJywgb3B0c1xuXG5PSi5hc3luYy5yZWdpc3RlciAnYWpheCcsIGFqYXhcbm1vZHVsZS5leHBvcnRzID0gYWpheCIsIiMgIyBwcm9taXNlXG5cbk9KID0gcmVxdWlyZSAnLi4vb2onXG5cbiMgIyMgYWpheFByb21pc2VcbiMgW09KXShvai5odG1sKS5hc3luYy5hamF4UHJvbWlzZSBjb252ZXJ0cyBhbiBBSkFYIFhtbEh0dHBSZXF1ZXN0IGludG8gYSBQcm9taXNlLiBcbiMgU2VlIGFsc28gW1Byb21pc2UucmVzb2x2ZV0oaHR0cHM6Ly9naXRodWIuY29tL3BldGthYW50b25vdi9ibHVlYmlyZC9ibG9iL21hc3Rlci9BUEkubWQpLlxuYWpheFByb21pc2UgPSAoYWpheCkgLT4gXG4gIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUgYWpheFxuICBwcm9taXNlLmFib3J0ID0gYWpheC5hYm9ydFxuICBwcm9taXNlLnJlYWR5U3RhdGUgPSBhamF4LnJlYWR5U3RhdGVcbiAgcHJvbWlzZS50aGVuIC0+IGRlbGV0ZSBwcm9taXNlLmFib3J0XG4gIHByb21pc2UuZXJyb3IgLT4gZGVsZXRlIHByb21pc2UuYWJvcnRcbiAgcHJvbWlzZVxuXG4jICMjIGFsbFxuIyBbT0pdKG9qLmh0bWwpLmFzeW5jLmFsbCB0YWtlcyBhbiBhcnJheSBvZiBmdW5jdGlvbnMgYW5kIHJldHVybnMgYSBwcm9taXNlIHJlcHJlc2VudGluZyB0aGUgc3VjY2VzcyBvZiBhbGwgbWV0aG9kcyBvciB0aGUgZmFpbHVyZSBvZiBhbnkgbWV0aG9kLlxuIyBTZWUgYWxzbyBbUHJvbWlzZS5hbGxdKGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRrYWFudG9ub3YvYmx1ZWJpcmQvYmxvYi9tYXN0ZXIvQVBJLm1kKS5cbmFsbCA9IChpbml0QXJyYXkpIC0+XG4gIHJlcXMgPSBpbml0QXJyYXkgb3IgW11cbiAgcHJvbWlzZSA9IFByb21pc2UuYWxsKHJlcXMpXG4gIHByb21pc2UucHVzaCA9IChpdGVtKSAtPlxuICAgIHJlcXMucHVzaCBpdGVtXG4gICAgcmV0dXJuXG4gIHByb21pc2VcblxuIyAjIyBkZWZlclxuIyBbT0pdKG9qLmh0bWwpLmFzeW5jLmRlZmVyIGNvbnZlcnRzIGEgZnVuY3Rpb24gaW50byBhIFByb21pc2UgdG8gZXhlY3V0ZSB0aGF0IGZ1bmN0aW9uLiBcbiMgU2VlIGFsc28gW1Byb21pc2UubWV0aG9kXShodHRwczovL2dpdGh1Yi5jb20vcGV0a2FhbnRvbm92L2JsdWViaXJkL2Jsb2IvbWFzdGVyL0FQSS5tZCkuXG5kZWZyID0gKGZ1bmMgPSBPSi5ub29wKSAtPlxuICByZXQgPSBQcm9taXNlLm1ldGhvZCBmdW5jXG4gIHJldFxuICBcbiAgXG5PSi5hc3luYy5yZWdpc3RlciAnZGVmZXInLCBkZWZyXG5PSi5hc3luYy5yZWdpc3RlciAnYWxsJywgYWxsXG5PSi5hc3luYy5yZWdpc3RlciAnYWpheFByb21pc2UnLCBhamF4UHJvbWlzZVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGRlZmVyOiBkZWZyXG4gIGFsbDogYWxsXG4gIGFqYXhQcm9taXNlOiBhamF4UHJvbWlzZVxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL29qSW5pdCdcbmNvbXBvbmVudCA9IHJlcXVpcmUgJy4uL2RvbS9jb21wb25lbnQnXG5hcnJheTJEID0gcmVxdWlyZSAnLi4vdG9vbHMvYXJyYXkyRCdcblxubm9kZU5hbWUgPSAneC1ncmlkJ1xuY2xhc3NOYW1lID0gJ2dyaWQnXG5PSi5jb21wb25lbnRzLm1lbWJlcnNbY2xhc3NOYW1lXSA9IG5vZGVOYW1lXG5cbmNtcG50ID0gKG9wdGlvbnMsIG93bmVyKSAtPlxuICBkZWZhdWx0cyA9XG4gICAgdGlsZVNpemVzOlxuICAgICAgc21hbGxTcGFuOiAnJ1xuICAgICAgbWVkaXVtU3BhbjogJydcbiAgICAgIGxhcmdlU3BhbjogJydcbiAgICBwcm9wczpcbiAgICAgIGNsYXNzOiAnZ3JpZCdcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcbiAgcmV0ID0gY29tcG9uZW50IGRlZmF1bHRzLCBvd25lciwgbm9kZU5hbWVcblxuICByb3dzID0gW11cbiAgdGlsZXMgPSBhcnJheTJEKClcblxuICBmaWxsTWlzc2luZyA9ICgpIC0+XG4gICAgdGlsZXMuZWFjaCAocm93Tm8sIGNvbE5vLCB2YWwpIC0+XG4gICAgICBpZiBub3QgdmFsXG4gICAgICAgIHJvdyA9IHJldC5yb3cgcm93Tm9cbiAgICAgICAgcm93Lm1ha2UgJ3RpbGUnLCBjb2xObywge31cblxuICByZXQuYWRkICdyb3cnLCAocm93Tm8gPSByb3dzLmxlbmd0aC0xIG9yIDEpLT5cbiAgICBudVJvdyA9IHJvd3Nbcm93Tm8tMV1cbiAgICBpZiBub3QgbnVSb3dcbiAgICAgIHdoaWxlIHJvd3MubGVuZ3RoIDwgcm93Tm9cbiAgICAgICAgbnVSb3cgPSByZXQubWFrZSAnZGl2JywgcHJvcHM6IGNsYXNzOiAncm93J1xuICAgICAgICByb3dzLnB1c2ggbnVSb3dcbiAgICAgIG51Um93LmFkZCAndGlsZScsIChjb2xObywgb3B0cykgLT5cbiAgICAgICAgb3B0cyA9IE9KLmV4dGVuZCAoT0ouZXh0ZW5kIHt9LCBkZWZhdWx0cy50aWxlU2l6ZXMpLCBvcHRzXG4gICAgICAgIG51VGlsZSA9IE9KLmNvbXBvbmVudHMudGlsZSBvcHRzLCBudVJvd1xuICAgICAgICB0aWxlcy5zZXQgcm93Tm8sIGNvbE5vLCBudVRpbGVcbiAgICAgICAgbnVUaWxlXG4gICAgbnVSb3dcblxuICByZXQuYWRkICd0aWxlJywgKHJvd05vLCBjb2xObywgb3B0cykgLT5cbiAgICBpZiBub3Qgcm93Tm8gb3Igcm93Tm8gPCAxIHRoZW4gcm93Tm8gPSAxXG4gICAgaWYgbm90IGNvbE5vIG9yIGNvbE5vIDwgMSB0aGVuIGNvbE5vID0gMVxuXG4gICAgcm93ID0gcmV0LnJvdyByb3dOb1xuICAgIHRpbGUgPSB0aWxlcy5nZXQgcm93Tm8sIGNvbE5vXG5cbiAgICBpZiBub3QgdGlsZVxuICAgICAgaSA9IDBcbiAgICAgIHdoaWxlIGkgPCBjb2xOb1xuICAgICAgICBpICs9IDFcbiAgICAgICAgdHJ5VGlsZSA9IHRpbGVzLmdldCByb3dObywgaVxuICAgICAgICBpZiBub3QgdHJ5VGlsZVxuICAgICAgICAgIGlmIGkgaXMgY29sTm9cbiAgICAgICAgICAgIHRpbGUgPSByb3cubWFrZSAndGlsZScsIG9wdHNcbiAgICAgICAgICBlbHNlIGlmIG5vdCB0aWxlXG4gICAgICAgICAgICByb3cubWFrZSAndGlsZSdcblxuICAgIGZpbGxNaXNzaW5nKClcbiAgICB0aWxlXG5cbiAgcmV0XG5cbk9KLmNvbXBvbmVudHMucmVnaXN0ZXIgY2xhc3NOYW1lLCBjbXBudFxubW9kdWxlLmV4cG9ydHMgPSBjbXBudCIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9vakluaXQnXG5jb21wb25lbnQgPSByZXF1aXJlICcuLi9kb20vY29tcG9uZW50J1xudXVpZCA9IHJlcXVpcmUgJy4uL3Rvb2xzL3V1aWQnXG5cbm5vZGVOYW1lID0gJ3gtaW5wdXQtZ3JvdXAnXG5jbGFzc05hbWUgPSAnaW5wdXRncm91cCdcblxuT0ouY29tcG9uZW50cy5tZW1iZXJzW2NsYXNzTmFtZV0gPSBub2RlTmFtZVxuXG5jbXBudCA9IChvcHRpb25zLCBvd25lcikgLT5cbiAgZm9ySWQgPSB1dWlkKClcbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgY2xhc3M6ICdmb3JtLWdyb3VwJ1xuICAgIGV2ZW50czpcbiAgICAgIGNoYW5nZTogT0oubm9vcFxuICAgIGZvcjogZm9ySWRcbiAgICBsYWJlbFRleHQ6ICcnXG4gICAgaW5wdXRPcHRzOlxuICAgICAgcHJvcHM6XG4gICAgICAgIGlkOiBmb3JJZFxuICAgICAgICB0eXBlOiAndGV4dCdcbiAgICAgICAgY2xhc3M6ICcnXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnJ1xuICAgICAgICB2YWx1ZTogJydcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcbiAgcmV0ID0gY29tcG9uZW50IGRlZmF1bHRzLCBvd25lciwgbm9kZU5hbWVcblxuICBncm91cCA9IHJldC5tYWtlICdkaXYnLCBwcm9wczogY2xhc3M6ICdmb3JtLWdyb3VwJ1xuXG4gIHJldC5ncm91cExhYmVsID0gZ3JvdXAubWFrZSAnbGFiZWwnLCBwcm9wczogeyBmb3I6IGZvcklkIH0sIHRleHQ6IGRlZmF1bHRzLmxhYmVsVGV4dFxuXG4gIGRlZmF1bHRzLmlucHV0T3B0cy5wcm9wcy5jbGFzcyArPSAnIGZvcm0tY29udHJvbCdcbiAgcmV0Lmdyb3VwSW5wdXQgPSBncm91cC5tYWtlICdpbnB1dCcsIGRlZmF1bHRzLmlucHV0T3B0c1xuXG4gIHJldC5ncm91cFZhbHVlID0gKCkgLT5cbiAgICByZXQuZ3JvdXBJbnB1dC52YWwoKVxuXG4gIHJldFxuXG5PSi5jb21wb25lbnRzLnJlZ2lzdGVyIGNsYXNzTmFtZSwgY21wbnRcbm1vZHVsZS5leHBvcnRzID0gY21wbnQiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vb2pJbml0J1xuY29tcG9uZW50ID0gcmVxdWlyZSAnLi4vZG9tL2NvbXBvbmVudCdcblxubm9kZU5hbWUgPSAneC10YWJzJ1xuY2xhc3NOYW1lID0gJ3RhYnMnXG5cbk9KLmNvbXBvbmVudHMubWVtYmVyc1tjbGFzc05hbWVdID0gbm9kZU5hbWVcblxuY21wbnQgPSAob3B0aW9ucywgb3duZXIpIC0+XG4gIGRlZmF1bHRzID1cbiAgICB0YWJzOiB7fVxuICAgIHByb3BzOlxuICAgICAgY2xhc3M6ICcnXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG4gIHJldCA9IGNvbXBvbmVudCBkZWZhdWx0cywgb3duZXIsIG5vZGVOYW1lXG5cbiAgdGFicyA9IHJldC5tYWtlICd1bCcsIHByb3BzOiBjbGFzczogJ25hdiBuYXYtdGFicydcbiAgY29udGVudCA9IHJldC5tYWtlICdkaXYnLCBwcm9wczogY2xhc3M6ICd0YWItY29udGVudCdcblxuICBmaXJzdCA9IHRydWVcbiAgT0ouZWFjaCBkZWZhdWx0cy50YWJzLCAodGFiVmFsLCB0YWJOYW1lKSAtPlxuICAgIHRhYkNsYXNzID0gJydcbiAgICBpZiBmaXJzdFxuICAgICAgZmlyc3QgPSBmYWxzZVxuICAgICAgdGFiQ2xhc3MgPSAnYWN0aXZlJ1xuICAgIGEgPSB0YWJzLm1ha2UgJ2xpJywgcHJvcHM6IGNsYXNzOiB0YWJDbGFzc1xuICAgICAgLm1ha2UoJ2EnLFxuICAgICAgICB0ZXh0OiB0YWJOYW1lXG4gICAgICAgIHByb3BzOlxuICAgICAgICAgIGhyZWY6ICcjJyArIHRhYk5hbWVcbiAgICAgICAgICAnZGF0YS10b2dnbGUnOiAndGFiJ1xuICAgICAgICBldmVudHM6XG4gICAgICAgICAgY2xpY2s6IC0+XG4gICAgICAgICAgICBhLiQudGFiICdzaG93JylcblxuICAgIHRhYkNvbnRlbnRDbGFzcyA9ICd0YWItcGFuZSAnICsgdGFiQ2xhc3NcbiAgICByZXQuYWRkIHRhYk5hbWUsIGNvbnRlbnQubWFrZSgnZGl2JywgcHJvcHM6IGNsYXNzOiB0YWJDb250ZW50Q2xhc3MsIGlkOiB0YWJOYW1lKVxuXG4gIHJldFxuXG5PSi5jb21wb25lbnRzLnJlZ2lzdGVyIGNsYXNzTmFtZSwgY21wbnRcbm1vZHVsZS5leHBvcnRzID0gY21wbnQiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vb2pJbml0J1xuY29tcG9uZW50ID0gcmVxdWlyZSAnLi4vZG9tL2NvbXBvbmVudCdcblxubm9kZU5hbWUgPSAneC10aWxlJ1xuY2xhc3NOYW1lID0gJ3RpbGUnXG5cbk9KLmNvbXBvbmVudHMubWVtYmVyc1tjbGFzc05hbWVdID0gbm9kZU5hbWVcbiAgXG5jbXBudCA9IChvcHRpb25zLCBvd25lcikgLT5cbiAgZGVmYXVsdHMgPVxuICAgIHdpZHRoOlxuICAgICAgeHM6ICcnXG4gICAgICBzbTogJydcbiAgICAgIG1kOiAnJ1xuICAgICAgbGc6ICcnXG4gICAgcHJvcHM6XG4gICAgICBjbGFzczogJ3RpbGUnXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG4gIGlmIGRlZmF1bHRzLndpZHRoLnhzIHRoZW4gZGVmYXVsdHMucHJvcHMuY2xhc3MgKz0gJyBjb2wteHMtJyArIGRlZmF1bHRzLndpZHRoLnhzXG4gIGlmIGRlZmF1bHRzLndpZHRoLnNtIHRoZW4gZGVmYXVsdHMucHJvcHMuY2xhc3MgKz0gJyBjb2wtc20tJyArIGRlZmF1bHRzLndpZHRoLnNtXG4gIGlmIGRlZmF1bHRzLndpZHRoLm1kIHRoZW4gZGVmYXVsdHMucHJvcHMuY2xhc3MgKz0gJyBjb2wtbWQtJyArIGRlZmF1bHRzLndpZHRoLm1kXG4gIGlmIGRlZmF1bHRzLndpZHRoLmxnIHRoZW4gZGVmYXVsdHMucHJvcHMuY2xhc3MgKz0gJyBjb2wtbGctJyArIGRlZmF1bHRzLndpZHRoLmxnXG5cbiAgcmV0ID0gT0ouY29tcG9uZW50IGRlZmF1bHRzLCBvd25lciwgbm9kZU5hbWVcbiAgcmV0XG5cbk9KLmNvbXBvbmVudHMucmVnaXN0ZXIgY2xhc3NOYW1lLCBjbXBudFxubW9kdWxlLmV4cG9ydHMgPSBjbXBudCIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9vakluaXQnXG5jb250cm9sID0gcmVxdWlyZSAnLi4vZG9tL2NvbnRyb2wnXG5cbmNvbnRyb2xOYW1lID0gJ3ktaWNvbidcbmZyaWVuZGx5TmFtZSA9ICdpY29uJ1xuXG5PSi5jb250cm9scy5tZW1iZXJzW2ZyaWVuZGx5TmFtZV0gPSBjb250cm9sTmFtZVxuXG5jbnRybCA9IChvcHRpb25zLCBvd25lcikgLT5cbiAgZGVmYXVsdHMgPVxuICAgIGljb25PcHRzOlxuICAgICAgbmFtZTogJydcbiAgICAgIHN0YWNrZWRJY29uOiAnJ1xuICAgICAgc3dhcEljb246ICcnXG4gICAgICBzaXplOiBmYWxzZVxuICAgICAgY29sb3I6ICcnXG4gICAgICBsaWJyYXJ5OiAnJ1xuICAgICAgaXNGaXhlZFdpZHRoOiBmYWxzZVxuICAgICAgaXNMaXN0OiBmYWxzZVxuICAgICAgaXNTcGlubmVyOiBmYWxzZVxuICAgIHByb3BzOlxuICAgICAgY2xhc3M6ICcnXG4gICAgcm9vdE5vZGVUeXBlOiAnc3BhbidcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnNcbiAgcmV0ID0gY29udHJvbCBkZWZhdWx0cywgb3duZXIsIGNvbnRyb2xOYW1lXG5cbiAgaXNUb2dnbGVkID0gZmFsc2VcblxuICAjVE9ETzogU3VwcG9ydCBmb3IgcGljdG9pY29uc1xuICAjVE9ETzogU3VwcG9ydCBmb3Igb3RoZXIgRm9udEF3ZXNvbWUgcHJvcGVydGllcyAoc3RhY2ssIHJvdGF0ZSwgc2l6ZSwgZXRjKVxuXG4gIGNsYXNzTmFtZUJhc2UgPSAnZmEgJ1xuICBpZiBkZWZhdWx0cy5pY29uT3B0cy5pc0ZpeGVkV2lkdGggdGhlbiBjbGFzc05hbWVCYXNlICs9ICdmYS1mdyAnXG4gIGlmIGRlZmF1bHRzLmljb25PcHRzLmlzTGlzdCB0aGVuIGNsYXNzTmFtZUJhc2UgKz0gJ2ZhLWxpICdcbiAgaWYgZGVmYXVsdHMuaWNvbk9wdHMuaXNTcGlubmVyIHRoZW4gY2xhc3NOYW1lQmFzZSArPSAnZmEtc3BpbiAnXG4gIGlmIGRlZmF1bHRzLmljb25PcHRzLnNpemVcbiAgICBpZiBkZWZhdWx0cy5pY29uT3B0cy5zaXplID4gMSBhbmQgZGVmYXVsdHMuaWNvbk9wdHMuc2l6ZSA8PSA1XG4gICAgICBjbGFzc05hbWVCYXNlICs9ICdmYS0nICsgZGVmYXVsdHMuaWNvbk9wdHMuc2l6ZSArICd4ICdcblxuICBjbGFzc05hbWUgPSBjbGFzc05hbWVCYXNlICsgJ2ZhLScgKyBkZWZhdWx0cy5pY29uT3B0cy5uYW1lXG4gIHJldC5teUljb24gPSByZXQubWFrZSAnaScsIHByb3BzOiBjbGFzczogY2xhc3NOYW1lXG5cbiAgI1RvZ2dsZXMgZGlzcGxheSBiZXR3ZWVuIG5vcm1hbCBpY29uIGFuZCBzd2FwIGljb24sIGlmIGEgc3dhcCBpY29uIGhhcyBiZWVuIHNwZWNpZmllZFxuICByZXQudG9nZ2xlSWNvbiA9IC0+XG4gICAgaWYgZGVmYXVsdHMuaWNvbk9wdHMuc3dhcEljb25cbiAgICAgIG5ld0ljb24gPSBkZWZhdWx0cy5pY29uT3B0cy5uYW1lXG5cbiAgICAgIGlzVG9nZ2xlZCA9ICFpc1RvZ2dsZWRcblxuICAgICAgaWYgaXNUb2dnbGVkXG4gICAgICAgIHJldC5teUljb24uJC5yZW1vdmVDbGFzcygnZmEtJyArIG5ld0ljb24pXG4gICAgICAgIG5ld0ljb24gPSBkZWZhdWx0cy5pY29uT3B0cy5zd2FwSWNvblxuICAgICAgZWxzZVxuICAgICAgICByZXQubXlJY29uLiQucmVtb3ZlQ2xhc3MoJ2ZhLScgKyBkZWZhdWx0cy5pY29uT3B0cy5zd2FwSWNvbilcblxuICAgICAgcmV0Lm15SWNvbi4kLmFkZENsYXNzKCdmYS0nICsgbmV3SWNvbilcblxuXG4gIHJldFxuXG5PSi5jb250cm9scy5yZWdpc3RlciBmcmllbmRseU5hbWUsIGNudHJsXG5tb2R1bGUuZXhwb3J0cyA9IGNudHJsIiwiT0ogPSByZXF1aXJlICcuLi9vaidcblxuZ2V0RGF0ZUZyb21Ebkpzb24gPSAoZG5EYXRlKSAtPlxuICAgIFxuICAjIFRyYW5zZm9ybXMgYSAuTkVUIEpTT04gZGF0ZSBpbnRvIGEgSmF2YVNjcmlwdCBkYXRlLlxuICAjIG5hbWU9J29iaicgIE9iamVjdCB0byB0ZXN0XG4gICMgdHlwZT0nQm9vbGVhbicgLz5cbiAgI1xuICAjICAgICAgIHZhciBtaWxsaSA9IE9KLnRvLm51bWJlcihEbkRhdGUucmVwbGFjZSgvXFwvRGF0ZVxcKChcXGQrKVxcLT8oXFxkKylcXClcXC8vLCAnJDEnKSk7XG4gICMgICAgICAgdmFyIG9mZnNldCA9IE9KLnRvLm51bWJlcihEbkRhdGUucmVwbGFjZSgvXFwvRGF0ZVxcKFxcZCsoW1xcK1xcLV0/XFxkKylcXClcXC8vLCAnJDEnKSk7XG4gICMgICAgICAgdmFyIGxvY2FsT2Zmc2V0ID0gbmV3IERhdGUoKS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAjICAgICAgIHJldHVybiBuZXcgRGF0ZSgobWlsbGkgLSAoKGxvY2FsT2Zmc2V0ICsgKG9mZnNldCAvIDEwMCAqIDYwKSkgKiAxMDAwKSkpO1xuICAjICAgICAgIFxuICAgIFxuICAjIERuIERhdGUgd2lsbCBsb29rIGxpa2UgL0RhdGUoMTMzNTc1ODQwMDAwMC0wNDAwKS8gIFxuICBkbkRhdGVTdHIgPSBPSi50by5zdHJpbmcoZG5EYXRlKVxuICByZXQgPSB1bmRlZmluZWRcbiAgdGlja3MgPSB1bmRlZmluZWRcbiAgb2Zmc2V0ID0gdW5kZWZpbmVkXG4gIGxvY2FsT2Zmc2V0ID0gdW5kZWZpbmVkXG4gIGFyciA9IHVuZGVmaW5lZFxuICByZXQgPSBPSi5kYXRlVGltZU1pblZhbHVlXG4gIGlmIGZhbHNlIGlzIE9KLmlzLm51bGxPckVtcHR5KGRuRGF0ZVN0cilcbiAgICBkbkRhdGVTdHIgPSBkbkRhdGVTdHIucmVwbGFjZSgnLycsICcnKVxuICAgIGRuRGF0ZVN0ciA9IGRuRGF0ZVN0ci5yZXBsYWNlKCdEYXRlJywgJycpXG4gICAgZG5EYXRlU3RyID0gZG5EYXRlU3RyLnJlcGxhY2UoJygnLCAnJylcbiAgICBkbkRhdGVTdHIgPSBkbkRhdGVTdHIucmVwbGFjZSgnKScsICcnKVxuICAgIGFyciA9IGRuRGF0ZVN0ci5zcGxpdCgnLScpXG4gICAgaWYgYXJyLmxlbmd0aCA+IDFcbiAgICAgIHRpY2tzID0gT0oudG8ubnVtYmVyKGFyclswXSlcbiAgICAgIG9mZnNldCA9IE9KLnRvLm51bWJlcihhcnJbMV0pXG4gICAgICBsb2NhbE9mZnNldCA9IG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKVxuICAgICAgcmV0ID0gbmV3IERhdGUoKHRpY2tzIC0gKChsb2NhbE9mZnNldCArIChvZmZzZXQgLyAxMDAgKiA2MCkpICogMTAwMCkpKVxuICAgIGVsc2UgaWYgYXJyLmxlbmd0aCBpcyAxXG4gICAgICB0aWNrcyA9IE9KLnRvLm51bWJlcihhcnJbMF0pXG4gICAgICByZXQgPSBuZXcgRGF0ZSh0aWNrcylcbiAgcmV0XG5cbiAgT0oucmVnaXN0ZXIgJ2dldERhdGVGcm9tRG5Kc29uJywgZ2V0RGF0ZUZyb21Ebkpzb25cbiAgbW9kdWxlcy5leHBvcnRzID0gZ2V0RGF0ZUZyb21Ebkpzb25cbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5cbiMgV3JhcCB0aGUgZXhlY3V0aW9uIG9mIGEgbWV0aG9kIGluIGEgdHJ5Li5jYXRjaC4uZmluYWxseSAgICAgXG4jIGlnbm9yZSBlcnJvcnMgZmFpbGluZyB0byBleGVjIHNlbGYtZXhlY3V0aW5nIGZ1bmN0aW9ucyBcbiMgUmV0dXJuIGEgbWV0aG9kIHdyYXBwZWQgaW4gYSB0cnkuLmNhdGNoLi5maW5hbGx5XG50cnlFeGVjID0gKHRyeUZ1bmMpIC0+XG4gICd1c2Ugc3RyaWN0J1xuICByZXQgPSBmYWxzZVxuICB0aGF0ID0gdGhpc1xuICB0cnlcbiAgICByZXQgPSB0cnlGdW5jLmFwcGx5KHRoYXQsIEFycmF5OjpzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpICBpZiBPSi5pcy5tZXRob2QodHJ5RnVuYylcbiAgY2F0Y2ggZXhjZXB0aW9uXG4gICAgaWYgKGV4Y2VwdGlvbi5uYW1lIGlzICdUeXBlRXJyb3InIG9yIGV4Y2VwdGlvbi50eXBlIGlzICdjYWxsZWRfbm9uX2NhbGxhYmxlJykgYW5kIGV4Y2VwdGlvbi50eXBlIGlzICdub25fb2JqZWN0X3Byb3BlcnR5X2xvYWQnXG4gICAgICBPSi5jb25zb2xlLmluZm8gJ0lnbm9yaW5nIGV4Y2VwdGlvbjogJywgZXhjZXB0aW9uXG4gICAgZWxzZVxuICAgICAgT0ouY29uc29sZS5lcnJvciBleGNlcHRpb25cbiAgZmluYWxseVxuXG4gIHJldFxuXG5cbiBtZXRob2QgPSAodHJ5RnVuYykgLT5cbiAgJ3VzZSBzdHJpY3QnXG4gIHRoYXQgPSB0aGlzXG4gIC0+XG4gICAgYXJncyA9IEFycmF5OjpzbGljZS5jYWxsKGFyZ3VtZW50cywgMClcbiAgICBhcmdzLnVuc2hpZnQgdHJ5RnVuY1xuICAgIE9KLnRyeUV4ZWMuYXBwbHkgdGhhdCwgYXJnc1xuXG4gIFxuIFxuIE9KLnJlZ2lzdGVyICdtZXRob2QnLCBtZXRob2RcbiBPSi5yZWdpc3RlciAndHJ5RXhlYycsIHRyeUV4ZWNcbiBtb2R1bGUuZXhwb3J0cyA9XG4gIG1ldGhvZDogbWV0aG9kXG4gIHRyeUV4ZWM6IHRyeUV4ZWNcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5cbm51bWJlciA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5IG51bWJlciwgJ2lzTmFOJyxcbiAgdmFsdWU6IChpZiAoTnVtYmVyIGFuZCBOdW1iZXIuaXNOYU4pIHRoZW4gTnVtYmVyLmlzTmFOIGVsc2UgaXNOYU4pXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eSBudW1iZXIsICdpc0Zpbml0ZScsXG4gIHZhbHVlOiAoaWYgKE51bWJlciBhbmQgTnVtYmVyLmlzRmluaXRlKSB0aGVuIE51bWJlci5pc0Zpbml0ZSBlbHNlIGlzRmluaXRlKVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkgbnVtYmVyLCAnTUFYX1ZBTFVFJyxcbiAgdmFsdWU6IChpZiAoTnVtYmVyIGFuZCBOdW1iZXIuTUFYX1ZBTFVFKSB0aGVuIE51bWJlci5NQVhfVkFMVUUgZWxzZSAxLjc5NzY5MzEzNDg2MjMxNTdlKzMwOClcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5IG51bWJlciwgJ01JTl9WQUxVRScsXG4gIHZhbHVlOiAoaWYgKE51bWJlciBhbmQgTnVtYmVyLk1JTl9WQUxVRSkgdGhlbiBOdW1iZXIuTUlOX1ZBTFVFIGVsc2UgNWUtMzI0KVxuXG5PSi5yZWdpc3RlciAnbnVtYmVyJywgbnVtYmVyXG5tb2R1bGUuZXhwb3J0cyA9IG51bWJlciIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4kID0gcmVxdWlyZSAnanF1ZXJ5J1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmlzTWV0aG9kID0gcmVxdWlyZSAnLi4vdG9vbHMvaXMnXG5wcm9wZXJ0eSA9IHJlcXVpcmUgJy4vcHJvcGVydHknXG5mdW5jID0gcmVxdWlyZSAnLi9mdW5jdGlvbidcbnRvID0gcmVxdWlyZSAnLi4vdG9vbHMvdG8nXG5cbiMgIyBvYmplY3RcblxucmV0T2JqID0gXG5cbiAgIyAjIyBbT0pdKG9qLmh0bWwpLm9iamVjdFxuICAjIGNyZWF0ZSBhbiBvYmplY3Qgd2l0aCBoZWxwZXIgYGFkZGAgYW5kIGBlYWNoYCBtZXRob2RzLlxuICBvYmplY3Q6IChvYmogPSB7fSkgLT5cbiAgICBcbiAgICAjIyNcbiAgICBBZGQgYSBwcm9wZXJ0eSB0byB0aGUgb2JqZWN0IGFuZCByZXR1cm4gaXRcbiAgICAjIyNcbiAgICBvYmouYWRkID0gKG5hbWUsIHZhbCkgLT5cbiAgICAgIHByb3BlcnR5IG9iaiwgbmFtZSwgdmFsXG4gICAgICBvYmpcblxuICAgIG9iai5hZGQgJ2VhY2gnLCAoY2FsbGJhY2spIC0+XG4gICAgICBlYWNoID0gcmVxdWlyZSAnLi4vdG9vbHMvZWFjaCdcbiAgICAgIGVhY2ggb2JqLCAodmFsLCBrZXkpIC0+XG4gICAgICAgIGlmIGtleSBpc250ICdlYWNoJyBhbmQga2V5IGlzbnQgJ2FkZCdcbiAgICAgICAgICBjYWxsYmFjayB2YWwsIGtleVxuXG4gICAgb2JqXG5cblxuICAjICMjIFtPSl0ob2ouaHRtbCkuaXNJbnN0YW5jZU9mXG4gICMgZGV0ZXJtaW5lcyBpcyBhIHRoaW5nIGlzIGFuIGluc3RhbmNlIG9mIGEgVGhpbmcsIGFzc3VtaW5nIHRoZSB0aGluZ3Mgd2VyZSBhbGwgY3JlYXRlZCBpbiBPSlxuICBpc0luc3RhbmNlT2Y6IChuYW1lLCBvYmopIC0+XG4gICAgcmV0T2JqLmNvbnRhaW5zKG5hbWUsIG9iaikgYW5kIHRvLmJvb2wob2JqW25hbWVdKVxuXG4gICMgIyMgW09KXShvai5odG1sKS5jb250YWluc1xuICAjIHRydWUgaWYgdGhlIGBvYmplY3RgIGNvbnRhaW5zIHRoZSB2YWx1ZVxuICBjb250YWluczogKG9iamVjdCwgaW5kZXgpIC0+XG4gICAgcmV0ID0gZmFsc2VcbiAgICBpZiBvYmplY3RcbiAgICAgIHJldCA9IF8uY29udGFpbnMgb2JqZWN0LCBpbmRleFxuICAgIHJldFxuXG4gICMgIyMgW09KXShvai5odG1sKS5jb21wYXJlXG4gICMgY29tcGFyZSB0d28gb2JqZWN0cy9hcnJheXMvdmFsdWVzIGZvciBzdHJpY3QgZXF1YWxpdHlcbiAgY29tcGFyZTogKG9iajEsIG9iajIpIC0+XG4gICAgXy5pc0VxdWFsIG9iajEsIG9iajJcblxuICAjICMjIFtPSl0ob2ouaHRtbCkuY2xvbmVcbiAgIyBjb3B5IGFsbCBvZiB0aGUgdmFsdWVzIChyZWN1cnNpdmVseSkgZnJvbSBvbmUgb2JqZWN0IHRvIGFub3RoZXIuXG4gIGNsb25lOiAoZGF0YSkgLT5cbiAgICBfLmNsb25lRGVlcCBkYXRhIHRydWVcblxuICAjICMjIFtPSl0ob2ouaHRtbCkuc2VyaWFsaXplXG4gICMgQ29udmVydCBhbiBvYmplY3QgdG8gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvYmplY3RcbiAgc2VyaWFsaXplOiAoZGF0YSkgLT5cbiAgICByZXQgPSAnJ1xuICAgIGZ1bmMudHJ5RXhlYyAtPlxuICAgICAgcmV0ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSlcbiAgICAgIHJldHVyblxuICAgIHJldCBvciAnJ1xuXG4gICMgIyMgW09KXShvai5odG1sKS5kZXNlcmlhbGl6ZVxuICAjIENvbnZlcnQgYSBKU09OIHN0cmluZyB0byBhbiBvYmplY3RcbiAgZGVzZXJpYWxpemU6IChkYXRhKSAtPlxuICAgIHJldCA9IHt9XG4gICAgaWYgZGF0YVxuICAgICAgZnVuYy50cnlFeGVjIC0+XG4gICAgICAgIHJldCA9ICQucGFyc2VKU09OKGRhdGEpXG4gICAgICAgIHJldHVyblxuXG4gICAgICByZXQgPSB7fSAgaWYgaXNNZXRob2QubnVsbE9yRW1wdHkocmV0KVxuICAgIHJldFxuXG4gICMgIyMgW09KXShvai5odG1sKS5wYXJhbXNcbiAgIyBDb252ZXJ0IGFuIG9iamVjdCB0byBhIGRlbGltaXRlZCBsaXN0IG9mIHBhcmFtZXRlcnMgKG5vcm1hbGx5IHF1ZXJ5LXN0cmluZyBwYXJhbWV0ZXJzKVxuICBwYXJhbXM6IChkYXRhLCBkZWxpbWl0ZXIgPSAnJicpIC0+XG4gICAgcmV0ID0gJydcbiAgICBpZiBkZWxpbWl0ZXIgaXMgJyYnXG4gICAgICBmdW5jLnRyeUV4ZWMgLT5cbiAgICAgICAgcmV0ID0gJC5wYXJhbShkYXRhKVxuICAgICAgICByZXR1cm5cblxuICAgIGVsc2VcbiAgICAgIGVhY2ggPSByZXF1aXJlICcuLi90b29scy9lYWNoJ1xuICAgICAgZWFjaCBkYXRhLCAodmFsLCBrZXkpIC0+XG4gICAgICAgIHJldCArPSBkZWxpbWl0ZXIgIGlmIHJldC5sZW5ndGggPiAwXG4gICAgICAgIHJldCArPSBrZXkgKyAnPScgKyB2YWxcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0by5zdHJpbmcgcmV0XG5cbiAgIyAjIyBbT0pdKG9qLmh0bWwpLmV4dGVuZFxuICAjIGNvcHkgdGhlIHByb3BlcnRpZXMgb2Ygb25lIG9iamVjdCB0byBhbm90aGVyIG9iamVjdFxuICBleHRlbmQ6IChkZXN0T2JqLCBzcmNPYmosIGRlZXBDb3B5ID0gZmFsc2UpIC0+XG4gICAgcmV0ID0gZGVzdE9iaiBvciB7fVxuICAgIGZvciBrZXksIHZhbHVlIG9mIHNyY09ialxuICAgICAgaWYgZGVlcENvcHkgYW5kIHZhbHVlIGFuZCAkLmlzUGxhaW5PYmplY3QodmFsdWUpIGFuZCAkLmlzUGxhaW5PYmplY3QocmV0W2tleV0pXG4gICAgICAgICMgbWVyZ2UgaW50byBkZXN0aW5hdGlvbiBwcm9wZXJ0eVxuICAgICAgICBAZXh0ZW5kIHJldFtrZXldLCB2YWx1ZSwgdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICByZXRba2V5XSA9IHZhbHVlXG4gICAgcmV0XG5cbk9KLnJlZ2lzdGVyICdvYmplY3QnLCByZXRPYmoub2JqZWN0XG5PSi5yZWdpc3RlciAnaXNJbnN0YW5jZU9mJywgcmV0T2JqLmlzSW5zdGFuY2VPZlxuT0oucmVnaXN0ZXIgJ2NvbnRhaW5zJywgcmV0T2JqLmNvbnRhaW5zXG5PSi5yZWdpc3RlciAnY29tcGFyZScsIHJldE9iai5jb21wYXJlXG5PSi5yZWdpc3RlciAnY2xvbmUnLCByZXRPYmouY2xvbmVcbk9KLnJlZ2lzdGVyICdzZXJpYWxpemUnLCByZXRPYmouc2VyaWFsaXplXG5PSi5yZWdpc3RlciAnZGVzZXJpYWxpemUnLCByZXRPYmouZGVzZXJpYWxpemVcbk9KLnJlZ2lzdGVyICdwYXJhbXMnLCByZXRPYmoucGFyYW1zXG5PSi5yZWdpc3RlciAnZXh0ZW5kJywgcmV0T2JqLmV4dGVuZFxuXG5tb2R1bGUuZXhwb3J0cyA9IHJldE9iaiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4gIFxuIyMjXG5BZGQgYSBwcm9wZXJ0eSB0byBhbiBvYmplY3RcbiAgXG4jIyNcbnByb3BlcnR5ID0gKG9iaiwgbmFtZSwgdmFsdWUsIHdyaXRhYmxlLCBjb25maWd1cmFibGUsIGVudW1lcmFibGUpIC0+XG4gIHRocm93IG5ldyBFcnJvciAnQ2Fubm90IGRlZmluZSBhIHByb3BlcnR5IHdpdGhvdXQgYW4gT2JqZWN0LicgIHVubGVzcyBvYmpcbiAgdGhyb3cgbmV3IEVycm9yICdDYW5ub3QgY3JlYXRlIGEgcHJvcGVydHkgd2l0aG91dCBhIHZhbGlkIHByb3BlcnR5IG5hbWUuJyAgdW5sZXNzIG5hbWU/XG4gIG9ialtuYW1lXSA9IHZhbHVlXG4gIG9ialxuXG5PSi5yZWdpc3RlciAncHJvcGVydHknLCBwcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSBwcm9wZXJ0eSIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4gIFxuZGVsaW1pdGVkU3RyaW5nID0gKHN0cmluZywgb3B0cykgLT5cbiAgZGVmYXVsdHMgPVxuICAgIG5ld0xpbmVUb0RlbGltaXRlcjogdHJ1ZVxuICAgIHNwYWNlVG9EZWxpbWl0ZXI6IHRydWVcbiAgICByZW1vdmVEdXBsaWNhdGVzOiB0cnVlXG4gICAgZGVsaW1pdGVyOiBcIixcIlxuICAgIGluaXRTdHJpbmc6IE9KLnRvLnN0cmluZyBzdHJpbmdcblxuICByZXRPYmogPVxuICAgIGFycmF5OiBbXVxuICAgIGRlbGltaXRlZDogLT5cbiAgICAgIHJldE9iai5hcnJheS5qb2luIGRlZmF1bHRzLmRlbGltaXRlclxuXG4gICAgc3RyaW5nOiAoZGVsaW1pdGVyID0gZGVmYXVsdHMuZGVsaW1pdGVyKSAtPlxuICAgICAgcmV0ID0gJydcbiAgICAgIE9KLmVhY2ggcmV0T2JqLmFycmF5LCAodmFsKSAtPlxuICAgICAgICByZXQgKz0gZGVsaW1pdGVyICBpZiByZXQubGVuZ3RoID4gMFxuICAgICAgICByZXQgKz0gdmFsXG4gICAgICAgIHJldHVyblxuXG4gICAgICByZXRcblxuICAgIHRvU3RyaW5nOiAtPlxuICAgICAgcmV0T2JqLnN0cmluZygpXG5cbiAgICBhZGQ6IChzdHIpIC0+XG4gICAgICByZXRPYmouYXJyYXkucHVzaCBkZWZhdWx0cy5wYXJzZShzdHIpXG4gICAgICBkZWZhdWx0cy5kZWxldGVEdXBsaWNhdGVzKClcbiAgICAgIHJldE9ialxuXG4gICAgcmVtb3ZlOiAoc3RyKSAtPlxuICAgICAgcmVtb3ZlID0gKGFycmF5KSAtPlxuICAgICAgICBhcnJheS5maWx0ZXIgKGl0ZW0pIC0+XG4gICAgICAgICAgdHJ1ZSAgaWYgaXRlbSBpc250IHN0clxuXG5cbiAgICAgIHJldE9iai5hcnJheSA9IHJlbW92ZShyZXRPYmouYXJyYXkpXG4gICAgICByZXRPYmpcblxuICAgIGNvdW50OiAtPlxuICAgICAgcmV0T2JqLmFycmF5Lmxlbmd0aFxuXG4gICAgY29udGFpbnM6IChzdHIsIGNhc2VTZW5zaXRpdmUpIC0+XG4gICAgICBpc0Nhc2VTZW5zaXRpdmUgPSBPSi50by5ib29sKGNhc2VTZW5zaXRpdmUpXG4gICAgICBzdHIgPSBPSi50by5zdHJpbmcoc3RyKS50cmltKClcbiAgICAgIHN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpICBpZiBmYWxzZSBpcyBpc0Nhc2VTZW5zaXRpdmVcbiAgICAgIG1hdGNoID0gcmV0T2JqLmFycmF5LmZpbHRlcigobWF0U3RyKSAtPlxuICAgICAgICAoaXNDYXNlU2Vuc2l0aXZlIGFuZCBPSi50by5zdHJpbmcobWF0U3RyKS50cmltKCkgaXMgc3RyKSBvciBPSi50by5zdHJpbmcobWF0U3RyKS50cmltKCkudG9Mb3dlckNhc2UoKSBpcyBzdHJcbiAgICAgIClcbiAgICAgIG1hdGNoLmxlbmd0aCA+IDBcblxuICAgIGVhY2g6IChjYWxsQmFjaykgLT5cbiAgICAgIHJldE9iai5hcnJheS5mb3JFYWNoIGNhbGxCYWNrXG5cbiAgZGVmYXVsdHMucGFyc2UgPSAoc3RyKSAtPlxuICAgIHJldCA9IE9KLnRvLnN0cmluZyhzdHIpXG4gICAgcmV0ID0gcmV0LnJlcGxhY2UoL1xcbi9nLCBkZWZhdWx0cy5kZWxpbWl0ZXIpICB3aGlsZSByZXQuaW5kZXhPZihcIlxcblwiKSBpc250IC0xICBpZiBkZWZhdWx0cy5uZXdMaW5lVG9EZWxpbWl0ZXJcbiAgICByZXQgPSByZXQucmVwbGFjZShSZWdFeHAoXCIgXCIsIFwiZ1wiKSwgZGVmYXVsdHMuZGVsaW1pdGVyKSAgd2hpbGUgcmV0LmluZGV4T2YoXCIgXCIpIGlzbnQgLTEgIGlmIGRlZmF1bHRzLnNwYWNlVG9EZWxpbWl0ZXJcbiAgICByZXQgPSByZXQucmVwbGFjZSgvLCwvZywgZGVmYXVsdHMuZGVsaW1pdGVyKSAgd2hpbGUgcmV0LmluZGV4T2YoXCIsLFwiKSBpc250IC0xXG4gICAgcmV0XG5cbiAgZGVmYXVsdHMuZGVsZXRlRHVwbGljYXRlcyA9IC0+XG4gICAgaWYgZGVmYXVsdHMucmVtb3ZlRHVwbGljYXRlc1xuICAgICAgKC0+XG4gICAgICAgIHVuaXF1ZSA9IChhcnJheSkgLT5cbiAgICAgICAgICBzZWVuID0gbmV3IFNldCgpXG4gICAgICAgICAgYXJyYXkuZmlsdGVyIChpdGVtKSAtPlxuICAgICAgICAgICAgaWYgZmFsc2UgaXMgc2Vlbi5oYXMoaXRlbSlcbiAgICAgICAgICAgICAgc2Vlbi5hZGQgaXRlbVxuICAgICAgICAgICAgICB0cnVlXG5cblxuICAgICAgICByZXRPYmouYXJyYXkgPSB1bmlxdWUocmV0T2JqLmFycmF5KVxuICAgICAgICByZXR1cm5cbiAgICAgICkoKVxuICAgIHJldHVyblxuXG4gICgoYSkgLT5cbiAgICBpZiBhLmxlbmd0aCA+IDEgYW5kIGZhbHNlIGlzIE9KLmlzLnBsYWluT2JqZWN0KG9wdHMpXG4gICAgICBPSi5lYWNoIGEsICh2YWwpIC0+XG4gICAgICAgIHJldE9iai5hcnJheS5wdXNoIHZhbCAgaWYgZmFsc2UgaXMgT0ouaXMubnVsbE9yRW1wdHkodmFsKVxuICAgICAgICByZXR1cm5cblxuICAgIGVsc2UgaWYgc3RyaW5nIGFuZCBzdHJpbmcubGVuZ3RoID4gMFxuICAgICAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRzXG4gICAgICBkZWxpbWl0ZWRTdHJpbmcgPSBkZWZhdWx0cy5wYXJzZShzdHJpbmcpXG4gICAgICBkZWZhdWx0cy5pbml0U3RyaW5nID0gZGVsaW1pdGVkU3RyaW5nXG4gICAgICByZXRPYmouYXJyYXkgPSBkZWxpbWl0ZWRTdHJpbmcuc3BsaXQoZGVmYXVsdHMuZGVsaW1pdGVyKVxuICAgIGRlZmF1bHRzLmRlbGV0ZUR1cGxpY2F0ZXMoKVxuICAgIHJldHVyblxuICApIGFyZ3VtZW50c1xuICByZXRPYmpcblxuXG5PSi5yZWdpc3RlciAnZGVsaW1pdGVkU3RyaW5nJywgZGVsaW1pdGVkU3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGltaXRlZFN0cmluZyIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuTm9kZSA9IHJlcXVpcmUgJy4vbm9kZSdcblxuXG4jIyNcblBlcnNpc3QgYSBoYW5kbGUgb24gdGhlIGJvZHkgbm9kZVxuIyMjXG5pZiB0eXBlb2YgZG9jdW1lbnQgaXNudCAndW5kZWZpbmVkJyB0aGVuIGJvZHkgPSBkb2N1bWVudC5ib2R5IGVsc2UgYm9keSA9IG51bGxcbm9qQm9keSA9IG5ldyBOb2RlXG5vakJvZHkuZWxlbWVudCA9IGJvZHlcbiAgXG5PSi5yZWdpc3RlciAnYm9keScsIG9qQm9keVxubW9kdWxlLmV4cG9ydHMgPSBvakJvZHkiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xubm9kZUZhY3RvcnkgPSByZXF1aXJlICcuL25vZGVGYWN0b3J5J1xub2JqID0gcmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5cbiMgIyBjb21wb25lbnRcblxuXG4jIENyZWF0ZSBhbiBIVE1MIFdlYiBDb21wb25lbnQgdGhyb3VnaCBUaGluRG9tXG5cbiMgLSBgb3B0aW9uc2AgYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc3RhbmRhcmQgb3B0aW9ucyB0byBiZSBwYXNzZWQgaW50byB0aGUgY29tcG9uZW50XG4jIC0tIGByb290Tm9kZVR5cGVgOiB0aGUgdGFnIG5hbWUgb2YgdGhlIHJvb3Qgbm9kZSB0byBjcmVhdGUsIGRlZmF1bHQgPSAnZGl2J1xuIyAtLSBgcHJvcHNgOiBhbiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBET00gYXR0cmlidXRlcyB0byBhcHBlbmQgdG8gdGhlIHJvb3Qgbm9kZVxuIyAtLSBgc3R5bGVzYDogYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgQ1NTIGF0dHJpYnV0ZXMgdG8gYXBwZW5kIHRvIHRoZSByb290IG5vZGVcbiMgLS0gYGV2ZW50c2A6IGFuIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG5hbWVkIERPTSBldmVudHMgKGFuZCBjb3JyZXNwb25kaW5nIGNhbGxiYWNrIG1ldGhvZHMpIHRvIGJpbmQgdG8gdGhlIHJvb3Qgbm9kZVxuIyAtIGBvd25lcmAgdGhlIHBhcmVudCB0byB3aGljaCB0aGUgY29tcG9uZW50IG5vZGUgd2lsbCBiZSBhcHBlbmRlZFxuIyAtIGB0YWdOYW1lYCB0aGUgbmFtZSBvZiBvZiB0aGUgY29tcG9uZW50LCB3aGljaCB3aWxsIGFsd2F5cyBiZSBwcmVmaXhlZCB3aXRoICd4LSdcbmNvbXBvbmVudCA9IChvcHRpb25zID0gb2JqLm9iamVjdCgpLCBvd25lciwgdGFnTmFtZSkgLT5cblxuICBpZiBub3QgdGFnTmFtZS5zdGFydHNXaXRoICd4LScgdGhlbiB0YWdOYW1lID0gJ3gtJyArIHRhZ05hbWVcbiAgIyB3ZWIgY29tcG9uZW50cyBhcmUgcmVhbGx5IGp1c3Qgb3JkaW5hcnkgT0ogW2VsZW1lbnRdKGVsZW1lbnQuaHRtbCkncyB3aXRoIGEgc3BlY2lhbCBuYW1lLlxuICAjIFVudGlsIEhUTUwgV2ViIENvbXBvbmVudHMgYXJlIGZ1bGx5IHN1cHBvcnRlZCAoYW5kIE9KIGlzIHJlZmFjdG9yZWQgYWNjb3JkaW5nbHkpLCB0aGUgZWxlbWVudCB3aWxsIGJlIHRyZWF0ZWQgYXMgYW4gdW5rbm93biBlbGVtZW50LlxuICAjIEluIG1vc3QgY2FzZXMsIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIHRoZSBicm93c2VyIGlzIGFjY2VwdGFibGUgKHNlZSBhbHNvIFtIVE1MIFNlbWFudGljc10oaHR0cDovL2RpdmVpbnRvaHRtbDUuaW5mby9zZW1hbnRpY3MuaHRtbCkpLCBidXRcbiAgIyBpbiBzb21lIGNhc2VzIHRoaXMgaXMgcHJvYmxlbWF0aWMgKGZpcnN0bHksIGJlY2F1c2UgdGhlc2UgZWxlbWVudHMgYXJlIGFsd2F5cyByZW5kZXJlZCBpbmxpbmUpLlxuICAjIEluIHN1Y2ggY29uZGl0aW9ucywgdGhlIFtjb250cm9sc10oY29udHJvbHMuaHRtbCkgY2xhc3MgYW5kIG5hbWUgc3BhY2UgaXMgYmV0dGVyIHN1aXRlZCB0byBjbGFzc2VzIHdoaWNoIHJlcXVpcmUgY29tcGxldGUgY29udHJvbCAoZS5nLiBbaWNvbl0oaWNvbi5odG1sKSkuXG4gIHdpZGdldCA9IG5vZGVGYWN0b3J5IHRhZ05hbWUsIG9iai5vYmplY3QoKSwgb3duZXIsIGZhbHNlICMsIG9wdGlvbnMucHJvcHMsIG9wdGlvbnMuc3R5bGVzLCBvcHRpb25zLmV2ZW50cywgb3B0aW9ucy50ZXh0XG4gIFxuICAjIFNpbmNlIHRoZSBiZWhhdmlvciBvZiBzdHlsaW5nIGlzIG5vdCB3ZWxsIGNvbnRyb2xsZWQvY29udHJvbGxhYmxlIG9uIHVua25vd24gZWxlbWVudHMsIGl0IGlzIG5lY2Vzc2FyeSB0byBjcmVhdGUgYSByb290IG5vZGUgZm9yIHRoZSBjb21wb25lbnQuXG4gICMgSW4gbW9zdCBjYXNlcywgW2Rpdl0oZGl2Lmh0bWwpIGlzIHBlcmZlY3RseSBhY2NlcHRhYmxlLCBidXQgdGhpcyBpcyBjb25maWd1cmFibGUgYXQgdGhlIG5hbWUgc3BhY2UgbGV2ZWwgb3IgYXQgcnVudGltZS5cbiAgcm9vdE5vZGVUeXBlID0gb3B0aW9ucy5yb290Tm9kZVR5cGUgb3IgT0pbJ0RFRkFVTFRfQ09NUE9ORU5UX1JPT1RfTk9ERVRZUEUnXSBvciAnZGl2J1xuXG4gICMgYHJldGAgaXMgdGhlIHRoZSBpbnN0YW5jZSBvZiB0aGUgcm9vdE5vZGVUeXBlLCBub3QgdGhlIGB3aWRnZXRgIHdyYXBwZWQgaW4gdGhpcyBjbG9zdXJlXG4gIHJldCA9IHdpZGdldC5tYWtlIHJvb3ROb2RlVHlwZSwgb3B0aW9uc1xuXG4gICMgZm9yIGNvbnZlbmllbmNlIGFuZCBkZWJ1Z2dpbmcsIHBlcnNpc3QgdGhlIHRhZ05hbWVcbiAgcmV0LmNvbXBvbmVudE5hbWUgPSB0YWdOYW1lXG5cbiAgIyBgcmVtb3ZlYCBkb2VzLCBob3dldmVyLCBiZWhhdmUgYXMgZXhwZWN0ZWQgYnkgcmVtb3ZpbmcgYHdpZGdldGBcbiAgcmV0LnJlbW92ZSA9IHdpZGdldC5yZW1vdmVcbiAgcmV0XG5cbk9KLnJlZ2lzdGVyICdjb21wb25lbnQnLCBjb21wb25lbnRcbm1vZHVsZS5leHBvcnRzID0gY29tcG9uZW50IiwiT0ogPSByZXF1aXJlICcuLi9vaidcbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSAnLi9ub2RlRmFjdG9yeSdcbm9iaiA9IHJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xuXG4jIyNcbkNyZWF0ZSBhIHNldCBvZiBIVE1MIEVsZW1lbnRzIHRocm91Z2ggVGhpbkRvbVxuIyMjXG5jb250cm9sID0gKG9wdGlvbnMgPSBvYmoub2JqZWN0KCksIG93bmVyLCB0YWdOYW1lKSAtPlxuICBpZiBub3QgdGFnTmFtZS5zdGFydHNXaXRoICd5LScgdGhlbiB0YWdOYW1lID0gJ3ktJyArIHRhZ05hbWVcblxuICByb290Tm9kZVR5cGUgPSBvcHRpb25zLnJvb3ROb2RlVHlwZSBvciBPSlsnREVGQVVMVF9DT01QT05FTlRfUk9PVF9OT0RFVFlQRSddIG9yICdkaXYnXG5cbiAgcmV0ID0gbm9kZUZhY3Rvcnkgcm9vdE5vZGVUeXBlLCBvcHRpb25zLCBvd25lciwgZmFsc2VcblxuICByZXQuYWRkICdjb250cm9sTmFtZScsIHRhZ05hbWVcblxuICByZXRcblxuT0oucmVnaXN0ZXIgJ2NvbnRyb2wnLCBjb250cm9sXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRyb2wiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xuJCA9IHJlcXVpcmUgJ2pxdWVyeSdcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5Ob2RlID0gcmVxdWlyZSAnLi9ub2RlJ1xuXG5UaGluRE9NID0gcmVxdWlyZSAndGhpbmRvbSdcblxuIyAjIGVsZW1lbnRcblxuZWxlbWVudCA9IFxuICAjICMjIHJlc3RvcmVFbGVtZW50XG4gICMjI1xuICBSZXN0b3JlIGFuIEhUTUwgRWxlbWVudCB0aHJvdWdoIFRoaW5Eb21cbiAgIyMjXG4gIHJlc3RvcmVFbGVtZW50OiAoZWwsIHRhZyA9IGVsLm5vZGVOYW1lKSAtPlxuICBcdGVsLm9mV3JhcHBlciBvclxuXHQgICAgbm9kZSA9IG5ldyBOb2RlXG5cdCAgICBub2RlLmVsZW1lbnQgPSBlbFxuXHQgICAgbm9kZVxuXG5PSi5yZWdpc3RlciAncmVzdG9yZUVsZW1lbnQnLCBlbGVtZW50LnJlc3RvcmVFbGVtZW50XG5cbk9KLnJlZ2lzdGVyICdpc0VsZW1lbnRJbkRvbScsIChlbGVtZW50SWQpIC0+XG4gIGZhbHNlIGlzIE9KLmlzLm51bGxPckVtcHR5IE9KLmdldEVsZW1lbnQgZWxlbWVudElkXG5cbk9KLnJlZ2lzdGVyICdnZXRFbGVtZW50JywgKGlkKSAtPlxuICBpZiB0eXBlb2YgZG9jdW1lbnQgaXNudCAndW5kZWZpbmVkJ1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZWxlbWVudCIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5ub2RlRmFjdG9yeSA9IHJlcXVpcmUgJy4vbm9kZUZhY3RvcnknXG5cbiMgIyBmcmFnbWVudFxuXG4jIENyZWF0ZSBhIGRvY3VtZW50IGZyYWdtZW50IGFuZCByZXR1cm4gaXQgYXMgYW4gT0ogbm9kZVxuZnJhZ21lbnQgPSAtPlxuICByZXQgPSBudWxsXG4gIGlmIHR5cGVvZiBkb2N1bWVudCBpc250ICd1bmRlZmluZWQnXG4gICAgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgICBcbiAgICBmcmFnID0gbmV3IFRoaW5ET00gbnVsbCwgbnVsbCwgZnJhZ21lbnRcbiAgICBmcmFnLmlzSW5ET00gPSB0cnVlXG4gICAgcmV0ID0gbm9kZUZhY3RvcnkgZnJhZ1xuICAgIFxuICByZXRcblxuT0oucmVnaXN0ZXIgJ2ZyYWdtZW50JywgZnJhZ21lbnRcbm1vZHVsZS5leHBvcnRzID0gZnJhZ21lbnQiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vb2pJbml0J1xub2JqID0gcmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5ub2RlRmFjdG9yeSA9IHJlcXVpcmUgJy4vbm9kZUZhY3RvcnknXG5cbiMgIyBnZW5lcmljIG5vZGVzXG5cbmNsb3NlZCA9IFtcbiAgJ2FiYnInXG4gICdhY3JvbnltJ1xuICAnYXBwbGV0J1xuICAnYXJ0aWNsZSdcbiAgJ2FzaWRlJ1xuICAnYXVkaW8nXG4gICdiJ1xuICAnYmRvJ1xuICAnYmlnJ1xuICAnYmxvY2txdW90ZSdcbiAgJ2J1dHRvbidcbiAgJ2NhbnZhcydcbiAgJ2NhcHRpb24nXG4gICdjZW50ZXInXG4gICdjaXRlJ1xuICAnY29kZSdcbiAgJ2NvbGdyb3VwJ1xuICAnZGF0YWxpc3QnXG4gICdkZCdcbiAgJ2RlbCdcbiAgJ2RldGFpbHMnXG4gICdkZm4nXG4gICdkaXInXG4gICdkaXYnXG4gICdkbCdcbiAgJ2R0J1xuICAnZW0nXG4gICdmaWVsZHNldCdcbiAgJ2ZpZ2NhcHRpb24nXG4gICdmaWd1cmUnXG4gICdmb250J1xuICAnZm9vdGVyJ1xuICAnaDEnXG4gICdoMidcbiAgJ2gzJ1xuICAnaDQnXG4gICdoNSdcbiAgJ2g2J1xuICAnaGVhZCdcbiAgJ2hlYWRlcidcbiAgJ2hncm91cCdcbiAgJ2h0bWwnXG4gICdpJ1xuICAnaWZyYW1lJ1xuICAnaW5zJ1xuICAna2JkJ1xuICAnbGFiZWwnXG4gICdsZWdlbmQnXG4gICdsaSdcbiAgJ21hcCdcbiAgJ21hcmsnXG4gICdtZW51J1xuICAnbWV0ZXInXG4gICduYXYnXG4gICdub2ZyYW1lcydcbiAgJ25vc2NyaXB0J1xuICAnb2JqZWN0J1xuICAnb3B0Z3JvdXAnXG4gICdvcHRpb24nXG4gICdvdXRwdXQnXG4gICdwJ1xuICAncHJlJ1xuICAncHJvZ3Jlc3MnXG4gICdxJ1xuICAncnAnXG4gICdydCdcbiAgJ3J1YnknXG4gICdzJ1xuICAnc2FtcCdcbiAgJ3NlY3Rpb24nXG4gICdzbWFsbCdcbiAgJ3NwYW4nXG4gICdzdHJpa2UnXG4gICdzdHJvbmcnXG4gICdzdHlsZSdcbiAgJ3N1YidcbiAgJ3N1bW1hcnknXG4gICdzdXAnXG4gICd0Ym9keSdcbiAgJ3RkJ1xuICAndGZvb3QnXG4gICd0aCdcbiAgJ3RpbWUnXG4gICd0aXRsZSdcbiAgJ3RyJ1xuICAndHQnXG4gICd1J1xuICAndmFyJ1xuICAndmlkZW8nXG4gICd4bXAnXG5dXG5vcGVuID0gJ2FyZWEgYmFzZSBjb2wgY29tbWFuZCBjc3MgZW1iZWQgaHIgaW1nIGtleWdlbiBtZXRhIHBhcmFtIHNvdXJjZSB0cmFjayB3YnInLnNwbGl0ICcgJ1xuYWxsID0gY2xvc2VkLmNvbmNhdCBvcGVuXG5cbmV4cG9ydHMgPSB7fVxuIyByZWdpc3RlciBzZW1hbnRpYy9zdHJ1Y3R1cmFsIGFsaWFzZXNcbmZvciBsb29wTmFtZSBpbiBhbGxcbiAgZG8gKHRhZyA9IGxvb3BOYW1lKSAtPlxuICAgIG1ldGhvZCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHksIGNhbGxlZEZyb21GYWN0b3J5ID0gZmFsc2UpIC0+XG5cbiAgICAgIGRlZmF1bHRzID1cbiAgICAgICAgcHJvcHM6IHt9XG4gICAgICAgIHN0eWxlczoge31cbiAgICAgICAgZXZlbnRzOiB7fVxuXG4gICAgICBvYmouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zXG4gICAgICByZXQgPSBub2RlRmFjdG9yeSB0YWcsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnlcblxuICAgICAgcmV0XG4gICAgbWV0aG9kLmRlZmF1bHRCZWhhdmlvciA9IHRydWVcbiAgICBPSi5ub2Rlcy5yZWdpc3RlciB0YWcsIG1ldGhvZFxuICAgIGV4cG9ydHNbdGFnXSA9IG1ldGhvZFxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xuXG4jIyNcbkNyZWF0ZSBhbiBPSiBJbnB1dCBPYmplY3QgdGhyb3VnaCBPSi5ub2Rlcy5pbnB1dFxuIyMjXG5pbnB1dCA9IChvcHRpb25zID0gT0oub2JqZWN0KCksIG93bmVyKSAtPlxuICBpZiBub3Qgb3duZXIgdGhlbiB0aHJvdyBuZXcgRXJyb3IgJ0Nhbm5vdCBjcmVhdGUgYW4gaW5wdXQgd2l0aG91dCBhIHBhcmVudCdcbiAgaWYgbm90IG9wdGlvbnMucHJvcHMgb3Igbm90IG9wdGlvbnMucHJvcHMudHlwZSB0aGVuIHRocm93IG5ldyBFcnJvciAnQ2Fubm90IGNyZWF0ZSBhbiBpbnB1dCB3aXRob3V0IGFuIGlucHV0IHR5cGUnXG4gIHJldCA9IG93bmVyLm1ha2UgJ2lucHV0Jywgb3B0aW9uc1xuICByZXQuYWRkICdpbnB1dE5hbWUnLCBvcHRpb25zLnByb3BzLnR5cGVcbiAgcmV0XG4gICAgXG5PSi5yZWdpc3RlciAnaW5wdXQnLCBpbnB1dFxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dCIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4kID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG4jICMgZG9tXG5cblxuIyBFeHRlbmQgYW4gb2JqZWN0IHdpdGggT0ogRE9NIG1ldGhvZHMgYW5kIHByb3BlcnRpZXNcblxubWV0aG9kcyA9IHt9XG5cblxuIyAtIGBAZWxgIE9iamVjdCB0byBleHRlbmRcbiMgLSBgcGFyZW50YCBwYXJlbnQgb2JqZWN0IHRvIHdoaWNoIGBAZWxgIHdpbGwgYmUgYXBwZW5kZWRcbmNsYXNzIE5vZGVcbiAgXG4gICNwYXJlbnQ6IHJlcXVpcmUoJy4vYm9keScpXG4gIFxuICBjb25zdHJ1Y3RvcjogKHBhcmVudCkgLT5cblxuICBtYWtlOiAodGFnTmFtZSwgb3B0aW9ucykgLT5cbiAgICBpZiB0YWdOYW1lLm1ha2UgIyBwcm92aWRlZCBhIGN1c3RvbSBjb21wb25lbnQgZGlyZWN0bHlcbiAgICAgIHRhZ05hbWUubWFrZSB0aGlzLCBvcHRpb25zXG4gICAgZWxzZVxuICAgICAgbWV0aG9kID0gbWV0aG9kc1t0YWdOYW1lXVxuICAgICAgaWYgbWV0aG9kXG4gICAgICAgIG1ldGhvZCBvcHRpb25zXG4gICAgICBlbHNlXG4gICAgICAgIG1ldGhvZCA9IE9KLm5vZGVzW3RhZ05hbWVdIG9yIE9KLmNvbXBvbmVudHNbdGFnTmFtZV0gb3IgT0ouY29udHJvbHNbdGFnTmFtZV0gb3IgT0ouaW5wdXRzW3RhZ05hbWVdXG4gICAgICAgIGlmIG1ldGhvZCAmJiAhbWV0aG9kLmRlZmF1bHRCZWhhdmlvclxuICAgICAgICAgIG1ldGhvZCBvcHRpb25zLCB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZXdPSk5vZGUgPSBuZXcgTm9kZSgpXG4gICAgICAgICAgbmV3T0pOb2RlLmVsZW1lbnQgPSBvakNyZWF0ZUVsZW1lbnQgQGVsZW1lbnQsIHRhZ05hbWUsIG9wdGlvbnNcbiAgICAgICAgICBuZXdPSk5vZGVcblxuICBhZGQ6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICB0aGlzW25hbWVdID0gdmFsdWVcbiAgICAjIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgbGluayBiYWNrIHRvIG91cnNlbHZlcywgc28gd2UgY2FuIGluaGVyaXQgdmFsdWVzXG4gICAgQGVsZW1lbnQub2pXcmFwcGVyID0gdGhpc1xuXG4gIGdldDogKG5hbWUpIC0+XG4gICAgdmFsdWUgPSB0aGlzW25hbWVdXG4gICAgaWYgdmFsdWUgaXMgdW5kZWZpbmVkXG4gICAgICBwYXJlbnQgPSBAZWxlbWVudFxuICAgICAgd2hpbGUgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGVcbiAgICAgICAgaWYgcGFyZW50Lm9qV3JhcHBlclxuICAgICAgICAgIHJldHVybiBwYXJlbnQub2pXcmFwcGVyLmdldCBuYW1lXG4gICAgZWxzZVxuICAgICAgdmFsdWVcblxuICBzaG93OiAoKSAtPlxuICAgIEAkLnNob3coKVxuICAgIG9qQ3JlYXRlRWxlbWVudC5vblNob3cgQGVsZW1lbnRcblxuICBkaXNhYmxlOiAoKSAtPlxuICAgIEAkLmF0dHIgJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJ1xuICAgIEAkLmFkZENsYXNzICdkaXNhYmxlZCcsICdkaXNhYmxlZCdcblxuICBlbmFibGU6ICgpIC0+XG4gICAgQCQucmVtb3ZlQXR0ciAgJ2Rpc2FibGVkJ1xuICAgIEAkLnJlbW92ZUNsYXNzICdkaXNhYmxlZCdcblxuW1xuICAnb24nXG4gICdlbXB0eSdcbiAgJ3RleHQnXG4gICdyZW1vdmVDbGFzcydcbiAgJ2FkZENsYXNzJ1xuICAnaGFzQ2xhc3MnXG4gICdoaWRlJ1xuICAnYXR0cidcbiAgJ3JlbW92ZUF0dHInXG4gICdjc3MnXG4gICdyZW1vdmUnXG4gICdhcHBlbmQnXG4gICd2YWwnXG4gICdodG1sJ1xuICAncHJvcCdcbiAgJ3RyaWdnZXInXG5dLmZvckVhY2goKG1ldGhvZCkgLT5cbiAgTm9kZS5wcm90b3R5cGVbbWV0aG9kXSA9ICgpIC0+XG4gICAgalF1ZXJ5V3JhcHBlciA9IEAkXG4gICAgalF1ZXJ5V3JhcHBlclttZXRob2RdLmFwcGx5KGpRdWVyeVdyYXBwZXIsIGFyZ3VtZW50cylcbilcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE5vZGUucHJvdG90eXBlLCAnJCcsXG4gIGdldDogKCkgLT5cbiAgICBqUXVlcnlXcmFwcGVyID0gJCh0aGlzLmVsZW1lbnQpXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICckJyxcbiAgICAgIHZhbHVlOiBqUXVlcnlXcmFwcGVyXG4gICAgKVxuICAgIGpRdWVyeVdyYXBwZXJcbilcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE9KLk5vZGUgPSBOb2RlIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5UaGluRE9NID0gcmVxdWlyZSAndGhpbmRvbSdcbk5vZGUgPSByZXF1aXJlICcuL25vZGUnXG5cbiNjbG9zZWQgPSAnYSBhYmJyIGFjcm9ueW0gYWRkcmVzcyBhcHBsZXQgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiIGJkbyBiaWcgYmxvY2txdW90ZSBib2R5IGJ1dHRvbiBjYW52YXMgY2FwdGlvbiBjZW50ZXIgY2l0ZSBjb2RlIGNvbGdyb3VwIGNvbW1hbmQgZGF0YWxpc3QgZGQgZGVsIGRldGFpbHMgZGZuIGRpciBkaXYgZGwgZHQgZW0gZW1iZWQgZmllbGRzZXQgZmlnY2FwdGlvbiBmaWd1cmUgZm9udCBmb290ZXIgZm9ybSBmcmFtZXNldCBoMSBoMiBoMyBoNCBoNSBoNiBoZWFkIGhlYWRlciBoZ3JvdXAgaHRtbCBpIGlmcmFtZSBpbnMga2V5Z2VuIGtiZCBsYWJlbCBsZWdlbmQgbGkgbWFwIG1hcmsgbWVudSBtZXRlciBuYXYgbm9mcmFtZXMgbm9zY3JpcHQgb2JqZWN0IG9sIG9wdGdyb3VwIG9wdGlvbiBvdXRwdXQgcCBwcmUgcHJvZ3Jlc3MgcSBycCBydCBydWJ5IHMgc2FtcCBzY3JpcHQgc2VjdGlvbiBzZWxlY3Qgc21hbGwgc291cmNlIHNwYW4gc3RyaWtlIHN0cm9uZyBzdHlsZSBzdWIgc3VtbWFyeSBzdXAgdGFibGUgdGJvZHkgdGQgdGV4dGFyZWEgdGZvb3QgdGggdGhlYWQgdGltZSB0aXRsZSB0ciB0dCB1IHVsIHZhciB2aWRlbyB3YnIgeG1wJy5zcGxpdCAnICdcbiNvcGVuID0gJ2FyZWEgYmFzZSBiciBjb2wgY29tbWFuZCBjc3MgIURPQ1RZUEUgZW1iZWQgaHIgaW1nIGlucHV0IGtleWdlbiBsaW5rIG1ldGEgcGFyYW0gc291cmNlIHRyYWNrIHdicicuc3BsaXQgJyAnXG4jXG4jbmVzdGFibGVOb2RlTmFtZXMgPSBbXG4jICAnZGl2J1xuIyAgJ3NwYW4nXG4jICAnaDEnXG4jICAnaDInXG4jICAnaDMnXG4jICAnaDQnXG4jICAnaDUnXG4jICAnaDYnXG4jICAncCdcbiMgICdmaWVsZHNldCdcbiMgICdzZWxlY3QnXG4jICAnb2wnXG4jICAndWwnXG4jICAndGFibGUnXG4jXVxuI1xuIyNUaGlzIGxpc3QgaXMgbm90IHlldCBleGhhdXN0aXZlLCBqdXN0IGV4Y2x1ZGUgdGhlIG9idmlvdXNcbiNub25OZXN0YWJsZU5vZGVzID0gW1xuIyAgJ2xpJ1xuIyAgJ2xlZ2VuZCdcbiMgICd0cidcbiMgICd0ZCdcbiMgICdvcHRpb24nXG4jICAnYm9keSdcbiMgICdoZWFkJ1xuIyAgJ3NvdXJjZSdcbiMgICd0Ym9keSdcbiMgICd0Zm9vdCdcbiMgICd0aGVhZCdcbiMgICdsaW5rJ1xuIyAgJ3NjcmlwdCdcbiNdXG4jXG4jbm9kZU5hbWVzID0gW1xuIyAgJ2EnXG4jICAnYidcbiMgICdicidcbiMgICdidXR0b24nXG4jICAnZGl2J1xuIyAgJ2VtJ1xuIyAgJ2ZpZWxkc2V0J1xuIyAgJ2Zvcm0nXG4jICAnaDEnXG4jICAnaDInXG4jICAnaDMnXG4jICAnaDQnXG4jICAnaDUnXG4jICAnaDYnXG4jICAnaSdcbiMgICdpbWcnXG4jICAnaW5wdXQnXG4jICAnbGFiZWwnXG4jICAnbGVnZW5kJ1xuIyAgJ2xpJ1xuIyAgJ25hdidcbiMgICdvbCdcbiMgICdvcHRpb24nXG4jICAncCdcbiMgICdzZWxlY3QnXG4jICAnc3BhbidcbiMgICdzdHJvbmcnXG4jICAnc3VwJ1xuIyAgJ3N2ZydcbiMgICd0YWJsZSdcbiMgICd0Ym9keSdcbiMgICd0ZCdcbiMgICd0ZXh0YXJlYSdcbiMgICd0aCdcbiMgICd0aGVhZCdcbiMgICd0cidcbiMgICd1bCdcbiNdXG5cbmNsYXNzIE5vZGVGYWN0b3J5XG4gIFxuICBvak5vZGU6IG51bGxcbiAgXG4gIEBnZXQ6IChpZCwgdGFnTmFtZSA9ICdkaXYnKSAtPlxuICAgIHJldCA9IG51bGxcbiAgICBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkIGlkXG4gICAgaWYgZWxcbiAgICAgIHRoaW5FbCA9IE9KLnJlc3RvcmVFbGVtZW50IGVsLCB0YWdOYW1lXG4gICAgaWYgdGhpbkVsXG4gICAgICByZXQgPSBuZXcgTm9kZUZhY3RvcnkgbnVsbCwgbnVsbCwgbnVsbCwgZmFsc2UsIHRoaW5FbFxuXG4gICAgcmV0XG4gIFxuICBfbWFrZUFkZDogKHRhZ05hbWUsIGNvdW50KSAtPlxuICAgIChvcHRzKSA9PlxuICAgICAgbWV0aG9kID0gT0oubm9kZXNbdGFnTmFtZV0gb3IgT0ouY29tcG9uZW50c1t0YWdOYW1lXSBvciBPSi5jb250cm9sc1t0YWdOYW1lXSBvciBPSi5pbnB1dHNbdGFnTmFtZV1cbiAgICAgIGlmIG1ldGhvZFxuICAgICAgICBudSA9IG1ldGhvZCBvcHRzLCBAb2pOb2RlXG4gICAgICBlbHNlXG4gICAgICAgIG51ID0gT0ouY29tcG9uZW50IG51bGwsIEBvak5vZGUsIHRhZ05hbWVcbiAgICAgICNyZXQgPSBuZXcgTm9kZUZhY3RvcnkgbnUsIEB0aGluTm9kZSwgY291bnRcbiAgICAgIG51XG4gIFxuICBfbWFrZVVuaXF1ZUlkOiAoY291bnQpIC0+XG4gICAgaWYgT0ouR0VORVJBVEVfVU5JUVVFX0lEU1xuICAgICAgY291bnQgKz0gMVxuICAgICAgaWYgY291bnQgPD0gQG93bmVyLmNvdW50IHRoZW4gY291bnQgPSBAb3duZXIuY291bnQgKyAxXG4gICAgICBAb3duZXIuY291bnQgPSBjb3VudFxuXG4gICAgICBpZiBub3QgQG9qTm9kZS5nZXRJZCgpXG4gICAgICAgIGlkID0gQG93bmVyLmdldElkKCkgb3IgJydcbiAgICAgICAgaWQgKz0gQG9qTm9kZS50YWdOYW1lICsgY291bnRcbiAgICAgICAgQG9qTm9kZS5hdHRyICdpZCcsIGlkXG4gICAgcmV0dXJuXG4gIFxuICBfYmluZEV2ZW50czogLT5cbiAgICBpZiBAb2pOb2RlIHRoZW4gXy5mb3JPd24gQG9wdGlvbnMuZXZlbnRzLCAodmFsLCBrZXkpID0+XG4gICAgICBpc01ldGhvZCA9IHJlcXVpcmUgJy4uL3Rvb2xzL2lzJ1xuICAgICAgaWYgaXNNZXRob2QubWV0aG9kIHZhbFxuICAgICAgICBjYWxsYmFjayA9IChldmVudC4uLikgLT4gdmFsIGV2ZW50Li4uXG4gICAgICAgIEBvak5vZGUuJC5vbiBrZXksIGNhbGxiYWNrXG4gICAgICAgIEBvak5vZGUuYWRkIGtleSwgY2FsbGJhY2tcbiAgICAgICAgbnVsbFxuICBcbiAgY29uc3RydWN0b3I6IChAdGFnLCBAb3B0aW9ucywgQG93bmVyLCBAdGhpbk5vZGUgPSBudWxsKSAtPlxuICAgIGlmIEB0YWcgYW5kIG5vdCBAdGhpbk5vZGVcbiAgICAgIEB0aGluTm9kZSA9IG5ldyBUaGluRE9NIEB0YWcsIEBvcHRpb25zLnByb3BzXG4gICAgICBAdGhpbk5vZGUuYWRkICd0YWdOYW1lJywgQHRhZ1xuICAgICAgQHRoaW5Ob2RlLmNzcyBAb3B0aW9ucy5zdHlsZXNcbiAgICAgIGlmIEBvcHRpb25zLnRleHQgdGhlbiBAdGhpbk5vZGUudGV4dCBAb3B0aW9ucy50ZXh0XG4gICAgXG4gICAgaWYgQG93bmVyXG4gICAgICBAbWFrZSgpXG4gIFxuICBhZGRNYWtlTWV0aG9kOiAoY291bnQpIC0+XG4gICAgbWV0aG9kcyA9IE9KLm9iamVjdCgpXG4gICAgQG9qTm9kZS5tYWtlID0gKHRhZ05hbWUsIG9wdHMpID0+XG4gICAgICBtZXRob2QgPSBtZXRob2RzW3RhZ05hbWVdXG4gICAgICBpZiBub3QgbWV0aG9kXG4gICAgICAgIG1ldGhvZCA9IEBfbWFrZUFkZCB0YWdOYW1lLCBAb2pOb2RlLCBjb3VudFxuICAgICAgICBtZXRob2RzW3RhZ05hbWVdID0gbWV0aG9kXG4gICAgICBtZXRob2Qgb3B0c1xuICAgIEBvak5vZGVcblxuICBtYWtlOiAtPlxuXG4gICAgQG9qTm9kZSA9IG51bGxcblxuICAgIGlmIEB0aGluTm9kZT8uaXNGdWxseUluaXQgdGhlbiBAb2pOb2RlID0gQHRoaW5Ob2RlXG4gIFxuICAgICMgMjogSWYgdGhlIGVsZW1lbnQgaGFzIG5ldmVyIGJlZW4gaW5pdGlhbGl6ZWQsIGNvbnRpbnVlXG4gICAgZWxzZVxuICAgICAgIyAzOiBBcyBsb25nIGFzIHRoZSBlbGVtZW50IGlzbid0IHRoZSBib2R5IG5vZGUsIGNvbnRpbnVlXG4gICAgICAjIGlmIGVsLnRhZ05hbWUgaXNudCAnYm9keSdcbiAgICAgICMgNDogRXh0ZW5kIHRoZSBlbGVtZW50IHdpdGggc3RhbmRhcmQgalF1ZXJ5IEFQSSBtZXRob2RzXG4gICAgICBAb2pOb2RlID0gbmV3IE5vZGUgQHRoaW5Ob2RlLCBAb3duZXJcbiAgICAgIGNvdW50ID0gKEBvd25lci5jb3VudCArIDEpIHx8IDFcbiAgICAgICMgNTogSWYgdGhlIG5vZGUgaXNuJ3QgaW4gdGhlIERPTSwgYXBwZW5kIGl0IHRvIHRoZSBwYXJlbnRcbiAgICAgICMgVGhpcyBhbHNvIGFjY29tbW9kYXRlcyBkb2N1bWVudCBmcmFnbWVudHMsIHdoaWNoIGFyZSBub3QgaW4gdGhlIERPTSBidXQgYXJlIHByZXN1bWVkIHRvIGJlIHNvdW5kIHVudGlsIHJlYWR5IGZvciBtYW51YWwgaW5zZXJ0aW9uXG4gICAgICBpZiBAdGhpbk5vZGUudGFnTmFtZSBpc250ICdib2R5JyBhbmQgbm90IEB0aGluTm9kZS5pc0luRE9NIGFuZCBub3QgQG9qTm9kZS5pc0luRE9NXG4gICAgICAgIEBfbWFrZVVuaXF1ZUlkIGNvdW50XG4gICAgICAgIEBvd25lci5hcHBlbmQgQG9qTm9kZVswXVxuICAgICAgICAjIDY6IEJpbmQgYW55IGRlZmluZWQgZXZlbnRzIGFmdGVyIHRoZSBub2RlIGlzIGluIHRoZSBET01cbiAgICAgICAgQF9iaW5kRXZlbnRzKClcbiAgICAgICAgXG4gICAgICBAdGhpbk5vZGUuaXNJbkRPTSA9IHRydWVcbiAgICAgIEBvak5vZGUuaXNJbkRPTSA9IHRydWVcblxuICAgICAgIyA3OiBDcmVhdGUgdGhlIGFsbCBpbXBvcnRhbnQgJ21ha2UnIG1ldGhvZFxuICAgICAgQGFkZE1ha2VNZXRob2QgY291bnRcblxuICAgICAgIyA4OiBQcmV2ZW50IGR1cGxpY2F0ZSBmYWN0b3J5IGV4dGVuc2lvbiBieSBzZXR0aW5nIGlzIGluaXQgPSB0cnVlXG4gICAgICBAb2pOb2RlLmlzRnVsbHlJbml0ID0gdHJ1ZVxuXG4gICAgICAjIDk6IGlmIHRoZSBub2RlIHN1cHBvcnRzIGl0LCBjYWxsIGZpbmFsaXplXG4gICAgICBmaW5hbGl6ZSA9IF8ub25jZSBAb2pOb2RlLmZpbmFsaXplIG9yIE9KLm5vb3BcbiAgICAgIEBvak5vZGUuZmluYWxpemUgPSBmaW5hbGl6ZVxuICAgICAgZmluYWxpemUgQG9qTm9kZVxuICAgICMgMTA6IFJldHVybiB0aGUgZXh0ZW5kZWQgZWxlbWVudFxuICAgIEBvak5vZGVcblxuZGVmYXVsdENyZWF0ZUVsZW1lbnQgPSAocGFyZW50LCB0YWcsIG9wdGlvbnMpIC0+XG4gIG5ld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IHRhZ1xuICBpZiBvcHRpb25zXG4gICAgZm9yIGtleSwgdmFsdWUgb2Ygb3B0aW9ucy5wcm9wc1xuICAgICAgbmV3RWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSlcbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvcHRpb25zLmV2ZW50c1xuICAgICAgJChuZXdFbGVtZW50KS5vbihrZXksIHZhbHVlKVxuICAgIGZvciBrZXksIHZhbHVlIG9mIG9wdGlvbnMuc3R5bGVzXG4gICAgICAkKG5ld0VsZW1lbnQpLmNzcyhrZXksIHZhbHVlKVxuICAgIHZhbHVlID0gb3B0aW9ucy50ZXh0XG4gICAgaWYgdmFsdWUgaXNudCB1bmRlZmluZWRcbiAgICAgICQobmV3RWxlbWVudCkudGV4dCh2YWx1ZSlcbiAgcGFyZW50Py5hcHBlbmRDaGlsZChuZXdFbGVtZW50KVxuXG5nZXROb2RlRnJvbUZhY3RvcnkgPSAodGFnLCBvcHRpb25zLCBvd25lciwgaXNDYWxsZWRGcm9tRmFjdG9yeSwgbm9kZSkgLT5cbiAgbmV3T0pOb2RlID0gbmV3IE5vZGUoKVxuICBpZiAhd2luZG93Lm9qQ3JlYXRlRWxlbWVudFxuICAgIHdpbmRvdy5vakNyZWF0ZUVsZW1lbnQgPSBkZWZhdWx0Q3JlYXRlRWxlbWVudFxuICBuZXdPSk5vZGUuZWxlbWVudCA9IG9qQ3JlYXRlRWxlbWVudChvd25lci5lbGVtZW50LCB0YWcgfHwgJ2RpdicsIG9wdGlvbnMpXG4gIG5ld09KTm9kZVxuXG5PSi5yZWdpc3RlciAnbm9kZUZhY3RvcnknLCBnZXROb2RlRnJvbUZhY3RvcnlcblxubWFrZSA9ICh0YWcsIG9wdGlvbnMpIC0+XG4gIG5ld09KTm9kZSA9IG5ldyBOb2RlKClcbiAgbmV3T0pOb2RlLmVsZW1lbnQgPSBvakNyZWF0ZUVsZW1lbnQobnVsbCwgdGFnIHx8ICdkaXYnLCBvcHRpb25zKVxuICBuZXdPSk5vZGVcblxuT0oucmVnaXN0ZXIgJ21ha2UnLCBtYWtlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5vZGVGcm9tRmFjdG9yeVxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuXG4jICMgYVxubm9kZU5hbWUgPSAnYSdcblxubm9kZSA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHksIGNhbGxlZEZyb21GYWN0b3J5ID0gZmFsc2UpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgaWQ6ICcnXG4gICAgICBjbGFzczogJydcbiAgICAgIHRleHQ6ICcnXG4gICAgICBocmVmOiAnamF2YVNjcmlwdDp2b2lkKDApOydcbiAgICAgIHR5cGU6ICcnXG4gICAgICB0aXRsZTogJydcbiAgICAgIHJlbDogJydcbiAgICAgIG1lZGlhOiAnJ1xuICAgICAgdGFyZ2V0OiAnJ1xuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgdG9nZ2xlU3RhdGUgPSAnb2ZmJ1xuXG4gIHRvZ2dsZSA9IC0+XG4gICAgaWYgdG9nZ2xlU3RhdGUgaXMgJ29uJ1xuICAgICAgdG9nZ2xlU3RhdGUgPSAnb2ZmJ1xuICAgIGVsc2UgdG9nZ2xlU3RhdGUgPSAnb24nICBpZiB0b2dnbGVTdGF0ZSBpcyAnb2ZmJ1xuICAgIHJldHVyblxuXG4gICMgQ2xpY2sgYmluZGluZ1xuICBpZiBkZWZhdWx0cy5ldmVudHMuY2xpY2sgaXNudCBPSi5ub29wXG4gICAgY2xpY2sgPSBkZWZhdWx0cy5ldmVudHMuY2xpY2tcbiAgICBuZXdDbGljayA9IChldmVudC4uLikgLT5cbiAgICAgIHRvZ2dsZSgpXG4gICAgICByZXRWYWwgPSBjbGljayBldmVudC4uLlxuICAgICAgaWYgZGVmYXVsdHMuaHJlZiBpcyAnIycgdGhlbiByZXRWYWwgPSBmYWxzZVxuICAgICAgcmV0VmFsXG4gICAgZGVmYXVsdHMuZXZlbnRzLmNsaWNrID0gbmV3Q2xpY2tcbiAgZWxzZVxuICAgIGRlZmF1bHRzLmV2ZW50cy5jbGljayA9IHRvZ2dsZVxuXG4gIHJldCA9IG5vZGVGYWN0b3J5IG5vZGVOYW1lLCBkZWZhdWx0cywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5XG5cbiAgcmV0XG5cbk9KLm5vZGVzLnJlZ2lzdGVyIG5vZGVOYW1lLCBub2RlXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGVcblxuXG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xubm9kZUZhY3RvcnkgPSByZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG50byA9IHJlcXVpcmUgJy4uL3Rvb2xzL3RvJ1xuIyAjIGJyXG5cbm5vZGVOYW1lID0gJ2JyJ1xuXG5ub2RlID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSwgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6IHt9XG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgbnVtYmVyOiAxXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG4gIGkgPSAwXG4gIHdoaWxlIGkgPCB0by5udW1iZXIgZGVmYXVsdHMubnVtYmVyXG4gICAgIyBJbiB0aGUgY2FzZSBvZiBtdWx0aXBsZSBicnMsIGl0IGlzIGRlc2lyYWJsZSB0byBvbmx5IGdldCB0aGUgbGFzdCBvbmUgb3V0XG4gICAgcmV0ID0gbm9kZUZhY3Rvcnkgbm9kZU5hbWUsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnlcblxuICAgIGkgKz0gMVxuXG4gXG5cbiAgcmV0XG5cbk9KLm5vZGVzLnJlZ2lzdGVyIG5vZGVOYW1lLCBub2RlXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGVcblxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuXG4jICMgZm9ybVxuXG5ub2RlTmFtZSA9ICdmb3JtJ1xuXG5ub2RlID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSwgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICBhY3Rpb246ICcnXG4gICAgICBtZXRob2Q6ICcnXG4gICAgICBuYW1lOiAnJ1xuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuICByZXQgPSBub2RlRmFjdG9yeSBub2RlTmFtZSwgZGVmYXVsdHMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeVxuXG4gIHJldC5hZGQgJ3ZhbGlkYXRvcicsIHJldC4kLnZhbGlkYXRlKFxuICAgIGhpZ2hsaWdodDogKGVsZW1lbnQpIC0+XG4gICAgICAkZWxtID0gJChlbGVtZW50KVxuICAgICAgJGVsbS5hdHRyICdPSl9pbnZhbGlkJywgJzEnXG4gICAgICAkZWxtLmFuaW1hdGUgYmFja2dyb3VuZENvbG9yOiAncmVkJ1xuICAgICAgbnVsbFxuXG4gICAgdW5oaWdobGlnaHQ6IChlbGVtZW50KSAtPlxuICAgICAgJGVsbSA9ICQoZWxlbWVudClcbiAgICAgIGlmICRlbG0uYXR0cignT0pfaW52YWxpZCcpIGlzICcxJ1xuICAgICAgICAkZWxtLmNzcyAnYmFja2dyb3VuZC1jb2xvcicsICd5ZWxsb3cnXG4gICAgICAgICRlbG0uYXR0ciAnT0pfaW52YWxpZCcsICcwJ1xuICAgICAgICBzZXRUaW1lb3V0ICgtPlxuICAgICAgICAgICRlbG0uYW5pbWF0ZSBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCdcbiAgICAgICAgKSwgNTAwXG4gICAgICBudWxsXG4gIClcblxuICByZXQuYWRkICdpc0Zvcm1WYWxpZCcsIC0+XG4gICAgcmV0LiQudmFsaWQoKSBhbmQgKG5vdCByZXQudmFsaWRhdG9yLmludmFsaWRFbGVtZW50cygpIG9yIHJldC52YWxpZGF0b3IuaW52YWxpZEVsZW1lbnRzKCkubGVuZ3RoIGlzIDApXG5cbiBcblxuICByZXRcblxuT0oubm9kZXMucmVnaXN0ZXIgbm9kZU5hbWUsIG5vZGVcbm1vZHVsZS5leHBvcnRzID0gbm9kZVxuXG5cblxuXG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xubm9kZUZhY3RvcnkgPSByZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5lbnVtcyA9IHJlcXVpcmUgJy4uL3Rvb2xzL2VudW1zJ1xuXG4jICMgaW5wdXRcblxubm9kZU5hbWUgPSAnaW5wdXQnXG5ub2RlID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSwgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiAndGV4dCdcbiAgICAgIHZhbHVlOiAnJ1xuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuICAgICAgY2hhbmdlOiBPSi5ub29wXG4gICAgICBmb2N1c291dDogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIGlmIG5vdCBkZWZhdWx0cy5wcm9wcy50eXBlIG9yIG5vdCBlbnVtcy5pbnB1dFR5cGVzW2RlZmF1bHRzLnByb3BzLnR5cGVdXG4gICAgdGhyb3cgbmV3IEVycm9yICdObyBtYXRjaGluZyBpbnB1dCB0eXBlIGZvciB7JyArIGRlZmF1bHRzLnByb3BzLnR5cGUgKyAnfSBjb3VsZCBiZSBmb3VuZC4nXG4gIHRoaXNUeXBlID0gZW51bXMuaW5wdXRUeXBlc1tkZWZhdWx0cy5wcm9wcy50eXBlXVxuXG4gIHN5bmNWYWx1ZSA9IC0+XG4gICAgc3dpdGNoIHRoaXNUeXBlXG4gICAgICB3aGVuIGVudW1zLmlucHV0VHlwZXMuY2hlY2tib3hcbiAgICAgICAgcmV0LnZhbHVlID0gcmV0LiQuaXMgJzpjaGVja2VkJ1xuICAgICAgd2hlbiBlbnVtcy5pbnB1dFR5cGVzLnJhZGlvXG4gICAgICAgIHJldC52YWx1ZSA9IHJldC4kLmZpbmQoJzpjaGVja2VkJykudmFsKClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0LnZhbHVlID0gcmV0LnZhbCgpXG4gICAgZGVmYXVsdHMucHJvcHMudmFsdWUgPSByZXQudmFsdWUgICAgXG4gICAgcmV0LnZhbHVlXG5cbiAgIyMjXG4gICAgQ2xpY2sgYmluZGluZy4gSWYgdGhlIGNhbGxlciBkZWZpbmVkIGEgY2xpY2sgaGFuZGxlcixcbiAgICB3cmFwIGl0LCBzeW5jIHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQgZmlyc3QsXG4gICAgdGhlbiBjYWxsIHRoZSBkZWZpbmVkIGNsaWNrIGhhbmRsZXIgd2l0aCB0aGUgbGF0ZXN0IHZhbHVlLlxuICAjIyNcbiAgb2xkQ2xpY2sgPSBkZWZhdWx0cy5ldmVudHMuY2xpY2tcbiAgaWYgb2xkQ2xpY2sgYW5kIG9sZENsaWNrIGlzbnQgT0oubm9vcFxuICAgIG5ld0NsaWNrID0gKGV2ZW50Li4uKSAtPlxuICAgICAgc3luY1ZhbHVlKClcbiAgICAgIG9sZENsaWNrIHJldC52YWx1ZSwgZXZlbnQuLi5cbiAgICBkZWZhdWx0cy5ldmVudHMuY2xpY2sgPSBuZXdDbGlja1xuXG4gICMjI1xuICAgIENoYW5nZSBiaW5kaW5nLiBJZiB0aGUgY2FsbGVyIGRlZmluZWQgYSBjaGFuZ2UgaGFuZGxlcixcbiAgICB3cmFwIGl0LCBzeW5jIHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQgZmlyc3QsXG4gICAgdGhlbiBjYWxsIHRoZSBkZWZpbmVkIGNoYW5nZSBoYW5kbGVyIHdpdGggdGhlIGxhdGVzdCB2YWx1ZS5cbiAgIyMjXG4gIG9sZENoYW5nZSA9IGRlZmF1bHRzLmV2ZW50cy5jaGFuZ2VcbiAgaWYgb2xkQ2hhbmdlIGFuZCBvbGRDaGFuZ2UgaXNudCBPSi5ub29wXG4gICAgbmV3Q2hhbmdlID0gKGV2ZW50Li4uKSAtPlxuICAgICAgc3luY1ZhbHVlKClcbiAgICAgIG9sZENoYW5nZSByZXQudmFsdWUsIGV2ZW50Li4uXG4gICAgZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSA9IG5ld0NoYW5nZVxuXG4gICMjI1xuICAgIE9uIEZvY3VzIE91dCBiaW5kaW5nLiBBbHdheXMgdXNlIHRoZSBldmVudCB0byB1cGRhdGUgdGhlIGludGVybmFsXG4gICAgdmFsdWUgb2YgdGhlIGNvbnRyb2w7IGFuZCBpZiB0aGUgY2FsbGVyIGRlZmluZWQgYSBmb2N1c291dCBldmVudCxcbiAgICB3cmFwIGl0IGFuZCBpbnZva2UgaXQgd2l0aCB0aGUgbGF0ZXN0IHZhbHVlXG4gICMjI1xuICBvbGRGb2N1c291dCA9IGRlZmF1bHRzLmV2ZW50cy5mb2N1c291dFxuICBuZXdGb2N1c291dCA9IChldmVudC4uLikgLT5cbiAgICBzeW5jVmFsdWUoKVxuICAgIGlmIG9sZEZvY3Vzb3V0IGFuZCBvbGRGb2N1c291dCBpc250IE9KLm5vb3BcbiAgICAgIG9sZEZvY3Vzb3V0IHJldC52YWx1ZSwgZXZlbnQuLi5cblxuICBkZWZhdWx0cy5ldmVudHMuZm9jdXNvdXQgPSBuZXdGb2N1c291dFxuXG5cbiAgcmV0ID0gbm9kZUZhY3Rvcnkgbm9kZU5hbWUsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnlcbiAgcmV0LnZhbHVlID0gZGVmYXVsdHMucHJvcHMudmFsdWVcbiAgcmV0XG5cbk9KLm5vZGVzLnJlZ2lzdGVyIG5vZGVOYW1lLCBub2RlXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGUiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xubm9kZUZhY3RvcnkgPSByZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5cbiMgIyBvbFxuXG5ub2RlTmFtZSA9ICdvbCdcblxubm9kZSA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHksIGNhbGxlZEZyb21GYWN0b3J5ID0gZmFsc2UpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOiB7fVxuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuICByZXQgPSBub2RlRmFjdG9yeSBub2RlTmFtZSwgZGVmYXVsdHMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeVxuXG5cbiBcblxuICByZXRcblxuT0oubm9kZXMucmVnaXN0ZXIgbm9kZU5hbWUsIG5vZGVcbm1vZHVsZS5leHBvcnRzID0gbm9kZSIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5ub2RlRmFjdG9yeSA9IHJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcblxuIyAjIHNlbGVjdFxuXG5ub2RlTmFtZSA9ICdzZWxlY3QnXG5cbm5vZGUgPSAob3B0aW9ucywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5ID0gZmFsc2UpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgc2VsZWN0ZWQ6ICcnXG4gICAgICBtdWx0aXBsZTogZmFsc2VcbiAgICBzdHlsZXM6IHt9XG4gICAgdmFsdWVzOiBbXVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG4gICAgICBjaGFuZ2U6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICB2YWx1ZSA9ICcnXG4gIHZhbHVlcyA9IFtdXG4gIGhhc0VtcHR5ID0gZmFsc2VcblxuICBzeW5jVmFsdWUgPSAtPlxuICAgIHZhbHVlID0gcmV0LnZhbCgpXG5cbiAgIyBDbGljayBiaW5kaW5nXG4gIGlmIGRlZmF1bHRzLmV2ZW50cy5jbGljayBpc250IE9KLm5vb3BcbiAgICBjbGljayA9IGRlZmF1bHRzLmV2ZW50cy5jbGlja1xuICAgIG5ld0NsaWNrID0gKGV2ZW50Li4uKSAtPlxuICAgICAgcmV0dmFsID0gY2xpY2sgZXZlbnQuLi5cbiAgICAgIHN5bmNWYWx1ZSgpXG4gICAgICByZXR2YWxcbiAgICBkZWZhdWx0cy5ldmVudHMuY2xpY2sgPSBuZXdDbGlja1xuXG4gICMgQ2hhbmdlIGJpbmRpbmdcbiAgaWYgZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSBpc250IE9KLm5vb3BcbiAgICBjaGFuZ2UgPSBkZWZhdWx0cy5ldmVudHMuY2hhbmdlXG4gICAgbmV3Q2hhbmdlID0gKGV2ZW50Li4uKSAtPlxuICAgICAgcmV0dmFsID0gY2hhbmdlIGV2ZW50Li4uXG4gICAgICBzeW5jVmFsdWUoKVxuICAgICAgcmV0dmFsXG4gICAgZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSA9IG5ld0NoYW5nZVxuXG4gIHJldCA9IG5vZGVGYWN0b3J5IG5vZGVOYW1lLCBkZWZhdWx0cywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5XG5cbiAgcmV0LmFkZCAnc2VsZWN0ZWREYXRhJywgKHByb3BOYW1lKSAtPlxuICAgIHJldCA9ICcnXG4gICAgaWYgcmV0LiQuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykgYW5kIHJldC4kLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpWzBdXG4gICAgICBkYXRhc2V0ID0gcmV0LiQuZmluZCgnb3B0aW9uOnNlbGVjdGVkJylbMF0uZGF0YXNldFxuICAgICAgcmV0ID0gZGF0YXNldFtwcm9wTmFtZV0gIGlmIGRhdGFzZXRcbiAgICByZXRcblxuICByZXQuYWRkICdzZWxlY3RlZFRleHQnLCAtPlxuICAgIHJldC4kLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLnRleHQoKVxuXG4gIHJldC5hZGQgJ3NlbGVjdGVkVmFsJywgLT5cbiAgICB2YWx1ZSA9IHJldC52YWwoKVxuICAgIHZhbHVlXG5cbiAgcmV0LmFkZCAnYWRkT3B0aW9uJywgKHZhbHVlLCB0ZXh0ID0gdmFsdWUsIHNlbGVjdGVkID0gZmFsc2UsIGRpc2FibGVkID0gZmFsc2UpIC0+XG4gICAgaXNFbXB0eSA9IF8uaXNFbXB0eSB2YWx1ZVxuICAgIGFkZCA9IGZhbHNlXG4gICAgaWYgaXNFbXB0eSBhbmQgZmFsc2UgaXMgaGFzRW1wdHlcbiAgICAgIGhhc0VtcHR5ID0gdHJ1ZVxuICAgICAgYWRkID0gdHJ1ZVxuICAgIGlmIGZhbHNlIGlzIGFkZCBhbmQgZmFsc2UgaXMgaXNFbXB0eSB0aGVuIGFkZCA9IHRydWVcbiAgICBpZiBhZGRcbiAgICAgIHZhbCA9XG4gICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgcHJvcHM6XG4gICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICBpZiBzZWxlY3RlZFxuICAgICAgICB2YWwuc2VsZWN0ZWQgPSBzZWxlY3RlZFxuICAgICAgaWYgZGlzYWJsZWRcbiAgICAgICAgdmFsLmRpc2FibGVkID0gZGlzYWJsZWRcbiAgICAgIG9wdGlvbiA9IHJldC5tYWtlICdvcHRpb24nLCB2YWxcbiAgICAgIG9wdGlvblxuXG4gIHJldC5hZGQgJ2FkZE9wdGlvbnMnLCAob3B0aW9ucykgLT5cbiAgICB2YWx1ZXMgPSBfLnVuaW9uIHZhbHVlcywgb3B0aW9uc1xuICAgIE9KLmVhY2ggb3B0aW9ucywgKCh2YWwpIC0+XG4gICAgICB2YWx1ZSA9IHJldC5hZGRPcHRpb24odmFsKVxuICAgICAgdmFsdWVzLnB1c2ggdmFsdWVcbiAgICApLCBmYWxzZVxuICAgIHZhbHVlc1xuXG4gIHJldC5hZGQgJ3Jlc2V0T3B0aW9ucycsICh2YWx1ZXMpIC0+XG4gICAgcmV0LmVtcHR5KClcbiAgICB2YWx1ZXMgPSB2YWx1ZXNcbiAgICByZXQuYWRkT3B0aW9ucyB2YWx1ZXNcbiAgICByZXRcblxuICByZXQuYWRkICdyZW1vdmVPcHRpb24nLCAodmFsdWVUb1JlbW92ZSkgLT5cbiAgICB2YWx1ZXMuc3BsaWNlIHZhbHVlcy5pbmRleE9mKHZhbHVlVG9SZW1vdmUpLCAxICNyZW1vdmVzIHRoZSBpdGVtIGZyb20gdGhlIGxpc3RcbiAgICBzZWxlY3RDb250cm9sID0gcmV0WzBdXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzZWxlY3RDb250cm9sLmxlbmd0aFxuICAgICAgc2VsZWN0Q29udHJvbC5yZW1vdmUgaSAgaWYgc2VsZWN0Q29udHJvbC5vcHRpb25zW2ldLnZhbHVlIGlzIHZhbHVlVG9SZW1vdmVcbiAgICAgIGkrK1xuICAgIG51bGxcblxuXG5cbiAgaWYgZGVmYXVsdHMudmFsdWVzLmxlbmd0aCA+IDBcbiAgICByZXQuYWRkT3B0aW9ucyBkZWZhdWx0cy52YWx1ZXNcblxuIFxuXG4gIHJldFxuXG5PSi5ub2Rlcy5yZWdpc3RlciBub2RlTmFtZSwgbm9kZVxubW9kdWxlLmV4cG9ydHMgPSBub2RlIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbmFycmF5MkQgPSByZXF1aXJlICcuLi90b29scy9hcnJheTJEJ1xuJCA9IHJlcXVpcmUgJ2pxdWVyeSdcbkpzb25Ub1RhYmxlID0gcmVxdWlyZSAnLi4vdG9vbHMvSnNvblRvVGFibGUnXG5cbiMgIyB0YWJsZVxuXG5ub2RlTmFtZSA9ICd0YWJsZSdcblxuIyMjXG5DcmVhdGUgYW4gSFRNTCB0YWJsZS4gUHJvdmlkZXMgaGVscGVyIG1ldGhvZHMgdG8gY3JlYXRlIENvbHVtbnMgYW5kIENlbGxzLlxuIyMjXG5ub2RlID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSwgY2FsbGVkRnJvbUZhY3RvcnkgPSBmYWxzZSkgLT5cblxuICAjICMjIG9wdGlvbnNcbiAgZGVmYXVsdHMgPVxuICAgICMgIyMjIGRhdGFcbiAgICAjIG9wdGlvbmFsIGFycmF5IG9mIG9iamVjdHMuIGlmIHByb3ZpZGVkIHdpbGwgZ2VuZXJhdGUgdGFibGUgYXV0b21hdGljYWxseS5cbiAgICBkYXRhOiBudWxsXG4gICAgIyAjIyMgcHJvcHNcbiAgICAjIG9wdGlvbmFsIHByb3BlcnRpZXMgdG8gYXBwbHkgdG8gdGFibGUgcm9vdCBub2RlXG4gICAgcHJvcHM6XG4gICAgICBjZWxscGFkZGluZzogMFxuICAgICAgY2VsbHNwYWNpbmc6IDBcbiAgICAgIGFsaWduOiAnJ1xuICAgICAgd2lkdGg6ICcnXG4gICAgICBjZWxsYWxpZ246ICdsZWZ0J1xuICAgICAgY2VsbHZhbGlnbjogJ3RvcCdcbiAgICAgIGNsYXNzOiAnJ1xuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6IHt9XG4gICAgIyAjIyMgY2VsbHNcbiAgICAjIG9wdGlvbmFsIHByb3BlcnRpZXMgdG8gYXBwbHkgdG8gaW5kaXZpZHVhbCBjZWxsc1xuICAgIGNlbGxzOlxuICAgICAgY2xhc3M6ICcnXG4gICAgICBhbGlnbjogJydcbiAgICAgICd2ZXJ0aWNhbC1hbGlnbic6ICcnXG4gICAgICBjZWxscGFkZGluZzogJydcbiAgICAgIG1hcmdpbjogJydcbiAgICAjICMjIyB0aGVhZFxuICAgICMgb3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdG8gcGFzcyBpbnRvIHRoZWFkIGNyZWF0aW9uXG4gICAgdGhlYWQ6IHt9XG4gICAgIyAjIyMgdGJvZHlcbiAgICAjIG9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRvIHBhc3MgaW50byB0Ym9keSBjcmVhdGlvblxuICAgIHRib2R5OiB7fVxuXG4gICAgZmlyc3RBbGlnblJpZ2h0OiBmYWxzZVxuICAgIG9kZEFsaWduUmlnaHQ6IGZhbHNlXG5cbiAgcm93cyA9IFtdXG4gIGNlbGxzID0gYXJyYXkyRCgpXG4gIGNvbHVtbkNvdW50ID0gMFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuICByZXQgPSBub2RlRmFjdG9yeSBub2RlTmFtZSwgZGVmYXVsdHMsIG93bmVyLCBjYWxsZWRGcm9tRmFjdG9yeVxuIFxuXG4gIHRib2R5ID0gbnVsbFxuICB0aGVhZCA9IG51bGxcbiAgdGhlYWRSb3cgPSBudWxsXG5cbiAgIyAjIyMgaW5pdFxuICAjIGludGVybmFsIG1ldGhvZCBmb3Igb25lIHRpbWUgaW5pdGlhbGl6YXRpb24gb2YgdGhlIHRhYmxlXG4gIGluaXQgPSBfLm9uY2UgLT5cbiAgICBpZiBkZWZhdWx0cy5kYXRhXG4gICAgICBqMnQgPSBuZXcgSnNvblRvVGFibGUgZGVmYXVsdHMuZGF0YVxuICAgICAgdGJsU3RyID0gajJ0LnRhYmxlXG4gICAgaWYgdGJsU3RyXG4gICAgICBqVGJsID0gJCB0YmxTdHJcblxuICAgICAgakhlYWQgPSBqVGJsLmZpbmQgJ3RoZWFkJ1xuICAgICAgcmV0LiQuYXBwZW5kIGpIZWFkXG4gICAgICB0aGVhZCA9IGVsLnJlc3RvcmVFbGVtZW50IGpIZWFkWzBdXG4gICAgICB0aGVhZFJvdyA9IGVsLnJlc3RvcmVFbGVtZW50IHRoZWFkWzBdLnJvd3NbMF1cblxuICAgICAgakJvZHkgPSBqVGJsLmZpbmQgJ3Rib2R5J1xuICAgICAgcmV0LiQuYXBwZW5kIGpCb2R5XG4gICAgICB0Ym9keSA9IGVsLnJlc3RvcmVFbGVtZW50IGpCb2R5WzBdXG5cbiAgICAgIGxvYWRDZWxscygpXG4gICAgZWxzZVxuICAgICAgdGhlYWQgPSByZXQubWFrZSAndGhlYWQnLCBkZWZhdWx0cy50aGVhZFxuICAgICAgdGhlYWRSb3cgPSB0aGVhZC5tYWtlICd0cidcbiAgICAgIHRib2R5ID0gcmV0Lm1ha2UgJ3Rib2R5JywgZGVmYXVsdHMudGJvZHlcbiAgICAgIHJvd3MucHVzaCB0Ym9keS5tYWtlICd0cidcbiAgICByZXRcblxuICAjICMjIyBsb2FkQ2VsbHNcbiAgIyBpbnRlcm5hbCBtZXRob2QgZ3VhcmFudGVlcyB0aGF0IHRhYmxlcyBsb2FkZWQgZnJvbSBKU09OIGFyZSBmdWxseSBsb2FkZWQgaW50byBtZW1vcnlcbiAgbG9hZENlbGxzID0gKCkgLT5cbiAgICByID0gMFxuICAgIHdoaWxlIHRib2R5WzBdLnJvd3MubGVuZ3RoID4gclxuICAgICAgYyA9IDBcbiAgICAgIG1lbVJvdyA9IGVsLnJlc3RvcmVFbGVtZW50IHRib2R5WzBdLnJvd3Nbcl1cbiAgICAgIHJvd3MucHVzaCBtZW1Sb3dcbiAgICAgIHdoaWxlIHRib2R5WzBdLnJvd3Nbcl0uY2VsbHMubGVuZ3RoID4gY1xuICAgICAgICBtZW1DZWxsID0gY2VsbHMuZ2V0IHIrMSwgYysxXG4gICAgICAgIGlmIG5vdCBtZW1DZWxsXG4gICAgICAgICAgbWVtQ2VsbCA9IGVsLnJlc3RvcmVFbGVtZW50IHRib2R5WzBdLnJvd3Nbcl0uY2VsbHNbY11cbiAgICAgICAgICBjZWxscy5zZXQgcisxLCBjKzEsIG1lbUNlbGxcbiAgICAgICAgYyArPSAxXG4gICAgICByICs9IDFcblxuICAjICMjIyBmaWxsTWlzc2luZ1xuICAjIGludGVybmFsIG1ldGhvZCBndWFyYW50ZWVzIHRoYXQgY2VsbHMgZXhpc3QgZm9yIHRoZSBkaW1lbnNpb25zIG9mIHRoZSB0YWJsZVxuICBmaWxsTWlzc2luZyA9ICgpIC0+XG4gICAgY2VsbHMuZWFjaCAocm93Tm8sIGNvbE5vLCB2YWwpIC0+XG4gICAgICBpZiBub3QgdmFsXG4gICAgICAgIHJvdyA9IHJldC5yb3cgcm93Tm9cbiAgICAgICAgcm93LmNlbGwgY29sTm8sIHt9XG5cbiAgIyAjIyBjb2x1bW5cbiAgIyBBZGRzIGEgY29sdW1uIG5hbWUgdG8gdGhlIHRhYmxlIGhlYWRcbiAgcmV0LmFkZCAnY29sdW1uJywgKGNvbE5vLCBjb2xOYW1lKSAtPlxuICAgIHJldC5pbml0KClcbiAgICBjb2x1bW5Db3VudCArPSAxXG4gICAgdGggPSBudWxsXG4gICAgaSA9IDBcbiAgICB3aGlsZSB0aGVhZFswXS5yb3dzWzBdLmNlbGxzLmxlbmd0aCA8IGNvbE5vXG4gICAgICBuYXRpdmVUaCA9IHRoZWFkWzBdLnJvd3NbMF0uY2VsbHNbaV1cbiAgICAgIGlmIG5vdCBuYXRpdmVUaFxuICAgICAgICB0aCA9IHRoZWFkUm93Lm1ha2UgJ3RoJywge31cbiAgICAgIGVsc2VcbiAgICAgICAgdGggPSBlbC5yZXN0b3JlRWxlbWVudCBuYXRpdmVUaCwgJ3RoJ1xuICAgICAgaSArPSAxXG4gICAgaWYgbm90IHRoXG4gICAgICBuYXRpdmVUaCA9IHRoZWFkWzBdLnJvd3NbMF0uY2VsbHNbY29sTm8tMV1cbiAgICAgIHRoID0gZWwucmVzdG9yZUVsZW1lbnQgbmF0aXZlVGgsICd0aCdcbiAgICB0aC50ZXh0IGNvbE5hbWVcbiAgICB0aFxuXG4gICMgIyMgcm93XG4gICMgQWRkcyBhIG5ldyByb3cgKHRyKSB0byB0aGUgdGFibGUgYm9keVxuICByZXQuYWRkICdyb3cnLCAocm93Tm8sIG9wdHMpIC0+XG4gICAgcm93ID0gcm93c1tyb3dOby0xXVxuXG4gICAgaWYgbm90IHJvd1xuICAgICAgd2hpbGUgcm93cy5sZW5ndGggPCByb3dOb1xuICAgICAgICByb3cgPSB0Ym9keS5tYWtlICd0cicsIHt9XG4gICAgICAgIHJvd3MucHVzaCByb3dcblxuICAgIGlmIG5vdCByb3cuY2VsbFxuICAgICAgcm93LmFkZCAnY2VsbCcsIChjb2xObywgb3B0cykgLT5cbiAgICAgICAgY2VsbCA9IE9KLm5vZGVzLnRkIG9wdHMsIHJvd1xuICAgICAgICBjZWxscy5zZXQgcm93Tm8sIGNvbE5vLCBjZWxsXG4gICAgICAgIGNlbGxcblxuICAgIHJvd1xuXG4gICMgIyMgY2VsbFxuICAjIEFkZHMgYSBjZWxsICh0ci90ZCkgdG8gdGhlIHRhYmxlIGJvZHlcbiAgcmV0LmFkZCAnY2VsbCcsIChyb3dObywgY29sTm8sIG9wdHMpIC0+XG4gICAgaWYgcm93Tm8gPCAxIHRoZW4gcm93Tm8gPSAxXG4gICAgaWYgY29sTm8gPCAxIHRoZW4gY29sTm8gPSAxXG4gICAgaWYgY29sdW1uQ291bnQgPiAwIGFuZCBjb2xOby0xID4gY29sdW1uQ291bnQgdGhlbiB0aHJvdyBuZXcgRXJyb3IgJ0EgY29sdW1uIG5hbWUgaGFzIG5vdCBiZWVuIGRlZmluZWQgZm9yIHRoaXMgcG9zaXRpb24geycgKyByb3dObyArICd4JyArIGNvbE5vICsgJ30uJ1xuXG4gICAgcm93ID0gcmV0LnJvdyByb3dOb1xuXG4gICAgY2VsbCA9IGNlbGxzLmdldCByb3dObywgY29sTm9cblxuICAgIGlmIG5vdCBjZWxsXG4gICAgICBpID0gMFxuICAgICAgd2hpbGUgaSA8IGNvbE5vXG4gICAgICAgIGkgKz0gMVxuICAgICAgICBpZiBpIGlzIGNvbE5vXG4gICAgICAgICAgbnVPcHRzID0gT0ouZXh0ZW5kIHtwcm9wczogZGVmYXVsdHMuY2VsbHN9LCBvcHRzXG4gICAgICAgICAgY2VsbCA9IHJvdy5jZWxsIGNvbE5vLCBudU9wdHNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRyeUNlbGwgPSBjZWxscy5nZXQgcm93Tm8sIGlcbiAgICAgICAgICBpZiBub3QgdHJ5Q2VsbFxuICAgICAgICAgICAgdHJ5Q2VsbCA9ICByb3cuY2VsbCBpLCBwcm9wczogZGVmYXVsdHMuY2VsbHNcblxuICAgIGNlbGxcblxuICAjICMjIEZpbmFsaXplXG4gICMgRmluYWxpemUgZ3VhcmFudGVlcyB0aGF0IHRoZWFkIGFuZCB0Ym9keSBhbmQgY3JlYXRlZCB3aGVuIHRoZSBub2RlIGlzIGZ1bGx5IGluc3RhbnRpYXRlZFxuICBpbml0KClcblxuICAjICMjIFRIZWFkXG4gICMgRXhwb3NlIHRoZSBpbnRlcm5hbCB0aGVhZCBub2RlXG4gIHJldC5hZGQgJ3RoZWFkJywgdGhlYWRcblxuICAjICMjIFRCb2R5XG4gICMgRXhwb3NlIHRoZSBpbnRlcm5hbCB0Ym9keSBub2RlXG4gIHJldC5hZGQgJ3Rib2R5JywgdGJvZHlcblxuICAgIFxuXG4gIHJldFxuXG5PSi5ub2Rlcy5yZWdpc3RlciBub2RlTmFtZSwgbm9kZVxubW9kdWxlLmV4cG9ydHMgPSBub2RlXG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xubm9kZUZhY3RvcnkgPSByZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5lbnVtcyA9IHJlcXVpcmUgJy4uL3Rvb2xzL2VudW1zJ1xuXG5ub2RlTmFtZSA9ICd0ZXh0YXJlYSdcblxubm9kZSA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHksIGNhbGxlZEZyb21GYWN0b3J5ID0gZmFsc2UpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgbmFtZTogJydcbiAgICAgIHBsYWNlaG9sZGVyOiAnJ1xuICAgICAgdmFsdWU6ICcnXG4gICAgICB0ZXh0OiAnJ1xuICAgICAgbWF4bGVuZ3RoOiAnJ1xuICAgICAgYXV0b2ZvY3VzOiBmYWxzZVxuICAgICAgaXNSZXF1aXJlZDogZmFsc2VcbiAgICAgIHJvd3M6IDNcbiAgICAgIGNvbHM6IDI1XG4gICAgICBkaXNhYmxlZDogZmFsc2VcbiAgICAgIHJlYWRvbmx5OiBmYWxzZVxuICAgICAgZm9ybTogJydcbiAgICAgIHdyYXA6ICcnXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgdmFsdWUgPSBkZWZhdWx0cy5wcm9wcy52YWx1ZVxuXG4gIHN5bmNWYWx1ZSA9IC0+XG4gICAgc3dpdGNoIGRlZmF1bHRzLnByb3BzLnR5cGVcbiAgICAgIHdoZW4gZW51bXMuaW5wdXRUeXBlcy5jaGVja2JveFxuICAgICAgICB2YWx1ZSA9IHJldC4kLmlzKCc6Y2hlY2tlZCcpXG4gICAgICB3aGVuIGVudW1zLmlucHV0VHlwZXMucmFkaW9cbiAgICAgICAgdmFsdWUgPSByZXQuJC5maW5kKCc6Y2hlY2tlZCcpLnZhbCgpXG4gICAgICBlbHNlXG4gICAgICAgIHZhbHVlID0gcmV0LnZhbCgpXG5cbiAgIyBDbGljayBiaW5kaW5nXG4gIGlmIGRlZmF1bHRzLmV2ZW50cy5jbGljayBpc250IE9KLm5vb3BcbiAgICBjbGljayA9IGRlZmF1bHRzLmV2ZW50cy5jbGlja1xuICAgIG5ld0NsaWNrID0gKGV2ZW50Li4uKSAtPlxuICAgICAgcmV0dmFsID0gY2xpY2sgZXZlbnQuLi5cbiAgICAgIHN5bmNWYWx1ZSgpXG4gICAgICByZXR2YWxcbiAgICBkZWZhdWx0cy5ldmVudHMuY2xpY2sgPSBuZXdDbGlja1xuXG4gICMgQ2hhbmdlIGJpbmRpbmdcbiAgaWYgZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSBpc250IE9KLm5vb3BcbiAgICBjaGFuZ2UgPSBkZWZhdWx0cy5ldmVudHMuY2hhbmdlXG4gICAgbmV3Q2hhbmdlID0gKGV2ZW50Li4uKSAtPlxuICAgICAgcmV0dmFsID0gY2hhbmdlIGV2ZW50Li4uXG4gICAgICBzeW5jVmFsdWUoKVxuICAgICAgcmV0dmFsXG4gICAgZGVmYXVsdHMuZXZlbnRzLmNoYW5nZSA9IG5ld0NoYW5nZVxuXG4gIHJldCA9IG5vZGVGYWN0b3J5IG5vZGVOYW1lLCBkZWZhdWx0cywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5XG5cblxuIFxuXG4gIHJldFxuXG5PSi5ub2Rlcy5yZWdpc3RlciBub2RlTmFtZSwgbm9kZVxubW9kdWxlLmV4cG9ydHMgPSBub2RlIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbm5vZGVGYWN0b3J5ID0gcmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuXG5ub2RlTmFtZSA9ICd0aGVhZCdcblxubm9kZSA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHksIGNhbGxlZEZyb21GYWN0b3J5ID0gZmFsc2UpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOiB7fVxuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuICAgIG51bWJlcjogMVxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IG5vZGVGYWN0b3J5IG5vZGVOYW1lLCBkZWZhdWx0cywgb3duZXIsIGNhbGxlZEZyb21GYWN0b3J5XG5cbiAgcm93cyA9IFtdXG4gIGNlbGxzID0ge31cbiAgcmV0LmFkZCAnY2VsbCcsIChyb3dObywgY29sTm8pIC0+XG4gICAgaW5pdCgpXG5cbiAgICBpZiByb3dObyA8IDEgdGhlbiByb3dObyA9IDFcbiAgICBpZiBjb2xObyA8IDEgdGhlbiBjb2xObyA9IDFcblxuICAgIHJvdyA9IHJvd3Nbcm93Tm8tMV1cblxuICAgIGlmIG5vdCByb3dcbiAgICAgIHdoaWxlIHJvd3MubGVuZ3RoIDwgcm93Tm9cbiAgICAgICAgcm93ID0gT0oubm9kZXMudHIge30sIHRib2R5LCBmYWxzZVxuICAgICAgICByb3dzLnB1c2ggcm93XG5cbiAgICB0ZCA9IHJvd1swXS5jZWxsc1tjb2xOb11cblxuICAgIGlmIHRkIHRoZW4gY2VsbCA9IGVsLnJlc3RvcmVFbGVtZW50IHRkLCAndGQnXG4gICAgaWYgbm90IHRkXG4gICAgICB3aGlsZSByb3dbMF0uY2VsbHMubGVuZ3RoIDwgY29sTm9cbiAgICAgICAgaWR4ID0gcm93WzBdLmNlbGxzLmxlbmd0aFxuICAgICAgICB0ZCA9IHJvd1swXS5jZWxsc1tpZHgtMV1cbiAgICAgICAgaWYgdGQgYW5kIGlkeCBpcyBjb2xOb1xuICAgICAgICAgIGNlbGwgPSBlbC5yZXN0b3JlRWxlbWVudCB0ZCwgJ3RkJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgY2VsbCA9IE9KLm5vZGVzLnRkIHByb3BzOiBkZWZhdWx0cy5jZWxscywgcm93LCBmYWxzZVxuXG4gICAgaWYgbm90IGNlbGwuaXNWYWxpZFxuICAgICAgbm9kZUZhY3RvcnkgY2VsbCwgcm93LCByb3dObyArIGNvbE5vXG5cbiAgICBjZWxsXG5cbiAgcmV0XG5cbk9KLm5vZGVzLnJlZ2lzdGVyIG5vZGVOYW1lLCBub2RlXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGVcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5ub2RlRmFjdG9yeSA9IHJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcblxubm9kZU5hbWUgPSAndWwnXG5cbm5vZGUgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5LCBjYWxsZWRGcm9tRmFjdG9yeSA9IGZhbHNlKSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczoge31cbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcbiAgcmV0ID0gbm9kZUZhY3Rvcnkgbm9kZU5hbWUsIGRlZmF1bHRzLCBvd25lciwgY2FsbGVkRnJvbUZhY3RvcnlcblxuXG4gXG5cbiAgcmV0XG5cbk9KLm5vZGVzLnJlZ2lzdGVyIG5vZGVOYW1lLCBub2RlXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGUiLCJyZXF1aXJlICcuL29qJ1xucmVxdWlyZSAnLi9vakluaXQnXG5yZXF1aXJlICcuL2FzeW5jL2FqYXgnXG5yZXF1aXJlICcuL2FzeW5jL3Byb21pc2UnXG5yZXF1aXJlICcuL2NvbXBvbmVudHMvZ3JpZCdcbnJlcXVpcmUgJy4vY29tcG9uZW50cy9pbnB1dGdyb3VwJ1xucmVxdWlyZSAnLi9jb21wb25lbnRzL3RhYnMnXG5yZXF1aXJlICcuL2NvbXBvbmVudHMvdGlsZSdcbnJlcXVpcmUgJy4vY29udHJvbHMvaWNvbidcbnJlcXVpcmUgJy4vY29yZS9kYXRlJ1xucmVxdWlyZSAnLi9jb3JlL2Z1bmN0aW9uJ1xucmVxdWlyZSAnLi9jb3JlL251bWJlcidcbnJlcXVpcmUgJy4vY29yZS9vYmplY3QnXG5yZXF1aXJlICcuL2NvcmUvc3RyaW5nJ1xucmVxdWlyZSAnLi9kb20vbm9kZUZhY3RvcnknXG5yZXF1aXJlICcuL2RvbS9ib2R5J1xucmVxdWlyZSAnLi9kb20vY29tcG9uZW50J1xucmVxdWlyZSAnLi9kb20vY29udHJvbCdcbnJlcXVpcmUgJy4vZG9tL25vZGUnXG5yZXF1aXJlICcuL2RvbS9lbGVtZW50J1xucmVxdWlyZSAnLi9kb20vZnJhZ21lbnQnXG5yZXF1aXJlICcuL2RvbS9nZW5lcmljcydcbnJlcXVpcmUgJy4vZG9tL2lucHV0J1xucmVxdWlyZSAnLi9lbGVtZW50cy9hJ1xucmVxdWlyZSAnLi9lbGVtZW50cy9icidcbnJlcXVpcmUgJy4vZWxlbWVudHMvZm9ybSdcbnJlcXVpcmUgJy4vZWxlbWVudHMvaW5wdXQnXG5yZXF1aXJlICcuL2VsZW1lbnRzL29sJ1xucmVxdWlyZSAnLi9lbGVtZW50cy9zZWxlY3QnXG5yZXF1aXJlICcuL2VsZW1lbnRzL3RhYmxlJ1xucmVxdWlyZSAnLi9lbGVtZW50cy90ZXh0YXJlYSdcbnJlcXVpcmUgJy4vZWxlbWVudHMvdGhlYWQnXG5yZXF1aXJlICcuL2VsZW1lbnRzL3VsJ1xucmVxdWlyZSAnLi9pbnB1dHMvYnV0dG9uaW5wdXQnXG5yZXF1aXJlICcuL2lucHV0cy9jaGVja2JveCdcbnJlcXVpcmUgJy4vaW5wdXRzL2NvbG9yJ1xucmVxdWlyZSAnLi9pbnB1dHMvZGF0ZSdcbnJlcXVpcmUgJy4vaW5wdXRzL2RhdGV0aW1lJ1xucmVxdWlyZSAnLi9pbnB1dHMvZGF0ZXRpbWVsb2NhbCdcbnJlcXVpcmUgJy4vaW5wdXRzL2VtYWlsJ1xucmVxdWlyZSAnLi9pbnB1dHMvZmlsZSdcbnJlcXVpcmUgJy4vaW5wdXRzL2hpZGRlbidcbnJlcXVpcmUgJy4vaW5wdXRzL2ltYWdlaW5wdXQnXG5yZXF1aXJlICcuL2lucHV0cy9tb250aCdcbnJlcXVpcmUgJy4vaW5wdXRzL251bWJlcidcbnJlcXVpcmUgJy4vaW5wdXRzL3Bhc3N3b3JkJ1xucmVxdWlyZSAnLi9pbnB1dHMvcmFkaW8nXG5yZXF1aXJlICcuL2lucHV0cy9yYW5nZSdcbnJlcXVpcmUgJy4vaW5wdXRzL3Jlc2V0J1xucmVxdWlyZSAnLi9pbnB1dHMvc2VhcmNoJ1xucmVxdWlyZSAnLi9pbnB1dHMvc3VibWl0J1xucmVxdWlyZSAnLi9pbnB1dHMvdGVsJ1xucmVxdWlyZSAnLi9pbnB1dHMvdGV4dGlucHV0J1xucmVxdWlyZSAnLi9pbnB1dHMvdGltZSdcbnJlcXVpcmUgJy4vaW5wdXRzL3VybCdcbnJlcXVpcmUgJy4vaW5wdXRzL3dlZWsnXG5yZXF1aXJlICcuL3Rvb2xzL2FycmF5MkQnXG5yZXF1aXJlICcuL3Rvb2xzL2NvbnNvbGUnXG5yZXF1aXJlICcuL3Rvb2xzL2Nvb2tpZSdcbnJlcXVpcmUgJy4vdG9vbHMvZGVmZXInXG5yZXF1aXJlICcuL3Rvb2xzL2VhY2gnXG5yZXF1aXJlICcuL3Rvb2xzL2VudW1zJ1xucmVxdWlyZSAnLi90b29scy9pcydcbnJlcXVpcmUgJy4vdG9vbHMvbm90eSdcbnJlcXVpcmUgJy4vdG9vbHMvcHVic3ViJ1xucmVxdWlyZSAnLi90b29scy9xdWVyeVN0cmluZydcbnJlcXVpcmUgJy4vdG9vbHMvcmFuZ2VzJ1xucmVxdWlyZSAnLi90b29scy90bydcbnJlcXVpcmUgJy4vdG9vbHMvdXVpZCdcbiIsInRoaXNHbG9iYWwgPSAoaWYgKHR5cGVvZiBnbG9iYWwgaXNudCAndW5kZWZpbmVkJyBhbmQgZ2xvYmFsKSB0aGVuIGdsb2JhbCBlbHNlIChpZiAodHlwZW9mIHNlbGYgaXNudCAndW5kZWZpbmVkJyBhbmQgc2VsZikgdGhlbiBzZWxmIGVsc2UgKGlmICh0eXBlb2Ygd2luZG93IGlzbnQgJ3VuZGVmaW5lZCcgYW5kIHdpbmRvdykgdGhlbiB3aW5kb3cgZWxzZSB0aGlzKSkpXG5tb2R1bGUuZXhwb3J0cyA9IHRoaXNHbG9iYWwiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xub2JqID0gcmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5pbnB1dCA9IHJlcXVpcmUgJy4uL2RvbS9pbnB1dCdcblxuaW5wdXROYW1lID0gJ2J1dHRvbmlucHV0J1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiAnYnV0dG9uJ1xuICAgICAgc3JjOiAnJ1xuICAgICAgYWx0OiAnJ1xuICAgICAgaGVpZ2h0OiAnJ1xuICAgICAgd2lkdGg6ICcnXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgb2JqLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IGlucHV0IGRlZmF1bHRzLCBvd25lclxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0XG5cblxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbm9iaiA9IHJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICdjaGVja2JveCdcblxuaW5wdCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHkpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIGNoZWNrZWQ6IGZhbHNlXG4gICAgaW5kZXRlcm1pbmF0ZTogZmFsc2VcbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIG9iai5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgaWYgZGVmYXVsdHMuY2hlY2tlZFxuICAgIHJldC5hdHRyICdjaGVja2VkJywgdHJ1ZVxuICBlbHNlIGlmIGRlZmF1bHRzLmluZGV0ZXJtaW5hdGVcbiAgICByZXQuYXR0ciAnaW5kZXRlcm1pbmF0ZScsIHRydWVcblxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0IiwiT0ogPSByZXF1aXJlICcuLi9vaidcbm9iaiA9IHJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICdjb2xvcidcblxuaW5wdCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHkpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgb2JqLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IGlucHV0IGRlZmF1bHRzLCBvd25lclxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0IiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICdkYXRlJ1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdCIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbnJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcbmlucHV0ID0gcmVxdWlyZSAnLi4vZG9tL2lucHV0J1xuXG5pbnB1dE5hbWUgPSAnZGF0ZXRpbWUnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IGlucHV0IGRlZmF1bHRzLCBvd25lclxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0XG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5yZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5pbnB1dCA9IHJlcXVpcmUgJy4uL2RvbS9pbnB1dCdcblxuaW5wdXROYW1lID0gJ2RhdGV0aW1lLWxvY2FsJ1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xucmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICdlbWFpbCdcblxuaW5wdCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHkpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgICBtdWx0aXBsZTogJydcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xucmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICdmaWxlJ1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICAgIGFjY2VwdDogJydcbiAgICAgIG11bHRpcGxlOiAnJ1xuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IGlucHV0IGRlZmF1bHRzLCBvd25lclxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0XG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5yZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5pbnB1dCA9IHJlcXVpcmUgJy4uL2RvbS9pbnB1dCdcblxuaW5wdXROYW1lID0gJ2hpZGRlbidcblxuaW5wdCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHkpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgcmV0ID0gaW5wdXQgZGVmYXVsdHMsIG93bmVyXG4gIHJldFxuXG5PSi5pbnB1dHMucmVnaXN0ZXIgaW5wdXROYW1lLCBpbnB0XG5tb2R1bGUuZXhwb3J0cyA9IGlucHRcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbnJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcbmlucHV0ID0gcmVxdWlyZSAnLi4vZG9tL2lucHV0J1xuXG5pbnB1dE5hbWUgPSAnaW1hZ2VpbnB1dCdcblxuaW5wdCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHkpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgdHlwZTogJ2ltYWdlJ1xuICAgICAgc3JjOiAnJ1xuICAgICAgYWx0OiAnJ1xuICAgICAgaGVpZ2h0OiAnJ1xuICAgICAgd2lkdGg6ICcnXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgcmV0ID0gaW5wdXQgZGVmYXVsdHMsIG93bmVyXG4gIHJldFxuXG5PSi5pbnB1dHMucmVnaXN0ZXIgaW5wdXROYW1lLCBpbnB0XG5tb2R1bGUuZXhwb3J0cyA9IGlucHRcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbnJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcbmlucHV0ID0gcmVxdWlyZSAnLi4vZG9tL2lucHV0J1xuXG5pbnB1dE5hbWUgPSAnbW9udGgnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IGlucHV0IGRlZmF1bHRzLCBvd25lclxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0XG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5yZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5pbnB1dCA9IHJlcXVpcmUgJy4uL2RvbS9pbnB1dCdcblxuaW5wdXROYW1lID0gJ251bWJlcidcblxuaW5wdCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHkpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgcmV0ID0gaW5wdXQgZGVmYXVsdHMsIG93bmVyXG4gIHJldFxuXG5PSi5pbnB1dHMucmVnaXN0ZXIgaW5wdXROYW1lLCBpbnB0XG5tb2R1bGUuZXhwb3J0cyA9IGlucHRcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbnJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcbmlucHV0ID0gcmVxdWlyZSAnLi4vZG9tL2lucHV0J1xuXG5pbnB1dE5hbWUgPSAncGFzc3dvcmQnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgICAgbWF4bGVuZ3RoOiAnJ1xuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IGlucHV0IGRlZmF1bHRzLCBvd25lclxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0XG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5yZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5pbnB1dCA9IHJlcXVpcmUgJy4uL2RvbS9pbnB1dCdcblxuaW5wdXROYW1lID0gJ3JhZGlvJ1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICAgIG5hbWU6ICcnXG4gICAgICB2YWx1ZTogJydcbiAgICAgIGNoZWNrZWQ6ICcnXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgcmV0ID0gaW5wdXQgZGVmYXVsdHMsIG93bmVyXG4gIHJldFxuXG5PSi5pbnB1dHMucmVnaXN0ZXIgaW5wdXROYW1lLCBpbnB0XG5tb2R1bGUuZXhwb3J0cyA9IGlucHRcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbnJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcbmlucHV0ID0gcmVxdWlyZSAnLi4vZG9tL2lucHV0J1xuXG5pbnB1dE5hbWUgPSAncmFuZ2UnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgICAgbWluOiAwXG4gICAgICBtYXg6IDEwMFxuICAgICAgdmFsdWU6IDUwXG4gICAgICBzdGVwOiAxXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgcmV0ID0gaW5wdXQgZGVmYXVsdHMsIG93bmVyXG4gIHJldFxuXG5PSi5pbnB1dHMucmVnaXN0ZXIgaW5wdXROYW1lLCBpbnB0XG5tb2R1bGUuZXhwb3J0cyA9IGlucHRcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbnJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcbmlucHV0ID0gcmVxdWlyZSAnLi4vZG9tL2lucHV0J1xuXG5pbnB1dE5hbWUgPSAncmVzZXQnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgIHN0eWxlczoge31cbiAgICBldmVudHM6XG4gICAgICBjbGljazogT0oubm9vcFxuXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuXG4gIHJldCA9IGlucHV0IGRlZmF1bHRzLCBvd25lclxuICByZXRcblxuT0ouaW5wdXRzLnJlZ2lzdGVyIGlucHV0TmFtZSwgaW5wdFxubW9kdWxlLmV4cG9ydHMgPSBpbnB0XG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xucmVxdWlyZSAnLi4vY29yZS9vYmplY3QnXG5yZXF1aXJlICcuLi9kb20vbm9kZUZhY3RvcnknXG5pbnB1dCA9IHJlcXVpcmUgJy4uL2RvbS9pbnB1dCdcblxuaW5wdXROYW1lID0gJ3NlYXJjaCdcblxuaW5wdCA9IChvcHRpb25zLCBvd25lciA9IE9KLmJvZHkpIC0+XG5cbiAgZGVmYXVsdHMgPVxuICAgIHByb3BzOlxuICAgICAgdHlwZTogaW5wdXROYW1lXG4gICAgc3R5bGVzOiB7fVxuICAgIGV2ZW50czpcbiAgICAgIGNsaWNrOiBPSi5ub29wXG5cbiAgT0ouZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zLCB0cnVlXG5cbiAgcmV0ID0gaW5wdXQgZGVmYXVsdHMsIG93bmVyXG4gIHJldFxuXG5PSi5pbnB1dHMucmVnaXN0ZXIgaW5wdXROYW1lLCBpbnB0XG5tb2R1bGUuZXhwb3J0cyA9IGlucHRcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG5yZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbnJlcXVpcmUgJy4uL2RvbS9ub2RlRmFjdG9yeSdcbmlucHV0ID0gcmVxdWlyZSAnLi4vZG9tL2lucHV0J1xuXG5pbnB1dE5hbWUgPSAnc3VibWl0J1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xucmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICd0ZWwnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgICAgcGF0dGVybjogJydcbiAgICAgIG1heGxlbmd0aDogJydcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xucmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICd0ZXh0aW5wdXQnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6ICd0ZXh0J1xuICAgICAgYXV0b2NvbXBsZXRlOiAnb24nXG4gICAgICBhdXRvc2F2ZTogJydcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xucmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICd0aW1lJ1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xucmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICd1cmwnXG5cbmlucHQgPSAob3B0aW9ucywgb3duZXIgPSBPSi5ib2R5KSAtPlxuXG4gIGRlZmF1bHRzID1cbiAgICBwcm9wczpcbiAgICAgIHR5cGU6IGlucHV0TmFtZVxuICAgICAgcGF0dGVybjogJydcbiAgICAgIG1heGxlbmd0aDogJydcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbnJlcXVpcmUgJy4uL2NvcmUvb2JqZWN0J1xucmVxdWlyZSAnLi4vZG9tL25vZGVGYWN0b3J5J1xuaW5wdXQgPSByZXF1aXJlICcuLi9kb20vaW5wdXQnXG5cbmlucHV0TmFtZSA9ICd3ZWVrJ1xuXG5pbnB0ID0gKG9wdGlvbnMsIG93bmVyID0gT0ouYm9keSkgLT5cblxuICBkZWZhdWx0cyA9XG4gICAgcHJvcHM6XG4gICAgICB0eXBlOiBpbnB1dE5hbWVcbiAgICBzdHlsZXM6IHt9XG4gICAgZXZlbnRzOlxuICAgICAgY2xpY2s6IE9KLm5vb3BcblxuICBPSi5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnMsIHRydWVcblxuICByZXQgPSBpbnB1dCBkZWZhdWx0cywgb3duZXJcbiAgcmV0XG5cbk9KLmlucHV0cy5yZWdpc3RlciBpbnB1dE5hbWUsIGlucHRcbm1vZHVsZS5leHBvcnRzID0gaW5wdFxuIiwiIyAjIE9KXG50aGlzR2xvYmFsID0gcmVxdWlyZSAnLi9nbG9iYWwnXG51dGlsTGliID0gcmVxdWlyZSAnanF1ZXJ5J1xubmFtZVNwYWNlTmFtZSA9ICdPSidcblxuIyMjXG5ib290IHN0cmFwIG5hbWUgbWV0aG9kIGludG8gT2JqZWN0IHByb3RvdHlwZVxuIyMjXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyBPYmplY3Q6OixcbiAgZ2V0SW5zdGFuY2VOYW1lOlxuICAgIHZhbHVlOiAtPlxuICAgICAgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvbiAoLnsxLH0pXFwoL1xuICAgICAgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKEBjb25zdHJ1Y3Rvci50b1N0cmluZygpKVxuICAgICAgKGlmIChyZXN1bHRzIGFuZCByZXN1bHRzLmxlbmd0aCA+IDEpIHRoZW4gcmVzdWx0c1sxXSBlbHNlICcnKVxuXG5cbiMjI1xuQW4gaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5hbWVzcGFjZSB0cmVlXG4jIyNcbk5zVHJlZSA9IHt9XG5tYWtlVGhlSnVpY2UgPSAtPlxuXG4gICMjI1xuICBJbnRlcm5hbCBuYW1lU3BhY2VOYW1lIG1ldGhvZCB0byBjcmVhdGUgbmV3ICdzdWInIG5hbWVzcGFjZXMgb24gYXJiaXRyYXJ5IGNoaWxkIG9iamVjdHMuXG4gICMjI1xuICBtYWtlTmFtZVNwYWNlID0gKHNwYWNlbmFtZSwgdHJlZSkgLT5cbiAgICAjIyNcbiAgICBUaGUgZGVyaXZlZCBpbnN0YW5jZSB0byBiZSBjb25zdHJ1Y3RlZFxuICAgICMjI1xuICAgIEJhc2UgPSAobnNOYW1lKSAtPlxuICAgICAgcHJvdG8gPSB0aGlzXG4gICAgICB0cmVlW25zTmFtZV0gPSB0cmVlW25zTmFtZV0gb3Ige31cbiAgICAgIG5zVHJlZSA9IHRyZWVbbnNOYW1lXVxuICAgICAgbWVtYmVycyA9IHt9XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB0aGlzLCAnbWVtYmVycycsIHZhbHVlOiBtZW1iZXJzXG5cbiAgICAgICMjI1xuICAgICAgUmVnaXN0ZXIgKGUuZy4gJ0xpZnQnKSBhbiBPYmplY3QgaW50byB0aGUgcHJvdG90eXBlIG9mIHRoZSBuYW1lc3BhY2UuXG4gICAgICBUaGlzIE9iamVjdCB3aWxsIGJlIHJlYWRhYmxlL2V4ZWN1dGFibGUgYnV0IGlzIG90aGVyd2lzZSBpbW11dGFibGUuXG4gICAgICAjIyNcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB0aGlzLCAncmVnaXN0ZXInLFxuICAgICAgICB2YWx1ZTogKG5hbWUsIG9iaiwgZW51bWVyYWJsZSkgLT5cbiAgICAgICAgICAndXNlIHN0cmljdCdcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBsaWZ0IGEgbmV3IHByb3BlcnR5IHdpdGhvdXQgYSB2YWxpZCBuYW1lLicpICBpZiAodHlwZW9mIG5hbWUgaXNudCAnc3RyaW5nJykgb3IgbmFtZSBpcyAnJ1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGxpZnQgYSBuZXcgcHJvcGVydHkgd2l0aG91dCBhIHZhbGlkIHByb3BlcnR5IGluc3RhbmNlLicpICB1bmxlc3Mgb2JqXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eSBuYW1lZCAnICsgbmFtZSArICcgaXMgYWxyZWFkeSBkZWZpbmVkIG9uICcgKyBzcGFjZW5hbWUgKyAnLicpICBpZiBwcm90b1tuYW1lXVxuXG4gICAgICAgICAgbWVtYmVyc1tuYW1lXSA9IG1lbWJlcnNbbmFtZV0gb3IgbmFtZVxuXG4gICAgICAgICAgI0d1YXJkIGFnYWluc3Qgb2JsaXRlcmF0aW5nIHRoZSB0cmVlIGFzIHRoZSB0cmVlIGlzIHJlY3Vyc2l2ZWx5IGV4dGVuZGVkXG4gICAgICAgICAgbnNUcmVlW25hbWVdID0gbnNUcmVlW25hbWVdIG9yXG4gICAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgICAgICB0eXBlOiB0eXBlb2Ygb2JqXG4gICAgICAgICAgICBpbnN0YW5jZTogKGlmIG9iai5nZXRJbnN0YW5jZU5hbWUgdGhlbiBvYmouZ2V0SW5zdGFuY2VOYW1lKCkgZWxzZSAndW5rbm93bicpXG5cbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgcHJvdG8sIG5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogb2JqXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSBpc250IGVudW1lcmFibGVcblxuICAgICAgICAgIG5zSW50ZXJuYWwuYWxlcnREZXBlbmRlbnRzIG5zTmFtZSArICcuJyArIHNwYWNlbmFtZSArICcuJyArIG5hbWVcbiAgICAgICAgICBvYmpcblxuXG4gICAgICAjIyNcbiAgICAgIENyZWF0ZSBhIG5ldywgc3RhdGljIG5hbWVzcGFjZSBvbiB0aGUgY3VycmVudCBwYXJlbnQgKGUuZy4gbnNOYW1lLnRvLi4uIHx8IG5zTmFtZS5pcy4uLilcbiAgICAgICMjI1xuICAgICAgcHJvdG8ucmVnaXN0ZXIgJ21ha2VTdWJOYW1lU3BhY2UnLCAoKHN1Yk5hbWVTcGFjZSkgLT5cbiAgICAgICAgJ3VzZSBzdHJpY3QnXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNyZWF0ZSBhIG5ldyBzdWIgbmFtZXNwYWNlIHdpdGhvdXQgYSB2YWxpZCBuYW1lLicpICBpZiAodHlwZW9mIHN1Yk5hbWVTcGFjZSBpc250ICdzdHJpbmcnKSBvciBzdWJOYW1lU3BhY2UgaXMgJydcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdWIgbmFtZXNwYWNlIG5hbWVkICcgKyBzdWJOYW1lU3BhY2UgKyAnIGlzIGFscmVhZHkgZGVmaW5lZCBvbiAnICsgc3BhY2VuYW1lICsgJy4nKSAgaWYgcHJvdG8uc3ViTmFtZVNwYWNlXG4gICAgICAgIG5zSW50ZXJuYWwuYWxlcnREZXBlbmRlbnRzIG5zTmFtZSArICcuJyArIHN1Yk5hbWVTcGFjZVxuICAgICAgICBuZXdOYW1lU3BhY2UgPSBtYWtlTmFtZVNwYWNlKHN1Yk5hbWVTcGFjZSwgbnNUcmVlKVxuICAgICAgICBuZXdOYW1lU3BhY2UucmVnaXN0ZXIgJ2NvbnN0YW50cycsIG1ha2VOYW1lU3BhY2UoJ2NvbnN0YW50cycsIG5zVHJlZSksIGZhbHNlICBpZiBzdWJOYW1lU3BhY2UgaXNudCAnY29uc3RhbnRzJ1xuICAgICAgICBwcm90by5yZWdpc3RlciBzdWJOYW1lU3BhY2UsIG5ld05hbWVTcGFjZSwgZmFsc2VcbiAgICAgICAgbmV3TmFtZVNwYWNlXG4gICAgICApLCBmYWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICAjIyNcbiAgICBBbiBpbnRlcm5hbCBtZWNoYW5pc20gdG8gcmVwcmVzZW50IHRoZSBpbnN0YW5jZSBvZiB0aGlzIG5hbWVzcGFjZVxuICAgIEBjb25zdHJ1Y3RvclxuICAgIEBpbnRlcm5hbFxuICAgIEBtZW1iZXJPZiBtYWtlTmFtZVNwYWNlXG4gICAgIyMjXG4gICAgQ2xhc3MgPSBuZXcgRnVuY3Rpb24oJ3JldHVybiBmdW5jdGlvbiAnICsgc3BhY2VuYW1lICsgJygpe30nKSgpXG4gICAgQ2xhc3M6OiA9IG5ldyBCYXNlKHNwYWNlbmFtZSlcblxuICAgICNDbGFzcy5wcm90b3R5cGUucGFyZW50ID0gQmFzZS5wcm90b3R5cGU7XG4gICAgbmV3IENsYXNzKHNwYWNlbmFtZSlcblxuICAjIyNcbiAgJ0RlcGVuZCcgYW4gT2JqZWN0IHVwb24gYW5vdGhlciBtZW1iZXIgb2YgdGhpcyBuYW1lc3BhY2UsIHVwb24gYW5vdGhlciBuYW1lc3BhY2UsXG4gIG9yIHVwb24gYSBtZW1iZXIgb2YgYW5vdGhlciBuYW1lc3BhY2VcbiAgIyMjXG4gIGRlcGVuZHNPbiA9IChkZXBlbmRlbmNpZXMsIGNhbGxCYWNrLCBpbXBvcnRzKSAtPlxuICAgICd1c2Ugc3RyaWN0J1xuICAgIHJldCA9IGZhbHNlXG4gICAgbnNNZW1iZXJzID0gbnNJbnRlcm5hbC5nZXROc01lbWJlcnMoKVxuICAgIGlmIGRlcGVuZGVuY2llcyBhbmQgZGVwZW5kZW5jaWVzLmxlbmd0aCA+IDAgYW5kIGNhbGxCYWNrXG4gICAgICBtaXNzaW5nID0gZGVwZW5kZW5jaWVzLmZpbHRlcigoZGVwZW4pIC0+XG4gICAgICAgIG5zTWVtYmVycy5pbmRleE9mKGRlcGVuKSBpcyAtMSBhbmQgKG5vdCBpbXBvcnRzIG9yIGltcG9ydHMgaXNudCBkZXBlbilcbiAgICAgIClcbiAgICAgIGlmIG1pc3NpbmcubGVuZ3RoIGlzIDBcbiAgICAgICAgcmV0ID0gdHJ1ZVxuICAgICAgICBjYWxsQmFjaygpXG4gICAgICBlbHNlXG4gICAgICAgIG5zSW50ZXJuYWwuZGVwZW5kZW50cy5wdXNoIChpbXBvcnRzKSAtPlxuICAgICAgICAgIGRlcGVuZHNPbiBtaXNzaW5nLCBjYWxsQmFjaywgaW1wb3J0c1xuXG4gICAgcmV0XG4gIG5zSW50ZXJuYWwgPSBkZXBlbmRlbnRzOiBbXVxuXG4gICMjI1xuICBGZXRjaGVzIHRoZSByZWdpc3RlcmVkIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMgb24gdGhlIG5hbWVzcGFjZSBhbmQgaXRzIGNoaWxkIG5hbWVzcGFjZXNcbiAgIyMjXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBuc0ludGVybmFsLCAnZ2V0TnNNZW1iZXJzJyxcbiAgICB2YWx1ZTogLT5cbiAgICAgIHJlY3Vyc2VUcmVlID0gKGtleSwgbGFzdEtleSkgLT5cbiAgICAgICAgbWVtYmVycy5wdXNoIGxhc3RLZXkgKyAnLicgKyBrZXkgIGlmIHR5cGVvZiAoa2V5KSBpcyAnc3RyaW5nJ1xuICAgICAgICBpZiB1dGlsTGliLmlzUGxhaW5PYmplY3Qoa2V5KVxuICAgICAgICAgIE9iamVjdC5rZXlzKGtleSkuZm9yRWFjaCAoaykgLT5cbiAgICAgICAgICAgIG1lbWJlcnMucHVzaCBsYXN0S2V5ICsgJy4nICsgayAgaWYgdHlwZW9mIChrKSBpcyAnc3RyaW5nJ1xuICAgICAgICAgICAgcmVjdXJzZVRyZWUga2V5W2tdLCBsYXN0S2V5ICsgJy4nICsgayAgaWYgdXRpbExpYi5pc1BsYWluT2JqZWN0KGtleVtrXSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJldHVyblxuICAgICAgbWVtYmVycyA9IFtdXG4gICAgICBPYmplY3Qua2V5cyhOc1RyZWVbbmFtZVNwYWNlTmFtZV0pLmZvckVhY2ggKGtleSkgLT5cbiAgICAgICAgcmVjdXJzZVRyZWUgTnNUcmVlW25hbWVTcGFjZU5hbWVdW2tleV0sIG5hbWVTcGFjZU5hbWUgIGlmIHV0aWxMaWIuaXNQbGFpbk9iamVjdChOc1RyZWVbbmFtZVNwYWNlTmFtZV1ba2V5XSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIG1lbWJlcnNcblxuICAjIyNcbiAgVG8gc3VwcG9ydCBkZXBlbmRlbmN5IG1hbmFnZW1lbnQsIHdoZW4gYSBwcm9wZXJ0eSBpcyBsaWZ0ZWQgb250byB0aGUgbmFtZXNwYWNlLCBub3RpZnkgZGVwZW5kZW50cyB0byBpbml0aWFsaXplXG4gICMjI1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgbnNJbnRlcm5hbCwgJ2FsZXJ0RGVwZW5kZW50cycsXG4gICAgdmFsdWU6IChpbXBvcnRzKSAtPlxuICAgICAgZGVwcyA9IG5zSW50ZXJuYWwuZGVwZW5kZW50cy5maWx0ZXIoKGRlcE9uKSAtPlxuICAgICAgICBmYWxzZSBpcyBkZXBPbihpbXBvcnRzKVxuICAgICAgKVxuICAgICAgbnNJbnRlcm5hbC5kZXBlbmRlbnRzID0gZGVwcyAgaWYgQXJyYXkuaXNBcnJheShkZXBzKVxuXG4gICNDcmVhdGUgdGhlIHJvb3Qgb2YgdGhlIHRyZWUgYXMgdGhlIGN1cnJlbnQgbmFtZXNwYWNlXG4gIE5zVHJlZVtuYW1lU3BhY2VOYW1lXSA9IHt9XG4gICNEZWZpbmUgdGhlIGNvcmUgbmFtZXNwYWNlIGFuZCB0aGUgcmV0dXJuIG9mIHRoaXMgY2xhc3NcbiAgTnNPdXQgPSBtYWtlTmFtZVNwYWNlKG5hbWVTcGFjZU5hbWUsIE5zVHJlZVtuYW1lU3BhY2VOYW1lXSlcblxuICAjIyNcbiAgQ2FjaGUgYSBoYW5kbGUgb24gdGhlIHZlbmRvciAocHJvYmFibHkgalF1ZXJ5KSBvbiB0aGUgcm9vdCBuYW1lc3BhY2VcbiAgIyMjXG4gIE5zT3V0LnJlZ2lzdGVyICc/JywgdXRpbExpYiwgZmFsc2VcblxuICAjIyNcbiAgQ2FjaGUgdGhlIHRyZWUgKHVzZWZ1bCBmb3IgZG9jdW1lbnRhdGlvbi92aXN1YWxpemF0aW9uL2RlYnVnZ2luZylcbiAgIyMjXG4gIE5zT3V0LnJlZ2lzdGVyICd0cmVlJywgTnNUcmVlW25hbWVTcGFjZU5hbWVdLCBmYWxzZVxuXG4gICMjI1xuICBDYWNoZSB0aGUgbmFtZSBzcGFjZSBuYW1lXG4gICMjI1xuICBOc091dC5yZWdpc3RlciAnbmFtZScsIG5hbWVTcGFjZU5hbWUsIGZhbHNlXG4gIE5zT3V0LnJlZ2lzdGVyICdkZXBlbmRzT24nLCBkZXBlbmRzT24sIGZhbHNlXG4gIE5zT3V0XG5cblxuIyMjXG5BY3R1YWxseSBkZWZpbmUgdGhlIE9KIE5hbWVTcGFjZVxuIyMjXG5PYmplY3QuZGVmaW5lUHJvcGVydHkgdGhpc0dsb2JhbCwgbmFtZVNwYWNlTmFtZSxcbiAgdmFsdWU6IG1ha2VUaGVKdWljZSgpXG5cbk9KLnJlZ2lzdGVyICdnbG9iYWwnLCB0aGlzR2xvYmFsXG5cbnRoaXNEb2N1bWVudCA9IHt9XG5pZiB0eXBlb2YgZG9jdW1lbnQgaXNudCAndW5kZWZpbmVkJ1xuICB0aGlzRG9jdW1lbnQgPSBkb2N1bWVudFxuXG5PSi5yZWdpc3RlciAnZG9jdW1lbnQnLCB0aGlzRG9jdW1lbnRcblxuT0oucmVnaXN0ZXIgJ25vb3AnLCAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IE9KIiwiICMgIyBPSiBQb3N0LUluaXRpYWxpemF0aW9uXG5cbk9KID0gcmVxdWlyZSAnLi9vaidcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbiMgU2ltcGxlIGFycmF5IG9mIGFudGljaXBhdGVkL2tub3duIGNoaWxkIG5hbWVzcGFjZXNcbiAgXG5zdWJOYW1lU3BhY2VzID0gW1xuICAnZXJyb3JzJ1xuICAnZW51bXMnXG4gICdpbnN0YW5jZU9mJ1xuICAnbm9kZXMnXG4gICdkYidcbiAgJ2NvbXBvbmVudHMnXG4gICdjb250cm9scydcbiAgJ2lucHV0cydcbiAgJ25vdGlmaWNhdGlvbnMnXG4gICdjb29raWUnXG4gICdhc3luYydcbl1cblxuIyAjIyBTdWJOYW1lU3BhY2VzXG5cbiMgUHJlLWFsbG9jYXRlIGNlcnRhaW4gY29tbW9uIG5hbWVzcGFjZXMgdG8gYXZvaWQgZnV0dXJlIHJhY2UgY29uZGl0aW9ucy5cbiMgVGhpcyBkb2VzIHJlcXVpcmUgdGhhdCB0aGUgb3JkZXIgb2Ygb3BlcmF0aW9ucyBsb2FkcyBPSi5jb2ZmZWUgZmlyc3QgYW5kIG9KSW5pdC5jb2ZmZWUgc2Vjb25kXG5fLmVhY2ggc3ViTmFtZVNwYWNlcywgKG5hbWUpIC0+XG4gIE9KLm1ha2VTdWJOYW1lU3BhY2UgbmFtZVxuICBcbiMgIyMgQ29uZmlndXJhdGlvbiB2YXJpYWJsZXNcblxuIyBBdXRvbWF0aWNhbGx5IGdlbmVyYXRlIHVuaXF1ZSBJRHMgZm9yIGVhY2ggbm9kZSAoZGVmYXVsdCBmYWxzZSlcbk9KWydHRU5FUkFURV9VTklRVUVfSURTJ10gPSBmYWxzZVxuIyBEZWZhdWx0IHJvb3Qgbm9kZSBmb3IgY29tcG9uZW50cy9jb250cm9scyAoZGVmYXVsdCAnZGl2Jylcbk9KWydERUZBVUxUX0NPTVBPTkVOVF9ST09UX05PREVUWVBFJ10gPSAnZGl2J1xuIyBXaGV0aGVyIHRvIGhvb2sgaW50byB0aGUgZ2xvYmFsIG9uIGVycm9yIGV2ZW50IHRvIHdyaXRlIGVycm9ycyB0byBjb25zb2xlIChkZWZhdWx0IGZhbHNlKVxuT0pbJ1RSQUNLX09OX0VSUk9SJ10gPSBmYWxzZVxuI1doZXRoZXIgdG8gbG9nIGFsbCBBSkFYIHJlcXVlc3RzXG5PSlsnTE9HX0FMTF9BSkFYJ10gPSBmYWxzZVxuI1doZXRoZXIgdG8gbG9nIGFsbCBBSkFYIGVycm9yc1xuT0pbJ0xPR19BTExfQUpBWF9FUlJPUlMnXSA9IGZhbHNlIiwiXG4jIyNcblJldHVybiBqdXN0IHRoZSBrZXlzIGZyb20gdGhlIGlucHV0IGFycmF5LCBvcHRpb25hbGx5IG9ubHkgZm9yIHRoZSBzcGVjaWZpZWQgc2VhcmNoX3ZhbHVlXG52ZXJzaW9uOiAxMTA5LjIwMTVcbmRpc2N1c3MgYXQ6IGh0dHA6Ly9waHBqcy5vcmcvZnVuY3Rpb25zL2FycmF5X2tleXNcbisgICBvcmlnaW5hbCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cDovL2tldmluLnZhbnpvbm5ldmVsZC5uZXQpXG4rICAgICAgaW5wdXQgYnk6IEJyZXR0IFphbWlyIChodHRwOi8vYnJldHQtemFtaXIubWUpXG4rICAgYnVnZml4ZWQgYnk6IEtldmluIHZhbiBab25uZXZlbGQgKGh0dHA6Ly9rZXZpbi52YW56b25uZXZlbGQubmV0KVxuKyAgIGltcHJvdmVkIGJ5OiBqZFxuKyAgIGltcHJvdmVkIGJ5OiBCcmV0dCBaYW1pciAoaHR0cDovL2JyZXR0LXphbWlyLm1lKVxuKyAgIGlucHV0IGJ5OiBQXG4rICAgYnVnZml4ZWQgYnk6IEJyZXR0IFphbWlyIChodHRwOi8vYnJldHQtemFtaXIubWUpXG5leGFtcGxlIDE6IGFycmF5X2tleXMoIHtmaXJzdG5hbWU6ICdLZXZpbicsIHN1cm5hbWU6ICd2YW4gWm9ubmV2ZWxkJ30gKTtcbnJldHVybnMgMTogezA6ICdmaXJzdG5hbWUnLCAxOiAnc3VybmFtZSd9XG4jIyNcbmFycmF5X2tleXMgPSAoaW5wdXQsIHNlYXJjaF92YWx1ZSwgYXJnU3RyaWN0KSAtPlxuICBzZWFyY2ggPSB0eXBlb2Ygc2VhcmNoX3ZhbHVlIGlzbnQgXCJ1bmRlZmluZWRcIlxuICB0bXBfYXJyID0gW11cbiAgc3RyaWN0ID0gISFhcmdTdHJpY3RcbiAgaW5jbHVkZSA9IHRydWVcbiAga2V5ID0gXCJcIlxuICAjIER1Y2stdHlwZSBjaGVjayBmb3Igb3VyIG93biBhcnJheSgpLWNyZWF0ZWQgUEhQSlNfQXJyYXlcbiAgcmV0dXJuIGlucHV0LmtleXMoc2VhcmNoX3ZhbHVlLCBhcmdTdHJpY3QpICBpZiBpbnB1dCBhbmQgdHlwZW9mIGlucHV0IGlzIFwib2JqZWN0XCIgYW5kIGlucHV0LmNoYW5nZV9rZXlfY2FzZVxuICBmb3Iga2V5IG9mIGlucHV0XG4gICAgaWYgaW5wdXQuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgaW5jbHVkZSA9IHRydWVcbiAgICAgIGlmIHNlYXJjaFxuICAgICAgICBpZiBzdHJpY3QgYW5kIGlucHV0W2tleV0gaXNudCBzZWFyY2hfdmFsdWVcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2VcbiAgICAgICAgZWxzZSBpbmNsdWRlID0gZmFsc2UgIHVubGVzcyBpbnB1dFtrZXldIGlzIHNlYXJjaF92YWx1ZVxuICAgICAgdG1wX2Fyclt0bXBfYXJyLmxlbmd0aF0gPSBrZXkgIGlmIGluY2x1ZGVcbiAgdG1wX2FyclxuXG4jIyMqXG5Db252ZXJ0IGEgSmF2YXNjcmlwdCBPamVjdCBhcnJheSBvciBTdHJpbmcgYXJyYXkgdG8gYW4gSFRNTCB0YWJsZVxuSlNPTiBwYXJzaW5nIGhhcyB0byBiZSBtYWRlIGJlZm9yZSBmdW5jdGlvbiBjYWxsXG5JdCBhbGxvd3MgdXNlIG9mIG90aGVyIEpTT04gcGFyc2luZyBtZXRob2RzIGxpa2UgalF1ZXJ5LnBhcnNlSlNPTlxuaHR0cChzKTovLywgZnRwOi8vLCBmaWxlOi8vIGFuZCBqYXZhc2NyaXB0OjsgbGlua3MgYXJlIGF1dG9tYXRpY2FsbHkgY29tcHV0ZWRcblxuSlNPTiBkYXRhIHNhbXBsZXMgdGhhdCBzaG91bGQgYmUgcGFyc2VkIGFuZCB0aGVuIGNhbiBiZSBjb252ZXJ0ZWQgdG8gYW4gSFRNTCB0YWJsZVxudmFyIG9iamVjdEFycmF5ID0gJ1t7XCJUb3RhbFwiOlwiMzRcIixcIlZlcnNpb25cIjpcIjEuMC40XCIsXCJPZmZpY2VcIjpcIk5ldyBZb3JrXCJ9LHtcIlRvdGFsXCI6XCI2N1wiLFwiVmVyc2lvblwiOlwiMS4xLjBcIixcIk9mZmljZVwiOlwiUGFyaXNcIn1dJztcbnZhciBzdHJpbmdBcnJheSA9ICdbXCJOZXcgWW9ya1wiLFwiQmVybGluXCIsXCJQYXJpc1wiLFwiTWFycmFrZWNoXCIsXCJNb3Njb3dcIl0nO1xudmFyIG5lc3RlZFRhYmxlID0gJ1t7IGtleTE6IFwidmFsMVwiLCBrZXkyOiBcInZhbDJcIiwga2V5MzogeyB0YWJsZUlkOiBcInRibElkTmVzdGVkMVwiLCB0YWJsZUNsYXNzTmFtZTogXCJjbHNOZXN0ZWRcIiwgbGlua1RleHQ6IFwiRG93bmxvYWRcIiwgZGF0YTogW3sgc3Via2V5MTogXCJzdWJ2YWwxXCIsIHN1YmtleTI6IFwic3VidmFsMlwiLCBzdWJrZXkzOiBcInN1YnZhbDNcIiB9XSB9IH1dJztcblxuQ29kZSBzYW1wbGUgdG8gY3JlYXRlIGEgSFRNTCB0YWJsZSBKYXZhc2NyaXB0IFN0cmluZ1xudmFyIGpzb25IdG1sVGFibGUgPSBDb252ZXJ0SnNvblRvVGFibGUoZXZhbChkYXRhU3RyaW5nKSwgJ2pzb25UYWJsZScsIG51bGwsICdEb3dubG9hZCcpO1xuXG5Db2RlIHNhbXBsZSBleHBsYW5lZFxuLSBldmFsIGlzIHVzZWQgdG8gcGFyc2UgYSBKU09OIGRhdGFTdHJpbmdcbi0gdGFibGUgSFRNTCBpZCBhdHRyaWJ1dGUgd2lsbCBiZSAnanNvblRhYmxlJ1xuLSB0YWJsZSBIVE1MIGNsYXNzIGF0dHJpYnV0ZSB3aWxsIG5vdCBiZSBhZGRlZFxuLSAnRG93bmxvYWQnIHRleHQgd2lsbCBiZSBkaXNwbGF5ZWQgaW5zdGVhZCBvZiB0aGUgbGluayBpdHNlbGZcblxuQGF1dGhvciBBZnNoaW4gTWVocmFiYW5pIDxhZnNoaW4gZG90IG1laCBhdCBnbWFpbCBkb3QgY29tPlxuXG5AY2xhc3MgQ29udmVydEpzb25Ub1RhYmxlXG5cbkBtZXRob2QgQ29udmVydEpzb25Ub1RhYmxlXG5cbkBwYXJhbSBwYXJzZWRKc29uIG9iamVjdCBQYXJzZWQgSlNPTiBkYXRhXG5AcGFyYW0gdGFibGVJZCBzdHJpbmcgT3B0aW9uYWwgdGFibGUgaWRcbkBwYXJhbSB0YWJsZUNsYXNzTmFtZSBzdHJpbmcgT3B0aW9uYWwgdGFibGUgY3NzIGNsYXNzIG5hbWVcbkBwYXJhbSBsaW5rVGV4dCBzdHJpbmcgT3B0aW9uYWwgdGV4dCByZXBsYWNlbWVudCBmb3IgbGluayBwYXR0ZXJuXG5cbkByZXR1cm4gc3RyaW5nIENvbnZlcnRlZCBKU09OIHRvIEhUTUwgdGFibGVcbiMjI1xuY2xhc3MgSnNvblRvVGFibGUgXG4gIFxuICB0YWJsZTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6IChwYXJzZWRKc29uLCB0YWJsZUlkLCB0YWJsZUNsYXNzTmFtZSwgbGlua1RleHQpIC0+XG4gICAgI1BhdHRlcm5zIGZvciBsaW5rcyBhbmQgTlVMTCB2YWx1ZVxuICAgIGl0YWxpYyA9IFwiPGk+ezB9PC9pPlwiXG4gICAgbGluayA9IChpZiBsaW5rVGV4dCB0aGVuIFwiPGEgaHJlZj1cXFwiezB9XFxcIj5cIiArIGxpbmtUZXh0ICsgXCI8L2E+XCIgZWxzZSBcIjxhIGhyZWY9XFxcInswfVxcXCI+ezB9PC9hPlwiKVxuICBcbiAgICAjUGF0dGVybiBmb3IgdGFibGUgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGlkTWFya3VwID0gKGlmIHRhYmxlSWQgdGhlbiBcIiBpZD1cXFwiXCIgKyB0YWJsZUlkICsgXCJcXFwiXCIgZWxzZSBcIlwiKVxuICAgIGNsYXNzTWFya3VwID0gKGlmIHRhYmxlQ2xhc3NOYW1lIHRoZW4gXCIgY2xhc3M9XFxcIlwiICsgdGFibGVDbGFzc05hbWUgKyBcIlxcXCJcIiBlbHNlIFwiXCIpXG4gICAgdGJsID0gXCI8dGFibGUgYm9yZGVyPVxcXCIxXFxcIiBjZWxscGFkZGluZz1cXFwiMVxcXCIgY2VsbHNwYWNpbmc9XFxcIjFcXFwiXCIgKyBpZE1hcmt1cCArIGNsYXNzTWFya3VwICsgXCI+ezB9ezF9PC90YWJsZT5cIlxuICBcbiAgICAjUGF0dGVybnMgZm9yIHRhYmxlIGNvbnRlbnRcbiAgICB0aCA9IFwiPHRoZWFkPnswfTwvdGhlYWQ+XCJcbiAgICB0YiA9IFwiPHRib2R5PnswfTwvdGJvZHk+XCJcbiAgICB0ciA9IFwiPHRyPnswfTwvdHI+XCJcbiAgICB0aFJvdyA9IFwiPHRoPnswfTwvdGg+XCJcbiAgICB0ZFJvdyA9IFwiPHRkPnswfTwvdGQ+XCJcbiAgICB0aENvbiA9IFwiXCJcbiAgICB0YkNvbiA9IFwiXCJcbiAgICB0ckNvbiA9IFwiXCJcbiAgICBpZiBwYXJzZWRKc29uXG4gICAgICBpc1N0cmluZ0FycmF5ID0gdHlwZW9mIChwYXJzZWRKc29uWzBdKSBpcyBcInN0cmluZ1wiXG4gICAgICBoZWFkZXJzID0gdW5kZWZpbmVkXG4gICAgXG4gICAgICAjIENyZWF0ZSB0YWJsZSBoZWFkZXJzIGZyb20gSlNPTiBkYXRhXG4gICAgICAjIElmIEpTT04gZGF0YSBpcyBhIHNpbXBsZSBzdHJpbmcgYXJyYXkgd2UgY3JlYXRlIGEgc2luZ2xlIHRhYmxlIGhlYWRlclxuICAgICAgaWYgaXNTdHJpbmdBcnJheVxuICAgICAgICB0aENvbiArPSB0aFJvdy5mb3JtYXQoXCJ2YWx1ZVwiKVxuICAgICAgZWxzZVxuICAgICAgXG4gICAgICAgICMgSWYgSlNPTiBkYXRhIGlzIGFuIG9iamVjdCBhcnJheSwgaGVhZGVycyBhcmUgYXV0b21hdGljYWxseSBjb21wdXRlZFxuICAgICAgICBpZiB0eXBlb2YgKHBhcnNlZEpzb25bMF0pIGlzIFwib2JqZWN0XCJcbiAgICAgICAgICBoZWFkZXJzID0gYXJyYXlfa2V5cyhwYXJzZWRKc29uWzBdKVxuICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgd2hpbGUgaSA8IGhlYWRlcnMubGVuZ3RoXG4gICAgICAgICAgICB0aENvbiArPSB0aFJvdy5mb3JtYXQoaGVhZGVyc1tpXSlcbiAgICAgICAgICAgIGkrK1xuICAgICAgdGggPSB0aC5mb3JtYXQodHIuZm9ybWF0KHRoQ29uKSlcbiAgICBcbiAgICAgICMgQ3JlYXRlIHRhYmxlIHJvd3MgZnJvbSBKc29uIGRhdGFcbiAgICAgIGlmIGlzU3RyaW5nQXJyYXlcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IHBhcnNlZEpzb24ubGVuZ3RoXG4gICAgICAgICAgdGJDb24gKz0gdGRSb3cuZm9ybWF0KHBhcnNlZEpzb25baV0pXG4gICAgICAgICAgdHJDb24gKz0gdHIuZm9ybWF0KHRiQ29uKVxuICAgICAgICAgIHRiQ29uID0gXCJcIlxuICAgICAgICAgIGkrK1xuICAgICAgZWxzZVxuICAgICAgICBpZiBoZWFkZXJzXG4gICAgICAgICAgdXJsUmVnRXhwID0gbmV3IFJlZ0V4cCgvKFxcYihodHRwcz98ZnRwfGZpbGUpOlxcL1xcL1stQS1aMC05KyZAI1xcLyU/PX5ffCE6LC47XSpbLUEtWjAtOSsmQCNcXC8lPX5ffF0pL2cpXG4gICAgICAgICAgamF2YXNjcmlwdFJlZ0V4cCA9IG5ldyBSZWdFeHAoLyheamF2YXNjcmlwdDpbXFxzXFxTXSo7JCkvZylcbiAgICAgICAgICBpID0gMFxuICAgICAgICAgIHdoaWxlIGkgPCBwYXJzZWRKc29uLmxlbmd0aFxuICAgICAgICAgICAgaiA9IDBcbiAgICAgICAgICAgIHdoaWxlIGogPCBoZWFkZXJzLmxlbmd0aFxuICAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlZEpzb25baV1baGVhZGVyc1tqXV1cbiAgICAgICAgICAgICAgaXNVcmwgPSB1cmxSZWdFeHAudGVzdCh2YWx1ZSkgb3IgamF2YXNjcmlwdFJlZ0V4cC50ZXN0KHZhbHVlKVxuICAgICAgICAgICAgICBpZiBpc1VybCAjIElmIHZhbHVlIGlzIFVSTCB3ZSBhdXRvLWNyZWF0ZSBhIGxpbmtcbiAgICAgICAgICAgICAgICB0YkNvbiArPSB0ZFJvdy5mb3JtYXQobGluay5mb3JtYXQodmFsdWUpKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgdmFsdWVcbiAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiAodmFsdWUpIGlzIFwib2JqZWN0XCJcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAjZm9yIHN1cHBvcnRpbmcgbmVzdGVkIHRhYmxlc1xuICAgICAgICAgICAgICAgICAgICB0YkNvbiArPSB0ZFJvdy5mb3JtYXQoQ29udmVydEpzb25Ub1RhYmxlKGV2YWwodmFsdWUuZGF0YSksIHZhbHVlLnRhYmxlSWQsIHZhbHVlLnRhYmxlQ2xhc3NOYW1lLCB2YWx1ZS5saW5rVGV4dCkpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRiQ29uICs9IHRkUm93LmZvcm1hdCh2YWx1ZSlcbiAgICAgICAgICAgICAgICBlbHNlICMgSWYgdmFsdWUgPT0gbnVsbCB3ZSBmb3JtYXQgaXQgbGlrZSBQaHBNeUFkbWluIE5VTEwgdmFsdWVzXG4gICAgICAgICAgICAgICAgICB0YkNvbiArPSB0ZFJvdy5mb3JtYXQoaXRhbGljLmZvcm1hdCh2YWx1ZSkudG9VcHBlckNhc2UoKSlcbiAgICAgICAgICAgICAgaisrXG4gICAgICAgICAgICB0ckNvbiArPSB0ci5mb3JtYXQodGJDb24pXG4gICAgICAgICAgICB0YkNvbiA9IFwiXCJcbiAgICAgICAgICAgIGkrK1xuICAgICAgdGIgPSB0Yi5mb3JtYXQodHJDb24pXG4gICAgICB0YmwgPSB0YmwuZm9ybWF0KHRoLCB0YilcbiAgICBAdGFibGUgPSB0YmxcblxubW9kdWxlLmV4cG9ydHMgPSBKc29uVG9UYWJsZSIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4gIFxuYXJyYXkyRCA9IChpbml0TGVuZ3RoLCBpbml0V2lkdGgpIC0+XG4gIGFycmF5ID0gW11cbiAgbWF4TGVuZ3RoID0gMFxuICBtYXhXaWR0aCA9IDBcbiAgICBcbiAgcmV0ID0gXG4gICAgZ2V0OiAocm93Tm8sIGNvbE5vKSAtPlxuICAgICAgZXh0ZW5kIHJvd05vLCBjb2xOb1xuICAgIHNldDogKHJvd05vLCBjb2xObywgdmFsKSAtPlxuICAgICAgcmV0LmdldCByb3dObywgY29sTm9cbiAgICAgIHJvd0lkeCA9IHJvd05vLTFcbiAgICAgIGNvbElkeCA9IGNvbE5vLTFcbiAgICAgIGFycmF5W3Jvd0lkeF1bY29sSWR4XSA9IHZhbFxuICAgIGVhY2g6IChjYWxsQmFjaykgLT5cbiAgICAgIF8uZWFjaCBhcnJheSwgKGNvbHVtbnMsIHJvdykgLT5cbiAgICAgICAgXy5lYWNoIGFycmF5W3Jvd10sICh2YWwsIGNvbCkgLT5cbiAgICAgICAgICByb3dJZHggPSByb3crMVxuICAgICAgICAgIGNvbElkeCA9IGNvbCsxXG4gICAgICAgICAgY2FsbEJhY2sgcm93SWR4LCBjb2xJZHgsIHZhbFxuICAgIHdpZHRoOiAoKSAtPlxuICAgICAgbWF4V2lkdGhcbiAgICBsZW5ndGg6ICgpIC0+XG4gICAgICBtYXhMZW5ndGhcbiAgICAgICAgIFxuICAjIyNcbiAgR3VhcmFudGVlIHRoYXQgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIGFycmF5IGFyZSBhbHdheXMgYmFja2VkIGJ5IHZhbHVlcyBhdCBldmVyeSBwb3NpdGlvblxuICAjIyMgICAgICAgICAgICAgICAgICAgIFxuICBleHRlbmQgPSAobGVuZ3RoLCB3aWR0aCkgLT4gIFxuICAgIGlmIG5vdCBsZW5ndGggb3IgbGVuZ3RoIDwgMSB0aGVuIGxlbmd0aCA9IDFcbiAgICBpZiBub3Qgd2lkdGggb3Igd2lkdGggPCAxIHRoZW4gd2lkdGggPSAxXG4gICAgICBcbiAgICBpZiBtYXhMZW5ndGggPCBsZW5ndGggdGhlbiBtYXhMZW5ndGggPSBsZW5ndGhcbiAgICBpZiBhcnJheS5sZW5ndGggPiBtYXhMZW5ndGggdGhlbiBtYXhMZW5ndGggPSBhcnJheS5sZW5ndGhcbiAgICBpZiBtYXhXaWR0aCA8IHdpZHRoIHRoZW4gbWF4V2lkdGggPSB3aWR0aFxuICAgIGkgPSAwXG4gICAgICBcbiAgICB3aGlsZSBpIDwgbWF4TGVuZ3RoXG4gICAgICB0cnlSb3cgPSBhcnJheVtpXVxuICAgICAgaWYgbm90IHRyeVJvd1xuICAgICAgICB0cnlSb3cgPSBbXVxuICAgICAgICBhcnJheS5wdXNoIHRyeVJvd1xuICAgICAgaWYgbWF4V2lkdGggPCB0cnlSb3cubGVuZ3RoIHRoZW4gbWF4V2lkdGggPSB0cnlSb3cubGVuZ3RoXG4gICAgICBpZiB0cnlSb3cubGVuZ3RoIDwgbWF4V2lkdGggdGhlbiB0cnlSb3cubGVuZ3RoID0gbWF4V2lkdGhcbiAgICAgIGkgKz0gMVxuICAgICAgXG4gICAgYXJyYXlbbGVuZ3RoLTFdW3dpZHRoLTFdXG4gICAgICAgXG4gIGV4dGVuZCBpbml0TGVuZ3RoLCBpbml0V2lkdGhcbiAgICBcbiAgcmV0XG5cbk9KLnJlZ2lzdGVyICdhcnJheTJEJywgYXJyYXkyRFxubW9kdWxlLmV4cG9ydHMgPSBhcnJheTJEIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbiAgXG5tZXRob2RzID0gW1xuICAnYXNzZXJ0J1xuICAnY2xlYXInXG4gICdjb3VudCdcbiAgJ2RlYnVnJ1xuICAnZGlyJ1xuICAnZGlyeG1sJ1xuICAnZXJyb3InXG4gICdleGNlcHRpb24nXG4gICdncm91cCdcbiAgJ2dyb3VwQ29sbGFwc2VkJ1xuICAnZ3JvdXBFbmQnXG4gICdpbmZvJ1xuICAnbG9nJ1xuICAnbWVtb3J5J1xuICAncHJvZmlsZSdcbiAgJ3Byb2ZpbGVFbmQnXG4gICd0YWJsZSdcbiAgJ3RpbWUnXG4gICd0aW1lRW5kJ1xuICAndGltZVN0YW1wJ1xuICAndGltZWxpbmUnXG4gICd0aW1lbGluZUVuZCdcbiAgJ3RyYWNlJ1xuICAnd2Fybidcbl1cbm1ldGhvZExlbmd0aCA9IG1ldGhvZHMubGVuZ3RoXG5jb25zb2xlID0gT0ouZ2xvYmFsLmNvbnNvbGUgb3Ige31cbk9KLm1ha2VTdWJOYW1lU3BhY2UgJ2NvbnNvbGUnXG4gIFxuIyMjXG4xLiBTdHViIG91dCBhbnkgbWlzc2luZyBtZXRob2RzIHdpdGggbm9vcFxuMi4gRGVmaW5lIHRoZSBhdmFpbGFibGUgbWV0aG9kcyBvbiB0aGUgT0ouY29uc29sZSBvYmplY3RcbiMjI1xud2hpbGUgbWV0aG9kTGVuZ3RoLS1cbiAgKC0+XG4gICAgbWV0aG9kID0gbWV0aG9kc1ttZXRob2RMZW5ndGhdXG4gICAgXG4gICAgIyBPbmx5IHN0dWIgdW5kZWZpbmVkIG1ldGhvZHMuXG4gICAgY29uc29sZVttZXRob2RdID0gT0oubm9vcCB1bmxlc3MgY29uc29sZVttZXRob2RdXG4gICAgXG4gICAgI0RlZmluZSB0aGUgbWV0aG9kIG9uIHRoZSBPSiBjb25zb2xlIG5hbWVzcGFjZVxuICAgIE9KLmNvbnNvbGUucmVnaXN0ZXIgbWV0aG9kLCAocGFyYW1zLi4uKSAtPlxuICAgICAgY29uc29sZVttZXRob2RdIHBhcmFtcy4uLlxuICApKClcblxubW9kdWxlLmV4cG9ydHMgPSBjb25zb2xlIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbiQgPSByZXF1aXJlICdqcXVlcnknXG4gIFxuIyMjXG5TZXR1cCBzZXR0aW5nc1xuJC5jb29raWUucmF3ID0gdHJ1ZVxuJC5jb29raWUuanNvbiA9IHRydWVcbiAgXG5TZXR1cCBkZWZhdWx0c1xuaHR0cHM6Ly9naXRodWIuY29tL2NhcmhhcnRsL2pxdWVyeS1jb29raWUvXG4kLmNvb2tpZS5kZWZhdWx0cy5leHBpcmVzID0gMzY1XG4kLmNvb2tpZS5kZWZhdWx0cy5wYXRoID0gJy8nXG4kLmNvb2tpZS5kZWZhdWx0cy5kb21haW4gPSAnb2ouY29tJ1xuIyMjXG5pZiBub3QgJCBvciBub3QgJC5jb29raWVcbiAgdGhyb3cgbmV3IEVycm9yICdqUXVlcnkgQ29va2llIGlzIGEgcmVxdWlyZWQgZGVwZW5kZW5jeS4nICBcbiQuY29va2llLmRlZmF1bHRzLnNlY3VyZSA9IGZhbHNlXG4gIFxuY29va2llcyA9IHt9XG4gIFxuZ2V0ID0gKGNvb2tpZU5hbWUsIHR5cGUpIC0+XG4gIHJldCA9ICcnXG4gIGlmIGNvb2tpZU5hbWVcbiAgICBpZiB0eXBlXG4gICAgICByZXQgPSAkLmNvb2tpZSBjb29raWVOYW1lLCB0eXBlXG4gICAgZWxzZVxuICAgICAgcmV0ID0gJC5jb29raWUgY29va2llTmFtZSAgICBcbiAgICBpZiByZXRcbiAgICAgIGNvb2tpZXNbY29va2llTmFtZV0gPSByZXRcbiAgXG5hbGwgPSAtPlxuICByZXQgPSAkLmNvb2tpZSgpXG4gIHJldFxuICAgIFxuc2V0ID0gKGNvb2tpZU5hbWUsIHZhbHVlLCBvcHRzKSAtPlxuICByZXQgPSAnJ1xuICBpZiBjb29raWVOYW1lXG4gICAgY29va2llc1tjb29raWVOYW1lXSA9IHZhbHVlXG4gICAgaWYgb3B0c1xuICAgICAgcmV0ID0gJC5jb29raWUgY29va2llTmFtZSwgdmFsdWUsIG9wdHNcbiAgICBlbHNlXG4gICAgICByZXQgPSAkLmNvb2tpZSBjb29raWVOYW1lLCB2YWx1ZVxuICByZXQgIFxuICBcbmRlbCA9IChjb29raWVOYW1lLCBvcHRzKSAtPlxuICBpZiBjb29raWVOYW1lXG4gICAgaWYgb3B0c1xuICAgICAgJC5yZW1vdmVDb29raWUgY29va2llTmFtZSwgb3B0c1xuICAgIGVsc2VcbiAgICAgICQucmVtb3ZlQ29va2llIGNvb2tpZU5hbWUgICAgXG4gICAgZGVsZXRlIGNvb2tpZXNbY29va2llTmFtZV1cbiAgcmV0dXJuXG4gICAgXG5kZWxldGVBbGwgPSAtPlxuICBjb29raWVzID0ge31cbiAgT0ouZWFjaCBPSi5jb29raWUuYWxsLCAodmFsLCBrZXkpIC0+XG4gICAgT0ouY29va2llLmRlbGV0ZSBrZXkgIFxuICByZXR1cm5cbiAgICBcbiBPSi5jb29raWUucmVnaXN0ZXIgJ2RlbGV0ZUFsbCcsIGRlbGV0ZUFsbFxuIE9KLmNvb2tpZS5yZWdpc3RlciAnZGVsZXRlJywgZGVsXG4gT0ouY29va2llLnJlZ2lzdGVyICdzZXQnLCBzZXRcbiBPSi5jb29raWUucmVnaXN0ZXIgJ2dldCcsIGdldFxuIE9KLmNvb2tpZS5yZWdpc3RlciAnYWxsJywgIGFsbFxuIFxuIG1vZHVsZS5leHBvcnRzID0gXG4gIGRlbGV0ZUFsbDogZGVsZXRlQWxsXG4gIGRlbGV0ZTogZGVsXG4gIHNldDogc2V0XG4gIGdldDogZ2V0XG4gIGFsbDogIGFsbCIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4gIFxuZGVmZXIgPSAobWV0aG9kLCB3YWl0TXMpIC0+XG4gIGlmIHdhaXRNcyBhbmQgc2V0VGltZW91dFxuICAgIHNldFRpbWVvdXQgbWV0aG9kLCB3YWl0TXNcbiAgKG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgIHJlc29sdmUoKSkudGhlbiBtZXRob2RcbiAgXG5PSi5yZWdpc3RlciAnZGVmZXInLCBkZWZlclxubW9kdWxlLmV4cG9ydHMgPSBkZWZlciIsIiMgIyBlYWNoXG5cbk9KID0gcmVxdWlyZSAnLi4vb2onXG5cbiMgIyMgY2FuRWFjaFxuY2FuRWFjaCA9IChvYmopIC0+XG4gICMgUmV0dXJuIHRydWUgaWYgdGhlIG9iamVjdCBbaXNdKGlzLmh0bWwpIHRydWx5IGl0ZXJhYmxlIChlLmcuIGFuIGluc3RhbmNlIG9mIE9iamVjdCBvciBBcnJheSlcbiAgT0ouaXMucGxhaW5PYmplY3Qob2JqKSBvciBPSi5pcy5vYmplY3Qob2JqKSBvciBPSi5pcy5hcnJheSBvYmpcblxuIyAjIyBbT0pdKG9qLmh0bWwpLmVhY2hcblxuIyBJdGVyYXRlIGFsbCBvZiB0aGUgbWVtYmVycyBvZiBhbiBvYmplY3QgKG9yIGFuIGFycmF5KSB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGFuZCByZWN1cnNpb24uXG5cbiMgLSBgb2JqYDogdGhlIG9iamVjdCB0byBpdGVyYXRlLFxuIyAtIGBvbkVhY2hgOiBhIGNhbGxiYWNrIHRvIGV4ZWN1dGUgZm9yIGVhY2ggaXRlcmF0aW9uLFxuIyAtIGByZWN1cnNpdmVgOiBpZiB0cnVlLCByZWN1cnNpdmVseSBpdGVyYXRlIGFsbCB2YWxpZCBjaGlsZCBvYmplY3RzLlxuZWFjaCA9IChvYmosIG9uRWFjaCwgcmVjdXJzaXZlKSAtPlxuICBpZiBjYW5FYWNoIG9ialxuICAgICMgVXNpbmcgW0xvLURhc2hdKGh0dHA6Ly9sb2Rhc2guY29tL2RvY3MjZm9yb3duKSdzIGBmb3JPd25gIG1ldGhvZCB0byBlbnN1cmUgdGhhdCBvbmx5IHRoZSBhY3R1YWwgcHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IGFyZSBlbnVtZXJhdGVkLlxuXG4gICAgIyAtIGBvbkVhY2hgIGNhbGxiYWNrIHdpbGwgcmVjZWl2ZSAyIHBhcmFtZXRlcnM6XG4gICAgIyAtIGB2YWxgIGFuZCBga2V5YC5cbiAgICAjIC0gYHZhbGAgaXMgYWx3YXlzIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkuXG4gICAgIyAtIGBrZXlgIGlzIGVpdGhlciB0aGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgb3IgdGhlIGN1cnJlbnQgaW5kZXggb2YgdGhlIGFycmF5LlxuICAgIF8uZm9yT3duIG9iaiwgKHZhbCwga2V5KSAtPlxuICAgICAgaWYgb25FYWNoIGFuZCAodmFsIG9yIGtleSlcbiAgICAgICAgcXVpdCA9IG9uRWFjaCB2YWwsIGtleVxuICAgICAgICByZXR1cm4gZmFsc2UgIGlmIGZhbHNlIGlzIHF1aXRcbiAgICAgIGVhY2ggdmFsLCBvbkVhY2gsIHRydWUgIGlmIHRydWUgaXMgcmVjdXJzaXZlXG4gICAgICByZXR1cm5cblxuICByZXR1cm5cblxuIyAjIyByZWdpc3RlclxuXG4jIHJlZ2lzdGVyIHRoZSBgZWFjaGAgbWV0aG9kIG9uIHRoZSBbT0pdKE9KLmh0bWwpIG5hbWVzcGFjZVxuT0oucmVnaXN0ZXIgJ2VhY2gnLCBlYWNoXG5tb2R1bGUuZXhwb3J0cyA9IGVhY2giLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xuICBcbnVua25vd24gPSAndW5rbm93bicgICBcbiAgXG5pbnB1dFR5cGVzID1cbiAgYnV0dG9uOiAjY2hhcmFjdGVyc1xuICAgIGlkOiAwXG4gICAgbmFtZTogJ2J1dHRvbidcbiAgICBwbGFjZWhvbGRlcjogZmFsc2VcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlXG4gICAgdmFsdWU6XG4gICAgICByZXF1aXJlZDogZmFsc2VcbiAgICAgIGFsbG93ZWQ6IHRydWVcblxuICAgIGRlZmF1bHR3aWR0aDogJydcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIGNoZWNrYm94OiAjY2hhcmFjdGVyc1xuICAgIGlkOiAxXG4gICAgbmFtZTogJ2NoZWNrYm94J1xuICAgIHBsYWNlaG9sZGVyOiBmYWxzZVxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2VcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICBjb2xvcjogI2NoYXJhY3RlcnNcbiAgICBpZDogMlxuICAgIG5hbWU6ICdjb2xvcidcbiAgICBwbGFjZWhvbGRlcjogZmFsc2VcbiAgICBhdXRvY29tcGxldGU6IHRydWVcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnJ1xuICAgIGRlZmF1bHRzaXplOiAnMjUnXG5cbiAgZGF0ZTogI2NoYXJhY3RlcnNcbiAgICBpZDogM1xuICAgIG5hbWU6ICdkYXRlJ1xuICAgIHBsYWNlaG9sZGVyOiBmYWxzZVxuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcyMDBweCdcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIGRhdGV0aW1lOiAjY2hhcmFjdGVyc1xuICAgIGlkOiA0XG4gICAgbmFtZTogJ2RhdGV0aW1lJ1xuICAgIHBsYWNlaG9sZGVyOiBmYWxzZVxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2VcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnMjAwcHgnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICAnZGF0ZXRpbWUtbG9jYWwnOiAjY2hhcmFjdGVyc1xuICAgIGlkOiA1XG4gICAgbmFtZTogJ2RhdGV0aW1lLWxvY2FsJ1xuICAgIHBsYWNlaG9sZGVyOiBmYWxzZVxuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcyMDBweCdcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIGVtYWlsOiAjY2hhcmFjdGVyc1xuICAgIGlkOiA2XG4gICAgbmFtZTogJ2VtYWlsJ1xuICAgIHBsYWNlaG9sZGVyOiB0cnVlXG4gICAgYXV0b2NvbXBsZXRlOiB0cnVlXG4gICAgdmFsdWU6XG4gICAgICByZXF1aXJlZDogZmFsc2VcbiAgICAgIGFsbG93ZWQ6IHRydWVcblxuICAgIGRlZmF1bHR3aWR0aDogJzIwMHB4J1xuICAgIGRlZmF1bHRzaXplOiAnMjUnXG5cbiAgZmlsZTogI2NoYXJhY3RlcnNcbiAgICBpZDogN1xuICAgIG5hbWU6ICdmaWxlJ1xuICAgIHBsYWNlaG9sZGVyOiBmYWxzZVxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2VcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogZmFsc2VcblxuICAgIGRlZmF1bHR3aWR0aDogJydcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIGhpZGRlbjogI2NoYXJhY3RlcnNcbiAgICBpZDogOFxuICAgIG5hbWU6ICdoaWRkZW4nXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICBpbWFnZTogI2NoYXJhY3RlcnNcbiAgICBpZDogOVxuICAgIG5hbWU6ICdpbWFnZSdcbiAgICBwbGFjZWhvbGRlcjogZmFsc2VcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlXG4gICAgdmFsdWU6XG4gICAgICByZXF1aXJlZDogZmFsc2VcbiAgICAgIGFsbG93ZWQ6IHRydWVcblxuICAgIGRlZmF1bHR3aWR0aDogJydcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIG1vbnRoOiAjY2hhcmFjdGVyc1xuICAgIGlkOiAxMFxuICAgIG5hbWU6ICdtb250aCdcbiAgICBwbGFjZWhvbGRlcjogZmFsc2VcbiAgICBhdXRvY29tcGxldGU6IGZhbHNlXG4gICAgdmFsdWU6XG4gICAgICByZXF1aXJlZDogZmFsc2VcbiAgICAgIGFsbG93ZWQ6IHRydWVcblxuICAgIGRlZmF1bHR3aWR0aDogJydcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIG51bWJlcjogI2NoYXJhY3RlcnNcbiAgICBpZDogMTFcbiAgICBuYW1lOiAnbnVtYmVyJ1xuICAgIHBsYWNlaG9sZGVyOiBmYWxzZVxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2VcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnMjAwcHgnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICBwYXNzd29yZDogI2NoYXJhY3RlcnNcbiAgICBpZDogMTJcbiAgICBuYW1lOiAncGFzc3dvcmQnXG4gICAgcGxhY2Vob2xkZXI6IHRydWVcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnMjAwcHgnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICByYWRpbzogI2NoYXJhY3RlcnNcbiAgICBpZDogMTNcbiAgICBuYW1lOiAncmFkaW8nXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICAgIGFsbG93ZWQ6IHRydWVcblxuICAgIGRlZmF1bHR3aWR0aDogJydcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIHJhbmdlOiAjY2hhcmFjdGVyc1xuICAgIGlkOiAxNFxuICAgIG5hbWU6ICdyYW5nZSdcbiAgICBwbGFjZWhvbGRlcjogZmFsc2VcbiAgICBhdXRvY29tcGxldGU6IHRydWVcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnJ1xuICAgIGRlZmF1bHRzaXplOiAnMjUnXG5cbiAgcmVzZXQ6ICNjaGFyYWN0ZXJzXG4gICAgaWQ6IDE1XG4gICAgbmFtZTogJ3Jlc2V0J1xuICAgIHBsYWNlaG9sZGVyOiBmYWxzZVxuICAgIGF1dG9jb21wbGV0ZTogZmFsc2VcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnJ1xuICAgIGRlZmF1bHRzaXplOiAnMjUnXG5cbiAgc2VhcmNoOiAjY2hhcmFjdGVyc1xuICAgIGlkOiAxNlxuICAgIG5hbWU6ICdzZWFyY2gnXG4gICAgcGxhY2Vob2xkZXI6IHRydWVcbiAgICBhdXRvY29tcGxldGU6IHRydWVcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnJ1xuICAgIGRlZmF1bHRzaXplOiAnMjUnXG5cbiAgc3VibWl0OiAjY2hhcmFjdGVyc1xuICAgIGlkOiAxN1xuICAgIG5hbWU6ICdzdWJtaXQnXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICB0ZWw6ICNjaGFyYWN0ZXJzXG4gICAgaWQ6IDE4XG4gICAgbmFtZTogJ2J1dHRvbidcbiAgICBwbGFjZWhvbGRlcjogdHJ1ZVxuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICB0ZXh0OiAjY2hhcmFjdGVyc1xuICAgIGlkOiAxOVxuICAgIG5hbWU6ICd0ZXh0J1xuICAgIHBsYWNlaG9sZGVyOiB0cnVlXG4gICAgYXV0b2NvbXBsZXRlOiB0cnVlXG4gICAgdmFsdWU6XG4gICAgICByZXF1aXJlZDogZmFsc2VcbiAgICAgIGFsbG93ZWQ6IHRydWVcblxuICAgIGRlZmF1bHR3aWR0aDogJzIwMHB4J1xuICAgIGRlZmF1bHRzaXplOiAnMjUnXG5cbiAgdGltZTogI2NoYXJhY3RlcnNcbiAgICBpZDogMjBcbiAgICBuYW1lOiAndGltZSdcbiAgICBwbGFjZWhvbGRlcjogZmFsc2VcbiAgICBhdXRvY29tcGxldGU6IHRydWVcbiAgICB2YWx1ZTpcbiAgICAgIHJlcXVpcmVkOiBmYWxzZVxuICAgICAgYWxsb3dlZDogdHJ1ZVxuXG4gICAgZGVmYXVsdHdpZHRoOiAnMjAwcHgnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuICB1cmw6ICNjaGFyYWN0ZXJzXG4gICAgaWQ6IDIxXG4gICAgbmFtZTogJ3VybCdcbiAgICBwbGFjZWhvbGRlcjogdHJ1ZVxuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcyMDBweCdcbiAgICBkZWZhdWx0c2l6ZTogJzI1J1xuXG4gIHdlZWs6ICNjaGFyYWN0ZXJzXG4gICAgaWQ6IDIyXG4gICAgbmFtZTogJ3dlZWsnXG4gICAgcGxhY2Vob2xkZXI6IGZhbHNlXG4gICAgYXV0b2NvbXBsZXRlOiBmYWxzZVxuICAgIHZhbHVlOlxuICAgICAgcmVxdWlyZWQ6IGZhbHNlXG4gICAgICBhbGxvd2VkOiB0cnVlXG5cbiAgICBkZWZhdWx0d2lkdGg6ICcnXG4gICAgZGVmYXVsdHNpemU6ICcyNSdcblxuT0ouZW51bXMucmVnaXN0ZXIgJ3Vua25vd24nLCB1bmtub3duXG5PSi5lbnVtcy5yZWdpc3RlciAnaW5wdXRUeXBlcycsIGlucHV0VHlwZXNcblxubW9kdWxlLmV4cG9ydHMgPSBcbiAgdW5rbm93bjogdW5rbm93blxuICBpbnB1dFR5cGVzOiBpbnB1dFR5cGVzIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbiQgPSByZXF1aXJlICdqcXVlcnknXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBJU1xuXG4gIEBib29sOiAoYm9vbGVhbikgLT5cbiAgICBfLmlzQm9vbGVhbiBib29sZWFuXG5cbiAgQGFycmF5TnVsbE9yRW1wdHk6IChhcnIpIC0+XG4gICAgXy5pc0VtcHR5IGFyclxuXG4gIEBzdHJpbmdOdWxsT3JFbXB0eTogKHN0cikgLT5cbiAgICBzdHIgYW5kIChub3Qgc3RyLmxlbmd0aCBvciBzdHIubGVuZ3RoIGlzIDAgb3Igbm90IHN0ci50cmltIG9yIG5vdCBzdHIudHJpbSgpKVxuXG4gIEBudW1iZXJOdWxsT3JFbXB0eTogKG51bSkgLT5cbiAgICBub3QgbnVtIG9yIGlzTmFOKG51bSkgb3Igbm90IG51bS50b1ByZWNpc2lvblxuXG4gIEBkYXRlTnVsbE9yRW1wdHk6IChkdCkgLT5cbiAgICBub3QgZHQgb3Igbm90IGR0LmdldFRpbWVcblxuICBAb2JqZWN0TnVsbE9yRW1wdHk6IChvYmopIC0+XG4gICAgXy5pc0VtcHR5IG9iaiBvciBub3QgT2JqZWN0LmtleXMob2JqKSBvciBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCBpcyAwXG5cbiAgQHBsYWluT2JqZWN0OiAob2JqKSAtPlxuICAgIF8uaXNQbGFpbk9iamVjdCBvYmpcblxuICBAb2JqZWN0OiAob2JqKSAtPlxuICAgIF8uaXNPYmplY3Qgb2JqXG5cbiAgQGRhdGU6IChkdCkgLT5cbiAgICBfLmlzRGF0ZSBkdFxuXG5cbiAgIyMjXG4gIERldGVybWluZXMgaWYgYSB2YWx1ZSBpcyBhbiBpbnN0YW5jZSBvZiBhIE51bWJlciBhbmQgbm90IE5hTipcbiAgIyMjXG4gIEBudW1iZXI6IChudW0pIC0+XG4gICAgbnVtYmVyID0gcmVxdWlyZSAnLi4vY29yZS9udW1iZXInXG4gICAgdHlwZW9mIG51bSBpcyAnbnVtYmVyJyBhbmQgZmFsc2UgaXMgKG51bWJlci5pc05hTihudW0pIG9yIGZhbHNlIGlzIG51bWJlci5pc0Zpbml0ZShudW0pIG9yIG51bWJlci5NQVhfVkFMVUUgaXMgbnVtIG9yIG51bWJlci5NSU5fVkFMVUUgaXMgbnVtKVxuXG4gICMjI1xuICBEZXRlcm1pbmVzIGlmIGEgdmFsdWUgaXMgY29udmVydGlibGUgdG8gYSBOdW1iZXJcbiAgIyMjXG4gIEBudW1lcmljOiAobnVtKSAtPlxuICAgIHJldCA9IEBudW1iZXIobnVtKVxuICAgIHVubGVzcyByZXRcbiAgICAgIHRvID0gcmVxdWlyZSAnLi90bydcbiAgICAgIG51TnVtID0gdG8ubnVtYmVyKG51bSlcbiAgICAgIHJldCA9IEBudW1iZXIobnVOdW0pXG4gICAgcmV0XG5cbiAgQGVsZW1lbnRJbkRvbTogKGVsZW1lbnRJZCkgLT5cbiAgICBmYWxzZSBpcyBAbnVsbE9yRW1wdHkoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElkKSlcblxuICBAYXJyYXk6IChvYmopIC0+XG4gICAgXy5pc0FycmF5IG9ialxuXG4gIEBzdHJpbmc6IChzdHIpIC0+XG4gICAgXy5pc1N0cmluZyBzdHJcblxuICBAdHJ1ZTogKG9iaikgLT5cbiAgICBvYmogaXMgdHJ1ZSBvciBvYmogaXMgJ3RydWUnIG9yIG9iaiBpcyAxIG9yIG9iaiBpcyAnMSdcblxuICBAZmFsc2U6IChvYmopIC0+XG4gICAgb2JqIGlzIGZhbHNlIG9yIG9iaiBpcyAnZmFsc2UnIG9yIG9iaiBpcyAwIG9yIG9iaiBpcyAnMCdcblxuICBAdHJ1ZU9yRmFsc2U6IChvYmopIC0+XG4gICAgQHRydWUgb2JqIG9yIEBmYWxzZSBvYmpcblxuICBAbnVsbE9yRW1wdHk6IChvYmosIGNoZWNrTGVuZ3RoKSAtPlxuICAgIF8uaXNFbXB0eShvYmopIG9yIF8uaXNVbmRlZmluZWQob2JqKSBvciBfLmlzTnVsbChvYmopIG9yIF8uaXNOYU4ob2JqKVxuXG4gIEBudWxsT3JVbmRlZmluZWQ6IChvYmosIGNoZWNrTGVuZ3RoKSAtPlxuICAgIF8uaXNVbmRlZmluZWQob2JqKSBvciBfLmlzTnVsbChvYmopIG9yIF8uaXNOYU4ob2JqKVxuXG4gIEBpbnN0YW5jZW9mOiAobmFtZSwgb2JqKSAtPlxuICAgIG9iai50eXBlIGlzIG5hbWUgb3Igb2JqIGluc3RhbmNlb2YgbmFtZVxuXG4gIEBtZXRob2Q6IChvYmopIC0+XG4gICAgb2JqIGlzbnQgT0oubm9vcCBhbmQgXy5pc0Z1bmN0aW9uIG9ialxuXG4gICMjI1xuICBEZXByZWNhdGVkLiBMZWZ0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS4gVXNlIGlzLm1ldGhvZCBpbnN0ZWFkLlxuICAjIyNcbiAgQGZ1bmMgPSBAbWV0aG9kXG5cblxuXG5PSi5yZWdpc3RlciAnaXMnLCBJU1xubW9kdWxlLmV4cG9ydHMgPSBJU1xuXG4iLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xubm90eSA9IHJlcXVpcmUgJ25vdHknXG5cbiAgXG5tYWtlTm90eSA9IChvcHRpb25zLCBvd25lcikgLT5cbiAgZGVmYXVsdHMgPVxuICAgIGxheW91dDogJ3RvcFJpZ2h0J1xuICAgIHRoZW1lOiAnZGVmYXVsdFRoZW1lJ1xuICAgIHR5cGU6ICdhbGVydCdcbiAgICB0ZXh0OiAnJyAjY2FuIGJlIGh0bWwgb3Igc3RyaW5nXG4gICAgZGlzbWlzc1F1ZXVlOiB0cnVlICNJZiB5b3Ugd2FudCB0byB1c2UgcXVldWUgZmVhdHVyZSBzZXQgdGhpcyB0cnVlXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwibm90eV9tZXNzYWdlXCI+PHNwYW4gY2xhc3M9XCJub3R5X3RleHRcIj48L3NwYW4+PGRpdiBjbGFzcz1cIm5vdHlfY2xvc2VcIj48L2Rpdj48L2Rpdj4nLFxuICAgIGFuaW1hdGlvbjogXG4gICAgICAgIG9wZW46IFxuICAgICAgICAgIGhlaWdodDogJ3RvZ2dsZSdcbiAgICAgICAgY2xvc2U6IFxuICAgICAgICAgIGhlaWdodDogJ3RvZ2dsZSdcbiAgICAgICAgZWFzaW5nOiAnc3dpbmcnXG4gICAgICAgIHNwZWVkOiA1MDAgI29wZW5pbmcgJiBjbG9zaW5nIGFuaW1hdGlvbiBzcGVlZFxuICAgIHRpbWVvdXQ6IDUwMDAgI2RlbGF5IGZvciBjbG9zaW5nIGV2ZW50LiBTZXQgZmFsc2UgZm9yIHN0aWNreSBub3RpZmljYXRpb25zXG4gICAgZm9yY2U6IGZhbHNlICNhZGRzIG5vdGlmaWNhdGlvbiB0byB0aGUgYmVnaW5uaW5nIG9mIHF1ZXVlIHdoZW4gc2V0IHRvIHRydWVcbiAgICBtb2RhbDogZmFsc2VcbiAgICBtYXhWaXNpYmxlOiA1ICN5b3UgY2FuIHNldCBtYXggdmlzaWJsZSBub3RpZmljYXRpb24gZm9yIGRpc21pc3NRdWV1ZSB0cnVlIG9wdGlvbixcbiAgICBraWxsZXI6IGZhbHNlICNmb3IgY2xvc2UgYWxsIG5vdGlmaWNhdGlvbnMgYmVmb3JlIHNob3dcbiAgICBjbG9zZVdpdGg6IFsnY2xpY2snXSAgI1snY2xpY2snLCAnYnV0dG9uJywgJ2hvdmVyJ11cbiAgICBjYWxsYmFjazogXG4gICAgICAgIG9uU2hvdzogT0oubm9vcCxcbiAgICAgICAgYWZ0ZXJTaG93OiBPSi5ub29wXG4gICAgICAgIG9uQ2xvc2U6IE9KLm5vb3BcbiAgICAgICAgYWZ0ZXJDbG9zZTogT0oubm9vcFxuICAgIGJ1dHRvbnM6IGZhbHNlICNhbiBhcnJheSBvZiBidXR0b25zXG4gICAgXG4gIE9KLmV4dGVuZCBkZWZhdWx0cywgb3B0aW9ucywgdHJ1ZVxuICByZXQgPSBub3R5IGRlZmF1bHRzXG4gICAgICBcbiAgcmV0XG4gICAgXG5PSi5ub3RpZmljYXRpb25zLnJlZ2lzdGVyICdub3R5JywgbWFrZU5vdHlcbm1vZHVsZS5leHBvcnRzID0gbWFrZU5vdHkiLCJPSiA9IHJlcXVpcmUgJy4uL29qJ1xuUHViU3ViID0gcmVxdWlyZSAncHVic3ViLWpzJ1xuXG50b2tlbnMgPSB7fVxuc3Vic2NyaWJlcnMgPSBbXVxuZXZlbnRzID0ge31cblxucHMgPSBcbiAgZ2V0RXZlbnROYW1lOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQudG9VcHBlckNhc2UoKS5yZXBsYWNlICcgJywgJ18nXG5cbiAgc3Vic2NyaWJlOiAoZXZlbnQsIG1ldGhvZCkgLT5cbiAgICBldmVudE5hbWUgPSBwcy5nZXRFdmVudE5hbWUgZXZlbnRcbiAgICBpZiBub3QgZXZlbnRzW2V2ZW50TmFtZV0gdGhlbiBldmVudHNbZXZlbnROYW1lXSA9IFtdXG5cbiAgICB0b2tlbiA9IFB1YlN1Yi5zdWJzY3JpYmUgZXZlbnROYW1lLCBtZXRob2RcbiAgICB0b2tlbnNbdG9rZW5dID0gdG9rZW5cbiAgICBzdWJzY3JpYmVycy5wdXNoIG1ldGhvZFxuICAgIGV2ZW50c1tldmVudE5hbWVdLnB1c2ggbWV0aG9kXG4gICAgdG9rZW5cblxuICBwdWJsaXNoOiAoZXZlbnQsIGRhdGEpIC0+XG4gICAgZXZlbnROYW1lID0gcHMuZ2V0RXZlbnROYW1lIGV2ZW50XG4gICAgaWYgZXZlbnRzW2V2ZW50TmFtZV1cbiAgICAgIFB1YlN1Yi5wdWJsaXNoIGV2ZW50TmFtZSwgZGF0YVxuICAgIGVsc2VcbiAgICAgIE9KLmNvbnNvbGUuaW5mbyAnRXZlbnQgbmFtZWQgeycgKyBldmVudCArICd9IGlzIG5vdCByZWNvZ25pemVkLidcbiAgICByZXR1cm5cblxuICB1bnN1YnNjcmliZTogKHRva2VuT3JNZXRob2QpIC0+XG4gICAgaWYgT0ouaXMubWV0aG9kIHRva2VuT3JNZXRob2RcbiAgICAgIGlmIC0xIGlzbnQgc3Vic2NyaWJlcnMuaW5kZXhPZiB0b2tlbk9yTWV0aG9kXG4gICAgICAgIFB1YlN1Yi51bnN1YnNjcmliZSB0b2tlbk9yTWV0aG9kXG4gICAgICAgIHN1YnNjcmliZXJzID0gXy5yZW1vdmUgc3Vic2NyaWJlcnMsIChtZXRob2QpIC0+IG1ldGhvZCBpcyB0b2tlbk9yTWV0aG9kXG4gICAgICBlbHNlXG4gICAgICAgIE9KLmNvbnNvbGUuaW5mbyAnRXZlbnQgbWV0aG9kIGlzIG5vdCByZWNvZ25pemVkLidcbiAgICBlbHNlXG4gICAgICBpZiB0b2tlbnNbdG9rZW5Pck1ldGhvZF1cbiAgICAgICAgUHViU3ViLnVuc3Vic2NyaWJlIHRva2VuT3JNZXRob2RcbiAgICAgICAgZGVsZXRlIHRva2Vuc1t0b2tlbk9yTWV0aG9kXVxuICAgIHJldHVyblxuXG4gIHVuc3Vic2NyaWJlQWxsOiAoKSAtPlxuICAgIE9KLmVhY2ggdG9rZW5zLCAodG9rZW4pIC0+IHVuc3Vic2NyaWJlIHRva2VuXG4gICAgc3Vic2NyaWJlcnMgPSBbXVxuICAgIGV2ZW50cyA9IHt9XG4gICAgcmV0dXJuXG5cbiAgdW5zdWJzY3JpYmVFdmVudDogKGV2ZW50KSAtPlxuICAgIGV2ZW50TmFtZSA9IHBzLmdldEV2ZW50TmFtZSBldmVudFxuICAgIGlmIGV2ZW50c1tldmVudE5hbWVdXG4gICAgICBPSi5lYWNoIGV2ZW50c1tldmVudE5hbWVdLCAobWV0aG9kKSAtPiB1bnN1YnNjcmliZSBtZXRob2RcbiAgICBlbHNlXG4gICAgICBPSi5jb25zb2xlLmluZm8gJ0V2ZW50IG5hbWVkIHsnICsgZXZlbnQgKyAnfSBpcyBub3QgcmVjb2duaXplZC4nXG4gICAgZGVsZXRlIGV2ZW50c1tldmVudE5hbWVdXG4gICAgcmV0dXJuXG5cbk9iamVjdC5zZWFsIHBzXG5PYmplY3QuZnJlZXplIHBzXG5cbk9KLnJlZ2lzdGVyICdnZXRFdmVudE5hbWUnLCBwcy5nZXRFdmVudE5hbWVcbk9KLnJlZ2lzdGVyICdwdWJsaXNoJywgcHMucHVibGlzaFxuT0oucmVnaXN0ZXIgJ3N1YnNjcmliZScsIHBzLnN1YnNjcmliZVxuT0oucmVnaXN0ZXIgJ3Vuc3Vic2NyaWJlJywgcHMudW5zdWJzY3JpYmVcbk9KLnJlZ2lzdGVyICd1bnN1YnNjcmliZUFsbCcsIHBzLnVuc3Vic2NyaWJlQWxsXG5PSi5yZWdpc3RlciAndW5zdWJzY3JpYmVFdmVudCcsIHBzLnVuc3Vic2NyaWJlRXZlbnRcblxubW9kdWxlLmV4cG9ydHMgPSBwcyIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4gIFxuIyMjXG5odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzkwMTExNS9ob3ctY2FuLWktZ2V0LXF1ZXJ5LXN0cmluZy12YWx1ZXMtaW4tamF2YXNjcmlwdFxuIyMjXG5xdWVyeVN0cmluZyA9IChwYXJhbSkgLT5cbiAgcmV0ID0ge31cbiAgICBcbiAgaWYgT0ouZ2xvYmFsLmxvY2F0aW9uXG4gICAgcGFyYW1zID0gIE9KLmdsb2JhbC5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLnNwbGl0ICcmJ1xuICAgIGlmIHBhcmFtc1xuICAgICAgaSA9IDBcbiAgICAgIHdoaWxlIGkgPCBwYXJhbXMubGVuZ3RoXG4gICAgICAgIHBybSA9IHBhcmFtc1tpXS5zcGxpdCAnPSdcbiAgICAgICAgaWYgcHJtLmxlbmd0aCBpcyAyIFxuICAgICAgICAgIHJldFtwcm1bMF1dID0gT0ouZ2xvYmFsLmRlY29kZVVSSUNvbXBvbmVudCBwcm1bMV0ucmVwbGFjZSgvXFwrL2csIFwiIFwiKVxuICAgICAgICBpICs9IDFcbiAgcmV0XG4gICAgXG5PSi5yZWdpc3RlciAncXVlcnlTdHJpbmcnLHF1ZXJ5U3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IHF1ZXJ5U3RyaW5nIiwiT0ogPSByZXF1aXJlICcuLi9vaidcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5vYmogPSByZXF1aXJlICcuLi9jb3JlL29iamVjdCdcbmVhY2ggPSByZXF1aXJlICcuL2VhY2gnXG5cbiMgIyByYW5nZXNcblxucm5nID1cblxuICAjICMjIHJhbmdlXG4gICMgVXNpbmcgW0xvLURhc2hdKGh0dHA6Ly9sb2Rhc2guY29tL2RvY3MjcmFuZ2UpJ3MgYHJhbmdlYCBtZXRob2RcbiAgcmFuZ2U6IChwYXJhbXMuLi4pIC0+XG4gICAgXy5yYW5nZSBwYXJhbXMuLi5cblxuICAjICMjIHJhbmdlTWluXG4gICMgVXNpbmcgW0xvLURhc2hdKGh0dHA6Ly9sb2Rhc2guY29tL2RvY3MjbWluKSdzIGBtaW5gIG1ldGhvZFxuICByYW5nZU1pbjogKHBhcmFtcy4uLikgLT5cbiAgICBfLm1pbiBwYXJhbXMuLi5cblxuICAjICMjIHJhbmdlTWF4XG4gICMgVXNpbmcgW0xvLURhc2hdKGh0dHA6Ly9sb2Rhc2guY29tL2RvY3MjbWF4KSdzIGBtYXhgIG1ldGhvZFxuICByYW5nZU1heDogKHBhcmFtcy4uLikgLT5cbiAgICBfLm1heCBwYXJhbXMuLi5cblxuICAjICMjIHN0cmluZ1JhbmdlVG9TdWJSYW5nZXNcbiAgIyMjXG4gIFRha2UgYW4gYXJyYXkgb2Ygc3RyaW5nIHZhbHVlcyBhbmQgYSBudW1iZXIgb2YgcGFydGl0aW9ucyB0byBjcmVhdGUuXG4gIFVzZXMgdGhlIGZpcnN0IGxldHRlciBvZiBlYWNoIHN0cmluZyB2YWx1ZSBpbiB0aGUgYXJyYXkgdG8gY29udmVydCB0byB1bmlxdWUgY29kZSBjaGFyYWN0ZXIgKGxvd2VyIGNhc2UpXG4gIEJ1aWxkcyBhIGludCByYW5nZSBiYXNlZCBvbiB1bmlxdWUgY29kZSBjaGFycy5cbiAgIyMjXG4gIHN0cmluZ1RvU3ViUmFuZ2VzOiAobiA9IDYsIHJhbmdlID0gW10pIC0+XG4gICAgY2hhclJhbmdlID0gW11cblxuXG4gICAgZWFjaCByYW5nZSwgKHZhbCkgLT5cbiAgICAgIGNoYXIgPSB2YWwudHJpbSgpWzBdLnRvTG93ZXJDYXNlKClcbiAgICAgIGlmIGZhbHNlIGlzIG9iai5jb250YWlucyBjaGFyUmFuZ2UsIGNoYXJcbiAgICAgICAgY2hhclJhbmdlLnB1c2ggY2hhci5jaGFyQ29kZUF0KClcblxuICAgIHJldCA9IHJuZy50b1N1YlJhbmdlcyBuLCBjaGFyUmFuZ2VcblxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IG5cbiAgICAgIGkgKz0gMVxuICAgICAgc3ViUmFuZ2UgPSByZXRbaV1cbiAgICAgIHN1YlJhbmdlLm1hcCBTdHJpbmcuZnJvbUNoYXJDb2RlXG5cbiAgICBvbGRHZXRSYW5nZSA9IHJldC5nZXRSYW5nZVxuICAgIHJldC5nZXRSYW5nZSA9ICh2YWwpIC0+XG4gICAgICBjaGFyID0gdmFsLnRyaW0oKVswXS50b0xvd2VyQ2FzZSgpLmNoYXJDb2RlQXQoKVxuICAgICAgaWR4ID0gb2xkR2V0UmFuZ2UgY2hhclxuICAgICAgaWR4XG4gICAgcmV0XG5cbiAgIyAjIyByYW5nZVRvU3ViUmFuZ2VzXG4gICMjI1xuICBUYWtlIGFuIGFycmF5IG9mIGludCB2YWx1ZXMgYW5kIGEgbnVtYmVyIG9mIHBhcnRpdGlvbnMgdG8gY3JlYXRlLlxuICBEaXZpZGVzIHRoZSBvcmlnaW5hbCBhcnJheSBpbnRvIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIHN1YiBhcnJheXMuXG4gIE92ZXJmbG93IGlzIHBhc3NlZCB0byB0aGUgZmluYWwgcGFydGl0aW9uLlxuICAjIyNcbiAgdG9TdWJSYW5nZXM6IChuID0gNiwgcmFuZ2UgPSBbXSkgLT5cbiAgICByZXQgPSBvYmoub2JqZWN0KClcbiAgICByYW5nZUxvdyA9IHJuZy5yYW5nZU1pbiByYW5nZVxuICAgIHJhbmdlSGlnaCA9IHJuZy5yYW5nZU1heCByYW5nZVxuXG4gICAgZGlzdGFuY2UgPSByYW5nZUhpZ2ggLSByYW5nZUxvd1xuICAgIHN1YlJhbmdlU2l6ZSA9IGRpc3RhbmNlL25cbiAgICBzdWJSYW5nZXMgPSByZXQuYWRkICdyYW5nZXMnLCBvYmoub2JqZWN0KClcbiAgICBjaHVua1ZhbCA9IHJhbmdlTG93XG5cbiAgICBtYXAgPSBvYmoub2JqZWN0KClcblxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IG5cbiAgICAgIGkgKz0gMVxuICAgICAgaWYgaSA8IG4gdGhlbiBqdW1wID0gTWF0aC5yb3VuZCBzdWJSYW5nZVNpemVcbiAgICAgIGVsc2VcbiAgICAgICAganVtcCA9IE1hdGguZmxvb3Igc3ViUmFuZ2VTaXplXG4gICAgICAgIGlmIGNodW5rVmFsICsganVtcCA8PSByYW5nZUhpZ2hcbiAgICAgICAgICBqdW1wICs9IHJhbmdlSGlnaCAtIGNodW5rVmFsIC0ganVtcCArIDFcblxuICAgICAgc3ViUmFuZ2UgPSBybmcucmFuZ2UgY2h1bmtWYWwsIGNodW5rVmFsICsganVtcFxuICAgICAgZWFjaCBzdWJSYW5nZSwgKHZhbCkgLT4gbWFwLmFkZCB2YWwsIGlcbiAgICAgIHN1YlJhbmdlc1tpXSA9IHN1YlJhbmdlXG4gICAgICBjaHVua1ZhbCArPSBqdW1wXG5cbiAgICByZXQuYWRkICdnZXRSYW5nZScsICh2YWwpIC0+XG4gICAgICBtYXBbdmFsXVxuXG4gICAgcmV0XG5cbk9iamVjdC5zZWFsIHJuZ1xuT2JqZWN0LmZyZWV6ZSBybmdcblxuT0oucmVnaXN0ZXIgJ3JhbmdlcycsIHJuZ1xubW9kdWxlLmV4cG9ydHMgPSBybmdcbiIsIk9KID0gcmVxdWlyZSAnLi4vb2onXG4kID0gcmVxdWlyZSAnanF1ZXJ5J1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbklTID0gcmVxdWlyZSAnLi9pcydcblxuIyAjIHRvXG5jbGFzcyBUTyBcbiAgIyAjIyBib29sXG4gICMgY29udmVydCBhbnkgY29tcGF0aWJsZSBvYmplY3QgdG8gYSBib29sZWFuLiBJbmNvbXBhdGlibGUgb2JqZWN0cyBhcmUgZmFsc2UuXG4gIEBib29sOiAoc3RyKSAtPlxuICAgIHJldEJvb2wgPSBJU1sndHJ1ZSddKHN0cilcbiAgICByZXRCb29sID0gZmFsc2UgIGlmIHJldEJvb2wgaXMgZmFsc2Ugb3IgcmV0Qm9vbCBpc250IHRydWVcbiAgICByZXRCb29sXG5cbiAgIyAjIyBFUzVfVG9Cb29sXG4gICMgKGRlYnVnKSBtZXRob2QgdG8gZXhwbGljaXRseSBmb3JjZSBhbiBgaWYob2JqKWAgZXZhbHVhdGlvbiB0byBmbG93IHRocm91Z2ggdGhlIEVTNSBzcGVjIGZvciB0cnV0aGluZXNzXG4gIEBFUzVfVG9Cb29sOiAodmFsKSAtPlxuICAgIHZhbCBpc250IGZhbHNlIGFuZCB2YWwgaXNudCAwIGFuZCB2YWwgaXNudCAnJyBhbmQgdmFsIGlzbnQgbnVsbCBhbmQgdHlwZW9mIHZhbCBpc250ICd1bmRlZmluZWQnIGFuZCAodHlwZW9mIHZhbCBpc250ICdudW1iZXInIG9yIG5vdCBpc05hTih2YWwpKVxuXG4gICMgIyMgZGF0ZUZyb21UaWNrc1xuICAjIHRha2UgYSBudW1iZXIgcmVwcmVzZW50aW5nIHRpY2tzIGFuZCBjb252ZXJ0IGl0IGludG8gYW4gaW5zdGFuY2Ugb2YgRGF0ZVxuICBAZGF0ZUZyb21UaWNrczogKHRpY2tTdHIpIC0+XG4gICAgdGljc0RhdGVUaW1lID0gQHN0cmluZyh0aWNrU3RyKVxuICAgIHJldCA9IHVuZGVmaW5lZFxuICAgIHRpY2tzID0gdW5kZWZpbmVkXG4gICAgb2Zmc2V0ID0gdW5kZWZpbmVkXG4gICAgbG9jYWxPZmZzZXQgPSB1bmRlZmluZWRcbiAgICBhcnIgPSB1bmRlZmluZWRcbiAgICBpZiBmYWxzZSBpcyBJUy5udWxsT3JFbXB0eSh0aWNzRGF0ZVRpbWUpXG4gICAgICB0aWNzRGF0ZVRpbWUgPSB0aWNzRGF0ZVRpbWUucmVwbGFjZSgnLycsICcnKVxuICAgICAgdGljc0RhdGVUaW1lID0gdGljc0RhdGVUaW1lLnJlcGxhY2UoJ0RhdGUnLCAnJylcbiAgICAgIHRpY3NEYXRlVGltZSA9IHRpY3NEYXRlVGltZS5yZXBsYWNlKCcoJywgJycpXG4gICAgICB0aWNzRGF0ZVRpbWUgPSB0aWNzRGF0ZVRpbWUucmVwbGFjZSgnKScsICcnKVxuICAgICAgYXJyID0gdGljc0RhdGVUaW1lLnNwbGl0KCctJylcbiAgICAgIGlmIGFyci5sZW5ndGggPiAxXG4gICAgICAgIHRpY2tzID0gQG51bWJlcihhcnJbMF0pXG4gICAgICAgIG9mZnNldCA9IEBudW1iZXIoYXJyWzFdKVxuICAgICAgICBsb2NhbE9mZnNldCA9IG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKVxuICAgICAgICByZXQgPSBuZXcgRGF0ZSgodGlja3MgLSAoKGxvY2FsT2Zmc2V0ICsgKG9mZnNldCAvIDEwMCAqIDYwKSkgKiAxMDAwKSkpXG4gICAgICBlbHNlIGlmIGFyci5sZW5ndGggaXMgMVxuICAgICAgICB0aWNrcyA9IEBudW1iZXIoYXJyWzBdKVxuICAgICAgICByZXQgPSBuZXcgRGF0ZSh0aWNrcylcbiAgICByZXRcblxuICAjICMjIGJpbmFyeVxuICAjIGNvbnZlcnQgYW4gb2JqZWN0IHRvIGJpbmFyeSAwIG9yIDFcbiAgQGJpbmFyeTogKG9iaikgLT5cbiAgICByZXQgPSBOYU5cbiAgICBpZiBvYmogaXMgMCBvciBvYmogaXMgJzAnIG9yIG9iaiBpcyAnJyBvciBvYmogaXMgZmFsc2Ugb3IgQHN0cmluZyhvYmopLnRvTG93ZXJDYXNlKCkudHJpbSgpIGlzICdmYWxzZSdcbiAgICAgIHJldCA9IDBcbiAgICBlbHNlIHJldCA9IDEgIGlmIG9iaiBpcyAxIG9yIG9iaiBpcyAnMScgb3Igb2JqIGlzIHRydWUgb3IgQHN0cmluZyhvYmopLnRvTG93ZXJDYXNlKCkudHJpbSgpIGlzICd0cnVlJ1xuICAgIHJldFxuXG5cbiAgIyAjIyBudW1iZXJcbiAgI1xuICAjIEF0dGVtcHRzIHRvIGNvbnZlcnQgYW4gYXJiaXRyYXJ5IHZhbHVlIHRvIGEgTnVtYmVyLlxuICAjIExvb3NlIGZhbHN5IHZhbHVlcyBhcmUgY29udmVydGVkIHRvIDAuXG4gICMgTG9vc2UgdHJ1dGh5IHZhbHVlcyBhcmUgY29udmVydGVkIHRvIDEuXG4gICMgQWxsIG90aGVyIHZhbHVlcyBhcmUgcGFyc2VkIGFzIEludGVnZXJzLlxuICAjIEZhaWx1cmVzIHJldHVybiBhcyBOYU4uXG4gICNcbiAgQG51bWJlcjogKGlucHV0TnVtLCBkZWZhdWx0TnVtKSAtPlxuICAgIHRyeUdldE51bWJlciA9ICh2YWwpID0+XG4gICAgICByZXQgPSBOYU5cbiAgICAgICMgaWYgYHZhbGAgYWxyZWFkeSAoaXMpW2lzLmh0bWxdIGEgTnVtYmVyLCByZXR1cm4gaXRcbiAgICAgIGlmIElTLm51bWJlcih2YWwpXG4gICAgICAgIHJldCA9IHZhbFxuICAgICAgIyBlbHNlIGlmIGB2YWxgIGFscmVhZHkgKGlzKVtpcy5odG1sXSBhIFN0cmluZyBvciBhIEJvb2xlYW4sIGNvbnZlcnQgaXRcbiAgICAgIGVsc2UgaWYgSVMuc3RyaW5nKHZhbCkgb3IgSVMuYm9vbCh2YWwpXG4gICAgICAgIHRyeUdldCA9ICh2YWx1ZSkgPT5cbiAgICAgICAgICBudW0gPSBAYmluYXJ5KHZhbHVlKVxuICAgICAgICAgIG51bSA9ICt2YWx1ZSAgaWYgbm90IElTLm51bWJlcihudW0pIGFuZCB2YWx1ZVxuICAgICAgICAgIG51bSA9IF8ucGFyc2VJbnQodmFsdWUsIDApIGlmIG5vdCBJUy5udW1iZXIobnVtKVxuICAgICAgICAgIG51bVxuICAgICAgICByZXQgPSB0cnlHZXQgdmFsXG4gICAgICByZXRcblxuICAgIHJldFZhbCA9IHRyeUdldE51bWJlcihpbnB1dE51bSlcbiAgICBpZiBub3QgSVMubnVtYmVyKHJldFZhbClcbiAgICAgIHJldFZhbCA9IHRyeUdldE51bWJlcihkZWZhdWx0TnVtKVxuICAgICAgcmV0VmFsID0gTnVtYmVyLk5hTiBpZiBub3QgSVMubnVtYmVyKHJldFZhbClcbiAgICByZXRWYWxcblxuICAjICMjIHN0cmluZ1xuICAjIGNvbnZlcnQgYW4gb2JqZWN0IHRvIHN0cmluZ1xuICBAc3RyaW5nOiAoaW5wdXRTdHIsIGRlZmF1bHRTdHIpIC0+XG4gICAgdHJ5R2V0U3RyaW5nID0gKHN0cikgPT5cbiAgICAgIHJldCA9IHVuZGVmaW5lZFxuICAgICAgaWYgSVMuc3RyaW5nKHN0cilcbiAgICAgICAgcmV0ID0gc3RyXG4gICAgICBlbHNlXG4gICAgICAgIHJldCA9ICcnXG4gICAgICAgIHJldCA9IHN0ci50b1N0cmluZygpICBpZiBJUy5ib29sKHN0cikgb3IgSVMubnVtYmVyKHN0cikgb3IgSVMuZGF0ZShzdHIpXG4gICAgICByZXRcbiAgICByZXQxID0gdHJ5R2V0U3RyaW5nKGlucHV0U3RyKVxuICAgIHJldDIgPSB0cnlHZXRTdHJpbmcoZGVmYXVsdFN0cilcbiAgICByZXRWYWwgPSAnJ1xuICAgIGlmIHJldDEubGVuZ3RoIGlzbnQgMFxuICAgICAgcmV0VmFsID0gcmV0MVxuICAgIGVsc2UgaWYgcmV0MSBpcyByZXQyIG9yIHJldDIubGVuZ3RoIGlzIDBcbiAgICAgIHJldFZhbCA9IHJldDFcbiAgICBlbHNlXG4gICAgICByZXRWYWwgPSByZXQyXG4gICAgcmV0VmFsXG5cbk9KLnJlZ2lzdGVyICd0bycsIFRPXG5tb2R1bGUuZXhwb3J0cyA9IFRPIiwiIyAjIGNyZWF0ZVVVSURcblxuT0ogPSByZXF1aXJlICcuLi9vaidcbiAgXG4jIyNcbkdlbmVyYXRlcyBhIHJhbmRvbSBzdHJpbmcgdGhhdCBjb21wbGllcyB0byB0aGUgUkZDIDQxMjIgc3BlY2lmaWNhdGlvbiBmb3IgR1VJRC9VVUlELlxuKGUuZy4gJ0I0MkExNTNGLTFEOUEtNEY5Mi05OTAzLTkyQzExREQ2ODREMicpXG5XaGlsZSBub3QgYSB0cnVlIFVVSUQsIGZvciB0aGUgcHVycG9zZXMgb2YgdGhpcyBhcHBsaWNhdGlvbiwgaXQgc2hvdWxkIGJlIHN1ZmZpY2llbnQuXG4jIyNcbmNyZWF0ZUZhdXhVVUlEID0gLT5cbiAgICBcbiAgIyBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmM0MTIyLnR4dFxuICAjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA1MDM0L2hvdy10by1jcmVhdGUtYS1ndWlkLXV1aWQtaW4tamF2YXNjcmlwdFxuICBzID0gW11cbiAgcy5sZW5ndGggPSAzNlxuICBoZXhEaWdpdHMgPSAnMDEyMzQ1Njc4OWFiY2RlZidcbiAgaSA9IDBcblxuICB3aGlsZSBpIDwgMzZcbiAgICBzW2ldID0gaGV4RGlnaXRzLnN1YnN0cihNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAweDEwKSwgMSlcbiAgICBpICs9IDFcbiAgc1sxNF0gPSAnNCcgIyBiaXRzIDEyLTE1IG9mIHRoZSB0aW1lX2hpX2FuZF92ZXJzaW9uIGZpZWxkIHRvIDAwMTBcbiAgc1sxOV0gPSBoZXhEaWdpdHMuc3Vic3RyKChzWzE5XSAmIDB4MykgfCAweDgsIDEpICMgYml0cyA2LTcgb2YgdGhlIGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWQgdG8gMDFcbiAgc1s4XSA9IHNbMTNdID0gc1sxOF0gPSBzWzIzXSA9ICctJ1xuICB1dWlkID0gcy5qb2luKCcnKVxuICB1dWlkXG5cbk9KLnJlZ2lzdGVyICdjcmVhdGVVVUlEJywgY3JlYXRlRmF1eFVVSURcbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRmF1eFVVSUQiXX0=
