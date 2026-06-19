const params =
  new URLSearchParams(
    window.location.search
  );

const studentId =
  params.get("id");

const form =
  document.getElementById(
    "admissionForm"
  );

const message =
  document.getElementById(
    "formMessage"
  );

async function loadStudent() {

  if (!studentId) {
    return;
  }

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

  form.name.value =
    student.name || "";

  form.fatherName.value =
    student.fatherName || "";

  form.phone.value =
    student.phone || "";

  form.dob.value =
    student.dob || "";

  form.address.value =
    student.address || "";

  form.className.value =
    student.className || "";

  form.schoolName.value =
    student.schoolName || "";

  form.lastExamPercentage.value =
    student.lastExamPercentage || "";

  form.feeAmount.value =
    student.feeAmount || "";

  form.amountPaid.value =
    student.amountPaid || "";

  form.paymentStatus.value =
    student.paymentStatus || "Due";

    document
    .querySelectorAll(
      'input[name="subjects"]'
    )
    .forEach(cb => {

      cb.checked =
        student.subjects?.includes(
          cb.value
        );

    });

  document.querySelector("h1")
    .textContent =
    "Edit Student";

  document.querySelector(
    'button[type="submit"]'
  ).textContent =
    "Update Student";

}


form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    try {

            const formData =
            new FormData(form);

            const subjects =
            formData
                .getAll("subjects");

            // Remove duplicate subject entry
        formData.delete("subjects");

        // Add all selected subjects
        subjects.forEach(subject => {
        formData.append(
            "subjects",
            subject
        );
        });

        console.log("Selected Subjects:", subjects);

                for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
                }
      const url =
        studentId
          ? `/api/students/${studentId}`
          : "/api/admissions";

      const method =
        studentId
          ? "PUT"
          : "POST";
        
      console.log("Student ID:", studentId);
      console.log("Method:", method);
      console.log("URL:", url);

      const response =
        await fetch(
          url,
          {
            method,
            credentials: "include",

            body : formData

          }
        );

      

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message
        );

      }

      message.textContent =
        "Student registered successfully.";

      form.reset();

    } catch (error) {

      message.textContent =
        error.message;

    }

  }
);

loadStudent();
