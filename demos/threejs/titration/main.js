Utils = (function() {
    var _ = {};
    
    _.forMap = function (o, f) {
        for (var key in o) {
            if(o.hasOwnProperty(key)){
                f(key, o[key]);
            }
        }  
    };
    
    _.timeMs = function() {
        return (new Date()).getTime();
    }
    
    _.last = function(arr) {
        return arr[arr.length -1];
    }
    
    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    _.hslToRgb = function(h, s, l){
        var r, g, b;
    
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
    
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
    
        return [r * 255, g * 255, b * 255];
    }
    
    return _;
})();

Visualizer = (function() {
    var _ = {};
    
    // set the scene size
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    // set some camera attributes
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;
    
    // create a WebGL renderer, camera and a scene
    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE,ASPECT,NEAR,FAR);
    var controls = new THREE.TrackballControls( camera );
    
    var scene = new THREE.Scene();
    
    _.setup = function() {        
        // add the camera to the scene
        scene.add(camera);
        
        // the camera starts at 0,0,0
        // so pull it back
        camera.position.z = 200;
        
        // create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);
        
        // set its position
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 200;
        
        // add to the scene
        scene.add(pointLight);
        
        // start the renderer
        renderer.setSize(WIDTH, HEIGHT);
        
        document.getElementById( 'container' ).appendChild( renderer.domElement );
        
        _.Interaction.setup();
    }
    
    _.add = function(obj) {
        scene.add(obj);
    }
    
    _.render = function() {
        renderer.render(scene, camera);
    }
    
    _.update = function() {
        controls.update();
    }

    _.Interaction = (function() {
        var __ = {};
        
        /**
         * Called on Windows resizes
         */
        __.handleResize = function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
    
            renderer.setSize( window.innerWidth, window.innerHeight );
    
            _.render();
        }
    
        __.setup = function() {
            // Listen for window resize
            window.addEventListener( 'resize', __.handleResize, false );
        }
         
        return __;
    })();
    
    return _;
})();

Container = (function() {
    var _ = {};
    
    var WIDTH = 100,
        DEPTH = 100,
        HEIGHT = 100;
    var CENTER_X = 0,
        CENTER_Y = 0,
        CENTER_Z = 0;
    
    var threeElem;
    
    _.setup = function() {
        threeElem = new THREE.Mesh( new THREE.CubeGeometry( WIDTH, HEIGHT, DEPTH ), new THREE.MeshNormalMaterial({color: 0xFFFFFF, opacity: .05, transparent: true}) );
        Visualizer.add(threeElem);
    }
    
    _.Populate = (function() {
        var __ = {};
        
        __.getRandX = function() {
            return Math.random() * WIDTH - CENTER_X - WIDTH/2;
        }
        
        __.getRandY = function() {
            return Math.random() * HEIGHT - CENTER_Y - HEIGHT/2;
        }
        
        __.getRandZ = function() {
            return Math.random() * DEPTH - CENTER_Z - DEPTH/2;
        }
        
        return __;
    })();
    
    _.Test = (function() {
        var __ = {};
        
        __.x = function(p) {
            return CENTER_X - WIDTH/2 < p.x && p.x < CENTER_X + WIDTH/2;
        }
        
        __.y = function(p) {
            return CENTER_Y - DEPTH/2 < p.y && p.y < CENTER_Y + DEPTH/2;
        }
        
        __.z = function(p) {
            return CENTER_Z - DEPTH/2 < p.z && p.z < CENTER_Z + DEPTH/2;
        }
        
        return __;
    })();
    
    _.Dimen = (function() {
        var __ = {};
        
        __.x = CENTER_X;
        __.y = CENTER_Y;
        __.z = CENTER_Z;
        
        __.height = HEIGHT;
        __.width = WIDTH;
        __.depth = DEPTH;
        
        __.getMinX = function() {
            return CENTER_X - WIDTH/2;
        }
        __.getMaxX = function() {
            return CENTER_X + WIDTH/2;
        }
        
        __.getMinY = function() {
            return CENTER_Y - HEIGHT/2;
        }
        __.getMaxY = function() {
            return CENTER_Y + HEIGHT/2;
        }
        
        __.getMinZ = function() {
            return CENTER_Z - DEPTH/2;
        }
        __.getMaxZ = function() {
            return CENTER_Z + DEPTH/2;
        }
        
        return __;
    })();
    
    return _;
})();

