//
//
var CanvasSpinner = function( dom , divider, image_path){

    "use strict";

    var self = this;

    self.afterRender = {};

    var image;

    if (image_path){
        image = new Image();
        image.onload = function(){
            image.rotate_angle = 0.0;
            image.loaded = true;
        };
        image.src = image_path;
    }

    self.init = function(){

        if (canvas)
            return;

        canvas = document.createElement('canvas');

        var rect;

        if (dom){
            rect = dom.getBoundingClientRect();
        }
        else {
            rect = {};
            rect.top = 0;
            rect.left = 0;
            rect.width = window.innerWidth;
            rect.height = window.innerHeight;
        }
        var max = rect.width > rect.height? rect.width : rect.height;
        canvas.width = max / divider;
        canvas.height = max / divider;
        canvas.style.position = "absolute";
        canvas.style.top = Math.round(rect.top + rect.height / 2 - canvas.height / 2) + "px";
        canvas.style.left = Math.round(rect.left + rect.width / 2 - canvas.width / 2) + "px";
        //canvas.style.zIndex = "100";
        //canvas.setAttribute('tabindex','0');
		//canvas.focus();
		
        document.body.appendChild(canvas);

        start = new Date();  

        loader_interval = setInterval(draw, 1000 / 30);

        return self;
    };

    self.deallocate = function(){
        if (!canvas)
            return;
        clearInterval(loader_interval);
        document.body.removeChild(canvas);
        canvas = null;
        loader_interval = 0;
        return self;
    };

    self.updateText = function(in_text){
        text = in_text;
    };

    // ===============

    var canvas = null;
    var loader_interval = 0;
    var start = new Date();
    var lines = 16;
    var text = "";

    function draw(){

        if (!canvas)
            return;

        var rect;

        if (dom){
            rect = dom.getBoundingClientRect();
        }
        else {
            rect = {};
            rect.top = 0;
            rect.left = 0;
            rect.width = window.innerWidth;
            rect.height = window.innerHeight;
        }

        var max = rect.width > rect.height? rect.width : rect.height;

        var rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;

        var cW, cH, context;

        if (image){

            if (image.loaded){

                cW = 2 * image.width;
                cH = 2 * image.height;

                canvas.width = cW;
                canvas.height = cH;
                canvas.style.top = Math.round(rect.top + rect.height / 2 - canvas.height / 2) + "px";
                canvas.style.left = Math.round(rect.left + rect.width / 2 - canvas.width / 2) + "px";
                //canvas.setAttribute('tabindex','0');
				//canvas.focus();
				
                context = canvas.getContext('2d');

                context.save();

                context.clearRect(0, 0, cW, cH);

                context.translate(image.width, image.height); 
                context.rotate(Math.PI * 2 * rotation);
                context.drawImage(image, -image.width / 2, -image.height /2); 

                context.restore();
            }
        }
        else 
        {
            canvas.width = max / divider;
            canvas.height = max / divider;
            canvas.style.top = Math.round(rect.top + rect.height / 2 - canvas.height / 2) + "px";
            canvas.style.left = Math.round(rect.left + rect.width / 2 - canvas.width / 2) + "px";
            //canvas.setAttribute('tabindex','0');
			//canvas.focus();
            
            context = canvas.getContext('2d');

            cW = context.canvas.width;
            cH = context.canvas.height;

            var line_length = cW;

            context.clearRect(0, 0, cW, cH);

            context.save();

            context.translate(cW / 2, cH / 2);
            context.rotate(Math.PI * 2 * rotation);

            for (var i = 0; i < lines; i++) {
                context.beginPath();
                context.rotate(Math.PI * 2 / lines);
                context.moveTo(line_length / 10, 0);
                context.lineTo(line_length / 4, 0);
                context.lineWidth = line_length / 30;
                context.strokeStyle = "rgba(0, 0, 0," + i / lines + ")";
                context.stroke();
            }

            context.restore();

            context.save();

            if (text) {

                var pen = "rgba(0, 0, 0, 1.0)";

                context.strokeStyle = pen;
                context.fillStyle = pen;
                context.lineWidth = 1;

                var text_height = 13;
                context.font = text_height + 'px Arial';
                var text_width = context.measureText(text).width;

                context.translate(cW / 2 - text_width / 2, cH / 2 + text_height / 2.5);

                context.fillText(text, 0, 0);
            }

            context.restore();
        }

        for ( let f in self.afterRender){

            self.afterRender[f](self, canvas, context);
        }
    }
};
function detectmob() { 
    "use strict";
    var navigator = window.navigator;
    if(navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) || 
        navigator.userAgent.match(/iPhone/i) || 
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    }
    else {
        return false;
    }
}

// URL
function getURLQueryParams(name, url) {
    "use strict";
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}
/**
 * converts a XYZ vector3 to longitude latitude (Direct Polar)
 * @param lng longitude
 * @param lat latitude
 * @param vector3 optional output vector3
 * @returns a unit vector of the 3d position
 */
function lonLatToVector3( lng, lat, out )
{
    "use strict";
    out = out || new THREE.Vector3();

    //flips the Y axis
    lat = Math.PI / 2 - lat;

    //distribute to sphere
    out.set(
                Math.sin( lat ) * Math.sin( lng ),
                Math.cos( lat ),
                Math.sin( lat ) * Math.cos( lng )
    );

    return out;
}

/**
 * converts a XYZ THREE.Vector3 to longitude latitude. beware, the vector3 will be normalized!
 * @param vector3 
 * @returns an array containing the longitude [0] & the lattitude [1] of the Vector3
 */
function vector3toLonLat( vector3 )
{
    "use strict";
    vector3.normalize();

    //longitude = angle of the vector around the Y axis
    
    var lng = ( Math.atan2( vector3.z, vector3.x ) ) ;

    //to bind between -PI / PI
     if( lng < - Math.PI )
         lng += Math.PI * 2;

    //latitude : angle between the vector & the vector projected on the XZ plane on a unit sphere

    //project on the XZ plane
    var p = new THREE.Vector3( vector3.x, 0, vector3.z );
    //project on the unit sphere
    p.normalize();

    //commpute the angle ( both vectors are normalized, no division by the sum of lengths )
    var lat = Math.acos( p.dot( vector3 ) );

    //invert if Y is negative to ensure teh latitude is comprised between -PI/2 & PI / 2
    if( vector3.y < 0 ) lat *= -1;

    return [ lng, lat ];

}

/**
 * determines if a polyline contains a point
 * @param polygon a series of X,Y coordinates pairs
 * @param x point.x
 * @param y point.y
 * @returns true if the path contains the point, false otherwise
 */
function polygonContains( polygon, x, y )
{
    "use strict";
    var j = 0;
    var oddNodes = false;
    for( var i = 0; i < polygon.length; i+=2 )
    {

        j = ( j + 2 ) % polygon.length;

        var ix = polygon[ i ];
        var iy = polygon[ i+1 ];
        var jx = polygon[ j ];
        var jy = polygon[ j+1 ];

        if ( ( iy < y && jy >= y ) || ( jy < y && iy >= y )    )
        {
            if ( ix + ( y - iy ) / ( jx - ix ) * ( jx - ix ) < x )
            {
                oddNodes = !oddNodes;
            }
        }
    }
    return oddNodes;
}


function toScreenPosition(position, camera, canvas){
    "use strict";

    var rect = canvas.getBoundingClientRect();
    
    var vector = new THREE.Vector3(position.x, position.y, position.z);

    var widthHalf = 0.5 * rect.width;
    var heightHalf = 0.5 * rect.height;
	
    vector.project(camera);
    

    vector.x = /*rect.x*/ + ( vector.x * widthHalf ) + widthHalf;
    vector.y = /*rect.y*/ - ( vector.y * heightHalf ) + heightHalf;
    
    

    return [ vector.x, vector.y ];
    
}

/**
 * locateCamera: orients a camera to look at another object & preserve the camera's UP axis
 * @param target object to lookAt
 * @param camera object (camera) to position
 * @param camera_angle extra angle on the latitude
 * @param camera_distance distance between the target and the camera
 */
function locateCamera( target, camera, camera_angle, camera_distance )
{
    "use strict";
    var UP = new THREE.Vector3( 0,1,0 );
    var NORMAL = target.clone().normalize();

    var angle = Math.acos( UP.dot( NORMAL ) );
    angle += camera_angle || 0;

    if( angle > Math.PI )    UP.y *= -1;
    if( angle < 0 )          angle += Math.PI;

    var AX = UP.crossVectors( UP, NORMAL );

    var tmp = new THREE.Vector3( 0,1,0 );
    tmp.applyAxisAngle( AX, angle );
    tmp.multiplyScalar( camera_distance ).add( target );

    camera.position.copy( tmp );
    camera.lookAt( target );

}

// Rotate an object around an arbitrary axis in object space
function rotateAroundObjectAxis(object, axis, radians) {
    "use strict";
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians, bMultyply) {
    "use strict";
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    if (bMultyply || bMultyply === undefined)
        rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}
//
//
//

var Clouds = function ( state, cloudImageThreeTexture, cloudsNum, cloudsRandomX, cloudsRandomZ){

    "use strict";

    var self = this;

    if (!cloudsNum)
        cloudsNum = 4000;

    // var textureLoader = new THREE.TextureLoader();

    var sprite_texture = cloudImageThreeTexture; //  textureLoader.load( cloudImage );

    var group = new THREE.Group();

    var material = new THREE.SpriteMaterial( { 
        map: sprite_texture,
    } );

    function randomInRange(min,max){
       return Math.random() * (max - min) + min;
    }

    function getPosition(){

        var position = new THREE.Vector3();

        position.set(
            Math.floor(randomInRange( -(cloudsRandomX + 3 * cloudsRandomX) / 2, (cloudsRandomX + 0.1 * cloudsRandomX) / 2)),
            Math.floor(randomInRange( -1000 , 0)),
            Math.floor(randomInRange( -(cloudsRandomZ + 0.1 * cloudsRandomZ) / 2, (cloudsRandomZ + 0.1 * cloudsRandomZ) / 2))
        );

        return position;
    }

    var overlap_array = [], current_position;

    function checkPosition( element ){

        var v = 0.01 * Math.sqrt(cloudsRandomX * cloudsRandomX + cloudsRandomZ * cloudsRandomZ);

        if (element.distanceTo(current_position) > v)
            return true;

        return false;
    }

    for ( var i = 0; i < cloudsNum; i++ ) {

        var sprite = new THREE.Sprite( material );

        var pos = getPosition();
        current_position = pos;

        if (overlap_array.length){
            while (!overlap_array.every(checkPosition)){
                pos = getPosition();
                current_position = pos;
            }
        }

        overlap_array.push(pos);

        sprite.position.x = pos.x;
        sprite.position.y = pos.y;
        sprite.position.z = pos.z;

        sprite.rotation.x = Math.random() * Math.PI;
        sprite.rotation.y = Math.random() * Math.PI;
        sprite.rotation.z = Math.random() * Math.PI;

        sprite.scale.x = sprite.scale.y = randomInRange( 4000, 3000 );

        sprite.name = "cloud-sprite";

        group.add( sprite );
    }

    group.name = "cloud-group";

    return group;


};

//
//
//

