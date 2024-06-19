document.addEventListener("DOMContentLoaded", () => {
  const $table = $("#table");

  if (!$table.data("bootstrap.table")) {
    $.ajax({
      url: "http://ashantilaundrysystem.muccs.host/admin/api/laundry_queue.php",
      type: "GET",
      processData: false,
      contentType: false,
      success: function (data) {
        console.log("AJAX success data:", data);

        if (!Array.isArray(data)) {
          console.error("Data is not an array:", data);
          return;
        }

        data.forEach((row, index) => {
          row.queueNumber = index + 1;
        });

        $table.bootstrapTable("destroy");

        $table.bootstrapTable({
          data: data,
          columns: [
            {
              field: "queueNumber",
              title: "Queue",
            },
            {
              field: "name",
              title: "Customer",
              formatter: photo,
            },
            {
              field: "type",
              title: "Type",
            },
            {
              field: "kilo",
              title: "Kilo kg/p",
            },
            {
              field: "stats_text",
              title: "Status",
              formatter: drop,
            },
            {
              field: "total",
              title: "Total",
              formatter: (value) => `₱${value}`,
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
              title: "Option",
              formatter: operationFormatter,
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

      // Refresh the table with the filtered data

      if (selectedStatus === "All") {
        // Remove any active filters
        $table.bootstrapTable("filterBy", {});
      } else {
        // Filter by selected status_text
        $table.bootstrapTable("filterBy", {
          status_text: selectedStatus,
        });
      }
    });

    function operationFormatter(value, row, index) {
      // Initialize variables first
      const isPending = row.status === 0;
      const isClaimed = row.status === 4;
      const isCancelled = row.status === 5;

      // Now you can use these variables
      const cancelDisabled = !isPending || isClaimed || isCancelled;
      const textColorClass = cancelDisabled ? "text-muted" : "text-danger";
      const toggleModal = isPending ? "modal" : "";

      return `<a class="mx-1 text-decoration-none ${textColorClass} ${
        cancelDisabled ? "disabled" : ""
      }" href="#"
                data-id="${row.id}"
                data-bs-toggle="${toggleModal}"
                data-bs-target="#remove">
                <i class="far fa-trash-alt" style="font-size: 20px;"></i> Cancel
            </a>`;
    }

    function drop(value, row, index) {
      const isClaimedOrCancelled = row.status === 4 || row.status === 5;
      return `<select class="status-dropdown form-select" data-id="${row.id}" ${
        isClaimedOrCancelled ? "disabled" : ""
      }>
                  <option value="0" ${
                    row.status === 0 ? "selected" : ""
                  }>Pending</option>
                  <option value="1" ${
                    row.status === 1 ? "selected" : ""
                  }>Processing</option>
                  <option value="2" ${
                    row.status === 2 ? "selected" : ""
                  }>Folding</option>
                  <option value="3" ${
                    row.status === 3 ? "selected" : ""
                  }>Ready for Pickup</option>
                  <option value="4" ${
                    row.status === 4 ? "selected" : ""
                  }>Claimed</option>
                  <option value="5" ${
                    row.status === 5 ? "selected" : ""
                  }>Cancelled</option>
                </select>`;
    }

    function photo(value, row, index) {
      const photoUrl = row.photo
        ? `http://ashantilaundrysystem.muccs.host/img/customer/${row.photo}`
        : `http://ashantilaundrysystem.muccs.host/assets/img/profile.png`;

      return `<img class="rounded-circle me-2" width="30" height="30" src="${photoUrl}">${row.name}`;
    }

    $table.on("click", 'a[data-bs-target="#remove"]', function (event) {
      const logId = $(this).data("id");
      const currentStatus = $table
        .bootstrapTable("getData")
        .find((row) => row.id === logId)?.status;
      if (![0].includes(currentStatus)) {
        event.preventDefault();
        $("#remove").modal("hide");
        alert("Cannot cancel for statuses other than 'Pending'.");
      } else {
        $("#deleteForm input[name='data_id']").val(logId);
      }
    });

    $("#deleteForm").on("submit", function (event) {
      event.preventDefault();
      const logId = $("#deleteForm input[name='data_id']").val();
      removeLog(logId);
      $("#remove").modal("hide");
    });

    $table.on("change", ".status-dropdown", function () {
      const id = $(this).data("id");
      const newStatus = parseInt($(this).val());
      const selectedOption = $(this).find("option:selected").text();
      const currentStatus = $table
        .bootstrapTable("getData")
        .find((row) => row.id === id)?.status;

      const allowedTransitions = {
        0: [1],
        1: [2],
        2: [3],
        3: [],
        4: [],
      };

      if (!allowedTransitions[currentStatus].includes(newStatus)) {
        $(this).val(currentStatus);
        alert(
          `Cannot transition from "${getStatusText(
            currentStatus
          )}" to "${getStatusText(newStatus)}".`
        );
        return;
      }

      fetch(`http://ashantilaundrysystem.muccs.host/admin/api/queue/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          status: newStatus,
          action: "statusUp",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Status updated successfully to " + selectedOption + "!");
            location.reload();
          } else {
            alert("Failed to update status: " + data.message);
          }
        })
        .catch((error) => console.error("Error updating status:", error));
    });
  }
});

function removeLog(logId) {
  fetch(`http://ashantilaundrysystem.muccs.host/admin/api/queue/`, {
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
    .catch((error) => window.location.reload());
}

function getStatusText(status) {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Processing";
    case 2:
      return "Folding";
    case 3:
      return "Ready for Pickup";
    case 4:
      return "Claimed";
    default:
      return "Unknown";
  }
}
