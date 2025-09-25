import React, { useMemo, useState } from "react";
import "./Non_compliance.css";

const overdueSeed = [
  {
    id: "nc_1",
    userId: "u_kasun",
    name: "Kasun Perera",
    itemId: "pol_email_security",
    itemTitle: "Email Security",
    itemType: "policy",
    dueAt: "2025-09-20",
    daysLate: 5,
    lastRemindedAt: "2025-09-21T08:15:00Z",
    escalate: false,
  },
  {
    id: "nc_2",
    userId: "u_nimesha",
    name: "Nimesha Fernando",
    itemId: "pol_remote_work",
    itemTitle: "Remote Work Guidelines",
    itemType: "policy",
    dueAt: "2025-09-18",
    daysLate: 7,
    lastRemindedAt: "2025-09-19T09:00:00Z",
    escalate: false,
  },
  {
    id: "nc_3",
    userId: "u_thilina",
    name: "Thilina Jay",
    itemId: "course_phishing_101",
    itemTitle: "Phishing Awareness 101",
    itemType: "course",
    dueAt: "2025-09-19",
    daysLate: 6,
    lastRemindedAt: null,
    escalate: false,
  },
  {
    id: "nc_4",
    userId: "u_ishara",
    name: "Ishara Dias",
    itemId: "course_secure_browsing",
    itemTitle: "Secure Browsing Basics",
    itemType: "course",
    dueAt: "2025-09-22",
    daysLate: 3,
    lastRemindedAt: "2025-09-22T07:30:00Z",
    escalate: true,
  },
];

const formatDate = (value) => {
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch (err) {
    return value;
  }
};

const formatTimeAgo = (value) => {
  if (!value) {
    return "—";
  }
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d ago`;
};

function NonCompliance() {
  const [rows, setRows] = useState(overdueSeed);
  const [activity, setActivity] = useState([
    { id: 'log_1', message: 'Reminder email sent to Kasun (Email Security)', timestamp: '2h ago' },
    { id: 'log_2', message: 'Escalated Remote Work Guidelines for Ishara', timestamp: 'Yesterday' },
  ]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredRows = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      if (filterType !== 'all' && row.itemType !== filterType) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const haystack = `${row.name} ${row.itemTitle}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [filterType, rows, searchTerm]);

  const addActivity = (message) => {
    setActivity((prev) => [
      { id: `log_${Date.now()}`, message, timestamp: 'Just now' },
      ...prev,
    ].slice(0, 8));
  };

  const showToast = (message, tone = 'info') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const handleReminder = (row) => {
    setRows((prev) => prev.map((entry) => (
      entry.id === row.id
        ? { ...entry, lastRemindedAt: new Date().toISOString() }
        : entry
    )));
    addActivity(`Reminder queued for ${row.name} (${row.itemTitle}).`);
    showToast('Reminder queued for delivery.', 'success');
  };

  const handleEscalate = (row) => {
    setRows((prev) => prev.map((entry) => (
      entry.id === row.id
        ? { ...entry, escalate: true }
        : entry
    )));
    addActivity(`Escalation captured for ${row.name} (${row.itemTitle}).`);
    showToast('Escalation recorded and sent to stakeholders.', 'success');
  };

  return (
    <div className="non-compliance">
      <header className="non-compliance__header">
        <div>
          <h2>Non-compliance follow-up</h2>
          <p>Only overdue policies and training appear here. Use quick actions to remind or escalate.</p>
        </div>
        <div className="non-compliance__filters">
          <input
            type="search"
            placeholder="Search by name or item"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            <option value="all">All types</option>
            <option value="policy">Policies</option>
            <option value="course">Courses</option>
          </select>
        </div>
      </header>

      {toast && (
        <div className={`non-compliance__toast non-compliance__toast--${toast.tone}`} role="status">
          <span>{toast.message}</span>
        </div>
      )}

      <section className="non-compliance__table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Item</th>
              <th>Due</th>
              <th>Days late</th>
              <th>Last reminded</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="member-cell">
                    <span className="member-name">{row.name}</span>
                  </div>
                </td>
                <td>
                  <div className="item-cell">
                    <span className="item-title">{row.itemTitle}</span>
                    <span className="item-meta">{row.itemType === 'course' ? 'Course' : 'Policy'}</span>
                  </div>
                </td>
                <td>{formatDate(row.dueAt)}</td>
                <td>{row.daysLate}</td>
                <td>
                  <span className="reminder-meta">{formatTimeAgo(row.lastRemindedAt)}</span>
                  {row.escalate && <span className="tag tag--alert">Escalated</span>}
                </td>
                <td className="actions">
                  <button type="button" className="btn" onClick={() => handleReminder(row)}>
                    Remind
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleEscalate(row)}>
                    Escalate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 && (
          <div className="empty-state">All caught up! No overdue records match the current filters.</div>
        )}
      </section>

      <section className="non-compliance__activity">
        <h3>Activity log</h3>
        <ul>
          {activity.map((entry) => (
            <li key={entry.id}>
              <p>{entry.message}</p>
              <span>{entry.timestamp}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default NonCompliance;
