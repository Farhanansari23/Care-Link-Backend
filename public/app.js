const API_BASE = "http://localhost:3000/api";
let token = localStorage.getItem("token");

// Helper to show/hide elements
const toggleElement = (id, show) => {
  document.getElementById(id).classList.toggle("hidden", !show);
};

// Helper to make API requests
const apiRequest = async (method, endpoint, data = null, auth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(`${API_BASE}/${endpoint}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Request failed");
  return json;
};

// Helper to populate dropdowns
const populateDropdown = (
  selectId,
  items,
  valueKey = "_id",
  labelKey = "name"
) => {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Select</option>';
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueKey];
    option.textContent =
      typeof labelKey === "function" ? labelKey(item) : item[labelKey];
    select.appendChild(option);
  });
};

// Helper to populate time slot dropdown
const populateTimeSlotDropdown = (selectId, timeSlots) => {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Select Time Slot</option>';
  timeSlots
    .filter((slot) => slot.isAvailable)
    .forEach((slot) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      option.textContent = `${slot.startTime} - ${slot.endTime}`;
      select.appendChild(option);
    });
};

// Helper to set multiple select values
const setMultiSelectValues = (selectId, values) => {
  const select = document.getElementById(selectId);
  Array.from(select.options).forEach((option) => {
    option.selected = values.includes(option.value);
  });
};

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const emailOrPhone = document
      .getElementById("loginEmailOrPhone")
      .value.trim();
    const pwd = document.getElementById("loginPassword").value;
    if (!emailOrPhone || !pwd)
      throw new Error("Email/Phone and password are required");
    const data = emailOrPhone.includes("@")
      ? { email: emailOrPhone, pwd }
      : { phone_no: emailOrPhone, pwd };
    const res = await apiRequest("POST", "auth/login", data, false);
    token = res.token;
    localStorage.setItem("token", token);
    toggleElement("loginError", false);
    alert("Login successful");
    loadAllData();
  } catch (err) {
    document.getElementById("loginError").textContent = err.message;
    toggleElement("loginError", true);
  }
});

// Register
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: document.getElementById("registerName").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        phone_no: document.getElementById("registerPhone").value.trim(),
        pwd: document.getElementById("registerPassword").value,
        address: document.getElementById("registerAddress").value.trim(),
        user_type: document.getElementById("registerUserType").value,
      };
      if (!data.name || !data.email || !data.phone_no || !data.pwd) {
        throw new Error("Name, email, phone, and password are required");
      }
      await apiRequest("POST", "auth/register", data, false);
      toggleElement("registerError", false);
      alert("Registration successful");
    } catch (err) {
      document.getElementById("registerError").textContent = err.message;
      toggleElement("registerError", true);
    }
  });

// User Management
const userForm = document.getElementById("userForm");
document.getElementById("addUser").addEventListener("click", () => {
  userForm.reset();
  document.getElementById("userId").value = "";
  toggleElement("userForm", true);
});
document
  .getElementById("userCancel")
  .addEventListener("click", () => toggleElement("userForm", false));
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("userId").value;
    const data = {
      name: document.getElementById("userName").value.trim(),
      email: document.getElementById("userEmail").value.trim(),
      phone_no: document.getElementById("userPhone").value.trim(),
      address: document.getElementById("userAddress").value.trim(),
      user_type: document.getElementById("userUserType").value,
      is_active: document.getElementById("userIsActive").checked,
    };
    if (!data.name || !data.email || !data.phone_no)
      throw new Error("Name, email, and phone are required");
    if (document.getElementById("userPassword").value) {
      data.pwd = document.getElementById("userPassword").value;
    }
    await apiRequest(id ? "PUT" : "POST", id ? `users/${id}` : "users", data);
    toggleElement("userForm", false);
    toggleElement("userError", false);
    loadUsers();
  } catch (err) {
    document.getElementById("userError").textContent = err.message;
    toggleElement("userError", true);
  }
});

const loadUsers = async () => {
  try {
    const users = await apiRequest("GET", "users");
    const tbody = document.getElementById("userTable");
    tbody.innerHTML = users
      .map(
        (u) => `
        <tr>
          <td class="border p-2">${u.name}</td>
          <td class="border p-2">${u.email}</td>
          <td class="border p-2">${u.phone_no}</td>
          <td class="border p-2">${u.user_type}</td>
          <td class="border p-2">${u.is_active ? "Yes" : "No"}</td>
          <td class="border p-2">
            <button onclick="editUser('${
              u._id
            }')" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteUser('${
              u._id
            }')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    document.getElementById("userError").textContent = err.message;
    toggleElement("userError", true);
  }
};

