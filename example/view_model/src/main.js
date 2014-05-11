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

	return{
		threeStart: threeStart
	};

	function initThree() {
	    width = document.getElementById('canvas3d').clientWidth;
	    height = document.getElementById('canvas3d').clientHeight;
	    renderer = new THREE.WebGLRenderer({antialias:true});
	    
	    renderer.setSize(width, height );
	    document.getElementById('canvas3d').appendChild(renderer.domElement);
	    renderer.setClearColor(0xFFFFFF, 1.0);
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
		light = new THREE.DirectionalLight(0xff0000, 1.0, 0);
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

	function initControls(){

		controls = new THREE.TrackballControls(camera);

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

	function render(){
		//animationLoop
		//requestAnimationFrame(render);
		
		//the rotation Show
		//model.rotation.x += 0.01;
		//model.rotation.y += 0.01;

		//renderer.clear(); 
		renderer.render(scene, camera);
	}

	//block right button
	function blockMenu(Evt){

	  // window.event 是IE才有的物件
	  if(window.event){
	    Evt = window.event;
	    Evt.returnValue = false;//取消IE預設事件
	  }else
	    Evt.preventDefault();//取消DOM預設事件
	}

	//mouseWheel
	function MouseWheel (e) {
	  e = e || window.event;
	  //alert(['scrolled ', (( e.wheelDelta <= 0 || e.detail > 0) ? 'down' : 'up')].join(''));
	}

	function bindMouseEvent(){
		// hook event listener on window object
		if ('onmousewheel' in window) {
		  window.onmousewheel = MouseWheel;
		} else if ('onmousewheel' in document) {
		  document.onmousewheel = MouseWheel;
		} else if ('addEventListener' in window) {
		  window.addEventListener("mousewheel", MouseWheel, false);
		  window.addEventListener("DOMMouseScroll", MouseWheel, false);
		}
	}

	function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				controls.handleResize();

				render();

	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
	}


	function threeStart() {
		//document.oncontextmenu = blockMenu;
		//bindMouseEvent();

		window.addEventListener( 'resize', onWindowResize, false );
		initThree();
		initCamera();
		initControls();
		initScene();   
		initLight();
		initObject();
		animate();
	}
}();
 




 