
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
    	options = {
            silent : false,         // If silent, no `echo` neither `warn`.
            strict : 0,             // Strict levels send warnings or throws exception.
            debug : 0               // Debug levels echoes various information messages.
        },

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
                if (element && element.nodeType === Node.ELEMENT_NODE && !this.contains(element))
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
    			var a = 0,
    				e,
    				el ;
    			while (el = arguments[a]) {
    				el = el.length ;
    				e = 0 ;
    				while (e < el) this.add(arguments[a++][e++]) ;
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
                var parentSet = domes.create(),
                    i = 0 ;
                while (i < this.length)
                    parentSet.add(this[i++].parentNode) ;

                return parentSet ;
            },

            children : function()
            {
                var childSet = domes.create(),
                    el,
                    i = 0 ;
                while (i < this.length) {
                    el = this[i++] ;
                    for (var c = 0, cl = el.childNodes.length ; c < cl ; c++)
                        childSet.add(el.childNodes[c]) ;
                }

                return childSet ;
            },

            next : function()
            {
                var nextSet = domes.create(),
                    i = 0 ;
                while (i < this.length)
                    nextSet.add(this[i++].nextElementSibling) ;

                return nextSet ;
            },

            previous : function()
            {
                var previousSet = domes.create(),
                    i = 0 ;
                while (i < this.length)
                    previousSet.add(this[i++].previousElementSibling) ;

                return previousSet ;
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
