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
		animate();
	}


	function initMouseSelect() {
		renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
		renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
		renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

		var tmp = null;

		function onDocumentMouseDown(event) {
			var raycaster = raycastObject(event.clientX, event.clientY);

			var selectableObject = [];
			for (var i = 0; i <= scene.children.length - 1; i++) {
				if(scene.children[i] != plane)
					selectableObject.push(scene.children[i]);
				
			};

			var intersects = raycaster.intersectObjects(selectableObject, true);
			if (intersects.length > 0) {
				console.log("yes");
				controls.enabled = false;
				SELECTED = intersects[ 0 ].object;
				plane.position.copy( SELECTED.position );
				plane.lookAt( camera.position );
				var intersects = raycaster.intersectObject(plane);
				offset.copy( intersects[ 0 ].point ).sub( plane.position );
				//tmp = raycaster.ray.direction;
			}
		}

		function onDocumentMouseMove(event) {
			if(SELECTED) {
				var raycaster = raycastObject(event.clientX, event.clientY);
				/*var offset = new THREE.Vector3();
				offset.copy(tmp);
				offset.sub(raycaster.ray.direction);
				tmp = raycaster.ray.direction;
				SELECTED.position.sub(offset);*/
				var intersects = raycaster.intersectObject( plane );
				SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
				

				render();
				//var intersects = raycaster.intersectObject(SELECTED);
				//SELECTED.position.copy(intersects[ 0 ].point);
			}
		}

		function onDocumentMouseUp(event) {
			if(SELECTED) {
				
				controls.enabled = true;
				plane.position.copy( SELECTED.position );
				SELECTED = null;
			}
		}
	}

	function initSize(){
		var canvasSize = getCanvasSize();
		renderer.setSize(canvasSize.width, canvasSize.height);
	}

	function initScene(){
		scene = new THREE.Scene();	
	}

	function initPlane(){
		plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 20, 20 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
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
		camera = new THREE.PerspectiveCamera(60, canvasSize.width / canvasSize.height, 1, 1000);

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
		scene.add(obj);
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