window.editUser = async (id) => {
  try {
    const user = await apiRequest("GET", `users/${id}`);
    document.getElementById("userId").value = user._id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userPhone").value = user.phone_no;
    document.getElementById("userAddress").value = user.address || "";
    document.getElementById("userUserType").value = user.user_type;
    document.getElementById("userIsActive").checked = user.is_active;
    document.getElementById("userPassword").value = "";
    toggleElement("userForm", true);
  } catch (err) {
    document.getElementById("userError").textContent = err.message;
    toggleElement("userError", true);
  }
};

window.deleteUser = async (id) => {
  if (confirm("Delete this user?")) {
    try {
      await apiRequest("DELETE", `users/${id}`);
      loadUsers();
    } catch (err) {
      document.getElementById("userError").textContent = err.message;
      toggleElement("userError", true);
    }
  }
};

// Category Management
const categoryForm = document.getElementById("categoryForm");
document.getElementById("addCategory").addEventListener("click", () => {
  categoryForm.reset();
  document.getElementById("categoryId").value = "";
  toggleElement("categoryForm", true);
});
document
  .getElementById("categoryCancel")
  .addEventListener("click", () => toggleElement("categoryForm", false));
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("categoryId").value;
    const data = {
      name: document.getElementById("categoryName").value.trim(),
    };
    if (!data.name) throw new Error("Category name is required");
    await apiRequest(
      id ? "PUT" : "POST",
      id ? `categories/${id}` : "categories",
      data
    );
    toggleElement("categoryForm", false);
    toggleElement("categoryError", false);
    loadCategories();
  } catch (err) {
    document.getElementById("categoryError").textContent = err.message;
    toggleElement("categoryError", true);
  }
});

