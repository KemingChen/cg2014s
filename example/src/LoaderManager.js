var LoaderManager = function(handleRender) {
	if(!handleRender){
		throw "LoaderManager Error: No handleRender Object";
	}

	var handle = {
		"zip": handleZip,
		"dae": handleDAE,
		"obj": handleOBJ,
		"stl": handleSTL,
	};

	var modelName = " ";
	var handelModel = handleRender;

	var loaderDatas = function(){
		var datas = {
			type: '',
			mtl: [],
			jpg: [],
		};

		function SaveToDatas(filename, data){
			console.log(filename);
			var extension = filename.split('.').pop().toLowerCase();
			if(handle.hasOwnProperty(extension)){
				datas.type = extension;
				datas[extension] = data;
			}
			else if(extension === "mtl"){
				datas.mtl.push(data);
			}
			else if(extension === "jpg"){
				datas.jpg.push({
					filename: filename,
					data: data,
				});
			}
			else{
				console.log("Not Accept Files: " + filename);
			}
		}

		return{
			SaveToDatas: SaveToDatas,
			datas: datas,
		}
	};

	function loadFilesAndHandle_Local(files){
		console.log(files);
		if(files.length === 0){
			console.log("No Files!!!");
			return;
		}
		
		var info = new loaderDatas();
		for(var i = 0; i < files.length; i++){
			var filename = files[i].name;
			info.SaveToDatas(filename, files[i]);
		}
		console.log(info.datas);

		var type = info.datas.type;
		if(type === ""){
			alert('Unsupported file format.');
		}
		else{
			handle[type](info.datas);
		}
	}

	function loadFilesAndHandle_Server(zips){ // only support handle one file, suggest using zip file
		console.log(zips);
		if(zips.length === 0){
			console.log("No Files!!!");
			return;
		}

		for(var i in zips){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', zips[i], true);
			xhr.responseType = 'blob';
			xhr.filename = zips[i];
			xhr.onload = function(e) {
				if (this.status == 200) {
					var myBlob = this.response;
					var filename = this.filename;
					var info = new loaderDatas();
					info.SaveToDatas(filename, myBlob);
					var type = info.datas.type;
					handle[type](info.datas);
				}
			};
			xhr.send();
		}	
	}

	function handleZip(datas){
		var info = new loaderDatas();
		ZipModel.getEntries(datas.zip, function(entries) {
			var i = entries.length;
			entries.forEach(function(entry) {
				writer = new zip.BlobWriter();
				var writer, zipFileEntry;
				var loadMessage = "";
				entry.getData(writer, function(blob) {
					modelName = entry.filename;
					//loadMessage += entry.filename;
					//loadMessage += "<br />";
					//MyManager.printMessage(loadMessage);

					console.log(entry.filename);
					info.SaveToDatas(entry.filename, blob);

					if(i == 1){
						console.log(info.datas);
						var type = info.datas.type;
						handle[type](info.datas);
						return;
					}
					i--;
				}, function(message) {});
			});
		});
	}

	function handleDAE(datas){
		readAsText(datas.dae, function(contents){
			loadJPGS(datas, function(jpgs){
				if(jpgs.length > 0){
					for(var j in jpgs){
						contents = contents.replace(new RegExp("./" + jpgs[j].from, "g"), jpgs[j].to);
					}
				}
				var daeUrl = convertToUrl(contents);
				console.log(daeUrl);

				renderDAE(daeUrl);
			});
			
		});

		function renderDAE(daeUrl){
			var loader = new THREE.ColladaLoader();
			loader.options.convertUpAxis = true;
			loader.load(daeUrl, function(collada) {

				dae = collada.scene;
				TestDAE = dae;
				console.log(dae);
				// skin = collada.skins[0];

				// dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
				// dae.updateMatrix();
				//RenderManager.changeModel(dae);
				handelModel(dae, modelName);
			});
		}
	}

	function handleOBJ(datas){
		readAsText(datas.obj, function(contents){
			var objUrl = convertToUrl(contents);
			// console.log(objUrl);

			if(datas.mtl.length > 0){
				readAsText(datas.mtl[0], function(contents){
					loadJPGS(datas, function(jpgs){
						if(jpgs.length > 0){
							for(var j in jpgs){
								contents = contents.replace(new RegExp(jpgs[j].from, "g"), jpgs[j].to);
							}
						}
						var mtlUrl = convertToUrl(contents);
						// console.log(contents);
						// console.log(mtlUrl);
						renderOBJ(objUrl, mtlUrl);
					});
				});
			}
			else{
				renderOBJ(objUrl, "");
			}
		});

		function renderOBJ(objUrl, mtlUrl){
			var loader = new THREE.OBJMTLLoader();
			loader.load(objUrl, mtlUrl, function(object) {
				object.position.set(0, 0, 0);
				//RenderManager.changeModel(object);
				handelModel(object, modelName);
			});
		}
	}

	function handleSTL(datas){
		readAsBinaryString(datas.stl, function(contents){
			var stlUrl = convertToUrl(contents);
			console.log(stlUrl);
			renderSTL(stlUrl);
		});

		function renderSTL(stlUrl){
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
				// mesh.rotation.set( 0, - Math.PI / 2, 0 );
				mesh.scale.set( 10, 10, 10 );

				mesh.castShadow = true;
				mesh.receiveShadow = true;

				//RenderManager.changeModel(mesh);
				handelModel(mesh, modelName);

			});
			loader.load(stlUrl);
		}
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

	function readAsText(file, callback){
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;
			callback(contents);
		}, false);
		reader.readAsText(file);
	}

	function readAsBinaryString(file, callback){
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;
			callback(contents);
		}, false);
		reader.readAsBinaryString(file);
	}

	function loadJPGS(datas, callback){
		console.log("loadJPGS");
		console.log(datas);
		var i = datas.jpg.length - 1;
		var jpgs = [];
		if(i >= 0){
			load(jpgs, i, datas, function(){
				console.log(jpgs);
				callback(jpgs);
			});
		}
		else{
			callback(jpgs);
		}

		function load(jpgs, i, datas, callback){
			readAsBinaryString(datas.jpg[i].data, function(contents){
				var jpgUrl = convertToUrl(contents).split("/");
				// console.log(jpgUrl);
				jpgs.push({
					from: datas.jpg[i].filename,
					to: jpgUrl[jpgUrl.length - 1],
				});
				if(i === 0){
					callback();
					return;
				}
				load(jpgs, i - 1, datas, callback)
			});
		}
	}

	return {
		loadFilesAndHandle_Local : loadFilesAndHandle_Local,
		loadFilesAndHandle_Server: loadFilesAndHandle_Server,
	};
};

var ZipModel = (function() {
	var obj = window;
	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;
	var URL = obj.webkitURL || obj.mozURL || obj.URL;

	function onerror(message) {
		alert(message);
	}

	return {
		getEntries: function(file, onend) {
			zip.createReader(new zip.BlobReader(file), function(zipReader) {
				zipReader.getEntries(onend);
			}, onerror);
		}
	};
})();