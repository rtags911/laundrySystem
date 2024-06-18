document.addEventListener("DOMContentLoaded", () => {
  fetch(`http://ashantilaundrysystem.muccs.host/admin/api/laundry_queue.php`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      // Add queue number to each row
      data.forEach((row, index) => {
        row.queueNumber = index + 1;
      });

      const tableData = data.map((row) => {
        const isPending = row.status === 0;
        const isClaimed = row.status === 4;
        const isCancelled = row.status === 5;

        // Determine if cancel button should be disabled
        const cancelDisabled = !isPending || isClaimed || isCancelled;
        const toggleModal = isPending ? "modal" : "";

        // Determine photo URL with fallback
        const photoUrl = row.photo
          ? `http://ashantilaundrysystem.muccs.host/img/customer/${row.photo}`
          : `http://ashantilaundrysystem.muccs.host/assets/img/profile.png`;

        // Determine text color class
        const textColorClass = cancelDisabled ? "text-muted" : "text-danger";

        return [
          `#${row.queueNumber}`,
          `<img class="rounded-circle me-2" width="30" height="30" src="${photoUrl}">${row.name}`,
          // row.type,
          `<select class="type-dropdown form-select" data-id="${row.id}">
            <option value="washFold" ${
              row.type === "washFold" ? "selected" : ""
            }>Wash and Fold</option>
            <option value="suitClean" ${
              row.type === "suitClean" ? "selected" : ""
            }>Suit Clean</option>
            <option value="curtainClean" ${
              row.type === "curtainClean" ? "selected" : ""
            }>Curtain</option>
            <option value="notAvailable" ${
              row.type === "notAvailable" ? "selected" : ""
            }>Not Available</option>
          </select>`,
          row.kilo,
          `<select class="status-dropdown form-select" data-id="${row.id}" ${
            isClaimed ? "disabled" : ""
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
                    </select>`,
          `₱${row.total}`, // Adding PHP sign here
          row.created_at,
          row.date_booked,
          `<a class="mx-1 text-decoration-none ${textColorClass} ${
            cancelDisabled ? "disabled" : ""
          }" href="#" 
                        data-id="${row.id}" 
                        data-bs-toggle="${toggleModal}" 
                        data-bs-target="#remove">
                        <i class="far fa-trash-alt" style="font-size: 20px;"></i> Cancel
                    </a>`,
        ];
      });

      const table = $("#dataTable");

      if ($.fn.dataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
      }

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
          { title: "Date Booked" },
          { title: "Option" },
        ],
        paging: true,
        searching: true,
        info: true,
      });

      $("#dataTable tbody").on(
        "click",
        'a[data-bs-target="#remove"]',
        function (event) {
          const logId = $(this).data("id");
          const status = data.find((row) => row.id === logId)?.status;

          // Disable the modal opening for non-Pending statuses
          if (![0].includes(status)) {
            // Modify [0] to include all statuses that should allow canceling
            event.preventDefault();
            $("#remove").modal("hide"); // Manually hide the modal
            alert("Cannot cancel for statuses other than 'Pending'.");
          } else {
            $("#deleteForm input[name='data_id']").val(logId);
          }
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

      table.on("change", ".type-dropdown", function () {
        const id = $(this).data("id");
        const newType = $(this).val(); // Convert to integer
        const selectedOption = $(this).find("option:selected").text();

        fetch(`http://ashantilaundrysystem.muccs.host/admin/api/queue/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            type: newType,
            action: "type",
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

      // Add event listener for status dropdown change
      table.on("change", ".status-dropdown", function () {
        const id = $(this).data("id");
        const newStatus = parseInt($(this).val()); // Convert to integer
        const selectedOption = $(this).find("option:selected").text();

        // Determine current status
        const currentStatus = data.find((row) => row.id === id)?.status;

        // Define allowed status transitions
        const allowedTransitions = {
          0: [1], // Pending can transition to Processing
          1: [2], // Processing can transition to Folding
          2: [3], // Folding can transition to Ready for Pickup
          3: [], // Ready for Pickup cannot transition to any other status
          4: [], // Claimed cannot transition to any other status
        };

        // Check if the selected newStatus is allowed for the current status
        if (!allowedTransitions[currentStatus].includes(newStatus)) {
          // Revert back to the current status in dropdown
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
              alert("Type updated successfully to " + selectedOption + "!");
              location.reload();
            } else {
              alert("Failed to update status: " + data.message);
            }
          })
          .catch((error) => console.error("Error updating status:", error));
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
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
