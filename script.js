let courses = [];
let taken = new Set();

// Load JSON
fetch("data.json")
  .then(r => r.json())
  .then(data => {
      // Normalize prerequisites so everything is an array
      courses = data.map(c => ({
          ...c,
          prereq: Array.isArray(c.prereq)
              ? c.prereq
              : c.prereq
                  ? c.prereq.split(",").map(x => x.trim())
                  : []
      }));

      buildAllCourses();
      updateAvailableCourses();
      updateAllCourseColors();
  });

// Build all courses
function buildAllCourses() {
    const box = document.getElementById("allCourses");
    box.innerHTML = "";

    courses.forEach(course => {
        const div = document.createElement("div");
        div.className = "courseBox";
        div.draggable = true;
        div.dataset.code = course.code;
        div.textContent = `${course.code}`;

        div.addEventListener("click", () => showCourseInfo(course));

        div.addEventListener("dragstart", evt => {
            evt.dataTransfer.setData("code", course.code);
        });

        box.appendChild(div);
    });
}

// Show course info
function showCourseInfo(course) {
    document.getElementById("courseInfo").innerHTML = `
        <h3>${course.code} — ${course.name}</h3>
        <p><strong>Prerequisites:</strong> ${course.prereq.length ? course.prereq.join(", ") : "None"}</p>
        <p><strong>Notes:</strong> ${course.notes}</p>
    `;
}

// Taken box drop listeners
const takenBox = document.getElementById("taken");

takenBox.addEventListener("dragover", evt => evt.preventDefault());

takenBox.addEventListener("drop", evt => {
    evt.preventDefault();
    const code = evt.dataTransfer.getData("code");

    if (!taken.has(code)) {
        taken.add(code);
        updateTakenList();
        updateAvailableCourses();
        updateAllCourseColors();
    }
});

// Update taken list
function updateTakenList() {
    const box = document.getElementById("taken");
    box.innerHTML = "";

    taken.forEach(code => {
        const div = document.createElement("div");
        div.className = "courseBox";
        div.textContent = code;
        box.appendChild(div);
    });
}

// Prerequisite checker
function canTake(course) {
    return course.prereq.every(req => taken.has(req));
}

// Update “Courses You Can Take”
function updateAvailableCourses() {
    const box = document.getElementById("available");
    box.innerHTML = "";

    courses.forEach(course => {
        if (!taken.has(course.code) && canTake(course)) {
            const div = document.createElement("div");
            div.className = "courseBox availableBox";
            div.textContent = course.code;
            div.addEventListener("click", () => showCourseInfo(course));
            box.appendChild(div);
        }
    });
}

// Update “All Courses” color state
function updateAllCourseColors() {
    document.querySelectorAll("#allCourses .courseBox").forEach(div => {
        const code = div.dataset.code;
        const course = courses.find(c => c.code === code);

        if (taken.has(code)) {
            div.style.opacity = "0.4";
            div.style.border = "2px solid green";
            div.style.pointerEvents = "auto"; // keep draggable/clickable
        } 
        else if (!canTake(course)) {
            div.style.opacity = "0.4";
            div.style.border = "2px dashed gray";
            div.style.pointerEvents = "auto"; // <-- IMPORTANT FIX
        } 
        else {
            div.style.opacity = "1";
            div.style.border = "2px solid black";
            div.style.pointerEvents = "auto";
        }
    });
}