Counter = (function() {
    var _ = {};
    
    var POLLING_FREQUENCY = 30; // in frames
    var updateDelta = POLLING_FREQUENCY - 1;
    
    var elem = document.getElementById("counter");
    
    var collisions = [0];
    _.incrementCollisions = function() {
        collisions[collisions.length - 1]++;
    }
    
    var reactions = [0];
    _.incrementReactions = function() {
        reactions[reactions.length - 1]++;
    }
    
    var lastUpdateTime = Utils.timeMs();
    
    var reset = function() {
        collisions.push(0);
        if (collisions.length > 40)
            collisions.shift();
        reactions.push(0);
        if (reactions.length > 40)
            reactions.shift();
        
        lastUpdateTime = Utils.timeMs();
        
        elapsedFrames = 0;
    }
    
    var elapsedFrames = 0;
    _.update = function() {
        if (elapsedFrames > 29) {
            /* Empty current data */
            elem.innerHTML = "";
            
            /* Create and display Species Count */
            var speciesCounter = _.Analysis.getSpeciesCount(Particles.getParticles());
            elem.appendChild(_.View.buildSpeciesCount(speciesCounter));
            
            /* Display current pH */
            elem.appendChild(_.View.buildPH(_.Analysis.getPH(speciesCounter)));
            
            /* Display collisions per cycle */
            elem.appendChild(_.View.buildCollisions());
            
            /* Display reactions per cycle */
            elem.appendChild(_.View.buildReactions());
            
            /* Display frames per second */
            elem.appendChild(_.View.buildFramesPerSecond(elapsedFrames, lastUpdateTime));
            
            /* Reset for next cycle */
            reset();
        }
        elapsedFrames++;
    }
    
    _.Analysis = (function() {
        var __ = {};
        
        __.getSpeciesCount = function(particles) {
            var counter = {};
            var pCount = particles.vertices.length>>0;
            while(pCount--) {
                var color = particles.colors[pCount];
                var rgbColor = [color.r * 255>>0, color.g * 255>>0, color.b * 255>>0];
                if (rgbColor[0] == 0 && rgbColor[1] == 0 && rgbColor[2] == 0)
                    rgbColor = [255,255,255];
                var species = particles.vertices[pCount].species;
                
                if (!counter[species.name])
                    counter[species.name] = {count: 0, rgb: rgbColor, c: color};
                counter[species.name].count++;
            }
            return counter;
        }
        
        __.getPH = function(counter) {
            var water = counter[Chemistry.Species.H2O.name];
            if (water) {
                var OHminus = counter[Chemistry.Species.OHminus.name];
                var hPlus = counter[Chemistry.Species.Hplus.name];
                if (!hPlus && !OHminus)
                    hPlus = {count: water.count / Chemistry.WATER_MOLS_PER_KG * 1e-7};
                if (!OHminus)
                    OHminus = {count: 0};
                if (OHminus.count < hPlus.count)
                    return -1 * Math.log( (hPlus.count - OHminus.count) / (water.count / Chemistry.WATER_MOLS_PER_KG) ) / Math.LN10;
                else
                    return 14 - (-1 * Math.log( (OHminus.count - hPlus.count) / (water.count / Chemistry.WATER_MOLS_PER_KG) ) / Math.LN10);
            }
            return 1/0;            
        }
        
        return __;
    })();
    
    _.View = (function() {
        var __ = {};
        
        var buildBarChart = function(arr, maxVal) {
            /* Create elem */
            var canvas = document.createElement("canvas");
            canvas.width = 150;
            canvas.height = 150;
            
            var context = canvas.getContext('2d');
            
            /* Setup values */
            var rectWidth = (canvas.width) / arr.length;
            maxVal = maxVal || 0;
            arr.forEach(function(val) {
                if (val > maxVal)
                    maxVal = val;
            });
            
            /* Draw data */
            for(var i=0;i<arr.length;i++) {
                var val = arr[i];
                
                var x = i * rectWidth + 0;
                var height = val / maxVal * canvas.height;
                
                /* Set draw color */
                context.fillStyle = "wheat";
                
                /* Draw rect */
                context.fillRect(x, canvas.height, rectWidth, -height);
                context.strokeRect(x, canvas.height, rectWidth, -height);
            };
            
            /* Draw range min & max text */
            context.fillStyle = "red";
            context.font = "12px monospace";
            context.fillText(maxVal, 5, 12)
            context.fillText(0, 5, canvas.height - 5)
            
            return {elem: canvas, max: maxVal};
        }
        
        var collisionsMax = 0;
        __.buildCollisions = function() {
            var collisionsElem = document.createElement("div");
            collisionsElem.className = "chart";
            collisionsElem.innerHTML = "<span>" + Utils.last(collisions) + " collisions per " + POLLING_FREQUENCY + " frame(s)</span>";
            /* Generate chart */
            var chart = buildBarChart(collisions, collisionsMax);
            collisionsMax = chart.max > collisionsMax ? chart.max : collisionsMax;
            collisionsElem.appendChild(chart.elem);
            /* Return view elem */
            return collisionsElem;
        }
        
        var reactionsMax = 0;
        __.buildReactions = function() {
            var reactionsElem = document.createElement("div");
            reactionsElem.className = "chart";
            reactionsElem.innerHTML = "<span>" + Utils.last(reactions) + " reactions per " + POLLING_FREQUENCY + " frame(s)</span>";
            /* Generate chart */
            var chart = buildBarChart(reactions, reactionsMax);
            reactionsMax = chart.max > reactionsMax ? chart.max : reactionsMax;
            reactionsElem.appendChild(chart.elem);
            /* Return view elem */
            return reactionsElem;
        }
        
        var pHMax = 0;
        var pastPH = [];
        __.buildPH = function(pH) {
            var pHElem = document.createElement("div");
            pHElem.className = "chart";
            pHElem.innerHTML = "<span>Current pH is " + pH.toFixed(4);
            /* Save pH data */
            pastPH.push(pH);
            if (pastPH.length > 40)
                pastPH.shift();
            /* Generate chart */
            var chart = buildBarChart(pastPH, pHMax);
            pHMax = chart.max > pHMax ? chart.max : pHMax;
            pHElem.appendChild(chart.elem);
            /* Return view elem */
            return pHElem;
        }
        
        __.buildSpeciesCount = function(counter) {
            var speciesCountElem = document.createElement("div");
            speciesCountElem.id = "species-count";
            Utils.forMap(counter, function(name, val) {
                var itemElem = document.createElement("div");
                var colorString = "rgb(" + val.rgb[0] + "," + val.rgb[1] + "," + val.rgb[2] + ")";
                itemElem.style.color = colorString;
                itemElem.innerHTML = "" + name + " - " + val.count + " particles";
                speciesCountElem.appendChild(itemElem);
            });
            return speciesCountElem;
        };
        
        __.buildFramesPerSecond = function(elapsedFrames, lastUpdateTime) {
            var framesSecondElem = document.createElement("div");
            framesSecondElem.id = "frames-per-second";
            var framesPerSec = elapsedFrames / ( (Utils.timeMs() - lastUpdateTime) / 1000 );
            framesSecondElem.innerHTML = "<span>" + framesPerSec.toFixed(2) + "</span> frames per second";
            return framesSecondElem;
        }
        
        return __;
    })();
    
    return _;
})();

