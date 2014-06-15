var RenderManager = (function() {
	var canvas3dId = "canvas3d";
	var controls = null;
	var camera = null;
	var scene = null;
	var light = null;
	var projector = new THREE.Projector();
	var renderer = new THREE.WebGLRenderer({
		antialias: true,
	});

	var SELECTED = null;
	var plane = null;
	var offset = new THREE.Vector3();

	var transformControl = null;
	
	var group = new THREE.Object3D();

	function init(){
		renderer.setClearColor(0xFFFFFF, 1.0);
		document.getElementById(canvas3dId).appendChild(renderer.domElement);
		window.addEventListener( 'resize', onWindowResize, false );

		initMouseSelect();
		initSize();
		initScene();
		initPlane();
		initLight();
		initCamera();
		initControls();
		initTransformControl();
		animate();
	}


	function initMouseSelect() {
		renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

		function onDocumentMouseDown(event) {
			var raycaster = raycastObject(event.clientX, event.clientY);

			var intersects = raycaster.intersectObjects(group.children, true);
			var isInterTransformControl = raycaster.intersectObjects(transformControl.children, true);

			if (intersects.length > 0) {

				console.log("yes");
				
				SELECTED = intersects[ 0 ].object;
				transformControl.attach(SELECTED);
				scene.add(transformControl);
				render();

			}else {

				if(transformControl.isInterMouse()){return;}
				
				transformControl.detach(SELECTED);
				SELECTED = null;
				scene.remove(transformControl);
				render();
			}

			if(transformControl.isInterMouse()){
				controls.enabled = false;
			}else{
				controls.enabled = true;
			}
		}

		window.addEventListener( 'keydown', function ( event ) {
		            //console.log(event.which);
		            switch ( event.keyCode ) {
		              case 81: // Q
		                transformControl.setSpace( transformControl.space == "local" ? "world" : "local" );
		                break;
		              case 87: // W
		                transformControl.setMode( "translate" );
		                break;
		              case 69: // E
		                transformControl.setMode( "rotate" );
		                break;
		              case 82: // R
		                transformControl.setMode( "scale" );
		                break;
					case 187:
					case 107: // +,=,num+
						transformControl.setSize( transformControl.size + 0.1 );
						break;
					case 189:
					case 10: // -,_,num-
						transformControl.setSize( Math.max(transformControl.size - 0.1, 0.1 ) );
						break;
		            }            
        		});
	}

	function initSize(){
		var canvasSize = getCanvasSize();
		renderer.setSize(canvasSize.width, canvasSize.height);
	}

	function initScene(){
		scene = new THREE.Scene();	
		scene.remove(group);
		group = new THREE.Object3D();
		scene.add(group);
	}

	function initPlane(){
		plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 20, 20 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
		plane.rotation.x = Math.PI / 2;
		//plane.visible = false;
		scene.add( plane );
	}

	/*function updatePlane(){
		plane.rotate();
		camera.
	}*/

	function initLight() {
		light = new THREE.DirectionalLight(0xffeedd);
		light.position.set(200, 200, 200);
		scene.add(light);
	}

	function initCamera() {
		var canvasSize = getCanvasSize();
		camera = new THREE.PerspectiveCamera(60, canvasSize.width / canvasSize.height, 1, 100000);

		camera.position.x = 0;
		camera.position.y = 50;
		camera.position.z = 500;
		camera.up.x = 0;
		camera.up.y = 1;
		camera.up.z = 0;
		camera.lookAt({
			x: 0,
			y: 0,
			z: 0
		});
	}

	function initControls() {
		controls = new THREE.TrackballControls(camera, document.getElementById(canvas3dId));
		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
		controls.keys = [65, 83, 68];

		controls.addEventListener('change', function() {
			renderer.render(scene, camera);
		});
	}

	function initTransformControl() {
		transformControl = new THREE.TransformControls( camera, renderer.domElement );
		transformControl.addEventListener( 'change', render );
	}

	function onWindowResize() {
		var canvasSize = getCanvasSize();
		camera.aspect = canvasSize.width / canvasSize.height; //window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(canvasSize.width, canvasSize.height);
		controls.handleResize();
		render();
	}

	function rotate(start, end, speed) {
		var axis = new THREE.Vector3();
		var vector = controls.target.clone();
		var angle = Math.acos(start.dot(end) / start.length() / end.length());
		if (angle) {
			var quaternion = new THREE.Quaternion();
			axis.crossVectors(start, end).normalize();
			angle *= speed;
			quaternion.setFromAxisAngle(axis, -angle);
			camera.up.applyQuaternion(quaternion);

			end.applyQuaternion(quaternion);

			camera.position.applyQuaternion(quaternion);
			camera.lookAt(vector);
			render();
		}

	}

	function animate() {
		requestAnimationFrame(animate);
		controls.update();
	}

	function render() {
		renderer.render(scene, camera);
	}

	function changeModel(obj) {
		group.add(obj);
		render();
	}

	function raycastObject(rendererDomElementEventX, rendererDomElementEventY) {
		var x = rendererDomElementEventX;
		var y = rendererDomElementEventY;
		var canvasSize = getCanvasSize();
		x = (x / canvasSize.width) * 2 - 1;
		y = -(y / canvasSize.height) * 2 + 1;
		var vector = new THREE.Vector3(x, y, 0.5);
		projector.unprojectVector(vector, camera);
		var origin = camera.position;
		var direction = vector.sub( camera.position ).normalize();
		var raycaster = new THREE.Raycaster(origin, direction);
		//--- debug view ---
		//scene.add( new THREE.ArrowHelper(direction, origin, 50, 0x000000));
		//render();
		//------------------
		return raycaster;
	}

	function cleanScene() {
		initScene();
		initPlane();
		initLight();
		render();
	}

	function getCanvasSize(){
		return {
			width: document.getElementById(canvas3dId).clientWidth,
			height: document.getElementById(canvas3dId).clientHeight,
		}
	}

	return {
		init: init,
		render: render,
		cleanScene: cleanScene,
		changeModel: changeModel,
		raycastObject: raycastObject,
	}
})();