var Drawer = function( in_container, in_path ){

    "use strict";

    var self = this;

    self.onBeforeRender = {};

    self.afterRender = {};

    self.onCubeTextureLoad = {};

    self.enterAnimationLoop = function(){
        if (!bEnterAnimationLoop){
            bEnterAnimationLoop = true;
            animate();
        }
    };

    self.renderCall = function( scene, camera ){

        renderer.render(scene, camera);
    };

    self.setCamera = function(in_camera){

        camera = in_camera;
    };

    self.getCamera = function(){

        return camera;
    };

    self.setScene = function(in_scene){

        scene = in_scene;
    };

    self.getScene = function(){

        return scene;
    };

    self.getRenderer = function(){

        return renderer;
    };

    self.pushAutoClearState = function(){

        var acstate = {
            autoClear : renderer.autoClear,
            autoClearColor : renderer.autoClearColor,
            autoClearDepth : renderer.autoClearDepth,
            autoClearStencil : renderer.autoClearStencil,
        };

        autoClearStateArray.unshift(acstate);
    };

    self.popAutoClearState = function(){

        var acstate = autoClearStateArray.pop();

        renderer.autoClear = acstate.autoClear;
        renderer.autoClearColor = acstate.autoClearColor;
        renderer.autoClearDepth = acstate.autoClearDepth;
        renderer.autoClearStencil = acstate.autoClearStencil;
    };

    self.setSize = function( width, height ){

        var devicePixelRatio = window.devicePixelRatio || 1.0;

        var backingStoreRatio = 1.0;

        // only for CanvasRenderingContext2D
        /*backingStoreRatio = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;*/

        var ratio = devicePixelRatio / backingStoreRatio;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio( ratio );
        renderer.setSize(width, height);

        if (renderer_parameters_aa_options.shaderPass.length){

            renderer_parameters_aa_options.resize(width, height);

            var newWidth  = Math.floor( width / ratio ) || 1;
            var newHeight = Math.floor( height / ratio ) || 1;

            postprocessing.composer.setSize( newWidth, newHeight );
        }
    };

    // -------------------------------------------

    var bEnterAnimationLoop = false;

    var autoClearStateArray = [];

    var container = in_container;

    var path = in_path;

    var globalPlane = new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 0.1 );

    var camera = new THREE.PerspectiveCamera( 50, 1 / 1, 1, 100000 );

    var scene = new THREE.Scene();

    var devicePixelRatio = window.devicePixelRatio || 1;

    var aa_option = "default";//devicePixelRatio !== 1.0 ? "none" : "default";

    var renderer_parameters_aa_options = getAA( aa_option , scene, camera);

    var backingStoreRatio = 1.0;

    // only for CanvasRenderingContext2D
    /*backingStoreRatio = context.webkitBackingStorePixelRatio ||
                        context.mozBackingStorePixelRatio ||
                        context.msBackingStorePixelRatio ||
                        context.oBackingStorePixelRatio ||
                        context.backingStorePixelRatio || 1;*/

    var ratio = devicePixelRatio / backingStoreRatio;

    var renderer_parameters = {};
    // renderer_parameters.canvas = null;
    renderer_parameters.alpha = true;
    renderer_parameters.depth = true;
    renderer_parameters.stencil = true;
    renderer_parameters.antialias = renderer_parameters_aa_options.useDefault;
    renderer_parameters.premultipliedAlpha = false;
    renderer_parameters.preserveDrawingBuffer = false;

    var renderer = new THREE.WebGLRenderer( renderer_parameters );
    renderer.setPixelRatio( ratio );
    renderer.setSize( 1, 1 );
    renderer.setClearColor(0xFFFFFF);
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    renderer.localClippingEnabled = true;
    var globalPlanes = [ globalPlane ], Empty = Object.freeze( [] );
    renderer.clippingPlanes = Empty;

    var postprocessing = {};

    if (renderer_parameters_aa_options.shaderPass.length){

        var composer = new THREE.EffectComposer(renderer);

        var renderPass = new THREE.RenderPass(scene, camera);

        renderPass.renderToScreen = false;

        composer.addPass(renderPass);

        for ( var sI = 0; sI < renderer_parameters_aa_options.shaderPass.length; sI++) {

            composer.addPass(renderer_parameters_aa_options.shaderPass[sI]);
        }

        postprocessing.composer = composer;

        self.renderCall = function( scene, camera ){

            renderPass.scene = scene;
            renderPass.camera = camera;

            postprocessing.composer.render();
        };
    }

    var onCubeTextureLoadDeffered = $.Deferred();

    // Skybox
    var skyboxDeffered = $.Deferred();
    var cloudDeffered = $.Deferred();

    $.when(
        skyboxDeffered,
        cloudDeffered
    ).then( function (data) {

        for ( let f in self.onCubeTextureLoad){
            self.onCubeTextureLoad[f](self);
        }

    }).fail(function (e) {
        console.error("Could not upload config file ...");
    });


    var cubeTextureLoader = new THREE.CubeTextureLoader(new THREE.LoadingManager());
    cubeTextureLoader.manager.onLoad = function(){
        skyboxDeffered.resolve();
    };
    cubeTextureLoader.setPath( 'app/img/skybox/' );
    var cubeTexture = cubeTextureLoader.load( [
        'Cube-map_r.jpg', 'Cube-map_l.jpg',
        'Cube-map_u.jpg', 'Cube-map_d.jpg',
        'Cube-map_f.jpg', 'Cube-map_b.jpg',
    ] );
    var cubeShader = THREE.ShaderLib.cube;
    cubeShader.uniforms.tCube.value = cubeTexture;
    var skyBoxMaterial = new THREE.ShaderMaterial( {
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        side: THREE.BackSide
    } );
    var box_size = 80000.0;
    var skyBox = new THREE.Mesh( new THREE.BoxBufferGeometry( box_size, box_size, box_size ), skyBoxMaterial );
    skyBox.name = "skybox";
    scene.add( skyBox );

    var cloudsNum = 100;
    var cloudsRandomX = 40000;
    var cloudsRandomZ = 40000;
    var cloudsRandom = cloudsRandomZ;

    var cloudsTextureLoader = new THREE.TextureLoader(new THREE.LoadingManager());
    cloudsTextureLoader.manager.onLoad = function(){
        cloudDeffered.resolve();
    };
    var cloudsTexture = cloudsTextureLoader.load( "app/img/cloud.png" );

    var clouds1 = new Clouds( null, cloudsTexture, cloudsNum, cloudsRandomX, cloudsRandomZ );
    clouds1.frustumCulled = false;
    var clouds2 = new Clouds( null, cloudsTexture, cloudsNum, cloudsRandomX, cloudsRandomZ );
    clouds2.frustumCulled = false;
    var clouds3 = new Clouds( null, cloudsTexture, cloudsNum, cloudsRandomX, cloudsRandomZ );
    clouds3.frustumCulled = false;

    scene.add( clouds1 );
    if (clouds2)
        scene.add( clouds2 );
    if (clouds3)
        scene.add( clouds3 );

    clouds1.position.set( clouds1.position.x, clouds1.position.y - 2000, -cloudsRandom);
    clouds1.updateMatrixWorld();

    if (clouds2){
        clouds2.position.set( clouds2.position.x, clouds2.position.y - 2000, 0);
        clouds2.updateMatrixWorld();
    }

    if ( clouds3 ){
        clouds3.position.set( clouds3.position.x, clouds3.position.y - 2000, cloudsRandom);
        clouds3.updateMatrixWorld();
    }

    renderer.domElement.style.position = "absolute";

    if (container)
        container.appendChild( renderer.domElement );

    var clock = new THREE.Clock();

    function animate( time ) {

        requestAnimationFrame( animate );

        var delta = clock.getDelta();

        TWEEN.update(time);

        THREE.SEA3D.AnimationHandler.update( delta );

        render(delta);
    }

    function render(delta) {

        var f;

        for ( f in self.onBeforeRender){

            self.onBeforeRender[f](self, delta);
        }

        var cloudCheckPoit = -1.5 * cloudsRandom;
        var cloudJumpPoit = 1.5 * cloudsRandom;

        var clouds_speed = 100.0 * delta;

        clouds1.position.set( clouds1.position.x, clouds1.position.y, clouds1.position.z - clouds_speed);
        if ( clouds1.position.z < cloudCheckPoit) {
            clouds1.position.set( clouds1.position.x, clouds1.position.y, cloudJumpPoit);
        }
        clouds1.updateMatrixWorld();

        if (clouds2){
            clouds2.position.set( clouds2.position.x, clouds2.position.y, clouds2.position.z - clouds_speed);
            if ( clouds2.position.z < cloudCheckPoit) {
                clouds2.position.set( clouds2.position.x, clouds2.position.y, cloudJumpPoit);
            }
            clouds2.updateMatrixWorld();
        }
        
        if (clouds3){
            clouds3.position.set( clouds3.position.x, clouds3.position.y, clouds3.position.z - clouds_speed);
            if ( clouds3.position.z < cloudCheckPoit) {
                clouds3.position.set( clouds2.position.x, clouds2.position.y, cloudJumpPoit);
            }
            clouds3.updateMatrixWorld();
        }

        self.renderCall( scene, camera );

        for ( f in self.afterRender){

            self.afterRender[f](self, delta);
        }
    }

    function getAA(parameter, scene, camera) {

        var useDefault = false, shaderPass = [], resize;

        if (parameter === "none") {
            useDefault = false;
        }
        else if (parameter === "default") {
            useDefault = true;
        }
        else if (parameter === "ssaa") {

            useDefault = false;

            var ssaa_param = {
                sampleLevel: 2
            };

            var ssaaRenderPass = new THREE.SSAARenderPass( scene, camera );
            ssaaRenderPass.unbiased = false;
            ssaaRenderPass.sampleLevel = ssaa_param.sampleLevel;

            var copyPass = new THREE.ShaderPass( THREE.CopyShader );
            copyPass.renderToScreen = true;

            shaderPass.push(ssaaRenderPass);
            shaderPass.push(copyPass);

            resize = function(width, height){
                var empty_block = 0;
            };
        }
        else if (parameter === "smaa") {

            useDefault = false;

            var ssmaaPass = new THREE.SMAAPass( 1000, 1000 );
            ssmaaPass.renderToScreen = true;

            shaderPass.push(ssmaaPass);

            resize = function(width, height){
                var empty_block = 0;
            };
        }
        else if (parameter === "fxaa") {

            useDefault = false;

            var fxaaPass = new THREE.ShaderPass( THREE.FXAAShader );
            fxaaPass.uniforms.resolution.value.set(1 / 1000, 1 / 1000);
            fxaaPass.renderToScreen = true;

            shaderPass.push(fxaaPass);

            resize = function(width, height){
                fxaaPass.uniforms.resolution.value.set(1 / width, 1 / height);
            };
        }
        else if (parameter === "bokeh") {

            useDefault = false;

            var bokehPass = new THREE.BokehPass(scene, camera, {
                focus: 1.0,
                aperture: 0.002,
                maxblur: 0.001,

                width: 1000, // these values should be reset in resize call
                height: 1000
            });
            bokehPass.renderToScreen = true;

            shaderPass.push(bokehPass);

            resize = function(width, height){
                bokehPass.uniforms.aspect.value = camera.aspect;
            };

        }

        return {
            useDefault : useDefault,
            shaderPass : shaderPass,
            resize : resize
        };
    }
};
//
//
//

