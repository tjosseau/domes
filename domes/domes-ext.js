
/**
 * Domes library - Extended version
 *
 * @author      Thomas Josseau
 * @version     0.1.4
 * @date        2014.10.05
 * @link        https://github.com/tjosseau/domes
 *
 * @description
 *      DOM elements manager, nothing less, nothing more.
 *      Extension module
 */

void function(root) {
    // "use strict" ; // Strict mode - Disabled in production

    var domes = root.domes,
        
        NODE_EXISTS = typeof root.Node !== 'undefined',
        CLASSLIST_EXISTS = "classList" in document.createElement("div"),
        ELEMENT_NODE = 1,
        
        DOMElementSet = domes.instance,

        copy = function(context, object)
        {
            for (var p in object)
                if (object.propertyIsEnumerable(p))
                    context[p] = object[p] ;
            return context ;
        },

        getUniqueId = function(id, n)
        {
            var uid = id+""+n ;
            if (document.getElementById(uid)) return getUniqueId(id, n+1) ;

            return uid ;
        } ;
    
    copy(domes, {
        html : function()
        {
            return domes('html') ;   
        },
        
        head : function()
        {
            return domes('head') ;
        },
        
        body : function()
        {
            return domes('body') ;   
        }
    }) ;
    
    copy(domes.fn, {
        copy : function()
        {
            return new DOMElementSet().merge(this) ;
        },

        el : function()
        {
            return this.element() ;  
        },

        els : function()
        {
            return this.elements() ;  
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
        
        siblings : function(includeItself)
        {
            var sibs = this.parent().children() ;
            if (!includeItself) sibs.trim.apply(sibs, this.elements()) ;
            return sibs ;
        },
        
        clone : function(key)
        {
            return domes.create(this.outer().replace(
                /id="(.*?)"/g,
                key === false ? '' : function(match, p, offset, string) {
                    return 'id="' + (key == null ? getUniqueId(p+'_', 2) : p+""+key) + '"' ;
                }
            )) ;
        },

        appendTo : function(el)
        {
            // Only one el, no arguments browsing...
            domes(el).append(this) ;

            return this ;
        },

        prependTo : function(el)
        {
            // Only one el, no arguments browsing...
            domes(el).prepend(this) ;

            return this ;
        },
        
        addClass : function(name)
        {
            this.cl(name, true) ;
            
            return this ;
        },
        
        removeClass : function(name)
        {
            this.cl(name, false) ;
            
            return this ;
        },
        
        toggleClass : function(name)
        {
            this.cl(name, !this.cl(name)) ;
            
            return this ;
        },
        
        hasClass : function(name)
        {
            return this.cl(name) ;  
        },
        
        setClass : function(value)
        {
            this.attr('class', value) ;
            
            return this ;
        },
        
        unsetClass : function(value)
        {
            this.attr('class', null) ;
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

        focus : function()
        {
            var l = this.length ;
            if (l) this[l-1].focus() ;

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
    }) ;

}(window) ;
