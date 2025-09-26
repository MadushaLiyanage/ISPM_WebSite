import React, { useEffect, useMemo, useRef, useState } from "react";
import "./M_dashboard.css";

const kpis = [
  { key: "acks", label: "Pending acknowledgements", value: 12, delta: +3 },
  { key: "training", label: "Pending training", value: 9, delta: -2 },
  { key: "overdue", label: "Overdue items", value: 7, delta: +1 },
  { key: "completed", label: "Completed this week", value: 18, delta: +6 },
];

const completions7d = [
  { day: "Mon", completions: 2 },
  { day: "Tue", completions: 3 },
  { day: "Wed", completions: 1 },
  { day: "Thu", completions: 5 },
  { day: "Fri", completions: 4 },
  { day: "Sat", completions: 2 },
  { day: "Sun", completions: 1 },
];

const upcomingDeadlines = [
  { id: "d1", dueLabel: "Sep 23", title: "Email security refresher", owner: "Marketing" },
  { id: "d2", dueLabel: "Sep 24", title: "Remote work policy ack", owner: "Engineering" },
  { id: "d3", dueLabel: "Sep 26", title: "Incident response drill", owner: "Operations" },
];

const overdueRows = [
  { id: "o1", name: "Kasun Perera", itemType: "Policy", itemTitle: "Email Security", dueAt: "2025-09-20", daysLate: 5 },
  { id: "o2", name: "Nimesha Fernando", itemType: "Course", itemTitle: "Phishing Awareness 101", dueAt: "2025-09-18", daysLate: 7 },
  { id: "o3", name: "Thilina Jay", itemType: "Policy", itemTitle: "Password Standard v2", dueAt: "2025-09-19", daysLate: 6 },
  { id: "o4", name: "Ishara Dias", itemType: "Course", itemTitle: "Secure Browsing Basics", dueAt: "2025-09-22", daysLate: 3 },
  { id: "o5", name: "Sajini Ranasinghe", itemType: "Policy", itemTitle: "Remote Work Guidelines", dueAt: "2025-09-17", daysLate: 8 },
];

const reminderActivitySeed = [
  { id: "a1", message: "Reminder email sent to Kasun Perera", timestamp: "2h ago" },
  { id: "a2", message: "Escalation raised for Password Standard v2", timestamp: "Yesterday" },
  { id: "a3", message: "Bulk reminder queued for Sales", timestamp: "Mon" },
];

const assignableItems = [
  { id: "pol_email_security", label: "Email Security", type: "policy" },
  { id: "pol_remote_work", label: "Remote Work Guidelines", type: "policy" },
  { id: "course_phishing_101", label: "Phishing Awareness 101", type: "course" },
  { id: "course_secure_browsing", label: "Secure Browsing Basics", type: "course" },
];

const departments = ["Finance", "HR", "IT", "Operations", "Sales"];

const reminderDefaults = { channel: "email", message: "" };

const getAssignmentDefaults = (dueDate) => {
  const defaultType = "policy";
  const firstItem = assignableItems.find((item) => item.type === defaultType);
  return {
    audience: "users",
    department: departments[0],
    userList: "",
    itemType: defaultType,
    itemId: firstItem ? firstItem.id : "",
    dueAt: dueDate,
    notify: true,
  };
};

const formatDate = (value) => {
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return value;
  }
};

function StatusPill({ label }) {
  const tone = label.toLowerCase() === "policy" ? "policy" : "course";
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}

