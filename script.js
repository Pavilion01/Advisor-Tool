let courses = [];
let taken = [];

// Load JSON data
fetch("data.json")
    .then(r => r.json())
    .then(data => {
        courses = data;
        buildAllCourses();
        updateAvailableCourses();
    });

// Build all courses
function buildAllCourses() {
    const container = document.getElementById("allCourses");
    container.innerHTML = "";

    courses.forEach(course => {
        const div = document.createElement("div");
        div.className = "courseBox";
        div.textContent = course.code;
        div.draggable = true;
        div.dataset.code = course.code;

        div.addEventListener("click", () => showCourseInfo(course));

        div.addEventListener("dragstart", evt => {
            evt.dataTransfer.setData("code", course.code);
        });

        container.appendChild(div);
    });
}

// Show course info
function showCourseInfo(course) {
    document.getElementById("courseInfo").innerHTML = `
        <h3>${course.code} — ${course.name}</h3>
        <p><strong>Prerequisites:</strong> ${course.prereq.length > 0 ? course.prereq.join(", ") : "None"}</p>
        <p><strong>Notes:</strong> ${course.notes}</p>
    `;
}

// Make "taken" droppable
const takenBox = document.getElementById("taken");

takenBox.addEventListener("dragover", evt => evt.preventDefault());

takenBox.addEventListener("drop", evt => {
    evt.preventDefault();
    const code = evt.dataTransfer.getData("code");

    if (!taken.includes(code)) {
        taken.push(code);
        updateTakenList();
        updateAvailableCourses();
        updateAllCourseColors();  
    }
});

// Update taken list
function updateTakenList() {
    const container = document.getElementById("taken");
    container.innerHTML = "";

    taken.forEach(code => {
        const div = document.createElement("div");
        div.className = "courseBox";
        div.textContent = code;
        container.appendChild(div);
    });
}

// Prerequisite checker
function canTake(course) {
    if (!course.prereq || course.prereq.length === 0) return true;
    return course.prereq.every(req => taken.includes(req));
}

// Show *only* eligible courses
function updateAvailableCourses() {
    const container = document.getElementById("available");
    container.innerHTML = "";

    courses.forEach(course => {
        if (!taken.includes(course.code) && canTake(course)) {
            const div = document.createElement("div");
            div.className = "courseBox availableBox";
            div.textContent = course.code;
            div.addEventListener("click", () => showCourseInfo(course));
            container.appendChild(div);
        }
    });
}

// Grey-out or enable courses based on prerequisites
function updateAllCourseColors() {
    document.querySelectorAll("#allCourses .courseBox").forEach(div => {
        const code = div.dataset.code;
        const course = courses.find(c => c.code === code);

        if (taken.includes(code)) {
            div.style.opacity = "0.4";
            div.style.border = "2px solid green";
        } 
        else if (!canTake(course)) {
            div.style.opacity = "0.3";
            div.style.pointerEvents = "none";
        } 
        else {
            div.style.opacity = "1";
            div.style.pointerEvents = "auto";
        }
    });
}
