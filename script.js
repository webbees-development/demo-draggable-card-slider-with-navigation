// ------ Overall Variables ------ //
const carousel = document.querySelector(".carousel");
const wrapper = document.querySelector(".wrapper");

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
function getNextSlideScrollPos(currentScrollPos) {
    for (let step in steps) {
        if (steps[step] > currentScrollPos) {
            return steps[step];
        }
    };
}

// function to get prev slide position
function getPrevSlideScrollPos(currentScrollPos) {
    for (let step in steps) {
        if (steps[step] >= currentScrollPos) {
            return steps[step - 1];
        }
    };
    return steps[0];
}

// function to get closest snap position
function getClosestSlideScrollPos(currentScrollPos) {
    if (currentScrollPos <= steps[0]) {
        return steps[0];
    }

    for (let step in steps) {
        if (steps[step] >= currentScrollPos) {
            if (steps[step] - currentScrollPos < currentScrollPos - steps[step - 1]) {
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
let startScrollLeft = 0;

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
        startScrollLeft = carousel.scrollLeft;
    }
}

function handleMoveDrag(event) {
    // event.preventDefault();
    if (!isDragging) return;
    carousel.scrollLeft = startScrollLeft + startMousePos - (event.pageX ? event.pageX : event.changedTouches[0].pageX);
}

function handleStopDrag(event) {
    // event.preventDefault();
    if (!isDragging) return;
    isDragging = false;
    snapToClosestScrollPos(startScrollLeft + startMousePos - (event.pageX ? event.pageX : event.changedTouches[0].pageX));
}

function snapToClosestScrollPos(currentScrollPos) {
    const nextScrollPos = getClosestSlideScrollPos(currentScrollPos);
    carousel.scrollTo({ left: nextScrollPos, behavior: 'smooth' });

    if (nextScrollPos === steps[0]) {
        prevButton.classList.remove("show");
        prevButton.classList.add("hide");
    } else {
        prevButton.classList.remove("hide");
        prevButton.classList.add("show");
    }
    if (nextScrollPos === steps[steps.length - 1]){
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
    const prevScrollPos = carousel.scrollLeft;
    const nextScrollPos = getNextSlideScrollPos(carousel.scrollLeft);
    carousel.scrollTo({ left: nextScrollPos, behavior: 'smooth' });

    if (prevScrollPos === steps[0]){
        prevButton.classList.remove("hide");
        prevButton.classList.add("show");
    }

    if (nextScrollPos === steps[steps.length - 1]){
        nextButton.classList.remove("show");
        nextButton.classList.add("hide");
    } 
});

prevButton.addEventListener("click", () => {
    const prevScrollPos = carousel.scrollLeft;
    const nextScrollPos = getPrevSlideScrollPos(carousel.scrollLeft);
    carousel.scrollTo({ left: nextScrollPos, behavior: 'smooth' });

    if (prevScrollPos === steps[steps.length - 1]){
        nextButton.classList.remove("hide");
        nextButton.classList.add("show");
    }

    if (nextScrollPos === steps[0]) {
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