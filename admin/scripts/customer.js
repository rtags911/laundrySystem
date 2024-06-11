document.addEventListener("DOMContentLoaded", function () {
  const id = getCookie("id"); // Make sure you define and use the `getCookie` function

  fetch(`https://ashantilaundrysystem.muccs.host/admin/api/customer_list.php`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const tableData = data.map((row) => {
        const fullname = row.fullname || "";
        const [firstName, lastName] = fullname.split(" ");
        return [
          row.id,
          `<img class="rounded-circle me-2" width="30" height="30" src="assets/img/profile.png">${row.fullname}`,
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
          }" data-contact="${row.contact || ""}" >
            <i class="far fa-edit text-warning" style="font-size: 20px;"></i> Update</a>
           <a class="mx-1 text-decoration-none text-danger" href="#" data-bs-target="#remove"  data-id="${
             row.id
           }" data-bs-toggle="modal">
            <i class="far fa-trash-alt text-danger" style="font-size: 20px;"></i> Remove</a>`,
        ];
      });
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

      // Event delegation for dynamically created links
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

      $("#deleteForm").on("submit", function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Get the log ID from the hidden input field
        const logId = $("#deleteForm input[name='data_id']").val();

        removeLog(logId);

        // Close the modal (if needed)
        $("#remove").modal("hide");
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  document
    .getElementById("addCustomer")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      // Get form data
      const formData = new FormData(this);

      // Construct query string from form data

      // Remove the leading '&' character

      // Send form data with POST method
      fetch(`https://ashantilaundrysystem.muccs.host/api/customer/`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire({
            title: "Success",
            text: data.message,
            icon: "success",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            } else {
              Swal.fire({
                title: "Error",
                text: data.message,
                icon: "error",
                confirmButtonText: "Ok",
              });
            }
          });
        })
        .catch((error) => console.error("Error:", error));
    });

  document
    .getElementById("updateCustomer")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      const logId = $("#updateCustomer input[name='id']").val();
      const firstname = $("#updateCustomer input[name='firstname']").val();
      const lastname = $("#updateCustomer input[name='lastname']").val();
      const address = $("#updateCustomer input[name='address']").val();
      const contact = $("#updateCustomer input[name='contact']").val();
      const username = $("#updateCustomer input[name='username']").val();
      // Construct the query string
      var queryString = {
        data_id: logId,
        firstname: firstname,
        lastname: lastname,
        address: address,
        contact: contact,
        username: username,
      };

      $.ajax({
        method: "PUT",
        url: "https://ashantilaundrysystem.muccs.host/api/customer/",
        headers: {
          "Content-Type": "application/json",
        }, // Set content type to JSON
        data: JSON.stringify(queryString),
        success: function (data) {
          Swal.fire({
            title: "Success",
            text: data.message,
            icon: "success",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            } else {
              Swal.fire({
                title: "Error",
                text: data.message,
                icon: "error",
                confirmButtonText: "Ok",
              });
            }
          });
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    });
});

function getCookie(name) {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(cname) == 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

function removeLog(logId) {
  fetch(`https://ashantilaundrysystem.muccs.host/api/customer/`, {
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
      if (data.message) {
        console.log("Customer removed successfully");
        // Optionally, reload the DataTable
        $("#dataTable").DataTable().ajax.reload();

        Swal.fire({
          title: "Success",
          text: "You have successfully Deleted the Customer",
          icon: "success",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      } else {
        window.location.reload();
      }
    })
    .catch((error) => window.location.reload());
}
