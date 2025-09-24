import React from 'react';
import './Projects.css';

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: "Project Alpha",
      description: "Development of new web application",
      status: "In Progress",
      progress: 75,
      team: 5,
      deadline: "2024-12-31"
    },
    {
      id: 2,
      name: "Project Beta",
      description: "Mobile app redesign and optimization",
      status: "Planning",
      progress: 25,
      team: 3,
      deadline: "2025-01-15"
    },
    {
      id: 3,
      name: "Project Gamma",
      description: "Database migration and optimization",
      status: "Completed",
      progress: 100,
      team: 4,
      deadline: "2024-12-15"
    }
  ];

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Projects</h1>
        <button className="btn-primary">+ New Project</button>
      </div>
      
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3>{project.name}</h3>
              <span className={`status ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            
            <p className="project-description">{project.description}</p>
            
            <div className="project-progress">
              <div className="progress-label">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${project.progress}%`}}
                ></div>
              </div>
            </div>
            
            <div className="project-meta">
              <div className="meta-item">
                <span className="meta-label">Team Size:</span>
                <span>{project.team} members</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Deadline:</span>
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="project-actions">
              <button className="btn-secondary">View Details</button>
              <button className="btn-primary">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;