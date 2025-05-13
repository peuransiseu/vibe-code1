// Task class to represent a task
class Task {
    constructor(id, title, description = '', dueDate = null, priority = 'medium', category = '', completed = false) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.category = category;
        this.completed = completed;
        this.dateCreated = new Date().toISOString();
    }
}

// API Service to handle all backend requests
class ApiService {
    constructor() {
        // Base URL for the API
        this.baseUrl = 'http://localhost:3000/api'; // Change this to match your backend URL
    }

    // Helper method for fetch requests
    async fetchApi(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            // If the API is unreachable, we could fall back to localStorage
            throw error;
        }
    }

    // Get all tasks
    getAllTasks() {
        return this.fetchApi('/tasks');
    }

    // Get a single task
    getTask(id) {
        return this.fetchApi(`/tasks/${id}`);
    }

    // Create a new task
    createTask(task) {
        return this.fetchApi('/tasks', {
            method: 'POST',
            body: JSON.stringify(task)
        });
    }

    // Update an existing task
    updateTask(id, task) {
        return this.fetchApi(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(task)
        });
    }

    // Delete a task
    deleteTask(id) {
        return this.fetchApi(`/tasks/${id}`, {
            method: 'DELETE'
        });
    }
}

// TodoApp class to manage the application
class TodoApp {
    constructor() {
        this.tasks = [];
        this.categories = new Set();
        this.currentFilter = {
            status: 'all',
            priority: 'all',
            category: 'all'
        };
        this.currentSort = 'dateCreated';
        this.sortDirection = 'asc';
        this.selectedTaskId = null;
        this.apiService = new ApiService();
        this.useApi = true; // Flag to control if we use API or localStorage

        // DOM elements
        this.taskForm = document.getElementById('task-form');
        this.taskList = document.getElementById('task-list');
        this.noTasksMessage = document.getElementById('no-tasks');
        this.filterStatus = document.getElementById('filter-status');
        this.filterPriority = document.getElementById('filter-priority');
        this.filterCategory = document.getElementById('filter-category');
        this.sortOptions = document.querySelectorAll('.sort-option');
        
        // Task detail modal elements
        this.taskDetailModal = new bootstrap.Modal(document.getElementById('task-detail-modal'));
        this.taskDetailTitle = document.getElementById('task-detail-title');
        this.taskDetailDescription = document.getElementById('task-detail-description');
        this.taskDetailPriority = document.getElementById('task-detail-priority');
        this.taskDetailDueDate = document.getElementById('task-detail-due-date');
        this.taskDetailCategory = document.getElementById('task-detail-category');
        this.taskDetailStatus = document.getElementById('task-detail-status');
        this.deleteTaskBtn = document.getElementById('delete-task-btn');
        this.completeTaskBtn = document.getElementById('complete-task-btn');
        this.editTaskBtn = document.getElementById('edit-task-btn');
        
        // Edit task modal elements
        this.editTaskModal = new bootstrap.Modal(document.getElementById('edit-task-modal'));
        this.editTaskForm = document.getElementById('edit-task-form');
        this.editTaskId = document.getElementById('edit-task-id');
        this.editTaskTitle = document.getElementById('edit-task-title');
        this.editTaskDescription = document.getElementById('edit-task-description');
        this.editTaskDueDate = document.getElementById('edit-task-due-date');
        this.editTaskPriority = document.getElementById('edit-task-priority');
        this.editTaskCategory = document.getElementById('edit-task-category');
        this.saveEditBtn = document.getElementById('save-edit-btn');

        // Bind event listeners
        this.bindEventListeners();
        
        // Load tasks
        this.loadTasks();
    }

