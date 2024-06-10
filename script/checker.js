document.addEventListener("DOMContentLoaded", () => {
  // Function to get a cookie value by name

  // Check if the user is logged in
  const username = getCookie("username");
  const userID = getCookie("id");

  if (!username && !userID) {
    // Check if the current URL is profile.html
    if (window.location.pathname.includes("profile.html")) {
      Swal.fire({
        title: "Error!",
        text: "Session is expired",
        icon: "error",
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "index.html";
        }
      });
    }
  }

  // Handle logout
  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    // Clear cookies
    document.cookie =
      "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "level=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Reload the page
    if (window.location.pathname.includes("profile.html")) {
      Swal.fire({
        title: "Error!",
        text: "You Have logged Out.",
        icon: "error",
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "index.html";
        }
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: "You Have logged Out.",
        icon: "error",
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload();
        }
      });
    }
  });
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
