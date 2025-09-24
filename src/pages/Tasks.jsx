import React from 'react';
import './Tasks.css';

const Tasks = () => {
  const tasks = [
    {
      id: 1,
      title: "Design new user interface",
      description: "Create wireframes and mockups for the new dashboard",
      status: "in-progress",
      priority: "high",
      assignee: "John Doe",
      dueDate: "2024-12-30"
    },
    {
      id: 2,
      title: "Database optimization", 
      description: "Optimize queries and improve database performance",
      status: "pending",
      priority: "medium",
      assignee: "Jane Smith",
      dueDate: "2025-01-05"
    },
    {
      id: 3,
      title: "Write documentation",
      description: "Complete API documentation for new endpoints",
      status: "completed",
      priority: "low",
      assignee: "Bob Johnson",
      dueDate: "2024-12-20"
    }
  ];

  return (
    <div className="tasks">
      <div className="tasks-header">
        <h1>Tasks</h1>
        <button className="btn-primary">+ New Task</button>
      </div>
      
      <div className="tasks-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select>
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      
      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.title}</h3>
              <div className="task-badges">
                <span className={`priority ${task.priority}`}>{task.priority}</span>
                <span className={`status ${task.status}`}>{task.status.replace('-', ' ')}</span>
              </div>
            </div>
            
            <p className="task-description">{task.description}</p>
            
            <div className="task-meta">
              <div className="meta-item">
                <span className="meta-label">Assignee:</span>
                <span>{task.assignee}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Due Date:</span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="task-actions">
              <button className="btn-secondary">Edit</button>
              <button className="btn-primary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;