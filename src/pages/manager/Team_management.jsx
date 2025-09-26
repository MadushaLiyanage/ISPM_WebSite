import React from "react";
import "./Team_management.css";

const roles = ["employee", "manager", "admin"];
const departments = ["HR", "Finance", "Engineering", "Sales", "Operations"];
const initialRows = [
  { id: "u1", name: "Nimal Perera", email: "nimal@company.com", role: "employee", department: "Engineering", active: true },
  { id: "u2", name: "Sithmi Jay", email: "sithmi@company.com", role: "employee", department: "Sales", active: true },
  { id: "u3", name: "Kasun Silva", email: "kasun@company.com", role: "manager", department: "Operations", active: true },
  { id: "u4", name: "Ishara Fernando", email: "ishara@company.com", role: "employee", department: "HR", active: false },
];

const memberInsights = {
  u1: {
    progress: [
      { label: "Email Security", percent: 100 },
      { label: "Remote Work", percent: 60 },
      { label: "Phishing 101", percent: 40 },
    ],
    recent: [
      { title: "Policy: Email Security", status: "Acknowledged" },
      { title: "Course: Secure Browsing", status: "60% complete" },
    ],
  },
  u2: {
    progress: [
      { label: "Sales Playbook", percent: 80 },
      { label: "Phishing 101", percent: 100 },
    ],
    recent: [
      { title: "Course: Phishing 101", status: "Completed" },
      { title: "Policy: Remote Work", status: "Pending" },
    ],
  },
  u3: {
    progress: [
      { label: "Manager Handbook", percent: 100 },
      { label: "Incident Response", percent: 75 },
    ],
    recent: [
      { title: "Policy: Manager Handbook", status: "Acknowledged" },
      { title: "Course: Incident Response", status: "In progress" },
    ],
  },
  u4: {
    progress: [
      { label: "HR Basics", percent: 20 },
      { label: "Phishing 101", percent: 0 },
    ],
    recent: [
      { title: "Course: HR Basics", status: "20% complete" },
      { title: "Policy: Code of Conduct", status: "Pending" },
    ],
  },
};

