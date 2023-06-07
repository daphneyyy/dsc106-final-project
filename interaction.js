function showSection(sectionId) {
    var section = document.getElementById(sectionId);
    section.style.opacity = "1";
}

function hideSection(sectionId) {
    var section = document.getElementById(sectionId);
    section.style.opacity = "0";
}

function smoothScroll(targetId) {
    var target = document.getElementById(targetId);
    var targetPosition = target.offsetTop;
    var startPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    var distance = targetPosition - startPosition;
    var duration = 800;
    var startTimestamp = null;

    function scrollStep(timestamp) {
        if (!startTimestamp) {
            startTimestamp = timestamp;
        }
        var progress = timestamp - startTimestamp;
        var scrollAmount = Math.easeInOutQuad(progress, startPosition, distance, duration);
        window.scrollTo(0, scrollAmount);
        if (progress < duration) {
            window.requestAnimationFrame(scrollStep);
        }
    }
    window.requestAnimationFrame(scrollStep);
}

Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

window.addEventListener("scroll", function () {
    var scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    var salaryPosition = document.getElementById("salary").offsetTop;
    var regionPosition = document.getElementById("region").offsetTop;
    var scrollThreshold = window.innerHeight / 2;
    if (scrollPosition >= 0 && scrollPosition < salaryPosition - scrollThreshold) {
        showSection("remote");
        hideSection("salary");
        hideSection("region");
    } else if (scrollPosition >= salaryPosition - scrollThreshold && scrollPosition < regionPosition - scrollThreshold) {
        hideSection("remote");
        showSection("salary");
        hideSection("region");
    } else if (scrollPosition >= regionPosition - scrollThreshold) {
        hideSection("remote");
        hideSection("salary");
        showSection("region");
    }
});