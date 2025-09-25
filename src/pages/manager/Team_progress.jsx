import React, { useMemo, useState } from "react";
import "./Team_progress.css";

const courseItems = [
  { id: "course_phishing_101", type: "course", title: "Phishing Awareness 101" },
  { id: "course_secure_browsing", type: "course", title: "Secure Browsing Basics" },
  { id: "course_incident_response", type: "course", title: "Incident Response Drill" },
];

const policyItems = [
  { id: "pol_email_security", type: "policy", title: "Email Security" },
  { id: "pol_remote_work", type: "policy", title: "Remote Work Guidelines" },
  { id: "pol_password_std", type: "policy", title: "Password Standard v2" },
];

const progressSeed = [
  {
    id: "row_1",
    member: "Kasun Perera",
    department: "Engineering",
    itemId: "course_phishing_101",
    itemTitle: "Phishing Awareness 101",
    itemType: "course",
    progress: 40,
    status: "pending",
    dueAt: "2025-10-05",
    lastActivity: "2025-09-18T06:00:00Z",
  },
  {
    id: "row_2",
    member: "Nimesha Fernando",
    department: "Finance",
    itemId: "course_phishing_101",
    itemTitle: "Phishing Awareness 101",
    itemType: "course",
    progress: 100,
    status: "passed",
    dueAt: "2025-09-22",
    lastActivity: "2025-09-20T07:12:00Z",
  },
  {
    id: "row_3",
    member: "Thilina Jay",
    department: "Marketing",
    itemId: "pol_email_security",
    itemTitle: "Email Security",
    itemType: "policy",
    progress: 0,
    status: "pending",
    dueAt: "2025-09-28",
    lastActivity: "2025-09-16T04:00:00Z",
  },
  {
    id: "row_4",
    member: "Ishara Dias",
    department: "Operations",
    itemId: "pol_remote_work",
    itemTitle: "Remote Work Guidelines",
    itemType: "policy",
    progress: 100,
    status: "passed",
    dueAt: "2025-09-18",
    lastActivity: "2025-09-18T11:00:00Z",
  },
  {
    id: "row_5",
    member: "Sajini Ranasinghe",
    department: "Sales",
    itemId: "course_secure_browsing",
    itemTitle: "Secure Browsing Basics",
    itemType: "course",
    progress: 65,
    status: "pending",
    dueAt: "2025-10-02",
    lastActivity: "2025-09-19T09:40:00Z",
  },
  {
    id: "row_6",
    member: "Kasun Perera",
    department: "Engineering",
    itemId: "pol_password_std",
    itemTitle: "Password Standard v2",
    itemType: "policy",
    progress: 0,
    status: "overdue",
    dueAt: "2025-09-15",
    lastActivity: "2025-09-20T08:10:00Z",
  },
  {
    id: "row_7",
    member: "Nimesha Fernando",
    department: "Finance",
    itemId: "course_secure_browsing",
    itemTitle: "Secure Browsing Basics",
    itemType: "course",
    progress: 25,
    status: "pending",
    dueAt: "2025-10-07",
    lastActivity: "2025-09-21T12:00:00Z",
  },
  {
    id: "row_8",
    member: "Ishara Dias",
    department: "Operations",
    itemId: "course_phishing_101",
    itemTitle: "Phishing Awareness 101",
    itemType: "course",
    progress: 80,
    status: "pending",
    dueAt: "2025-09-29",
    lastActivity: "2025-09-22T07:55:00Z",
  },
];

const statuses = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "passed", label: "Passed" },
  { value: "overdue", label: "Overdue" },
];

const pageSizeOptions = [5, 10, 20];

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

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
};

const statusTone = (status) => {
  switch (status) {
    case 'passed':
      return 'status-badge status-badge--success';
    case 'pending':
      return 'status-badge status-badge--pending';
    case 'overdue':
      return 'status-badge status-badge--danger';
    default:
      return 'status-badge';
  }
};

