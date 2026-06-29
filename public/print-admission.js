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

  console.log(data.student);

    document.getElementById("admissionNo").textContent =
     student._id.slice(-6).toUpperCase();

    document.getElementById("joiningDate").textContent =
  student.joiningDate || "";

    document.getElementById(
    "studentName"
    ).textContent =
    student.name || "";

    document.getElementById(
    "fatherName"
    ).textContent =
    student.fatherName || "";

    document.getElementById(
    "className"
    ).textContent =
    student.className || "";

    document.getElementById(
    "subjects"
    ).textContent =
    (student.subjects || []).join(", ");

    document.getElementById(
    "schoolName"
    ).textContent =
    student.schoolName || "";

    document.getElementById(
    "phone"
    ).textContent =
    student.phone || "";

    document.getElementById(
    "address"
    ).textContent =
    student.address || "";

    document.getElementById(
    "percentage"
    ).textContent =
    student.lastExamPercentage + "%";

    document.getElementById(
    "fee"
    ).textContent =
    "₹" + student.feeAmount;

    document.getElementById(
    "paid"
    ).textContent =
    "₹" + student.amountPaid;

    document.getElementById(
    "status"
    ).textContent =
    student.paymentStatus;

    const photo =
    document.getElementById("studentPhoto");

    photo.src =
    student.photo
        ? `/uploads/${student.photo}`
        : "/assets/logo.png";

    photo.onload = () => {
    window.print();
};

    }


loadStudent();