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



// notes 

document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('noteForm');
    const notesContainer = document.getElementById('notesContainer');
    const userEmail = localStorage.getItem('userEmail'); // must be set after login

    // Handle note submission
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const privacy = document.getElementById('privacy').value;

        try {
            const response = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, privacy, userEmail })
            });

            const result = await response.json();
            if (result.success) {
                alert('Note saved successfully!');
                noteForm.reset();
                fetchNotes(); // Refresh notes
            } else {
                alert('Failed to save note: ' + result.error);
            }
        } catch (err) {
            console.error('Error saving note:', err);
            alert('An error occurred while saving the note.');
        }
    });

    // Fetch and display notes
    async function fetchNotes() {
        try {
            const res = await fetch(`http://localhost:3000/api/notes?email=${userEmail}`);
            const notes = await res.json();
            renderNotes(notes);
        } catch (err) {
            console.error('Error fetching notes:', err);
        }
    }

    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.classList.add('note');

            noteEl.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <p><strong>Privacy:</strong> ${note.privacy}</p>
                ${note.fileName ? `<p><a href="${note.filePath}" download>Download ${note.fileName}</a></p>` : ''}
                <button onclick="deleteNote('${note._id}')">Delete</button>
            `;
            notesContainer.appendChild(noteEl);
        });
    }

    // Delete a note
    window.deleteNote = async function (id) {
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/notes/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                fetchNotes();
            } else {
                alert('Failed to delete note');
            }
        } catch (err) {
            console.error('Error deleting note:', err);
        }
    }

    // Initial fetch
    if (userEmail) {
        fetchNotes();
    } else {
        alert("User not logged in. Please log in first.");
    }
});
