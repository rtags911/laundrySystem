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

  if (username && userID) {
    // Hide the "Sign In" link
    document.getElementById("signInLink").classList.add("d-none");

    // Show the avatar dropdown
    const avatarDropdown = document.getElementById("avatarDropdown");
    avatarDropdown.classList.remove("d-none");

    // Set the avatar image if available (otherwise use default)
    const avatarImg = avatarDropdown.querySelector("img");
    const avatarUrl = getCookie("avatarUrl") || "/img/placeholder1.jpg";
    avatarImg.src = avatarUrl;



      const userID = getCookie("id"); // Retrieve user ID from cookies

      if (userID) {
        const formData = { id: userID, action: "profile" }; // Prepare form data for POST request

        // Make a POST request to fetch user details
        $.ajax({
          url: "https://ashantilaundrysystem.muccs.host/api/file/",
          type: "POST",
          data: formData,
          success: function (data) {
            try {
              const userData = JSON.parse(data)[0]; // Assuming response is an array with user data

            
              // Update avatar dropdown image (if needed)
              const avatarDropdownImg = document.querySelector(
                "#avatarDropdown img"
              );
              if (avatarDropdownImg) {
                const avatarUrl = userData.photo
                  ? "https://ashantilaundrysystem.muccs.host/img/customer/" +
                    userData.photo
                  : "/img/placeholder1.jpg"; // Default placeholder image
                avatarDropdownImg.src = avatarUrl;
                avatarDropdownImg.alt = userData.fullname; // Set alt attribute dynamically
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          },
          error: function (xhr, status, error) {
            console.error("Error fetching user data:", error);
          },
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
        title: "Success!",
        text: "You Have logged Out.",
        icon: "success",
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "index.html";
        }
      });
    } else {
      Swal.fire({
        title: "success!",
        text: "You Have logged Out.",
        icon: "success",
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