function StatusBadge({ active }) {
  return (
    <span className={`team-status ${active ? "is-active" : "is-inactive"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function TeamManagement() {
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [deptFilter, setDeptFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rows, setRows] = React.useState(initialRows);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: roles[0],
    department: departments[0],
    status: "active",
  });
  const [auditLog, setAuditLog] = React.useState([
    { id: "log_1", message: "Imported initial roster from CSV", timestamp: "Yesterday" },
  ]);
  const [toast, setToast] = React.useState(null);

  const filteredRows = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((member) => {
      const matchesQuery =
        !needle ||
        member.name.toLowerCase().includes(needle) ||
        member.email.toLowerCase().includes(needle);
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesDept = deptFilter === "all" || member.department === deptFilter;
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? member.active : !member.active);
      return matchesQuery && matchesRole && matchesDept && matchesStatus;
    });
  }, [rows, query, roleFilter, deptFilter, statusFilter]);

  const metrics = React.useMemo(() => {
    const activeMembers = rows.filter((member) => member.active).length;
    const pendingMembers = rows.length - activeMembers;
    const completionRate = rows.length === 0 ? 0 : Math.round((activeMembers / rows.length) * 100);

    return [
      { label: "Total Members", value: rows.length },
      { label: "Active Members", value: activeMembers },
      { label: "Pending Invites", value: pendingMembers },
      { label: "Completion Rate", value: `${completionRate}%` },
    ];
  }, [rows]);

  const pushAudit = (message) => {
    setAuditLog((prev) => [
      { id: `log_${Date.now()}`, message, timestamp: "Just now" },
      ...prev,
    ].slice(0, 8));
  };

  const showToastMessage = (message, tone = "info") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFormFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddMember = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showToastMessage("Provide a name and email before adding a member.", "error");
      return;
    }

    const nextMember = {
      id: `u${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      department: formData.department,
      active: formData.status === "active",
    };

    setRows((previous) => [...previous, nextMember]);
    setFormData({ name: "", email: "", role: roles[0], department: departments[0], status: "active" });
    setShowAddForm(false);
    pushAudit(`Added ${nextMember.name} to the team (${nextMember.role}, ${nextMember.department}).`);
    showToastMessage(`Added ${nextMember.name} to your team.`, "success");
  };

  const handleRoleChange = (id, value) => {
    const member = rows.find((entry) => entry.id === id);
    if (!member) {
      return;
    }
    setRows((previous) => previous.map((entry) => (entry.id === id ? { ...entry, role: value } : entry)));
    setSelectedMember((prev) => (prev && prev.id === id ? { ...prev, role: value } : prev));
    pushAudit(`Updated ${member.name}'s role to ${value}.`);
    showToastMessage(`Role updated for ${member.name}.`, "success");
  };

  const handleDepartmentChange = (id, value) => {
    const member = rows.find((entry) => entry.id === id);
    if (!member) {
      return;
    }
    setRows((previous) => previous.map((entry) => (entry.id === id ? { ...entry, department: value } : entry)));
    setSelectedMember((prev) => (prev && prev.id === id ? { ...prev, department: value } : prev));
    pushAudit(`Moved ${member.name} to the ${value} department.`);
    showToastMessage(`Department updated for ${member.name}.`, "success");
  };

  const handleRemove = (id) => {
    const member = rows.find((entry) => entry.id === id);
    setRows((previous) => previous.filter((entry) => entry.id !== id));
    if (selectedMember?.id === id) {
      setSelectedMember(null);
    }
    if (member) {
      pushAudit(`Removed ${member.name} from your managed team.`);
      showToastMessage(`${member.name} removed from the team.`, "success");
    }
  };

  const openProfile = (member) => {
    const insights = memberInsights[member.id] ?? { progress: [], recent: [] };
    setSelectedMember({ ...member, ...insights });
  };

  return (
    <div className="team-management">
      <section className="team-management__toolbar">
        <div>
          <h2>Team Management</h2>
          <p>Maintain the company roster, roles, and compliance status from a single workspace.</p>
        </div>
        <button
          type="button"
          className="team-management__cta"
          onClick={() => setShowAddForm((previous) => !previous)}
        >
          {showAddForm ? "Close" : "Add Member"}
        </button>
      </section>

      {toast && (
        <div className={`team-toast team-toast--${toast.tone}`} role="status">
          <span>{toast.message}</span>
        </div>
      )}

      <section className="team-management__metrics">
        {metrics.map((metric) => (
          <article key={metric.label} className="team-metric">
            <p className="team-metric__label">{metric.label}</p>
            <p className="team-metric__value">{metric.value}</p>
          </article>
        ))}
      </section>

      {showAddForm && (
        <form className="team-management__form" onSubmit={handleAddMember}>
          <div className="team-form__field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormFieldChange}
              placeholder="Jane Doe"
            />
          </div>
          <div className="team-form__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormFieldChange}
              placeholder="jane@company.com"
            />
          </div>
          <div className="team-form__field">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleFormFieldChange}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="team-form__field">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleFormFieldChange}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="team-form__field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleFormFieldChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="team-form__actions">
            <button type="submit">Save Member</button>
          </div>
        </form>
      )}

      <section className="team-management__panel">
        <div className="team-panel__filters">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select value={deptFilter} onChange={(event) => setDeptFilter(event.target.value)}>
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="team-panel__table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th className="team-table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="team-table__member">
                      <span className="team-avatar">
                        {member.name
                          .split(" ")
                          .filter(Boolean)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span>{member.name}</span>
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <select
                      value={member.role}
                      onChange={(event) => handleRoleChange(member.id, event.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={member.department}
                      onChange={(event) => handleDepartmentChange(member.id, event.target.value)}
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <StatusBadge active={member.active} />
                  </td>
                  <td className="team-table__actions">
                    <div className="team-table__buttons">
                      <button type="button" onClick={() => openProfile(member)}>
                        View
                      </button>
                      <button type="button" onClick={() => handleRemove(member.id)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="team-table__empty">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedMember && (
        <aside className="team-management__profile" role="dialog" aria-modal="true">
          <header>
            <h3>{selectedMember.name}</h3>
            <button type="button" onClick={() => setSelectedMember(null)}>
              Close
            </button>
          </header>
          <div className="team-profile__body">
            <p><strong>Email:</strong> {selectedMember.email}</p>
            <p><strong>Role:</strong> {selectedMember.role}</p>
            <p><strong>Department:</strong> {selectedMember.department}</p>
            <p><strong>Status:</strong> {selectedMember.active ? "Active" : "Inactive"}</p>
            <div className="team-profile__section">
              <h4>Progress summary</h4>
              <ul>
                {selectedMember.progress?.map((record) => (
                  <li key={record.label}>
                    <span>{record.label}</span>
                    <span>{record.percent}%</span>
                  </li>
                )) || <li>No progress data available.</li>}
              </ul>
            </div>
            <div className="team-profile__section">
              <h4>Recent assignments</h4>
              <ul>
                {selectedMember.recent?.map((record, index) => (
                  <li key={`${record.title}-${index}`}>
                    <span>{record.title}</span>
                    <span>{record.status}</span>
                  </li>
                )) || <li>No recent activity recorded.</li>}
              </ul>
            </div>
          </div>
        </aside>
      )}

      <section className="team-management__log">
        <h3>Audit log</h3>
        <ul>
          {auditLog.map((entry) => (
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

export default TeamManagement;