const loadCategories = async () => {
  try {
    const categories = await apiRequest("GET", "categories");
    const tbody = document.getElementById("categoryTable");
    tbody.innerHTML = categories
      .map(
        (c) => `
        <tr>
          <td class="border p-2">${c.name}</td>
          <td class="border p-2">
            <button onclick="editCategory('${c._id}')" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteCategory('${c._id}')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
    // Populate category dropdowns
    populateDropdown("doctorCategoryId", categories);
    populateDropdown("searchCategoryId", categories);
  } catch (err) {
    document.getElementById("categoryError").textContent = err.message;
    toggleElement("categoryError", true);
  }
};

window.editCategory = async (id) => {
  try {
    const category = await apiRequest("GET", `categories/${id}`);
    document.getElementById("categoryId").value = category._id;
    document.getElementById("categoryName").value = category.name;
    toggleElement("categoryForm", true);
  } catch (err) {
    document.getElementById("categoryError").textContent = err.message;
    toggleElement("categoryError", true);
  }
};

window.deleteCategory = async (id) => {
  if (confirm("Delete this category?")) {
    try {
      await apiRequest("DELETE", `categories/${id}`);
      loadCategories();
    } catch (err) {
      document.getElementById("categoryError").textContent = err.message;
      toggleElement("categoryError", true);
    }
  }
};

// Healthcenter Management
const healthcenterForm = document.getElementById("healthcenterForm");
document
  .getElementById("addHealthcenter")
  .addEventListener("click", async () => {
    healthcenterForm.reset();
    document.getElementById("healthcenterId").value = "";
    await loadDoctors(); // Populate doctor dropdown
    toggleElement("healthcenterForm", true);
  });
document
  .getElementById("healthcenterCancel")
  .addEventListener("click", () => toggleElement("healthcenterForm", false));
healthcenterForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("healthcenterId").value;
    const doctorIds = Array.from(
      document.getElementById("healthcenterDoctorIds").selectedOptions
    ).map((opt) => opt.value);
    const data = {
      name: document.getElementById("healthcenterName").value.trim(),
      location: document.getElementById("healthcenterLocation").value.trim(),
      doctor_id: doctorIds,
      contact_detail: document
        .getElementById("healthcenterContact")
        .value.trim(),
      healCaredetail: document
        .getElementById("healthcenterDetail")
        .value.trim(),
    };
    if (!data.name || !data.location || !data.contact_detail) {
      throw new Error("Name, location, and contact are required");
    }
    await apiRequest(
      id ? "PUT" : "POST",
      id ? `healthcenters/${id}` : "healthcenters",
      data
    );
    toggleElement("healthcenterForm", false);
    toggleElement("healthcenterError", false);
    loadHealthcenters();
  } catch (err) {
    document.getElementById("healthcenterError").textContent = err.message;
    toggleElement("healthcenterError", true);
  }
});

const loadDoctors = async () => {
  try {
    const doctors = await apiRequest("GET", "doctors");
    populateDropdown("healthcenterDoctorIds", doctors);
    populateDropdown("scheduleDoctorId", doctors);
    populateDropdown("appointmentDoctorId", doctors);
  } catch (err) {
    console.error("Failed to load doctors:", err.message);
  }
};

const loadHealthcenters = async () => {
  try {
    const healthcenters = await apiRequest("GET", "healthcenters");
    const tbody = document.getElementById("healthcenterTable");
    tbody.innerHTML = healthcenters
      .map(
        (h) => `
        <tr>
          <td class="border p-2">${h.name}</td>
          <td class="border p-2">${h.location}</td>
          <td class="border p-2">
            ${
              h.doctor_id?.length
                ? h.doctor_id
                    .map(
                      (d) =>
                        `${d.name} (${
                          d.category_id
                            ?.map((c) => String(c.name))
                            .join(", ") || "N/A"
                        })`
                    )
                    .join(", ")
                : "N/A"
            }
          </td>
          <td class="border p-2">${h.contact_detail}</td>
          <td class="border p-2">
            <button onclick="editHealthcenter('${
              h._id
            }')" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteHealthcenter('${
              h._id
            }')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
    populateDropdown("doctorHealthcenterId", healthcenters);
    populateDropdown("appointmentHealthcenterId", healthcenters);
  } catch (err) {
    document.getElementById("healthcenterError").textContent = err.message;
    toggleElement("healthcenterError", true);
  }
};

window.editHealthcenter = async (id) => {
  try {
    const healthcenter = await apiRequest("GET", `healthcenters/${id}`);
    await loadDoctors();
    document.getElementById("healthcenterId").value = healthcenter._id;
    document.getElementById("healthcenterName").value = healthcenter.name;
    document.getElementById("healthcenterLocation").value =
      healthcenter.location;
    setMultiSelectValues(
      "healthcenterDoctorIds",
      healthcenter.doctor_id?.map((d) => String(d._id || d)) || []
    );
    document.getElementById("healthcenterContact").value =
      healthcenter.contact_detail;
    document.getElementById("healthcenterDetail").value =
      healthcenter.healCaredetail || "";
    toggleElement("healthcenterForm", true);
  } catch (err) {
    document.getElementById("healthcenterError").textContent = err.message;
    toggleElement("healthcenterError", true);
  }
};

