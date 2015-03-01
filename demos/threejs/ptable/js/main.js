var Utils = (function() {
    var m = {};
    
    m.forMap = function (o, f) {
        for (var key in o) {
            if(o.hasOwnProperty(key)){
                f(key, o[key]);
            }
        }  
    };
    
    return m;
})();

var DOMUtils = (function() {
    var m = {};
    
    m.get = function(selector, numResults) {
        return m.getP(document, selector, numResults);
    };
    
    m.getP = function(parent, selector, numResults) {
        var results = parent.querySelectorAll(selector);
        if (numResults) {
            if (numResults === 1)
                return results[0];
            else
                return Array.prototype.slice.call(results, 0, numResults);
        } else
            return results;
    };
    
    /**
     * Remove an element and provide a function that inserts it into its original position
     * @param element {Element} The element to be temporarily removed
     * @return {Function} A function that inserts the element into its original position
     **/
    m.removeToInsertLater = function(element) {
      var parentNode = element.parentNode;
      var nextSibling = element.nextSibling;
      parentNode.removeChild(element);
      return function() {
        if (nextSibling) {
          parentNode.insertBefore(element, nextSibling);
        } else {
          parentNode.appendChild(element);
        }
      };
    }
    
    return m;
})();

var CSSUtils = (function() {
    var m = {};
    
    m.removeClass = function (e, c) {
        var classes = e.className.split(" ");
        e.className = "";
        for(var i = 0; i < classes.length;i++) {
            var clazz = classes[i];
            if (clazz !== c)
                e.className = e.className + " " + clazz;
        }
    };
    
    m.addClass = function (e, c) {
        var classes = e.className.split(" ");
        if (classes.indexOf(c) === -1)
            classes.push(c);
        e.className = classes.join(" ");
    }
    
    m.hasClass = function (e, c) {
        if (e.className.indexOf(c) === -1)
            return false;
        return true;
    }
    
    return m;
})();

var ElementCache = (function () {
    var m = {};
    
    function downloadJson (callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'js/data/elements.json', true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // .open will NOT return a value but simply returns undefined in async mode so use a callback
                callback(JSON.parse(xobj.responseText));
            }
        }
        xobj.send(null);
    }
    
    function loadJsonCache (callback) {
        if ('localStorage' in window && window['localStorage'] !== null) {
            var data = localStorage.getItem("elements");
            var elements = JSON.parse(data || null);
            callback(elements);
        } else {
            callback(null);
        }
    }
    
    function saveJsonCache (json) {
        if ('localStorage' in window && window['localStorage'] !== null) {
            localStorage.setItem("elements", JSON.stringify(json));
            return true;
        } else {
            return false;
        }
    }
    
    m.getElements = function(callback) {
        loadJsonCache(function (elements) {
            if (elements == null) {
                downloadJson(function (elements) {
                    saveJsonCache(elements);
                    callback(elements);
                });
            } else {
                callback(elements);
            }
        });
    }
    
    return m;    
})();

ElementCache.getElements(function(elements) {
    console.log(elements);
});

