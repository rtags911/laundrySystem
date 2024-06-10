document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    try {
      const response = await fetch(
        "http://localhost/laundrySystem/admin/api/login.php",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Set user information in cookies with expiration time of 20 minutes
        const expirationTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
        document.cookie = `username=${
          data.username
        }; expires=${expirationTime.toUTCString()}; path=/`;
        document.cookie = `level=${
          data.level
        }; expires=${expirationTime.toUTCString()}; path=/`;
        document.cookie = `id=${
          data.id
        }; expires=${expirationTime.toUTCString()}; path=/`;

        Swal.fire({
          title: "Success!",
          text: data.message,
          icon: "success",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `index.html`;
          }
        });
      } else {
        const errorData = await response.json();
        const errorType = encodeURIComponent(errorData.message);

        Swal.fire({
          title: "Error!",
          text: errorType,
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  });
});
