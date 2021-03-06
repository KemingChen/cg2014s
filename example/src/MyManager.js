var MyManager = (function() {
	var fileInput;
	var loaderManager = new LoaderManager(handleRender);

	function handleRender(object, modelName) {
		MyManager.printMessage(modelName);
		RenderManager.changeModel(object);
	}

	function initFileInput() {
		fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = "2";
		fileInput.addEventListener('change', onFileInputChange);
	}

	function createButton(text, onClick){
		var btn = document.createElement("BUTTON");
		btn.appendChild(document.createTextNode(text));
		btn.addEventListener("click", onClick, false);
		document.getElementById('ui').appendChild(btn);
	}

	function initView() {
		createButton("Load", function() {
			fileInput.click();
		});
		createButton("Clean", function() {
			RenderManager.cleanScene();
			printMessage(" Clean!!");
		});
		printMessage("  HI!! This is a model loader for dae, stl, obj formats and whose zip!!");
	}

	function printMessage(message) {
		document.getElementById("messageDiv").innerHTML = message;
	}
	
	function onFileInputChange(event) {
		//LoaderManager.loadFiles(fileInput.files);
		if(fileInput.files.length > 0){
			//RenderManager.cleanScene();
			loaderManager.loadFilesAndHandle_Local(fileInput.files);
		}
	}

	function start() {
		MotionController.initLeapMotion();
		RenderManager.init();
		initFileInput();
		initView();
		loaderManager.loadFilesAndHandle_Server([
			"../datas/skull-noteeth.zip",
			"../datas/teeth-up.zip",
			"../datas/teeth-down.zip"
			//"../datas/ZIP/male02.zip", 
			//"../datas/ZIP/slotted_disk.zip", 
			//"../datas/ZIP/monster.zip"
		]);
	}

    return {
        start: start,
        printMessage: printMessage
    };
})();