var PeriodicTable = (function() {
    var m = {};
    
    var camera, scene, renderer;
    var controls;
    
    var elements;
    var objects = [];
    var targets = { table: [], sphere: [], helix: [], grid: [] };
    
    var elementGroups = {
        /* "http://en.wikipedia.org/wiki/Periodic_table_(large_version)" */
        "nonmetals": [1,6,7,8,9,15,16,17,34,35,53],
        "noblegases": [2,10,18,36,54,86],
        "metalloids": [5,14,32,33,51,52,85],
        "alkalimetals": [3,11,19,37,55,87],
        "alkaliearthmetals": [4,12,20,38,56,88],
        "transitionmetals": [21,22,23,24,25,26,27,28,29,30,39,40,41,42,43,44,45,46,47,48,72,73,74,75,76,77,78,79,80,104,105,106,107,108,112],
        "poormetals": [13,31,49,50,81,82,83,84],
        "lanthanide": [57,58,59,60,61,62,63,64,65,66,67,68,69,70,71],
        "actinide": [89,90,91,92,93,94,95,96,97,98,99,100,101,102,103]
    };
    
    var getOpacity = function(atomicNum) {
        var group;
        Utils.forMap(elementGroups, function(key, value) {
            for(var i = 0; i < value.length; i++) {
                var num = value[i];
                if (atomicNum == num)
                    group = key;
            }
        });
        switch(group) {
            case "alkalimetals":
                return 1;
            case "alkaliearthmetals":
                return .8;
            case "transitionmetals":
                return .5;
            case "poormetals":
                return .8;
            case "metalloids":
                return .4;
            case "nonmetals":
                return .6;
            case "noblegases":
                return .25;
            case "lanthanide":
                return .1;
            case "actinide":
                return .15;
            default:
                return 0;
        }
    };
    
    m.init = function(elems) {
        elements = elems;
        
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
        camera.position.z = 1500;
    
        scene = new THREE.Scene();

        renderer = new THREE.CSS3DRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.position = 'absolute';
        document.getElementById( 'container' ).appendChild( renderer.domElement );
        
        setupElementItems(elems);
        
        controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 0.5;
        controls.addEventListener( 'change', render );
        
        window.addEventListener( 'resize', onWindowResize, false );
    }
    
    var setupElementItems = function(elements) {
        Utils.forMap(elements, function(key, val) {
            var element = document.createElement( 'div' );
            element.setAttribute("data-element", key);
            element.className = 'element';
            element.style.backgroundColor = 'rgba(0,127,127,' + ( getOpacity(val["atomic_number"])/*Math.random() * 0.5 + 0.25*/ ) + ')';
    
            var number = document.createElement( 'div' );
            number.className = 'number';
            number.textContent = val["atomic_number"];
            element.appendChild( number );
    
            var symbol = document.createElement( 'div' );
            symbol.className = 'symbol';
            symbol.textContent = val["symbol"];
            element.appendChild( symbol );
    
            var details = document.createElement( 'div' );
            details.className = 'details';
            details.innerHTML = key + '<br>' + val["atomic_weight"];
            element.appendChild( details );
            
            element.setAttribute("data-name", key);
            
            element.onclick = function () {
                InfoDisplay.loadElement(key, val);
            };
    
            var object = new THREE.CSS3DObject( element );
            object.position.x = Math.random() * 4000 - 2000;
            object.position.y = Math.random() * 4000 - 2000;
            object.position.z = Math.random() * 4000 - 2000;
            scene.add( object );
    
            objects.push( object );
    
            var object = new THREE.Object3D();
            if (val["group"] === "n/a") {
                var posGroup;
                if (val["atomic_number"] > 56 && val["atomic_number"] < 88) {
                    posGroup = val["atomic_number"] - 54.5;
                } else if (val["atomic_number"] > 88) {
                    posGroup = val["atomic_number"] - 86.5;
                }
                object.position.x = ( posGroup * 140 ) - 1330;
                object.position.y = - ( (val["period"] == 6 ? 8.5 : 9.5 ) * 180 ) + 990;
            } else {
                object.position.x = ( val["group"] * 140 ) - 1330;
                object.position.y = - ( val["period"] * 180 ) + 990;
            }
//            object.position.z = Math.random() * 10 - 5;
    
            targets.table.push( object );
        });
    };
        
    m.load = function() {
        transform( targets.table, 5000 );
        animate();
    };
    var isPaused = false;
    m.display = function(type) {
        isPaused = true;
        /* De-attach periodic table from the DOM so that the paint events only occur once on re-attach.
         * Only do this for Chrome because Chrome aggressively redraws the DOM. */
        var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        if (isChrome)
            var reAttachFunction = DOMUtils.removeToInsertLater(objects[0].element.parentElement);
        switch(type) {
            case "group":
                for(var i = 0; i < objects.length; i++) {
                    var element = objects[i].element;
                    element.style.backgroundColor = 'rgba(0,127,127,' + ( getOpacity(elements[element.getAttribute("data-element")]["atomic_number"]) ) + ')';
                }
                break;
            case "electronegativity":
                for(var i = 0; i < objects.length; i++) {
                    var element = objects[i].element;
                    var electroNeg = elements[element.getAttribute("data-element")]["pauling_negativity"];
                    element.style.backgroundColor = 'rgba(0,127,127,' + ( (4.0 - electroNeg) * .25 ) + ')';
                }
                break;
            default:
                for(var i = 0; i < objects.length; i++) {
                    var element = objects[i].element;
                    element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
                }
                break;
        }
        if (isChrome)
            reAttachFunction();
        isPaused = false;
    }
    
    var transform = function( targets, duration ) {
        TWEEN.removeAll();
    
        for ( var i = 0; i < objects.length; i ++ ) {
    
            var object = objects[ i ];
            var target = targets[ i ];
    
            new TWEEN.Tween( object.position )
                .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
    
            new TWEEN.Tween( object.rotation )
                .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
    
        }
    
        new TWEEN.Tween( this )
            .to( {}, duration * 2 )
            .onUpdate( render )
            .start();
    };

    var onWindowResize = function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    
        render();
    }
    
    var animate = function() {
        requestAnimationFrame( animate );
        if (!isPaused) {
            TWEEN.update();
            controls.update();
        }
    }
    
    var render = function() {
        renderer.render( scene, camera );
    }
    
    return m;
})();