window.deleteHealthcenter = async (id) => {
  if (confirm("Delete this health center?")) {
    try {
      await apiRequest("DELETE", `healthcenters/${id}`);
      loadHealthcenters();
    } catch (err) {
      document.getElementById("healthcenterError").textContent = err.message;
      toggleElement("healthcenterError", true);
    }
  }
};

// Doctor Management
const doctorForm = document.getElementById("doctorForm");
document.getElementById("addDoctor").addEventListener("click", async () => {
  doctorForm.reset();
  document.getElementById("doctorId").value = "";
  await loadCategories();
  await loadHealthcenters();
  toggleElement("doctorForm", true);
});
document
  .getElementById("doctorCancel")
  .addEventListener("click", () => toggleElement("doctorForm", false));
doctorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("doctorId").value;
    const data = {
      name: document.getElementById("doctorName").value.trim(),
      description: document.getElementById("doctorDescription").value.trim(),
      category_id: [document.getElementById("doctorCategoryId").value],
      healthcenter_id: [document.getElementById("doctorHealthcenterId").value],
      doctorRating:
        parseFloat(document.getElementById("doctorRating").value) || undefined,
    };
    if (!data.name || !data.category_id[0] || !data.healthcenter_id[0]) {
      throw new Error("Name, category, and health center are required");
    }
    await apiRequest(
      id ? "PUT" : "POST",
      id ? `doctors/${id}` : "doctors",
      data
    );
    toggleElement("doctorForm", false);
    toggleElement("doctorError", false);
    loadDoctors();
  } catch (err) {
    document.getElementById("doctorError").textContent = err.message;
    toggleElement("doctorError", true);
  }
});

