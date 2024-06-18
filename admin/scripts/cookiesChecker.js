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

// Example usage
document.addEventListener("DOMContentLoaded", function () {
  const userId = getCookie("id");
  const userLevel = getCookie("level");
  const username = getCookie("username");

  if (userId && userLevel && username) {
    console.log("User ID:", userId);
    console.log("User Level:", userLevel);
    console.log("Username:", username);
  } else {
    console.log("User ID, user level, or username is missing or empty");

    Swal.fire({
      title: "Error!",
      text: "Your Session has expired",
      icon: "error",
      confirmButtonText: "Ok",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "https://ashantilaundrysystem.muccs.host/index.html";
      }
    });
  }

  const logoutButton = document.getElementById("logoutButton");

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    logoutAndClearCookies();
  });
});

function logoutAndClearCookies() {
  // Clear cookies
  document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "level=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Send POST request to logout.php
  fetch("https://ashantilaundrysystem.muccs.host/admin/api/logout.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ logout: true }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "Success!",
          text: "You have logged out",
          icon: "success",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "https://ashantilaundrysystem.muccs.host/index.html";
          }
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Logout failed",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while logging out",
        icon: "error",
        confirmButtonText: "Ok",
      });
    });
}
