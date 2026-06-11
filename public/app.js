console.log("APP JS LOADED");
const currentPage = window.location.pathname;

const state = {
  teacher: null,
  students: [],
  editingId: null
};

const elements = {
  loginView: document.getElementById("loginView"),
  appView: document.getElementById("appView"),
  loginForm: document.getElementById("loginForm"),
  loginError: document.getElementById("loginError"),
  teacherName: document.getElementById("teacherName"),
  logoutButton: document.getElementById("logoutButton"),
  studentForm: document.getElementById("studentForm"),
  formTitle: document.getElementById("formTitle"),
  formMessage: document.getElementById("formMessage"),
  saveStudentButton: document.getElementById("saveStudentButton"),
  clearFormButton: document.getElementById("clearFormButton"),
  searchInput: document.getElementById("searchInput"),
  subjectFilter: document.getElementById("subjectFilter"),
  paymentFilter: document.getElementById("paymentFilter"),
  studentsTableBody: document.getElementById("studentsTableBody"),
  emptyState: document.getElementById("emptyState"),
  exportButton: document.getElementById("exportButton"),
  totalStudents: document.getElementById("totalStudents"),
  feesCollected: document.getElementById("feesCollected"),
  balanceDue: document.getElementById("balanceDue"),
  subjectCount: document.getElementById("subjectCount"),
  admissionBtn: document.getElementById("admissionBtn")
};

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function money(value) {
  return moneyFormatter.format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    showLogin();
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function showLogin() {

  state.teacher = null;

  if (elements.appView) {
    elements.appView.hidden = true;
  }

  if (elements.loginView) {
    elements.loginView.hidden = false;
  }

}

function showApp(teacher) {

  state.teacher = teacher;

  if (elements.teacherName) {
    elements.teacherName.textContent = teacher.username;
  }

  const manageBtn =
    document.getElementById("manageTeachersBtn");

  const admissionBtn =
    document.getElementById("admissionBtn");

  if (teacher.role === "admin") {

    if (manageBtn) {
      manageBtn.style.display = "block";
    }

    if (admissionBtn) {
      admissionBtn.style.display = "block";
    }

  }

  if (elements.loginView) {
    elements.loginView.hidden = true;
  }

  if (elements.appView) {
    elements.appView.hidden = false;
  }

}

async function checkSession() {
  try {
    const data = await api("/api/auth/me");
    showApp(data.teacher);
    await loadStudents();
  } catch (error) {
    showLogin();
  }
}

// if (data.teacher.role !== "admin") {
//   const btn = document.getElementById("manageTeachersBtn");

//   if (btn) {
//     btn.style.display = "none";
//   }
// }

async function loadStudents() {
  const data = await api("/api/students");
  state.students = data.students || [];
  updateSubjectFilter();
  renderStudents();
}

function getFilteredStudents() {
  const search = elements.searchInput.value.trim().toLowerCase();
  const subject = elements.subjectFilter.value.trim().toLowerCase();
  const paymentStatus = elements.paymentFilter.value;

  return state.students.filter((student) => {
    const matchesSearch =
      !search ||
      [student.name, (student.subjects || []).join(" "), student.phone, student.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));

    const matchesSubject =
      !subject ||
      (student.subjects || [])
        .map(s => s.toLowerCase())
        .includes(subject);

    const matchesPayment = !paymentStatus || student.paymentStatus === paymentStatus;

    return matchesSearch && matchesSubject && matchesPayment;
  });
}

