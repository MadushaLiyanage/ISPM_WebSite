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
    const completionRate = activeMembers === 0 ? 0 : Math.round((activeMembers / rows.length) * 100);

    return [
      { label: "Total Members", value: rows.length },
      { label: "Active Members", value: activeMembers },
      { label: "Pending Invites", value: pendingMembers },
      { label: "Completion Rate", value: `${completionRate}%` },
    ];
  }, [rows]);

  const handleFormFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddMember = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
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
  };

  const handleRoleChange = (id, value) => {
    setRows((previous) => previous.map((member) => (member.id === id ? { ...member, role: value } : member)));
  };

  const handleDepartmentChange = (id, value) => {
    setRows((previous) => previous.map((member) => (member.id === id ? { ...member, department: value } : member)));
  };

  const handleRemove = (id) => {
    setRows((previous) => previous.filter((member) => member.id !== id));
    if (selectedMember?.id === id) {
      setSelectedMember(null);
    }
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
                      <button type="button" onClick={() => setSelectedMember(member)}>
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
          </div>
        </aside>
      )}
    </div>
  );
}

export default TeamManagement;
