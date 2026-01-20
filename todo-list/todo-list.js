(() => {
  const STORAGE_KEY = "todo-list-data";
  const THEME_KEY = "site-theme";
  let todos = [];
  let currentFilter = "all";
  let currentTheme = "light";

  const themeData = localStorage.getItem(THEME_KEY);
  if (themeData) {
    try {
      const data = JSON.parse(themeData);
      if (data.theme) currentTheme = data.theme;
    } catch (e) {
      console.warn("Failed to load theme:", e);
    }
  }
  document.documentElement.dataset.bsTheme = currentTheme;

  // Load saved todos from localStorage
  function loadSavedTodos() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (Array.isArray(data.todos)) {
          todos = data.todos;
        }
        if (data.filter) {
          currentFilter = data.filter;
        }
      } catch (e) {
        console.warn("Failed to load saved todo data:", e);
      }
    }
  }

  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.dataset.bsTheme = theme;
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme }));
  }

  setTheme(currentTheme);

  // Save current state to localStorage
  function saveCurrentState() {
    const data = {
      todos: todos,
      filter: currentFilter,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Generate unique ID for todos
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Render todos based on current filter
  function renderTodos() {
    const todoList = document.getElementById("todo-list");
    const emptyState = document.getElementById("empty-state");

    todoList.innerHTML = "";

    const filteredTodos = todos.filter((todo) => {
      switch (currentFilter) {
        case "active":
          return !todo.completed;
        case "completed":
          return todo.completed;
        default:
          return true;
      }
    });

    if (filteredTodos.length === 0) {
      emptyState.classList.remove("d-none");
      return;
    }

    emptyState.classList.add("d-none");

    filteredTodos.forEach((todo) => {
      const todoItem = document.createElement("div");
      todoItem.className = "list-group-item d-flex align-items-center";

      // Create checkbox container
      const checkDiv = document.createElement("div");
      checkDiv.className = "form-check me-3";

      const checkbox = document.createElement("input");
      checkbox.className = "form-check-input";
      checkbox.type = "checkbox";
      checkbox.id = `check-${todo.id}`;
      if (todo.completed) checkbox.checked = true;

      const label = document.createElement("label");
      label.className = "form-check-label";
      label.htmlFor = `check-${todo.id}`;

      checkDiv.appendChild(checkbox);
      checkDiv.appendChild(label);

      // Create text span
      const textSpan = document.createElement("span");
      textSpan.className = `flex-grow-1 ${todo.completed ? "text-decoration-line-through text-muted" : ""}`;
      textSpan.id = `text-${todo.id}`;
      textSpan.textContent = todo.text;

      // Create button group
      const btnGroup = document.createElement("div");
      btnGroup.className = "btn-group btn-group-sm ms-2";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-outline-secondary";
      editBtn.id = `edit-${todo.id}`;
      editBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5H9v-.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
      </svg>`;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-outline-danger";
      deleteBtn.id = `delete-${todo.id}`;
      deleteBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zM6 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 6 5z"/>
      </svg>`;

      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);

      // Assemble todo item
      todoItem.appendChild(checkDiv);
      todoItem.appendChild(textSpan);
      todoItem.appendChild(btnGroup);

      // Add event listeners
      checkbox.addEventListener("change", () => toggleTodo(todo.id));
      editBtn.addEventListener("click", () => startEditTodo(todo.id));
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      todoList.appendChild(todoItem);
    });
  }

  // Add a new todo
  function addTodo(text) {
    if (text.trim() === "") return;

    const newTodo = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    todos.unshift(newTodo);
    saveCurrentState();
    renderTodos();
  }

  // Toggle todo completion
  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveCurrentState();
      renderTodos();
    }
  }

  // Start editing a todo
  function startEditTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const textSpan = document.getElementById(`text-${id}`);
    const originalText = todo.text;

    // Create input element for editing
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "form-control form-control-sm d-inline-block";
    editInput.value = originalText;
    editInput.maxLength = 200;
    editInput.id = `edit-input-${id}`;

    textSpan.innerHTML = "";
    textSpan.appendChild(editInput);

    editInput.focus();
    editInput.select();

    function finishEdit() {
      const newText = editInput.value.trim();
      if (newText !== "" && newText !== originalText) {
        todo.text = newText;
        saveCurrentState();
      }
      renderTodos();
    }

    editInput.addEventListener("blur", finishEdit);
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        finishEdit();
      } else if (e.key === "Escape") {
        renderTodos();
      }
    });
  }

  // Delete a todo
  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveCurrentState();
    renderTodos();
  }

  // Clear completed todos
  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveCurrentState();
    renderTodos();
  }

  // Set filter
  function setFilter(filter) {
    currentFilter = filter;
    saveCurrentState();
    renderTodos();

    // Update radio buttons
    const radioButton = document.getElementById(`filter-${filter}`);
    if (radioButton) {
      radioButton.checked = true;
    }
  }

  // Initialize the app
  function init() {
    loadSavedTodos();

    // Set up event listeners
    document.getElementById("add-todo-btn").addEventListener("click", () => {
      const input = document.getElementById("new-todo-input");
      addTodo(input.value);
      input.value = "";
      input.focus();
    });

    document
      .getElementById("new-todo-input")
      .addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const input = document.getElementById("new-todo-input");
          addTodo(input.value);
          input.value = "";
        }
      });

    document
      .getElementById("filter-all")
      .addEventListener("change", () => setFilter("all"));
    document
      .getElementById("filter-active")
      .addEventListener("change", () => setFilter("active"));
    document
      .getElementById("filter-completed")
      .addEventListener("change", () => setFilter("completed"));

    document
      .getElementById("clear-completed-btn")
      .addEventListener("click", clearCompleted);

    // Set initial filter radio button
    const radioButton = document.getElementById(`filter-${currentFilter}`);
    if (radioButton) {
      radioButton.checked = true;
    }

    renderTodos();
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