function updateSubjectFilter() {
  const selectedValue = elements.subjectFilter.value;
  const subjects = [...new Set(state.students.flatMap((student) => student.subjects || []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  elements.subjectFilter.replaceChildren(createOption("", "All subjects"));
  subjects.forEach((subject) => {
    elements.subjectFilter.appendChild(createOption(subject, subject));
  });
  elements.subjectFilter.value = subjects.includes(selectedValue) ? selectedValue : "";
}

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function renderStudents() {
  const students = getFilteredStudents();
  elements.studentsTableBody.replaceChildren();
  elements.emptyState.hidden = students.length !== 0;

  students.forEach((student) => {
    elements.studentsTableBody.appendChild(createStudentRow(student));
  });

  renderSummary();
}

function createStudentRow(student) {
  console.log(student);
  const row = document.createElement("tr");
  const balance = Math.max(Number(student.feeAmount || 0) - Number(student.amountPaid || 0), 0);

  const nameCell = document.createElement("td");
  const nameWrap = document.createElement("div");
  const photoCell =
    document.createElement("td");

  const photo =
    document.createElement("img");

  photo.src =
    student.photo
      ? `/uploads/${student.photo}`
      : "/assets/logo.png";

      photo.style.width = "50px";
      photo.style.height = "50px";
      photo.style.borderRadius = "50%";
      photo.style.objectFit = "cover";

  photoCell.appendChild(photo);

  const classCell =
      createCell(
        student.className || "-"
      );

  const name = document.createElement("strong");
  const joined = document.createElement("span");
  nameWrap.className = "student-name";
  name.textContent = student.name;
  joined.textContent = `Joined: ${formatDate(student.joiningDate)}`;
  nameWrap.append( name, joined);
  nameCell.appendChild(nameWrap);

  const subjectCell =
  createCell(
    Array.isArray(student.subjects)
      ? student.subjects.join(", ")
      : (student.subject || "-")
  );

  const paymentCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `badge badge-${String(student.paymentStatus || "Due").toLowerCase()}`;
  badge.textContent = student.paymentStatus || "Due";
  paymentCell.appendChild(badge);

  const feeCell = createCell(money(student.feeAmount));
  const paidCell = createCell(money(student.amountPaid));
  const balanceCell = createCell(money(balance));

  const contactCell = document.createElement("td");
  contactCell.className = "contact-cell";
  contactCell.textContent = [student.phone, student.email].filter(Boolean).join(" | ") || "-";

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "row-actions";

  const editButton = document.createElement("button");
  editButton.className = "action-button";
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.addEventListener(
    "click",
    () => {

      window.location.href =
        `/admission.html?id=${student._id || student.id}`;

    }
  );


  const deleteButton = document.createElement("button");
  deleteButton.className = "action-button danger";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener(
      "click",
      () => deleteStudent(student._id || student.id)
    );

  actions.append(editButton, deleteButton);
  actionsCell.appendChild(actions);

  row.append(
    photoCell,
    nameCell,
    classCell,
    subjectCell,
    paymentCell,
    feeCell,
    paidCell,
    balanceCell,
    contactCell,
    actionsCell
  );

  return row;
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function renderSummary() {
  const totalStudents = state.students.length;
  const feesCollected = state.students.reduce(
    (sum, student) => sum + Number(student.amountPaid || 0),
    0
  );
  const totalFees = state.students.reduce(
    (sum, student) => sum + Number(student.feeAmount || 0),
    0
  );
  const balanceDue = Math.max(totalFees - feesCollected, 0);

  const subjectCount = new Set(
    state.students.flatMap(
      student => student.subjects || []
    )
  ).size;

  elements.totalStudents.textContent = totalStudents;
  elements.feesCollected.textContent =
    "₹" + feesCollected.toLocaleString("en-IN");

  elements.balanceDue.textContent =
    "₹" + balanceDue.toLocaleString("en-IN");
  elements.subjectCount.textContent = subjectCount;
}

function formPayload() {
  const data = Object.fromEntries(new FormData(elements.studentForm).entries());

  return {
    name: data.name,
    subject: data.subject,
    phone: data.phone,
    email: data.email,
    joiningDate: data.joiningDate,
    paymentStatus: data.paymentStatus,
    feeAmount: Number(data.feeAmount || 0),
    amountPaid: Number(data.amountPaid || 0),
    dueDate: data.dueDate,
    notes: data.notes
  };
}

function editStudent(id) {
  console.log("Editing:", id);

  const student = state.students.find(
    (item) => (item._id || item.id) === id
  );

  if (!student) {
    console.log("Student not found");
    return;
  }

  state.editingId = id;
  elements.formTitle.textContent = "Edit Student";
  elements.saveStudentButton.textContent = "Update Student";
  setFormValue("studentId", student.id || student._id);
  setFormValue("studentName", student.name);
  setFormValue("studentClass",student.className );
  setFormValue(
      "studentSubject",
      Array.isArray(student.subjects)
        ? student.subjects[0]
        : student.subject
    );
  setFormValue("studentPhone", student.phone);
  setFormValue("studentEmail", student.email);
  setFormValue("joiningDate", student.joiningDate);
  setFormValue("dueDate", student.dueDate);
  setFormValue("feeAmount", student.feeAmount);
  setFormValue("amountPaid", student.amountPaid);
  setFormValue("paymentStatus", student.paymentStatus || "Due");
  setFormValue("studentNotes", student.notes);
  elements.formMessage.textContent = "";
  document.querySelector(".editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setFormValue(id, value) {
  document.getElementById(id).value = value || "";
}

function resetForm() {
  state.editingId = null;
  elements.studentForm.reset();
  elements.formTitle.textContent = "Add Student";
  elements.saveStudentButton.textContent = "Save Student";
  elements.formMessage.textContent = "";
  setFormValue("paymentStatus", "Due");
}

async function deleteStudent(id) {
  const student = state.students.find(
    (item) => (item._id || item.id) === id
  );

  if (!student) {
    console.log("Student not found");
    return;
  }

  const confirmed = window.confirm(`Delete ${student.name}'s record?`);
  if (!confirmed) {
    return;
  }

  await api(`/api/students/${id}`, { method: "DELETE" });
  await loadStudents();
  if (state.editingId === id) {
    resetForm();
  }
}

function exportCsv() {
  const rows = [
    [
      "Name",
      "Subject",
      "Phone",
      "Email",
      "Joining Date",
      "Payment Status",
      "Total Fee",
      "Amount Paid",
      "Balance",
      "Due Date",
      "Notes"
    ],
    ...getFilteredStudents().map((student) => {
      const balance = Math.max(
        Number(student.feeAmount || 0) - Number(student.amountPaid || 0),
        0
      );

      return [
        student.name,
        (student.subjects || []).join(", "),
        student.phone,
        student.email,
        student.joiningDate,
        student.paymentStatus,
        student.feeAmount,
        student.amountPaid,
        balance,
        student.dueDate,
        student.notes
      ];
    })
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "rk-krishna-classes-students.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const safeValue = String(value || "");
  return `"${safeValue.replaceAll('"', '""')}"`;
}

if (elements.loginForm) {

  elements.loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    elements.loginError.textContent = "";

    try {

      const payload = Object.fromEntries(
        new FormData(elements.loginForm).entries()
      );

      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      elements.loginForm.reset();

      window.location.href = "/dashboard.html";

    } catch (error) {

      elements.loginError.textContent = error.message;

    }

  });

}

if (elements.logoutButton) {

  elements.logoutButton.addEventListener("click", async () => {

    await api("/api/auth/logout", {
      method: "POST"
    });

    window.location.href = "/login.html";

  });

}

if (elements.studentForm) {

  elements.studentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    elements.formMessage.textContent = "";

    try {

      const payload = formPayload();

      const path = state.editingId
        ? `/api/students/${state.editingId}`
        : "/api/students";

      const method = state.editingId
        ? "PUT"
        : "POST";

      await api(path, {
        method,
        body: JSON.stringify(payload)
      });

      elements.formMessage.textContent =
        state.editingId
          ? "Student record updated."
          : "Student record saved.";

      resetForm();

      await loadStudents();

    } catch (error) {

      elements.formMessage.textContent = error.message;

    }

  });

}

if (elements.clearFormButton) {
  elements.clearFormButton.addEventListener("click", resetForm);
}

if (elements.searchInput) {
  elements.searchInput.addEventListener("input", renderStudents);
}

if (elements.subjectFilter) {
  elements.subjectFilter.addEventListener("change", renderStudents);
}

if (elements.paymentFilter) {
  elements.paymentFilter.addEventListener("change", renderStudents);
}

if (elements.exportButton) {
  elements.exportButton.addEventListener("click", exportCsv);
}

const manageTeachersBtn =
  document.getElementById("manageTeachersBtn");

if (manageTeachersBtn) {

  manageTeachersBtn.addEventListener("click", () => {

    window.location.href =
      "/manage-teachers.html";

  });

}

const admissionBtn =
  document.getElementById("admissionBtn");

if (admissionBtn) {

  admissionBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "/admission.html";

    }
  );

}

if (currentPage.includes("dashboard")) {
  checkSession();
}