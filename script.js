var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var processingCanvas = document.getElementById("processingCanvas");
var processingCtx = processingCanvas.getContext("2d");

function resizeCanvas(target = canvas) {
	target.width = window.innerWidth;
	target.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

////////////////////////////////////////////////
//               Caremarein Info              //
////////////////////////////////////////////////

var timeSinceBlinked = 0;
var blinking = false;
var blinkFrames = 0;

// Eyes

const eyePaths = {
	"simple": "assets/eyes/eye_simple.svg",
	"man": "assets/eyes/eye_man.svg",
	"circle": "assets/eyes/eye_circle.svg",
	"squid": "assets/eyes/eye_squid.svg",
	"sad": "assets/eyes/eye_sad.svg",
	"angry": "assets/eyes/eye_angry.svg",
	"nano": "assets/eyes/eye_nano.svg",
};

var eyes = {
	"simple": { img: null, flip: true },
	"man": { img: null, flip: true },
	"circle": { img: null, flip: true },
	"squid": { img: null, flip: true },
	"sad": { img: null, flip: true },
	"angry": { img: null, flip: true },
	"nano": { img: null, flip: false },
}

function loadEyes() {
	for (var eye in eyePaths) {
		var img = new Image();
		img.src = eyePaths[eye];
		eyes[eye].img = img;
	}
}

loadEyes();

// Mouths 

const mouthPaths = {
	"uwu": "assets/mouths/mouth_uwu.svg",
	"man": "assets/mouths/mouth_man.svg",
	"tongue": "assets/mouths/mouth_tongue.svg",
	"squid": "assets/mouths/mouth_squid.svg",
	"meh": "assets/mouths/mouth_meh.svg",
	"blep": "assets/mouths/mouth_blep.svg",
	"jagged": "assets/mouths/mouth_jagged.svg",
};

var mouths = {}

function loadMouths() {
	for (var mouth in mouthPaths) {
		var img = new Image();
		img.src = mouthPaths[mouth];
		mouths[mouth] = img;
	}
};

loadMouths();

// Accessories

const accessoryPaths = {
	"glasses": "assets/accessories/acc_glasses.svg"
}

var accessories = {
	"glasses": {
		"img": null,
		"x": "cw/2",
		"y": "ch/3",
		"w": "1.05*(ch+eyegap)",
		"h": "1.05*(ch+eyegap)"
	}
}

function loadAccessories() {
	for (var accessory in accessoryPaths) {
		var img = new Image();
		img.src = accessoryPaths[accessory];
		accessories[accessory].img = img;
	}
}

loadAccessories();

// Info

var careimarinInfo = {
	eye: {
		typeLeft: "simple",
		typeRight: "simple",
		gap: 50,
		colour: "#00ff00",
		blinkLength: 0.2
	},
	screen: {
		colour: "#002010"
	},
	mouth: {
		type: "uwu",
		colour: "#00ff00"
	},
	accessory: {
		type: "glasses",
		colour: "#00ff00"
	}
};

// Drawing Utilities

function drawImageColour(ctx, img, x, y, width, height, colour, drawToCanvas = true) {
	processingCtx.clearRect(0, 0, processingCanvas.width, processingCanvas.height);
	processingCanvas.width = width;
	processingCanvas.height = height;
	processingCtx.fillStyle = colour;
	processingCtx.fillRect(0, 0, width, height);
	processingCtx.globalCompositeOperation = "destination-in";
	processingCtx.drawImage(img, 0, 0, width, height);
	processingCtx.globalCompositeOperation = "source-over";

	if (drawToCanvas) {
		ctx.drawImage(processingCanvas, x, y, width, height);
	}
}


function drawImageScale(ctx, img, x, y, width, height, scale = [1, 1], scaleCenter = [0.5, 0.5], drawToCanvas = true) {
	if (drawToCanvas) {
		scaledCtx = ctx;
	} else {
		scaledCtx = processingCtx;
		scaledCtx.clearRect(0, 0, processingCanvas.width, processingCanvas.height);
	}

	scaledCtx.save(); // Save the current state
	scaledCtx.translate(x + width * scaleCenter[0], y + height * scaleCenter[1]); // Set translate to set the scale center
	scaledCtx.scale(scale[0], scale[1]); // Set scale to flip the image
	scaledCtx.drawImage(img, -width * scaleCenter[0] * scale[0], -height * scaleCenter[1] * scale[1], width * scale[0], height * scale[1]); // draw the image with correct positioning
	if (debug && debugMode == 3) {
		scaledCtx.strokeStyle = "blue";
		scaledCtx.strokeRect(-width * scaleCenter[0], -height * scaleCenter[1], width, height);
		ctx.beginPath();
		ctx.moveTo(-width * scaleCenter[0], -height * scaleCenter[1]);
		ctx.lineTo(-width * scaleCenter[0] + width, -height * scaleCenter[1] + height);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-width * scaleCenter[0] + width, -height * scaleCenter[1]);
		ctx.lineTo(-width * scaleCenter[0], -height * scaleCenter[1] + height);
		ctx.stroke();
	}
	scaledCtx.restore(); // Restore the last saved state
};

