
/**
 * Domes library
 *
 * @author      Thomas Josseau
 * @version     0.0.2
 * @date        2014.06.15
 * @link        https://github.com/tjosseau/domes
 *
 * @description
 *      Tiny DOM elements manager.
 */

void function(root) {
    "use strict" ;

    var domes,
        NODE_EXISTS = typeof root.Node !== 'undefined',
        ELEMENT_NODE = 1,

        copy = function(context, object)
        {
            for (var p in object)
                if (object.propertyIsEnumerable(p))
                    context[p] = object[p] ;
            return context ;
        },

        queryTo = function(elset, query)
        {
            var result = document.querySelectorAll(query),
                rl = result.length ;
            elset.length = rl ;
            while(rl--) elset[rl] = result[rl] ;
            elset.query = query ;

            return elset ;
        } ;

    var DOMElementSet = function()
    {
        this.length = 0 ;
        this.query = "" ;
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

            remove : function(element)
            {
                var removed = false ;
                for (var i=0 ; i<this.length ; i++) {
                    if (removed) {
                        this[i-1] = this[i] ;
                        delete this[i] ;
                    }
                    else if (this[i] === element) {
                        delete this[i] ;
                        this.length-- ;
                        removed = true ;
                    }
                }

                return this ;
            },

            empty : function()
            {
                while (this.length) delete this[--this.length] ;

                return this ;
            },

            update : function()
            {
                this.empty() ;
                if (this.query) queryTo(this, this.query) ;

                return this ;
            },

            merge : function(elset)
            {
                var a = -1,
                    e,
                    el ;
                while ((el = arguments[++a])) {
                    el = el.length ;
                    e = 0 ;
                    while (e < el) this.add(arguments[a][e++]) ;
                }

                return this ;
            },

            get : function(i)
            {
                return domes.create().add(this[i]) ;
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
                    e = 0 ;
                while (e < this.length)
                    els.push(this[e++]) ;

                return els ;
            },

            parent : function()
            {
                var set = domes.create(),
                    i = 0 ;
                while (i < this.length)
                    set.add(this[i++].parentNode) ;

                return set ;
            },

            children : function()
            {
                var set = domes.create(),
                    c,
                    cl,
                    i = -1 ;
                while (++i < this.length) {
                    c = -1 ;
                    cl = this[i].childNodes.length ;
                    while (c++ < cl) set.add(this[i].childNodes[c]) ;
                }

                return set ;
            },

            next : NODE_EXISTS ?
                function()
                {
                    var set = domes.create(),
                        i = -1 ;
                    while (++i < this.length)
                        set.add(this[i].nextElementSibling) ;

                    return set ;
                } :
                function()
                {
                    var set = domes.create(),
                        el,
                        i = -1 ;
                    while (++i < this.length) {
                        el = this[i] ;
                        do { el = el.nextSibling ; } while (el && el.nodeType !== ELEMENT_NODE) ;
                        set.add(el) ;
                    }

                    return set ;
                },

            previous : NODE_EXISTS ?
                function()
                {
                    var set = domes.create(),
                        i = -1 ;
                    while (++i < this.length)
                        set.add(this[i].previousElementSibling) ;

                    return set ;
                } :
                function()
                {
                    var set = domes.create(),
                        el,
                        i = -1 ;
                    while (++i < this.length) {
                        el = this[i] ;
                        do { el = el.previousSibling ; } while (el && el.nodeType !== ELEMENT_NODE) ;
                        set.add(el) ;
                    }

                    return set ;
                },

            type : function()
            {
                if (!this.length) return '' ;

                var l = this.length,
                    e,
                    type ;
                while (l--) {
                    e = this[l] ;
                    if (type && e.tagName !== type) return '*' ;
                    else type = e.tagName ;
                }
                return type.toLowerCase() ;
            },

            listen : function(event)
            {

            },

            forget : function(event)
            {

            },

            outer : function(el)
            {
                var i = -1 ;

                if (!el || el === true) {
                    if (!this.length) return null ;
                    var htmls = [] ;
                    while (++i < this.length)
                        htmls.push(this[i].outerHTML) ;
                    return el === true ? htmls : htmls.join("") ;
                }

                if (typeof el === 'string')
                    while (++i < this.length)
                        this[i].outerHTML = el ;
                else {
                    if (el.nodeType === ELEMENT_NODE)
                        while (++i < this.length)
                            this[i].outerHTML = el.outerHTML ;
                    else if (el instanceof DOMElementSet)
                        while (++i < this.length)
                            this[i].outerHTML = el.outer() ;
                    else
                        while (++i < this.length)
                            this[i].outerHTML = el.toString() ;
                }

                return this ;
            },

            inner : function(el)
            {
                var i = -1 ;

                if (!el || el === true) {
                    if (!this.length) return null ;
                    var htmls = [] ;
                    while (++i < this.length)
                        htmls.push(this[i].innerHTML) ;
                    return el === true ? htmls : htmls.join("") ;
                }

                if (typeof el === 'string')
                    while (++i < this.length)
                        this[i].innerHTML = el ;
                else {
                    if (el.nodeType === ELEMENT_NODE)
                        while (++i < this.length)
                            this[i].innerHTML = el.outerHTML ;
                    else if (el instanceof DOMElementSet)
                        while (++i < this.length)
                            this[i].innerHTML = el.outer() ;
                    else
                        while (++i < this.length)
                            this[i].innerHTML = el.toString() ;
                }

                return this ;
            },

            append : function(el)
            {
                if (typeof el === 'string')
                    while (++i < this.length)
                        this[i].insertAdjacentHTML('beforeend', el) ;
                else {
                    if (el.nodeType === ELEMENT_NODE)
                        this[this.length-1].appendChild(el) ;
                    else if (el instanceof DOMElementSet) {
                        var target = this[this.length-1],
                            e = -1 ;
                        while (++e < el.length)
                            target.appendChild(el[e]) ;
                    }
                }

                return this ;
            },

            prepend : function(el)
            {
                var i = -1 ;

                if (typeof el === 'string')
                    while (++i < this.length)
                        this[i].insertAdjacentHTML('afterbegin', el) ;
                else {
                    var target = this[this.length-1] ;
                    if (el.nodeType === ELEMENT_NODE)
                        target.insertBefore(el, target.firstChild) ;
                    else if (el instanceof DOMElementSet) {
                        if ((i = el.length))
                            while (i--)
                                target.insertBefore(el[i], target.firstChild) ;
                    }
                }

                return this ;
            },

            before : function(el)
            {
                var i = -1 ;

                if (typeof el === 'string')
                    while (++i < this.length)
                        this[i].insertAdjacentHTML('beforebegin', el) ;
                else {
                    var target = this[this.length-1] ;
                    if (el.nodeType === ELEMENT_NODE)
                        target.parentNode.insertBefore(el, target) ;
                    else if (el instanceof DOMElementSet) {
                        if ((i = el.length))
                            while (i--)
                                target.parentNode.insertBefore(el[i], target) ;
                    }
                }

                return this ;
            },

            after : function(el)
            {
                var i = -1 ;

                if (typeof el === 'string')
                    while (++i < this.length)
                        this[i].insertAdjacentHTML('afterend', el) ;
                else {
                    var target = this[this.length-1] ;
                    if (el.nodeType === ELEMENT_NODE)
                        target.parentNode.insertBefore(el, target.nextSibling) ;
                    else if (el instanceof DOMElementSet) {
                        if ((i = el.length))
                            while (i--)
                                target.parentNode.insertBefore(el[i], target.nextSibling) ;
                    }
                }

                return this ;
            },

            text : function(str)
            {
                var i = -1 ;

                if (typeof str === 'string')
                    while (++i < this.length)
                        this[i].innerText = str ;
                else {
                    if (!this.length) return null ;

                    var texts = [] ;
                    while (++i < this.length)
                        texts.push(this[i].innerText) ;
                    return str === true ? texts : texts.join("") ;
                }

                return this ;
            }
        }
    }) ;

    domes = root.domes = function() {

    } ;
    copy(domes, {
        create : function(type)
        {
            var elset = new DOMElementSet() ;
            if (type)
                switch (type) {
                    case 'svg' :
                        elset.add(document.createElementNS("http://www.w3.org/2000/svg", type)) ;
                        break ;

                    default :
                        elset.add(document.createElement(type)) ;
                        break ;
                }
            return elset ;
        },

        query : function(query)
        {
            return queryTo(domes.create(), query) ;
        }
    }) ;

}(window) ;
