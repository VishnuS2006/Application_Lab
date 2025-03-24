document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        
        const data = await response.json();
        if (response.ok) {
            alert("Login Successful!");
            window.location.href = 'home2.html';
            console.log(data);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});
z