const loadDoctorsForTable = async () => {
  try {
    const doctors = await apiRequest("GET", "doctors");
    const tbody = document.getElementById("doctorTable");
    tbody.innerHTML = doctors
      .map(
        (d) => `
        <tr>
          <td class="border p-2">${d.name}</td>
          <td class="border p-2">${
            d.category_id?.map((c) => c.name).join(", ") || "N/A"
          }</td>
          <td class="border p-2">${
            d.healthcenter_id?.map((h) => h.name).join(", ") || "N/A"
          }</td>
          <td class="border p-2">${d.doctorRating || "N/A"}</td>
          <td class="border p-2">
            <button onclick="editDoctor('${
              d._id
            }')" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteDoctor('${
              d._id
            }')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    document.getElementById("doctorError").textContent = err.message;
    toggleElement("doctorError", true);
  }
};

window.editDoctor = async (id) => {
  try {
    const doctor = await apiRequest("GET", `doctors/${id}`);
    await loadCategories();
    await loadHealthcenters();
    document.getElementById("doctorId").value = doctor._id;
    document.getElementById("doctorName").value = doctor.name;
    document.getElementById("doctorDescription").value =
      doctor.description || "";
    document.getElementById("doctorCategoryId").value =
      doctor.category_id[0]?._id || doctor.category_id[0] || "";
    document.getElementById("doctorHealthcenterId").value =
      doctor.healthcenter_id[0]?._id || doctor.healthcenter_id[0] || "";
    document.getElementById("doctorRating").value = doctor.doctorRating || "";
    toggleElement("doctorForm", true);
  } catch (err) {
    document.getElementById("doctorError").textContent = err.message;
    toggleElement("doctorError", true);
  }
};

window.deleteDoctor = async (id) => {
  if (confirm("Delete this doctor?")) {
    try {
      await apiRequest("DELETE", `doctors/${id}`);
      loadDoctorsForTable();
    } catch (err) {
      document.getElementById("doctorError").textContent = err.message;
      toggleElement("doctorError", true);
    }
  }
};

// Schedule Management
const scheduleForm = document.getElementById("scheduleForm");
document.getElementById("addSchedule").addEventListener("click", async () => {
  scheduleForm.reset();
  document.getElementById("scheduleId").value = "";
  await loadDoctors();
  toggleElement("scheduleForm", true);
});
document
  .getElementById("scheduleCancel")
  .addEventListener("click", () => toggleElement("scheduleForm", false));
scheduleForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("scheduleId").value;
    const timeSlotsInput = document
      .getElementById("scheduleTimeSlots")
      .value.trim();
    let time_slots;
    try {
      time_slots = JSON.parse(timeSlotsInput);
      if (
        !Array.isArray(time_slots) ||
        !time_slots.every((t) => t.startTime && t.endTime && "isAvailable" in t)
      ) {
        throw new Error("Invalid time slots format");
      }
    } catch {
      throw new Error("Invalid JSON in time slots");
    }
    const data = {
      doctor_id: document.getElementById("scheduleDoctorId").value.trim(),
      date: document.getElementById("scheduleDate").value,
      time_slots,
    };
    if (!data.doctor_id || !data.date)
      throw new Error("Doctor and date are required");
    await apiRequest(
      id ? "PUT" : "POST",
      id ? `schedules/${id}` : "schedules",
      data
    );
    toggleElement("scheduleForm", false);
    toggleElement("scheduleError", false);
    loadSchedules();
  } catch (err) {
    document.getElementById("scheduleError").textContent = err.message;
    toggleElement("scheduleError", true);
  }
});

const loadSchedules = async () => {
  try {
    const schedules = await apiRequest("GET", "schedules");
    const tbody = document.getElementById("scheduleTable");
    tbody.innerHTML = schedules
      .map(
        (s) => `
        <tr>
          <td class="border p-2">${s.doctor_id?.name || "N/A"}</td>
          <td class="border p-2">${
            s.date ? new Date(s.date).toLocaleDateString() : "N/A"
          }</td>
          <td class="border p-2">${
            s.time_slots
              ?.map(
                (t) =>
                  `${t.startTime}-${t.endTime} (${
                    t.isAvailable ? "Available" : "Booked"
                  })`
              )
              .join(", ") || "N/A"
          }</td>
          <td class="border p-2">
            <button onclick="editSchedule('${
              s._id
            }')" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteSchedule('${
              s._id
            }')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
    // Populate schedule dropdown
    populateDropdown(
      "appointmentScheduleId",
      schedules,
      "_id",
      (s) =>
        `${s.doctor_id?.name || "Unknown"} - ${
          s.date ? new Date(s.date).toLocaleDateString() : "N/A"
        }`
    );
  } catch (err) {
    document.getElementById("scheduleError").textContent = err.message;
    toggleElement("scheduleError", true);
  }
};

window.editSchedule = async (id) => {
  try {
    const schedule = await apiRequest("PUT", `schedules/${id}`);
    await loadDoctors();
    document.getElementById("scheduleId").value = schedule._id;
    document.getElementById("scheduleDoctorId").value =
      schedule.doctor_id?._id || schedule.doctor_id || "";
    document.getElementById("scheduleDate").value = schedule.date
      ? new Date(schedule.date).toISOString().split("T")[0]
      : "";
    document.getElementById("scheduleTimeSlots").value = schedule.time_slots
      ? JSON.stringify(schedule.time_slots, null, 2)
      : "[]";
    toggleElement("scheduleForm", true);
  } catch (err) {
    document.getElementById("scheduleError").textContent = err.message;
    toggleElement("scheduleError", true);
  }
};

window.deleteSchedule = async (id) => {
  if (confirm("Delete this schedule?")) {
    try {
      await apiRequest("DELETE", `schedules/${id}`);
      loadSchedules();
    } catch (err) {
      document.getElementById("scheduleError").textContent = err.message;
      toggleElement("scheduleError", true);
    }
  }
};

// Appointment Management
const appointmentForm = document.getElementById("appointmentForm");
document
  .getElementById("addAppointment")
  .addEventListener("click", async () => {
    appointmentForm.reset();
    document.getElementById("appointmentId").value = "";
    await loadDoctors();
    await loadHealthcenters();
    await loadSchedules();
    document.getElementById("appointmentTimeSlot").innerHTML =
      '<option value="">Select Time Slot</option>';
    toggleElement("appointmentForm", true);
  });
