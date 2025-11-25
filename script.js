let courses = [];
let taken = [];

// Load JSON data
fetch("data.json")
    .then(r => r.json())
    .then(data => {
        courses = data;
        buildAllCourses();
        updateAvailableCourses(); // NEW — show availability immediately
    });

// Create all course boxes dynamically
function buildAllCourses() {
    const container = document.getElementById("allCourses");
    container.innerHTML = "";

    courses.forEach(course => {
        const div = document.createElement("div");
        div.className = "courseBox";
        div.textContent = course.code;
        div.draggable = true;
        div.dataset.code = course.code;

        // Click to view info
        div.addEventListener("click", () => showCourseInfo(course));

        // Drag start
        div.addEventListener("dragstart", evt => {
            evt.dataTransfer.setData("code", course.code);
        });

        container.appendChild(div);
    });
}

// Show course details
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
        updateAvailableCourses(); // update eligibility
        updateAllCourseColors();  // NEW — visually disable unavailable courses
    }
});

// Display taken courses
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

// ---- PREREQUISITE CHECKER (NEW + FIXED) ----
function canTake(course) {
    // If no prerequisites → always allowed
    if (!course.prereq || course.prereq.length === 0) return true;

    // All listed prerequisites must be in "taken"
    return course.prereq.every(req => taken.includes(req));
}

// ---- Show ONLY the eligible courses ----
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

// ---- NEW: Grey out “all courses” that are NOT eligible ----
function updateAllCourseColors() {
    document.querySelectorAll("#allCourses .courseBox").forEach(div => {
        const code = div.dataset.code;
        const course = courses.find(c => c.code === code);

        if (taken.includes(code)) {
            // Already taken
            div.style.opacity = "0.4";
            div.style.border = "2px solid green";
        } 
        else if (!canTake(course)) {
            // Not eligible yet
            div.style.opacity = "0.3";
            div.style.pointerEvents = "none";
        } 
        else {
            // Eligible
            div.style.opacity = "1";
            div.style.pointerEvents = "auto";
        }
    });
}
