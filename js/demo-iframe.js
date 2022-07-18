let iFrame, loaderStep1, loaderStep2, loaderStep3, resetIframeLoader, playerWrapper = ''

let isReloadingIframe = false;

const iframes = {
	mobile: 'https://connector.eagle3dstreaming.com/v5/RedLeaf/HY50Office_NE/RedLeafStandard_Mobile',
	desktop: 'https://connector.eagle3dstreaming.com/v5/RedLeaf/HY50Office_NE/RedLeafStandard'
}

window.addEventListener('load', function () {
	// Set element vars
	playerWrapper = document.getElementsByTagName('body')[0]
	loaderStep1 = document.getElementById("loaderStep1");
	console.log(loaderStep1);
	loaderStep2 = document.getElementById("loaderStep2");
	loaderStep3 = document.getElementById("loaderStep3");
	resetIframeLoader = document.getElementById("resetIframeLoader")
	iFrame = document.getElementById("iframe_1");

	const playButton = document.getElementById('play-button')

	playButton.addEventListener('click', function () {
		$(loaderStep2).fadeOut(1000)
		hideInstructions()
	})

	const helpButton = document.getElementById('help-button')

	helpButton.addEventListener('click', function (e) {
		e.preventDefault();
		showInstructions(true);
	})

	checkScreenSize('load');
})

const messageHandler = (event) => {
	if(!event.data.type) return;

	console.log('event', event)
	console.log("received data event type " + event.data.type)
	switch (event.data.type) {
		case "ResponseFromUE4":
			console.log("UE4->iframe: " + event.data.descriptor)
			myHandleResponseFunction(event.data.descriptor);
			break;
		case "stage1_inqueued":
			// If switching iframe src, don't show loaders again
			if ( isReloadingIframe ) return
			loaderStep1.style.visibility = "visible";
			break;
		case "stage2_deQueued":
			// loading screen 1 hides
			break;
		case "stage3_slotOccupied":
			// loaderStep1.style.display = "none";
			// loaderStep2.style.visibility = "visible";
			break;
		case "stage4_playBtnShowedUp":
			//loading screen 2 hides
			loaderStep2.style.visibility = "hidden";
			iFrame.style.visibility = "visible";

			// If switching iframe src, don't show loaders again
			if ( isReloadingIframe ) return

			loaderStep3.style.visibility = "visible";
			// let playButton = document.getElementById("playButtonParent");
			// playButton.click();
			// onPlayBtnPressed();
			break;
		case "stage5_playBtnPressed":
			// hide reset loader if visible
			if ( $(resetIframeLoader).is(':visible') ) {
				$(resetIframeLoader).fadeOut()
			}
			$(iFrame).focus();

			// If switching iframe src, don't show loaders again
			if ( isReloadingIframe ) return

			// Hide first loader
			$(loaderStep1).fadeOut(1000)
			// Show the header

			playerWrapper.classList.add('playing')

			showInstructions();
			// Show the play button
			setTimeout( function () {
				loaderStep2.classList.add('loaded')
			}, 800)

			// Show the virtual tour
			iFrame.style.visibility = "visible";

			break;
		case "_focus":
			$(iFrame).focus();
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
		$(iFrame).focus();
	}
})

window.addEventListener("resize", function() {
	checkScreenSize('resize')
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

const checkScreenSize = referrer => {
	const windowWidth = $(window).width()
	const windowRatio = windowWidth / $(window).height()
	const videoRatio = 16/9
	if ( windowWidth > 1024 ) {
		if ( iFrame.src !== iframes.desktop ) {
			switchIframe('desktop', referrer)
		}
		if ( windowRatio <= videoRatio ) {
			$('body').addClass('portrait')
		} else {
			$('body').removeClass('portrait')
		}
	} else {
		if ( iFrame.src !== iframes.mobile ) {
			switchIframe('mobile', referrer)
		}
	}
}

const switchIframe = (layout, referrer) => {
	if ( referrer === 'resize' ) {
		isReloadingIframe = true
		resetIframeLoader.style.display = "flex";
	}
	iFrame.src = iframes[layout]
}

const onPlayBtnPressed = () => {
	loaderStep2.style.visibility = "hidden";
	loaderStep3.style.visibility = "hidden";
	iFrame.style.visibility = "visible";
}

function sendToMainPage(obj) {
	let origin = "*"
	iFrame.contentWindow.postMessage(JSON.stringify(obj), origin);
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
