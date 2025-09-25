import React from 'react';
import './ManagerLayout.css';

const sideNavItems = [
  { key: 'team-management', label: 'Team Dashboard', hint: 'Overview' },
  { key: 'team-members', label: 'Members', disabled: true },
  { key: 'policies', label: 'Policies', disabled: true },
  { key: 'training', label: 'Training', disabled: true },
  { key: 'reports', label: 'Reports', disabled: true },
];

function ManagerLayout({ children, onNavigate }) {
  const handleNavigate = (key, disabled) => {
    if (disabled) {
      return;
    }

    if (key === 'main-dashboard' && typeof onNavigate === 'function') {
      onNavigate('dashboard');
      return;
    }

    if (typeof onNavigate === 'function') {
      onNavigate(key);
    }
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
                  className={`manager-sidebar__link ${item.key === 'team-management' ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''}`}
                  onClick={() => handleNavigate(item.key, item.disabled)}
                  disabled={item.disabled}
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
            onClick={() => handleNavigate('main-dashboard')}
          >
            ← Back to main dashboard
          </button>
        </div>
      </aside>
      <div className="manager-main">
        <header className="manager-header">
          <div>
            <h1>Compliance Manager</h1>
            <p>Control policy acknowledgements, training assignments, and team progress.</p>
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
