
const form = document.querySelector('#form');
const username = document.querySelector('#username');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const cpassword = document.querySelector('#cpassword');

form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    if (!validateInputs()) {
        return; // Stop if validation fails
    }

    const formData = {
        name: username.value.trim(),
        email: email.value.trim(),
        password: password.value.trim()
    };

    try {
        const response = await fetch('http://localhost:3000/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Data submitted successfully!');
            window.location.href = 'home.html';
            form.reset(); // Clear form after successful submission
        } else {
            // Handle server error response properly
            let errorData;
            try {
                errorData = await response.json();
            } catch (error) {
                errorData = { message: 'Unexpected server error' };
            }
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        alert(`Error submitting data: ${error.message}`);
    }
});

function validateInputs() {
    const usernameVal = username.value.trim();
    const emailVal = email.value.trim();
    const passwordVal = password.value.trim();
    const cpasswordVal = cpassword.value.trim();
    let success = true;

    if (usernameVal === '') {
        success = false;
        setError(username, 'Username is required');
    } else {
        setSuccess(username);
    }

    if (emailVal === '') {
        success = false;
        setError(email, 'Email is required');
    } else if (!validateEmail(emailVal)) {
        success = false;
        setError(email, 'Please enter a valid email');
    } else {
        setSuccess(email);
    }

    if (passwordVal === '') {
        success = false;
        setError(password, 'Password is required');
    } else if (passwordVal.length < 8) {
        success = false;
        setError(password, 'Password must be at least 8 characters long');
    } else {
        setSuccess(password);
    }

    if (cpasswordVal === '') {
        success = false;
        setError(cpassword, 'Confirm password is required');
    } else if (cpasswordVal !== passwordVal) {
        success = false;
        setError(cpassword, 'Passwords do not match');
    } else {
        setSuccess(cpassword);
    }

    return success;
}

function setError(element, message) {
    const inputGroup = element.parentElement;
    const errorElement = inputGroup.querySelector('.error');

    if (errorElement) {
        errorElement.innerText = message;
    }
    inputGroup.classList.add('error');
    inputGroup.classList.remove('success');
}

function setSuccess(element) {
    const inputGroup = element.parentElement;
    const errorElement = inputGroup.querySelector('.error');

    if (errorElement) {
        errorElement.innerText = '';
    }
    inputGroup.classList.add('success');
    inputGroup.classList.remove('error');
}

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
