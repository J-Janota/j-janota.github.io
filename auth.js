document.addEventListener('DOMContentLoaded', async () => {
    const supabaseUrl = 'https://vcpyjvibudqhvmztuwwg.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcHlqdmlidWRxaHZtenR1d3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTYzNDYsImV4cCI6MjA2MTQzMjM0Nn0.EqXTM0BHgggbmPSlqFDX_v8mRwqwX60XJXXbZYof-UE';                       // CHANGE THIS
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    window.supabaseClient = supabase;
  
    const authContainer = document.getElementById('auth-container');
    const todoAppContainer = document.getElementById('todo-app-container');
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const logoutBtn = document.getElementById('logout-btn');
    const loginToggleBtn = document.getElementById('login-toggle-btn');
  
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showTodoApp();
        logoutBtn.classList.add('hidden');
    }

    loginToggleBtn.addEventListener('click', () => {
        authForm.classList.toggle('hidden');
        loginToggleBtn.classList.add('hidden');
      });
  
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
    
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
        if (signInError) {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) {
            alert(signUpError.message);
            console.error(signUpError);
          } else {
            alert('Check your email for confirmation link!');
          }
        } else {
          showTodoApp();
          await window.loadTasks();
        }
      });
  
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      console.log('Logged out');
      updateStatus('Logged out');
      showAuthScreen();
    });
  
    function showTodoApp() {
        authForm.classList.add('hidden');
        todoAppContainer.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        updateStatus('Logged in');
      }


      function showAuthScreen() {
        authForm.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        updateStatus('Logged out');
        const taskList = document.getElementById('task-list');
      if (taskList) taskList.innerHTML = '';
      if (typeof tasks !== 'undefined') tasks = [];
      }
  });
  
  function updateStatus(text) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = `Status: ${text}`;
    }
  }

