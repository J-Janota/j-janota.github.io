// main.js

// First, register the Service Worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered!', registration);
  
        // Request Notification Permission
        return Notification.requestPermission();
      })
      .then(permission => {
        if (permission !== 'granted') {
          throw new Error('Permission not granted for Notification');
        }
      })
      .catch(err => console.error('Error:', err));
  }
  
  // Now, set up the button to send a fake push
  document.getElementById('notifyBtn').addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.ready;
    console.log("Notification sent");
    registration.showNotification('Yo dude!', {
      body: 'This is your site speaking. Wassup!',
    });
  });
  