var LoaderManager = (function() {
	var handle = {
		"zip": handleZip,
		"dae": handleDAE,
		"obj": handleOBJ,
		"stl": handleSTL,
	};

	function handleZip(datas){
		var zipModel = new ZipModel();
		zipModel.getEntries(datas.zip, function(entries) {
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
	}

	function handleDAE(datas){

	}

	function readAsText(file, callback){
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;
			callback(contents);
		}, false);
		reader.readAsText(datas.obj);
	}

	function handleOBJ(datas){
		var i = 0;
		readAsText(datas[i], function(contents){
			var objUrl = convertToUrl(contents);
			console.log(objUrl);
		})
		
	/*
		var object = new THREE.OBJLoader().parse(contents);
		object.name = file.name;
		RenderManager.changeModel(object);*/
		var loader = new THREE.OBJMTLLoader();
		loader.load(objUrl, '', function(object) {
			object.position.set(0, 0, 0);
			RenderManager.changeModel(object);
		});
	}

	function handleSTL(datas){

	}

	function convertToUrl(content){
		var contentType = '';
	    var sliceSize = 1024;
	    var byteCharacters = content;
	    var bytesLength = byteCharacters.length;
	    var slicesCount = Math.ceil(bytesLength / sliceSize);
	    var byteArrays = new Array(slicesCount);

	    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
	        var begin = sliceIndex * sliceSize;
	        var end = Math.min(begin + sliceSize, bytesLength);

	        var bytes = new Array(end - begin);
	        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
	            bytes[i] = byteCharacters[offset].charCodeAt(0);
	        }
	        byteArrays[sliceIndex] = new Uint8Array(bytes);
	    }
	    return window.URL.createObjectURL(new Blob(byteArrays, { type: contentType }));
	}

	function loadFiles(files){
		RenderManager.cleanScene();
		var datas = {
			type: '',
			mtl: [],
		};
		for(var i = 0; i < files.length; i++){
			var filename = files[i].name;
			var extension = filename.split('.').pop().toLowerCase();
			if(handle.hasOwnProperty(extension)){
				datas.type = extension;
				datas[extension] = files[i];
			}
			else if(extension === "mtl"){
				datas.mtl.push(files[i]);
			}
			else{
				console.log("Not Accept Files: " + filename);
			}
		}
		console.log(datas);

		var type = datas.type;
		if(type === ""){
			alert('Unsupported file format.');
		}
		else{
			MyManager.printMessage(datas[type]);
			handle[type](toArray(datas));
		}

		function toArray(datas){
			var result = [];
			result.push(datas[datas.type]);
			for(var i = 0; i < datas.mtl.length; i++){
				result.push(datas.mtl[i]);
			}
			return result;
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
			var objUrl = convertToUrl(contents);
			console.log(objUrl);
			/*
			var object = new THREE.OBJLoader().parse(contents);
			object.name = file.name;
			RenderManager.changeModel(object);*/
			var loader = new THREE.OBJMTLLoader();
			loader.load(objUrl, '', function(object) {
				object.position.set(0, 0, 0);
				RenderManager.changeModel(object);
			});
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
        loadFiles: loadFiles,
        loadUnZipFile: loadUnZipFile
    };
})();