
/**
 * Domes library
 *
 * @author      Thomas Josseau
 * @version     0.0.10
 * @date        2014.09.25
 * @link        https://github.com/tjosseau/domes
 *
 * @description
 *      Tiny DOM elements manager.
 */

void function(root) {
    "use strict" ;

    var domes,
        NODE_EXISTS = typeof root.Node !== 'undefined',
        CLASSLIST_EXISTS = "classList" in document.createElement("div"),
        ELEMENT_NODE = 1,

        copy = function(context, object)
        {
            for (var p in object)
                if (object.propertyIsEnumerable(p))
                    context[p] = object[p] ;
            return context ;
        },

        parseAttributes = function(attributes)
        {
            var attrs = {},
                a = attributes.length ;
            while (a--) attrs[attributes[a].name] = attributes[a].value ;
            return attrs ;
        },

        performClasses = CLASSLIST_EXISTS ?
            function(element, perform, value)
            {
                switch (perform) {
                    case 'a' :
                        return element.classList.add(value) ;
                    case 'r' :
                        return element.classList.remove(value) ;
                    case 't' :
                        return element.classList.toggle(value) ;
                    case 'c' :
                        return element.classList.contains(value) ;
                }
            } :
            function(element, perform, value)
            {
                switch (perform) {
                    case 'a' :
                        if (!performClasses(element, 'c', value))
                            element.className += " "+value ;
                        break ;
                    case 'r' :
                        element.className = element.className.replace(
                            new RegExp('(^|\\s)'+value+'(\\s|$)'), " "
                        ).replace(/\s$/, "") ;
                        break ;
                    case 't' :
                        if (performClasses(element, 'c', value))
                            performClasses(element, 'a', value) ;
                        else
                            performClasses(element, 'r', value) ;
                        break ;
                    case 'c' :
                        return (" "+element.className+" ").indexOf(" "+value+" ") !== -1 ;
                }
            },

        queryTo = function(root, elset, query)
        {
            var result = root.querySelectorAll(query),
                rl = result.length ;
            elset.length = rl ;
            while(rl--) elset[rl] = result[rl] ;

            return elset ;
        } ;

    var DOMElementSet = function() {
        copy(this, {
            length : 0,
            events : []
        }) ;
    } ;
    copy(DOMElementSet, {
        prototype:
        {
            add : function(element)
            {
                if (element && element.nodeType === ELEMENT_NODE && !this.contains(element))
                    this[this.length++] = element ;

                return this ;
            },

            trim : function()
            {
                if (arguments.length) {
                    var i,
                        il = this.length,
                        children = new DOMElementSet().merge(arguments),
                        ci,
                        cil = children.length,
                        deleted = [] ;

                    for (i=0 ; i<il ; i++)
                        for (ci=0 ; ci<cil ; ci++)
                            if (this[i] === children[ci]) {
                                deleted.push(i) ;
                                break ;
                            }

                    var d = deleted.length ;
                    while (d--)
                        Array.prototype.splice.call(this, deleted[d], 1) ;
                }
                else {
                    while (this.length)
                        delete this[this.length--] ;
                }

                return this ;
            },

            remove : function()
            {
                var child,
                    i = this.length ;
                while (i--)
                    if ((child = this[i]).parentNode)
                        child.parentNode.removeChild(child) ;

                return this ;
            },

            clone : function()
            {
                return new DOMElementSet().merge(this) ;
            },

            merge : function()
            {
                var a = -1,
                    l,
                    el,
                    e ;
                while ((el = arguments[++a])) {
                    if (el instanceof DOMElementSet) {
                        l = el.length-1 ;
                        e = -1 ;
                        while (e++ < l) this.add(arguments[a][e]) ;
                    }
                    else if (el.length > -1) {
                        l = el.length-1 ;
                        e = -1 ;
                        while (e++ < l) this.merge(arguments[a][e]) ;
                    }
                    else this.add(el) ;
                }

                return this ;
            },

            get : function(i)
            {
                return new DOMElementSet().add(this[i]) ;
            },

            contains : function(element)
            {
                var l = this.length ;
                while (l--)
                    if (element === this[l])
                        return true ;
                return false ;
            },

            first : function()
            {
                return this.get(0) ;
            },

            last : function()
            {
                return this.get(this.length-1) ;
            },

            element : function()
            {
                return this[0] ;
            },

            elements : function()
            {
                var els = [],
                    l = this.length-1,
                    e = -1 ;
                while (e++ < l)
                    els.push(this[e]) ;

                return els ;
            },
            
            each : function(fn)
            {
                var l = this.length-1,
                    e = -1 ;
                while (e++ < l)
                    fn.call(this[e], this[e], e) ;
                    
                return this ;
            },

            parent : function()
            {
                var set = new DOMElementSet(),
                    l = this.length-1,
                    e = -1 ;
                while (e++ < l)
                    set.add(this[e].parentNode) ;

                return set ;
            },

            children : function()
            {
                var set = new DOMElementSet(),
                    l = this.length-1,
                    c,
                    cl,
                    el,
                    e = -1 ;
                while (e++ < l) {
                    el = this[e] ;
                    c = -1 ;
                    cl = el.childNodes.length ;
                    while (c++ < cl) set.add(el.childNodes[c]) ;
                }

                return set ;
            },

            next : NODE_EXISTS ?
                function()
                {
                    var set = new DOMElementSet(),
                        l = this.length-1,
                        e = -1 ;
                    while (e++ < l)
                        set.add(this[e].nextElementSibling) ;

                    return set ;
                } :
                function()
                {
                    var set = new DOMElementSet(),
                        l = this.length-1,
                        el,
                        e = -1 ;
                    while (e++ < l) {
                        el = this[e] ;
                        do { el = el.nextSibling ; } while (el && el.nodeType !== ELEMENT_NODE) ;
                        set.add(el) ;
                    }

                    return set ;
                },

            previous : NODE_EXISTS ?
                function()
                {
                    var set = new DOMElementSet(),
                        l = this.length-1,
                        e = -1 ;
                    while (e++ < l)
                        set.add(this[e].previousElementSibling) ;

                    return set ;
                } :
                function()
                {
                    var set = new DOMElementSet(),
                        l = this.length-1,
                        el,
                        e = -1 ;
                    while (e++ < l) {
                        el = this[e] ;
                        do { el = el.previousSibling ; } while (el && el.nodeType !== ELEMENT_NODE) ;
                        set.add(el) ;
                    }

                    return set ;
                },
            
            query : function(query)
            {
                var set = new DOMElementSet(),
                    l = this.length-1,
                    e = -1 ;
                
                while (e++ < l)
                    queryTo(this[e], set, query) ;
                
                return set ;
            },

            type : function()
            {
                if (!this.length) return '' ;

                var l = this.length,
                    el,
                    type ;
                while (l--) {
                    el = this[l] ;
                    if (type && el.tagName !== type) return '*' ;
                    else type = el.tagName ;
                }

                return type.toLowerCase() ;
            },

            outer : function(el)
            {
                var l = this.length-1,
                    e = -1 ;

                if (el == null || el === true) {
                    if (l === -1) return null ;
                    var htmls = [] ;
                    while (e++ < l)
                        htmls.push(this[e].outerHTML) ;

                    return el === true ? htmls : htmls.join("") ;
                }

                if (typeof el === 'string')
                    while (e++ < l)
                        this[e].outerHTML = el ;
                else if (el.nodeType === ELEMENT_NODE)
                    while (e++ < l)
                        this[e].outerHTML = el.outerHTML ;
                else if (el instanceof DOMElementSet)
                    while (e++ < l)
                        this[e].outerHTML = el.outer() ;
                else
                    while (e++ < l)
                        this[e].outerHTML = el.toString() ;

                return this ;
            },

            inner : function(el)
            {
                var l = this.length-1,
                    e = -1 ;

                if (el == null || el === true) {
                    if (l === -1) return null ;
                    var htmls = [] ;
                    while (e++ < l)
                        htmls.push(this[e].innerHTML) ;

                    return el === true ? htmls : htmls.join("") ;
                }

                if (typeof el === 'string')
                    while (e++ < l)
                        this[e].innerHTML = el ;
                else if (el.nodeType === ELEMENT_NODE)
                    while (e++ < l)
                        this[e].innerHTML = el.outerHTML ;
                else if (el instanceof DOMElementSet)
                    while (e++ < l)
                        this[e].innerHTML = el.outer() ;
                else
                    while (e++ < l)
                        this[e].innerHTML = el.toString() ;

                return this ;
            },

            empty : function()
            {
                this.inner("") ;

                return this ;
            },

            append : function(el)
            {
                var l = this.length-1,
                    e = -1 ;

                if (typeof el === 'string')
                    while (e++ < l)
                        this[e].insertAdjacentHTML('beforeend', el) ;
                else {
                    var target = this[l] ;
                    if (el.nodeType === ELEMENT_NODE)
                        target.appendChild(el) ;
                    else if (el instanceof DOMElementSet) {
                        l = el.length-1 ;
                        while (e++ < l)
                            target.appendChild(el[e]) ;
                    }
                }

                return this ;
            },

            appendTo : function(el)
            {
                domes(el).append(this) ;

                return this ;
            },

            prepend : function(el)
            {
                var l = this.length-1,
                    e = -1 ;

                if (typeof el === 'string')
                    while (e++ < l)
                        this[e].insertAdjacentHTML('afterbegin', el) ;
                else {
                    var target = this[l] ;
                    if (el.nodeType === ELEMENT_NODE)
                        target.insertBefore(el, target.firstChild) ;
                    else if (el instanceof DOMElementSet) {
                        e = el.length ;
                        while (e--)
                            target.insertBefore(el[e], target.firstChild) ;
                    }
                }

                return this ;
            },

            prependTo : function(el)
            {
                domes(el).prepend(this) ;

                return this ;
            },

            before : function(el)
            {
                var l = this.length-1,
                    e = -1 ;

                if (typeof el === 'string')
                    while (e++ < l)
                        this[e].insertAdjacentHTML('beforebegin', el) ;
                else {
                    var target = this[l] ;
                    if (el.nodeType === ELEMENT_NODE)
                        target.parentNode.insertBefore(el, target) ;
                    else if (el instanceof DOMElementSet) {
                        e = el.length ;
                        while (e--)
                            target.parentNode.insertBefore(el[e], target) ;
                    }
                }

                return this ;
            },

            after : function(el)
            {
                var l = this.length-1,
                    e = -1 ;

                if (typeof el === 'string')
                    while (e++ < l)
                        this[e].insertAdjacentHTML('afterend', el) ;
                else {
                    var target = this[l] ;
                    if (el.nodeType === ELEMENT_NODE)
                        target.parentNode.insertBefore(el, target.nextSibling) ;
                    else if (el instanceof DOMElementSet) {
                        e = el.length ;
                        while (e--)
                            target.parentNode.insertBefore(el[e], target.nextSibling) ;
                    }
                }

                return this ;
            },

            text : function(str)
            {
                var l = this.length-1,
                    e = -1 ;

                if (typeof str === 'string')
                    while (e++ < l)
                        this[e].innerText = str ;
                else {
                    if (l === -1) return null ;

                    var texts = [] ;
                    while (e++ < l)
                        texts.push(this[e].innerText) ;
                    return str === true ? texts : texts.join("") ;
                }

                return this ;
            },

            attr : function(obj, value)
            {
                var l = this.length-1,
                    e = -1 ;

                if (!obj)
                    return l > -1 ? parseAttributes(this[0].attributes) : null ;

                else if (obj === true) {
                    var attrs = [] ;
                    while (e++ < l)
                        attrs.push(parseAttributes(this[e].attributes)) ;
                    return attrs ;
                }

                else if (typeof obj === 'string') {
                    if (value === void 0)
                        return l > -1 ? this[0].getAttribute(obj) : null ;
                    else if (value === null)
                        while (e++ < l)
                            this[e].removeAttribute(obj) ;
                    else
                        while (e++ < l)
                            this[e].setAttribute(obj, value) ;
                }

                else if (typeof obj === 'object') {
                    while (e++ < l) {
                        for (var a in obj) {
                            if (obj[a] === null) this[e].removeAttribute(a) ;
                            else this[e].setAttribute(a, obj[a]) ;
                        }
                    }
                }

                return this ;
            },

            id : function(value)
            {
                // Getting
                if (!value)
                    return this.length ? this[0].getAttribute('id') : null ;

                if (value === true) {
                    var e = -1,
                        l = this.length-1,
                        ids = [] ;
                    while (e++ < l)
                        ids.push(this[e].getAttribute('id')) ;
                    return ids ;
                }
                // Setting
                if (this.length) this[0].setAttribute('id', value.toString()) ;

                return this ;
            },

            cl : function(name, value)
            {
                if (!name)
                    return this.length ? this[0].getAttribute('class') : null ;

                var l = this.length-1,
                    e = -1 ;

                if (name === true) {
                    var cls = [] ;
                    while (e++ < l)
                        cls.push(this[e].getAttribute('class')) ;
                    return cls ;
                }
                else if (typeof name === 'string') {
                    if (value == null)
                        return this.length ? performClasses(this[0], 'c', name) : null ;
                    else {
                        if (value === true)
                            while (e++ < l)
                                performClasses(this[e], 'a', name) ;
                        else if (value === false)
                            while (e++ < l)
                                performClasses(this[e], 'r', name) ;
                        else if (value === 'toggle')
                            while (e++ < l)
                                performClasses(this[e], 't', name) ;
                    }
                }
                else if (typeof name === 'object')
                    for (var c in name) this.cl(c, name[c]) ;

                return this ;
            },

            style : function(obj, value)
            {
                // Getting
                if (!obj)
                    return this.length ? this[0].getAttribute('style') : null ;

                var l = this.length-1,
                    e = -1 ;

                if (obj === true) {
                    var ss = [] ;
                    while (e++ < l)
                        ss.push(this[e].getAttribute('style')) ;
                    return ss ;
                }
                // Setting
                else if (typeof obj === 'string') {
                    if (value === void 0)
                        return l > -1 ? this[0].style[obj] : null ;
                    if (value === null)
                        while (e++ < l)
                            this[e].style[obj] = "" ;
                    else
                        while (e++ < l)
                            this[e].style[obj] = value ;
                }
                else if (typeof obj === 'object') {
                    while (e++ < l) {
                        for (var a in obj) {
                            if (obj[a] === null) this[e].style[a] = "" ;
                            else this[e].style[a] = obj[a] ;
                        }
                    }
                }

                return this ;
            },

            show : function()
            {
                this.style('display', "") ;

                return this ;
            },

            hide : function()
            {
                this.style('display', "none") ;

                return this ;
            },

            on : NODE_EXISTS ?
                function(events, fn)
                {
                    if (typeof events === 'object') {
                        for (var e in events)
                            this.on(e, events[e]) ;
                        return ;
                    }

                    events = events.split(' ') ;
                    var l = this.length,
                        e = events.length ;
                    while (e--) {
                        l = this.length ;
                        while (l--)
                            this[l].addEventListener(events[e], fn, false) ;

                        this.events[events[e]] = fn ;
                    }

                    return this ;
                } :
                function(events, fn)
                {
                    if (typeof events === 'object') {
                        for (var e in events)
                            this.on(e, events[e]) ;
                        return ;
                    }
                    
                    events = events.split(' ') ;
                    var l = this.length,
                        e = events.length,
                        _fn = function() {
                            var e = window.event ;
                            return fn.call(this, copy(e, {
                                target : e.srcElement || document,
                                currentTarget : this,
                                preventDefault : function() { e.returnValue = false ; },
                                stopPropagation : function() { e.cancelBubble = true ; }
                            })) ;
                        } ;
                    while (e--) {
                        l = this.length ;
                        while (l--)
                            this[l].attachEvent('on'+events[e], _fn) ;

                        this.events[events[e]] = _fn ;
                    }

                    return this ;
                },

            off : NODE_EXISTS ?
                function(events, fn)
                {
                    if (typeof events === 'object') {
                        for (var e in events)
                            this.off(e, events[e]) ;
                        return ;
                    }

                    events = events.split(' ') ;
                    var l = this.length,
                        e = events.length ;
                    while (e--) {
                        l = this.length ;
                        while (l--)
                            this[l].removeEventListener(events[e], fn || this.events[events[e]], false) ;

                        delete this.events[events[e]] ;
                    }

                    return this ;
                } :
                function(events, fn)
                {
                    if (typeof events === 'object') {
                        for (var e in events)
                            this.off(e, events[e]) ;
                        return ;
                    }

                    events = events.split(' ') ;
                    var l = this.length,
                        e = events.length ;
                    while (e--) {
                        l = this.length ;
                        while (l--)
                            this[l].detachEvent('on'+events[e], fn || this.events[events[e]]) ;

                        delete this.events[events[e]] ;
                    }

                    return this ;
                },

            focus : function()
            {
                var l = this.length ;
                while (l--)
                    this[l].focus() ;

                return this ;
            },

            blur : function()
            {
                var l = this.length ;
                while (l--)
                    this[l].blur() ;

                return this ;
            },

            bounds : function(arrayOrCalc)
            {
                if (!this.length) return null ;
                
                var _l = this.length-1,
                    bounds ;
                if (arrayOrCalc === true) {
                    var e = -1,
                        boundsArray = [] ;
                    while (e++ < _l) {
                        bounds = this[e].getBoundingClientRect() ;
                        if (NODE_EXISTS) boundsArray.push(bounds) ;
                        else boundsArray.push({
                            top : bounds.top,
                            right : bounds.right,
                            bottom : bounds.bottom,
                            left : bounds.left,
                            width : bounds.right - bounds.left,
                            height : bounds.bottom - bounds.top
                        }) ;
                    }
                    return boundsArray ;
                }
                else if (arrayOrCalc === false) {
                    bounds = this[_l].getBoundingClientRect() ;
                    
                    var t = bounds.top,
                        r = bounds.right,
                        b = bounds.bottom,
                        l = bounds.left ;
                    while (_l--) {
                        bounds = this[_l].getBoundingClientRect() ;
                        if (bounds.top < t) t = bounds.top ;
                        if (bounds.right > r) r = bounds.right ;
                        if (bounds.bottom > b) b = bounds.bottom ;
                        if (bounds.left < l) l = bounds.left ;
                    }
                    // Returns a ClientRect type.
                    return {
                        top : t,
                        right : r,
                        bottom : b,
                        left : l,
                        width : r-l,
                        height : b-t
                    } ;
                }
                else {
                    bounds = this[0].getBoundingClientRect() ;
                    if (NODE_EXISTS) return bounds ;
                    else return {
                        top : bounds.top,
                        right : bounds.right,
                        bottom : bounds.bottom,
                        left : bounds.left,
                        width : bounds.right - bounds.left,
                        height : bounds.bottom - bounds.top
                    } ;
                }
            }
        }
    }) ;

    domes = root.domes = function(arg) {
        if (typeof arg === 'string')
            return domes.query.apply(domes, arguments) ;
        else
            return domes.gather.apply(domes, arguments) ;
    } ;
    copy(domes, {
        fn : DOMElementSet.prototype,

        create : function(type, ns)
        {
            var elset = new DOMElementSet() ;

            if (type) {
                if (ns) elset.add(document.createElementNS(ns, type)) ;
                else
                    switch (type) {
                        case 'svg' :
                            elset.add(document.createElementNS("http://www.w3.org/2000/svg", type)) ;
                            break ;

                        default :
                            elset.add(document.createElement(type)) ;
                            break ;
                    }
            }

            return elset ;
        },

        gather : function()
        {
            return new DOMElementSet().merge(arguments) ;
        },

        query : function(query)
        {
            return queryTo(document, new DOMElementSet(), query) ;
        },

        ready : function(fn)
        {
            if (document.readyState === 'complete') return fn() ;
            
            if (NODE_EXISTS)
                document.addEventListener('DOMContentLoaded', function() { fn() ; }, false) ;
            else
                document.attachEvent("onreadystatechange", function() {
                    echo(document.readyState) ;
                    if (document.readyState === 'complete') fn() ;
                }) ;
        }
    }) ;

}(window) ;