function ManagerDashboard() {
  const assignFormRef = useRef(null);
  const reminderFormRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activity, setActivity] = useState(reminderActivitySeed);
  const [toast, setToast] = useState(null);
  const [assignment, setAssignment] = useState(() => getAssignmentDefaults(new Date().toISOString().slice(0, 10)));
  const [reminderForm, setReminderForm] = useState({ ...reminderDefaults });

  const filteredOverdue = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) {
      return overdueRows;
    }
    return overdueRows.filter((row) =>
      row.name.toLowerCase().includes(needle) ||
      row.itemTitle.toLowerCase().includes(needle) ||
      row.itemType.toLowerCase().includes(needle)
    );
  }, [searchTerm]);

  const maxCompletions = useMemo(() => {
    const values = completions7d.map((entry) => entry.completions);
    return values.length ? Math.max(...values) : 1;
  }, []);

  const totalCompletions = useMemo(
    () => completions7d.reduce((sum, entry) => sum + entry.completions, 0),
    []
  );

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, tone = "info") => {
    setToast({ message, tone });
  };

  const addActivity = (message) => {
    setActivity((prev) => [
      { id: Date.now().toString(), message, timestamp: "Just now" },
      ...prev,
    ].slice(0, 6));
  };

  const handleAssignmentChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "audience") {
      setAssignment((prev) => ({
        ...prev,
        audience: value,
        userList: value === "users" ? prev.userList : "",
      }));
      return;
    }

    if (name === "itemType") {
      const firstMatch = assignableItems.find((item) => item.type === value);
      setAssignment((prev) => ({
        ...prev,
        itemType: value,
        itemId: firstMatch ? firstMatch.id : "",
      }));
      return;
    }

    setAssignment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAssignmentSubmit = (event) => {
    event.preventDefault();

    if (assignment.audience === "users" && !assignment.userList.trim()) {
      showToast("Add at least one user email before assigning.", "error");
      return;
    }

    if (assignment.audience === "dept" && !assignment.department) {
      showToast("Select a department for this assignment.", "error");
      return;
    }

    const audienceLabel = assignment.audience === "dept"
      ? `${assignment.department} department`
      : "selected users";

    addActivity(`Assignment prepared for the ${audienceLabel}.`);
    showToast("Assignment prepared. Review the activity log for details.", "success");
    setAssignment(getAssignmentDefaults(new Date().toISOString().slice(0, 10)));
  };

  const handleReminderChange = (event) => {
    const { name, value } = event.target;
    setReminderForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReminderSubmit = (event) => {
    event.preventDefault();

    if (!reminderForm.message.trim()) {
      showToast("Please add a short reminder message.", "error");
      return;
    }

    addActivity(`Reminder scheduled via ${reminderForm.channel.toUpperCase()}.`);
    showToast("Reminder queued for delivery.", "success");
    setReminderForm({ ...reminderDefaults });
  };

  const handleReminderDraft = (row) => {
    const friendlyName = row.name.split(" ")[0];
    const draft = `Hi ${friendlyName}, friendly reminder to complete "${row.itemTitle}".`;
    setReminderForm((prev) => ({ ...prev, message: draft }));
    reminderFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`Reminder draft prepared for ${row.name}.`, "info");
  };

  const handleBulkReminder = () => {
    const draft = "Friendly reminder to complete your outstanding policies and training.";
    setReminderForm((prev) => ({ ...prev, message: draft }));
    reminderFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Bulk reminder message drafted. Review below before sending.", "info");
  };

  const handleEscalate = (row) => {
    addActivity(`Escalation note captured for ${row.name}.`);
    showToast(`Escalation recorded for ${row.name}.`, "success");
  };

  const filteredItems = useMemo(
    () => assignableItems.filter((item) => item.type === assignment.itemType),
    [assignment.itemType]
  );

  return (
    <div className="manager-dashboard">
      <header className="manager-dashboard__header">
        <div>
          <h1>Team compliance dashboard</h1>
          <p>Monitor acknowledgements, training progress, and overdue tasks in one place.</p>
        </div>
        <div className="manager-dashboard__actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => assignFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            Assign item
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBulkReminder}
          >
            Send reminder
          </button>
        </div>
      </header>

      {toast && (
        <div className={`manager-dashboard__toast manager-dashboard__toast--${toast.tone}`} role="status">
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)}>Close</button>
        </div>
      )}

      <section className="manager-dashboard__metrics">
        {kpis.map((item) => (
          <article key={item.key} className="metric-card">
            <p className="metric-card__label">{item.label}</p>
            <p className="metric-card__value">{item.value}</p>
            {typeof item.delta === "number" && item.delta !== 0 && (
              <span className={`metric-card__delta ${item.delta > 0 ? "is-up" : "is-down"}`}>
                {item.delta > 0 ? "+" : ""}
                {item.delta} since last week
              </span>
            )}
          </article>
        ))}
      </section>

      <section className="manager-dashboard__grid">
        <div className="manager-dashboard__column">
          <div className="manager-dashboard__card">
            <div className="manager-dashboard__card-header">
              <div>
                <h3>Completions (7 days)</h3>
                <p>{totalCompletions} items completed this week.</p>
              </div>
            </div>
            <div className="completion-list">
              {completions7d.map((entry) => (
                <div key={entry.day} className="completion-row">
                  <span className="completion-day">{entry.day}</span>
                  <div className="completion-bar">
                    <span style={{ width: `${(entry.completions / maxCompletions) * 100}%` }} />
                  </div>
                  <span className="completion-value">{entry.completions}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="manager-dashboard__card" ref={assignFormRef}>
            <div className="manager-dashboard__card-header">
              <div>
                <h3>Assign new training or policy</h3>
                <p>Target a department or specific people with a due date.</p>
              </div>
            </div>
            <form className="manager-dashboard__form" onSubmit={handleAssignmentSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="audience">Audience</label>
                  <select
                    id="audience"
                    name="audience"
                    value={assignment.audience}
                    onChange={handleAssignmentChange}
                  >
                    <option value="users">Specific users</option>
                    <option value="dept">Department</option>
                  </select>
                </div>
                {assignment.audience === "dept" && (
                  <div className="form-field">
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      name="department"
                      value={assignment.department}
                      onChange={handleAssignmentChange}
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {assignment.audience === "users" && (
                <div className="form-field">
                  <label htmlFor="userList">Users (comma separated emails)</label>
                  <textarea
                    id="userList"
                    name="userList"
                    value={assignment.userList}
                    onChange={handleAssignmentChange}
                    placeholder="kasun@company.com, nimesha@company.com"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="itemType">Item type</label>
                  <select
                    id="itemType"
                    name="itemType"
                    value={assignment.itemType}
                    onChange={handleAssignmentChange}
                  >
                    <option value="policy">Policy</option>
                    <option value="course">Course</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="itemId">Item</label>
                  <select
                    id="itemId"
                    name="itemId"
                    value={assignment.itemId}
                    onChange={handleAssignmentChange}
                  >
                    {filteredItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="dueAt">Due date</label>
                  <input
                    id="dueAt"
                    name="dueAt"
                    type="date"
                    value={assignment.dueAt}
                    onChange={handleAssignmentChange}
                  />
                </div>
                <div className="form-field checkbox-row">
                  <input
                    id="notify"
                    name="notify"
                    type="checkbox"
                    checked={assignment.notify}
                    onChange={handleAssignmentChange}
                  />
                  <label htmlFor="notify">Send notification immediately</label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Queue assignment
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="manager-dashboard__column">
          <div className="manager-dashboard__card">
            <div className="manager-dashboard__card-header">
              <div>
                <h3>Upcoming deadlines</h3>
                <p>Keep an eye on items expiring soon.</p>
              </div>
            </div>
            <ul className="deadline-list">
              {upcomingDeadlines.map((item) => (
                <li key={item.id} className="deadline-item">
                  <span className="deadline-badge">{item.dueLabel}</span>
                  <div>
                    <p className="deadline-title">{item.title}</p>
                    <p className="deadline-owner">Owner: {item.owner}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="manager-dashboard__card" ref={reminderFormRef}>
            <div className="manager-dashboard__card-header">
              <div>
                <h3>Send ad-hoc reminder</h3>
                <p>Create a quick message and choose the channel.</p>
              </div>
            </div>
            <form className="manager-dashboard__form" onSubmit={handleReminderSubmit}>
              <div className="form-field">
                <label htmlFor="channel">Channel</label>
                <select
                  id="channel"
                  name="channel"
                  value={reminderForm.channel}
                  onChange={handleReminderChange}
                >
                  <option value="email">Email</option>
                  <option value="in-app">In-app</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={reminderForm.message}
                  onChange={handleReminderChange}
                  placeholder="Friendly reminder to complete your outstanding items."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Send reminder
                </button>
              </div>
            </form>
          </div>

          <div className="manager-dashboard__card">
            <div className="manager-dashboard__card-header">
              <div>
                <h3>Recent activity</h3>
                <p>Latest reminders and escalations captured.</p>
              </div>
            </div>
            <ul className="activity-list">
              {activity.map((entry) => (
                <li key={entry.id} className="activity-item">
                  <p>{entry.message}</p>
                  <span>{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="manager-dashboard__card">
        <div className="manager-dashboard__card-header">
          <div>
            <h3>Overdue items</h3>
            <p>Targeted list of users who need follow-up.</p>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search name or item"
          />
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Item</th>
                <th>Due</th>
                <th>Days late</th>
                <th className="table-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOverdue.map((row) => (
                <tr key={row.id}>
                  <td className="overdue-user">
                    <span className="overdue-name">{row.name}</span>
                  </td>
                  <td>
                    <div className="overdue-item">
                      <StatusPill label={row.itemType} />
                      <span>{row.itemTitle}</span>
                    </div>
                  </td>
                  <td>{formatDate(row.dueAt)}</td>
                  <td>{row.daysLate}</td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() => handleReminderDraft(row)}
                    >
                      Remind
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleEscalate(row)}
                    >
                      Escalate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOverdue.length === 0 && (
            <div className="manager-dashboard__empty">No overdue items match your search.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ManagerDashboard;
