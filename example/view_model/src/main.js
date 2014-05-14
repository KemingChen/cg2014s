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

	return{
		threeStart: threeStart,
		changeModel: changeModel,
		cleanScene: cleanScene
	};

	function initManager(){
		manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};
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
	}


	function threeStart() {
		//document.oncontextmenu = blockMenu;
		//bindMouseEvent();

		window.addEventListener( 'resize', onWindowResize, false );
		initFileInput();
		initLoader();
		initView();

		initThree();
		initCamera();
		initControls();
		initScene();   
		initLight();

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
		if(extension ==='zip'){
			var zipModel = new ZipModel();

			zipModel.getEntries(file,function(entries){
				entries.forEach(function(entry) {
					//loadUnZipFile(entry.filename);

					/*zipModel.getEntryFile(entry, "Blob", function(blobURL) {
						//loadUnZipFile(entry.filename);
						var ex = 1;
						}, function(current, total) {
						
					});*/
					writer = new zip.BlobWriter();
					var writer, zipFileEntry;
					entry.getData(writer, function(blob) {
							loadUnZipFile(entry.filename,blob);	
					}, function(message){});
					
				});
			});

			/*model.getEntries(fileInput.files[0], function(entries) {
				fileList.innerHTML = "";
				entries.forEach(function(entry) {
					var li = document.createElement("li");
					var a = document.createElement("a");
					a.textContent = entry.filename;
					a.href = "#";
					a.addEventListener("click", function(event) {
						if (!a.download) {
							download(entry, li, a);
							event.preventDefault();
							return false;
						}
					}, false);
					li.appendChild(a);
					fileList.appendChild(li);
				});
			});*/
		

		}else{
			loadUnZipFile(file.name,file);
		}
	}

	function download(entry, li, a) {
			model.getEntryFile(entry, "RAM", function(blobURL) {
				var clickEvent = document.createEvent("MouseEvent");
				if (unzipProgress.parentNode)
					unzipProgress.parentNode.removeChild(unzipProgress);
				unzipProgress.value = 0;
				unzipProgress.max = 0;
				clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				a.href = blobURL;
				a.download = entry.filename;
				a.dispatchEvent(clickEvent);
				}, function(current, total) {
				
			});
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

	function createTempFile(callback) {
		var tmpFilename = "tmp.dat";
		requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
			function create() {
				filesystem.root.getFile(tmpFilename, {
					create : true
				}, function(zipFile) {
					callback(zipFile);
				});
			}

			filesystem.root.getFile(tmpFilename, null, function(entry) {
				entry.remove(create, create);
			}, create);
		});
	}

	
	var URL = obj.webkitURL || obj.mozURL || obj.URL;

	return {
		getEntries : function(file, onend) {
			zip.createReader(new zip.BlobReader(file), function(zipReader) {
				zipReader.getEntries(onend);
			}, onerror);
		},
		getEntryFile : function(entry, creationMethod, onend, onprogress) {
			var writer, zipFileEntry;

			function getData() {
				entry.getData(writer, function(blob) {
					var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
					onend(blobURL);
				}, onprogress);
			}

			if (creationMethod == "Blob") {
				writer = new zip.BlobWriter();
				getData();
			} else {
				createTempFile(function(fileEntry) {
					zipFileEntry = fileEntry;
					writer = new zip.FileWriter(zipFileEntry);
					getData();
				});
			}
		}
	};
};

 