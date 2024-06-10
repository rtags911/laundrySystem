document.addEventListener("DOMContentLoaded", function () {
  var id = getCookie("id");

  fetch(`https://ashantilaundrysystem.muccs.host/admin/api/logs.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const tableData = data.map((row) => {
        return [
          row.id,
          `<img class="rounded-circle me-2" width="30" height="30" src="assets/img/profile.png">${row.username}`,
          row.type,
          row.logs,
          row.created_at,
        ];
      });

      if ($.fn.dataTable.isDataTable("#logsTable")) {
        $("#logsTable").DataTable().clear().destroy();
      }
      $("#logsTable").DataTable({
        data: tableData,
        columns: [
          { title: "ID" },
          { title: "User" },
          { title: "Type" },
          { title: "Logs" },
          { title: "Date" },
        ],
        paging: true,
        searching: true,
        info: true,
      });
    })
    .catch((error) => console.error("Error fetching logs:", error));
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
