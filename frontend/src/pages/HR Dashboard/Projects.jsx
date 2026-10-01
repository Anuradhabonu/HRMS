import React, { useEffect, useState } from "react";
import {
  MdWork,
  MdAdd,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
  MdCheckCircle,
  MdCancel,
  MdGroups,
  MdPerson,
  MdSelectAll,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const emptyForm = {
    project_name: "",
    description: "",
    status: "Active",
    employee_ids: [],
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= LOAD DATA ================= */

  const loadProjects = async () => {
    setLoading(true);

    try {
      const data = await apiFetch("/projects");

      setProjects(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Projects loading error:",
        error
      );

      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await apiFetch("/employees");

      setEmployees(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Employees loading error:",
        error
      );

      setEmployees([]);
    }
  };

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, []);

  /* ================= INPUT ================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= POPUPS ================= */

  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };

  const openView = (project) => {
    setSelectedProject(project);
    setShowView(true);
  };

  const openEdit = (project) => {
    setSelectedProject(project);

    const ids =
      project.employee_ids ||
      project.employeeIds ||
      [];

    setForm({
      project_name:
        project.project_name ||
        project.name ||
        "",
      description:
        project.description ||
        "",
      status:
        project.status ||
        "Active",
      employee_ids:
        Array.isArray(ids)
          ? ids.map(Number)
          : getAssignedEmployeeIds(project),
    });

    setShowEdit(true);
  };

  const openDelete = (project) => {
    setSelectedProject(project);
    setShowDelete(true);
  };

  const closeAllPopups = () => {
    setShowAdd(false);
    setShowView(false);
    setShowEdit(false);
    setShowDelete(false);

    setSelectedProject(null);
  };

  /* ================= EMPLOYEE IDS ================= */

  const getAssignedEmployeeIds = (project) => {
    if (
      Array.isArray(project?.employee_ids)
    ) {
      return project.employee_ids.map(Number);
    }

    if (
      Array.isArray(project?.employeeIds)
    ) {
      return project.employeeIds.map(Number);
    }

    if (
      Array.isArray(project?.employees)
    ) {
      return project.employees
        .map(
          (employee) =>
            employee.id ||
            employee.employee_id
        )
        .filter(Boolean)
        .map(Number);
    }

    if (project?.employee_id) {
      return [Number(project.employee_id)];
    }

    return [];
  };

  /* ================= CHECKBOX ================= */

  const toggleEmployee = (employeeId) => {
    const id = Number(employeeId);

    setForm((prev) => {
      const exists =
        prev.employee_ids.includes(id);

      return {
        ...prev,
        employee_ids: exists
          ? prev.employee_ids.filter(
              (item) => item !== id
            )
          : [...prev.employee_ids, id],
      };
    });
  };

  const selectAllEmployees = () => {
    const allIds = employees
      .map(
        (employee) =>
          employee.id ||
          employee.employee_id
      )
      .filter(Boolean)
      .map(Number);

    setForm((prev) => ({
      ...prev,
      employee_ids: allIds,
    }));
  };

  const clearAllEmployees = () => {
    setForm((prev) => ({
      ...prev,
      employee_ids: [],
    }));
  };

  const allEmployeesSelected =
    employees.length > 0 &&
    form.employee_ids.length ===
      employees.length;

  /* ================= ADD ================= */

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          project_name:
            form.project_name,
          description:
            form.description,
          status:
            form.status,
          employee_ids:
            form.employee_ids,
        }),
      });

      closeAllPopups();
      loadProjects();
    } catch (error) {
      console.error(
        "Add project error:",
        error
      );

      alert("Unable to add project.");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!selectedProject) return;

    const projectId =
      selectedProject.id ||
      selectedProject.project_id;

    try {
      await apiFetch(
        `/projects/${projectId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            project_name:
              form.project_name,
            description:
              form.description,
            status:
              form.status,
            employee_ids:
              form.employee_ids,
          }),
        }
      );

      closeAllPopups();
      loadProjects();
    } catch (error) {
      console.error(
        "Edit project error:",
        error
      );

      alert(
        "Unable to update project."
      );
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!selectedProject) return;

    const projectId =
      selectedProject.id ||
      selectedProject.project_id;

    try {
      await apiFetch(
        `/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      closeAllPopups();
      loadProjects();
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      alert(
        "Unable to delete project."
      );
    }
  };

  /* ================= HELPERS ================= */

  const getProjectName = (project) =>
    project?.project_name ||
    project?.name ||
    "Project";

  const getProjectId = (project) =>
    project?.project_id ||
    project?.id ||
    "-";

  const getAssignedNames = (project) => {
    if (
      Array.isArray(project?.employees)
    ) {
      return project.employees
        .map(
          (employee) =>
            employee.name ||
            employee.full_name ||
            `Employee #${
              employee.id ||
              employee.employee_id ||
              "-"
            }`
        )
        .join(", ");
    }

    const ids =
      getAssignedEmployeeIds(project);

    if (ids.length === 0) {
      return "No employees assigned";
    }

    return ids
      .map((id) => {
        const employee =
          employees.find(
            (item) =>
              Number(
                item.id ||
                  item.employee_id
              ) === Number(id)
          );

        return employee
          ? employee.name ||
              employee.full_name ||
              employee.employee_name
          : `Employee #${id}`;
      })
      .join(", ");
  };

  const activeProjects =
    projects.filter(
      (project) =>
        String(
          project.status || "Active"
        ).toLowerCase() === "active"
    ).length;

  const completedProjects =
    projects.filter(
      (project) =>
        String(
          project.status || ""
        ).toLowerCase() === "completed"
    ).length;

  const assignedProjects =
    projects.filter(
      (project) =>
        getAssignedEmployeeIds(
          project
        ).length > 0
    ).length;

  return (
    <div className="projects-page">

      {/* ================= HEADER ================= */}

      <div className="projects-header">

        <div className="projects-header-left">

          <button
            className="projects-back-btn"
            onClick={() =>
              window.history.back()
            }
          >
            <MdArrowBack />
            <span>Back</span>
          </button>

          <div>

            <div className="projects-title-row">

              <h1>Project Management</h1>

              <span className="projects-live-badge">
                <span></span>
                HR Management
              </span>

            </div>

            <p>
              Create projects, assign employees
              and manage project details.
            </p>

          </div>

        </div>

        <div className="projects-header-actions">

          <button
            className="projects-refresh-btn"
            onClick={() => {
              loadProjects();
              loadEmployees();
            }}
            disabled={loading}
          >
            <MdRefresh
              className={
                loading
                  ? "projects-refresh-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="projects-add-btn"
            onClick={openAdd}
          >
            <MdAdd />
            Add Project
          </button>

        </div>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="projects-summary-grid">

        <div className="projects-summary-card blue">

          <div className="projects-summary-icon">
            <MdWork />
          </div>

          <div>
            <span>Total Projects</span>
            <strong>
              {loading
                ? "..."
                : projects.length}
            </strong>
          </div>

        </div>

        <div className="projects-summary-card green">

          <div className="projects-summary-icon">
            <MdCheckCircle />
          </div>

          <div>
            <span>Active Projects</span>
            <strong>
              {loading
                ? "..."
                : activeProjects}
            </strong>
          </div>

        </div>

        <div className="projects-summary-card orange">

          <div className="projects-summary-icon">
            <MdGroups />
          </div>

          <div>
            <span>Assigned Projects</span>
            <strong>
              {loading
                ? "..."
                : assignedProjects}
            </strong>
          </div>

        </div>

        <div className="projects-summary-card purple">

          <div className="projects-summary-icon">
            <MdCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {loading
                ? "..."
                : completedProjects}
            </strong>
          </div>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="projects-table-card">

        <div className="projects-table-header">

          <div>
            <h2>Project Directory</h2>

            <p>
              View and manage all organization
              projects.
            </p>
          </div>

          <span className="projects-count-badge">
            {projects.length} Projects
          </span>

        </div>

        <div className="projects-table-wrapper">

          <table className="projects-table">

            <thead>

              <tr>
                <th>Project ID</th>
                <th>Project</th>
                <th>Description</th>
                <th>Assigned Employees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="projects-empty"
                  >
                    Loading projects...
                  </td>

                </tr>

              ) : projects.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="projects-empty"
                  >

                    <MdWork />

                    <strong>
                      No projects found
                    </strong>

                    <span>
                      Add a project to see it
                      here.
                    </span>

                  </td>

                </tr>

              ) : (

                projects.map(
                  (project, index) => {

                    const status =
                      project.status ||
                      "Active";

                    const statusClass =
                      String(
                        status
                      ).toLowerCase();

                    return (

                      <tr
                        key={
                          project.id ||
                          project.project_id ||
                          index
                        }
                      >

                        <td>

                          <span className="project-id">
                            #
                            {getProjectId(
                              project
                            )}
                          </span>

                        </td>

                        <td>

                          <div className="project-name-cell">

                            <div className="project-avatar">
                              <MdWork />
                            </div>

                            <div>

                              <strong>
                                {getProjectName(
                                  project
                                )}
                              </strong>

                              <span>
                                Project
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="project-description">

                            {project.description ||
                              "-"}

                          </span>

                        </td>

                        <td>

                          <div className="project-assigned-cell">

                            <MdGroups />

                            <span>
                              {
                                getAssignedNames(
                                  project
                                )
                              }
                            </span>

                          </div>

                        </td>

                        <td>

                          <span
                            className={`project-status ${statusClass}`}
                          >

                            {statusClass ===
                            "completed" ? (
                              <MdCheckCircle />
                            ) : statusClass ===
                              "inactive" ? (
                              <MdCancel />
                            ) : (
                              <MdCheckCircle />
                            )}

                            {status}

                          </span>

                        </td>

                        <td>

                          <div className="project-actions">

                            <button
                              className="project-action-btn view"
                              title="View"
                              onClick={() =>
                                openView(
                                  project
                                )
                              }
                            >
                              <MdVisibility />
                            </button>

                            <button
                              className="project-action-btn edit"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  project
                                )
                              }
                            >
                              <MdEdit />
                            </button>

                            <button
                              className="project-action-btn delete"
                              title="Delete"
                              onClick={() =>
                                openDelete(
                                  project
                                )
                              }
                            >
                              <MdDelete />
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          ADD PROJECT POPUP
      ====================================================== */}

      {showAdd && (

        <div
          className="project-modal-overlay"
          onClick={closeAllPopups}
        >

          <div
            className="project-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="project-modal-header">

              <div>

                <div className="project-modal-icon add">
                  <MdAdd />
                </div>

                <div>

                  <h2>
                    Add Project
                  </h2>

                  <p>
                    Create a new project and
                    assign employees.
                  </p>

                </div>

              </div>

              <button
                className="project-modal-close"
                onClick={closeAllPopups}
              >
                <MdClose />
              </button>

            </div>

            <form onSubmit={handleAdd}>

              <div className="project-form-grid">

                <div className="project-form-group">

                  <label>
                    Project Name
                  </label>

                  <input
                    type="text"
                    name="project_name"
                    value={
                      form.project_name
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter project name"
                    required
                  />

                </div>

                <div className="project-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>

                <div className="project-form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter project description"
                    rows="4"
                  />

                </div>

              </div>

              {/* EMPLOYEE ASSIGNMENT */}

              <div className="project-assignment-box">

                <div className="project-assignment-header">

                  <div>

                    <h3>
                      Assign Employees
                    </h3>

                    <p>
                      Select one or multiple
                      employees.
                    </p>

                  </div>

                  <span>
                    {form.employee_ids.length}{" "}
                    Selected
                  </span>

                </div>

                <div className="project-select-actions">

                  <button
                    type="button"
                    onClick={
                      selectAllEmployees
                    }
                    className={
                      allEmployeesSelected
                        ? "selected"
                        : ""
                    }
                  >
                    <MdSelectAll />
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearAllEmployees
                    }
                  >
                    <MdClose />
                    Clear All
                  </button>

                </div>

                <div className="project-employee-list">

                  {employees.length === 0 ? (

                    <div className="project-no-employees">
                      No employees found.
                    </div>

                  ) : (

                    employees.map(
                      (employee, index) => {

                        const id =
                          employee.id ||
                          employee.employee_id;

                        const name =
                          employee.name ||
                          employee.full_name ||
                          employee.employee_name ||
                          `Employee #${id}`;

                        const checked =
                          form.employee_ids.includes(
                            Number(id)
                          );

                        return (

                          <label
                            className={`project-employee-option ${
                              checked
                                ? "checked"
                                : ""
                            }`}
                            key={
                              id || index
                            }
                          >

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleEmployee(
                                  id
                                )
                              }
                            />

                            <span className="project-custom-checkbox">
                              {checked && "✓"}
                            </span>

                            <div className="project-small-avatar">
                              {name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="project-employee-info">

                              <strong>
                                {name}
                              </strong>

                              <span>
                                Employee #
                                {id}
                              </span>

                            </div>

                          </label>

                        );
                      }
                    )

                  )}

                </div>

              </div>

              <div className="project-modal-footer">

                <button
                  type="button"
                  className="project-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="project-save-btn"
                >
                  <MdSave />
                  Add Project
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          VIEW PROJECT POPUP
      ====================================================== */}

      {showView &&
        selectedProject && (

          <div
            className="project-modal-overlay"
            onClick={
              closeAllPopups
            }
          >

            <div
              className="project-modal project-view-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="project-modal-header">

                <div>

                  <div className="project-modal-icon view">
                    <MdVisibility />
                  </div>

                  <div>

                    <h2>
                      Project Details
                    </h2>

                    <p>
                      View complete project
                      information.
                    </p>

                  </div>

                </div>

                <button
                  className="project-modal-close"
                  onClick={
                    closeAllPopups
                  }
                >
                  <MdClose />
                </button>

              </div>

              <div className="project-view-top">

                <div className="project-large-icon">
                  <MdWork />
                </div>

                <h3>
                  {getProjectName(
                    selectedProject
                  )}
                </h3>

                <span>
                  Project #
                  {getProjectId(
                    selectedProject
                  )}
                </span>

              </div>

              <div className="project-details-grid">

                <div className="project-detail-item">

                  <span>
                    Project Name
                  </span>

                  <strong>
                    {getProjectName(
                      selectedProject
                    )}
                  </strong>

                </div>

                <div className="project-detail-item">

                  <span>
                    Status
                  </span>

                  <strong>

                    <span
                      className={`project-status ${
                        String(
                          selectedProject.status ||
                            "Active"
                        ).toLowerCase()
                      }`}
                    >
                      {selectedProject.status ||
                        "Active"}
                    </span>

                  </strong>

                </div>

                <div className="project-detail-item full">

                  <span>
                    Description
                  </span>

                  <strong>
                    {selectedProject.description ||
                      "-"}
                  </strong>

                </div>

                <div className="project-detail-item full">

                  <span>
                    Assigned Employees
                  </span>

                  <strong className="project-view-employees">

                    <MdGroups />

                    {getAssignedNames(
                      selectedProject
                    )}

                  </strong>

                </div>

              </div>

              <div className="project-modal-footer">

                <button
                  className="project-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Close
                </button>

                <button
                  className="project-edit-main-btn"
                  onClick={() => {
                    setShowView(false);
                    openEdit(
                      selectedProject
                    );
                  }}
                >
                  <MdEdit />
                  Edit Project
                </button>

              </div>

            </div>

          </div>

        )}

      {/* =====================================================
          EDIT PROJECT POPUP
      ====================================================== */}

      {showEdit &&
        selectedProject && (

          <div
            className="project-modal-overlay"
            onClick={
              closeAllPopups
            }
          >

            <div
              className="project-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="project-modal-header">

                <div>

                  <div className="project-modal-icon edit">
                    <MdEdit />
                  </div>

                  <div>

                    <h2>
                      Edit Project
                    </h2>

                    <p>
                      Update project and
                      employee assignments.
                    </p>

                  </div>

                </div>

                <button
                  className="project-modal-close"
                  onClick={
                    closeAllPopups
                  }
                >
                  <MdClose />
                </button>

              </div>

              <form onSubmit={handleEdit}>

                <div className="project-form-grid">

                  <div className="project-form-group">

                    <label>
                      Project Name
                    </label>

                    <input
                      type="text"
                      name="project_name"
                      value={
                        form.project_name
                      }
                      onChange={
                        handleInputChange
                      }
                      required
                    />

                  </div>

                  <div className="project-form-group">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleInputChange
                      }
                    >

                      <option value="Active">
                        Active
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>

                    </select>

                  </div>

                  <div className="project-form-group full">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleInputChange
                      }
                      rows="4"
                    />

                  </div>

                </div>

                {/* MULTIPLE ASSIGNMENT */}

                <div className="project-assignment-box">

                  <div className="project-assignment-header">

                    <div>

                      <h3>
                        Assign Employees
                      </h3>

                      <p>
                        Select one or multiple
                        employees.
                      </p>

                    </div>

                    <span>
                      {form.employee_ids.length}{" "}
                      Selected
                    </span>

                  </div>

                  <div className="project-select-actions">

                    <button
                      type="button"
                      onClick={
                        selectAllEmployees
                      }
                      className={
                        allEmployeesSelected
                          ? "selected"
                          : ""
                      }
                    >
                      <MdSelectAll />
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearAllEmployees
                      }
                    >
                      <MdClose />
                      Clear All
                    </button>

                  </div>

                  <div className="project-employee-list">

                    {employees.map(
                      (employee, index) => {

                        const id =
                          employee.id ||
                          employee.employee_id;

                        const name =
                          employee.name ||
                          employee.full_name ||
                          employee.employee_name ||
                          `Employee #${id}`;

                        const checked =
                          form.employee_ids.includes(
                            Number(id)
                          );

                        return (

                          <label
                            className={`project-employee-option ${
                              checked
                                ? "checked"
                                : ""
                            }`}
                            key={
                              id || index
                            }
                          >

                            <input
                              type="checkbox"
                              checked={
                                checked
                              }
                              onChange={() =>
                                toggleEmployee(
                                  id
                                )
                              }
                            />

                            <span className="project-custom-checkbox">
                              {checked && "✓"}
                            </span>

                            <div className="project-small-avatar">
                              {name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="project-employee-info">

                              <strong>
                                {name}
                              </strong>

                              <span>
                                Employee #
                                {id}
                              </span>

                            </div>

                          </label>

                        );
                      }
                    )}

                  </div>

                </div>

                <div className="project-modal-footer">

                  <button
                    type="button"
                    className="project-cancel-btn"
                    onClick={
                      closeAllPopups
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="project-save-btn"
                  >
                    <MdSave />
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      {/* =====================================================
          DELETE POPUP
      ====================================================== */}

      {showDelete &&
        selectedProject && (

          <div
            className="project-modal-overlay"
            onClick={
              closeAllPopups
            }
          >

            <div
              className="project-delete-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="project-delete-icon">
                <MdDelete />
              </div>

              <h2>
                Delete Project?
              </h2>

              <p>
                Are you sure you want to
                delete{" "}
                <strong>
                  {getProjectName(
                    selectedProject
                  )}
                </strong>
                ?
              </p>

              <span className="project-delete-warning">
                This action cannot be undone.
              </span>

              <div className="project-delete-actions">

                <button
                  className="project-cancel-btn"
                  onClick={
                    closeAllPopups
                  }
                >
                  Cancel
                </button>

                <button
                  className="project-confirm-delete-btn"
                  onClick={
                    handleDelete
                  }
                >
                  <MdDelete />
                  Delete
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Projects;