document
  .getElementById("appointmentCancel")
  .addEventListener("click", () => toggleElement("appointmentForm", false));

// Event listener for schedule selection to populate time slots
document
  .getElementById("appointmentScheduleId")
  .addEventListener("change", async (e) => {
    const scheduleId = e.target.value;
    if (scheduleId) {
      try {
        const schedule = await apiRequest("GET", `schedules/${scheduleId}`);
        populateTimeSlotDropdown(
          "appointmentTimeSlot",
          schedule.time_slots || []
        );
      } catch (err) {
        document.getElementById("appointmentError").textContent = err.message;
        toggleElement("appointmentError", true);
      }
    } else {
      document.getElementById("appointmentTimeSlot").innerHTML =
        '<option value="">Select Time Slot</option>';
    }
  });

appointmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("appointmentId").value;
    const timeSlot = document.getElementById("appointmentTimeSlot").value;
    let time_slot;
    try {
      time_slot = JSON.parse(timeSlot);
    } catch {
      throw new Error("Invalid time slot selected");
    }
    const data = {
      doctor_id: document.getElementById("appointmentDoctorId").value.trim(),
      healthcenter_id: document
        .getElementById("appointmentHealthcenterId")
        .value.trim(),
      schedule_id: document
        .getElementById("appointmentScheduleId")
        .value.trim(),
      time_slot,
    };
    if (
      !data.doctor_id ||
      !data.healthcenter_id ||
      !data.schedule_id ||
      !data.time_slot.startTime ||
      !data.time_slot.endTime
    ) {
      throw new Error("All fields are required");
    }
    await apiRequest(
      id ? "PUT" : "POST",
      id ? `appointments/${id}` : "appointments",
      data
    );
    toggleElement("appointmentForm", false);
    toggleElement("appointmentError", false);
    loadAppointments();
  } catch (err) {
    document.getElementById("appointmentError").textContent = err.message;
    toggleElement("appointmentError", true);
  }
});

