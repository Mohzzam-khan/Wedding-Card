const invitation = document.querySelector("#invitation");
const details = document.querySelector("#details");
const envelopeScreen = document.querySelector("#envelope-screen");
const envelope = document.querySelector("#envelope");
const tapToOpen = document.querySelector("#tap-to-open");
const envelopeVideo = document.querySelector("#envelope-video");
const backgroundVideo = document.querySelector("#vid");
const scratchHeart = document.querySelector("#scratch-heart");
const scratchCanvas = scratchHeart.querySelector("canvas");
const scratchContext = scratchCanvas.getContext("2d", { willReadFrequently: true });
const carousel = document.querySelector("#photo-carousel");
const carouselSlides = [...carousel.querySelectorAll(".carousel-slide")];
const saveDateButton = document.querySelector("#save-date-button");
const countdownTarget = new Date("2027-01-26T19:30:00+05:30").getTime();
const countdownUnits = {
	days: document.querySelector("#countdown-days"),
	hours: document.querySelector("#countdown-hours"),
	minutes: document.querySelector("#countdown-minutes"),
	seconds: document.querySelector("#countdown-seconds")
};
let hasStartedInvitationTransition = false;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const setupVideo = (video) => {
	if (!video || !video.dataset.src || video.dataset.loaded === "true") {
		return;
	}

	video.muted = true;
	video.playsInline = true;
	video.setAttribute("playsinline", "true");
	video.setAttribute("webkit-playsinline", "true");
	video.preload = "metadata";
	video.src = video.dataset.src;
	video.load();
	video.dataset.loaded = "true";
};

