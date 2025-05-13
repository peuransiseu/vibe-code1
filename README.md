# Todo App

A feature-rich to-do list application built with a modern web technology stack. The application includes a frontend client with an intuitive user interface and a backend API with proper security measures including CORS configuration.

## Features

### Core Task Management
- **Task Creation**: Add new tasks with a title and optional description
- **Task Listing**: Display all active tasks in a clear and organized list
- **Task Details**: View the full details of a task, including its description
- **Task Completion**: Mark tasks as completed, with visual distinction for completed tasks
- **Task Editing**: Modify the title, description, due date, priority, and category of existing tasks
- **Task Deletion**: Remove tasks from the list

### Organization and Prioritization
- **Due Dates**: Assign a due date to tasks, with visual indicators for overdue tasks
- **Prioritization**: Set a priority level for tasks (High, Medium, Low) with color-coding
- **Categories/Tags**: Assign categories to tasks for better organization
- **Filtering**: Filter tasks by status, priority, and category
- **Sorting**: Sort tasks by due date, priority, title, or date created

### User Interface
- **Clean and Intuitive Design**: Bootstrap-based responsive design
- **Task Detail View**: Modal view to see and manage detailed task information
- **Data Persistence**: Tasks are saved via the API with local storage fallback

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5 for UI components
- Bootstrap Icons for action buttons

### Backend
- Node.js
- Express.js
- CORS middleware for security
- RESTful API design

## Security Features

### CORS (Cross-Origin Resource Sharing)
The backend API is configured with CORS security to prevent unauthorized domains from accessing the application data. This is implemented as follows:

- **Allowed Origins**: The API only accepts requests from whitelisted origins
- **HTTP Methods**: Only specified HTTP methods are allowed (GET, POST, PUT, DELETE, OPTIONS)
- **Headers**: Only specific headers are permitted in requests
- **Error Handling**: Proper error responses for unauthorized cross-origin requests

### XSS Protection
- Client-side input sanitization
- DOM manipulation methods instead of innerHTML for task rendering
- Content Security Policy for additional protection

## Project Structure

```
todo-app/
│
├── frontend/
│   ├── index.html     # Main HTML document
│   ├── styles.css     # CSS styles
│   ├── app.js         # Application JavaScript logic
│
├── backend/
│   ├── server.js      # Express server and API routes
│   ├── package.json   # Backend dependencies
│   ├── data/          # Data storage directory
│   └── README.md      # Backend documentation
│
└── README.md          # Project documentation
```

## How to Run

### Backend
1. Navigate to the backend directory:
```bash
cd todo-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

The API server will run on port 3000 by default.

### Frontend
1. Open the `index.html` file in your web browser, either by directly opening the file or using a local development server:
```bash
# Using npm's http-server (you may need to install it first with: npm install -g http-server)
http-server -p 5500
```

2. Access the application at `http://localhost:5500`

## API Endpoints

The backend provides the following RESTful API endpoints:

- `GET /api/tasks`: Get all tasks
- `GET /api/tasks/:id`: Get a task by ID
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update an existing task
- `DELETE /api/tasks/:id`: Delete a task

## Browser Compatibility

This application is compatible with modern browsers that support ES6+ JavaScript features:
- Chrome
- Firefox
- Safari
- Edge

## Future Enhancements

Potential future improvements:
- User accounts with cloud-based storage
- Reminders and notifications for upcoming due dates
- Recurring tasks
- Subtasks and nested task lists
- Shared task lists for collaboration
- Mobile application version 