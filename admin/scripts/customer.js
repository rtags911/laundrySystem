document.addEventListener("DOMContentLoaded", function () {
  fetch(`http://ashantilaundrysystem.muccs.host/admin/api/customer_list.php`)
    .then((response) => response.json())
    .then((data) => {
      // Check if data is valid
      if (!data || !data.data) {
        console.error("Invalid data received from server");
        return;
      }

      // Map data to format expected by DataTables
      const tableData = data.data.map((row) => {
        const fullname = row.fullname || "";
        const [firstName, lastName] = fullname.split(" ");
        return [
          row.id,
          `<img class="rounded-circle me-2" width="30" height="30" src="${getImageSrc(
            row.customer_photo
          )}">${row.fullname}`,
          row.username,
          row.address,
          row.contact,
          row.created_at,
          `<a class="mx-1 text-decoration-none text-warning" href="#" data-bs-target="#update" data-bs-toggle="modal" data-username="${
            row.username
          }" data-id="${row.id}" data-firstname="${
            firstName || ""
          }" data-lastname="${lastName || ""}" data-address="${
            row.address || ""
          }" data-contact="${row.contact || ""}">
            <i class="far fa-edit text-warning" style="font-size: 20px;"></i> Update</a>
            <a class="mx-1 text-decoration-none text-danger" href="#" data-bs-target="#remove"  data-id="${
              row.id
            }" data-bs-toggle="modal">
            <i class="far fa-trash-alt text-danger" style="font-size: 20px;"></i> Remove</a>`,
        ];
      });

      // Initialize DataTable
      const table = $("#dataTable");

      if ($.fn.dataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
      }

      table.DataTable({
        data: tableData,
        columns: [
          { title: "ID" },
          { title: "Full Name" },
          { title: "Username" },
          { title: "Address" },
          { title: "Contact Number" },
          { title: "Date Created" },
          { title: "Actions" },
        ],
        paging: true,
        searching: true,
        info: true,
      });

      // Event handling for dynamically created links
      $("#dataTable tbody").on(
        "click",
        'a[data-bs-target="#update"]',
        function () {
          const logId = $(this).data("id");
          const firstname = $(this).data("firstname");
          const lastname = $(this).data("lastname");
          const address = $(this).data("address");
          const contact = $(this).data("contact");
          const username = $(this).data("username");

          // Populate modal fields for update
          $("#editID").val(logId);
          $("#editUsername").val(username);
          $("#editFirstname").val(firstname);
          $("#editLastname").val(lastname);
          $("#editAddress").val(address);
          $("#editContact").val(contact);
        }
      );

      $("#dataTable tbody").on(
        "click",
        'a[data-bs-target="#remove"]',
        function () {
          const logId = $(this).data("id");

          // Set the log ID to the hidden input field in the delete form
          $("#deleteForm input[name='data_id']").val(logId);
        }
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Event listener for adding a customer
  document
    .getElementById("addCustomer")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent form submission

      const formData = new FormData(this);

      fetch(`http://ashantilaundrysystem.muccs.host/admin/api/customer/`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Reload the DataTable on successful addition

            Swal.fire({
              title: "Success",
              text: data.message,
              icon: "success",
              confirmButtonText: "Ok",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          } else {
            Swal.fire({
              title: "Error",
              text: data.message,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        })
        .catch((error) => console.error("Error:", error));
    });

  // Event listener for updating a customer
  document
    .getElementById("updateCustomer")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent form submission

      const logId = $("#updateCustomer input[name='id']").val();
      const firstname = $("#updateCustomer input[name='firstname']").val();
      const lastname = $("#updateCustomer input[name='lastname']").val();
      const address = $("#updateCustomer input[name='address']").val();
      const contact = $("#updateCustomer input[name='contact']").val();
      const username = $("#updateCustomer input[name='username']").val();
      const password = $("#updateCustomer input[name='password']").val();
      const repassword = $("#updateCustomer input[name='re-password']").val();

      const queryString = {
        data_id: logId,
        firstname: firstname,
        lastname: lastname,
        address: address,
        contact: contact,
        username: username,
        password: password,
        repassword: repassword,
      };

      // Perform AJAX PUT request for updating customer
      $.ajax({
        method: "PUT",
        url: "http://ashantilaundrysystem.muccs.host/admin/api/customer/",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(queryString),
        success: function (data) {
          if (data.success) {
            // Reload the DataTable on successful update

            Swal.fire({
              title: "Success",
              text: data.message,
              icon: "success",
              confirmButtonText: "Ok",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          } else {
            Swal.fire({
              title: "Error",
              text: data.message,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    });

  // Event listener for deleting a customer
  $("#deleteForm").on("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const logId = $("#deleteForm input[name='data_id']").val();

    // Perform AJAX DELETE request for deleting customer
    fetch(`http://ashantilaundrysystem.muccs.host/admin/api/customer/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data_id: logId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          // Reload the DataTable on successful deletion

          Swal.fire({
            title: "Success",
            text: data.message,
            icon: "success",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        } else {
          Swal.fire({
            title: "Error",
            text: data.message,
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete customer",
          icon: "error",
          confirmButtonText: "Ok",
        });
      });
  });
});

function getImageSrc(photo) {
  if (photo) {
    return `http://ashantilaundrysystem.muccs.host/assets/img/customer/${photo}`;
  } else {
    return "http://ashantilaundrysystem.muccs.host/assets/img/profile.png"; // Default image path
  }
}

