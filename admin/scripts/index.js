document.addEventListener("DOMContentLoaded", () => {
  fetch(`https://ashantilaundrysystem.muccs.host/admin/api/laundry_queue.php`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((row, index) => {
        row.queueNumber = index + 1;
      });

      const tableData = data.map((row) => {
        return [
          `#${row.queueNumber}`,
          `<img class="rounded-circle me-2" width="30" height="30" src="assets/img/profile.png">${row.name}`,
          row.kilo,
          row.status_text,
          row.created_at,
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
          { title: "Costumer" },
          { title: "Kilo kg/p" },
          { title: "Status" },
          { title: "Date Created" },
        ],
        paging: true,
        searching: true,
        info: true,
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  fetch(`https://ashantilaundrysystem.muccs.host/admin/api/dashboard.php`)
    .then((response) => response.json())
    .then((data) => {
      if (data.statistics) {
        const { total_customers, status_counts } = data.statistics;

        // Update Total customer count
        document.getElementById("totalCustomer").innerText = total_customers;

        // Update Pending Laundry count
        document.getElementById("totalPending").innerText =
          status_counts.pending;
        document.getElementById("totalProcess").innerText =
          status_counts.processing;
        document.getElementById("totalFolding").innerText =
          status_counts.folding;
        document.getElementById("totalPickup").innerText =
          status_counts.ready_for_pickup;
        document.getElementById("totalClaimed").innerText =
          status_counts.claimed;

        // Update other status counts similarly
      } else {
        console.error("Statistics data not found");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
