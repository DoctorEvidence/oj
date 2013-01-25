/*global OJ:true,$:true*/
(function () {

    OJ.makeSubNameSpace('dom');

    OJ.dom.lift('nodeWrapper', function (OjNode, DomEl) {
            'use strict';

            var OjInternal = {
                data: {},
                enabled: true,
                isValid: false
            };
            OjNode = OjNode || Object.create({ 0: null, $: $({}), isValid: false });

            (function _initConstructor() {

                //Setup our Node instance
                if(true !== OjNode.isValid) {

                    if (OjNode &&
                        OjNode[0] instanceof HTMLElement &&
                        OJ.is.jQuery(OjNode.$)) {
                        OjInternal.isValid = true;
                    }
                    else if (OJ.is.jQuery(DomEl)) {
                        Object.defineProperty(OjNode, '$', {
                            value: DomEl
                        });
                        Object.defineProperty(OjNode, '0', {
                            value: DomEl[0]
                        });
                        OjInternal.isValid = true;
                    }
                    else if (DomEl instanceof HTMLElement) {
                        Object.defineProperty(OjNode, '0', {
                            value: DomEl
                        });
                        Object.defineProperty(OjNode, '$', {
                            value: $('#' + DomEl.id)
                        });
                        OjInternal.isValid = true;
                    } else {
                        OjInternal.isValid = false;
                    }
                    Object.defineProperty(OjNode, 'isValid', {
                            value: OjInternal.isValid
                        });
                    Object.defineProperty(OjNode, 'childNodes', {
                            value: [],
                            writable: true
                        });
                }

                Object.defineProperty(OjInternal, 'chainChildNode', { value: function ($child) {
                    var ret;
                    var newNode = Object.create(null);

                    Object.defineProperty(newNode, 'parent', {value: OjNode});
                    Object.defineProperty(newNode, 'root', {value: OjNode.root});

                    if (false === OJ.is.nullOrEmpty($child) && $child.length > 0) {
                        Object.defineProperty(newNode, '$', {value: $child});
                        Object.defineProperty(newNode, '0', {value: $child[0]});
                    }
                    ret = OJ.dom.nodeWrapper(newNode);
                    OjNode.childNodes.push(newNode);
                    return ret;
                }});

                Object.defineProperty(OjInternal, 'wrapChildNode', { value: function ($child) {
                    var ret;
                    var newNode = Object.create(null);

                    Object.defineProperty(newNode, 'root', {value: OjNode.root});

                    if (false === OJ.is.nullOrEmpty($child) && $child.length > 0) {
                        Object.defineProperty(newNode, '$', {value: $child});
                        Object.defineProperty(newNode, '0', {value: $child[0]});
                    }
                    ret = OJ.dom.nodeWrapper(newNode);
                    return ret;
                }});

                Object.defineProperty(OjInternal, 'isNodeAlive', { value: function () {
                    return false === OJ.is.nullOrEmpty(OjNode);
                }});

            }()); //end initConstructor

            //Define some internal data methods
            Object.defineProperty(OjInternal, 'getDataProp', { value: function (propName) {
                var ret = null;
                if (OjInternal.isNodeAlive() &&
                    false === OJ.is.stringNullOrEmpty(propName)) {

                    if (OjNode[0] && OjNode[0].dataset && OjNode[0].dataset[propName]) {
                        ret = OjNode[0].dataset.propName;
                    }
                    if (OJ.is.stringNullOrEmpty(ret)) {
                        ret = OjInternal.data[propName] ||
                            OjNode.$.data(propName) ||
                            OJ.localStorage.getItem(propName + '_control_data_' + OjNode.getId());
                    }
                }
                return ret;
            }});

            Object.defineProperty(OjInternal, 'setDataProp', { value: function (propName, value) {
                var ret = null;
                if (OjInternal.isNodeAlive() &&
                    false === OJ.is.stringNullOrEmpty(propName)) {
                    ret = value;
                    if (OjNode[0] && OjNode[0].dataset) {
                        OjNode[0].dataset[propName] = value;

                        OjInternal.data[propName] = value;
                    } else {
                        OjInternal.data[propName] = value;
                        OjNode.$.data(propName, value);
                    }
                }
                return ret;
            }});

            Object.defineProperty(OjInternal, 'setDataProperties', { value: function (obj) {
                OJ.each(obj, function (val, propName) {
                    OjInternal.setDataProp(propName, val);
                });
            }});


            /**
              OJ doesn't need many jQuery selectors,
              but when it does they are sequestered on this property to "try" to avoid confusion.
            */
            var el = Object.create(null);

            Object.defineProperty(el, 'children', {value: function (searchTerm, selector) {
                var ret = [];
                if (OjInternal.isNodeAlive()) {
                    var $children = OjNode.$.children(OJ.to.string(searchTerm), OJ.to.string(selector));
                    if($children) {
                        $children.each(function() {
                            var $child = $(this);
                            ret.push(OjInternal.chainChildNode($child));
                        });
                    }
                }
                return ret;
            }});

            Object.defineProperty(el, 'filter', { value: function (selector) {
                var ret = [];
                if (OjInternal.isNodeAlive()) {
                    var $children = OjNode.$.filter(selector);
                    if($children.length > 0) {
                        $children.each(function() {
                            var $child = $(this);
                            ret.push(OjInternal.wrapChildNode($child));
                        });
                    }
                }
                return ret;
            }});

            Object.defineProperty(el, 'find', { value: function (selector) {
                var ret = [];
                if (OjInternal.isNodeAlive()) {
                    var $children = OjNode.$.find(selector);
                    if($children.length > 0) {
                        $children.each(function() {
                            var $child = $(this);
                            ret.push(OjInternal.wrapChildNode($child));
                        });
                    }
                }
                return ret;
            }});

            Object.defineProperty(el, 'first', { value: function () {
                var ret = OjNode.childNodes[0] || OjNode.el.children[0];
                return ret;
            }});

            Object.defineProperty(el, 'parent', { value: function () {
                var ret = {};
                if (OjInternal.isNodeAlive()) {
                    var $parent = OjNode.$.parent();

                    if (false === OJ.is.nullOrEmpty($parent) && $parent.length > 0) {
                        ret = OJ.dom.nodeWrapper({}, $parent);
                    }
                }
                return ret;
            }});

            /**
                OJ implements these wrappers around jQuery methods to provide better chaining on OJ Nodes,
                as well as to make it easy to swap out the DOM framework without having to change the interfaces
            */
            Object.defineProperty(OjNode, 'addClass', { value: function (name) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.addClass(name);
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'append', { value: function (object) {
                if (OjInternal.isNodeAlive()) {
                    OJ.tryThisThenThat(function _first() {
                        OjNode.$.append(object);
                    }, function _second() {
                        //Probably attempted to append a string which matched a selector (e.g. 'a')
                        //which will attempt to (and fail to) append all <a> nodes to this one.
                        if (OJ.is.string(object)) {
                            OjNode.text(object);
                        }
                    });
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'attr', { value: function (name, value) {
                var ret = null;
                if (OjInternal.isNodeAlive()) {
                    ret = OjNode;

                    if(OJ.is.plainObject(name)) {
                        OjNode.$.attr(name);
                    } else  if(arguments.length === 1) {
                        ret = OjNode.$.attr(name);
                    } else {
                        OjNode.$.attr(name, value);
                    }
                }
                return ret;
            }});

            Object.defineProperty(OjNode, 'attach', { value: function (object) {
                var $child = null, ret;
                if (OjInternal.isNodeAlive()) {
                    OJ.tryThisThenThat(function _first() {
                        $child = $(object);
                        if (false === OJ.is.nullOrEmpty($child)) {
                            OjNode.append($child);
                            ret = OjInternal.chainChildNode($child);
                        }
                    }, function _second() {

                    });
                }
                return ret;
            }});

            Object.defineProperty(OjNode, 'bind', {value : function (eventName, event) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.on(eventName, event);
                }
                return OjNode;
            }});
            Object.defineProperty(OjNode, 'on', {value : OJ.bind });

            Object.defineProperty(OjNode, 'clickOnEnter', {value: function (anOjNode) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.clickOnEnter(anOjNode.$);
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'css', { value: function (param1, param2) {
                var ret = OjNode;
                if (OjInternal.isNodeAlive()) {
                    if (OJ.is.plainObject(param1)) {
                        OjNode.$.css(param1);
                    } else if(arguments.length === 1) {
                        ret = OjNode.$.css(param1);
                    } else {
                        OjNode.$.css(param1, param2);
                    }
                }
                return ret;
            }});

            Object.defineProperty(OjNode, 'data', { value: function (prop, val) {
                var ret = '';
                if (OjInternal.isNodeAlive()) {
                    if (OJ.isPlainObject(prop)) {
                        OjInternal.setDataProperties(prop);
                    } else {
                        switch (arguments.length) {
                            case 1:
                                ret = OjInternal.getDataProp(prop);
                                break;
                            case 2:
                                OjInternal.setDataProp(prop, val);
                                ret = OjNode;
                                break;
                        }
                    }
                }
                return ret;

            }});

            Object.defineProperty(OjNode, 'disable', { value: function () {
                if (OjInternal.isNodeAlive()) {
                    OjInternal.enabled = false;
                    OjNode.addClass('OjDisabled');
                    OjNode.attr('disabled', 'disabled');
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'empty', { value: function () {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.empty();
                    OjNode.childNodes = [];
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'enable', { value:  function () {
                if (OjInternal.isNodeAlive()) {
                    OjInternal.enabled = true;
                    OjNode.removeClass('OjDisabled');
                    OjNode.removeAttr('disabled');
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'getId', { value: function () {
                var ret = '';
                if (OjInternal.isNodeAlive()) {
                    ret = OjNode[0].id;
                }
                return ret;
            }});

            Object.defineProperty(OjNode, 'hide', { value: function () {
                if (OjInternal.isNodeAlive()) {
                    OjNode.addClass('OjHidden');
                    OjNode.$.hide();
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'length', { value: function () {
                var ret = 0;
                if (OjInternal.isNodeAlive()) {
                    ret = OJ.to.number(OjNode.$.length);
                }
                return ret;
            }});

            Object.defineProperty(OjNode, 'prop', { value: function (name, value) {
                var ret = null;
                if (OjInternal.isNodeAlive()) {
                    ret = OjNode;

                    if(OJ.is.plainObject(name)) {
                        OjNode.$.prop(name);
                    } else  if(arguments.length === 1) {
                        ret = OjNode.$.prop(name);
                    } else {
                        OjNode.$.prop(name, value);
                    }
                }
                return ret;
            }});

            Object.defineProperty(OjNode, 'remove', { value: function () {
                if(OjNode && OjNode.$) {
                    OjNode.$.remove();
                    OjNode.childNodes = [];
                    //This will update the internal reference to the node,
                    //which will allow isNodeAlive() to work as expected;
                    //however, it won't delete outstanding references to the Node.
                    //But that's OK. The GC will clean-up just fine.
                    OjNode = null;
                }
                return null;
            }});

            Object.defineProperty(OjNode, 'removeClass', { value: function (name) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.removeClass(name);
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'removeProp', { value: function (name) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.removeProp(name);
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'removeAttr', { value: function (name) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.removeAttr(name);
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'show', { value: function () {
                if (OjInternal.isNodeAlive()) {
                    OjNode.removeClass('OjHidden');
                    OjNode.$.show();
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'text', { value: function (text) {
                if (OjInternal.isNodeAlive()) {
                    if (arguments.length === 1 && false === OJ.is.nullOrUndefined(text)) {
                        OjNode.$.text(text);
                        return OjNode;
                    } else {
                        return OJ.to.string(OjNode.$.text());
                    }
                }
            }});

            Object.defineProperty(OjNode, 'toggle', { value: function () {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.toggle();
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'toggleEnable', { value: function () {
                if (OjInternal.isNodeAlive()) {
                    if (OjInternal.enabled) {
                        OjNode.disable();
                    } else {
                        OjNode.enable();
                    }
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'trigger', { value: function (eventName, eventOpts) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.trigger(eventName, eventOpts);
                }
                return OjNode;
            }});

            Object.defineProperty(OjNode, 'unbind', { value: function (eventName, event) {
                if (OjInternal.isNodeAlive()) {
                    OjNode.$.off(eventName, event);
                }
                return OjNode;
            }});
            Object.defineProperty(OjNode, 'off', { value:  OjNode.unbind });

            Object.defineProperty(OjNode, 'valueOf', { value: function () {
                return OjNode;
            }});

            /**
                Individual DOM classes will need to override this method.
            */
            OjNode.val = OjNode.val || function (value) {
                if (OjInternal.isNodeAlive()) {
                    if (arguments.length === 1 && false === OJ.is.nullOrUndefined(value)) {
                        OjNode.$.val(value);
                        return OjNode;
                    } else {
                        return OJ.to.string(OjNode.$.val());
                    }
                }
            };


            //Finally! Return something.
            return OjNode;
        });

} ());


