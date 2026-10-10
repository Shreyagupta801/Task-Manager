const taskInput = document.querySelector("#taskInput");
const addBtn = document.querySelector("#addTaskBtn");
const priorityInput = document.querySelector("#priorityInput");
const categoryInput = document.querySelector("#categoryInput");
const taskList = document.querySelector("#taskList");

const totalTasks = document.querySelector("#totalTasks");
const completedTasks = document.querySelector("#completedTasks");
const pendingTasks = document.querySelector("#pendingTasks");
const completionRate = document.querySelector("#completionRate");

const progressText = document.querySelector("#progressText");
const progressFill = document.querySelector("#progressFill");
const filterButtons = document.querySelectorAll(".filter-btn");

const timerDisplay = document.querySelector("#timerDisplay");
const startTimer = document.querySelector("#startTimer");
const resetTimer = document.querySelector("#resetTimer");

let tasks = JSON.parse(localStorage.getItem("dailyTasks")) || [];
let currentFilter = "all";

let timerSeconds = 25 * 60;
let timerInterval = null;

// Save tasks in Local Storage
function saveTasks() {
    localStorage.setItem("dailyTasks", JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const taskName = taskInput.value.trim();

    if (taskName === "") {
        alert("Please enter a task!");
        return;
    }

    const task = {
        id: Date.now(),
        name: taskName,
        priority: priorityInput.value,
        category: categoryInput.value,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();

    taskInput.value = "";
}

// Display tasks on the page
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function (task) {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task!"
            : "No tasks found in this filter.";

        taskList.appendChild(emptyMessage);
    }

    filteredTasks.forEach(function (task) {
        const taskElement = document.createElement("div");
        taskElement.className = "task-item";

        if (task.completed) {
            taskElement.classList.add("completed");
        }

        const taskDetails = document.createElement("div");
        taskDetails.className = "task-details";

        const taskTitle = document.createElement("h3");
        taskTitle.textContent = task.name;

        const taskInfo = document.createElement("p");
        taskInfo.textContent =
            "Priority: " + task.priority +
            " | Category: " + task.category;

        taskDetails.append(taskTitle, taskInfo);

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeBtn.addEventListener("click", function () {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

        const taskActions = document.createElement("div");
        taskActions.className = "task-actions";
        taskActions.append(completeBtn, deleteBtn);

        taskElement.append(taskDetails, taskActions);
        taskList.appendChild(taskElement);
    });

    updateStats();
}

// Update task statistics and progress
function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    const rate = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    completionRate.textContent = rate + "%";

    progressText.textContent = rate + "% completed";
    progressFill.style.width = rate + "%";

    const progressBar = document.querySelector(".progress-bar");

    if (progressBar) {
        progressBar.setAttribute("aria-valuenow", rate);
    }
}

// Add button click
addBtn.addEventListener("click", addTask);

// Press Enter to add a task
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// Filter tasks
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});
  
startTimer.addEventListener("click", function () {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTimer.textContent = "Resume";
        return;
    }

    startTimer.textContent = "Pause";

    timerInterval = setInterval(function () {
        if (timerSeconds > 0) {
            timerSeconds--;

            const minutes = Math.floor(timerSeconds / 60);
            const seconds = timerSeconds % 60;

            timerDisplay.textContent =
                String(minutes).padStart(2, "0") + ":" +
                String(seconds).padStart(2, "0");
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimer.textContent = "Start";
            alert("Focus session completed!");
        }
    }, 1000);

    // Reset the focus timer
resetTimer.addEventListener("click", function () {
    clearInterval(timerInterval);

    timerInterval = null;
    timerSeconds = 25 * 60;

    timerDisplay.textContent = "25:00";
    startTimer.textContent = "Start";
});
});
// Load saved tasks when the page opens
renderTasks();