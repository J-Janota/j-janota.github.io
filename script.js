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
    const supabase = window.supabaseClient;

    let tasks = [];


    showFormBtn.addEventListener('click', toggleInputContainer);

    function toggleInputContainer() {
        inputContainer.classList.toggle('hidden');
        showFormBtn.classList.toggle('hidden');
    }

    async function loadTasks() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
      
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      
        if (error) {
          console.error('Error loading tasks:', error);
          return;
        }
      
        tasks = data;
        await renderTasks(); // Important: await this now
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

    async function renderTasks() {
        taskList.innerHTML = '';
      
        for (const task of tasks) {
          const taskItem = document.createElement('li');
          taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
          taskItem.dataset.id = task.id;
      
          let attachmentHtml = '';
          if (task.attachment_url) {
            const { data, error } = await supabase
                const url = task.attachment_url; // already a public URL, use it as-is
            if (error) {
              console.error('Signed URL error:', error.message);
            } else {
              const url = task.attachment_url;
              if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                attachmentHtml = `<img src="${url}" class="task-attachment" alt="Task image">`;
              } else {
                attachmentHtml = `<a href="${url}" target="_blank" class="file-attachment">📎 Open Attachment</a>`;
              }
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
        }
      
        updateTaskCounter();
      }
      

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function addTask(text, deadline, description, file) {
        if (text.trim() === '') return;
      
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
      
        let fileUrl = null;
        let filePath = null; // ✅ declare it here so it exists below
      
        if (file) {
          const fileExt = file.name.split('.').pop();
          filePath = `${user.id}/${Date.now()}.${fileExt}`;
          console.log('file sent to supabase', filePath);
      
          const { error: uploadError } = await supabase
            .storage
            .from('attachments')
            .upload(filePath, file);
      
          if (uploadError) {
            console.error('File upload error:', uploadError);
            alert('File upload failed');
            return;
          }
      
          console.log('Uploaded to:', filePath);
      
          const { data: publicUrlData, error: publicUrlError } = supabase
            .storage
            .from('attachments')
            .getPublicUrl(filePath);
      
          if (publicUrlError) {
            console.error('Public URL error:', publicUrlError);
            alert('Failed to get file URL');
            return;
          }
      
          fileUrl = publicUrlData?.publicUrl || null;
          if (!fileUrl) {
            console.error('Failed to get public URL from Supabase');
            return;
          }
        }
      
        const { error } = await supabase
          .from('todos')
          .insert([
            {
              user_id: user.id,
              text: text.trim(),
              description: description.trim(),
              deadline: deadline || null,
              completed: false,
              attachment_url: fileUrl,
            }
          ]);
      
        if (error) {
          console.error('Error saving task:', error);
          alert('Task creation failed');
          return;
        }
      
        await loadTasks();
      }
      
      

      async function deleteTask(id) {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);
      
        if (error) {
          console.error('Error deleting task:', error);
          return;
        }
      
        tasks = tasks.filter(t => t.id !== id); // remove from local array
        await renderTasks();
      }
      

    async function toggleTaskStatus(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
      
        const { error } = await supabase
          .from('todos')
          .update({ completed: !task.completed })
          .eq('id', id);
      
        if (error) {
          console.error('Error updating task:', error);
          return;
        }
      
        task.completed = !task.completed; // update local state
        await renderTasks(); // yes, we re-render — but you could optimize this later
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

