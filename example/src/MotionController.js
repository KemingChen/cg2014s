var MotionController = (function(){
	function onCircle(gesture) {
		var clockwise = false;
		if (gesture.normal[2] <= 0) {
			clockwise = true;
		}
		var inc;
		if (clockwise) {
			inc = -1.2;
		} else {
			inc = 1.2;
		}
		var container = document.getElementById('canvas3d');

		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(
			'DOMMouseScroll', // in DOMString typeArg,
			true, // in boolean canBubbleArg,
			true, // in boolean cancelableArg,
			window, // in views::AbstractView viewArg,
			inc, // in long detailArg,
			0, // in long screenXArg,
			0, // in long screenYArg,
			0, // in long clientXArg,
			0, // in long clientYArg,
			0, // in boolean ctrlKeyArg,
			0, // in boolean altKeyArg,
			0, // in boolean shiftKeyArg,
			0, // in boolean metaKeyArg,
			0, // in unsigned short buttonArg,
			null
		);
		container.dispatchEvent(evt);
	}

	function onSwipe(gesture) {
		var star = new THREE.Vector3();
		var end = new THREE.Vector3();
		star.x = gesture.position[1] - gesture.startPosition[1];
		star.y = gesture.position[0] - gesture.startPosition[0];
		star.z = 0;
		end.copy(star);
		var axis = new THREE.Vector3(0, 0, 1);
		var angle = Math.PI / 2;
		var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
		star.applyMatrix4(matrix);
		var matrix = new THREE.Matrix4().makeRotationAxis(star, angle);
		end.applyMatrix4(matrix);
		rotate(star, end, 0.05);
	}

	function onScreenTap(gesture) {

	}

	function onKeyTap(gesture) {

	}

	function initLeapMotion() {
		leapMotionController = new Leap.Controller({
			enableGestures: true
		});
		leapMotionController.on('connect', function() {
			console.log('Successfully connected.');
		});
		leapMotionController.on('deviceConnected', function() {
			console.log('A Leap device has been connected.');
		});

		leapMotionController.on('deviceDisconnected', function() {
			console.log('A Leap device has been disconnected.');
		});

		leapMotionController.on('ready', function() {

			// Ready code will go here

		});

		leapMotionController.on('frame', function(data) {

			var frame = data;

			for (var i = 0; i < frame.gestures.length; i++) {

				var gesture = frame.gestures[i];
				var type = gesture.type;
				switch (type) {
					case "circle":
						onCircle(gesture);
						break;
					case "swipe":
						onSwipe(gesture);
						break;
					case "screenTap":
						onScreenTap(gesture);
						break;
					case "keyTap":
						onKeyTap(gesture);
						break;

				}
			}
		});
		leapMotionController.connect();
	}

	return{
		initLeapMotion: initLeapMotion,
	}
})();