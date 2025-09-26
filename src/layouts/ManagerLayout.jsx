import React from 'react';
import './ManagerLayout.css';

const sideNavItems = [
  { key: 'team-dashboard', label: 'Overview', hint: 'Insights' },
  { key: 'team-management', label: 'Team', hint: 'Roster' },
  { key: 'assignment-management', label: 'Assignments', hint: 'Wizard' },
  { key: 'team-progress', label: 'Progress', hint: 'Reports' },
  { key: 'non-compliance', label: 'Follow-up', hint: 'Overdue' },
];

function ManagerLayout({ children, currentPage = 'team-dashboard', onNavigate }) {
  const handleNavigate = (key) => {
    if (typeof onNavigate === 'function') {
      onNavigate(key);
    }
  };

  const headerCopy = {
    'team-dashboard': {
      title: 'Compliance manager',
      subtitle: 'Monitor acknowledgements, training progress, and overdue follow-ups.',
    },
    'team-management': {
      title: 'Team management',
      subtitle: 'Maintain the roster, assign work, and track completion status.',
    },
    'assignment-management': {
      title: 'Assignment wizard',
      subtitle: 'Pick the audience, configure the item, and schedule delivery in minutes.',
    },
    'team-progress': {
      title: 'Progress reporting',
      subtitle: 'Slice completion data by course, department, and status for export.',
    },
    'non-compliance': {
      title: 'Non-compliance follow-up',
      subtitle: 'Quickly remind or escalate overdue policies and training.',
    },
  }[currentPage] ?? {
    title: 'Team Manager',
    subtitle: 'Run compliance operations from a single workspace.',
  };

  return (
    <div className="manager-layout">
      <aside className="manager-sidebar">
        <div className="manager-sidebar__brand">
          <span className="manager-sidebar__logo">TM</span>
          <div>
            <p className="manager-sidebar__title">Team Manager</p>
            <p className="manager-sidebar__subtitle">Operations Suite</p>
          </div>
        </div>
        <nav className="manager-sidebar__nav" aria-label="Team manager navigation">
          <ul>
            {sideNavItems.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`manager-sidebar__link ${currentPage === item.key ? 'is-active' : ''}`}
                  onClick={() => handleNavigate(item.key)}
                >
                  <span>{item.label}</span>
                  {item.hint && <span className="manager-sidebar__hint">{item.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="manager-sidebar__footer">
          <button
            type="button"
            className="manager-sidebar__back"
            onClick={() => handleNavigate('dashboard')}
          >
            Back to main dashboard
          </button>
        </div>
      </aside>
      <div className="manager-main">
        <header className="manager-header">
          <div>
            <h1>{headerCopy.title}</h1>
            <p>{headerCopy.subtitle}</p>
          </div>
          <div className="manager-header__actions">
            <button type="button" className="manager-header__action" onClick={() => handleNavigate('projects')}>
              View Projects
            </button>
            <button type="button" className="manager-header__action" onClick={() => handleNavigate('tasks')}>
              View Tasks
            </button>
            <button type="button" className="manager-header__primary" onClick={() => handleNavigate('dashboard')}>
              Main Dashboard
            </button>
          </div>
        </header>
        <main className="manager-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default ManagerLayout;
