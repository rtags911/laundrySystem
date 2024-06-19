document.addEventListener("DOMContentLoaded", () => {
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

  var user = getCookie("level");

  if (user == "0") {
    window.location.href = "https://ashantilaundrysystem.muccs.host/admin/index.html";
  }
  if (user == "1") {
    window.location.href = "https://ashantilaundrysystem.muccs.host/staff/index.html";
  }
});
