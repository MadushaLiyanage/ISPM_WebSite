import React, { useMemo, useState } from "react";
import "./Assignment_management.css";

const stepOrder = ["audience", "item", "schedule", "confirm"];

const teamMembers = [
  { id: "u_kasun", name: "Kasun Perera", department: "Engineering" },
  { id: "u_nimesha", name: "Nimesha Fernando", department: "Finance" },
  { id: "u_thilina", name: "Thilina Jay", department: "Marketing" },
  { id: "u_ishara", name: "Ishara Dias", department: "Operations" },
];

const departments = ["Engineering", "Finance", "Marketing", "Operations", "Sales"];

const catalog = [
  { id: "pol_email_security", type: "policy", title: "Email Security" },
  { id: "pol_remote_work", type: "policy", title: "Remote Work Guidelines" },
  { id: "pol_password_std", type: "policy", title: "Password Standard v2" },
  { id: "course_phishing_101", type: "course", title: "Phishing Awareness 101" },
  { id: "course_secure_browsing", type: "course", title: "Secure Browsing Basics" },
  { id: "course_incident_response", type: "course", title: "Incident Response Drill" },
];

const seedAssignments = [
  {
    id: "log_1",
    message: "Assigned Remote Work Guidelines to Operations",
    when: "Today, 10:12 AM",
  },
  {
    id: "log_2",
    message: "Queued Phishing Awareness 101 for Marketing",
    when: "Yesterday, 3:45 PM",
  },
];

const defaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const buildSummary = (state) => {
  const audienceLabel = state.audience === "users"
    ? `${state.userIds.length} user${state.userIds.length === 1 ? "" : "s"}`
    : `${state.department} department`;

  const item = catalog.find((entry) => entry.id === state.itemId);

  return {
    audience: audienceLabel,
    item: item ? `${item.type === "policy" ? "Policy" : "Course"}: ${item.title}` : "-",
    dueAt: state.dueAt,
    notify: state.notify,
  };
};

