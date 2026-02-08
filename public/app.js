const apiStatus = document.getElementById("api-status");
const employeeForm = document.getElementById("employee-form");
const employeeList = document.getElementById("employee-list");
const employeeCount = document.getElementById("employee-count");
const employeeFormMessage = document.getElementById("employee-form-message");
const attendanceForm = document.getElementById("attendance-form");
const attendanceFormMessage = document.getElementById("attendance-form-message");
const attendanceFilterInput = document.getElementById("attendance-filter");
const attendanceFilterBtn = document.getElementById("attendance-filter-btn");
const attendanceList = document.getElementById("attendance-list");

const showMessage = (element, message, type) => {
  element.textContent = message;
  element.className = `form-message ${type}`;
};

const clearMessage = (element) => {
  element.textContent = "";
  element.className = "form-message";
};

const setLoadingState = (container) => {
  container.innerHTML = '<p class="loading-state">Loading...</p>';
};

const setEmptyState = (container, message) => {
  container.innerHTML = `<div class="empty-state">${message}</div>`;
};

const fetchEmployees = async () => {
  setLoadingState(employeeList);
  try {
    const response = await fetch("/api/employees");
    if (!response.ok) {
      throw new Error("Unable to load employees.");
    }
    const employees = await response.json();
    renderEmployees(employees);
  } catch (error) {
    setEmptyState(employeeList, error.message);
  }
};

const renderEmployees = (employees) => {
  employeeCount.textContent = employees.length;
  if (employees.length === 0) {
    setEmptyState(employeeList, "No employees found. Add your first team member.");
    return;
  }
  employeeList.innerHTML = "";
  employees.forEach((employee) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="meta">
        <strong>${employee.fullName}</strong>
        <span class="muted">${employee.id} · ${employee.department}</span>
        <span class="muted">${employee.email}</span>
      </div>
      <button class="secondary" data-id="${employee.id}">Delete</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      deleteEmployee(employee.id);
    });
    employeeList.appendChild(item);
  });
};

const deleteEmployee = async (employeeId) => {
  try {
    const response = await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.message || "Failed to delete employee.");
    }
    await fetchEmployees();
  } catch (error) {
    showMessage(employeeFormMessage, error.message, "error");
  }
};

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(employeeFormMessage);
  const formData = new FormData(employeeForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.message || "Failed to add employee.");
    }
    showMessage(employeeFormMessage, "Employee added successfully.", "success");
    employeeForm.reset();
    await fetchEmployees();
  } catch (error) {
    showMessage(employeeFormMessage, error.message, "error");
  }
});

const fetchAttendance = async (employeeId) => {
  if (!employeeId) {
    setEmptyState(attendanceList, "Enter an Employee ID to view attendance.");
    return;
  }
  setLoadingState(attendanceList);
  try {
    const response = await fetch(`/api/attendance?employeeId=${employeeId}`);
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.message || "Unable to load attendance.");
    }
    const records = await response.json();
    renderAttendance(records);
  } catch (error) {
    setEmptyState(attendanceList, error.message);
  }
};

const renderAttendance = (records) => {
  if (records.length === 0) {
    setEmptyState(attendanceList, "No attendance records found for this employee.");
    return;
  }
  attendanceList.innerHTML = "";
  records.forEach((record) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="meta">
        <strong>${record.date}</strong>
        <span class="muted">${record.status}</span>
      </div>
    `;
    attendanceList.appendChild(item);
  });
};

attendanceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(attendanceFormMessage);
  const formData = new FormData(attendanceForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.message || "Failed to add attendance.");
    }
    showMessage(attendanceFormMessage, "Attendance saved successfully.", "success");
    attendanceForm.reset();
  } catch (error) {
    showMessage(attendanceFormMessage, error.message, "error");
  }
});

attendanceFilterBtn.addEventListener("click", () => {
  fetchAttendance(attendanceFilterInput.value.trim());
});

const checkApi = async () => {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) {
      throw new Error("API unavailable");
    }
    apiStatus.textContent = "API Connected";
    apiStatus.classList.add("online");
  } catch (error) {
    apiStatus.textContent = "API Offline";
    apiStatus.classList.remove("online");
  }
};

checkApi();
fetchEmployees();
setEmptyState(attendanceList, "Enter an Employee ID to view attendance.");
