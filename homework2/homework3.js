/*

 Program name: homework3.js
 Author:       Hassan Ogunlana
 Date created: 07/06/2026
 Date last edited: 07/06/2026
 Version:      3.0
 Description:  External JavaScript for homework3.html
               (Bayou City Medical patient registration).
               Homework 3 checks every field "on the fly" with
               JavaScript. Each field has its own check that runs as
               the user types (oninput) or leaves the field (onblur).
               A small message shows under the field when the entry is
               wrong and goes away when it is fixed. The real Submit
               button stays hidden until the Validate button finds no
               errors.

*/


/* ----- Regular expressions (mirror the HTML pattern attributes) ----- */
var nameRegex   = /^[A-Za-z'\-]{1,30}$/;           // first name
var lastRegex   = /^[A-Za-z'2-5\-]{1,30}$/;         // last name (allows 2-5)
var miRegex     = /^[A-Za-z]$/;                      // middle initial
var dobRegex    = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
var ssnRegex    = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;   // after auto-format
var cityRegex   = /^[A-Za-z ]{2,30}$/;
var zipRegex    = /^[0-9]{5}$/;                      // 5 digits only (HW3)
var emailRegex  = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;  // test lowercase
var phoneRegex  = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
var userIdRegex = /^[A-Za-z_][A-Za-z0-9_\-]{4,19}$/; // 5 to 20 characters (HW3)



function showError(spanId, message) {
  document.getElementById(spanId).textContent = message;
}

function clearError(spanId) {
  document.getElementById(spanId).textContent = "";
}


function forceLower(field) {
  field.value = field.value.toLowerCase();
}



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



function updateHealthValue() {
  var slider = document.getElementById("health");
  document.getElementById("healthValue").textContent = slider.value;
}



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



function checkPassword(pw, confirm, userId, firstName, lastName) {
  if (pw === "") { return "ERROR: This field is required"; }
  if (pw.length < 8 || pw.length > 30) { return "ERROR: Must be 8 to 30 characters"; }
  if (pw.indexOf('"') !== -1) { return "ERROR: Double quotes are not allowed"; }
   if (!/[A-Z]/.test(pw)) { return "ERROR: Needs an uppercase letter"; }
  if (!/[a-z]/.test(pw)) { return "ERROR: Needs a lowercase letter"; }
    if (!/[0-9]/.test(pw)) { return "ERROR: Needs a number"; }
  if (!/[!@#%^&*()_+=.,\-]/.test(pw)) { return "ERROR: Needs a special character"; }

 
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



function formatSSN(field) {
  var digits = field.value.replace(/\D/g, "");   
  if (digits.length > 9) {
    digits = digits.substring(0, 9);
  }

  var out = digits;
  if (digits.length > 5) {
    out = digits.substring(0, 3) + "-" + digits.substring(3, 5) + "-" + digits.substring(5);
  } else if (digits.length > 3) {
    out = digits.substring(0, 3) + "-" + digits.substring(3);
  }

  field.value = out;
  validateSSN();
}



function validateFirstName() {
  var v = document.getElementById("firstName").value.trim();
  if (v === "") { showError("firstNameErr", "First name is required."); return false; }
  if (!nameRegex.test(v)) { showError("firstNameErr", "Letters, apostrophes and dashes only (1-30)."); return false; }
  clearError("firstNameErr");
  return true;
}

function validateMI() {
  var v = document.getElementById("middleInitial").value.trim();
  if (v === "") { clearError("miErr"); return true; }   
  if (!miRegex.test(v)) { showError("miErr", "One letter only."); return false; }
  clearError("miErr");
  return true;
}

function validateLastName() {
  var v = document.getElementById("lastName").value.trim();
  if (v === "") { showError("lastNameErr", "Last name is required."); return false; }
  if (!lastRegex.test(v)) { showError("lastNameErr", "Letters, apostrophes and dashes only (1-30)."); return false; }
  clearError("lastNameErr");
  return true;
}

function validateDob() {
  var v = document.getElementById("dob").value.trim();
  var result = checkDob(v);
  if (result !== "pass") {
    showError("dobErr", result.replace("ERROR: ", ""));
    return false;
  }
  clearError("dobErr");
  return true;
}

function validateSSN() {
  var v = document.getElementById("ssn").value.trim();
  if (v === "") { clearError("ssnErr"); return true; }  
  if (!ssnRegex.test(v)) { showError("ssnErr", "Enter 9 digits (000-00-0000)."); return false; }
  clearError("ssnErr");
  return true;
}

function validateAddress1() {
  var v = document.getElementById("address1").value.trim();
  if (v === "") { showError("address1Err", "Address is required."); return false; }
  if (v.length < 2 || v.length > 30) { showError("address1Err", "2 to 30 characters."); return false; }
  clearError("address1Err");
  return true;
}

function validateAddress2() {
  var v = document.getElementById("address2").value.trim();
  if (v === "") { clearError("address2Err"); return true; }  
  if (v.length < 2 || v.length > 30) { showError("address2Err", "2 to 30 characters."); return false; }
  clearError("address2Err");
  return true;
}

function validateCity() {
  var v = document.getElementById("city").value.trim();
  if (v === "") { showError("cityErr", "City is required."); return false; }
  if (!cityRegex.test(v)) { showError("cityErr", "Letters only, 2 to 30 characters."); return false; }
  clearError("cityErr");
  return true;
}

function validateState() {
  var v = document.getElementById("state").value;
  if (v === "") { showError("stateErr", "Please choose a state."); return false; }
  clearError("stateErr");
  return true;
}

function validateZip() {
  var v = document.getElementById("zip").value.trim();
  if (v === "") { showError("zipErr", "Zip code is required."); return false; }
  if (!zipRegex.test(v)) { showError("zipErr", "Enter exactly 5 digits."); return false; }
  clearError("zipErr");
  return true;
}

function validateEmail() {
  var v = document.getElementById("email").value.trim().toLowerCase();
  if (v === "") { showError("emailErr", "Email is required."); return false; }
  if (!emailRegex.test(v)) { showError("emailErr", "Use the format name@domain.tld"); return false; }
  clearError("emailErr");
  return true;
}

function validatePhone() {
  var v = document.getElementById("phone").value.trim();
  if (v === "") { clearError("phoneErr"); return true; }   // optional
  if (!phoneRegex.test(v)) { showError("phoneErr", "Use 000-000-0000."); return false; }
  clearError("phoneErr");
  return true;
}

function validateSymptoms() {
  var v = document.getElementById("symptoms").value;
  if (v.indexOf('"') !== -1) { showError("symptomsErr", "Please do not use double quotes."); return false; }
  clearError("symptomsErr");
  return true;
}

function validateUserId() {
  var v = document.getElementById("userId").value.trim().toLowerCase();
  if (v === "") { showError("userIdErr", "User ID is required."); return false; }
  if (/^[0-9]/.test(v)) { showError("userIdErr", "Cannot start with a number."); return false; }
  if (v.length < 5 || v.length > 20) { showError("userIdErr", "Must be 5 to 20 characters."); return false; }
  if (!userIdRegex.test(v)) { showError("userIdErr", "Letters, numbers, dash or underscore only."); return false; }
  clearError("userIdErr");
  return true;
}

function validatePasswords() {
  var pw     = document.getElementById("password").value;
  var confirm = document.getElementById("confirmPassword").value;
  var userId = document.getElementById("userId").value.trim();
  var first  = document.getElementById("firstName").value.trim();
  var last   = document.getElementById("lastName").value.trim();

  var result = checkPassword(pw, confirm, userId, first, last);
  if (result !== "pass") {
    showError("passwordErr", result.replace("ERROR: ", ""));
    return false;
  }
  clearError("passwordErr");
  return true;
}



function validateForm() {
  
  forceLower(document.getElementById("email"));
  forceLower(document.getElementById("userId"));

  var ok = true;
  if (!validateFirstName()) { ok = false; }
  if (!validateMI())        { ok = false; }
  if (!validateLastName())  { ok = false; }
  if (!validateDob())       { ok = false; }
  if (!validateSSN())       { ok = false; }
  if (!validateAddress1())  { ok = false; }
  if (!validateAddress2())  { ok = false; }
  if (!validateCity())      { ok = false; }
  if (!validateState())     { ok = false; }
  if (!validateZip())       { ok = false; }
  if (!validateEmail())     { ok = false; }
  if (!validatePhone())     { ok = false; }
  if (!validateSymptoms())  { ok = false; }
  if (!validateUserId())    { ok = false; }
  if (!validatePasswords()) { ok = false; }

  var msg = document.getElementById("validateMsg");
  var submitBtn = document.getElementById("submitBtn");

  if (ok) {
    msg.textContent = "All fields look good. You may now press Submit.";
    msg.className = "validate-msg ok";
    submitBtn.style.display = "inline-block";
  } else {
    msg.textContent = "Please fix the fields marked in red, then press Validate again.";
    msg.className = "validate-msg bad";
    submitBtn.style.display = "none";
  }
  return ok;
}





function checkField(value, regex, required, blankOkMessage) {
  if (value === "") {
    if (required) {
      return "ERROR: This field is required";
    }
    return blankOkMessage;
  }
  if (regex !== null && !regex.test(value)) {
    return "ERROR: Wrong format";
  }
  return "pass";
}


function getRadioValue(groupName) {
  var radios = document.getElementsByName(groupName);
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return "";
}


function row(label, value, status) {
  var statusClass = "pass";
  if (status.indexOf("ERROR") === 0) {
    statusClass = "fail";
  }
  return "<tr><td class='r-label'>" + label + "</td>" +
         "<td class='r-value'>" + value + "</td>" +
         "<td class='r-status " + statusClass + "'>" + status + "</td></tr>";
}



function reviewForm() {
  var form = document.forms["registerForm"];

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
  var email     = form["email"].value.trim().toLowerCase();
  var phone     = form["phone"].value.trim();
  var symptoms  = form["symptoms"].value;

  
  var userId = form["userId"].value.trim().toLowerCase();
  form["userId"].value = userId;

  var password = form["password"].value;
  var confirm  = form["confirmPassword"].value;

 
  var miStatus = "pass";
  if (mi !== "" && !miRegex.test(mi)) {
    miStatus = "ERROR: One letter only";
  }

 
  var symptomsShown = symptoms === "" ? "(none entered)" : symptoms;
  var symptomsStatus = symptoms.indexOf('"') !== -1 ? "ERROR: No double quotes" : "pass";

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
  html += row("Zip Code", zip === "" ? "(blank)" : zip, checkField(zip, zipRegex, true, "pass"));

  html += "<tr><th colspan='3'>Requested Info</th></tr>";

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

  document.getElementById("reviewOutput").innerHTML = html;
  document.getElementById("reviewArea").style.display = "block";
  document.getElementById("reviewArea").scrollIntoView();
}



window.onload = function () {
  showDate();
  updateHealthValue();
};                 monthNames[today.getMonth()] + " " +
                 d + suffix + ", " + today.getFullYear();

  document.getElementById("todayDate").textContent = dateText;
}



function updateHealthValue() {
  var slider = document.getElementById("health");
  document.getElementById("healthValue").textContent = slider.value;
}



function checkDob(value) {
  if (value === "") { return "ERROR: This field is required"; }
  if (!dobRegex.test(value)) { return "ERROR: Use MM/DD/YYYY"; }

  var parts = value.split("/");
  var month = parseInt(parts[0], 10);
  var day   = parseInt(parts[1], 10);
  var year  = parseInt(parts[2], 10);

  var entered = new Date(year, month - 1, day);

 
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



function checkPassword(pw, confirm, userId, firstName, lastName) {
  if (pw === "") { return "ERROR: This field is required"; }
  if (pw.length < 8 || pw.length > 30) { return "ERROR: Must be 8 to 30 characters"; }
  if (pw.indexOf('"') !== -1) { return "ERROR: Double quotes are not allowed"; }
  if (!/[A-Z]/.test(pw)) { return "ERROR: Needs an uppercase letter"; }
  if (!/[a-z]/.test(pw)) { return "ERROR: Needs a lowercase letter"; }
  if (!/[0-9]/.test(pw)) { return "ERROR: Needs a number"; }
  if (!/[!@#%^&*()_+=.,\-]/.test(pw)) { return "ERROR: Needs a special character"; }

 
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



function formatSSN(field) {
  var digits = field.value.replace(/\D/g, "");   
  if (digits.length > 9) {
    digits = digits.substring(0, 9);
  }

  var out = digits;
  if (digits.length > 5) {
    out = digits.substring(0, 3) + "-" + digits.substring(3, 5) + "-" + digits.substring(5);
  } else if (digits.length > 3) {
    out = digits.substring(0, 3) + "-" + digits.substring(3);
  }

  field.value = out;
  validateSSN();
}



function validateFirstName() {
  var v = document.getElementById("firstName").value.trim();
  if (v === "") { showError("firstNameErr", "First name is required."); return false; }
  if (!nameRegex.test(v)) { showError("firstNameErr", "Letters, apostrophes and dashes only (1-30)."); return false; }
  clearError("firstNameErr");
  return true;
}

function validateMI() {
  var v = document.getElementById("middleInitial").value.trim();
  if (v === "") { clearError("miErr"); return true; }   
  if (!miRegex.test(v)) { showError("miErr", "One letter only."); return false; }
  clearError("miErr");
  return true;
}

function validateLastName() {
  var v = document.getElementById("lastName").value.trim();
  if (v === "") { showError("lastNameErr", "Last name is required."); return false; }
  if (!lastRegex.test(v)) { showError("lastNameErr", "Letters, apostrophes and dashes only (1-30)."); return false; }
  clearError("lastNameErr");
  return true;
}

function validateDob() {
  var v = document.getElementById("dob").value.trim();
  var result = checkDob(v);
  if (result !== "pass") {
    showError("dobErr", result.replace("ERROR: ", ""));
    return false;
  }
  clearError("dobErr");
  return true;
}

function validateSSN() {
  var v = document.getElementById("ssn").value.trim();
  if (v === "") { clearError("ssnErr"); return true; }   
  if (!ssnRegex.test(v)) { showError("ssnErr", "Enter 9 digits (000-00-0000)."); return false; }
  clearError("ssnErr");
  return true;
}

function validateAddress1() {
  var v = document.getElementById("address1").value.trim();
  if (v === "") { showError("address1Err", "Address is required."); return false; }
  if (v.length < 2 || v.length > 30) { showError("address1Err", "2 to 30 characters."); return false; }
  clearError("address1Err");
  return true;
}

function validateAddress2() {
  var v = document.getElementById("address2").value.trim();
  if (v === "") { clearError("address2Err"); return true; }   
  if (v.length < 2 || v.length > 30) { showError("address2Err", "2 to 30 characters."); return false; }
  clearError("address2Err");
  return true;
}

function validateCity() {
  var v = document.getElementById("city").value.trim();
  if (v === "") { showError("cityErr", "City is required."); return false; }
  if (!cityRegex.test(v)) { showError("cityErr", "Letters only, 2 to 30 characters."); return false; }
  clearError("cityErr");
  return true;
}

function validateState() {
  var v = document.getElementById("state").value;
  if (v === "") { showError("stateErr", "Please choose a state."); return false; }
  clearError("stateErr");
  return true;
}

function validateZip() {
  var v = document.getElementById("zip").value.trim();
  if (v === "") { showError("zipErr", "Zip code is required."); return false; }
  if (!zipRegex.test(v)) { showError("zipErr", "Enter exactly 5 digits."); return false; }
  clearError("zipErr");
  return true;
}

function validateEmail() {
  var v = document.getElementById("email").value.trim().toLowerCase();
  if (v === "") { showError("emailErr", "Email is required."); return false; }
  if (!emailRegex.test(v)) { showError("emailErr", "Use the format name@domain.tld"); return false; }
  clearError("emailErr");
  return true;
}

function validatePhone() {
  var v = document.getElementById("phone").value.trim();
  if (v === "") { clearError("phoneErr"); return true; }  
  if (!phoneRegex.test(v)) { showError("phoneErr", "Use 000-000-0000."); return false; }
  clearError("phoneErr");
  return true;
}

function validateSymptoms() {
  var v = document.getElementById("symptoms").value;
  if (v.indexOf('"') !== -1) { showError("symptomsErr", "Please do not use double quotes."); return false; }
  clearError("symptomsErr");
  return true;
}

function validateUserId() {
  var v = document.getElementById("userId").value.trim().toLowerCase();
  if (v === "") { showError("userIdErr", "User ID is required."); return false; }
  if (/^[0-9]/.test(v)) { showError("userIdErr", "Cannot start with a number."); return false; }
  if (v.length < 5 || v.length > 20) { showError("userIdErr", "Must be 5 to 20 characters."); return false; }
  if (!userIdRegex.test(v)) { showError("userIdErr", "Letters, numbers, dash or underscore only."); return false; }
  clearError("userIdErr");
  return true;
}

function validatePasswords() {
  var pw     = document.getElementById("password").value;
  var confirm = document.getElementById("confirmPassword").value;
  var userId = document.getElementById("userId").value.trim();
  var first  = document.getElementById("firstName").value.trim();
  var last   = document.getElementById("lastName").value.trim();

  var result = checkPassword(pw, confirm, userId, first, last);
  if (result !== "pass") {
    showError("passwordErr", result.replace("ERROR: ", ""));
    return false;
  }
  clearError("passwordErr");
  return true;
}



function validateForm() {
 
  forceLower(document.getElementById("email"));
  forceLower(document.getElementById("userId"));

  var ok = true;
  if (!validateFirstName()) { ok = false; }
  if (!validateMI())        { ok = false; }
  if (!validateLastName())  { ok = false; }
  if (!validateDob())       { ok = false; }
  if (!validateSSN())       { ok = false; }
  if (!validateAddress1())  { ok = false; }
  if (!validateAddress2())  { ok = false; }
  if (!validateCity())      { ok = false; }
  if (!validateState())     { ok = false; }
  if (!validateZip())       { ok = false; }
  if (!validateEmail())     { ok = false; }
  if (!validatePhone())     { ok = false; }
  if (!validateSymptoms())  { ok = false; }
  if (!validateUserId())    { ok = false; }
  if (!validatePasswords()) { ok = false; }

  var msg = document.getElementById("validateMsg");
  var submitBtn = document.getElementById("submitBtn");

  if (ok) {
    msg.textContent = "All fields look good. You may now press Submit.";
    msg.className = "validate-msg ok";
    submitBtn.style.display = "inline-block";
  } else {
    msg.textContent = "Please fix the fields marked in red, then press Validate again.";
    msg.className = "validate-msg bad";
    submitBtn.style.display = "none";
  }
  return ok;
}



window.onload = function () {
  showDate();
  updateHealthValue();
};