Chemistry = (function() {
    var _ = {};
    
    _.WATER_MOLS_PER_KG = 55.5084350618;
    
    _.Species = {
        None: {name:"None",color:[0,0,0]},
        Hplus: {name:"Hydrogen Ion",color:[1,1,.5]},
        OHminus: {name:"Hydroxide Ion",color:[304/360,1,.5]},
        H2O: {name:"Water",color:[241/360,1,.5]}
    }
    
    _.Reactions = {
        "Hplus + OHminus": {
            reactants: [_.Species.Hplus,_.Species.OHminus],
            products: [_.Species.H2O]
        }
    }
    
    _.react = function(reactants) {
        var output = {products: [], reactants: []};
        Utils.forMap(_.Reactions, function(name, reaction) {
            if (output.products.length == 0) {
                var rxReactants = reaction.reactants.slice(0);
                var numReactantsSatisfied = 0;
                for(var i=0;i<reactants.length;i++) {
                    var reactant = reactants[i];
                    var rxReactantIndex = rxReactants.indexOf(reactant);
                    if (rxReactantIndex != -1) {
                        rxReactants.splice(rxReactantIndex, 1);
                        output.reactants.push(reactant);
                        numReactantsSatisfied++;
                    }
                }
                if (numReactantsSatisfied == reaction.reactants.length) {
                    output.products = reaction.products.slice(0);
                }
            }
        });
        return output.products.length == 0 ? null : output;
    }
    
    
    /*
     * @return {productsSpecies: [], reactantParticleIndexes: []};
     */
    _.collide = function(particleIndexes) {
        var reactants = [];
        particleIndexes.forEach(function(val) {
            reactants.push(Particles.getParticle(val).species);
        });
        var output = {productSpecies: [], reactantParticleIndexes: []};
        var reactionOutput = _.react(reactants);
        if (reactionOutput != null) {
            output.productSpecies = reactionOutput.products;
            var pIndexes = particleIndexes.slice(0);
            reactionOutput.reactants.forEach(function(reactantSpecies) {
                for(var i=0;i<pIndexes.length;i++) {
                    var particleIndex = pIndexes[i];
                    if (Particles.getParticle(particleIndex).species == reactantSpecies) {
                        output.reactantParticleIndexes.push(particleIndex);
                        pIndexes.slice(i, 1);
                        break;
                    }
                }
            });
            
            return output;
        }
        return null;
    }
    
    return _;
})();

