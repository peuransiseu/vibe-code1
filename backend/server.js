const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
// We would typically load these from environment variables
// const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
// For demonstration, we'll hardcode the allowed origins
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3001'
];

// Middleware for logging HTTP requests
app.use(morgan('dev'));

// CORS middleware configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      // Origin is allowed
      callback(null, true);
    } else {
      // Origin is not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware with our configuration
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Data file path for storing tasks
const dataFilePath = path.join(__dirname, 'data', 'tasks.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper function to read tasks from file
function readTasks() {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return data ? JSON.parse(data) : [];
}

// Helper function to write tasks to file
function writeTasks(tasks) {
  fs.writeFileSync(dataFilePath, JSON.stringify(tasks, null, 2));
}

// API Routes

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = readTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  try {
    const tasks = readTasks();
    const task = tasks.find(task => task.id === req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// POST a new task
app.post('/api/tasks', (req, res) => {
  try {
    const tasks = readTasks();
    const newTask = {
      ...req.body,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      dateCreated: new Date().toISOString()
    };
    
    tasks.push(newTask);
    writeTasks(tasks);
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT (update) an existing task
app.put('/api/tasks/:id', (req, res) => {
  try {
    let tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update task but preserve id and dateCreated
    tasks[taskIndex] = {
      ...req.body,
      id: tasks[taskIndex].id,
      dateCreated: tasks[taskIndex].dateCreated
    };
    
    writeTasks(tasks);
    
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    let tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    writeTasks(tasks);
    
    res.json(deletedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Error handling middleware for CORS errors
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      error: 'CORS Error',
      message: 'This origin is not allowed to access this resource'
    });
  } else {
    next(err);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}); 