const loadAppointments = async () => {
  try {
    const appointments = await apiRequest("GET", "appointments");
    const tbody = document.getElementById("appointmentTable");
    tbody.innerHTML = appointments
      .map(
        (a) => `
        <tr>
          <td class="border p-2">${a.doctor_id?.name || "N/A"}</td>
          <td class="border p-2">${a.healthcenter_id?.name || "N/A"}</td>
          <td class="border p-2">${a.patient_id?.name || "N/A"}</td>
          <td class="border p-2">${
            a.selected_date?.schedule_id?.date
              ? new Date(a.selected_date.schedule_id.date).toLocaleDateString()
              : "N/A"
          } ${a.selected_date?.time_slot?.startTime || ""}-${
          a.selected_date?.time_slot?.endTime || ""
        }</td>
          <td class="border p-2">${a.status || "N/A"}</td>
          <td class="border p-2">
            <button onclick="editAppointment('${
              a._id
            }')" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
            <button onclick="deleteAppointment('${
              a._id
            }')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    document.getElementById("appointmentError").textContent = err.message;
    toggleElement("appointmentError", true);
  }
};

window.editAppointment = async (id) => {
  try {
    const appointment = await apiRequest("GET", `appointments/${id}`);
    await loadDoctors();
    await loadHealthcenters();
    await loadSchedules();
    document.getElementById("appointmentId").value = appointment._id;
    document.getElementById("appointmentDoctorId").value =
      appointment.doctor_id?._id || appointment.doctor_id || "";
    document.getElementById("appointmentHealthcenterId").value =
      appointment.healthcenter_id?._id || appointment.healthcenter_id || "";
    document.getElementById("appointmentScheduleId").value =
      appointment.selected_date?.schedule_id?._id ||
      appointment.selected_date?.schedule_id ||
      "";
    if (appointment.selected_date?.schedule_id?._id) {
      const schedule = await apiRequest(
        "GET",
        `schedules/${appointment.selected_date.schedule_id._id}`
      );
      populateTimeSlotDropdown(
        "appointmentTimeSlot",
        schedule.time_slots || []
      );
      const selectedTimeSlot = JSON.stringify(
        appointment.selected_date?.time_slot || {}
      );
      document.getElementById("appointmentTimeSlot").value = selectedTimeSlot;
    } else {
      document.getElementById("appointmentTimeSlot").innerHTML =
        '<option value="">Select Time Slot</option>';
    }
    toggleElement("appointmentForm", true);
  } catch (err) {
    document.getElementById("appointmentError").textContent = err.message;
    toggleElement("appointmentError", true);
  }
};

window.deleteAppointment = async (id) => {
  if (confirm("Delete this appointment?")) {
    try {
      await apiRequest("DELETE", `appointments/${id}`);
      loadAppointments();
    } catch (err) {
      document.getElementById("appointmentError").textContent = err.message;
      toggleElement("appointmentError", true);
    }
  }
};

// Recommendation
document
  .getElementById("fetchRecommendations")
  .addEventListener("click", async () => {
    try {
      const data = await apiRequest("GET", "recommendations");
      const tbody = document.getElementById("recommendationTable");
      const rows = [];
      data.recommendedDoctors?.forEach((d) => {
        rows.push(`
        <tr>
          <td class="border p-2">Doctor</td>
          <td class="border p-2">${d.name}</td>
          <td class="border p-2">Rating: ${
            d.doctorRating || "N/A"
          }, Categories: ${
          d.category_id?.map((c) => c.name).join(", ") || "N/A"
        }</td>
        </tr>
      `);
      });
      data.recommendedHealthcenters?.forEach((h) => {
        rows.push(`
        <tr>
          <td class="border p-2">Healthcenter</td>
          <td class="border p-2">${h.name}</td>
          <td class="border p-2">Location: ${h.location || "N/A"}</td>
        </tr>
      `);
      });
      tbody.innerHTML = rows.join("");
      toggleElement("recommendationError", false);
    } catch (err) {
      document.getElementById("recommendationError").textContent = err.message;
      toggleElement("recommendationError", true);
    }
  });

// Search
document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const query = document.getElementById("searchQuery").value.trim();
    const categoryId = document.getElementById("searchCategoryId").value.trim();
    const location = document.getElementById("searchLocation").value.trim();
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (categoryId) params.append("category_id", categoryId);
    if (location) params.append("location", location);
    const data = await apiRequest("GET", `search?${params.toString()}`);
    const tbody = document.getElementById("searchTable");
    const rows = [];
    data.doctors?.forEach((d) => {
      rows.push(`
        <tr>
          <td class="border p-2">Doctor</td>
          <td class="border p-2">${d.name}</td>
          <td class="border p-2">Rating: ${
            d.doctorRating || "N/A"
          }, Categories: ${
        d.category_id?.map((c) => c.name).join(", ") || "N/A"
      }</td>
        </tr>
      `);
    });
    data.healthcenters?.forEach((h) => {
      rows.push(`
        <tr>
          <td class="border p-2">Healthcenter</td>
          <td class="border p-2">${h.name}</td>
          <td class="border p-2">Location: ${h.location || "N/A"}</td>
        </tr>
      `);
    });
    tbody.innerHTML = rows.join("");
    toggleElement("searchError", false);
  } catch (err) {
    document.getElementById("searchError").textContent = err.message;
    toggleElement("searchError", true);
  }
});

// Load all data on page load if authenticated
const loadAllData = () => {
  if (token) {
    loadUsers();
    loadCategories();
    loadDoctorsForTable();
    loadHealthcenters();
    loadSchedules();
    loadAppointments();
  }
};
loadAllData();
