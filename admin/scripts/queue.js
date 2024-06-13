document.addEventListener("DOMContentLoaded", () => {
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

      const tableData = data.map((row) => {
        return [
          `#${row.queueNumber}`,
          `<img class="rounded-circle me-2" width="30" height="30" src="assets/img/profile.png">${row.name}`,
          row.type,
          row.kilo,
          `<select class="status-dropdown form-select" data-id="${row.id}">
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
          </select>`,
          `₱${row.total}`, // Adding PHP sign here
          row.created_at,
          `<a class="mx-1 text-decoration-none text-danger" href="#" data-bs-target="#remove"  data-id="${row.id}" data-bs-toggle="modal">
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
          { title: "Queue" },
          { title: "Customer" },
          { title: "Type" },
          { title: "Kilo kg/p" },
          { title: "Status" },
          { title: "Total" },
          { title: "Date Created" },
          { title: "Option" },
        ],
        columnDefs: [
          {
            targets: 4, // column index (Status column)
            render: function (data, type, row) {
              return data;
            },
            filter: {
              type: "select",
              options: [
                { value: "0", label: "Pending" },
                { value: "1", label: "Processing" },
                { value: "2", label: "Folding" },
                { value: "3", label: "Ready for Pickup" },
                { value: "4", label: "Claimed" },
              ],
            },
          },
        ],
        paging: true,
        searching: true,
        info: true,
      });

      // Add event listener for status dropdown change
      table.on("change", ".status-dropdown", function () {
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
