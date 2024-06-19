document.addEventListener("DOMContentLoaded", () => {
  var userID = getCookie("id");
  var $table = $("#table");

  const tester = new FormData();
  tester.append("id", userID);

  for (const pair of tester.entries()) {
    console.log("", pair[0] + ", " + pair[1]);
  }

  if (!$table.data("bootstrap.table")) {
    // Make an AJAX request to fetch the data
    $.ajax({
      url: "http://ashantilaundrysystem.muccs.host/api/post/post1.php", // Correct path to your PHP script
      type: "POST",
      processData: false,
      contentType: false,
      data: tester,
      success: function (data) {
        console.log("AJAX success data:", data); // Log the data for debugging

        if (!Array.isArray(data)) {
          console.error("Data is not an array:", data);
          return;
        }

        // Destroy the table instance if it exists
        $table.bootstrapTable("destroy");

        // Set the fetched data as the source for the Bootstrap table
        $table.bootstrapTable({
          data: data,
          columns: [
            {
              field: "name",
              title: "Full Name",
            },
            {
              field: "type",
              title: "Wash Type",
            },
            {
              field: "kilo",
              title: "Kg/p",
            },
            {
              field: "total",
              title: "Total",
            },
            {
              field: "status_text",
              title: "Status",
            },
            {
              field: "created_at",
              title: "Date Created",
            },
            {
              field: "date_booked",
              title: "Date Booked",
            },
            {
              field: "operate",
              title: "Tools",
              formatter: operateFormatter,
              // Add additional cell styles for the actions column
              cellStyle: {
                textAlign: "center",
              },
            },
          ],
        });
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
      },
    });

 $("#filterBy").click(function () {
   var selectedStatus = $("#select").val();

   if (selectedStatus === "all") {
     // Show all rows by clearing any filters
     $table.bootstrapTable("filterBy", {});
   } else {
     // Refresh the table with the filtered data
     $table.bootstrapTable("filterBy", {
       status_text: selectedStatus,
     });
   }
 });
    function operateFormatter(value, row, index) {
      // Ensure 'status' field exists in the row
      const cancelDisabled = row.status !== 0;
      const textClass = cancelDisabled ? "text-muted" : "text-danger";
      const editclass = cancelDisabled ? "text-muted" : "text-primary";

      return ` <div class="d-flex align-items-center">
    <a class="edit mx-1 text-decoration-none ${editclass} ${
        cancelDisabled ? "disabled" : ""
      }" 
       href="javascript:void(0)" 
       data-id="${row.id}">
      <i class="fa fa-pencil-alt ${editclass} " style="font-size: 20px;"></i> Edit
    </a>
    <a class="remove mx-1 text-decoration-none ${textClass} ${
        cancelDisabled ? "disabled" : ""
      }" 
       href="javascript:void(0)" 
       data-id="${row.id}">
      <i class="far fa-trash-alt ${textClass}" style="font-size: 20px;"></i> Cancel
    </a>
  </div>`;
    }

    $table.on("click", ".edit", function () {
      var rowIndex = $(this).closest("tr").data("index");
      var rowData = $table.bootstrapTable("getData")[rowIndex];

      // Populate modal fields with row data
      $("#editId").val(rowData.id);
      $("#editKilo").val(rowData.kilo);
      $("#editTotal").val(calculateTotal(rowData.kilo));

      if ($(this).hasClass("disabled")) {
        return; // Prevent further action if disabled
      }

      // Set minimum kilo value
      $("#editKilo").attr("min", rowData.kilo);

      // Show the edit modal
      $("#editModal").modal("show");

      // Clear any previous warning messages
      $("#kiloWarning").remove();
    });

    // Input change handler for kilo in edit modal
    $("#editKilo").on("input change", function () {
      var kilo = parseFloat($(this).val());
      var minKilo = parseFloat($(this).attr("min")); // Get the minimum allowable kilo

      if (isNaN(kilo)) {
        kilo = 0; // Set kilo to 0 if it's NaN (e.g., empty input)
      }

      if (kilo < minKilo) {
        // Display warning message if kilo is less than the minimum
        if ($("#kiloWarning").length === 0) {
          // Append warning message if not already present
          $(
            "<div id='kiloWarning' class='form-text text-danger'>Kilo cannot be lower than current value (" +
              minKilo +
              ")</div>"
          ).insertAfter($(this));
        }
        $("#saveChangesBtn").prop("disabled", true); // Disable save changes button
      } else {
        // Remove warning message if kilo is valid
        $("#kiloWarning").remove();
        $("#saveChangesBtn").prop("disabled", false); // Enable save changes button
      }

      // Update total cost
      $("#editTotal").val(calculateTotal(kilo));
    });

    // Save changes button click handler
    $("#saveChangesBtn").click(function () {
      var id = $("#editId").val();
      var kilo = parseFloat($("#editKilo").val());
      var total = calculateTotal(kilo);

      // Update data and close modal
      updateRowData(id, kilo, total);
      $("#editModal").modal("hide");
    });

    $table.on("click", ".remove", function () {
      // Retrieve the row index from the closest row
      var rowIndex = $(this).closest("tr").data("index");
      // Retrieve the row data using the row index
      var rowData = $table.bootstrapTable("getData")[rowIndex];
      // Get the candidate ID from the row data
      var candidateId = rowData.id;

      // Check if the cancel button is disabled
      if ($(this).hasClass("disabled")) {
        return; // Prevent further action if disabled
      }

      // Set the candidate ID in the confirm delete modal
      $("#confirmDeleteBtn").data("id", candidateId);
      // Show the confirm delete modal
      $("#confirmDeleteModal").modal("show");
    });

    $("#confirmDeleteBtn").click(function () {
      var id = $(this).data("id");
      removeLog(id);
    });
  }
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

function updateRowData(id, kilo, total) {
  fetch(`http://ashantilaundrysystem.muccs.host/api/file/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      kilo: kilo,
      total: total,
      action: "service",
    }),
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
          text: data.message,
          icon: "success",
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
function removeLog(logId) {
  fetch(`http://ashantilaundrysystem.muccs.host/api/file/`, {
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
          text: "You have successfully cancelled the Queue",
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

function calculateTotal(kilo) {
  let cost = 0;
  if (kilo <= 5) {
    cost = 150;
  } else {
    cost = 150 + (kilo - 5) * 25;
  }
  return cost;
}
