// stack overflow thread concerning smooth scroll issues in safari
// https://stackoverflow.com/questions/56011205/is-there-a-safari-equivalent-for-scroll-behavior-smooth

// ------ Overall Variables ------ //
const carousel = document.querySelector(".carousel");

let steps = getSteps();

// calculating the stops for the slider
// so it will snap to specific positions
function getSteps() {
    let local_steps = [0];
    if (isOverflown(carousel)) {
        const slides = document.querySelectorAll(".slide");
        const gap = parseInt(getComputedStyle(slides[1]).getPropertyValue("--gap")) * 16; // rem

        for (let slide in slides) {
            if (local_steps[slide] + slides[slide].clientWidth + gap > carousel.scrollWidth - carousel.clientWidth) break;
            local_steps.push(local_steps[slide] + slides[slide].clientWidth + gap);
        }
    }
    return local_steps;
}

window.addEventListener("resize", () => {
    steps = getSteps();
    snapToClosestScrollPos(carousel.clientLeft);
    initButtonVisibility();
});

// function to get next slide position
function getNextSlidePos(currentPos) {
    for (let step in steps) {
        if (steps[step] > currentPos) {
            return steps[step];
        }
    };
}

// function to get prev slide position
function getPrevSlidePos(currentPos) {
    for (let step in steps) {
        if (steps[step] >= currentPos) {
            return steps[step - 1];
        }
    };
    return steps[0];
}

// function to get closest snap position
function getClosestSlidePos(currentPos) {
    if (currentPos <= steps[0]) {
        return steps[0];
    }

    for (let step in steps) {
        if (steps[step] >= currentPos) {
            if (steps[step] - currentPos < currentPos - steps[step - 1]) {
                return steps[step];
            } else {
                return steps[step - 1];
            }
        } 
    };
    return steps[steps.length - 1];
}


// ------ Drag Function ------ //
let isDragging = false;
let startMousePos = 0;
let startCarouselPos = 0;

carousel.addEventListener("mousedown", handleStartDrag);
carousel.addEventListener("touchstart", handleStartDrag);

carousel.addEventListener("mousemove", handleMoveDrag);
carousel.addEventListener("touchmove", handleMoveDrag);

carousel.addEventListener("mouseup", handleStopDrag);
carousel.addEventListener("touchend", handleStopDrag);

function handleStartDrag(event) {
    if (event.cancelable) {
        event.preventDefault();
        isDragging = true;
        // check if mouse or touch event
        startMousePos = event.pageX ? event.pageX : event.changedTouches[0].pageX;
        startCarouselPos = parseInt(getPosX(carousel));
    }
}

function handleMoveDrag(event) {
    // event.preventDefault();
    if (!isDragging) return;

    const movedValue = rangeMovedValue(Math.round(startCarouselPos + startMousePos - (event.pageX ? event.pageX : event.changedTouches[0].pageX)));
    carousel.setAttribute("style", `transform: translateX(-${movedValue}px) !important;`);
}

function handleStopDrag(event) {
    // event.preventDefault();
    if (!isDragging) return;
    carousel.removeAttribute("style");

    const movedValue = rangeMovedValue(Math.round(startCarouselPos + startMousePos - (event.pageX ? event.pageX : event.changedTouches[0].pageX)));
    carousel.setAttribute("style", `transform: translateX(-${movedValue}px);`);

    isDragging = false;
    snapToClosestScrollPos(movedValue);
}

function snapToClosestScrollPos(currentPos) {
    const nextPos = getClosestSlidePos(currentPos);
    // the next line works in every browser except safari (and maybe IE)
    // carousel.scrollTo({ left: nextScrollPos, behavior: 'smooth' });
    moveX(carousel, currentPos, nextPos);

    if (nextPos === steps[0]) {
        prevButton.classList.remove("show");
        prevButton.classList.add("hide");
    } else {
        prevButton.classList.remove("hide");
        prevButton.classList.add("show");
    }
    if (nextPos === steps[steps.length - 1]){
        nextButton.classList.remove("show");
        nextButton.classList.add("hide");
    } else {
        nextButton.classList.remove("hide");
        nextButton.classList.add("show");
    }
}

// ------ Button Functions ------ //
const nextButton = document.querySelector(".carousel-btn-next");
const prevButton = document.querySelector(".carousel-btn-prev");

initButtonVisibility();

nextButton.addEventListener("click", () => {
    const prevPos = getPosX(carousel);
    const nextPos = getNextSlidePos(prevPos);

    moveX(carousel, prevPos, nextPos);

    if (prevPos === steps[0]){
        prevButton.classList.remove("hide");
        prevButton.classList.add("show");
    }

    if (nextPos === steps[steps.length - 1]){
        nextButton.classList.remove("show");
        nextButton.classList.add("hide");
    } 
});

prevButton.addEventListener("click", () => {
    const prevPos = getPosX(carousel);
    const nextPos = getPrevSlidePos(prevPos);

    moveX(carousel, prevPos, nextPos);

    if (prevPos === steps[steps.length - 1]){
        nextButton.classList.remove("hide");
        nextButton.classList.add("show");
    }

    if (nextPos === steps[0]) {
        prevButton.classList.remove("show");
        prevButton.classList.add("hide");
    }
});

function initButtonVisibility() {
    if (isOverflown(carousel)) {
        nextButton.classList.remove("hide");
        prevButton.classList.remove("hide");
        nextButton.classList.add("show");
        prevButton.classList.add("show");

        // check if the scroll position is on absolute left or right
        // and display buttons appropriately
        if (carousel.scrollLeft === steps[0]) {
            prevButton.classList.remove("show");
            prevButton.classList.add("hide");
        } else if (carousel.scrollLeft === steps[steps.length - 1]){
            nextButton.classList.remove("show");
            nextButton.classList.add("hide");
        } 
    } else {
        nextButton.classList.remove("show");
        prevButton.classList.remove("show");
        nextButton.classList.add("hide");
        prevButton.classList.add("hide");
    }
}

// ------ Utility Functions ------ //
function isOverflown(element) {
    return element.clientWidth < element.scrollWidth || element.clientHeight < element.scrollHeight;
}

function moveX(element, startPosX, endPosX) {
    const animationDuration = 800;
    element.animate(
        [
            { transform: `translateX(-${startPosX}px)` },
            { transform: `translateX(-${endPosX}px)` }
        ], 
        { 
            duration: animationDuration, 
            fill: "forwards" 
        }
    );
}

function getPosX(element) {
    return Math.abs(new WebKitCSSMatrix(window.getComputedStyle(element).transform).m41);
}

function rangeMovedValue(value) {
    if (value > (carousel.scrollWidth - carousel.clientWidth)) {
        return (carousel.scrollWidth - carousel.clientWidth);
    } else if (value < 0) {
        return 0;
    } else {
        return value;
    }
}