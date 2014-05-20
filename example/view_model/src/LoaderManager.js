var LoaderManager = (function() {
	function loadFile(file) {
		var filename = file.name;
		var extension = filename.split('.').pop().toLowerCase();
		RenderManager.cleanScene();
		var loadMessage = ""
		if (extension === 'zip') {
			loadFormat = "zip: ";
			var zipModel = new ZipModel();
			zipModel.getEntries(file, function(entries) {
				entries.forEach(function(entry) {
					writer = new zip.BlobWriter();
					var writer, zipFileEntry;
					entry.getData(writer, function(blob) {
						loadMessage += entry.filename;
						loadMessage += "<br>";
						MyManager.printMessage(loadMessage);
						loadUnZipFile(entry.filename, blob);
					}, function(message) {});
				});
			});
		} else {
			loadMessage += file.name;
			loadUnZipFile(file.name, file);
			MyManager.printMessage(loadMessage);
		}
	}

	function loadUnZipFile(name, data) {
		var extension = name.split('.').pop().toLowerCase();
		switch (extension) {
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
				alert('Unsupported file format.');
				break;
		}
	}

	function loadSTL(file) {
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {

			var contents = event.target.result;
			var geometry = new THREE.STLLoader().parse(contents);
			geometry.sourceType = "stl";
			geometry.sourceFile = file.name;

			var material = new THREE.MeshPhongMaterial();

			var mesh = new THREE.Mesh(geometry, material);
			mesh.name = file.name;
			RenderManager.changeModel(mesh);
		}, false);

		if (reader.readAsBinaryString !== undefined) {
			reader.readAsBinaryString(file);
		} else {
			reader.readAsArrayBuffer(file);
		}

	}

	function loadOBJ(file) {
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {

			var contents = event.target.result;

			var object = new THREE.OBJLoader().parse(contents);
			object.name = file.name;
			RenderManager.changeModel(object);
		}, false);
		reader.readAsText(file);
	}

	function loadDAE(file) {
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {

			var contents = event.target.result;

			var parser = new DOMParser();
			var xml = parser.parseFromString(contents, 'text/xml');
			var loader = new THREE.ColladaLoader();
			loader.parse(xml, function(collada) {

				collada.scene.name = file.name;
				RenderManager.changeModel(collada.scene);
			});

		}, false);
		reader.readAsText(file);
	}

    return {
        loadFile: loadFile,
        loadUnZipFile: loadUnZipFile
    };
})();