var Hotpoint = function ( hotpoint_data ) {
    "use strict";

    var self = this;

    self.callback = function(_this, sprite, action){};

    self.data = hotpoint_data;

    self.sprite = null;

    self.group = new THREE.Group();

    self.entities = {
    };

    self.makeVisible = function( b ){

        self.entities.line.visible = b;
        self.entities.sprite.visible = b;
        self.entities.red_dot_transparent.visible = !b;
    };

    // --------------------------------

    var image_path = hotpoint_data.image;

    var scale = hotpoint_data["image-scale"];

    var line_length = hotpoint_data["line-length"];

    var red_dot_geometry_data = {
            radius : 20,
            widthSegments : 40,
            heightSegments : 40,
            phiStart : 0,
            phiLength : 2 * Math.PI,
            thetaStart : 0,
            thetaLength : Math.PI
    };
    var red_dot_geometry = new THREE.SphereGeometry( 
        red_dot_geometry_data.radius, 
        red_dot_geometry_data.widthSegments, 
        red_dot_geometry_data.heightSegments, 
        red_dot_geometry_data.phiStart, 
        red_dot_geometry_data.phiLength, 
        red_dot_geometry_data.thetaStart,
        red_dot_geometry_data.thetaLength
    );
    var red_dot = self.entities.red_dot =  new THREE.Mesh( red_dot_geometry, new THREE.MeshBasicMaterial( { 
        color: 0xff0000//,
        //transparent: true,
        //opacity: 0.5 
    } ) );
    red_dot.position.set( self.data.position.x, self.data.position.y, self.data.position.z );

    red_dot.callback = function( action ) {
        self.callback(self, red_dot, action);
    };
    red_dot.name = "red_dot";
    
    red_dot.old_raycast = red_dot.raycast;

    red_dot.raycast = function( raycaster, intersects ){

        red_dot.scale.set( 4, 4, 4 );

        red_dot.updateMatrixWorld();

        var return_value = red_dot.old_raycast(raycaster, intersects );

        red_dot.scale.set( 1, 1, 1 );

        red_dot.updateMatrixWorld();

        return return_value;
    };

    var red_dot_transparent = self.entities.red_dot_transparent = new THREE.Mesh( red_dot_geometry, new THREE.MeshBasicMaterial( { 
        color: 0xff0000,
        transparent: true,
        opacity: 0.3 
    } ) );
    red_dot_transparent.scale.set( 1, 1, 1 );
    red_dot_transparent.position.set( self.data.position.x, self.data.position.y, self.data.position.z );
    red_dot_transparent.raycast = function(){};

    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(
        new THREE.Vector3( self.data.position.x, self.data.position.y, self.data.position.z ),
        new THREE.Vector3( self.data.position.x, self.data.position.y + line_length - scale/2, self.data.position.z )
    );
    var line = self.entities.line = new THREE.Line( line_geometry, new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 3
    } ) );

    var sprite = self.sprite = self.entities.sprite = new THREE.Sprite( new THREE.SpriteMaterial( {
        map: new THREE.TextureLoader().load( image_path ),
        transparent: true,
        opacity: 1.0 
    } ) );
    sprite.position.set( self.data.position.x, self.data.position.y + line_length, self.data.position.z );
    sprite.scale.set( scale, scale, scale );

    sprite.callback = function( action ) {
        self.callback(self, sprite, action);
    };
    sprite.name = "hotpoint";

    self.group.add(red_dot);
    self.group.add(red_dot_transparent);

    line.visible = false;
    self.group.add(line);
    sprite.visible = false;
    self.group.add(sprite);

    return this;
};
//
//
//

var InputManager = function ( state ){

    "use strict";

    var self = this;

    self.targetDistance = 100.0;

    self.init = function() {

        camera.position.set( state.data.camera.position.x, state.data.camera.position.y, state.data.camera.position.z );
        controls.update(0);
    };

    state.loader.onComplete.inputmanager = function( e, obj ) { 

        var hotpoints = state.data.hotpoints;

        var hotpoints_objects_array = [];

        hotpoints.forEach( function(currentValue, index, array) {
            
            var hotPoint = new Hotpoint( currentValue );

            obj.add( hotPoint.group );

            hotpoints_objects_array.push(hotPoint);

            hotPoint.callback = function(_this, sprite, action){

                var e;
                if (action === "click"){
                    e = document.createEvent('Event');
                    e.initEvent("app-hotpoint-clicked", true, true);
                    e.hotpoint =_this;
                    document.dispatchEvent(e);
                }
                else if (action === "keypress"){
                    e = document.createEvent('Event');
                    e.initEvent("app-hotpoint-clicked", true, true);
                    e.hotpoint =_this;
                    document.dispatchEvent(e);
                }
                else if (action === "hover"){
                    e = document.createEvent('Event');
                    e.initEvent("app-hotpoint-hover", true, true);
                    e.hotpoint =_this;
                    document.dispatchEvent(e);
                }
                else if (action === "focus"){
                    e = document.createEvent('Event');
                    e.initEvent("app-hotpoint-clicked", true, true);
                    e.hotpoint =_this;
                    document.dispatchEvent(e);
                } 
                else if (action === "out"){
                    e = document.createEvent('Event');
                    e.initEvent("app-hotpoint-out", true, true);
                    e.hotpoint =_this;
                    document.dispatchEvent(e);
                }
                else if (action === "blur"){
                    e = document.createEvent('Event');
                    e.initEvent("app-hotpoint-clicked", true, true);
                    e.hotpoint =_this;
                    document.dispatchEvent(e);
                }
            };
        });

        document.addEventListener( "app-hotpoint-selected", function(e){

            hotpoints_objects_array.forEach( function(currentValue, index, array) {

                if (e.hotpoint !== currentValue)
                    currentValue.group.visible = false;
                else
                    currentValue.group.visible = true;
            });
        });

        document.addEventListener( "app-hotpoint-deselected", function(e){

            hotpoints_objects_array.forEach( function(currentValue, index, array) {

                currentValue.group.visible = true;
            });

        });
    };

    self.getFreezeOrbit = function(bFreeze){

        var vector = new THREE.Vector3();
        camera.getWorldDirection( vector );

        if (!bFreeze)
            controls.target.set( 0, 0, 0 );

        controls.enabled = !bFreeze;
    };

    var drawer = state.drawer;
    var loader = state.loader;
    var renderer = drawer.getRenderer();
    var canvas = renderer.domElement;
    var camera = drawer.getCamera();
    var scene = drawer.getScene();

    scene.add( new THREE.AmbientLight( 0xffffff, 0.65 ) );

    /*var ambientLight = new THREE.AmbientLight( 0xffffff, .20 );
    ambientLight.position.set( 0, -5, 0);
    scene.add( ambientLight); */

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.35 );
    directionalLight.position.set( -2, 2, 2);
    scene.add( directionalLight); 

    var controls = new THREE.OrbitControls( camera, canvas );
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minPolarAngle = 1;
    controls.maxPolarAngle = 1.5;
    controls.minDistance = 1500;
    controls.maxDistance = 3000;
    controls.rotateSpeed = 0.25;
    controls.update();

    controls.target.set( 0, 0, 0 ); // vector.x, vector.y, vector.z);

    controls.update(0);
    controls.addEventListener( 'change', function(){
    } );
    
    function onClick( event ) {

        //var devicePixelRatio = window.devicePixelRatio || 1;
        //var canvasX = (e.pageX - canvas.offsetLeft) * devicePixelRatio;
        //var canvasY = (e.pageY - canvas.offsetTop) * devicePixelRatio;
        // Perform some operation with the transformed coordinates

        if (!state.loader || !state.loader.isComplete())
            return;

        if (event.target != renderer.domElement)
            return;

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        // event.preventDefault();

        var rect = renderer.domElement.getBoundingClientRect();

        var clientX = event.clientX - rect.left;
        var clientY = event.clientY - rect.top;

        if ( clientX < 0 || event.clientX > ( renderer.domElement.clientWidth + rect.left ) )
            return;

        if ( clientY < 0 || event.clientY > ( renderer.domElement.clientHeight - rect.top ) )
            return;

        mouse.x = ( clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );
    
        var intersects = raycaster.intersectObjects( state.loader.getObject().children, true); 

        function global_area_clicked(){
            var e=document.createEvent('Event');
            e.initEvent("app-global-area-clicked", true, true);
            e.event = event;
            document.dispatchEvent(e);
        }

        if ( intersects.length > 0 ) {
            if (intersects[0].object && intersects[0].object.callback){
                intersects[0].object.callback( "click" );
            }
            else{
                global_area_clicked();
            }

            if (window.debug_hotpoints_click) {
                if (intersects[0].object && intersects[0].object.name === "plane-object"){
                    console.log( "fleet selected; point : ");
                    console.log(intersects[0].point);
                }
            }
        }
        else{
            global_area_clicked();
        }
        
        
    }

    var pickPointObject = null;

    function onMouseMove( event ) {

        if (!state.loader || !state.loader.isComplete())
            return;

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        // event.preventDefault();

        var rect = renderer.domElement.getBoundingClientRect();

        var clientX = event.clientX - rect.left;
        var clientY = event.clientY - rect.top;

        if ( clientX < 0 || event.clientX > ( renderer.domElement.clientWidth + rect.left ) )
            return;

        if ( clientY < 0 || event.clientY > ( renderer.domElement.clientHeight - rect.top ) )
            return;

        mouse.x = ( clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( state.loader.getObject().children, true ); 

        if ( intersects.length > 0 ) {

            if (pickPointObject != intersects[0].object && pickPointObject && pickPointObject.callback)
            {
                pickPointObject.callback( "out" );
            }

            pickPointObject = intersects[0].object;

            if (pickPointObject && pickPointObject.callback)
            {
                pickPointObject.callback( "hover" );
            }
        }
        else {

            if (pickPointObject && pickPointObject.callback)
            {
                pickPointObject.callback( "out" );
            }

            pickPointObject = null;
        }
    }

    function onKeyDown ( event ) {
        
        var keysequence = "";

        keysequence += event.ctrlKey ? "Ctrl+" : "";
        keysequence += event.shiftKey ? "Shift+" : "";
        keysequence += event.altKey ? "Alt+" : "";
        keysequence += event.metaKey ? "Meta+" : "";

        keysequence += commonKeyboardCodes.fromKeyCode(event.keyCode);

        keysequence = keysequence.toUpperCase();

        //var id = state.commands.KEYSEQUENCES[keysequence];
        //if (id)
        //    state.commands.toggleCommand(id);
    }
    window.addEventListener( 'keydown', onKeyDown, false );
    window.addEventListener( 'click', onClick, false );
    window.addEventListener( 'mousemove', onMouseMove, false );

    var CommonKeyboardCodes = function () {
        // this class used for get character for key down pressed up
        // independantly from language used - thouse help support 
        // application.xml
        this.fromKeyCode = function (in_keyCode) {
            var str = "";
            if (map.hasOwnProperty(in_keyCode)) {
                str = map[in_keyCode];
            }
            return str;
        };
        var map = {
            8: "Backspace", 9: "Tab",
            13: "Enter", 16: "Shift",
            17: "Ctrl", 18: "Alt",
            19: "Pause", 20: "CapsLock",
            27: "Escape",
            33: "PgUp", // application.xml support
            34: "PgDn", // application.xml support
            35: "End", 36: "Home",
            37: "LeftArrow", 38: "UpArrow",
            39: "RightArrow", 40: "DownArrow",
            45: "Insert",
            46: "Del", // application.xml support
            //
            // Digits
            48: "0", 49: "1", 50: "2", 51: "3", 52: "4",
            53: "5", 54: "6", 55: "7", 56: "8", 57: "9",
            //
            // Alphabet
            65: "a", 66: "b", 67: "c",
            68: "d", 69: "e", 70: "f",
            71: "g", 72: "h", 73: "i",
            74: "j", 75: "k", 76: "l",
            77: "m", 78: "n", 79: "o",
            80: "p", 81: "q", 82: "r",
            83: "s", 84: "t", 85: "u",
            86: "v", 87: "w", 88: "x",
            89: "y", 90: "z",
            //
            // Special window keys
            91: "LeftWindowKey",
            92: "RightWindowKey",
            93: "SelectKey",
            //
            // Numpad
            96: "Num0", 97: "Num1",
            98: "Num2", 99: "Num3",
            100: "Num4", 101: "Num5",
            102: "Num6", 103: "Num7",
            104: "Num8", 105: "Num9",
            //
            // Math keys
            106: "Multiply", 107: "Add",
            109: "Subtract", 110: "DecimalPoint",
            111: "Divide", 187: "EqualSign",
            188: "Comma", 189: "Dash",
            190: "Period",
            //
            // Function keys
            112: "f1", 113: "f2", 114: "f3",
            115: "f4", 116: "f5", 117: "f6",
            118: "f7", 119: "f8", 120: "f9",
            121: "f10", 122: "f11",
            123: "f12",
            //
            // Locks , Quotes, Brackets..
            144: "NumLock", 145: "ScrollLock", 186: ",",
            //
            191: "/", 192: "`",
            219: "{", 220: "\\",
            221: "}", 222: "'"
        };
    };
    var commonKeyboardCodes = new CommonKeyboardCodes();
};
//
//
//