const updateCountdown = () => {
	const remainingTime = Math.max(countdownTarget - Date.now(), 0);
	const totalSeconds = Math.floor(remainingTime / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	countdownUnits.days.textContent = days;
	countdownUnits.hours.textContent = String(hours).padStart(2, "0");
	countdownUnits.minutes.textContent = String(minutes).padStart(2, "0");
	countdownUnits.seconds.textContent = String(seconds).padStart(2, "0");
};

setupVideo(envelopeVideo);

const primeEnvelopePreview = () => {
	if (!envelopeVideo) {
		return;
	}

	envelopeVideo.muted = true;
	envelopeVideo.playsInline = true;
	envelopeVideo.currentTime = 0;
	envelopeVideo.play().then(() => {
		window.requestAnimationFrame(() => {
			envelopeVideo.pause();
			envelopeVideo.currentTime = 0;
		});
	}).catch(() => {});
};

if (envelopeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
	primeEnvelopePreview();
} else {
	envelopeVideo.addEventListener("loadeddata", primeEnvelopePreview, { once: true });
}

updateCountdown();
let countdownTimer;

const startCountdownTimer = () => {
	window.clearInterval(countdownTimer);
	updateCountdown();
	if (!document.hidden) {
		countdownTimer = window.setInterval(updateCountdown, 1000);
	}
};

let activeCarouselIndex = 0;
let carouselTimer;
let isCarouselVisible = false;

const showCarouselSlide = (index) => {
	activeCarouselIndex = index;
	carouselSlides.forEach((slide, slideIndex) => {
		const isActive = slideIndex === activeCarouselIndex;
		slide.classList.toggle("is-active", isActive);
		slide.setAttribute("aria-hidden", String(!isActive));
	});
};

const startCarouselTimer = () => {
	window.clearInterval(carouselTimer);
	if (reducedMotionQuery.matches || document.hidden || !isCarouselVisible) {
		return;
	}
	carouselTimer = window.setInterval(() => {
		showCarouselSlide((activeCarouselIndex + 1) % carouselSlides.length);
	}, 3000);
};

carousel.addEventListener("mouseenter", () => window.clearInterval(carouselTimer));
carousel.addEventListener("mouseleave", startCarouselTimer);
const carouselObserver = new IntersectionObserver((entries) => {
	isCarouselVisible = entries[0].isIntersecting;
	if (isCarouselVisible) {
		startCarouselTimer();
	} else {
		window.clearInterval(carouselTimer);
	}
}, { threshold: 0.15 });
carouselObserver.observe(carousel);

document.addEventListener("visibilitychange", () => {
	startCountdownTimer();
	if (document.hidden) {
		window.clearInterval(carouselTimer);
	} else {
		startCarouselTimer();
	}
});
reducedMotionQuery.addEventListener("change", startCarouselTimer);
startCountdownTimer();

const startInvitationTransition = () => {
	if (hasStartedInvitationTransition) {
		return;
	}

	hasStartedInvitationTransition = true;
	window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	document.body.classList.add("invitation-open");
	document.body.classList.add("overlay-ready");
	setupVideo(backgroundVideo);
	backgroundVideo.currentTime = 0;
	backgroundVideo.play().catch(() => {});
	envelopeScreen.classList.add("is-opening");
	window.setTimeout(() => envelopeScreen.classList.add("is-open"), 700);
};

envelope.addEventListener("click", () => {
	if (tapToOpen) {
		tapToOpen.classList.add("is-hidden");
	}
	envelope.disabled = true;
	setupVideo(envelopeVideo);
	envelopeVideo.currentTime = 0;
	envelopeVideo.play().then(() => {
		envelopeScreen.classList.add("is-playing");
	}).catch(startInvitationTransition);
});

envelopeVideo.addEventListener("timeupdate", () => {
	const remainingTime = envelopeVideo.duration - envelopeVideo.currentTime;
	if (Number.isFinite(remainingTime) && remainingTime <= 0.7) {
		startInvitationTransition();
	}
});
envelopeVideo.addEventListener("ended", startInvitationTransition);
envelopeVideo.addEventListener("error", startInvitationTransition);
backgroundVideo.addEventListener("ended", () => backgroundVideo.pause());

const drawScratchHeart = () => {
	scratchContext.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
	scratchContext.save();
	scratchContext.scale(scratchCanvas.width / 180, scratchCanvas.height / 160);
	scratchContext.beginPath();
	scratchContext.moveTo(90, 148);
	scratchContext.bezierCurveTo(76, 133, 18, 97, 18, 54);
	scratchContext.bezierCurveTo(18, 17, 63, 5, 90, 38);
	scratchContext.bezierCurveTo(117, 5, 162, 17, 162, 54);
	scratchContext.bezierCurveTo(162, 97, 104, 133, 90, 148);
	scratchContext.closePath();
	const heartGradient = scratchContext.createRadialGradient(84, 58, 8, 92, 82, 105);
	heartGradient.addColorStop(0, "#fff7f0");
	heartGradient.addColorStop(0.22, "#F8EDEF");
	heartGradient.addColorStop(0.52, "#d58c99");
	heartGradient.addColorStop(0.82, "#A8324A");
	heartGradient.addColorStop(1, "#84263B");
	scratchContext.fillStyle = heartGradient;
	scratchContext.fill();

	scratchContext.clip();
	const glitterGradient = scratchContext.createLinearGradient(20, 30, 160, 125);
	glitterGradient.addColorStop(0, "rgba(255, 247, 240, 0.78)");
	glitterGradient.addColorStop(0.45, "rgba(248, 237, 239, 0.08)");
	glitterGradient.addColorStop(1, "rgba(248, 237, 239, 0.38)");
	scratchContext.fillStyle = glitterGradient;
	scratchContext.fillRect(0, 0, 180, 160);

	let seed = 47;
	const random = () => {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	};

	for (let index = 0; index < 230; index += 1) {
		const sparkleX = random() * 180;
		const sparkleY = random() * 150;
		const sparkleSize = random() > 0.9 ? 1.5 : random() * 0.9 + 0.25;
		scratchContext.beginPath();
		scratchContext.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
		scratchContext.fillStyle = random() > 0.2 ? "rgba(255, 247, 240, 0.82)" : "rgba(213, 140, 153, 0.92)";
		scratchContext.fill();
	}

	scratchContext.restore();
};

let isScratching = false;
let scratchStartX = 0;
let scratchStartY = 0;
let heartPixels = 0;
let scratchCheckFrame = 0;

const getCoveredPixels = () => {
	const pixels = scratchContext.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
	let coveredPixels = 0;

	for (let index = 3; index < pixels.length; index += 4) {
		if (pixels[index] > 0) {
			coveredPixels += 1;
		}
	}

	return coveredPixels;
};

const scratchAt = (clientX, clientY) => {
	const bounds = scratchCanvas.getBoundingClientRect();
	const x = (clientX - bounds.left) * (scratchCanvas.width / bounds.width);
	const y = (clientY - bounds.top) * (scratchCanvas.height / bounds.height);

	scratchContext.globalCompositeOperation = "destination-out";
	scratchContext.beginPath();
	scratchContext.arc(x, y, 13, 0, Math.PI * 2);
	scratchContext.fill();
	scheduleRevealCheck();
};

const updateRevealState = () => {
	scratchCheckFrame = 0;
	const erasedPercentage = 1 - getCoveredPixels() / heartPixels;
	if (erasedPercentage >= 0.5) {
		scratchHeart.classList.add("is-revealed");
	}
};

const scheduleRevealCheck = () => {
	if (!scratchCheckFrame && !scratchHeart.classList.contains("is-revealed")) {
		scratchCheckFrame = window.requestAnimationFrame(updateRevealState);
	}
};

const beginScratch = (event, clientX, clientY) => {
	if (!isScratching) {
		isScratching = true;
	}
	if (event && typeof event.preventDefault === "function") {
		event.preventDefault();
	}
	if (event && typeof event.pointerId === "number" && scratchHeart.setPointerCapture) {
		scratchHeart.setPointerCapture(event.pointerId);
	}
	scratchAt(clientX, clientY);
};

const endScratch = (event) => {
	isScratching = false;
	if (event && typeof event.pointerId === "number" && scratchHeart.hasPointerCapture && scratchHeart.hasPointerCapture(event.pointerId)) {
		scratchHeart.releasePointerCapture(event.pointerId);
	}
};

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const updateScrollState = () => {
	const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
	const scrollProgress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
	const detailsTop = details.getBoundingClientRect().top;
	const detailsProgress = clamp((window.innerHeight - detailsTop) / (window.innerHeight * 0.65), 0, 1);
	const isOverlapped = detailsTop < window.innerHeight * 0.85;

	details.style.setProperty("--text-progress", detailsProgress);
	details.style.setProperty("--text-blur", `${(1 - detailsProgress) * 0.45}rem`);
	invitation.classList.toggle("is-overlapped", isOverlapped);
	details.classList.toggle("is-visible", detailsTop < window.innerHeight * 0.9);
};

let scrollFrame;
const scheduleScrollUpdate = () => {
	if (!scrollFrame) {
		scrollFrame = window.requestAnimationFrame(() => {
			scrollFrame = 0;
			updateScrollState();
		});
	}
};
window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

drawScratchHeart();
heartPixels = getCoveredPixels();

scratchHeart.addEventListener("pointerdown", (event) => {
	if (!event.isPrimary) {
		return;
	}
	scratchStartX = event.clientX;
	scratchStartY = event.clientY;
	isScratching = false;
	if (scratchHeart.setPointerCapture) {
		scratchHeart.setPointerCapture(event.pointerId);
	}
});
scratchHeart.addEventListener("pointermove", (event) => {
	if (!event.isPrimary) {
		return;
	}
	const movedEnoughToScratch = Math.hypot(event.clientX - scratchStartX, event.clientY - scratchStartY) > 8;

	if (movedEnoughToScratch && !isScratching) {
		beginScratch(event, event.clientX, event.clientY);
		return;
	}

	if (isScratching) {
		beginScratch(event, event.clientX, event.clientY);
	}
});
scratchHeart.addEventListener("pointerup", (event) => {
	updateRevealState();
	endScratch(event);
});
scratchHeart.addEventListener("pointercancel", endScratch);

saveDateButton.addEventListener("click", () => {
	const calendarEvent = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Mubina and Zaid//Wedding Invitation//EN",
		"BEGIN:VEVENT",
		"UID:mubina-zaid-wedding-20270126@invitation",
		"DTSTAMP:20260101T000000Z",
		"DTSTART:20270126T140000Z",
		"DTEND:20270126T163000Z",
		"SUMMARY:Mubina and Zaid's Wedding",
		"LOCATION:Mannat Banquets\\, Shed No 119 A and 120-A\\, Dr Mascarenhas Rd\\, Mazgaon\\, Mumbai\\, Maharashtra 400010",
		"DESCRIPTION:Join us as we celebrate Mubina and Zaid's wedding.",
		"END:VEVENT",
		"END:VCALENDAR"
	].join("\\r\\n");
	const calendarUrl = URL.createObjectURL(new Blob([calendarEvent], { type: "text/calendar;charset=utf-8" }));
	const calendarLink = document.createElement("a");
	calendarLink.href = calendarUrl;
	calendarLink.download = "mubina-and-zaid-wedding.ics";
	document.body.append(calendarLink);
	calendarLink.click();
	calendarLink.remove();
	window.setTimeout(() => URL.revokeObjectURL(calendarUrl), 1000);
});