function AssignmentManagement() {
  const [step, setStep] = useState(stepOrder[0]);
  const [toast, setToast] = useState(null);
  const [logs, setLogs] = useState(seedAssignments);

  const [assignment, setAssignment] = useState({
    audience: "users",
    userIds: [],
    department: departments[0],
    itemType: "policy",
    itemId: catalog.find((entry) => entry.type === "policy")?.id ?? "",
    dueAt: defaultDueDate(),
    notify: true,
  });

  const selectedItem = useMemo(
    () => catalog.find((entry) => entry.id === assignment.itemId) ?? null,
    [assignment.itemId]
  );

  const filteredCatalog = useMemo(
    () => catalog.filter((entry) => entry.type === assignment.itemType),
    [assignment.itemType]
  );

  const goToStep = (target) => {
    if (stepOrder.includes(target)) {
      setStep(target);
    }
  };

  const handleAudienceChange = (event) => {
    const { name, value, checked, type } = event.target;

    if (name === "audience") {
      if (value === "department") {
        setAssignment((prev) => ({
          ...prev,
          audience: "department",
          userIds: [],
        }));
      } else {
        setAssignment((prev) => ({
          ...prev,
          audience: "users",
        }));
      }
      return;
    }

    if (name === "member" && type === "checkbox") {
      setAssignment((prev) => {
        const exists = prev.userIds.includes(value);
        const nextUserIds = exists
          ? prev.userIds.filter((id) => id !== value)
          : [...prev.userIds, value];
        return { ...prev, userIds: nextUserIds };
      });
      return;
    }

    if (name === "department") {
      setAssignment((prev) => ({ ...prev, department: value }));
    }
  };

  const handleItemChange = (event) => {
    const { name, value } = event.target;
    if (name === "itemType") {
      const nextType = value;
      const nextItem = catalog.find((entry) => entry.type === nextType);
      setAssignment((prev) => ({
        ...prev,
        itemType: nextType,
        itemId: nextItem ? nextItem.id : "",
      }));
      return;
    }
    if (name === "itemId") {
      setAssignment((prev) => ({ ...prev, itemId: value }));
    }
  };

  const handleScheduleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAssignment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateAudience = () => {
    if (assignment.audience === "users" && assignment.userIds.length === 0) {
      setToast({ tone: "error", message: "Select at least one team member." });
      return false;
    }

    if (assignment.audience === "department" && !assignment.department) {
      setToast({ tone: "error", message: "Choose a department to continue." });
      return false;
    }

    return true;
  };

  const validateItem = () => {
    if (!assignment.itemId) {
      setToast({ tone: "error", message: "Pick a policy or course to assign." });
      return false;
    }
    return true;
  };

  const validateSchedule = () => {
    if (!assignment.dueAt) {
      setToast({ tone: "error", message: "Select a due date." });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex === stepOrder.length - 1) {
      return;
    }

    const nextStep = stepOrder[currentIndex + 1];
    if (step === 'audience' && !validateAudience()) {
      return;
    }
    if (step === 'item' && !validateItem()) {
      return;
    }
    if (step === 'schedule' && !validateSchedule()) {
      return;
    }
    setToast(null);
    setStep(nextStep);
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex === 0) {
      return;
    }
    setToast(null);
    setStep(stepOrder[currentIndex - 1]);
  };

  const handleAssign = () => {
    if (!validateSchedule()) {
      return;
    }

    const audienceLabel = assignment.audience === "users"
      ? `${assignment.userIds.length} user${assignment.userIds.length === 1 ? '' : 's'}`
      : `${assignment.department} department`;

    const item = selectedItem?.title ?? 'selected item';

    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        message: `Assignment scheduled: ${item} → ${audienceLabel}`,
        when: 'Just now',
      },
      ...prev,
    ].slice(0, 6));

    setToast({
      tone: 'success',
      message: `Assignment prepared for ${audienceLabel}.`,
    });

    setAssignment({
      audience: 'users',
      userIds: [],
      department: departments[0],
      itemType: 'policy',
      itemId: catalog.find((entry) => entry.type === 'policy')?.id ?? '',
      dueAt: defaultDueDate(),
      notify: true,
    });

    setStep(stepOrder[0]);
  };

  const summary = useMemo(() => buildSummary(assignment), [assignment]);

  return (
    <div className="assignment-wizard">
      <header className="assignment-wizard__header">
        <h2>Assignment management</h2>
        <p>Create targeted policy or course assignments in three quick steps.</p>
      </header>

      <nav className="assignment-steps" aria-label="Assignment steps">
        {stepOrder.map((key, index) => {
          const labels = {
            audience: 'Audience',
            item: 'Item',
            schedule: 'Schedule',
            confirm: 'Confirm',
          };

          return (
            <button
              key={key}
              type="button"
              className={`assignment-step ${step === key ? 'is-active' : ''}`}
              onClick={() => goToStep(key)}
            >
              <span className="assignment-step__index">{index + 1}</span>
              <span>{labels[key]}</span>
            </button>
          );
        })}
      </nav>

      {toast && (
        <div className={`assignment-toast assignment-toast--${toast.tone}`} role="status">
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)}>Dismiss</button>
        </div>
      )}

      <section className="assignment-panel">
        {step === 'audience' && (
          <div className="assignment-body">
            <div className="assignment-section">
              <h3>Who should receive this?</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="audience"
                    value="users"
                    checked={assignment.audience === 'users'}
                    onChange={handleAudienceChange}
                  />
                  Specific users
                </label>
                <label>
                  <input
                    type="radio"
                    name="audience"
                    value="department"
                    checked={assignment.audience === 'department'}
                    onChange={handleAudienceChange}
                  />
                  Department
                </label>
              </div>
            </div>

            {assignment.audience === 'users' && (
              <div className="assignment-section">
                <h4>Select team members</h4>
                <div className="member-grid">
                  {teamMembers.map((member) => (
                    <label key={member.id} className="member-card">
                      <input
                        type="checkbox"
                        name="member"
                        value={member.id}
                        checked={assignment.userIds.includes(member.id)}
                        onChange={handleAudienceChange}
                      />
                      <div>
                        <span className="member-name">{member.name}</span>
                        <span className="member-meta">{member.department}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {assignment.audience === 'department' && (
              <div className="assignment-section">
                <label htmlFor="department">Select a department</label>
                <select
                  id="department"
                  name="department"
                  value={assignment.department}
                  onChange={handleAudienceChange}
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
        )}

        {step === 'item' && (
          <div className="assignment-body">
            <div className="assignment-section">
              <h3>Select the item</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="itemType"
                    value="policy"
                    checked={assignment.itemType === 'policy'}
                    onChange={handleItemChange}
                  />
                  Policies
                </label>
                <label>
                  <input
                    type="radio"
                    name="itemType"
                    value="course"
                    checked={assignment.itemType === 'course'}
                    onChange={handleItemChange}
                  />
                  Courses
                </label>
              </div>
            </div>
            <div className="assignment-section">
              <label htmlFor="itemId">Pick one {assignment.itemType}</label>
              <select
                id="itemId"
                name="itemId"
                value={assignment.itemId}
                onChange={handleItemChange}
              >
                {filteredCatalog.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedItem && (
              <div className="assignment-hint">
                <p>
                  <strong>Summary:</strong> {selectedItem.title} is a {selectedItem.type}.
                  Assigning this item will create new progress records for your selected audience.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'schedule' && (
          <div className="assignment-body">
            <div className="assignment-section">
              <label htmlFor="dueAt">Due date</label>
              <input
                id="dueAt"
                name="dueAt"
                type="date"
                value={assignment.dueAt}
                onChange={handleScheduleChange}
              />
            </div>
            <div className="assignment-section">
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  name="notify"
                  checked={assignment.notify}
                  onChange={handleScheduleChange}
                />
                Send notification immediately after assigning
              </label>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="assignment-body">
            <div className="assignment-section">
              <h3>Review assignment</h3>
              <ul className="assignment-summary">
                <li>
                  <span>Audience</span>
                  <span>{summary.audience}</span>
                </li>
                <li>
                  <span>Item</span>
                  <span>{summary.item}</span>
                </li>
                <li>
                  <span>Due date</span>
                  <span>{summary.dueAt}</span>
                </li>
                <li>
                  <span>Notify immediately</span>
                  <span>{summary.notify ? 'Yes' : 'No'}</span>
                </li>
              </ul>
            </div>
            <div className="assignment-hint">
              <p>
                Confirming will queue a request to <code>POST /manager/assign</code> using the form data shown above.
                You can wire this into Firebase by creating assignment docs and seeding pending progress records.
              </p>
            </div>
          </div>
        )}
      </section>

      <footer className="assignment-footer">
        <button type="button" className="btn" onClick={handleBack} disabled={step === stepOrder[0]}>
          Back
        </button>
        {step !== stepOrder[stepOrder.length - 1] ? (
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={handleAssign}>
            Assign
          </button>
        )}
      </footer>

      <section className="assignment-log">
        <h3>Recent assignment activity</h3>
        <ul>
          {logs.map((entry) => (
            <li key={entry.id}>
              <p>{entry.message}</p>
              <span>{entry.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AssignmentManagement;