THREE.SEA3D.prototype.readTextureURL = function ( sea ) {

    "use strict";

    var textureLoader = new THREE.TextureLoader(new THREE.LoadingManager());

    var deferred = $.Deferred();

    textureLoader.manager.onLoad = function(){

        deferred.resolve();
    };

    var texture = textureLoader.load( this.parsePath( sea.url ) );

    texture.name = sea.name;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;

    if ( this.config.anisotropy !== undefined ) texture.anisotropy = this.config.anisotropy;

    this.domain.textures = this.textures = this.textures || [];
    this.textures.push( this.objects[ "tex/" + sea.name ] = sea.tag = texture );

    this.defferedTextures = this.defferedTextures || [];
    this.defferedTextures.push(deferred);
};

var Loader = function ( state ){

    "use strict";

    var self = this;

    var drawer = state.drawer;

    self.getLoader = function(){

        return loader;
    };

    self.load = function( path ){

        loader.load( path );
    };

    self.isComplete = function (){
        return bDone;
    };

    self.getObject = function(){
        return object_container;
    };

    self.onProgress = {};

    self.onDownloadProgress = {};

    self.onComplete = {};

    // -------------------------------

    var bDone = false;

    var object_container = new THREE.Object3D();

    object_container.visible = false;

    var loader = new THREE.SEA3D( {
        autoPlay : false,
        container : object_container
    } );

    loader.onProgress = function( e ){
        for ( var f in self.onProgress){
            self.onProgress[f](e);
        }
    };

    loader.onDownloadProgress = function( e ){
        for ( var f in self.onDownloadProgress){
            self.onDownloadProgress[f](e);
        }
    };

    loader.onComplete = function( e ) {

        let defferedArray = loader.defferedTextures || [$.Deferred().resolve("done")];

        $.when.apply($, defferedArray ).done( function ( ) {

            object_container.traverse( function(child) {

                var materials = child.material;
                var material;

                if (!materials)
                    return;

                if ( Array.isArray(materials) ) {

                    for (var i = 0; i < materials.length; i++) {

                        material = materials[i];
                        //material.morphNormals = true;
                        //material.morphTargets = true;
                    }
                }
                else{

                    material = materials;
                    //material.morphNormals = true;
                    //material.morphTargets = true;
                }
            });

            bDone = true;

            for ( var f in self.onComplete){

                self.onComplete[f](e, object_container);
            }

            object_container.visible = true;
        });
    };
};
//
//
//

function detectmob() { 
    "use strict";
        /* global navigator */
    if( navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i))
    {
        return true;
    }
    else 
    {
        return false;
    }
}

// events:
// - app-inited
// - app-hotpoint-clicked
// - app-global-area-clicked
// - app-hotpoint-selected
// - app-hotpoint-deselected
// - app-close-active-hotpoint

