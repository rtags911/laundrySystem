document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.append("action", "login"); // Set action to 'login'

    fetch("https://ashantilaundrysystem.muccs.host/api/file/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const expirationTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
          document.cookie = `username=${
            data.username
          }; expires=${expirationTime.toUTCString()}; path=/`;
          document.cookie = `id=${
            data.id
          }; expires=${expirationTime.toUTCString()}; path=/`;
          document.cookie = `level=${
            data.level
          }; expires=${expirationTime.toUTCString()}; path=/`;
          var level = data.level;
          console.log("test", level);
          console.log("Type of level cookie:", typeof level);

          Swal.fire({
            title: "Success!",
            text: data.message,
            icon: "success",
          }).then((result) => {
            if (level == 0) {
              window.location.href =
                "https://ashantilaundrysystem.muccs.host/admin/index.html";
            } else if (level == 1) {
              window.location.href =
                "https://ashantilaundrysystem.muccs.host/staff/index.html";
            } else {
              window.location.reload();
              $("#authModal").modal("hide");
            }
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: data.message,
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  document
    .getElementById("registerForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      formData.append("action", "register"); // Set action to 'register'

      console.log("form", formData);

      fetch("https://ashantilaundrysystem.muccs.host/api/file/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            Swal.fire({
              title: "Success!",
              text: data.message,
              icon: "success",
              confirmButtonText: "Ok",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: data.message,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        })
        .catch((error) => console.error("Error:", error));
    });

  //   $("#authModal").modal("hide");
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
