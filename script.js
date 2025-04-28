document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const deadlineInput = document.getElementById('deadline-input');
    const descriptionInput = document.getElementById('description-input');
    const inputContainer = document.getElementById('input-container');
    const fileInput = document.getElementById('file-input');
    const taskList = document.getElementById('task-list');
    const tasksCounter = document.getElementById('tasks-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const showFormBtn = document.getElementById('show-form-btn');
    
    let tasks = [];


    showFormBtn.addEventListener('click', toggleInputContainer);

    function toggleInputContainer() {
      inputContainer.classList.toggle('hidden');
      showFormBtn.classList.toggle('hidden');
    }
  
    function loadTasks() {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
      }
    }
  
    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }
  
    function renderTasks() {
      taskList.innerHTML = '';
      
      tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        let attachmentHtml = '';
        if (task.attachment) {
          if (task.attachment.startsWith('data:image')) {
            attachmentHtml = `<img src="${task.attachment}" class="task-attachment" alt="Task attachment">`;
          } else {
            attachmentHtml = `<div class="file-attachment">📎 Attachment</div>`;
          }
        }
  
        const deadlineDate = task.deadline ? new Date(task.deadline) : null;
        const formattedDeadline = deadlineDate ? deadlineDate.toLocaleDateString() : '';
        
        taskItem.innerHTML = `
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <div class="task-content">
            <h1 class="task-text">${escapeHtml(task.text)}</h1>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            ${task.deadline ? `<div class="task-deadline">📅 ${formattedDeadline}</div>` : ''}
            ${attachmentHtml}
          </div>
          <button class="delete-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;
        
        taskList.appendChild(taskItem);
      });
      
      updateTaskCounter();
    }
  
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  
    async function addTask(text, deadline, description, file) {
      if (text.trim() === '') return;
      
      let attachment = null;
      if (file) {
        attachment = await fileToBase64(file);
      }
      
      const newTask = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        deadline: deadline,
        description: description.trim(),
        attachment: attachment
      };
      
      tasks.push(newTask);
      saveTasks();
      renderTasks();
      toggleInputContainer();
      
      taskInput.value = '';
      deadlineInput.value = '';
      descriptionInput.value = '';
      fileInput.value = '';
    }
  
    function deleteTask(id) {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      renderTasks();
    }
  
    function toggleTaskStatus(id) {
      tasks = tasks.map(task => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      
      saveTasks();
      renderTasks();
    }
  
    function clearCompletedTasks() {
      tasks = tasks.filter(task => !task.completed);
      saveTasks();
      renderTasks();
    }
  
    function updateTaskCounter() {
      const remainingTasks = tasks.filter(task => !task.completed).length;
      tasksCounter.textContent = `${remainingTasks} task${remainingTasks !== 1 ? 's' : ''} left`;
    }
  
    taskForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const file = fileInput.files[0];
      await addTask(taskInput.value, deadlineInput.value, descriptionInput.value, file);
    });
  
    taskList.addEventListener('click', event => {
      const taskItem = event.target.closest('.task-item');
      if (!taskItem) return;
      
      const taskId = taskItem.dataset.id;
      
      if (event.target.classList.contains('task-checkbox')) {
        toggleTaskStatus(taskId);
      }
      
      if (event.target.closest('.delete-btn')) {
        deleteTask(taskId);
      }
    });
  
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
  
    loadTasks();
  });
