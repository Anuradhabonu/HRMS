

import React, { useEffect, useState } from "react";
import {
MdFolder,
MdVisibility,
MdRefresh,
MdArrowBack,
MdClose,
MdCalendarToday,
MdPeople,
MdDescription,
} from "react-icons/md";
import { apiFetch } from "../../api";
import "./Projects.css";

const Projects = () => {
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

const [showView, setShowView] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);

const loadProjects = async () => {
try {
setLoading(true);


  const data = await apiFetch("/projects/me");

  setProjects(Array.isArray(data) ? data : []);
} catch (error) {
  console.error("Projects loading error:", error);
  setProjects([]);
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadProjects();
}, []);

const openViewPopup = (project) => {
setSelectedProject(project);
setShowView(true);
};

const closeViewPopup = () => {
setShowView(false);
setSelectedProject(null);
};

const getProjectName = (project) =>
project.name ||
project.project_name ||
project.title ||
"-";

const getEmployeeName = (project) =>
project.employee_name ||
project.employee ||
project.employee_names ||
"Assigned";

const getStatusClass = (status) => {
const value = String(status || "").toLowerCase();

if (value === "completed") return "project-status-completed";
if (value === "in progress") return "project-status-progress";
if (value === "pending") return "project-status-pending";

return "project-status-default";


};

return ( <div className="employee-projects-page">


  {/* HEADER */}
  <div className="employee-projects-header">

    <div className="employee-projects-header-left">

      <button
        className="employee-projects-back-btn"
        onClick={() => window.history.back()}
      >
        <MdArrowBack />
        Back
      </button>

      <div className="employee-projects-title-area">

        <div className="employee-projects-title-row">

          <div className="employee-projects-title-icon">
            <MdFolder />
          </div>

          <div>
            <h1>My Projects</h1>
            <p>View your assigned projects</p>
          </div>

        </div>

        <div className="employee-projects-live-badge">
          <span></span>
          Employee Projects
        </div>

      </div>

    </div>

    <div className="employee-projects-header-actions">

      <button
        className="employee-projects-refresh-btn"
        onClick={loadProjects}
        disabled={loading}
      >
        <MdRefresh
          className={loading ? "employee-projects-spin" : ""}
        />
        Refresh
      </button>

    </div>

  </div>

  {/* SUMMARY */}
  <div className="employee-projects-summary-grid">

    <div className="employee-projects-summary-card blue-project-card">
      <div className="employee-projects-summary-icon">
        <MdFolder />
      </div>

      <div>
        <span>Total Projects</span>
        <strong>{projects.length}</strong>
        <small>Your assigned projects</small>
      </div>
    </div>

    <div className="employee-projects-summary-card green-project-card">
      <div className="employee-projects-summary-icon">
        <MdFolder />
      </div>

      <div>
        <span>Completed</span>
        <strong>
          {
            projects.filter(
              (project) =>
                String(project.status || "").toLowerCase() ===
                "completed"
            ).length
          }
        </strong>
        <small>Completed projects</small>
      </div>
    </div>

    <div className="employee-projects-summary-card orange-project-card">
      <div className="employee-projects-summary-icon">
        <MdFolder />
      </div>

      <div>
        <span>In Progress</span>
        <strong>
          {
            projects.filter(
              (project) =>
                String(project.status || "").toLowerCase() ===
                "in progress"
            ).length
          }
        </strong>
        <small>Active projects</small>
      </div>
    </div>

  </div>

  {/* TABLE */}
  <div className="employee-projects-table-card">

    <div className="employee-projects-table-header">

      <div>
        <h2>
          <MdFolder />
          My Projects
        </h2>

        <p>View your assigned project details</p>
      </div>

      <span className="employee-projects-count-badge">
        {projects.length}
      </span>

    </div>

    {loading ? (
      <div className="employee-projects-empty-state">
        <MdRefresh className="employee-projects-spin large-spin" />
        <p>Loading projects...</p>
      </div>
    ) : projects.length === 0 ? (
      <div className="employee-projects-empty-state">
        <MdFolder />
        <p>No projects assigned.</p>
      </div>
    ) : (
      <div className="employee-projects-table-wrapper">

        <table className="employee-projects-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Description</th>
              <th>Status</th>
              <th>Employee</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {projects.map((project) => (
              <tr key={project.id}>

                <td>
                  <span className="employee-project-id">
                    #{project.id}
                  </span>
                </td>

                <td>
                  <div className="employee-project-name">
                    <MdFolder />
                    {getProjectName(project)}
                  </div>
                </td>

                <td>
                  <div className="employee-project-description">
                    {project.description || "-"}
                  </div>
                </td>

                <td>
                  <span
                    className={`employee-project-status ${getStatusClass(
                      project.status
                    )}`}
                  >
                    {project.status || "Pending"}
                  </span>
                </td>

                <td>
                  <div className="employee-project-employee">
                    <MdPeople />
                    {getEmployeeName(project)}
                  </div>
                </td>

                <td>
                  <div className="employee-project-actions">

                    <button
                      className="employee-project-action-btn view-action"
                      title="View"
                      onClick={() => openViewPopup(project)}
                    >
                      <MdVisibility />
                    </button>

                  </div>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
    )}

  </div>

  {/* VIEW POPUP */}
  {showView && selectedProject && (
    <div
      className="employee-project-modal-overlay"
      onClick={closeViewPopup}
    >

      <div
        className="employee-project-view-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="employee-project-modal-header">

          <div>
            <h2>
              <MdVisibility />
              Project Details
            </h2>

            <p>View your assigned project</p>
          </div>

          <button onClick={closeViewPopup}>
            <MdClose />
          </button>

        </div>

        <div className="employee-project-view-content">

          <div className="employee-project-detail-card">

            <span>Project ID</span>

            <strong>
              #{selectedProject.id}
            </strong>

          </div>

          <div className="employee-project-detail-card">

            <span>Project Name</span>

            <strong>
              {getProjectName(selectedProject)}
            </strong>

          </div>

          <div className="employee-project-detail-card">

            <span>Status</span>

            <strong>
              <span
                className={`employee-project-status ${getStatusClass(
                  selectedProject.status
                )}`}
              >
                {selectedProject.status || "Pending"}
              </span>
            </strong>

          </div>

          <div className="employee-project-detail-card">

            <span>
              <MdPeople />
              Employee
            </span>

            <strong>
              {getEmployeeName(selectedProject)}
            </strong>

          </div>

          <div className="employee-project-detail-card full-detail">

            <span>
              <MdDescription />
              Description
            </span>

            <p>
              {selectedProject.description ||
                "No project description available"}
            </p>

          </div>

          <div className="employee-project-detail-card">

            <span>
              <MdCalendarToday />
              Created Date
            </span>

            <strong>
              {selectedProject.created_at
                ? new Date(
                    selectedProject.created_at
                  ).toLocaleDateString("en-IN")
                : "-"}
            </strong>

          </div>

        </div>

        <div className="employee-project-modal-actions">

          <button
            className="employee-project-close-btn"
            onClick={closeViewPopup}
          >
            <MdClose />
            Close
          </button>

        </div>

      </div>

    </div>
  )}

</div>


);
};

export default Projects;
