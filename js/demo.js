window.addEventListener('load', function () {
	const playButton = document.getElementById('play-button')

	playButton.addEventListener('click', function () {
		const loaderStep2 = document.getElementById("loaderStep2");
		$(loaderStep2).fadeOut(1000)
		hideInstructions()
	})

	const helpButton = document.getElementById('help-button')

	helpButton.addEventListener('click', function (e) {
		e.preventDefault();
		showInstructions(true);
	})

	const inquireButton = document.getElementById('inquire-button')

	inquireButton.addEventListener('click', function (e) {
		e.preventDefault();
		
	})
})

const messageHandler = (event) => {
	if(!event.data.type) return;
	const loaderStep1 = document.getElementById("loaderStep1");
	const loaderStep2 = document.getElementById("loaderStep2");
	const loaderStep3 = document.getElementById("loaderStep3");
	const iframeElem = document.getElementById("iframe_1");

	console.log('event', event)
	console.log("received data event type " + event.data.type)
	switch (event.data.type) {
		case "ResponseFromUE4":
			console.log("UE4->iframe: " + event.data.descriptor)
			myHandleResponseFunction(event.data.descriptor);
			break;
		case "stage1_inqueued":
			loaderStep1.style.visibility = "visible";
			break;
		case "stage2_deQueued":
			// loading screen 1 hides
			break;
		case "stage3_slotOccupied":
			console.log('hello??')
			// loaderStep1.style.display = "none";
			// loaderStep2.style.visibility = "visible";
			break;
		case "stage4_playBtnShowedUp":
			//loading screen 2 hides
			loaderStep2.style.visibility = "hidden";
			iframeElem.style.visibility = "visible";
			loaderStep3.style.visibility = "visible";
			// let playButton = document.getElementById("playButtonParent");
			// playButton.click();
			// onPlayBtnPressed();
			break;
		case "stage5_playBtnPressed":
			// Hide first loader
			$(loaderStep1).fadeOut(1000)
			// Show the header
			const playerWrapper = document.getElementsByTagName('body')[0]
			playerWrapper.classList.add('playing')

			showInstructions();
			// Show the play button
			setTimeout( function () {
				$(loaderStep2).addClass('loaded')
			}, 800)

			// Show the virtual tour
			iframeElem.style.visibility = "visible";
			$('#iframe_1').focus();

			// Hide the virtual tour settings button
			// const bottomPanel = $('#e3ds_bottom_panelObj')
			// console.log(bottomPanel)
			// $(bottomPanel).hide();
			break;
		case "_focus":
			document.getElementById("iframe_1").focus();
			hideInstructions()
			break;
		case "isIframe":
			let obj = {
				cmd: 'isIframe',
				value: true
			};
			sendToMainPage(obj);
			break;

		case "QueueNumberUpdated":
			console.log("QueueNumberUpdated. New queuePosition: : " +  event.data.queuePosition)
			break;

		case "stage3_1_AppAcquiringProgress":
			console.log("stage3_1_AppAcquiringProgress percent: " + JSON.stringify( event.data.percent))
			break;

		case "stage3_2_AppPreparationProgress":
			console.log("stage3_2_AppPreparationProgress percent:" + JSON.stringify( event.data.percent))
			break;
		case "shortCuts":
			console.log("Key pressed");
			break;
		default:
			console.error("Unhandled message data type");
			break;
	}
}

window.addEventListener('message', messageHandler);

window.addEventListener('message', (message) => {
	if (message.data.type === '_focus') {
		document.getElementById("iframe_1").focus();
	}
})

window.addEventListener("load", function() {
	checkRatio();
})

window.addEventListener("resize", function() {
	checkRatio()
})

const showInstructions = showClose => {
	const instructions = document.getElementById('instructions-container')
	instructions.classList.add('visible')

	const helpButton = document.getElementById('help-button')
	helpButton.style.display = 'none'
}

const hideInstructions = () => {
	const instructions = document.getElementById('instructions-container')
	instructions.classList.remove('visible')

	const helpButton = document.getElementById('help-button')
	helpButton.style.display = 'flex'
}

function checkRatio() {
	const windowRatio = $(window).width() / $(window).height()
	const videoRatio = 16/9
	if ( windowRatio < videoRatio ) {
		if ( !$('body').hasClass('portrait') ) {
			console.log('portrait?')
			$('body').addClass('portrait')
		}
	} else {
		if ( $('body').hasClass('portrait') ) {
			$('body').removeClass('portrait')
		}
	}
	console.log(windowRatio, videoRatio)
}

function onPlayBtnPressed() {
	let loaderStep2 = document.getElementById("loaderStep2")
	loaderStep2.style.visibility = "hidden";
	let loaderStep3 = document.getElementById("loaderStep3")
	loaderStep3.style.visibility = "hidden";
	let eleBanner = document.getElementById("iframe_1")
	eleBanner.style.visibility = "visible";
}

function sendToMainPage(obj) {
	let origin = "*"
	let myIframe = document.getElementById("iframe_1");
	myIframe.contentWindow.postMessage(JSON.stringify(obj), origin);
}

function switchTo(val) {
	console.log("=== Registered switchTo action, Value is: ", val);

	let descriptor = {
		Teleport: val
	};
	//emitUIInteraction(descriptor);
	let obj ={
			cmd: "sendToUe4",
			value: descriptor,
	};
	sendToMainPage(obj)
}

let isFullScreen = false

function goToFullScreen() {
	var cmd = isFullScreen ? "Off" : "On";
	isFullScreen = !isFullScreen;
	console.log("=== Registered full screen action, Value is: ", cmd);
	let descriptor = {
		FullScreen: cmd
	};
	//emitUIInteraction(descriptor);
	let obj =
		{
			cmd: "sendToUe4",
			value: descriptor,
		}
	sendToMainPage(obj)
}