function drawImage(ctx, img, x, y, width, height, colour = false, scale = [1, 1], scaleCenter = [0.5, 0.5]) {
	var basicArgs = [x, y, width, height];
	if (colour) {
		drawImageColour(ctx, img, ...basicArgs, colour, false);
		drawImageScale(ctx, processingCanvas, ...basicArgs, scale, scaleCenter)
	} else {
		drawImageScale(ctx, img, ...basicArgs, scale, scaleCenter);
	}

	if (debug && debugMode == 2) {
		ctx.strokeStyle = "red";
		ctx.strokeRect(x, y, width, height);
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y + height);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x + width, y);
		ctx.lineTo(x, y + height);
		ctx.stroke();
	}
}

// Drawing

function draw() {
	ctx.fillStyle = careimarinInfo.screen.colour;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawEyes();
	drawMouth();
	//drawAccessories();
}

function drawEyes() {
	if (eyes[careimarinInfo.eye.typeLeft].img && eyes[careimarinInfo.eye.typeRight].img) {
		var imageLeft = eyes[careimarinInfo.eye.typeLeft].img;
		var imageRight = eyes[careimarinInfo.eye.typeRight].img;
		var eyeWidth = canvas.height / 2;
		var eyeHeight = eyeWidth;
		var leftEyeX = canvas.width / 2 - (eyeWidth + careimarinInfo.eye.gap / 2);
		var rightEyeX = canvas.width / 2 + (careimarinInfo.eye.gap / 2);
		var eyeY = canvas.height / 3 - eyeHeight / 2;
		var blinkScale = blinking ? Math.abs(Math.cos(Math.PI * blinkFrames / careimarinInfo.eye.blinkLength)) : 1;
		//var lookOffsetXLeft = (mousePos[0] - (leftEyeX+eyeWidth/2))*0.02;
		//var lookOffsetXRight = (mousePos[0] - (rightEyeX+eyeWidth/2))*0.02;
		//var lookOffsetY = (mousePos[1] - eyeHeight)*0.02;
		drawImage(ctx, imageLeft, leftEyeX, eyeY, eyeWidth, eyeHeight, colour = careimarinInfo.eye.colour, scale = [1, blinkScale], scaleCenter = [0.5, 0.5]);
		drawImage(ctx, imageRight, rightEyeX, eyeY, eyeWidth, eyeHeight, colour = careimarinInfo.eye.colour, scale = [eyes[careimarinInfo.eye.typeRight].flip?-1:1, blinkScale], scaleCenter = [0.5, 0.5]);
	}
}

