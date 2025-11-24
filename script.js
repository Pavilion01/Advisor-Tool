let courses = [];
let taken = [];

// Load JSON data
fetch("data.json")
    .then(r => r.json())
    .then(data => {
        courses = data;
        buildAllCourses();
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
        <p><strong>Prerequisites:</strong> ${JSON.stringify(course.prereq)}</p>
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

// Check if a student can take the course
function canTake(course) {
    // For each prerequisite group
    for (let group of course.prereq) {
        let satisfied = group.some(pr => taken.includes(pr));
        if (!satisfied) return false;
    }
    return true;
}

// Display available courses
function updateAvailableCourses() {
    const container = document.getElementById("available");
    container.innerHTML = "";

    courses.forEach(course => {
        if (!taken.includes(course.code) && canTake(course)) {
            const div = document.createElement("div");
            div.className = "courseBox";
            div.textContent = course.code;
            div.addEventListener("click", () => showCourseInfo(course));
            container.appendChild(div);
        }
    });
}