var APP = function (container_id, path ){

    "use strict";

    var self = this;

    self.resize = function( width, height ){
        size.width = width;
        size.height = height;
        if (state.drawer)
            state.drawer.setSize( width, height );
    };

    self.getState = function(){
        return state;
    };

    self.init = function(){

        window.debug_hotpoints_click = false;

        var container = document.getElementById( container_id );

        if ( !Detector.webgl ) {
            Detector.addGetWebGLMessage(
	            { id: "text-alternative-to-threejs" }
                //parent : container
            );
            return;
        }

        var stats = new Stats();
        // container.appendChild( stats );

        var drawer = state.drawer = new Drawer( null , path );

        drawer.setSize( size.width, size.height );

        drawer.onBeforeRender.main = function(in_drawer, in_delta){
            if (stats)
                stats.update();
        };

        var onCubeTextureLoadDeffered = $.Deferred();

        drawer.onCubeTextureLoad.main = function(in_drawer){

            onCubeTextureLoadDeffered.resolve();
        };

        // "/drawer-resources/spinner.png"
        var spinner_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAABOCAYAAACOqiAdAAABN2lDQ1BBZG9iZSBSR0IgKDE5OTgpAAAokZWPv0rDUBSHvxtFxaFWCOLgcCdRUGzVwYxJW4ogWKtDkq1JQ5ViEm6uf/oQjm4dXNx9AidHwUHxCXwDxamDQ4QMBYvf9J3fORzOAaNi152GUYbzWKt205Gu58vZF2aYAoBOmKV2q3UAECdxxBjf7wiA10277jTG+38yH6ZKAyNguxtlIYgK0L/SqQYxBMygn2oQD4CpTto1EE9AqZf7G1AKcv8ASsr1fBBfgNlzPR+MOcAMcl8BTB1da4Bakg7UWe9Uy6plWdLuJkEkjweZjs4zuR+HiUoT1dFRF8jvA2AxH2w3HblWtay99X/+PRHX82Vun0cIQCw9F1lBeKEuf1UYO5PrYsdwGQ7vYXpUZLs3cLcBC7dFtlqF8hY8Dn8AwMZP/fNTP8gAAAAJcEhZcwAADsQAAA7EAZUrDhsAAATpaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTAxLTI0VDE5OjEwOjEyKzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wMS0yNFQxOToxNToxMCswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wMS0yNFQxOToxNToxMCswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZTdjMmNkNWItNWQ3ZS1lYTRlLWEwOTQtYzdjYjFlNTZmMWMwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOmU3YzJjZDViLTVkN2UtZWE0ZS1hMDk0LWM3Y2IxZTU2ZjFjMCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmU3YzJjZDViLTVkN2UtZWE0ZS1hMDk0LWM3Y2IxZTU2ZjFjMCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZTdjMmNkNWItNWQ3ZS1lYTRlLWEwOTQtYzdjYjFlNTZmMWMwIiBzdEV2dDp3aGVuPSIyMDE4LTAxLTI0VDE5OjEwOjEyKzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtCdUmcAAC8qSURBVHicxbx3lF3Xdeb5O+fc9GJVIRRyIgACJMAkRjGTIKlsa2nUstpJY7s9M21bHndPe9kK7bHV3WM5TE+7Habb45mxNUtudUuyLLllWSRFMQeZAQSRSCKHQgEVUFUv3XtPmj/OrQfAkixaotR3rVpVwHv16p7vnr3P3t/3nSO89/y3vsrHn7jMHTtx2E+ew83N4TtdAER1a36khWg0UWvWIDet3ZLcecfh/4a3C4D4QQOnn3t+rX3pxZv18y/eZl/ee6OdOrvaGR8JIdZ775FSImIFXoYblB4KgxMS50qEUKdkJLRYPn422nnV8+raHc+qG657Or31tqM/yHF834Fzhw7H+ujRbeap5+/Nn336HvvqqzuEtlt9rJDNFtHIGL5ZR9XqUE8hqyFarUs+w3Y6yHyAy0vo93HdHm5hDjs/jzQg4+SouvyyvfFNtzyh7rzhK9GGTa9Hl28tvp/j+r4BVz73/Fr9/N/eVj71zK7y2Wd+VmiPzDLEug2odWuQG9YQrduA2LiGaMUa5PgYYnQpMkvAebwAEHjhEV4gtMGen8WeO4edPIM/MYE/fhx7cgJz4jjmxEnEoI9PM+Lrrv10esdtD0Y33/RIcsuNp74f43vTgRs899xa99DXfyh/8un7zWuvv9flOWrDRtLrr0bt3InatpXosi2oFeP4WCERODweicAA8u/9fO89SIHwILTFnptCHz8MB15Hv7yPcs8LmOOnkVGM2rrlr9I7b3swuffuL6VvveXEmznONxW4hU/+7s8Wjz72Tv36ofdSGpIdVxLfdw/xW64j3noZcuUqkGL4fi8uLADhZsALx7cHT+K9RQjxzS85j5s8gz50FPPiS5QPPUK5bz8kEcmWLX8V333nVxof/MB/jDZtcG/GWN8U4AZf/KubO3/yZ//MvPbaDj/o7Yw3byV9/3tJb78VtX7dN+WsS25ACP6+exBCYL1DsgjWNwO7OGsXL9/rYo+dIH/iKcrPfxF9+DCiViPeuvkvmj/7079T++H3PPu9jBfeBODO/4tf+Xjvy1/9R77TuZp2i+b730/2I+8jWr8GktolMywM2F30HYRQgMNai9YFWlucq17zYVZKKYnjmDhWKBVfBPTFIDogAlz4PS+g7GFPT9L77F/Q/8znEHOzMDq6t3nfri+N/t7vfux7Gfd3DVyxb1977iP/6x8XL+2+Gec2yu2XM/rrv0Zy8w0hlJyvQLswMOEBKfDWURrNoNen2+/R7/bQ1uDwKBHe772/JGwXQzqKIurNBo1anWa9QZwm1fsFUjq8Vwjhh+B6AThP+Y1vMP/rn8Qe2A9Snkp2Xvn8kt/6Nz+VXH3V3A8MuPwrD10788lPftIcPvY2X6vReO87GPnoryIbbbxYHPSFwQrhsVZgTEmv02euO0eZD9Da4y1oX+CMpyxLpufOk3cGCBUWDhkpaklC1sio12rEcYwSoGKJjBRZUmNkpEVrpE1EhFAyzDYcUkpwPqQDIfHdOeY++b8z+PwXcf0+6eYNj4x99Ff/Re0db3/p+w5c9zOfu3vu9//g4+Wxk7uitWtpf/h/pP6B94NQeGz1odWbncdaS1E65hem6HR6lEbTX+gz1+ly7tw5Tk2cZXpqntn5ATMzMyzMzZIkCWmcEGU1sjhloXOevD9gZKzNmtUrWbt+NZvWrWXpWJtaI6PVahFHKe2xBu3mCFkWIWVUAVbdj7egIoT1dD7/efq/90eUpyeJ1o4/veTDH/6N5o998MHvG3ALn/r02+b/4A8/bs5M3R5fexWtD3+Y7LYbIYoJoViFmQDnHIPBgG6/R2d+jl7fMDU1xdS5WQ6+doS9+w4y6PeJVBLyV5ohhODMxAnSrF6BlxGnCb3OAguDHlmckKYpSZSSZDHeW1aNL2Xnzu2sW7+S8aXLqDdTWo02zfYIWZYQSRXAEwq8DmWP1uTfeJHu7/178t17iFcseXb0w7/4idZP/OhX3igW6td//dff0Bs7/+mzu+b+3R/+hj577rbk9rcy+ku/SHLTdRAtJmuFExbvoSgK5ubmOH/+PPNz8xw6fILdL73Cs8/vYfdLBzg7dZ5ep4uxDicdSkVIqQAwxmC8I1IKKQRKRgy0xpsBUkQoKVGxAiSdTofTExMcOnSCybPT9PICISRRHKH1AOc8UskQslickODBS4laNY7YuhU3dY5i36try337N9Nonsyu3vmG+uA3BFz3r75y48zv/h//Kj87cUd2x220fvHnSa7ZiVfR8D1CgHeefr/P3Nwc3W6X06fO8shjT/PEE99g797DLHT6IARRFOGspdQaBQipEAKkVBijcaUBIZBKoaIIZzVFaap/KyIZ4/EURR5KZ6HoDwomTs8wNTXDxOkzZGlGmsZorRFCEMcJl1R/UhKPL0Nu3IA9c47iwIG15d69W9WK8X3p9m3fsdv4jsANXnhxxdmP/dof6eMn7s2uu472L/0C2dU7q/C8cDnnmJ+fr746vPLKazz97Eu8/PJBzp47B0IgsOG7CGAZU+CsRSARUoISeGfQpkRJj5RhJlprsEWOUIpIKlSs8N6R5zkgUFFEFElUFHP+/DwHDh7k7LkZBILR0TbOWbz3ZFmGEB4WIZQQL19GtHET5ugRioOvrc1f3ntldvXOB+O1axa+J+BO/eRPfaZ49fW3Rxs2MPqxXya79lp8FF1StDrnmJ2dpdfrMT09y2OPPcdTzz3P9PQcUkYURYGzGnxU3bNEKRUWDmtRCIQUKBRCCsoiRwiJlAopBc5YSquRwqGiBJTEa0tRDBBIojhGqQSlBAsL82hj6fYKJiYmKQvD8iVLkZFDa0OW1Yb3LbzAS0m0fAli3XrKl3ZTHj26Ln9lzxVjH/qJT3/XwE380w//dveJp+6XjUZ77OO/Qv2uO3BxBJ6qVgqlx/T0NIPBgDMTU3zhC1/lxd2vMOjpUMpJSZLVyAc9NCUShfAeIauuQBc4L6tZGP5uUQZiQ4kQms47inyAVAlRFKFEhDcF2hhUBLFKUFEMXtLtLqCUIooU3kvOnZ1lZmGe1StWEkUeUxpq9SZg8dXMcwiSVcuQy5YxePwJ9MTZ9uDgwXUjP/Tuv/kHAzf7p3/6zqk/+9QvUOjNrZ/8IK2f/hAQaisq5sI5w8zMLINen3NT03zqzz/L3n37sUaCMHhCHaWUQsQROrfgDSBCDotSnCnRxiBEyHNCCKwFZ2zg5qTEeIc1Dil8tZAItA4hHakUpWLiRNHtzmF0ThSnRFIRKQlRxKnjJzlw4ABXbNtGkilMqclqGaJ6UkIIkIp461bo9Mj/9oWmmZxcIkbaR+rXXvP6t8LnW3bTxYGDjfOf+szPu/neFbVrrmX0f/5nCKHwUuEI+SLktA55njMzN89nP/cwc3MlcVLHOI0uPVoPMK6gLEvSKCVLFcZ6jM2xJgdTEicZwhqsLbBW461DSYPzBu89wjqktjircVKBtxjvcCZHKAJTokBrizYGqVKUiJCRQkUpXpcM8h5Hj5/j//y//z+mzi0wKDXz8x2cc6FYdmE8wkPjlz5MfP11FPMLW2f/9M9/sb9n7+gbBm7m05/5n/pHDr1TLV3CyCf+JTTSkNO8R/gI56Db7dLv95manuUzn/0ypyZOA9But8myDIfGlJYy1xhTUhQFadIgjsAaUQGrAz0UhXznjAfnQMQ477HeYQVo78BLhC3xTiCMY+AcAjVs78oyp7QmzFIRmGTnLfP9BbRxRJFjZrrLpz/zBabPzYQas9vF2/CApIxwWOJEMfaJXyNZOU5x5PUHzv/5f/65NwTcwoNf27nw6KPvcKWm+aEfI75iG7iKM/Ma6w153qff7zM7O8dffvEhXn/tOGVZUpgC7wX1rEaW1fHCoW2JLkqcsVhXEMU1hLRoW+JMifOGSCVYaym9Rvvw5J1zGO/wtmrhsFgRyh/rNBiLCAkD5xxlMSBCoERoxYSHohjg8zKsxFGGEJZTZ2b4yoOPM3t+nn6/z6DIcXic0YDEeIi3bqH5oZ/Aa0f38cffPvc3X73mOwP31QffVxw5uiu+aieN97wLcIEDsx7vBcYYBoMB/X7Oww8/yct79mFMAMcUJWU+wDlHkmRkSQ0hBIUzlLqPNoEeiuIwg0trKLUlTpMw24zFGYvH4p1D2rByG13gnUA6ixegta7KGoFAoa0JYSolQslAiTpP3h9gK3ZFCYiijFgpXnv9KA8+/BgLnR69Xg+t9bDbWext6+98B/E1O8iPHbuj+9Aj7/t7gVt46JGdC08+tcuqhPY/ej9ixUq8D3yZI+SBPM8py5KDB49w4NVDeOcoyl5I8lqjraEsS6zVRElMmtaQLhS7prQYZ1EqRqk4dAmmDAtIJEK4VrnNORdmlvQY60FZPBIlJHneDyEqQjtVFIOwuMgIiaj+r4d1GinDDFSxJIoirLVMT0/z7HMv8vLu/RhjQrnk3HCc3nvU8iU03v8+vIqYf+yJt8//zSPXfHvgnn763vzEiTuzt1xN+pbrUHEIjUXGVWtLnudMnpnm+RdfQRtJe2SMkeYyrBdYU1IWgSKyeQBFSahljfD7ZoDWGmstkQwFtLWeQpfUkhRtDM654Ze1thqQRVtBRMiLxoZCQikVZos2iIoNkVJiSk2R5wgZEavQr4YHVbKwMEdZlvR7Od94fjenTp8lz/PhrJOuWmnjhPT6t5Befx35qZM39Z558r5vCVz+8v4l848/fr9wgtrddxGtWRVyy+LTt5ZB0ScvLLtf3s+hwyfJ8z44T5KlNEfHSNIaILFFTm4LdFmiS49Qkma9hfOewhQYXaBiCV5Sljm6zIlrGXhL6SzOh1JHSklpDd5C4j1prUGnO48UIoSlNZTFACccsVShMPaCbr+DkBIRKYSSqDjCGEO3u4DVhkgJlIiYPH2Wl185SFFo8jwPDwpb0VIQr1lFtmsXSMXM1x99Z3f37qXfBFxn/57r+i+/8m61fTvZ1TvxsRoCtziFTVlw6tQJXtn/Ov1uh0JbSlNQ5iUSR5Y2aLZGEHFSdQUGY/sURZhlzWY7hEZZhhIlUygpcdoQqwSnDdLZkPC9QooIVxYYp3ECrAejw8xKVERpHIXOkSqGSJEJwdz8uQrYiESEvtaYkl6vg9cGFUviKEXFEaUTHD1yilOnz1Qztyq1CDNdqJhsxw7ibdspDhy4t7tn703fBNz8Y0+8zShIrrmCeNNGpLzQwFMl2ryw7N1/mEOHDpGXGlP2KQpL6XPyPMfYAm+hntWo1WoIJyhyi9E9CmdwztBujOJ1SZH3UbIWFglnKUuDUQptHM4LvCtQkSCv2rVWe5Spc6dAaOI4xsiYTneWVCZIGVGLM87NziBFglSKJIohiil9Qb/XA2MhjYmiBJmkJFFMFEVMnJ7kyOGTlGVJbspQmlR50kmIL1tPet0OtPd0v/7oey4BLn/tUDr/5DP3y8Yo6ZU7USOjIbfYkF+sD2XFuenzHHz1EFY7nAnJPtc5pqtDXimKULNZRyIFjUaDJJU4DbroUeQ54IhrTbTWlLpPHMdYUzLIO2QqBePxzuC9xBiDd6E/1brAaUOSpKg0YeH8FCpKkXFEkiRMzU6Fdk5BIlWg6HVJ0S9wziDiiMTFxCoiVRJiRWlLZmZmePLp55iYmEQXJd664eqKE8h2m3TnVSTLlnH+mefuGRzc3xwCt7B371vyiYlro81ribZtrsRgQlUuFMYYrIbps9P0uprlK8ZpjYyS1jIyofCRQ1uD0QVFUWCLnH5ZoLUORW8twTsRVl1dEMcxUim63QWSJMF7T57nJGlE4XKsc4CjLEuMKalnDeampxBJRJbV6czNA440SYhUwvzcLN5biAVZVoco0Em9QR/nDFGchn42i1BK4ZxDd/v0Zmcpy5Izk+c4OTGFMWEci1fQPCDevAmxfj166tz2zu4QrgG4p56530tPvHod2fr1F4SOamHQWtPv93nt0DH63Q5WG+I4ptFoUW+PkFWMrVKhPNCmWhh0QV4OiKKEer0JQjDod9FlTpqmOB/AVErRG3TDjC1Lup15rLX0+13KsqTbO09hNLW0TrfXw+gifB6w0JnDOUOa1mhkDXCeIu8zGPSQwodVNUpQcShVSqPp9jt0+328FMRxjPCSE4dP0s0HlGU5HDsmlCjxunXEa9fikMw/9eQDEPQ0Oi+8cKuv1Uk2bkC02jgswl1Qm6x39Po5r732OoUOH+yQwwSphESmKc7FxM6hdRRKk7LEEwrWNM6o15t0u45+v0uj0SKOIrrdbhBztKHvuihkqKNihfACRWjohRDkeZ88z2m322hjyAcD4lhRb7QRQqB1caEMiSKiOCaKLtRvednD2qCLRFFEpAKgkVQcP3GGvNvDt1tYW4neQiKcQ7RaxJs2QqPG3PMv3joErvf6oSvk2AjRpg1hejrwlcC72HhPTU1xZmIK679ZCBdCBDGk0hwiqVBJgooSymIQEnypidKEWpbQq2ZTFKfofjd0GipCxoooiqp+UwzrR2MM1jqsLhFC0O/3ECKi0WgQJwm6zEM+rHrOOJIkaY0kStG2ZNDvUjpLTISQUQBNhr8VJSlKwFy3x+zMPCtXjmOtRSkFWJwPnUSyYT1ypM3g2InLAaLZJ5/aaPr9ZrZ+Hcma9ZVAzDBcnQNrLa+/ephO3ifxAl+pR776UMFFYHoZMoAMr6VpSpbWmV84z6DbIU4b1GtNur25YUgmSUwUxSRJHLi0WCJQKE94UGlKoQ1lrJClxhiPEA7jNP2FHjhPLBVprUWzVcc7RWk0ne754W1FSiEjgYwTYhkTq0CmSqXAC/rdDgcOHWXb9o04V0OpQBYsOg3idWtQrTblqYna7NceuzLqHzp01HuPaNSJVowPW4/FxSFU8bDQK1k+ugyHxZQa40KtY4zBORHCrShxSBAOIcLvShEhI8Ho2FIG/S6d+VmsqyNESNJxHBHHCWkWUUtq1Ft11q5dS7vdRGvL2ckpZmZmicqCpJAMhMT7HGMs/U5Bs1Wn1WqhUAxMn9nZsFBIFSOlJKp0CyUlcZKhRESsBELFlF5jugNs0ccKybFDh7H2Xly1qjvnhyJ6tHwFrtnE4dvdV1/dFw2OHsVKoF5HLh8LTW5lW3DWDReI2ZkF0qyGswahYlLAOxB4jLNYXWLqHms1rrDkRR9jLd4VUEqKPCdL64wsX8X5yQkKY4f5J80isrTB1ddeyV133UWzWUdKibcWBxw9epSvP/wEM+fPYwcOyBgMcqSEsiyZnJwAfKDPo4hIJihV6RAqHoamkgqPYaA9RWcu5E/vUCqE6/T5PsaUeJ/hbSi0q+yDGF+KatZxwpEfP0FUnDobmuPRUYRMcMKBc8P8EmaO4dz0FEVeYL1DeIdG4H2otK0N1T4GFGGGtbMxBI4i13S685iiZF7nxCqi0W5h5ueIIjUM5Vtvu5G7776bfr/PM888x9GjR9HaksUZK1av4J3vuo+vff0JJk6cwbsBxthKrDEVVZ4QS4FMY5IkIVG1kKdkCLWiLHG5xiyyKDLBC0jiUA1IKekszAFyqPw7fJATvUV4iViyFK8SislTRIPpSaxSRK0mUBV+VY5bDNm80HQ6Pbw1OATehQrbD3m6QDl5l4fvSHxRMbhSMjqyDOsN/V6Hft6rVlLCihZFbLpsA7fffivGlDzzzDNMTc5QS2uMtTMGZcGpU6c4efIk27Ztozu/QGk1Vgu0UsRxTJbVEUIgZfCQGO0o8wWMCTKjknIIThSnKAlSRRVTLCpyIEIqxaBfMDrSCHUhqlLFZCAAWg1EFDM4N0NkSo1XEl+rBSekDLYp70UQVYSj1xsEno0LvevFtZ73FrytKCiH94HlCKHq6NBDOk9Wq9FujjDv5/DWokQY0DXXXU2SJBw9epypySnSNGXp0jGuuHIbzjl279nP1MQkB/buY+Wa1czOLaBUjJSGPM9x2uGVBO+RkkpWlKgoKF+qYk2kCotPIDsFUobXF98vlArlVrVAXmzeAVBJDSccJh8QCeer1srjEOAcjkWjikdQ8XGmxEYRykuk8Ijogoto0REUfpcAsDNEtmqavcdZiy1yBtpgTAgvpUKoji9bjlKKs2fPEkXRsJvw3nPdddcSxzEPzU2Tdwacn5sjThR5HmaJUo4ojVAyRSqCaK3UBTBEcG/KKB6ukhIRdFwc3gqs11gdiIx+tz9cSV3VwQxb+noNJxXl7ByREwxbrDA9F3/2lXVKhLw0siT8YS8vOJKq2RZWXoNzoWCU1uGkJJLR8HWDxKPIpMaaImgN3pNEoQ1aFIwBnIDSGibPzdIb5Gzdto1HH38S4fp0O52L7tFWNZ4lSzRRUhtWBVJYEApB0CaUKxAEDlDIC2lmsZTy3mKdvMSg6Ia53g9LL0ewr0Ug0DhKXChiharsojEQKmihJLU0wziLtybQO86Bq4hHE5hdfKCShK1ISAvWmzDbrB6GurUgI49xjn6e0+/3gaVs2bqJiYkJ8rzElpZmLUMqgYwkwgkcMjwEHRYoiQ+tX6uJIqFfdALFbgwKgVM+5DEpsU6CsMjFwroC1UNVuiSoyNNsZOH9VfdwcagW3Xmk9aiRUSKZZuHp9wZYr8AtzjpdmVUkI+0mpdGB0NQl1gfmxDiLtR7vytB3Oo10HuvDgEQikKoRkqvLkSJBCc9cZ4Fudx7vA6O7f/9+1qxawdjoEu66+3amJ2eI0oTLNq4nThLOnD5Dv8ixugBb5U/nw5fRdBc6xElGuzlGlARKXpd9pI/w0iOER6kYhBqOKTSNYWEIZEYoZxrN9qW5+2KSPNeU1tJME6Jo6Si21JSdBaR3IC8Y8xbLkVhJ4ggW5vNQABsTQtBqnL+QfEfTFl5JhA+NvjeWwgyCwmU9pe7ivKHMC7wHrR1xbNn90l42bdrEtu1bWD42zvLly4mEQkYRnfkOTz79TBBVCkO/DEW3twbhHaMjyzG2JM/7zM1PgZQ0sjb15ghKCYwHKnpMEiMlRFJCpIJWLAQRoS9NUkWtllbheanXWAhBuTCPcI5k1Qqi+voNCOvQs4GLj5ILZhrnTCgi44Rms87M9HmcNzgfFKcka4TeUEmUEBTWYKvk71zg8KwxVR7SeO9JsyatVovuQg+tc7SBXk/xhc99kXvuu4vrrruGLMvQUtI5d5annvkGh187St7PKYyGUlOWOrRgxqLnp1k+vpp6vU6308cTiu+86KBURJJkJGmNOE5QkrBiqpioWjiUCDNOSli1chlJHFeKF1UpciHnl1PTuDyntmoVUbJ+LdZ7bL+Hn5nCr15dGQRdeCJVUly3ZiWHDx9FRQnNWo0kCYncWl2FRmjDFkFy9oIJut4eIYsTQNLvzVegFTjn0aVFygFCCb724Nf5xnMvsnLVON57ZmZmKLo5GhOIz8KQlwValxijqTdaSCGYmT1Lo9Zk6bIx+oPAGF/otR35oMeg7xGEPhjC6hvJOMiJUhJJxfLl28NK7C8IVNUUojg7i+11sUJSW7OWaPTKK9Z6wR7d7S7pT5yhvXLV0JIKEucgTiM2bdrAvoPHhz2otRVIuqT0Fm9KnAXnNHhPFMckSUYkFUU5YGFhAWNKnHPBAF2v0+v3MTqnLATeDXBJ+My5ublQdwHWe3CG0gReMPB8wX9ijaHWbKKUoigGnDt3jtGxpag4wTqNd1VyrwhJf1HoOQelzUEzDM0Vy8eGFNSlTlWBPjOB7vRxcG7kqh23RstuueW0zNKBnVugODGBv+66i37B4hykacrmLZtIkmeDGqTLC7NLG5wLCwdCEScZsYoCoVmU5KYXQtda0jQd5sP+YADekyRpYI2rldiokNtCvRW8Hdp7nDHY0mAJxuxWa4SyHJDnfeqNVqCwypzOwiwiTmjWmsFgLS+A5a27ZCYJb/EyiNpSwZatm4jjmLLMv2nvxeDUaXSng0jjYvlddx6OAFrbt79y/sD+Nb1jh1lqHUJd2C/gjEUksHRsjKVLRzh2bL4Skhc10PBkkzgbsqzaOkqThzDWDhUpsixDiijQPZ15pIxotdtoHbSKOI6DvqkUkdD4SFT7FcIqHXKopllvUZY51njqjTb9Xod8MKDeaJHGCYOij/eeQb+LTGLSqEYkw+oZ1bKLou+ieg3P+tWrGB9fhlICa/UlCwM4+keOoOdmaG3ZepDFV5e+9cbH7CBHnzhNuTB3wZFE+LLW0mrX2LJlLYXRlRZg8LokjlKazTZJVkMJWYGaQ6FxDpJGjVrWQinFoOxS5F2SJKFRb+F1ST7osmTJMqI4BSRZrUVpDc44ylLjq4dXy9pIQHpHe2QMbQrwnnqtjXWOTr+Dw9NqjZAkwZAtnacoehSmT6Fz8v5gaB9LkoQkq5FkNWppxs6rrqDdagWZ0F8gMLz3lHPzDE4cxw5ylt5y4+ND4JbdctujXkD39AnKw0ehEiwWC1ZtDfV6na2bN1FXCmNKYiFpjIxSb7YgFkg8A6sxtsRojZeCZr1BplKsK6qeUhDFNeqNMPB+UdJsjAXae9Cn1WqQJBFxkg01hazZCkCkCVlcI9clkQpqVlEMiJKYWq2G8jDod8n7A2ppnSRNUWlGEtXAKrwzlKagV3YD2dDtogd9pJS02222X3EZrUZ9yCQvWj+8hfzkCcqTp3B4lt96+6ND4Jo7Ln8lW7325eLYCRYOH6o21QamxHuPMSVCeNatWcPGrRtp1JpBua96SrRlYEqUthjrkSqmXq+HLOmCrOecI0piRlptdNlF65ysViNOg9XVoBgdGac7CJJh8PVGxCJQQNpp0noNGQXVrdVo4xxop8mSGmkWKv5S5/QGfZSKaUQJSRKR1hJUlBGrBGkV2kNhDb28x/TUGZYsbbFmVdigdwG4qsGXlv7Bo3RPnSJdteqlsat3vjAEbuzyK3rL77jj4XJhgc6+fdiZ2Qt8nAfvFUWhWb1mnLtvu4Vl4ytQQlKa0EkEFbwktwOklNSzBgiFI9xIYYOVq9Vq0c8HwbUkY+r1JkaHcmas1WZQLhD74CtZ9IZIKVESbL9Prd5EokJOrNVDIu8PMMKTprVhiGIs/V6H0lmiJIjQtTQjyVLSWkYapcRxjFcRaZpy9c7tjK9YRlFcKGMWv+vz83QO7qGcnmXFHbc+0t6+bTAEDmDNrru/7EVM5+VXWDh06BL3jnPBgSSlZMvll7Fh/Uq0NXirKY0eLhaZqtFstpGRqGj1EuuCotQaGaUsS5wt8N5TbzSweLQxgKMxtgTdNwiVkCRJRThGeBUhpKR0nlqaESdJeCiFJssyIpXQ7ywQC0jSGrISrIUQoX4bDCrHUkwcB8CSJCKOY5pxyhU7tnP1NTtQsQw+vmrci33q4PgJOrv34qVn+V13PbSI1xC4sZ1XvTR6/VV/3Tt0iN4r+7CDwSXL8aLFa+2aFVy143KyVA2dR8ZZ4iSj0WohJUOXka1kvVZrBFcOhrkjTRKUinFlgcfSaLaxRY6XHqUEcRL4MBVFKMK+CCXDPSgZzISlKUjijDgNIT3f7aCEJFMxSRQTRymJitA69LJ5v1ftd0hDN5FktEdHufWmt7D5svWUeYH1F4nR3uPynPMv72bh1f2MXHXVV5dfdc0L3wTc6FU75lbfd9+XvVRMf/1RBidPVeTkBcdSWYYncsMNV7Nty2bwFmtKkiRhZGQMpMKYqh4rNVI5GrU6Imi7YZmvar1Fnk54Sa3WoCgHlVlQoWSMkDLUfISeUsqIsiyJ45So2i5gvQvbk5IMpRTd3gKSkEuTrFockgShJKXu01mYDQ4rHGmasmPnNm648Rqcc5d65JwDJxicPs3sI1/DC8na+3Z9Zey6a6e/CTiAVbfd+nDzsk3PLuzdy9zzz2Pz8pJEuWjCW7p0jHt23crSZcuopxljY0uH3YS1GqtN4PPTxnCQuGBLjeN4+H/ee9IoDkqSUEjhkZUbQMrF3dA+iC1RRF70SZOwgxCCU1NGQR9VUQjPXn5RyRHFYe9XrIjiGh5JrzvHwtw8rVaNu+68ifHly0MBrs2FlVSAKfvMvfAS83v20dp82eMr7rrzqxdjdQlwq++997W19+76shcw8fm/ID87Gfy/Fz2JRRPeNVdfwbvetYslK9cMDcjG5DgTwjSJ1VALMM5iBSAcaZyEGsmFG41r9aCdeo2TcUjalcKECBLfIlusjQkgqQCWddU+1ThCJYpIhfyX5zmu1MH5mcQhpONKxImbZLWI22+9lh1XbqMoBsFpReD4nHMI6ykmJ5j4/OewWFbede9Da++77+C3BQ5gzTvf/vnRLVuf6L1+iMnPfyE4fapmH8BqQ6/XA+D+e+7intuvxxiPLnK8DflNRoo0qyNFcJN7FxaPJK0RRRFUNgcpqRRzh1Q1lHdEUVL5eBVC2kr3EMP2qdAlKs2CXUv4ineDmkyI04isMhPmJhh8Ii9QWTLMa0mWcu+uu3jHAw+glKA36IeFqKI1JWGsk1/8a7oHXmV009bH17/jbX/5d3H6JuDW3bfrwKq33/9FmWWc/NwXmH9pD97rIW3sCNb4Xq9Dva54xzvv5cabd+AFWK0R3obVL8pw3mI9YEEKG0Kskus8EikTJMEd6V0wCAZKHaQC5aKwWU1FCOIhM6scVa2X4JEhP8WKNK4j4mBdBegPunSLAQpVlSqKW2+9lh/9kffSbNdY6HbQRVntc6jaO2FZ2H+A05/7PCJNWX3/ri+ve9sDe78jcABX/Pcf+oPR7dsfNPOzHPitf43tDjDOIuyiiAH9fkmn22e0XednPvRj3HD91WjrEZGiVm/hhL8Qws4hVRosWM4PC+s4VsioslyoBOksKo6GVA8qdC+isiskUYouyuG/A6AGjMYWOVGiwqqZhbJDKYXOi8DMOM/tb72B/+FnfpyRkRG6Cx0GvX7ot/EX0ke3z8F//Qny2RlGLt/y0I6f/ie//60w+pZbkrKlS23UbJw88fgTd5cnT48OZmdYcdfd+EpjBA94yrxAKEV7pMk1O3cwPTvLwnyOUB5rLNZYjA4rca0eVkNjDbYyRy8OznmPKw1O2uBSlxJrgpQSSUVULQbBqelACJIkQ+ARKsI5T2kMaZwQJ2kQ1KVAEPanGqu55Yar+Jl/8qOMtJt0OgvMdea5SJcJoo1QvPbbn2T60adIx0aO3vDRj3xk7a57X33DwAEs3bnj+Nzrr6+c3Ltn5+DYsUy227Qv3wbSAWIoC+Z5sCK0R9pce80OEJITx09RlDnaWKwJIs3Y2BKc8Whvwl4G60iTFBXFOOOw3gbqKUvD3ldEZcmypHEaZMpAOYCDOImC93eotpcUZUGt3kRFMUJIhBSkjRo/9I5d/OSHPsDYaJuFhQXOnz9/CWgAzgrOfOmLHPt//wzv7fSW/+79n77pX378P35LcP4+4AA2vfvdXzv50EN3zh09snVw+Ai19eupr1mNUGq45RMgz4vATDSbbNm8gUajxuTZsyx0umijqdfrJEmGdRpbyXkIMdyI5qp60HlBktSGrknnHM470iwLOqjzeOdx3iBVRJpmQ+AQYZdhWZbUanXSOGHlqnHe90MP8O5376LZbDE/P8fc3FyYYdW2VeHBWcv5557l0L/79xSzM4xff8Nj7/nLL/zUtwXmOwEHMH7DDf918unnbp8/fGRD9+RR6us3koyvCHZ4v/jgHGXlLK/XG2zZsoE1a1bTz3NmpqZpNkeqXOdxNlDrSgrSNABnjMY6D96SJjVkFX7eO7z1qDQJrvSwPwnnLd7LygUaBXVUeIR3GKNpNevceNO1vPeHH+Ctt1yLlIq5ufN0Op0LfpBqfNoYOi/v5dAf/T6dw4dYtmPH47v++D/8SGPlysG3R+UNAFcfHy/al234xtRLL71l7uDra4vJSbJVK8nGl4OqErsQCKhqvJI4jlmzeiVXbr+MZUuXoSLF9MwsptBoo7HaEsUJSS0Lq5kLoQs+sMSqmlk2JO6IiDRLAY8VwSXlnUYqRZwlSOcRzpNkGVftvIK3PXA773n3A6xft4o8L5ibm6XfLwAb9tpWwHldMvfiSxz+4z/i/J49jG3a8rd3/uZv/cLqO24/+veC8kaAAxjdvHkqHhs7NHNw//bpl/etLc5MkKxYQX18HFftnQICLaMted7DOU+7PcqVV25l08Y1rFm1Eq+guzBPp9cnTWPqSTOAoS3GaLwMPa9KamHGOY93Fo2mVm8Gl4Cr9lzY8HOS1lgyMsLOq7dz3/238Y533cMtN92AlGK41V0XGu8Nixs/nABhDOdf2s2R/+tPmHt5D0suv/zJmz/68Y9uft8Pv6Hjg97wKRDLd+48Xm8vOTL92t4rzu/du6Z36DDJsuW0160LO42FAwtCCryXlGVBkfcw1rFkyRibN69j+5YtXL5tMytWjpPEGXlZMChznLM4D954kjQjUVE1EwMDY4xhpNUGEWHRWKCRpWzcvIF77riFt7/jbu6842auv+Zqmo06c3OzzM8v0M8HWONwF+/DB6Q1nH3iKV7/oz9kft8+RjZveu7mj3zkY9v/8QcffUNg8F0c2PLqZz97x9P/22/+5sy+fbdlK1ew7h9/kI0/+mNDUcThL5yJVCnlSZLQrDeot5vU0oxet6Db7zA/3+X4sZMcOnqMo0dOMDk5SWEhEqGhL8tqj5UzbNyylTUrljK+dDnr161m7boVLFk2xki7Tb2eoQvDfGeWXm9Qnc9kLjqm6MJ5Tt7Cic/8J47/+X9hMHmSpVdc8fRbP/Zrv7L9A+9/8h+Cw3d1RNCJRx65/Osf+dh/OPfSi/fINGX5bbdyxS//Muny5eFDK/9J+PmC/yKYmhu023WazTZRJLHWB0ZFm8paYTDO0+v0sc7RbDSqPlSENktKokQN9Y1er8f8fIeiGAxlvUU+7dJLUs7OcuB3PsnUE09hBwNWXHPNo3f95r/5+Q33P7D/H4rBd30o1dyRI/Kr//Tn/svxxx59uze2UVu9miv/+T9n/O67Q7+E+7ZHnIU+VZIlKfVmgyzLyLKMJKn62Mo2dqmUB4UuQ3j3wkbj4Mi88Lr/u1gt/j3rmH76Kfb9zu/QP3UCGSVz6++86+G3/eEf/vjY1i3f1ZGQ3/MxaF//lV/91b1/9qmfy2dn1vksZfW997LhRz5AfeMmVK32d568RHg3HOAisEM/Gp4kihHVoS6BxwvarjFl9Rkh7BbvO9BPl1oVFi+X53SPHefEZ/8zZx58GJ/n1JYuO7rjx3/sj+/93d/55Pcy7jfl4L0jf/2Va57+t//2N87t2XPDYGZ6TX3VWta85+2M33Y7jXXriFsjwZ/Bos0/uIC+dUhdepCeJBy8J4bt3oXjHnF+eGLXBY+fx87P0zt5knNPP8Ppr3yZwelJ0nb75Pg1O1+45X/55U9sedc7X/pex/ymHvX49G//9k+99qX/+sGpfXse0J0+9fVrGL/9TpZcfz3NTRtprFoJUTzcS3FxOAsRzpUT0g8hg8XjIF1lclw0w4jKRq/wvhKPy5KFyUkGR48y8/Juzj3+BP1jx4gbLZbuuOKrl7/7hz93+0d/5U/erLG+6YeLTr740rLXv/zlDxz+2tfedfaFF99Z9jskS5ay9KqraO+4kuaGTTQ3bSBbtYooayDEBQ9aAEkiq64UqsMKiFDC4ryC6gBSj8TlHXoTk/SOHqdz7Ahz+/axsP8gg6mzpLUWK294y5cuu/vuh7e8692fXXXTDZNv5ji/b8fZnn3h+RXHn3n2rqMPP/ru408++hODmRlEHJMuX0ZrzToaq1ZTW7+GbMVqsvHlZOPLSVst4lYdH6fDZO+9R5mSoleg5+bIp2cppibpn5mgd+o0+cQZupOnySem8LYgaY+y8d57/5/L7r77q+veevPjq2686U0FbPH6vh+gfP7w4fj80WNbTj779D1HHvrau87t2XP9YH5+BVIQ1xpEzRqqVidptpFJjMzSoUPcex/OZHICrwt0McD2+uheF90dYHpdvPfUmq1zq6+/9tkNu+7/yrqbb3p8bPPm18Y2bzbf+e6+++sHfmT3xPMvrDjzwou3nnzumTvO7dl907l9r16l80HN42N/0bKw2Ma56gSkamcQ1jPIssZgfMfle8evvvZv19x049Orr7/x6TU3vrmh+J2uHzhw3+qa3L17yeyRIzO90xMsnDuLMxY96AMQ1+rISNFasYLm6tWMrFu/6gcN0re6/n8Sei1yK5RGfgAAAABJRU5ErkJggg==";

        var loader = {
            low_poly : new Loader( state ),
            main : new Loader( state ),
            spinner : new CanvasSpinner(null, 16, spinner_img)
        };

        loader.spinner.init();

        var engines_starting_span = document.createElement('span');
        engines_starting_span.setAttribute('id', 'engines_starting')
        engines_starting_span.innerHTML = "Engines Starting...";
        engines_starting_span.style.display = "none";
        engines_starting_span.style.color = "#9F261E";
        engines_starting_span.style.fontFamily  = "Lato, sans-serif";
        engines_starting_span.style.fontSize  = "22px";
        engines_starting_span.style.fontWeight  = "400";

        document.body.appendChild(engines_starting_span);
        
        var fallback = document.createElement('a');
        fallback.setAttribute('id', 'fallback_link');
        fallback.setAttribute('href', 'fleet_secondary');
        fallback.innerHTML = "If you're having trouble launching the app or it's taking too long to load,<br>you can visit the fallback page by clicking here.";
        fallback.style.display = "none";
        fallback.style.color = "#9F261E";
        fallback.style.fontFamily  = "Lato, sans-serif";
        fallback.style.fontSize  = "16px";
        fallback.style.fontWeight  = "400";
        fallback.style.textAlign = "center";

        document.body.appendChild(fallback);

        loader.spinner.afterRender.main = function( canvas_spinner, canvas, ctx ) {

            engines_starting_span.style.display = "";
            engines_starting_span.style.position = "absolute";
            
            fallback.style.display = "";
            fallback.style.position = "absolute";

            var canvas_rect = canvas.getBoundingClientRect();
            canvas.setAttribute("id", "engines_starting_img");
            var span_rect = engines_starting_span.getBoundingClientRect();
            var fallback_rect = fallback.getBoundingClientRect();
			

            engines_starting_span.style.top = Math.round(canvas_rect.top + canvas_rect.height) + "px";
            engines_starting_span.style.left = Math.round(canvas_rect.left + canvas_rect.width / 2 - span_rect.width / 2) + "px";
            
             
            fallback.style.top = "65px";
            fallback.style.left = Math.round(canvas_rect.left + canvas_rect.width / 2 - fallback_rect.width / 2) + "px";
        };
        
        


        // Also for the hotpoints, we want to display the name on hover so that users will know what they're clicking on

        var hot_point_name = document.createElement('span');
        hot_point_name.innerHTML = "";
        hot_point_name.style.position = "absolute";
        hot_point_name.style.display = "none";
        hot_point_name.style.color = "#000";
        hot_point_name.style.fontFamily  = "Lato, sans-serif";
        hot_point_name.style.fontSize  = "20px";
        hot_point_name.style.fontWeight  = "400";
        hot_point_name.style.backgroundColor = "rgba(255,255,255,.75)";
        hot_point_name.style.padding = "6px 16px";
        
        hot_point_name.hotpoint = null;

        document.body.appendChild(hot_point_name);

        function setHotPointNamePosition( hotpoint ) {

            if (!hotpoint) {
                return;
            }

            let drawer = state.drawer;
            let camera = drawer.getCamera();
            let ipm = state.inputmanager;
            let canvas = drawer.getRenderer().domElement;

            let data = hotpoint.data;
            
            let entity = hotpoint.entities.red_dot;

            let position = new THREE.Vector3().setFromMatrixPosition(entity.matrixWorld);

            let scr_point = toScreenPosition(position, camera, canvas);

            hot_point_name.innerHTML = data.name;

            let span_rect = hot_point_name.getBoundingClientRect();

            //console.log(scr_point[1]);
            //console.log(scr_point[0]);

            hot_point_name.style.top = Math.round( Math.round(scr_point[1]) - span_rect.height - 31) + "px";
            hot_point_name.style.left = Math.round( Math.round(scr_point[0]) - span_rect.width / 2) + "px";            
            
        }

        document.addEventListener("app-hotpoint-hover", function(e){

            if ($('#main-column-container').hasClass('out'))
                return;

            hot_point_name.hotpoint = e.hotpoint;
            hot_point_name.style.display = "";

            setHotPointNamePosition( e.hotpoint );
        });

        document.addEventListener("app-hotpoint-out", function(e){

            let drawer = state.drawer;
            let camera = drawer.getCamera();
            let ipm = state.inputmanager;
            let canvas = drawer.getRenderer().domElement;

            let hotpoint = e.hotpoint;

            let entity = hotpoint.entities.red_dot_transparent;

            hot_point_name.style.display = "none";
            hot_point_name.hotpoint = null;
        });

        document.addEventListener( "app-hotpoint-selected", function(e){

            hot_point_name.style.display = "none";
            hot_point_name.hotpoint = null;
        });

        drawer.afterRender.hotpoint_name_set_position = function(in_drawer, in_delta){

            setHotPointNamePosition( hot_point_name.hotpoint );
        };

        state.loader = loader.main;

        // loader ------

        $.when(

            $.getJSON( path + "data.json"),
            onCubeTextureLoadDeffered

        ).then( function (data) {

            container.appendChild( drawer.getRenderer().domElement );

            state.data = data[0];

            var ui = state.ui = new UI( state );

            var trackers = state.trackers = new Trackers( state );

            var inputmanager = state.inputmanager = new InputManager ( state );

            inputmanager.init();
            drawer.enterAnimationLoop();

            var app_init_event = document.createEvent('Event');
            app_init_event.initEvent("app-inited", true, true);
            document.dispatchEvent(app_init_event);

            loader.main.onProgress.main = function( e ){
                if (loader.spinner && e.type === "sea3d_load") {
                    loader.spinner.updateText(e.loaded);
                }
            };

            loader.main.onDownloadProgress.main = function( e ){
                var t = "" + Math.floor(e.loaded / e.total * 100.0);
                if (loader.spinner) {
                    loader.spinner.updateText(t);
                }
            };

            loader.main.onComplete.main = function( e, obj ) {

                if (loader.low_poly.getObject()){
                    loader.low_poly.getObject().visible = false;
                }

                loader.spinner.deallocate();
                delete loader.spinner.afterRender.main;
                engines_starting_span.style.display = "none";
                fallback.style.display = "none";
                delete loader.spinner;

                obj.name = "plane-object-container";

                obj.traverse( function(child) {
                    child.name = "plane-object";
                });

                var scene = drawer.getScene();

                scene.add( obj );

                var floatXStrength = 30.0;
                var floatYStrength = 20.0;
                var original_position = {
                    x : obj.position.x,
                    y : obj.position.y,
                    z : obj.position.z
                };

                obj.dataset =  { rotation: 300.0 };

                obj.tween = new TWEEN.Tween( obj.dataset )
                    .to( { rotation: 270.0 }, 8000 )
                    .repeat( Infinity )
                    .delay( 0 )
                    .yoyo( true )
                    .easing( TWEEN.Easing.Elastic.InOut)
                    .onUpdate( function(object) {

                        rotateAroundWorldAxis(obj, new THREE.Vector3(0,0,1), Math.PI / object.rotation, false );
                    })
                    .start();

                drawer.onBeforeRender.shakePlane = function(in_drawer, clock_delta){

                    var sin_calc_x = Math.sin( ( Date.now() * 0.001 ) * 0.4 );
                    var sin_calc_y = Math.sin( ( Date.now() * 0.001 ) * 0.7 );

                    obj.position.set(
                        original_position.x + sin_calc_x * floatXStrength,
                        original_position.y + sin_calc_y * floatYStrength,
                        obj.position.z);
                };

                ui.init();
                trackers.init();
            };

            loader.low_poly.onProgress.main = function( e ){
                if (loader.spinner && e.type === "sea3d_load") {
                    loader.spinner.updateText(e.loaded);
                }
            };

            loader.low_poly.onDownloadProgress.main = function( e ){
                var t = "" + Math.floor(e.loaded / e.total * 100.0);
                if (loader.spinner) {
                    loader.spinner.updateText(t);
                }
            };

            loader.low_poly.onComplete.main = function( e, obj ) {
                loader.main.load( path + 'model.sea' );
            };

            //loader.low_poly.load( path + 'model_low_poly.sea' );

            loader.main.load( path + 'model.sea' );

        }).fail(function (e) {

            console.error("Could not upload config file ...");
        });
    };

    var size = {
        width : 1,
        height : 1,
    };

    var state = {
        data : null,
        drawer : null,
        trackers : null,
        ui : null,
        loader : null,
        commands : null,
        inputmanager : null
    };
};
//
//
//

