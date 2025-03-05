document.addEventListener("DOMContentLoaded", () => {
  const taskTitle = document.getElementById("taskTitle");
  const taskDesc = document.getElementById("taskDesc");
  const addTaskBtn = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notificationMessage");

  let tasks = [];

  // Load Tasks dari LocalStorage saat pertama kali halaman dimuat
  function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
    }
    renderTasks();
  }

  // Simpan Tasks ke LocalStorage setelah ada perubahan
  function saveTasksToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Render Tasks
  function renderTasks(filter = "all") {
    taskList.innerHTML = "";
    const isDarkMode = document.body.classList.contains("bg-gray-900");

    tasks.forEach((task, index) => {
      if (filter !== "all" && filter !== task.status) return;

      const li = document.createElement("li");
      li.className = `task-item flex justify-between items-center p-4 rounded-lg shadow 
            ${task.status === "completed" ? "opacity-50" : ""} 
            ${
              isDarkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-300 text-gray-900"
            }`;
      li.setAttribute("draggable", "true");
      li.dataset.index = index;
      li.innerHTML = `
     <div class="flex flex-col sm:flex-row sm:justify-between w-full">
    <!-- Teks -->
    <div class="${
      task.status === "completed" ? "line-through text-gray-400" : ""
    }">
        <h3 class="font-bold break-words w-60">${task.title}</h3>
        <p class="text-sm break-words w-60">${task.desc}</p>
    </div>
    <div class="flex flex-wrap justify-start gap-2 w-full mt-2 sm:mt-0 sm:w-auto sm:justify-end">
        <button class="complete-btn bg-green-500 text-white px-3 py-2 rounded w-[30%] sm:w-auto" data-id="${
          task.id
        }">✔</button>
        <button class="edit-btn bg-yellow-500 text-white px-3 py-2 rounded w-[30%] sm:w-auto" data-id="${
          task.id
        }">✏</button>
        <button class="delete-btn bg-red-500 text-white px-3 py-2 rounded w-[30%] sm:w-auto" data-id="${
          task.id
        }">🗑</button>
    </div>
</div>

        `;

      // Tambahkan event listener untuk drag and drop
      li.addEventListener("dragstart", handleDragStart);
      li.addEventListener("dragover", handleDragOver);
      li.addEventListener("drop", handleDrop);

      taskList.appendChild(li);
    });
  }

  let draggedItem = null;

  function handleDragStart(event) {
    draggedItem = this;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", this.dataset.index);
    setTimeout(() => (this.style.opacity = "0.5"), 0);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event) {
    event.preventDefault();

    const fromIndex = event.dataTransfer.getData("text/plain");
    const toIndex = this.dataset.index;

    if (fromIndex !== toIndex) {
      // Tukar posisi dalam array tasks
      const movedTask = tasks.splice(fromIndex, 1)[0];
      tasks.splice(toIndex, 0, movedTask);

      // Simpan perubahan ke LocalStorage dan render ulang
      saveTasksToLocalStorage();
      renderTasks();
    }

    draggedItem.style.opacity = "1";
  }

  function showNotification(message, type = "success") {
    notificationMessage.textContent = message;
    notification.classList.remove("hidden", "hide");
    notification.classList.add("show");

    if (type === "success") {
      notification.classList.remove("bg-red-500");
      notification.classList.add("bg-green-500");
    } else {
      notification.classList.remove("bg-green-500");
      notification.classList.add("bg-red-500");
    }

    setTimeout(() => {
      notification.classList.add("hide");
      setTimeout(() => notification.classList.add("hidden"), 500);
    }, 3000);
  }

  // Modifikasi Event "Tambah Tugas"
  addTaskBtn.addEventListener("click", () => {
    const title = taskTitle.value.trim();
    const desc = taskDesc.value.trim();

    if (title === "") {
      showNotification("Judul tugas tidak boleh kosong!", "error");
      return;
    }

    const task = {
      id: Date.now(),
      title,
      desc,
      status: "pending",
    };

    tasks.push(task);
    saveTasksToLocalStorage();
    renderTasks();
    showNotification("Tugas berhasil ditambahkan!", "success");

    taskTitle.value = "";
    taskDesc.value = "";
  });

  // Event Delegation (Complete, Edit, Delete)
  taskList.addEventListener("click", handleTaskActions);

  function handleTaskActions(e) {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("complete-btn")) {
      tasks = tasks.map((task) =>
        task.id == id
          ? {
              ...task,
              status: task.status === "completed" ? "pending" : "completed",
            }
          : task
      );
    } else if (e.target.classList.contains("delete-btn")) {
      tasks = tasks.filter((task) => task.id != id);
      showNotification("Tugas berhasil dihapus!", "success");
    }

    saveTasksToLocalStorage();
    renderTasks();
  }

  // Variabel untuk Modal
  const editModal = document.getElementById("editModal");
  const editTitleInput = document.getElementById("editTitle");
  const editDescInput = document.getElementById("editDesc");
  const saveEditBtn = document.getElementById("saveEdit");
  const cancelEditBtn = document.getElementById("cancelEdit");

  let editTaskId = null;

  taskList.addEventListener("click", function (e) {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("edit-btn")) {
      const task = tasks.find((task) => task.id == id);
      if (task) {
        editTaskId = id;
        editTitleInput.value = task.title;
        editDescInput.value = task.desc;
        editModal.classList.remove("hidden");
      }
    }
  });

  saveEditBtn.addEventListener("click", function () {
    if (editTaskId) {
      const task = tasks.find((task) => task.id == editTaskId);
      if (task) {
        task.title = editTitleInput.value.trim();
        task.desc = editDescInput.value.trim();
        saveTasksToLocalStorage();
        renderTasks();
        showNotification("Tugas berhasil diperbarui!", "success");
      }
    }
    editModal.classList.add("hidden");
  });

  cancelEditBtn.addEventListener("click", function () {
    editModal.classList.add("hidden");
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".filter-btn.active").classList.remove("active");
      button.classList.add("active");
      renderTasks(button.dataset.filter);
    });
  });

  renderTasks();
  loadTasksFromLocalStorage();
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleDarkModeBtn = document.getElementById("toggleDarkMode");
  const body = document.body;
  const cards = document.querySelectorAll(".card");
  const inputs = document.querySelectorAll("input, textarea");
  const taskItems = document.querySelectorAll(".task-item");

  function applyLightMode() {
    body.classList.replace("bg-gray-900", "bg-gray-100");
    body.classList.replace("text-white", "text-gray-900");

    cards.forEach((card) => {
      card.classList.replace("bg-gray-800", "bg-white");
      card.classList.add("shadow-md");
    });

    inputs.forEach((input) => {
      input.classList.replace("bg-gray-700", "bg-gray-200");
      input.classList.replace("text-white", "text-gray-900");
      input.classList.replace("border-gray-300", "border-gray-600");
    });

    document.querySelectorAll("#taskList li").forEach((task) => {
      task.classList.replace("bg-gray-700", "bg-gray-300");
      task.classList.replace("text-white", "text-gray-900");
    });

    toggleDarkModeBtn.classList.replace("bg-gray-700", "bg-yellow-300");
    toggleDarkModeBtn.classList.replace(
      "hover:bg-gray-600",
      "hover:bg-yellow-400"
    );
    toggleDarkModeBtn.textContent = "☀️";

    localStorage.setItem("theme", "light");
  }

  function applyDarkMode() {
    body.classList.replace("bg-gray-100", "bg-gray-900");
    body.classList.replace("text-gray-900", "text-white");

    cards.forEach((card) => {
      card.classList.replace("bg-white", "bg-gray-800");
      card.classList.remove("shadow-md");
    });

    inputs.forEach((input) => {
      input.classList.replace("bg-gray-200", "bg-gray-700");
      input.classList.replace("text-gray-900", "text-white");
      input.classList.replace("border-gray-300", "border-gray-600");
    });

    document.querySelectorAll("#taskList li").forEach((task) => {
      task.classList.replace("bg-gray-300", "bg-gray-700");
      task.classList.replace("text-gray-900", "text-white");
    });

    toggleDarkModeBtn.classList.replace("bg-yellow-300", "bg-gray-700");
    toggleDarkModeBtn.classList.replace(
      "hover:bg-yellow-400",
      "hover:bg-gray-600"
    );
    toggleDarkModeBtn.textContent = "🌙";

    localStorage.setItem("theme", "dark");
  }

  if (localStorage.getItem("theme") === "light") {
    applyLightMode();
  } else {
    applyDarkMode();
  }

  // Toggle event listener
  toggleDarkModeBtn.addEventListener("click", function () {
    if (body.classList.contains("bg-gray-900")) {
      applyLightMode();
    } else {
      applyDarkMode();
    }
  });
});
