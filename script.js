// login.js

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginData = {
        email: email,
        password: password
    };

    fetch('http://localhost:3000/login', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Login successful") {
           
            window.location.href = 'home.html'; 
            
        } else {
            document.getElementById('error-message').innerText = data.message || "Login failed!";
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        document.getElementById('error-message').innerText = "An error occurred. Please try again.";
    });
});
