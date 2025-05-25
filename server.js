// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

mongoose.connect("mongodb://localhost:27017/learnmate")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Questions Schema
const Questions = new mongoose.Schema({
    topic: String,
    question: String,
    correctAnswer: String,
    explanation: String,
    options: [String]
});
const Question = mongoose.model('Question', Questions);

// Subject Schema
const Subjects = new mongoose.Schema({
    name: String,
    questions: [Questions]
});
const Subject = mongoose.model('Subject', Subjects);

// Route to get questions by topic
app.get('/api/questions/:topic', async (req, res) => {
    try {
        const { topic } = req.params;
        const questions = await Question.find({ topic: topic });

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this topic' });
        }
        res.json({ success: true, questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching questions' });
    }
});

// Route to add questions (for initial data setup)
app.post('/api/questions', async (req, res) => {
    try {
        const { topic, questions } = req.body;

        // Insert multiple questions
        const insertedQuestions = await Question.insertMany(
            questions.map(q => ({
                topic,
                question: q.question,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                options: q.options
            }))
        );

        res.json({ success: true, message: `${insertedQuestions.length} questions added successfully` });
    } catch (error) {
        console.error('Error adding questions:', error);
        res.status(500).json({ success: false, message: 'Server error while adding questions' });
    }
});

// Route to delete a question by ID
app.delete('/api/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting question' });
    }
});

app.post('/submit', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        
        res.status(201).json({ message: 'Signup successful', user: { name, email } });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// Admin Managing 


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'name email _id');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});


// Notes 

// Note Schema
const noteSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    content: { 
        type: String, 
        required: true,
        trim: true
    },
    privacy: { 
        type: String, 
        enum: ['public', 'private'], 
        default: 'private' 
    },
    userEmail: { 
        type: String, 
        required: true,
        trim: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt field before saving
noteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update the updatedAt field before updating
noteSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Note = mongoose.model('Note', noteSchema);

// Routes

// Get all notes for a specific user
app.get('/api/notes', async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email parameter is required' 
            });
        }

        const notes = await Note.find({ userEmail: email })
            .sort({ updatedAt: -1 }); // Sort by most recently updated

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch notes' 
        });
    }
});

// Get a single note by ID
app.get('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ 
                success: false, 
                error: 'Note not found' 
            });
        }
        
        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid note ID' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch note' 
        });
    }
});

// Create a new note
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content, privacy, userEmail } = req.body;
        
        // Validation
        if (!title || !content || !userEmail) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title, content, and user email are required' 
            });
        }

        if (title.trim().length === 0 || content.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and content cannot be empty' 
            });
        }

        // Create new note
        const newNote = new Note({
            title: title.trim(),
            content: content.trim(),
            privacy: privacy || 'private',
            userEmail: userEmail.trim()
        });

        const savedNote = await newNote.save();
        
        res.status(201).json({ 
            success: true, 
            note: savedNote,
            message: 'Note created successfully'
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create note' 
        });
    }
});

// Update an existing note
app.put('/api/notes/:id', async (req, res) => {
    try {
        const { title, content, privacy } = req.body;
        
        // Validation
        if (!title || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and content are required' 
            });
        }

        if (title.trim().length === 0 || content.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and content cannot be empty' 
            });
        }

        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            {
                title: title.trim(),
                content: content.trim(),
                privacy: privacy || 'private'
            },
            { 
                new: true, // Return the updated document
                runValidators: true // Run schema validators
            }
        );

        if (!updatedNote) {
            return res.status(404).json({ 
                success: false, 
                error: 'Note not found' 
            });
        }

        res.json({ 
            success: true, 
            note: updatedNote,
            message: 'Note updated successfully'
        });
    } catch (error) {
        console.error('Error updating note:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid note ID' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update note' 
        });
    }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        
        if (!deletedNote) {
            return res.status(404).json({ 
                success: false, 
                error: 'Note not found' 
            });
        }

        res.json({ 
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid note ID' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete note' 
        });
    }
});

// Get public notes for featured section (optional)
app.get('/api/notes/public/featured', async (req, res) => {
    try {
        const publicNotes = await Note.find({ privacy: 'public' })
            .sort({ updatedAt: -1 })
            .limit(10); // Limit to 10 most recent public notes

        res.json(publicNotes);
    } catch (error) {
        console.error('Error fetching public notes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch public notes' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve the notes page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'API endpoint not found' 
    });
});



// set Goals 



