document.addEventListener("DOMContentLoaded", () => {
  const user = getCookie("username");
  const userID = getCookie("id");

  const action = "admin";

  const formData = { id: userID, action: action };

  $.ajax({
    url: "http://ashantilaundrysystem.muccs.host/api/file/",
    type: "POST",
    data: formData,
    success: function (data) {
      const data1 = JSON.parse(data);
      const test = data1[0];
      console.log("user", test);

      const imageUrl = test.photo
        ? "http://ashantilaundrysystem.muccs.host/img/staff/" + test.photo
        : "assets/img/profile.png";

      document.getElementById("profile-img").src = imageUrl;
    },
    error: function (xhr, status, error) {
      console.error("Error updating status:", error);
    },
  });

  $("#username").val(user);
  const loginForm = document.getElementById("Update");
  loginForm.addEventListener("submit", async function (event) {
    const password = $("#Update input[name='current']").val();
    const retypePass = $("#Update input[name='password']").val();

    // Construct the query string
    var queryString = {
      data_id: userID,
      username: user,
      password: password,
      retypePass: retypePass,
    };

    $.ajax({
      method: "PUT",
      url: "http://ashantilaundrysystem.muccs.host/admin/api/staff/",
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

  const userId = getCookie("id");
  const levels = getCookie("level"); // Replace this with actual logic
  // Replace this with actual logic

  // Set user ID and type in the hidden form

  // Click event for the pencil icon
  $("#edit-icon").on("click", function () {
    $("#uploadModal").modal("show");

    $("#user-id").val(userId);
    $("#level").val(levels);
  });

  $("#uploadPic").on("submit", function (e) {
    e.preventDefault();

    var formData = new FormData(this); // Create FormData from the form element

    $.ajax({
      url: "http://ashantilaundrysystem.muccs.host/api/uploads/uploads.php", // Adjust this URL if needed
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.success) {
          alert("Profile picture updated successfully!");
          $("#uploadModal").modal("hide");
          location.reload();
        } else {
          alert("Error: " + response.error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        alert("An error occurred while uploading the image.");
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
