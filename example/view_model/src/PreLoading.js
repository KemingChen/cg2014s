var PreLoading = (function(){
	var manager = new THREE.LoadingManager();
	manager.onProgress = function(item, loaded, total) {
		console.log(item, loaded, total);
	};

	function Mesh() {
		var model = new THREE.Mesh(
			new THREE.SphereGeometry(20, 20),
			new THREE.MeshLambertMaterial({
				color: 0xff0000
			})
		);
		RenderManager.changeModel(model);
		model.position.set(0, 0, 0);
	}

	function STL() {
		var loader = new THREE.STLLoader();
		loader.addEventListener('load', function(event) {
			var geometry = event.content;
			var material = new THREE.MeshPhongMaterial({
				ambient: 0xff5533,
				color: 0xff5533,
				specular: 0x111111,
				shininess: 200
			});

			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(0, 0, 0);
			//mesh.rotation.set( 0, - Math.PI / 2, 0 );
			//mesh.scale.set( 10, 10, 10 );
			mesh.castShadow = true;
			mesh.receiveShadow = true;

			RenderManager.changeModel(mesh);
		});
		loader.load('../../models/stl/slotted_disk.stl');
	}

	function OBJ() {
		var loader = new THREE.OBJLoader(manager);
		loader.load('../../obj/male02/male02.obj', function(object) {
			object.position.set(0, 0, 0);
			RenderManager.changeModel(object);
		});
	}

	function OBJMTL() {
		var loader = new THREE.OBJMTLLoader();
		loader.load('../../obj/male02/male02.obj', '../../obj/male02/male02_dds.mtl', function(object) {
			object.position.set(0, 0, 0);
			RenderManager.changeModel(object);
		});
	}

	function DAE() {
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load('../../models/collada/monster/monster.dae', function(collada) {

			var dae = collada.scene;
			var skin = collada.skins[0];

			dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
			dae.updateMatrix();
			RenderManager.changeModel(dae);
		});
	}

	return {
		Mesh: Mesh,
		STL: STL,
		OBJ: OBJ,
		OBJMTL: OBJMTL,
		DAE: DAE,
	}
})();