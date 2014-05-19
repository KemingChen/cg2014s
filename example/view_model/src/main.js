var MythreeManager = function()
{
	var render;
	var camera;
	var scene;
	var light;
	var model;
	var width;
	var height;
	var controls;
	var manager;
	var fileInput;
	var loader;
	var zoom = 1;
	var leapMotionController;

	return{
		threeStart: threeStart,
		changeModel: changeModel,
		cleanScene: cleanScene,
		printMessage: printMessage
	};

	function initManager(){
		manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					console.log( item, loaded, total );
				};
	}

	function initLeapMotion(){
		leapMotionController = new Leap.Controller({ enableGestures: true });
		leapMotionController.on( 'connect' , function(){
	      console.log( 'Successfully connected.' );
	    });
	    leapMotionController.on( 'deviceConnected' , function() {
      		console.log( 'A Leap device has been connected.' );
    	});

    	leapMotionController.on( 'deviceDisconnected' , function() {
      		console.log( 'A Leap device has been disconnected.' );
    	});

    	leapMotionController.on( 'ready' , function(){

      	// Ready code will go here

    	});

    	leapMotionController.on( 'frame' , function(data){

			var	frame = data;

			for( var i = 0; i < frame.gestures.length; i++ ){

		    	var gesture = frame.gestures[i];
		    	var type = gesture.type;
		    	switch( type ){
			          case "circle":
			            onCircle( gesture );
			            break;
			          case "swipe":
			            onSwipe( gesture );
			            break;
			          case "screenTap":
			            onScreenTap( gesture );
			            break;
			          case "keyTap":
			            onKeyTap( gesture );
			            break;
   
        		}
			}
    	});

    	function onCircle( gesture ){
    		var clockwise = false;
		    if( gesture.normal[2]  <= 0 ){
		      clockwise = true;
		    }
		    var inc;
		    if(clockwise){
		    	inc = -1.2;
		    }else{
		    	inc = 1.2;
		    }
		    var container = document.getElementById('canvas3d');

			var evt = document.createEvent("MouseEvents");
			evt.initMouseEvent(
			  'DOMMouseScroll', // in DOMString typeArg,
			   true,  // in boolean canBubbleArg,
			   true,  // in boolean cancelableArg,
			   window,// in views::AbstractView viewArg,
			   inc,   // in long detailArg,
			   0,     // in long screenXArg,
			   0,     // in long screenYArg,
			   0,     // in long clientXArg,
			   0,     // in long clientYArg,
			   0,     // in boolean ctrlKeyArg,
			   0,     // in boolean altKeyArg,
			   0,     // in boolean shiftKeyArg,
			   0,     // in boolean metaKeyArg,
			   0,     // in unsigned short buttonArg,
			   null  
			);
			container.dispatchEvent(evt);
    	}

    	function onSwipe( gesture ){
    		var star = new THREE.Vector3();
    		var end = new THREE.Vector3();
    		star.x = gesture.position[1] - gesture.startPosition[1];
    		star.y = gesture.position[0] - gesture.startPosition[0];
			star.z = 0;
			end.copy(star);
			var axis = new THREE.Vector3( 0, 0, 1);
			var angle = Math.PI / 2;
			var matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
			star.applyMatrix4( matrix );
			var matrix = new THREE.Matrix4().makeRotationAxis( star, angle );
			end.applyMatrix4(matrix);
    		rotate(star,end,0.05);
    	}

    	function onScreenTap( gesture ){}
    	function onKeyTap( gesture ){}
    	leapMotionController.connect();
	}

	function initLoader(){
		loader = new Loader(MythreeManager);
	}

	function initFileInput(){
		fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.addEventListener( 'change', onFileInputChange);
	}

	function initThree() {
	    width = document.getElementById('canvas3d').clientWidth;
	    height = document.getElementById('canvas3d').clientHeight;
	    renderer = new THREE.WebGLRenderer({antialias:true});
	    
	    renderer.setSize(width, height );
	    document.getElementById('canvas3d').appendChild(renderer.domElement);
	    renderer.setClearColor(0xFFFFFF, 1.0);
	 }

	function initView(){

		var btn=document.createElement("BUTTON");
		var t=document.createTextNode("Load");
		btn.appendChild(t);
		btn.addEventListener("click",onImportOptionClick,false);
		document.getElementById('ui').appendChild(btn);

		var btn=document.createElement("BUTTON");
		var t=document.createTextNode("Clean");
		btn.appendChild(t);
		btn.addEventListener("click",function(){cleanScene();render();printMessage(" Clean!!");},false);
		document.getElementById('ui').appendChild(btn);
		printMessage("  HI!! This is a model loader for dae, stl, obj formats and whose zip!!");
	}

	function printMessage(message){
		var messageDiv=document.getElementById("messageDiv");
		if(!messageDiv){
			messageDiv=document.createElement("div");
			messageDiv.id = "messageDiv";
			document.getElementById('ui').appendChild(messageDiv);
		}
		messageDiv.innerHTML = message;
	}

	function initCamera() { 
		camera = new THREE.PerspectiveCamera( 60, width / height , 1 , 1000 );
		
		camera.position.x = 0;
		camera.position.y = 50;
		camera.position.z = 500;
		camera.up.x = 0;
		camera.up.y = 1;
		camera.up.z = 0;
		camera.lookAt( {x:0, y:0, z:0 } );
	}

	function initScene() {   
		scene = new THREE.Scene();
	}

	function initLight() { 
		light = new THREE.DirectionalLight(0xffeedd);
		light.position.set( 200, 200, 200 );
		scene.add(light);
	}


	function initObject(){  
		model = new THREE.Mesh(
		     new THREE.SphereGeometry(20,20),
		     new THREE.MeshLambertMaterial({color: 0xff0000})
		);
		scene.add(model);
		model.position.set(0,0,0);
	}

	function initSTL(){
		var loader = new THREE.STLLoader();
		loader.addEventListener( 'load', function ( event ) {

			var geometry = event.content;
			var material = new THREE.MeshPhongMaterial( { ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 } );
			var mesh = new THREE.Mesh( geometry, material );

			mesh.position.set( 0, 0, 0);
			//mesh.rotation.set( 0, - Math.PI / 2, 0 );
			//mesh.scale.set( 10, 10, 10 );

			mesh.castShadow = true;
			mesh.receiveShadow = true;

			scene.add( mesh );

		} );
		loader.load( '../../models/stl/slotted_disk.stl' );
	}

	function initOBJ(){
		var loader = new THREE.OBJLoader( manager );
				loader.load( '../../obj/male02/male02.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {

						}

					} );

					object.position.set( 0, 0, 0);
					scene.add( object );

				} );
	}

	function initOBJMTL(){
		var loader = new THREE.OBJMTLLoader();
		loader.load( '../../obj/male02/male02.obj', '../../obj/male02/male02_dds.mtl', function ( object ) {
			object.position.set( 0, 0, 0);
			scene.add( object );
		} );
	}

	function initDAE(){
		var loader = new THREE.ColladaLoader();
			loader.options.convertUpAxis = true;
			loader.load( '../../models/collada/monster/monster.dae', function ( collada ) {

				dae = collada.scene;
				skin = collada.skins[ 0 ];

				dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
				dae.updateMatrix();
				scene.add( dae );
			} );
	}

	function initControls(){
		var container = document.getElementById('canvas3d');
		controls = new THREE.TrackballControls(camera,container);

		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;

		controls.noZoom = false;
		controls.noPan = false;

		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;

		controls.keys = [ 65, 83, 68 ];

		controls.addEventListener( 'change', render );

	}

	function changeModel(obj){
		scene.add(obj);
		render();
	}

	function render(){
		//animationLoop
		//requestAnimationFrame(render);
		
		//the rotation Show
		//model.rotation.x += 0.01;
		//model.rotation.y += 0.01;

		//renderer.clear(); 

		renderer.render(scene, camera);
	}

	function onWindowResize() {

				camera.aspect = width / height;//window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( width, height);
				//renderer.setSize( window.innerWidth, window.innerHeight );
				controls.handleResize();
				render();
	}

	function cleanScene(){
		initScene();
		initLight();
	}

	function onImportOptionClick () {

		fileInput.click();

	}

	function onFileInputChange ( event ) {
		loader.loadFile( fileInput.files[ 0 ] );
	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		/*var star = new THREE.Vector3();
		var end = new THREE.Vector3();
		star.x = 1;
		star.y = 1;
		star.z = 0;
		end.copy(star);
		var axis = new THREE.Vector3( 0, 0, 1);
		var angle = Math.PI / 2;
		var matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
		star.applyMatrix4( matrix );
		var matrix = new THREE.Matrix4().makeRotationAxis( star, angle );
		end.applyMatrix4(matrix);

    	rotate(star,end,1);*/
		/*var a = new THREE.Vector3(1,0,0);
		var b = new THREE.Vector3(0,0,1);
    	rotate(a,b,0.01);*/
	}

	function rotate(start,end,speed) {
		var axis = new THREE.Vector3();
	    var vector = controls.target.clone();
	    var angle = Math.acos( start.dot( end ) / start.length() / end.length() );
	    if(angle){
	    	var quaternion = new THREE.Quaternion();
	    	axis.crossVectors( start, end ).normalize();
			angle *= speed;
			quaternion.setFromAxisAngle(axis, -angle );
			camera.up.applyQuaternion( quaternion );

			end.applyQuaternion( quaternion );

		    camera.position.applyQuaternion(quaternion);
		    camera.lookAt(vector);
		    renderer.render(scene, camera);
	    }
	    
	}


	function threeStart() {
		//window.addEventListener( 'resize', onWindowResize, false );
		initFileInput();
		initLoader();
		initView();
		initThree();
		initCamera();
		initControls();
		initLeapMotion();
		initScene();   
		initLight();

		// load model exmaple code
		//initObject();
		//initSTL();
		//initOBJ();
		//initOBJMTL();
		//initDAE();

		animate();
	}
}();

