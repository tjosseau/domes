
# Domes

Domes is a light but efficient DOM Element Set manager, nothing less, nothing more.

* **All browsers** : Compatible with all web browsers, including I.E. 8

## First step, waiting for the document to be ready

```javascript
domes.ready(function() { /* Document is ready to be used in this scope. */ }) ;
```

## Domes basis functions

* **Creating a new element**
    
    Such as jQuery, Domes uses set of elements to work with.
    The type of this set is called 'DOMElementSet'.

    ```javascript
    domes.create() ;                        // Returns an empty element set.
    domes.create('div') ;                   // Creates a <div> element and stores it in the element set.
    // `domes.create('div')[0]` returns the first HTML element.

    domes.create('svg') ;                   // Creates a valid <svg> element...
    domes.create('svg', "http://www.w3.org/2000/svg") ; // Same as above, giving an explicit namespace.
    domes.create('<div>Content</div>') ;    // Creates a <div> element with "Content" inside...
    domes.create('<li>1</li><li>2</li>') ;  // Creates two <li> elements...
    ```

    Can also be called with :

    ```javascript
    domes('<div></div>') ;
    ```

* **Querying the DOM**
    
    Domes uses `querySelectorAll` native function of JavaScript to query elements.

    ```javascript
    domes.query('#main') ;                  // Returns an element set with the #main element in, or empty if not found.
    domes.query('.subs') ;                  // Gathers '.subs' element(s)...
    domes.query('#main > div') ;
    domes.query('html, body') ;
    domes.query('body > *') ;
    ```

    Can also be called with :

    ```javascript
    domes('#main') ;
    ```

* **Merging multiple sets or elements to one set**

    Flattens all sets to one without duplicated elements.

    ```javascript
    domes.gather(domes.query('body > div'), document.body, domes('html')) ;
                                            // Gathers html, body and <div> children of body...
    ```

## Note

Readme in progress.
Further documentation coming soon !