    // Bind all event listeners
    bindEventListeners() {
        // Add task form submit
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // Filter change events
        this.filterStatus.addEventListener('change', () => this.applyFilters());
        this.filterPriority.addEventListener('change', () => this.applyFilters());
        this.filterCategory.addEventListener('change', () => this.applyFilters());
        
        // Sort options
        this.sortOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const sortBy = e.target.dataset.sort;
                this.sortTasks(sortBy);
            });
        });
        
        // Task detail modal actions
        this.deleteTaskBtn.addEventListener('click', () => this.deleteTask(this.selectedTaskId));
        this.completeTaskBtn.addEventListener('click', () => this.toggleTaskCompletion(this.selectedTaskId));
        this.editTaskBtn.addEventListener('click', () => this.showEditTaskModal(this.selectedTaskId));
        
        // Save edit button
        this.saveEditBtn.addEventListener('click', () => this.saveTaskEdit());
    }

    // Generate a unique ID (fallback for localStorage)
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Sanitize user input to prevent XSS attacks
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Load tasks from API or localStorage
    async loadTasks() {
        try {
            if (this.useApi) {
                // Try to load from API
                this.tasks = await this.apiService.getAllTasks();
            } else {
                // Fallback to localStorage
                const storedTasks = localStorage.getItem('todoTasks');
                if (storedTasks) {
                    this.tasks = JSON.parse(storedTasks);
                }
            }
            
            // Extract categories
            this.categories.clear();
            this.tasks.forEach(task => {
                if (task.category) {
                    this.categories.add(task.category);
                }
            });
            
            // Initial render after loading
            this.renderTasks();
            this.updateCategoriesDropdown();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            // If API fails, try fallback to localStorage
            if (this.useApi) {
                this.useApi = false;
                this.loadTasks();
            }
        }
    }

    // Save tasks (only used for localStorage fallback)
    saveTasks() {
        if (!this.useApi) {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        }
    }

    // Add a new task
    async addTask() {
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const dueDateInput = document.getElementById('task-due-date');
        const priorityInput = document.getElementById('task-priority');
        const categoryInput = document.getElementById('task-category');
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dueDateInput.value ? new Date(dueDateInput.value).toISOString() : null;
        const priority = priorityInput.value;
        const category = categoryInput.value.trim();
        
        if (title) {
            try {
                let newTask;
                
                if (this.useApi) {
                    // Add via API
                    newTask = await this.apiService.createTask({
                        title,
                        description,
                        dueDate,
                        priority,
                        category,
                        completed: false
                    });
                } else {
                    // Add via localStorage
                    newTask = new Task(
                        this.generateId(),
                        title,
                        description,
                        dueDate,
                        priority,
                        category
                    );
                    this.tasks.push(newTask);
                    this.saveTasks();
                }
                
                // Add to in-memory list if using API
                if (this.useApi) {
                    this.tasks.push(newTask);
                }
                
                // Add category if it's new
                if (category && !this.categories.has(category)) {
                    this.categories.add(category);
                    this.updateCategoriesDropdown();
                }
                
                // Render the updated list
                this.renderTasks();
                
                // Reset form
                this.taskForm.reset();
            } catch (error) {
                console.error('Failed to add task:', error);
                alert('Failed to add task. Please try again.');
            }
        }
    }

    // Delete a task
    async deleteTask(taskId) {
        try {
            if (this.useApi) {
                // Delete via API
                await this.apiService.deleteTask(taskId);
            }
            
            // Remove from in-memory list
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            
            // Update localStorage if not using API
            if (!this.useApi) {
                this.saveTasks();
            }
            
            // Update UI
            this.renderTasks();
            this.refreshCategories();
            this.taskDetailModal.hide();
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task. Please try again.');
        }
    }

    // Toggle task completion status
    async toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            try {
                // Toggle the completed status
                const updatedTask = {
                    ...this.tasks[taskIndex],
                    completed: !this.tasks[taskIndex].completed
                };
                
                if (this.useApi) {
                    // Update via API
                    await this.apiService.updateTask(taskId, updatedTask);
                }
                
                // Update in-memory list
                this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
                
                // Update localStorage if not using API
                if (!this.useApi) {
                    this.saveTasks();
                }
                
                // Update UI
                this.renderTasks();
                
                // Update task detail modal if open
                if (this.selectedTaskId === taskId) {
                    this.updateTaskDetailModal(taskId);
                }
            } catch (error) {
                console.error('Failed to update task:', error);
                alert('Failed to update task. Please try again.');
            }
        }
    }

    // Show edit task modal
    showEditTaskModal(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            this.editTaskId.value = task.id;
            this.editTaskTitle.value = task.title;
            this.editTaskDescription.value = task.description || '';
            this.editTaskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
            this.editTaskPriority.value = task.priority;
            this.editTaskCategory.value = task.category || '';
            
            // Hide task detail modal and show edit modal
            this.taskDetailModal.hide();
            this.editTaskModal.show();
        }
    }

    // Save task edit
    async saveTaskEdit() {
        const taskId = this.editTaskId.value;
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            try {
                const oldCategory = this.tasks[taskIndex].category;
                const newCategory = this.editTaskCategory.value.trim();
                
                // Create updated task object
                const updatedTask = {
                    ...this.tasks[taskIndex],
                    title: this.editTaskTitle.value.trim(),
                    description: this.editTaskDescription.value.trim(),
                    dueDate: this.editTaskDueDate.value ? new Date(this.editTaskDueDate.value).toISOString() : null,
                    priority: this.editTaskPriority.value,
                    category: newCategory
                };
                
                if (this.useApi) {
                    // Update via API
                    await this.apiService.updateTask(taskId, updatedTask);
                }
                
                // Update in-memory list
                this.tasks[taskIndex] = updatedTask;
                
                // Update localStorage if not using API
                if (!this.useApi) {
                    this.saveTasks();
                }
                
                // Check if category changed
                if (newCategory && newCategory !== oldCategory) {
                    this.categories.add(newCategory);
                    this.refreshCategories();
                }
                
                // Update UI
                this.renderTasks();
                
                // Close edit modal
                this.editTaskModal.hide();
            } catch (error) {
                console.error('Failed to save task edit:', error);
                alert('Failed to save changes. Please try again.');
            }
        }
    }

    // Refresh the categories set
    refreshCategories() {
        this.categories.clear();
        this.tasks.forEach(task => {
            if (task.category) {
                this.categories.add(task.category);
            }
        });
        this.updateCategoriesDropdown();
    }

    // Update categories dropdown
    updateCategoriesDropdown() {
        const categorySelect = document.getElementById('filter-category');
        
        // Clear existing options except the first one
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Add categories
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Apply filters to tasks
    applyFilters() {
        this.currentFilter = {
            status: this.filterStatus.value,
            priority: this.filterPriority.value,
            category: this.filterCategory.value
        };
        
        this.renderTasks();
    }

    // Sort tasks
    sortTasks(sortBy) {
        if (this.currentSort === sortBy) {
            // Toggle direction if same field
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // New sort field, default to ascending
            this.currentSort = sortBy;
            this.sortDirection = 'asc';
        }
        
        this.renderTasks();
    }

    // Filter and sort tasks
    getFilteredAndSortedTasks() {
        // First apply filters
        let filteredTasks = this.tasks.filter(task => {
            // Filter by status
            if (this.currentFilter.status !== 'all') {
                if (this.currentFilter.status === 'completed' && !task.completed) return false;
                if (this.currentFilter.status === 'active' && task.completed) return false;
            }
            
            // Filter by priority
            if (this.currentFilter.priority !== 'all' && task.priority !== this.currentFilter.priority) {
                return false;
            }
            
            // Filter by category
            if (this.currentFilter.category !== 'all' && task.category !== this.currentFilter.category) {
                return false;
            }
            
            return true;
        });
        
        // Then sort
        filteredTasks.sort((a, b) => {
            let valueA, valueB;
            
            // Extract values based on sort field
            switch (this.currentSort) {
                case 'dueDate':
                    valueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                    valueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                    break;
                case 'priority':
                    const priorityValues = { 'high': 3, 'medium': 2, 'low': 1 };
                    valueA = priorityValues[a.priority] || 0;
                    valueB = priorityValues[b.priority] || 0;
                    break;
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'dateCreated':
                default:
                    valueA = new Date(a.dateCreated).getTime();
                    valueB = new Date(b.dateCreated).getTime();
                    break;
            }
            
            // Determine sort order
            let result = 0;
            if (valueA < valueB) result = -1;
            if (valueA > valueB) result = 1;
            
            // Reverse if descending
            return this.sortDirection === 'asc' ? result : -result;
        });
        
        return filteredTasks;
    }

    // Show task details in modal
    showTaskDetails(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            this.selectedTaskId = taskId;
            this.updateTaskDetailModal(taskId);
            this.taskDetailModal.show();
        }
    }

    // Update task detail modal content
    updateTaskDetailModal(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            // Use textContent instead of innerHTML to prevent XSS
            this.taskDetailTitle.textContent = task.title;
            this.taskDetailDescription.textContent = task.description || 'No description provided';
            this.taskDetailPriority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            this.taskDetailCategory.textContent = task.category || 'Not categorized';
            
            // Format due date if it exists
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                this.taskDetailDueDate.textContent = date.toLocaleDateString();
            } else {
                this.taskDetailDueDate.textContent = 'Not set';
            }
            
            // Update status
            this.taskDetailStatus.textContent = task.completed ? 'Completed' : 'Active';
            this.taskDetailStatus.className = task.completed ? 'text-success' : 'text-primary';
            
            // Update complete button text
            this.completeTaskBtn.textContent = task.completed ? 'Mark as Active' : 'Mark as Completed';
            this.completeTaskBtn.className = task.completed ? 'btn btn-outline-primary' : 'btn btn-success';
        }
    }

    // Render the task list
    renderTasks() {
        // Get filtered and sorted tasks
        const filteredTasks = this.getFilteredAndSortedTasks();
        
        // Clear current list
        this.taskList.innerHTML = '';
        
        // Show/hide empty message
        if (filteredTasks.length === 0) {
            this.noTasksMessage.classList.remove('d-none');
        } else {
            this.noTasksMessage.classList.add('d-none');
            
            // Render each task
            filteredTasks.forEach(task => {
                // Create task item element
                const taskItem = document.createElement('div');
                taskItem.className = `list-group-item task-item d-flex align-items-center ${task.completed ? 'completed' : ''} ${task.priority}-priority`;
                taskItem.dataset.id = task.id;
                
                // Create main content container (safer approach than innerHTML)
                const taskContent = document.createElement('div');
                taskContent.className = 'me-auto';
                taskContent.style.cursor = 'pointer';
                taskContent.dataset.id = task.id;
                
                // Create and add title
                const titleElement = document.createElement('h6');
                titleElement.className = 'task-title';
                titleElement.textContent = task.title;
                taskContent.appendChild(titleElement);
                
                // Create info container
                const infoContainer = document.createElement('div');
                infoContainer.className = 'd-flex align-items-center mt-1';
                
                // Add due date if exists
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const dueDateElement = document.createElement('span');
                    dueDateElement.className = `task-due-date me-2 ${dueDate < today && !task.completed ? 'overdue' : ''}`;
                    dueDateElement.textContent = `Due: ${dueDate.toLocaleDateString()}`;
                    infoContainer.appendChild(dueDateElement);
                }
                
                // Add priority
                const priorityElement = document.createElement('span');
                priorityElement.className = `task-priority ${task.priority} me-1`;
                priorityElement.textContent = task.priority;
                infoContainer.appendChild(priorityElement);
                
                // Add category if exists
                if (task.category) {
                    const categoryElement = document.createElement('span');
                    categoryElement.className = 'task-category';
                    categoryElement.textContent = task.category;
                    infoContainer.appendChild(categoryElement);
                }
                
                taskContent.appendChild(infoContainer);
                taskItem.appendChild(taskContent);
                
                // Create actions container
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'task-actions';
                
                // Complete button
                const completeBtn = document.createElement('i');
                completeBtn.className = 'bi bi-check-circle task-action-btn complete';
                completeBtn.title = task.completed ? 'Mark as Active' : 'Mark as Completed';
                completeBtn.dataset.id = task.id;
                actionsContainer.appendChild(completeBtn);
                
                // Edit button
                const editBtn = document.createElement('i');
                editBtn.className = 'bi bi-pencil task-action-btn edit';
                editBtn.title = 'Edit Task';
                editBtn.dataset.id = task.id;
                actionsContainer.appendChild(editBtn);
                
                // Delete button
                const deleteBtn = document.createElement('i');
                deleteBtn.className = 'bi bi-trash task-action-btn delete';
                deleteBtn.title = 'Delete Task';
                deleteBtn.dataset.id = task.id;
                actionsContainer.appendChild(deleteBtn);
                
                taskItem.appendChild(actionsContainer);
                
                // Add to list
                this.taskList.appendChild(taskItem);
                
                // Add event listeners
                taskContent.addEventListener('click', () => this.showTaskDetails(task.id));
                
                completeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleTaskCompletion(task.id);
                });
                
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEditTaskModal(task.id);
                });
                
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this task?')) {
                        this.deleteTask(task.id);
                    }
                });
            });
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TodoApp();
}); 