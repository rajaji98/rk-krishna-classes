const params =
  new URLSearchParams(
    window.location.search
  );

const studentId =
  params.get("id");

async function loadStudent() {

  const response =
    await fetch(
      `/api/students/${studentId}`,
      {
        credentials: "include"
      }
    );

  const data =
    await response.json();

  const student =
    data.student;

  const balance =
    Number(student.feeAmount || 0) -
    Number(student.amountPaid || 0);

  document.getElementById("receiptNo").textContent =
    "RC-" + student._id.slice(-6).toUpperCase();

  document.getElementById("receiptDate").textContent =
    new Date().toLocaleDateString("en-IN");

  document.getElementById("studentName").textContent =
    student.name || "";

  document.getElementById("fatherName").textContent =
    student.fatherName || "";

  document.getElementById("className").textContent =
    student.className || "";

  document.getElementById("subjects").textContent =
    (student.subjects || []).join(", ");

  document.getElementById("fee").textContent =
    "₹" + student.feeAmount;

  document.getElementById("paid").textContent =
    "₹" + student.amountPaid;

  document.getElementById("balance").textContent =
    "₹" + balance;

  document.getElementById("status").textContent =
    student.paymentStatus;

}

loadStudent();