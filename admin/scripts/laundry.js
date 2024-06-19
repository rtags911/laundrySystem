document.addEventListener("DOMContentLoaded", () => {
  fetch(`http://ashantilaundrysystem.muccs.host/admin/api/type.php`)
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
          row.id,
          row.type_name,
          `<select class="status-dropdown form-select" data-id="${row.id}" 
          }>
                        <option value="0" ${
                          row.status_type === 0 ? "selected" : ""
                        }>Not Available</option>
                        <option value="1" ${
                          row.status_type === 1 ? "selected" : ""
                        }>Available</option>
                    </select>`,
          `<a class="mx-1 text-decoration-none text-danger " href="#" 
                        data-id="${row.id}" 
                        data-bs-toggle="modal" 
                        data-bs-target="#remove">
                        <i class="far fa-trash-alt" style="font-size: 20px;"></i> Remove
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
          { title: "id" },
          { title: "Name" },
          { title: "Status" },
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

      // Add event listener for status dropdown change
      table.on("change", ".status-dropdown", function () {
        const id = $(this).data("id");
        const newStatus = $(this).val(); // Convert to integer
        const selectedOption = $(this).find("option:selected").text();
        console.log("option" + selectedOption + " " + "Selected "+ newStatus );

        fetch(`http://ashantilaundrysystem.muccs.host/admin/api/queue/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            stat: newStatus,
            action: "typeStatus",
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              console.log(data);
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

  document
    .getElementById("addType")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent form submission

      const formData = new FormData(this);
      formData.append("action", "add");
      fetch(`http://ashantilaundrysystem.muccs.host/admin/api/queue/`, {
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
});

function removeLog(logId) {
  fetch(`http://ashantilaundrysystem.muccs.host/admin/api/queue/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data_id: logId, action: "laundry" }),
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