// Goal Schema (add this to your existing schemas)
const goalSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  aptitudeAreas: [{ type: String, required: true }],
  proficiencyLevel: { type: String, required: true },
  targetScore: { type: String },
  goalType: { type: String, required: true },
  description: { type: String },
  timelineWeeks: { type: Number, required: true },
  studyHours: { type: Number, default: 0 },
  remindersEnabled: { type: Boolean, default: false },
  milestones: [{ type: String }],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'completed', 'paused', 'draft'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  achievements: [{ type: String }]
});

const Goal = mongoose.model('Goal', goalSchema);

// Create a new goal
app.post('/api/goals', async (req, res) => {
  try {
    const goalData = req.body;
    
    // Validate required fields
    if (!goalData.userEmail || !goalData.title || !goalData.aptitudeAreas || 
        !goalData.proficiencyLevel || !goalData.goalType || !goalData.timelineWeeks) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newGoal = new Goal({
      ...goalData,
      updatedAt: new Date()
    });

    await newGoal.save();
    res.status(201).json({ 
      message: 'Goal created successfully', 
      goal: newGoal 
    });
  } catch (error) {
    console.error('Goal creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all goals for a user
app.get('/api/goals/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const goals = await Goal.find({ userEmail }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific goal by ID
app.get('/api/goals/detail/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findById(goalId);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a goal
app.put('/api/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const updateData = req.body;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    // If completing the goal, set completedAt
    if (updateData.status === 'completed' && updateData.progress === 100) {
      updateData.completedAt = new Date();
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ 
      message: 'Goal updated successfully', 
      goal: updatedGoal 
    });
  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update goal progress
app.patch('/api/goals/:goalId/progress', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const updateData = { 
      progress, 
      updatedAt: new Date() 
    };

    // If progress is 100%, mark as completed
    if (progress === 100) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      updateData,
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ 
      message: 'Progress updated successfully', 
      goal: updatedGoal 
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a goal
app.delete('/api/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const deletedGoal = await Goal.findByIdAndDelete(goalId);

    if (!deletedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Goal deletion error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add milestone to goal
app.post('/api/goals/:goalId/milestones', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { milestone } = req.body;

    if (!milestone || milestone.trim() === '') {
      return res.status(400).json({ message: 'Milestone cannot be empty' });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.milestones.push(milestone.trim());
    goal.updatedAt = new Date();
    await goal.save();

    res.json({ 
      message: 'Milestone added successfully', 
      goal 
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add achievement to goal
app.post('/api/goals/:goalId/achievements', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { achievement } = req.body;

    if (!achievement || achievement.trim() === '') {
      return res.status(400).json({ message: 'Achievement cannot be empty' });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.achievements.push(achievement.trim());
    goal.updatedAt = new Date();
    await goal.save();

    res.json({ 
      message: 'Achievement added successfully', 
      goal 
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update study hours for a goal
app.patch('/api/goals/:goalId/study-hours', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { studyHours } = req.body;
    
    if (studyHours < 0) {
      return res.status(400).json({ message: 'Study hours cannot be negative' });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      { 
        studyHours, 
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ 
      message: 'Study hours updated successfully', 
      goal: updatedGoal 
    });
  } catch (error) {
    console.error('Study hours update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle reminders for a goal
app.patch('/api/goals/:goalId/reminders', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { remindersEnabled } = req.body;

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      { 
        remindersEnabled: !!remindersEnabled, 
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ 
      message: 'Reminders setting updated successfully', 
      goal: updatedGoal 
    });
  } catch (error) {
    console.error('Reminders update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get goals by status for a user
app.get('/api/goals/:userEmail/status/:status', async (req, res) => {
  try {
    const { userEmail, status } = req.params;
    const validStatuses = ['active', 'completed', 'paused', 'draft'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const goals = await Goal.find({ userEmail, status }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals by status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get goal statistics for a user
app.get('/api/goals/:userEmail/stats', async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    const totalGoals = await Goal.countDocuments({ userEmail });
    const activeGoals = await Goal.countDocuments({ userEmail, status: 'active' });
    const completedGoals = await Goal.countDocuments({ userEmail, status: 'completed' });
    const pausedGoals = await Goal.countDocuments({ userEmail, status: 'paused' });
    
    // Calculate average progress for active goals
    const activeGoalsData = await Goal.find({ userEmail, status: 'active' });
    const avgProgress = activeGoalsData.length > 0 
      ? activeGoalsData.reduce((sum, goal) => sum + goal.progress, 0) / activeGoalsData.length 
      : 0;

    // Calculate total study hours
    const allGoals = await Goal.find({ userEmail });
    const totalStudyHours = allGoals.reduce((sum, goal) => sum + goal.studyHours, 0);

    res.json({
      totalGoals,
      activeGoals,
      completedGoals,
      pausedGoals,
      averageProgress: Math.round(avgProgress),
      totalStudyHours
    });
  } catch (error) {
    console.error('Get goal stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
