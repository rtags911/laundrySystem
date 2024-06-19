document.addEventListener("DOMContentLoaded", function () {
  const id = getCookie("id"); // Make sure you define and use the `getCookie` function

  fetch(`http://ashantilaundrysystem.muccs.host/admin/api/staff_list.php`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const tableData = data.map((row) => {
        return [
          row.id,
          `<img class="rounded-circle me-2" width="30" height="30" src="${getImageSrc(
            row.role,
            row.photo
          )}">${row.username}`,
          row.role,
          row.created_at,
          `<a class="mx-1 text-decoration-none text-warning" href="#" data-bs-target="#update" data-bs-toggle="modal" data-id="${row.id}" data-username="${row.username}" data-type="${row.level}">
            <i class="far fa-edit text-warning" style="font-size: 20px;"></i> Update</a>
           <a class="mx-1 text-decoration-none text-danger" href="#" data-bs-target="#remove"  data-id="${row.id}" data-bs-toggle="modal">
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
          { title: "Staff" },
          { title: "Type" },
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
          const username = $(this).data("username");
          const userType = $(this).data("type");

          $("#id").val(logId);
          $("#editUsername").val(username);
          $("#userType").val(userType);
        }
      );

      $("#dataTable tbody").on(
        "click",
        'a[data-bs-target="#remove"]',
        function () {
          const logId = $(this).data("id");
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
    .getElementById("addAdmin")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      // Get form data
      const formData = new FormData(this);

      // Construct query string from form data

      // Remove the leading '&' character

      // Send form data with POST method
      fetch(`http://ashantilaundrysystem.muccs.host/admin/api/staff/`, {
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
            }
          });
        })
        .catch((error) => console.error("Error:", error));
    });

  document
    .getElementById("updateAdmin")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      const logId = $("#updateAdmin input[name='data_id']").val();
      const username = $("#updateAdmin input[name='username']").val();
      const password = $("#updateAdmin input[name='password']").val();
      const retypePass = $("#updateAdmin input[name='newpassword']").val();

      // Construct the query string
      var queryString = {
        data_id: logId,
        username: username,
        password: password,
        retypePass: retypePass,
      };

      $.ajax({
        method: "PUT",
        url: "http://ashantilaundrysystem.muccs.host/admin/api/staff/",
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
  fetch(`http://ashantilaundrysystem.muccs.host/admin/api/staff/`, {
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
        console.log("staff removed successfully");
        // Optionally, reload the DataTable

        Swal.fire({
          title: "Success",
          text: "You have successfully Deleted the Staff",
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

function getImageSrc(role, photo) {
  if (role === "staff") {
    return `http://ashantilaundrysystem.muccs.host/img/staff/${photo}`;
  } else if (role === "admin") {
    return `http://ashantilaundrysystem.muccs.host/img/admin/${photo}`;
  } else {
    return "http://ashantilaundrysystem.muccs.host/assets/img/profile.png"; // Default image path if role is neither 'staff' nor 'admin'
  }
}


