const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/learnmate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// ✅ Define Admin schema & model
const AdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', AdminSchema);

// ✅ Signup Route
app.post('/submit', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new Admin({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await Admin.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
