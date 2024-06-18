document.addEventListener("DOMContentLoaded", () => {
  const kiloInput = document.getElementById("kilo");
  const costDisplay = document.getElementById("costDisplay");
  const useLoggedInDetailsCheckbox =
    document.getElementById("useLoggedInDetails");
  const useLoggedInDetailsLabel = document.getElementById(
    "useLoggedInDetailsLabel"
  );

  const userID = getCookie("id");

  if (!userID) {
    // User is not logged in, hide the checkbox and label
    useLoggedInDetailsCheckbox.style.display = "none";
    useLoggedInDetailsLabel.style.display = "none";
  }

  // Fetch user details if ID is available
  if (userID) {
    fetch(`http://ashantilaundrysystem.muccs.host/api/file/?userID=${userID}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const userDetails = data;

          useLoggedInDetailsCheckbox.addEventListener("change", function () {
            if (this.checked) {
              const fullName = userDetails.fullname; // Get the full name
              const [firstName, lastName] = fullName.split(" ");
              document.getElementById("bookFirstname").value = firstName;
              document.getElementById("bookLastname").value = lastName;
              document.getElementById("bookContact").value =
                userDetails.contact;
              document.getElementById("bookAddress").value =
                userDetails.address;

              document.getElementById("bookFirstname").readOnly = true;
              document.getElementById("bookLastname").readOnly = true;
              document.getElementById("bookContact").readOnly = true;
              document.getElementById("bookAddress").readOnly = true;
            } else {
              document.getElementById("bookFirstname").value = "";
              document.getElementById("bookLastname").value = "";
              document.getElementById("bookContact").value = "";
              document.getElementById("bookAddress").value = "";

              document.getElementById("bookFirstname").readOnly = false;
              document.getElementById("bookLastname").readOnly = false;
              document.getElementById("bookContact").readOnly = false;
              document.getElementById("bookAddress").readOnly = false;
            }
          });
        } else {
          console.error("User not found");
        }
      })
      .catch((error) => console.error("Error fetching user details:", error));
  } else {
    console.error("User ID cookie not found");
  }

  kiloInput.addEventListener("input", () => {
    const kilo = parseFloat(kiloInput.value);
    let cost = 0;

    if (kilo <= 5) {
      cost = 150;
    } else {
      cost = 150 + (kilo - 5) * 25;
    }

    costDisplay.innerText = `Cost: ${cost} PHP`;
  });

  document
    .getElementById("bookingForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const userID = getCookie("id"); // Assuming you have a function to retrieve the user ID from cookies
      formData.append("userID", userID);
      // Serialize form data to JSON object
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      const serializedFormData = JSON.stringify(formObject);
      console.log(serializedFormData);

      fetch("http://ashantilaundrysystem.muccs.host/api/file/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Booking created successfully!");
            location.reload();
            // Optionally, update the UI or navigate to a different page
          } else {
            alert("Failed to create booking: " + data.message);
          }
        })
        .catch((error) => console.error("Error:", error));
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
