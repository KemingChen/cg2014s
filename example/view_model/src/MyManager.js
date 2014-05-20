var MyManager = (function() {
	var fileInput;

	function initFileInput() {
		fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.addEventListener('change', onFileInputChange);
	}

	function createButton(text, onClick){
		var btn = document.createElement("BUTTON");
		btn.appendChild(document.createTextNode(text));
		btn.addEventListener("click", onClick, false);
		document.getElementById('ui').appendChild(btn);
	}

	function initView() {
		createButton("Load", onImportOptionClick);
		createButton("Clean", function() {
			RenderManager.cleanScene();
			printMessage(" Clean!!");
		});
		printMessage("  HI!! This is a model loader for dae, stl, obj formats and whose zip!!");
	}

	function printMessage(message) {
		document.getElementById("messageDiv").innerHTML = message;
	}

	function onImportOptionClick() {
		fileInput.click();
	}

	function onFileInputChange(event) {
		console.log(event.target.files);
		LoaderManager.loadFile(fileInput.files[0]);
	}

	function start() {
		MotionController.initLeapMotion();
		RenderManager.init();
		initFileInput();
		initView();
	}

    return {
        start: start,
        printMessage: printMessage
    };
})();