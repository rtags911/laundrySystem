$(document).ready(function () {
  fetch(`https://ashantilaundrysystem.muccs.host/admin/api/laundry_queue.php`)
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

      const table = $("#dataTable").DataTable({
        data: data,
        columns: [
          { title: "Queue", data: "queueNumber" },
          {
            title: "Customer",
            data: "name",
            render: function (data, type, row) {
              return `<img class="rounded-circle me-2" width="30" height="30" src="assets/img/profile.png">${data}`;
            },
          },
          { title: "Type", data: "type" },
          { title: "Kilo kg/p", data: "kilo" },
          {
            title: "Status",
            data: "status",
            render: function (data, type, row) {
              return `<select class="form-select status-dropdown" data-id="${
                row.id
              }">
                            <option value="0" ${
                              data === 0 ? "selected" : ""
                            }>Pending</option>
                            <option value="1" ${
                              data === 1 ? "selected" : ""
                            }>Processing</option>
                            <option value="2" ${
                              data === 2 ? "selected" : ""
                            }>Folding</option>
                            <option value="3" ${
                              data === 3 ? "selected" : ""
                            }>Ready for Pickup</option>
                            <option value="4" ${
                              data === 4 ? "selected" : ""
                            }>Claimed</option>
                        </select>`;
            },
          },
          {
            title: "Total",
            data: "total",
            render: function (data, type, row) {
              return `₱${data}`;
            },
          },
          { title: "Date Created", data: "created_at" },
          {
            title: "Option",
            data: "id",
            render: function (data, type, row) {
              return `<a class="mx-1 text-decoration-none text-danger" href="#" data-bs-target="#remove" data-id="${data}" data-bs-toggle="modal">
                            <i class="far fa-trash-alt text-danger" style="font-size: 20px;"></i> Remove
                        </a>`;
            },
          },
        ],
        paging: true,
        searching: true,
        info: true,
        initComplete: function () {
          // Add dropdown to the "Status" column header for filtering
          var column = this.api().column(4);
          var select = $(
            '<select class="form-select"><option value="">Filter Status</option></select>'
          )
            .appendTo($(column.header()).empty())
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());

              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          // Populate dropdown with unique status values
          column
            .data()
            .unique()
            .sort()
            .each(function (d, j) {
              select.append(
                '<option value="' + d + '">' + getStatusText(d) + "</option>"
              );
            });
        },
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Event listener for status dropdown change
  $("#dataTable").on("change", ".status-dropdown", function () {
    const id = $(this).data("id");
    const newStatus = $(this).val();
    const selectedOption = $(this).find("option:selected").text();

    fetch(`https://ashantilaundrysystem.muccs.host/admin/api/queue/`, {
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
          location.reload(); // Refresh the page after successful status update
        } else {
          alert("Failed to update status: " + data.message);
        }
      })
      .catch((error) => console.error("Error updating status:", error));
  });

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
});