function TeamProgress() {
  const [itemFilter, setItemFilter] = useState({ type: 'course', id: 'all' });
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilterValue, setStatusFilterValue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [page, setPage] = useState(0);

  const allDepartments = useMemo(() => {
    const result = new Set(progressSeed.map((row) => row.department));
    return ['all', ...Array.from(result)];
  }, []);

  const itemsByType = useMemo(() => ({
    course: [{ id: 'all', title: 'All courses' }, ...courseItems],
    policy: [{ id: 'all', title: 'All policies' }, ...policyItems],
  }), []);

  const filteredRows = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return progressSeed.filter((row) => {
      if (itemFilter.type && itemFilter.type !== row.itemType) {
        return false;
      }

      if (itemFilter.id !== 'all' && row.itemId !== itemFilter.id) {
        return false;
      }

      if (departmentFilter !== 'all' && row.department !== departmentFilter) {
        return false;
      }

      if (statusFilterValue !== 'all' && row.status !== statusFilterValue) {
        return false;
      }

      if (needle) {
        const haystack = `${row.member} ${row.itemTitle}`.toLowerCase();
        if (!haystack.includes(needle)) {
          return false;
        }
      }

      return true;
    });
  }, [departmentFilter, itemFilter, searchTerm, statusFilterValue]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filteredRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const handleItemTypeChange = (event) => {
    const nextType = event.target.value;
    setItemFilter({ type: nextType, id: 'all' });
    setPage(0);
  };

  const handleItemChange = (event) => {
    setItemFilter((prev) => ({ ...prev, id: event.target.value }));
    setPage(0);
  };

  const handleDepartmentChange = (event) => {
    setDepartmentFilter(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatusFilterValue(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const goToPage = (direction) => {
    setPage((prev) => {
      if (direction === 'prev') {
        return Math.max(0, prev - 1);
      }
      if (direction === 'next') {
        return Math.min(totalPages - 1, prev + 1);
      }
      return prev;
    });
  };

  const handleExport = () => {
    const headers = ['Member', 'Department', 'Item', 'Progress', 'Due', 'Status', 'Last activity'];
    const rows = filteredRows.map((row) => [
      row.member,
      row.department,
      row.itemTitle,
      `${row.progress}%`,
      formatDate(row.dueAt),
      row.status,
      formatDateTime(row.lastActivity),
    ]);

    const csvData = [headers, ...rows]
      .map((record) => record.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'team-progress.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="team-progress">
      <header className="team-progress__header">
        <div>
          <h2>Team progress report</h2>
          <p>Filter by course or policy, then export matching records for stakeholder reporting.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Export CSV
        </button>
      </header>

      <section className="team-progress__filters">
        <div className="filter-group">
          <label htmlFor="itemType">Type</label>
          <select id="itemType" value={itemFilter.type} onChange={handleItemTypeChange}>
            <option value="course">Courses</option>
            <option value="policy">Policies</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="item">Item</label>
          <select id="item" value={itemFilter.id} onChange={handleItemChange}>
            {itemsByType[itemFilter.type].map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.title}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="department">Department</label>
          <select id="department" value={departmentFilter} onChange={handleDepartmentChange}>
            {allDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All departments' : dept}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select id="status" value={statusFilterValue} onChange={handleStatusChange}>
            {statuses.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Search by member or item"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="pageSize">Rows per page</label>
          <select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="team-progress__table">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Item</th>
              <th>Progress</th>
              <th>Due</th>
              <th>Status</th>
              <th>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="member-cell">
                    <span className="member-name">{row.member}</span>
                    <span className="member-meta">{row.department}</span>
                  </div>
                </td>
                <td>
                  <div className="item-cell">
                    <span className="item-title">{row.itemTitle}</span>
                    <span className="item-meta">{row.itemType === 'course' ? 'Course' : 'Policy'}</span>
                  </div>
                </td>
                <td>
                  <div className="progress-meter">
                    <div className="progress-bar">
                      <span style={{ width: `${Math.min(100, row.progress)}%` }} />
                    </div>
                    <span className="progress-value">{row.progress}%</span>
                  </div>
                </td>
                <td>{formatDate(row.dueAt)}</td>
                <td>
                  <span className={statusTone(row.status)}>{row.status}</span>
                </td>
                <td>{formatDateTime(row.lastActivity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageRows.length === 0 && (
          <div className="empty-state">No progress records match the selected filters.</div>
        )}
      </section>

      <footer className="team-progress__pagination">
        <button type="button" className="btn" onClick={() => goToPage('prev')} disabled={currentPage === 0}>
          Previous
        </button>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="btn"
          onClick={() => goToPage('next')}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </footer>
    </div>
  );
}

export default TeamProgress;
