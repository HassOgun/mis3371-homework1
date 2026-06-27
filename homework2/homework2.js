/*

 Program name: homework2.js
 Author:       Hassan Ogunlana
 Date created: 06/26/2026
 Date last edited: 06/26/2026
 Version:      2.0
 Description:  External JavaScript for homework2.html
               (Bayou City Medical patient registration).
               Holds the modules called from the form: the
               today's-date display, the live health slider,
               the live password check, and the Review button
               that re-displays and validates all entered data.

*/


/* ----- Regular expressions (mirror the HTML pattern attributes) ----- */
var nameRegex   = /^[A-Za-z'\-]{1,30}$/;          // first name
var lastRegex   = /^[A-Za-z'2-5\-]{1,30}$/;        // last name (allows 2-5)
var miRegex     = /^[A-Za-z]$/;                     // middle initial
var dobRegex    = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
var ssnRegex    = /^([0-9]{9}|[0-9]{3}-[0-9]{2}-[0-9]{4})$/;
var cityRegex   = /^[A-Za-z ]{2,30}$/;
var zipRegex    = /^[0-9]{5}(-[0-9]{4})?$/;
var emailRegex  = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
var phoneRegex  = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
var userIdRegex = /^[A-Za-z_][A-Za-z0-9_\-]{4,29}$/;


/* =====================================================================
   Show today's date in the banner (runs when the page loads).
   ===================================================================== */
function showDate() {
  var today = new Date();
  var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday",
                  "Thursday", "Friday", "Saturday"];
  var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

  var d = today.getDate();
  var suffix = "th";
  if (d < 11 || d > 13) {
    if (d % 10 === 1) { suffix = "st"; }
    else if (d % 10 === 2) { suffix = "nd"; }
    else if (d % 10 === 3) { suffix = "rd"; }
  }

  var dateText = dayNames[today.getDay()] + ", " +
                 monthNames[today.getMonth()] + " " +
                 d + suffix + ", " + today.getFullYear();

  document.getElementById("todayDate").textContent = dateText;
}


/* =====================================================================
   Health slider: show the chosen value next to the bar.
   Called by oninput on the slider (dynamic event requirement).
   ===================================================================== */
function updateHealthValue() {
  var slider = document.getElementById("health");
  document.getElementById("healthValue").textContent = slider.value;
}


/* =====================================================================
   Live password check: runs on keyup in either password box.
   Tells the user if the two passwords match yet.
   ===================================================================== */
function checkPasswordLive() {
  var pw = document.getElementById("password").value;
  var confirm = document.getElementById("confirmPassword").value;
  var message = document.getElementById("pwMessage");

  if (confirm === "") {
    message.textContent = "";
    return;
  }

  if (pw === confirm) {
    message.textContent = "Passwords match.";
    message.className = "pw-message pw-ok";
  } else {
    message.textContent = "Passwords do not match.";
    message.className = "pw-message pw-bad";
  }
}


/* =====================================================================
   Small helpers for the Review output.
   ===================================================================== */

// Return "pass" or an error message for a single text field.
function checkField(value, regex, required, blankOkMessage) {
  if (value === "") {
    if (required) {
      return "ERROR: This field is required";
    }
    return blankOkMessage;   // "pass" or a friendly note for optional fields
  }
  if (regex !== null && !regex.test(value)) {
    return "ERROR: Wrong format";
  }
  return "pass";
}

// Get the selected value of a radio group, or "" if none chosen.
function getRadioValue(groupName) {
  var radios = document.getElementsByName(groupName);
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return "";
}

// Build one row of the review table.
function row(label, value, status) {
  var statusClass = "pass";
  if (status.indexOf("ERROR") === 0) {
    statusClass = "fail";
  }
  return "<tr><td class='r-label'>" + label + "</td>" +
         "<td class='r-value'>" + value + "</td>" +
         "<td class='r-status " + statusClass + "'>" + status + "</td></tr>";
}


/* =====================================================================
   Validate the date of birth: real date, not in the future,
   not more than 120 years ago.
   ===================================================================== */
function checkDob(value) {
  if (value === "") { return "ERROR: This field is required"; }
  if (!dobRegex.test(value)) { return "ERROR: Use MM/DD/YYYY"; }

  var parts = value.split("/");
  var month = parseInt(parts[0], 10);
  var day   = parseInt(parts[1], 10);
  var year  = parseInt(parts[2], 10);

  var entered = new Date(year, month - 1, day);

  // make sure the date really exists (eg. not 02/31/2000)
  if (entered.getMonth() !== month - 1 || entered.getDate() !== day) {
    return "ERROR: Not a real date";
  }

  var today = new Date();
  var oldest = new Date();
  oldest.setFullYear(today.getFullYear() - 120);

  if (entered > today) {
    return "ERROR: Cannot be in the future";
  }
  if (entered < oldest) {
    return "ERROR: Cannot be more than 120 years ago";
  }
  return "pass";
}


/* =====================================================================
   Validate the password against all of the rules and the User ID.
   ===================================================================== */
function checkPassword(pw, confirm, userId, firstName, lastName) {
  if (pw === "") { return "ERROR: This field is required"; }
  if (pw.length < 8 || pw.length > 30) { return "ERROR: Must be 8 to 30 characters"; }
  if (pw.indexOf('"') !== -1) { return "ERROR: Double quotes are not allowed"; }
  if (!/[A-Z]/.test(pw)) { return "ERROR: Needs an uppercase letter"; }
  if (!/[a-z]/.test(pw)) { return "ERROR: Needs a lowercase letter"; }
  if (!/[0-9]/.test(pw)) { return "ERROR: Needs a number"; }
  if (!/[!@#%^&*()_+=.,\-]/.test(pw)) { return "ERROR: Needs a special character"; }

  // password cannot equal or contain the user id or the name
  var lowPw = pw.toLowerCase();
  if (userId !== "" && lowPw.indexOf(userId.toLowerCase()) !== -1) {
    return "ERROR: Cannot contain your User ID";
  }
  if (firstName !== "" && lowPw.indexOf(firstName.toLowerCase()) !== -1) {
    return "ERROR: Cannot contain your name";
  }
  if (lastName !== "" && lowPw.indexOf(lastName.toLowerCase()) !== -1) {
    return "ERROR: Cannot contain your name";
  }

  if (pw !== confirm) {
    return "ERROR: Passwords do not match";
  }
  return "pass";
}


/* =====================================================================
   MAIN review module. Called by the Review button.
   Gathers every value, checks it, and shows the results in a
   new area below the form (the existing form is not changed).
   ===================================================================== */
function reviewForm() {
  var form = document.forms["registerForm"];

  /* ----- read the simple text fields ----- */
  var firstName = form["firstName"].value.trim();
  var mi        = form["middleInitial"].value.trim();
  var lastName  = form["lastName"].value.trim();
  var dob       = form["dob"].value.trim();
  var ssn       = form["ssn"].value.trim();
  var address1  = form["address1"].value.trim();
  var address2  = form["address2"].value.trim();
  var city      = form["city"].value.trim();
  var state     = form["state"].value;
  var zip       = form["zip"].value.trim();
  var email     = form["email"].value.trim();
  var phone     = form["phone"].value.trim();
  var symptoms  = form["symptoms"].value;

  /* ----- user id: convert to lowercase and re-display it ----- */
  var userId = form["userId"].value.trim().toLowerCase();
  form["userId"].value = userId;

  var password = form["password"].value;
  var confirm  = form["confirmPassword"].value;

  /* ----- zip: keep only the first 5 digits for display ----- */
  var zipShort = zip;
  if (zip.length > 5) {
    zipShort = zip.substring(0, 5);
  }

  /* ----- build the middle initial (with last name) status ----- */
  var miStatus = "pass";
  if (mi !== "" && !miRegex.test(mi)) {
    miStatus = "ERROR: One letter only";
  }

  /* ----- symptoms: just watch for double quotes ----- */
  var symptomsShown = symptoms === "" ? "(none entered)" : symptoms;
  var symptomsStatus = symptoms.indexOf('"') !== -1 ? "ERROR: No double quotes" : "pass";

  /* ----- start building the output table ----- */
  var html = "<table class='review-table'>";
  html += "<tr><th colspan='3'>Patient Information</th></tr>";

  html += row("First, MI, Last Name",
              firstName + " " + mi + " " + lastName,
              checkField(firstName, nameRegex, true, "pass") === "pass" &&
              checkField(lastName, lastRegex, true, "pass") === "pass" &&
              miStatus === "pass"
                ? "pass"
                : (checkField(firstName, nameRegex, true, "pass") !== "pass"
                    ? "ERROR: Check first name"
                    : (miStatus !== "pass" ? miStatus : "ERROR: Check last name")));

  html += row("Date of Birth", dob === "" ? "(blank)" : dob, checkDob(dob));
  html += row("ID / SSN",
              ssn === "" ? "(blank)" : "*** hidden ***",
              ssn === "" ? "pass" : (ssnRegex.test(ssn) ? "pass" : "ERROR: Wrong format"));

  html += "<tr><th colspan='3'>Contact &amp; Address</th></tr>";
  html += row("Email", email === "" ? "(blank)" : email, checkField(email, emailRegex, true, "pass"));
  html += row("Phone", phone === "" ? "(blank)" : phone,
              phone === "" ? "pass (optional)" : (phoneRegex.test(phone) ? "pass" : "ERROR: Use 000-000-0000"));
  html += row("Address Line 1", address1 === "" ? "(blank)" : address1,
              checkField(address1, null, true, "pass"));
  html += row("Address Line 2", address2 === "" ? "(none)" : address2,
              address2 === "" ? "pass (optional)" : (address2.length >= 2 ? "pass" : "ERROR: 2 to 30 characters"));
  html += row("City", city === "" ? "(blank)" : city, checkField(city, cityRegex, true, "pass"));
  html += row("State", state === "" ? "(not chosen)" : state, state === "" ? "ERROR: Please choose a state" : "pass");
  html += row("Zip Code", zipShort === "" ? "(blank)" : zipShort, checkField(zip, zipRegex, true, "pass"));

  html += "<tr><th colspan='3'>Requested Info</th></tr>";

  // checkboxes -> show each illness as Y or N
  var illnessBoxes = document.getElementsByName("priorIllness");
  for (var i = 0; i < illnessBoxes.length; i++) {
    var mark = illnessBoxes[i].checked ? "Y" : "N";
    html += row(illnessBoxes[i].value, mark, "pass");
  }

  html += row("Gender", getRadioValue("gender") === "" ? "(not chosen)" : getRadioValue("gender"), "pass");
  html += row("Vaccinated?", getRadioValue("vaccinated") === "" ? "(not chosen)" : getRadioValue("vaccinated"), "pass");
  html += row("Has Insurance?", getRadioValue("insurance") === "" ? "(not chosen)" : getRadioValue("insurance"), "pass");
  html += row("Health Rating", form["health"].value + " out of 10", "pass");
  html += row("Described Symptoms", symptomsShown, symptomsStatus);

  html += "<tr><th colspan='3'>Account Set-Up</th></tr>";
  html += row("User ID", userId === "" ? "(blank)" : userId,
              checkField(userId, userIdRegex, true, "pass"));
  html += row("Password", password === "" ? "(blank)" : password + " <em>(normally we would not display this)</em>",
              checkPassword(password, confirm, userId, firstName, lastName));

  html += "</table>";

  /* ----- show the review area ----- */
  document.getElementById("reviewOutput").innerHTML = html;
  document.getElementById("reviewArea").style.display = "block";
  document.getElementById("reviewArea").scrollIntoView();
}


/* ----- run the start-up modules when the page finishes loading ----- */
window.onload = function () {
  showDate();
  updateHealthValue();
};
