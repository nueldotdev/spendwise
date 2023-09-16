const regForm = document.getElementById('registration-form');


regForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting normally
    const token = document.getElementById('token').innerText;
    console.log(token)
    
    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Send a POST request to your Django API endpoint
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'X-CSRFToken': token, // Add the CSRF token to the request headers
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        const resultDiv = document.getElementById('registration-result');
        if (data.message === 'Login successful') {
            resultDiv.innerHTML = '<p>Registration successful!</p>';
            // Redirect to a new page or display a success message
            window.location.href = '/home';
        } else {
            resultDiv.innerHTML = '<p>Log In failed. Please check your input.</p>';
            // Display an error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors, e.g., network issues
    });
});