var Loader = function(threeManager){
	return {
		loadFile: loadFile,
		loadUnZipFile: loadUnZipFile
	};

	function loadFile(file){
		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();
		threeManager.cleanScene();
		var loadMessage = ""
		if(extension ==='zip'){
			loadFormat = "zip: ";
			var zipModel = new ZipModel();
			zipModel.getEntries(file,function(entries){
				entries.forEach(function(entry) {
					writer = new zip.BlobWriter();
					var writer, zipFileEntry;
					entry.getData(writer, function(blob) {
							loadMessage += entry.filename;
							loadMessage += "<br>";
							threeManager.printMessage(loadMessage);
							loadUnZipFile(entry.filename,blob);	
					}, function(message){});
				});
			});
		}else{
			loadMessage += file.name;
			loadUnZipFile(file.name,file);
			threeManager.printMessage(loadMessage);
		}
	}

	function loadUnZipFile(name,data)
	{
		var extension = name.split( '.' ).pop().toLowerCase();
		switch ( extension ) {
			case 'stl':
				loadSTL(data);
			break;
			case 'obj':
				loadOBJ(data);
			break;
			case 'dae':
				loadDAE(data);
			break;
			default:
				alert( 'Unsupported file format.' );
			break;
		}
	}

	function loadSTL(file)
	{
		
		var reader = new FileReader();
		reader.addEventListener( 'load', function ( event ) {

			var contents = event.target.result;
			var geometry = new THREE.STLLoader().parse( contents );
				geometry.sourceType = "stl";
				geometry.sourceFile = file.name;

			var material = new THREE.MeshPhongMaterial();

			var mesh = new THREE.Mesh( geometry, material );
				mesh.name = file.name;
				threeManager.changeModel(mesh);
			}, false );

			if ( reader.readAsBinaryString !== undefined ) {

				reader.readAsBinaryString( file );

			} else {

				reader.readAsArrayBuffer( file );

			}

	}

	function loadOBJ(file){
		var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;

				var object = new THREE.OBJLoader().parse( contents );
				object.name = file.name;
				threeManager.changeModel(object);
			}, false );
		reader.readAsText(file);
	}

	function loadDAE(file){
		var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var parser = new DOMParser();
					var xml = parser.parseFromString( contents, 'text/xml' );
					var loader = new THREE.ColladaLoader();
					loader.parse( xml, function ( collada ) {

						collada.scene.name = file.name;
						threeManager.changeModel(collada.scene);
					} );

				}, false );
			reader.readAsText(file);
	}
};

var ZipModel = function(){

	var obj = window;
	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;
	function onerror(message) {
		alert(message);
	}
	
	var URL = obj.webkitURL || obj.mozURL || obj.URL;

	return {
		getEntries : function(file, onend) {
			zip.createReader(new zip.BlobReader(file), function(zipReader) {
				zipReader.getEntries(onend);
			}, onerror);
		}
	};
};

function mouseEvent(type, sx, sy, cx, cy) {
  var evt;
  var e = {
    bubbles: true,
    cancelable: (type != "mousemove"),
    view: window,
    detail: 0,
    screenX: sx, 
    screenY: sy,
    clientX: cx, 
    clientY: cy,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  };
  if (typeof( document.createEvent ) == "function") {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(type, 
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode);
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (prop in e) {
    evt[prop] = e[prop];
  }
    evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
  }
  return evt;
}
