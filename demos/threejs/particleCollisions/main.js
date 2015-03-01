Utils = (function() {
    var _ = {};
    
    _.forMap = function (o, f) {
        for (var key in o) {
            if(o.hasOwnProperty(key)){
                f(key, o[key]);
            }
        }  
    };
    
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
        __.getHeight = function() {
            return CENTER_Z + DEPTH/2;
        }
        
        return __;
    })();
    
    return _;
})();

Counter = (function() {
    var _ = {};
    
    var elem = document.getElementById("counter");
    
    var updateCounter = 0;
    _.update = function(particles) {
        updateCounter++;
        if (updateCounter % 30 == 0) {
            console.log("Updating\n\n\n\n");
            elem.innerHTML = "";
            var counter = {};
            var pCount = particles.vertices.length>>0;
            while(pCount--) {
                var color = particles.colors[pCount];
                var rgbColor = [color.r * 255>>0, color.g * 255>>0, color.b * 255>>0]
                var impacts = particles.vertices[pCount].impacts;
                
                if (!counter[impacts])
                    counter[impacts] = {count: 0, rgb: rgbColor, c: color};
                counter[impacts].count++;
            }
            Utils.forMap(counter, function(impacts, val) {
                var div = document.createElement("div");
                var colorString = "rgb(" + val.rgb[0] + "," + val.rgb[1] + "," + val.rgb[2] + ")";
                div.style.color = colorString;
                div.innerHTML = "" + impacts + " impacts - " + val.count + " particles";
                elem.appendChild(div);
            });
        }
    }
    
    return _;
})();

function getColor(impacts) {
    var color = [((360-(impacts*15))%361)/360,1,.5];
    return color;
};

Particles = (function() {
    var _ = {};
    
    var PARTICLE_COUNT = 500;
    var MAX_SPEED = 0.5;
    
    var particles = new THREE.Geometry();
    var particleSystem;
    
    particles.colors = [];
    particles.species = [];
    // particles.vertices[n].impacts
    
    _.init = function() {
        var pMaterial =
            new THREE.ParticleBasicMaterial({
                color: 0xFFFFFF,
                size: 1,
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
            
            particle.impacts = 0;
        
            // add it to the geometry
            particles.vertices.push(particle);
            
            /* Setup particle colors */
            particles.colors[p] = new THREE.Color( 0xFFFFFF );
            particles.colors[p].setHSL(1,1,1);
        }
    }
    
    _.getParticles = function() {
        return particles;
    }
    
    _.runCollisions = function() {
        var map = {};
        
        var pCount = PARTICLE_COUNT;
        while(pCount--) {
            var particle = particles.vertices[pCount];
            var hash = (particle.x>>0)*10000 + (particle.y>>0)*100 + (particle.z>>0)*1;
            if (!map[hash])
                map[hash] = [];
            map[hash].push(pCount);
        }
        
        Utils.forMap(map, function(hash, pArr) {
            if (pArr.length > 1) {
                console.log("Collision between: " + pArr);
                while(pArr.length) {
                    var i = pArr.pop();
                    var p = particles.vertices[i];
                    
                    /* Increment impact counter */
                    p.impacts++;
                    console.log("\t" + i + " has had " + p.impacts + " collisions");
                    
                    /* Reverse particle velocities */
                    p.velocity.x *= -1;
                    p.velocity.y *= -1;
                    p.velocity.z *= -1;
                    
                    /* Change color to red */
                    var color = getColor(p.impacts);
                    particles.colors[i].setHSL(color[0],color[1],color[2]);
                }
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
        Counter.update(Particles.getParticles());
    }
    

    Visualizer.setup();
    Particles.init();
    Particles.setupParticles();
    Container.setup(); // Must be called after Particles so that rendering occurs properly
    _.loop();
    
    return _;
    
})();