Particles = (function() {
    var _ = {};
    
    var PARTICLE_COUNT = window.location.hash.replace("#","").length > 1 ? window.location.hash.replace("#","") : 1000;
    var MAX_SPEED = 0.5;
    
    var particles = new THREE.Geometry();
    var particleSystem;
    
    particles.colors = [];
    // particles.vertices[n].impacts
    // particles.vertices[n].species
    
    var deadParticles = [];
    
    _.init = function() {
        var pMaterial =
            new THREE.ParticleBasicMaterial({
                color: 0xFFFFFF,
                size: 6,
                map: THREE.ImageUtils.loadTexture(
                  "image/particle.png"
                ),
                blending: THREE.AdditiveBlending,
                transparent: true,
                vertexColors: true
        });
            
        // create the particle system
        particleSystem = new THREE.ParticleSystem(particles, pMaterial);                
            
        // Causes the closer Z-index to render in the back
        particleSystem.sortParticles = true;
            
        // add it to the scene
        Visualizer.add(particleSystem);
    }
    
    _.setupParticles = function() {
        // now create the individual particles
        for(var p = 0; p < PARTICLE_COUNT; p++) {
          // create a particle with random
          // position values, -250 -> 250
            var pX = Container.Populate.getRandX(),
                pY = Container.Populate.getRandX(),
                pZ = Container.Populate.getRandZ(),
                particle = new THREE.Vector3(pX, pY, pZ);
            
            particle.velocity = new THREE.Vector3(
                  Math.random()*MAX_SPEED*2 - MAX_SPEED,              // x
                  Math.random()*MAX_SPEED*2 - MAX_SPEED, // y: random vel
                  Math.random()*MAX_SPEED*2 - MAX_SPEED);             // z
            
            /* Init particle properties */
            particle.id = p;
            particle.impacts = 0;
            
            /* Init this particles color */
            particles.colors[p] = new THREE.Color( 0xFFFFFF );
            
            /* Setup particle functions */
            particle.setSpecies = function(species) {
                this.species = species;
                /* Move None particles to the deadParticle pool */
                if (species == Chemistry.Species.None)
                    if (deadParticles.indexOf(this) == -1)
                            deadParticles.push(this);
                /* Update particle color to reflect species */
                particles.colors[this.id].setHSL(species.color[0],species.color[1],species.color[2]);
            }
            
            particle.isDead = function() {
                return this.species == Chemistry.Species.None;
            }
            
            // Set particle species
            particle.setSpecies(
                (function(p,pc) {
                    if (p < pc/55.5)
                        return Chemistry.Species.Hplus;
                    else if (p < pc/55.5*2)
                        return Chemistry.Species.OHminus;
                    else {
                        return Chemistry.Species.H2O;
                    }
                })(p, PARTICLE_COUNT)
            );
        
            // Add particle to the geometry system
            particles.vertices.push(particle);
        }
    }
    
    _.getParticles = function() {
        return particles;
    }
    
    _.getParticle = function(index) {
        return particles.vertices[index];
    }
    
    _.popDeadParticle = function() {
        return deadParticles.pop();
    }
    
    var COLLISION_RANGE = 10;
    
    _.runCollisions = function() {
        var map = {};
        
        var pCount = PARTICLE_COUNT;
        while(pCount--) {
            var particle = _.getParticle(pCount);
            if (!particle.isDead()) {
                var hash =
                      String((particle.x / COLLISION_RANGE)>>0)
                    + String((particle.y / COLLISION_RANGE)>>0)
                    + String((particle.z / COLLISION_RANGE)>>0)
                ;
                if (!map[hash])
                    map[hash] = [];
                map[hash].push(pCount);
            }
        }
        
        Utils.forMap(map, function(hash, pArr) {
            if (pArr.length > 1) {
                
                /* Copy impact array for adjusting particles even if they don't react */
                var pArrOG = pArr.slice(0);
                
                /* Run reaction test on particles */
                var result = Chemistry.collide(pArr);
                
                /* If reaction had products, update particles to reflect reaction */
                if (result != null && result != undefined) {
                    
                    var products = result.productSpecies.slice(0);
                    var reactantParticleIndexes = result.reactantParticleIndexes.slice(0);
                
                    /* Increment reactions counter */
                    Counter.incrementReactions();
                    
                    /* Handle cases where more products formed than reactants
                        - Calls up dead particles to become product particles */
                    while(products.length > reactantParticleIndexes.length) {
                        var productSpecies = products.pop();
                        var particle = _.popDeadParticle();
                        
                        particle.setSpecies(productSpecies);
                        particle.x = reactantParticleIndexes[0].x;
                        particle.y = reactantParticleIndexes[0].y;
                        particle.z = reactantParticleIndexes[0].z;
                    }
                    
                    /* Handle cases where more reactants were used than products formed
                        - Uses excess reactant particles to become the product particles. */
                    while(reactantParticleIndexes.length > products.length) {
                        var particleIndex = reactantParticleIndexes.pop();
                        var particle = particles.vertices[particleIndex];
                        particle.setSpecies(Chemistry.Species.None);
                    }
                    
                    /* Turn remaining particles into new products */
                    while(reactantParticleIndexes.length > 0) {
                        var particleIndex = reactantParticleIndexes.pop();
                        var particle = particles.vertices[particleIndex];
                        
                        var productSpecies = products.pop();
                        particle.setSpecies(productSpecies);
                    }
                }
                /* Increment collisions counter */
                Counter.incrementCollisions();
                
                /* Reverse particle velocities. Why do this? */
                /*while(pArrOG.length > 0) {
                    var particle = _.getParticle(pArrOG.pop());
                    particle.velocity.x *= -1;
                    particle.velocity.y *= -1;
                    particle.velocity.z *= -1;
                }*/
            }
        });
    }
    
    var isPos = function(num) {
        return num >= 0;
    }
    
    _.updatePos = function() {
        // add some rotation to the system
        particleSystem.rotation.y += 0.0;
        
        var pCount = PARTICLE_COUNT;
        while(pCount--) {
            // get the particle
            var particle = particles.vertices[pCount];
            
            if (!Container.Test.x(particle))
                particle.velocity.x *= isPos(particle.x - Container.Dimen.x) ? (isPos(particle.velocity.x) ? -1 : 1) : (isPos(particle.velocity.x) ? 1 : -1);
            if (!Container.Test.y(particle))
                particle.velocity.y *= isPos(particle.y - Container.Dimen.y) ? (isPos(particle.velocity.y) ? -1 : 1) : (isPos(particle.velocity.y) ? 1 : -1);
            if (!Container.Test.z(particle))
                particle.velocity.z *= isPos(particle.z - Container.Dimen.z) ? (isPos(particle.velocity.z) ? -1 : 1) : (isPos(particle.velocity.z) ? 1 : -1);
            
            // and the position
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.z += particle.velocity.z;
        }
        
        // flag to the particle system
        // that we've changed its vertices.
        particleSystem.geometry.__dirtyVertices = true;
    }
    
    return _;
})();

var Engine = (function() {
    var _ = {};
    
    _.loop = function() {
        requestAnimationFrame(_.loop);
        _.update();
    }
    
    _.update = function() {
        Particles.updatePos();
        Particles.runCollisions();
        Visualizer.update();
        Visualizer.render();
        Counter.update();
    }
    

    Visualizer.setup();
    Particles.init();
    Particles.setupParticles();
    Container.setup(); // Must be called after Particles so that rendering occurs properly
    _.loop();
    
    return _;
    
})();