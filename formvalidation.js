const form = document.querySelector("#form");
const username = document.querySelector("#username");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const cpassword = document.querySelector("#cpassword");

form.addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission

    if (!validateInputs()) {
        return; // Stop if validation fails
    }

    const formData = {
        name: username.value.trim(),
        email: email.value.trim(),
        password: password.value.trim(),
    };

    try {
        const response = await fetch("http://localhost:3000/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            // Store username in localStorage for session persistence
            localStorage.setItem("loggedInUser", formData.name);

            alert("Signup successful! Redirecting...");
            window.location.href = "home.html"; // Redirect to home page
            form.reset(); // Reset form fields
        } else {
            let errorData;
            try {
                errorData = await response.json();
            } catch (error) {
                errorData = { message: "Unexpected server error" };
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
    let isValid = true;

    if (usernameVal === "") {
        isValid = false;
        setError(username, "Username is required");
    } else {
        setSuccess(username);
    }

    if (emailVal === "") {
        isValid = false;
        setError(email, "Email is required");
    } else if (!validateEmail(emailVal)) {
        isValid = false;
        setError(email, "Please enter a valid email");
    } else {
        setSuccess(email);
    }

    if (passwordVal === "") {
        isValid = false;
        setError(password, "Password is required");
    } else if (passwordVal.length < 8) {
        isValid = false;
        setError(password, "Password must be at least 8 characters long");
    } else {
        setSuccess(password);
    }

    if (cpasswordVal === "") {
        isValid = false;
        setError(cpassword, "Confirm password is required");
    } else if (cpasswordVal !== passwordVal) {
        isValid = false;
        setError(cpassword, "Passwords do not match");
    } else {
        setSuccess(cpassword);
    }

    return isValid;
}

function setError(element, message) {
    const inputGroup = element.parentElement;
    const errorElement = inputGroup.querySelector(".error");

    if (errorElement) {
        errorElement.innerText = message;
    }
    inputGroup.classList.add("error");
    inputGroup.classList.remove("success");
}

function setSuccess(element) {
    const inputGroup = element.parentElement;
    const errorElement = inputGroup.querySelector(".error");

    if (errorElement) {
        errorElement.innerText = "";
    }
    inputGroup.classList.add("success");
    inputGroup.classList.remove("error");
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById("form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", username);
    localStoragdocument.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("#form");
        const username = document.querySelector("#username");
        const email = document.querySelector("#email");
        const password = document.querySelector("#password");
        const cpassword = document.querySelector("#cpassword");
        const messageElement = document.getElementById("signup-message");
    
        form.addEventListener("submit", async function (e) {
            e.preventDefault(); // Prevent default form submission
    
            if (!validateInputs()) {
                return; // Stop if validation fails
            }
    
            const formData = {
                name: username.value.trim(),
                email: email.value.trim(),
                password: password.value.trim(),
            };
    
            try {
                const response = await fetch("http://localhost:3000/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
    
                if (response.ok) {
                    // Store username in localStorage for session persistence
                    localStorage.setItem("loggedInUser", formData.name);
    
                    alert("Signup successful! Redirecting...");
                    window.location.href = `home.html?username=${encodeURIComponent(formData.name)}`; // Redirect with username as query param
                    form.reset(); // Reset form fields
                } else {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (error) {
                        errorData = { message: "Unexpected server error" };
                    }
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                alert(`Error submitting data: ${error.message}`);
            }
        });
    
        // Display the welcome message if the user has just signed up
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get("username");
    
        if (name && messageElement) {
            messageElement.innerText = `Welcome, ${name}! You have successfully signed up.`;
        }
    
        function validateInputs() {
            const usernameVal = username.value.trim();
            const emailVal = email.value.trim();
            const passwordVal = password.value.trim();
            const cpasswordVal = cpassword.value.trim();
            let isValid = true;
    
            if (usernameVal === "") {
                isValid = false;
                setError(username, "Username is required");
            } else {
                setSuccess(username);
            }
    
            if (emailVal === "") {
                isValid = false;
                setError(email, "Email is required");
            } else if (!validateEmail(emailVal)) {
                isValid = false;
                setError(email, "Please enter a valid email");
            } else {
                setSuccess(email);
            }
    
            if (passwordVal === "") {
                isValid = false;
                setError(password, "Password is required");
            } else if (passwordVal.length < 8) {
                isValid = false;
                setError(password, "Password must be at least 8 characters long");
            } else {
                setSuccess(password);
            }
    
            if (cpasswordVal === "") {
                isValid = false;
                setError(cpassword, "Confirm password is required");
            } else if (cpasswordVal !== passwordVal) {
                isValid = false;
                setError(cpassword, "Passwords do not match");
            } else {
                setSuccess(cpassword);
            }
    
            return isValid;
        }
    
        function setError(element, message) {
            const inputGroup = element.parentElement;
            const errorElement = inputGroup.querySelector(".error");
    
            if (errorElement) {
                errorElement.innerText = message;
            }
            inputGroup.classList.add("error");
            inputGroup.classList.remove("success");
        }
    
        function setSuccess(element) {
            const inputGroup = element.parentElement;
            const errorElement = inputGroup.querySelector(".error");
    
            if (errorElement) {
                errorElement.innerText = "";
            }
            inputGroup.classList.add("success");
            inputGroup.classList.remove("error");
        }
    
        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
    });
    e.setItem("loggedInEmail", email);

    alert("Signup Successful!");
    window.location.href = "home2.html";
});
