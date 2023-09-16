document.getElementById('registration-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting normally
    const token = document.getElementById('token').innerText;
    console.log(token)
    
    // Get form data
    const formData = new FormData(this);
    
    // Send a POST request to your Django API endpoint
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'X-CSRFToken': token, // Add the CSRF token to the request headers
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        const resultDiv = document.getElementById('registration-result');
        if (data.detail === 'User registered successfully') {
            resultDiv.innerHTML = '<p>Registration successful!</p>';
            // Redirect to a new page or display a success message
            window.location.href = '/home';
        } else {
            resultDiv.innerHTML = '<p>Registration failed. Please check your input.</p>';
            // Display an error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors, e.g., network issues
    });
});
