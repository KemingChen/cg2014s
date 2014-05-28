var RenderManager = (function(){
	var canvas3dId = "canvas3d";
	var controls = null;
	var camera = null;
	var scene = null;
	var light = null;
	var renderer = new THREE.WebGLRenderer({
		antialias: true,
	});

	function init(){
		renderer.setClearColor(0xFFFFFF, 1.0);
		document.getElementById(canvas3dId).appendChild(renderer.domElement);
		window.addEventListener( 'resize', onWindowResize, false );

		initSize();
		initScene();
		initLight();
		initCamera();
		initControls();
		animate();
	}

	function initSize(){
		var canvasSize = getCanvasSize();
		renderer.setSize(canvasSize.width, canvasSize.height);
	}

	function initScene(){
		scene = new THREE.Scene();
	}

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

	function cleanScene() {
		initScene();
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
	}
})();