var Trackers = function ( state ){

    "use strict";

    var self = this;

    var drawer = state.drawer;
    var loader = state.loader;

    self.init = function() {

        // 
    };
};
//
//
//


var UI = function ( state ){

    "use strict";

    var self = this;

    self.init = function() {

        var lastCameraVales = { };

        var cameraTweenSpeed = 2500;
        var cameraEasingType = TWEEN.Easing.Linear.None;

        function setCameraValues(){

            var drawer = state.drawer;
            var camera = drawer.getCamera();

            var vector = new THREE.Vector3();
            camera.getWorldDirection( vector );

            lastCameraVales = {
                position : new THREE.Vector3().copy( camera.position ),
                direction : vector
            };
        }

        function setCamera( position, direction ){

            setCameraValues();

            var drawer = state.drawer;
            var camera = drawer.getCamera();
            var ipm = state.inputmanager;

            var current_dir_vector = new THREE.Vector3();
            camera.getWorldDirection( current_dir_vector );

            ipm.getFreezeOrbit(true);

            direction = new THREE.Vector3(direction.x, direction.y, direction.z);

            camera.tween = new TWEEN.Tween( camera.position )
            .to( {
                x: position.x,
                y: position.y,
                z: position.z }, cameraTweenSpeed )
            .easing( cameraEasingType )
            .onUpdate (function(){
            })
            .onComplete(function(){
                camera.tween = null;
            })
            .start();

            camera.tween_direction = new TWEEN.Tween( current_dir_vector )
            .to( {
                x: direction.x,
                y: direction.y,
                z: direction.z }, cameraTweenSpeed )
            .easing( cameraEasingType )
            .onUpdate (function(){
                camera.lookAt(current_dir_vector);
            })
            .onComplete(function(){
                camera.lookAt(direction);
                camera.tween_direction = null;
            })
            .start();
        }

        function restoreCamera(){

            var drawer = state.drawer;
            var camera = drawer.getCamera();
            var ipm = state.inputmanager;

            var current_dir_vector = new THREE.Vector3();
            camera.getWorldDirection( current_dir_vector );

            var direction = new THREE.Vector3(lastCameraVales.direction.x, lastCameraVales.direction.y, lastCameraVales.direction.z);

            camera.tween = new TWEEN.Tween( camera.position )
            .to( {
                x: lastCameraVales.position.x,
                y: lastCameraVales.position.y,
                z: lastCameraVales.position.z }, cameraTweenSpeed )
            .easing( cameraEasingType )
            .onUpdate (function(){
                camera.lookAt(direction);
            })
            .onComplete(function(){
                camera.lookAt(direction);
                camera.tween = null;
                ipm.getFreezeOrbit(false);
                setCameraValues();
            })
            .start();

            camera.tween_direction = new TWEEN.Tween( current_dir_vector )
            .to( {
                x: direction.x,
                y: direction.y,
                z: direction.z }, cameraTweenSpeed )
            .easing( cameraEasingType )
            .onUpdate (function(){
                camera.lookAt(current_dir_vector);
            })
            .onComplete(function(){
                camera.lookAt(direction);
                camera.tween_direction = null;
            })
            .start();
        }

        function closeActiveHotpoint(){

            let drawer = state.drawer;
            let camera = drawer.getCamera();
            let ipm = state.inputmanager;

            if (camera.tween)
                return;

            if($(settings.objSlidePanel).hasClass('out')) {
                slidePanelOut();
                settings.currentHotpoint.makeVisible(false);
                settings.currentHotpoint = null;

                // set camera back
                restoreCamera();

                let e_select_event = document.createEvent('Event');
                e_select_event.initEvent("app-hotpoint-deselected", true, true);
                document.dispatchEvent(e_select_event);
            }
        }

        document.addEventListener("app-hotpoint-clicked", function(e){

            var drawer = state.drawer;
            var camera = drawer.getCamera();
            var ipm = state.inputmanager;

            if (camera.tween)
                return;

            var hotpoint = e.hotpoint;
            var data = hotpoint.data;

            var el = document.getElementById('hotpoint-container-data');

            if (data.link){
                $.get( data.link, function( data ) {
                    el.innerHTML = data;
                });
            }
            else {
                el.innerHTML = data.text;
            }

            var position, e_select_event;

            if (!settings.currentHotpoint || settings.currentHotpoint === hotpoint){

                if(!$(settings.objSlidePanel).hasClass('out')) {

                    slidePanelIn();

                    if (settings.currentHotpoint)
                        settings.currentHotpoint.makeVisible(false);

                    settings.currentHotpoint = hotpoint;

                    settings.currentHotpoint.makeVisible(true);

                    var x = camera.position.x < -1500 ? camera.position.x : -1500;				
					
                    position = {
                        x : -1500,
                        y : settings.currentHotpoint.data.position.y,
                        z : settings.currentHotpoint.data.position.z,
                    };

                    setCamera( position, settings.currentHotpoint.data.position );

                    e_select_event = document.createEvent('Event');
                    e_select_event.initEvent("app-hotpoint-selected", true, true);
                    e_select_event.hotpoint = hotpoint;
                    document.dispatchEvent(e_select_event);
                } 
                else if($(settings.objSlidePanel).hasClass('out')) {

                    slidePanelOut();

                    if (settings.currentHotpoint)
                        settings.currentHotpoint.makeVisible(false);
                    settings.currentHotpoint = null;

                    // set camera back
                    restoreCamera();

                    e_select_event = document.createEvent('Event');
                    e_select_event.initEvent("app-hotpoint-deselected", true, true);
                    document.dispatchEvent(e_select_event);
                } 
            }
        });

        document.addEventListener("app-close-active-hotpoint", function(e){

            closeActiveHotpoint();
        });

        document.addEventListener("app-global-area-clicked", function(e){

            closeActiveHotpoint();
        });

        document.addEventListener("app-hotpoint-hover", function(e){

            var drawer = state.drawer;
            var camera = drawer.getCamera();
            var ipm = state.inputmanager;

            var hotpoint = e.hotpoint;

            var entity = hotpoint.entities.red_dot_transparent;

            if (!entity.tween) {

                var scale_x = entity.scale.x;
                var scale_y = entity.scale.y;
                var scale_z = entity.scale.z;

                var coef = 2;

                entity.tween = new TWEEN.Tween( entity.scale ).to( {
                    x: scale_x * coef,
                    y: scale_y * coef,
                    z: scale_z * coef }, 500 ).easing( 
                    TWEEN.Easing.Elastic.InOut).onComplete(
                    function(){
                        new TWEEN.Tween( entity.scale ).to( {
                        x: scale_x,
                        y: scale_y,
                        z: scale_z  }, 500 ).easing(TWEEN.Easing.Elastic.InOut).onComplete(
                        function(){
                            entity.tween = false;
                        }).start();
                    }
                    ).start();
            }
        });
    };

    var settings = {
            objSlidePanel: '#main-column-container', // slide div class or id
            currentHotpoint : null
    };

    function slidePanelIn() {
        var hotpoint_container = document.getElementById("hotpoint-container");
        var canvas_container = document.getElementById("webgl-container-data");

        $(settings.objSlidePanel).animate({
            'left' : '-' + hotpoint_container.style.width
        });
        $(settings.objSlidePanel).addClass('out');
        $(canvas_container).animate({
	        'left' : '25%'
        });
        $('#left-group').hide();
        $('#center-group').hide();
        $('#right-group').hide();

    }
    function slidePanelOut() { 
	    var canvas_container = document.getElementById("webgl-container-data");
        $(settings.objSlidePanel).animate({
            'left' : '0px'
        });
        $(settings.objSlidePanel).removeClass('out');
        $(canvas_container).animate({
	        'left' : '0'
        });
        $('#left-group').show();
        $('#center-group').show();
        $('#right-group').show();
    }
    
    
};

			
