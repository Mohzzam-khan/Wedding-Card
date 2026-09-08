const invitation = document.querySelector("#invitation");
const details = document.querySelector("#details");
const envelopeScreen = document.querySelector("#envelope-screen");
const envelope = document.querySelector("#envelope");
const envelopeVideo = document.querySelector("#envelope-video");
const scratchHeart = document.querySelector("#scratch-heart");
const scratchCanvas = scratchHeart.querySelector("canvas");
const scratchContext = scratchCanvas.getContext("2d", { willReadFrequently: true });
const carousel = document.querySelector("#photo-carousel");
const carouselSlides = [...carousel.querySelectorAll(".carousel-slide")];
const countdownTarget = new Date("2027-01-31T07:00:00").getTime();
const countdownUnits = {
	days: document.querySelector("#countdown-days"),
	hours: document.querySelector("#countdown-hours"),
	minutes: document.querySelector("#countdown-minutes"),
	seconds: document.querySelector("#countdown-seconds")
};
let hasStartedInvitationTransition = false;

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

updateCountdown();
window.setInterval(updateCountdown, 1000);

let activeCarouselIndex = 0;
let carouselTimer;

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
	carouselTimer = window.setInterval(() => {
		showCarouselSlide((activeCarouselIndex + 1) % carouselSlides.length);
	}, 3000);
};

carousel.addEventListener("mouseenter", () => window.clearInterval(carouselTimer));
carousel.addEventListener("mouseleave", startCarouselTimer);
startCarouselTimer();

const startInvitationTransition = () => {
	if (hasStartedInvitationTransition) {
		return;
	}

	hasStartedInvitationTransition = true;
	window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	document.body.classList.add("invitation-open");
	envelopeScreen.classList.add("is-opening");
	document.body.classList.add("overlay-ready");
	window.setTimeout(() => envelopeScreen.classList.add("is-open"), 700);
};

envelope.addEventListener("click", () => {
	envelope.disabled = true;
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
let heartPixels = 0;

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

const scratchAt = (event) => {
	const bounds = scratchCanvas.getBoundingClientRect();
	const x = (event.clientX - bounds.left) * (scratchCanvas.width / bounds.width);
	const y = (event.clientY - bounds.top) * (scratchCanvas.height / bounds.height);

	scratchContext.globalCompositeOperation = "destination-out";
	scratchContext.beginPath();
	scratchContext.arc(x, y, 13, 0, Math.PI * 2);
	scratchContext.fill();

	const erasedPercentage = 1 - getCoveredPixels() / heartPixels;
	if (erasedPercentage >= 0.5) {
		scratchHeart.classList.add("is-revealed");
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

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

drawScratchHeart();
heartPixels = getCoveredPixels();
scratchHeart.addEventListener("pointerdown", (event) => {
	isScratching = true;
	scratchHeart.setPointerCapture(event.pointerId);
	scratchAt(event);
});
scratchHeart.addEventListener("pointermove", (event) => {
	if (isScratching) {
		scratchAt(event);
	}
});
scratchHeart.addEventListener("pointerup", () => {
	isScratching = false;
});
scratchHeart.addEventListener("pointercancel", () => {
	isScratching = false;
});
