document.addEventListener("DOMContentLoaded", () => {
  const user = getCookie("username");
  const userID = getCookie("id");

  $("#username").val(user);
  const loginForm = document.getElementById("update");
  loginForm.addEventListener("submit", async function (event) {
    const password = $("#update input[name='current']").val();
    const retypePass = $("#update input[name='password']").val();

    // Construct the query string
    var queryString = {
      data_id: userID,
      username: user,
      password: password,
      retypePass: retypePass,
    };

    $.ajax({
      method: "PUT",
      url: "https://ashantilaundrysystem.muccs.host/admin/api/staff/",
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