var InfoDisplay = (function() {
    var m = {};
    
    var dataElement;
    
    var fields = {
        /*  symbol, atomicNumber, atomicWeight, density, meltingPoint,
            boilingPoint, atomicRadius, covalentRadius, ionicRadius, atomicVolume,
            specificHeat, fusionHeat, evaporationHeat, thermalConductivity,
            paulingNegativity, firstIonizationEnergy, oxidationStates,
            electronConfiguration, latticeStructure, latticeConstant, group, period */
    };
    
    m.show = function() {
        CSSUtils.removeClass(dataElement, "hidden");
    }
    
    m.hide = function() {
        CSSUtils.addClass(dataElement, "hidden");
    }
    
    m.isShown = function() {
        return !CSSUtils.hasClass(dataElement, "hidden");
    }
    
    m.loadElement = function(name, element) {
        var dataCont = dataElement.getElementsByClassName("main")[0];
        fields.name.textContent = name;
        Utils.forMap(element, function(key, val) {
            m.loadProperty(key, val);
        });
        
        m.show();
    }
    
    m.loadProperty = function(prop, value) {
        switch(prop) {
            case "symbol":
                fields.symbol.textContent = value;
                break;
            case "atomic_number":
                fields.atomicNumber.textContent = value;
                break;
            case "atomic_weight":
                fields.atomicWeight.textContent = value;
                break;
            case "electronic_configuration":
                fields.electronConfiguration.textContent = value;
                break;
            case "pauling_negativity":
                fields.electronNegativity.textContent = value;
                break;
            case "first_ionizing kJ/mol":
                fields.firstIonizationEnergy.textContent = value;
                break;
            default:
                break;
        }
    }

    var init = function() {
        dataElement = document.getElementById("data-display");
        fields.name = DOMUtils.getP(dataElement, ".name", 1);
        fields.symbol = DOMUtils.getP(dataElement, ".symbol", 1);
        fields.atomicNumber = DOMUtils.getP(dataElement, ".atomic-number", 1);
        fields.atomicWeight = DOMUtils.getP(dataElement, ".atomic-weight", 1);
        fields.electronConfiguration = DOMUtils.getP(dataElement, ".electron-configuration", 1);
        fields.electronNegativity = DOMUtils.getP(dataElement, ".electron-negativity", 1);
        fields.firstIonizationEnergy = DOMUtils.getP(dataElement, ".first-ionization-energy", 1);
        /* Setup scrolling on the InfoDisplay */
        $(".data-display").nanoScroller({sliderMinHeight: 40});
        /* Attach close function to close button */
        dataElement.getElementsByClassName("close")[0].onclick = m.hide;
        /* Setup auto-scaling on element name text */
        window.fitText(dataElement.getElementsByClassName("name")[0], .7, {maxFontSize: 120});
        /* Setup esc-key listener */
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27 && m.isShown()) {
                InfoDisplay.hide();
            }
        };
    }
    
    init();
    
    return m;
})();

var ControlButtons = (function() {
    var m = {}
    
    var buttons = {};
    
    var setupListeners = function() {
        buttons.table.onclick = function() {PeriodicTable.display("group");};
        buttons.eletroNeg.onclick = function() {PeriodicTable.display("electronegativity");};
    }
    
    var init = function() {
        buttons.table = DOMUtils.get("#table", 1);
        buttons.eletroNeg = DOMUtils.get("#electronegativity", 1);
        setupListeners();
    };
    
    init();
    
    return m;
})();

ElementCache.getElements(function(elements) {
    PeriodicTable.init(elements);
    PeriodicTable.load();
});