function drawMouth() {
	if (mouths[careimarinInfo.mouth.type]) {
		var mouth = mouths[careimarinInfo.mouth.type];
		var mouthWidth = canvas.height / 2;
		var mouthHeight = mouthWidth;
		var mouthX = canvas.width / 2 - (mouthWidth / 2);
		var mouthY = canvas.height / 3 + mouthHeight / 2;
		drawImage(ctx, mouth, mouthX, mouthY, mouthWidth, mouthHeight, colour = careimarinInfo.mouth.colour, scale = [1, 1 + (0.025 * Math.sin(timeElapsed))], scaleCenter = [1, 0.25]);
	}
}

function drawAccessories() {
	if (accessories[careimarinInfo.accessory.type].img) {
		var accessoryInfo = accessories[careimarinInfo.accessory.type];
		var scope = { cw: canvas.width, ch: canvas.height, eyegap: careimarinInfo.eye.gap }
		var accessory = accessoryInfo.img;
		var accessoryWidth = math.evaluate(accessoryInfo.w, scope);
		var accessoryHeight = accessoryWidth;
		var accessoryX = math.evaluate(accessoryInfo.x, scope) - (accessoryWidth / 2);
		var accessoryY = math.evaluate(accessoryInfo.y, scope) - accessoryHeight / 2;
		drawImage(ctx, accessory, accessoryX, accessoryY, accessoryWidth, accessoryHeight, colour = careimarinInfo.accessory.colour);
	}
}

// Game Loop

var mousePos = [0, 0];

let lastTime = 0;
var timeElapsed = 0;

function gameLoop() {
	//Delta time handling
	const time = performance.now();
	const deltaTime = (time - lastTime) / 1000;
	lastTime = time;
	timeElapsed += deltaTime;

	//Blink handling
	if (!blinking) {
		timeSinceBlinked += deltaTime;
	} else {
		timeSinceBlinked = 0;
		blinkFrames += deltaTime;
	}

	if (Math.random() < timeSinceBlinked / 180) {
		blinking = true;
		blinkFrames = 0;
	}

	if (blinkFrames > careimarinInfo.eye.blinkLength) {
		blinking = false;
	}

	window.requestAnimationFrame(gameLoop);
	draw();
	debugHandler();
}

gameLoop();

document.addEventListener('mousemove', function(event) {
	mousePos = [event.clientX, event.clientY];
});

// Debug

var debug = false;
var debugMode = 1;

function debugHandler() {
	// Debug Mode 1
	if (debug && debugMode == 1) {
		canvas.style.display = 'none';
		processingCanvas.style.display = 'block';
		document.getElementById("debugText").style.display = 'block';
	} else {
		canvas.style.display = 'block';
		processingCanvas.style.display = 'none';
		document.getElementById("debugText").style.display = 'none';
	}
	// Debug Mode 2 is handled in drawImage()
	// Debug Mode 3 is handled in drawImageScale()
}

document.addEventListener('keydown', function(event) {
	if (event.key === '/') {
		debug = !debug;
	} else if (event.key === '1') {
		debugMode = 1;
	} else if (event.key === '2') {
		debugMode = 2;
	} else if (event.key === '3') {
		debugMode = 3;
	} else if (event.key == 'r') {
		// Randomize Eyes and Mouth
		careimarinInfo.eye.typeLeft = Object.keys(eyePaths)[Math.floor(Math.random() * Object.keys(eyePaths).length)];
		careimarinInfo.eye.typeRight = careimarinInfo.eye.typeLeft;
		careimarinInfo.mouth.type = Object.keys(mouthPaths)[Math.floor(Math.random() * Object.keys(mouthPaths).length)];
		careimarinInfo.screen.colour = randomHexColour(0, 50);
		var brightColour = randomHexColour(175, 255);
		careimarinInfo.eye.colour = brightColour;
		careimarinInfo.mouth.colour = brightColour;
		careimarinInfo.accessory.colour = brightColour;
	}
});

function randomHexColour(minDimness = 0, maxDimness = 255) {
	var r = Math.floor(Math.random() * (maxDimness - minDimness + 1)) + minDimness;
	var g = Math.floor(Math.random() * (maxDimness - minDimness + 1)) + minDimness;
	var b = Math.floor(Math.random() * (maxDimness - minDimness + 1)) + minDimness;
	return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}