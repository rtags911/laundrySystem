document.addEventListener("DOMContentLoaded", () => {
  const id = getCookie("id");
  console.log(id);
  // Create the request body

  const requestBody = {
    id: id,
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  };

  fetch("http://localhost/laundrySystem/api/queue/queue.php", requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      // Add queue number to each row
      if (!Array.isArray(data)) {
        // Wrap data in an array
        data = [data];
      }

      // Now data is guaranteed to be an array
      data.forEach((row, index) => {
        row.queueNumber = index + 1;
      });

      const tableData = data.map((row) => [
        `#${row.queueNumber}`,
        `<img class="rounded-circle me-2" width="30" height="30" src="assets/img/profile.png">${row.name}`,
        row.type,
        row.kilo,
        row.total,
        row.status_text,
        row.created_at,
        `<a class="mx-1 text-decoration-none text-danger" href="#" data-bs-target="#remove" data-id="${row.id}" data-bs-toggle="modal">
          <i class="far fa-trash-alt text-danger" style="font-size: 20px;"></i> Remove</a>`,
      ]);

      const table = $("#dataTable");

      if ($.fn.dataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
      }

      $("#dataTable tbody").on(
        "click",
        'a[data-bs-target="#remove"]',
        function () {
          const logId = $(this).data("id");
          // Set the log ID to the hidden input field in the delete form
          $('#deleteForm input[name="data_id"]').val(logId);
        }
      );

      $("#deleteForm").on("submit", function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();
        // Get the log ID from the hidden input field
        const logId = $('#deleteForm input[name="data_id"]').val();
        removeLog(logId);
        // Close the modal (if needed)
        $("#remove").modal("hide");
      });

      table.DataTable({
        data: tableData,
        columns: [
          { title: "Queue" },
          { title: "Customer" },
          { title: "Type" },
          { title: "Kilo kg/p" },
          { title: "Status" },
          { title: "Total" },
          { title: "Date Created" },
          { title: "Option" },
        ],
        paging: true,
        searching: true,
        info: true,
      });
    })
    .catch((error) => console.error("Error:", error));

  const userID = getCookie("id");
  var action = "profile";

  FormData = {
    id: userID,
    action: action,
  };

  $.ajax({
    url: "http://localhost/laundrySystem/api/file/",
    type: "POST",
    data: FormData,
    success: function (data) {
      const data1 = JSON.parse(data);
      var test = data1[0];

      const fullname = test.fullname || "";
      const [firstName, lastName] = fullname.split(" ");

      $("#upFirstname").val(firstName);
      $("#upLastname").val(lastName);
      $("#upAddress").val(test.address);
      $("#UpContact").val(test.contact);

      const imageUrl = test.photo
        ? "http://localhost/laundrySystem/img/customer/" + test.photo
        : "assets/img/profile.png";

      document.getElementById("profile-img").src = imageUrl;
    },
    error: function (xhr, status, error) {
      console.error("Error updating status:", error);
    },
  });

  document
    .getElementById("Update")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      const firstname = $("#Update input[name='firstname']").val();
      const lastname = $("#Update input[name='lastname']").val();
      const address = $("#Update input[name='address']").val();
      const contact = $("#Update input[name='contact']").val();
      // Construct the query string
      var queryString = {
        id: userID,
        firstname: firstname,
        lastname: lastname,
        address: address,
        contact: contact,
      };

      $.ajax({
        method: "PUT",
        url: "http://localhost/laundrySystem/api/file/",
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

  const kiloInput = document.getElementById("kilo");
  const costDisplay = document.getElementById("costDisplay");

  kiloInput.addEventListener("input", () => {
    const kilo = parseFloat(kiloInput.value);
    let cost = 0;

    if (kilo <= 5) {
      cost = 150;
    } else {
      cost = 150 + (kilo - 5) * 25;
    }

    costDisplay.innerText = `Cost: ${cost} PHP`;
  });

  document
    .getElementById("bookingForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      var formData = $(this).serializeArray();
      var userID = getCookie("id"); // Assuming you have a function to retrieve the user ID from cookies
      formData.push({ name: "userID", value: userID });

      $.ajax({
        url: "http://localhost/laundrySystem/api/file/",
        type: "POST",
        data: $.param(formData),
        success: function (response) {
          try {
            var data = JSON.parse(response);
            if (data.success) {
              Swal.fire({
                title: "Success",
                text: "You have successfully Created the Booking",
                icon: "success",
                confirmButtonText: "Ok",
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload();
                }
              });
            } else {
              alert("Failed to create booking: " + data.message);
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            console.error("Server response:", response);
            alert("An error occurred. Please try again.");
          }
        },
        error: function (xhr, status, error) {
          console.error("AJAX Error:", status, error);
          alert("An error occurred. Please try again.");
        },
      });
    });

  // Assuming you have a way to get the current user ID and type
  const userId = getCookie("id"); // Replace this with actual logic
  // Replace this with actual logic

  // Set user ID and type in the hidden form
  $("#user-id").val(userId);
  $("#type").val();

  // Click event for the pencil icon
  $("#edit-icon").on("click", function () {
    $("#uploadModal").modal("show");
  });

  // Change event for the file input

  // document.getElementById("uploadPic").addEventListener("submit", function (e) {
  //   e.preventDefault();

  //   const formData = $(this);

  //   $.ajax({
  //     url: "http://localhost/laundrySystem/api/upload/", // Adjust this URL if needed
  //     type: "POST",
  //     data: formData,
  //     processData: false,
  //     contentType: false,
  //     success: function (response) {
  //       if (response.success) {
  //         alert("Profile picture updated successfully!");
  //         $("#uploadModal").modal("hide");
  //       } else {
  //         alert("Error: " + response.error);
  //       }
  //     },
  //     error: function (xhr, status, error) {
  //       console.error("Error:", error);
  //       alert("An error occurred while uploading the image.");
  //     },
  //   });
  // });
});

function getCookie(name) {
  let cookieArr = document.cookie.split(";");
  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

function removeLog(logId) {
  fetch(`http://localhost/laundrySystem/api/file/`, {
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

        
        Swal.fire({
          title: "Success",
          text: "You have successfully Deleted the Queue",
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
    .catch((error) => console.log(error));
}
