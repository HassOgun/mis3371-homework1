/*

 Program name: homework4.js
 Author:       Hassan Ogunlana
 Date created: 07/8/2026
 Date last edited: 07/11/2026
 Version:      4.0
 Description:  External JavaScript for homework4.html
               (Bayou City Medical patient registration).
               Homework 4 keeps all of the Homework 3 on-the-fly field
               validation and adds: a first-name tracking cookie that
               greets a returning user and pre-fills their name, a
               "Remember Me" / "not me" flow, and local storage that
               saves the non-secure fields as they are entered.

*/


 
var nameRegex   = /^[A-Za-z'\-]{1,30}$/;           // first name
var lastRegex   = /^[A-Za-z'2-5\-]{1,30}$/;         // last name (allows 2-5)
var miRegex     = /^[A-Za-z]$/;                      // middle initial
var dobRegex    = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
var ssnRegex    = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;   // after auto-format
var cityRegex   = /^[A-Za-z ]{2,30}$/;
var zipRegex    = /^[0-9]{5}$/;                      // 5 digits only  
var emailRegex  = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;  // test lowercase
var phoneRegex  = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
var userIdRegex = /^[A-Za-z_][A-Za-z0-9_\-]{4,19}$/; // 5 to 20 characters  


 
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

  // password cannot contain the user id or the name
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
  var digits = field.value.replace(/\D/g, "");   // strip non-digits
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
  if (v === "") { clearError("miErr"); return true; }   // blank is ok
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
  if (v === "") { clearError("ssnErr"); return true; }   // optional
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
  if (v === "") { clearError("address2Err"); return true; }   // optional
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
  // force lowercase on the fields that need it before checking
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
    saveFirstNameCookie();   // remember this user for next time (if Remember Me is on)
  } else {
    msg.textContent = "Please fix the fields marked in red, then press Validate again.";
    msg.className = "validate-msg bad";
    submitBtn.style.display = "none";
  }
  return ok;
}


 
var FIRST_NAME_COOKIE = "firstName";
var COOKIE_HOURS = 48;   // the assignment says no more than 48 hours

function setCookie(name, value, hours) {
  var d = new Date();
  d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  var cname = name + "=";
  var parts = document.cookie.split(";");
  for (var i = 0; i < parts.length; i++) {
    var c = parts[i];
    while (c.charAt(0) === " ") { c = c.substring(1); }   // trim leading spaces
    if (c.indexOf(cname) === 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

function deleteCookie(name) {
  // set the expiry to a past date so the browser drops the cookie
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
}


 
function saveFirstNameCookie() {
  var remember = document.getElementById("rememberMe").checked;
  var first = document.getElementById("firstName").value.trim();
  if (remember && first !== "") {
    setCookie(FIRST_NAME_COOKIE, first, COOKIE_HOURS);
  }
}


 
function loadGreeting() {
  var name = getCookie(FIRST_NAME_COOKIE);
  var greeting = document.getElementById("greeting");
  var notMeRow = document.getElementById("notMeRow");
  var notMeLabel = document.getElementById("notMeLabel");

  if (name !== "") {
    // returning visitor
    greeting.textContent = "Welcome back, " + name + "!";
    document.getElementById("firstName").value = name;   // pre-fill the box
    loadFormData();                                       // read their other fields back in
    notMeLabel.textContent = "Not " + name + "? Click here to start as a NEW USER.";
    notMeRow.style.display = "block";
  } else {
    // first-time visitor
    greeting.textContent = "Welcome, New user!";
    notMeRow.style.display = "none";
  }
}


 
function startAsNewUser() {
  deleteCookie(FIRST_NAME_COOKIE);
  localStorage.removeItem(STORAGE_KEY);   // remove this user's saved fields
  document.getElementById("registerForm").reset();
  updateHealthValue();                    // put the slider number back to its default

  // put the page back into "new user" mode
  document.getElementById("greeting").textContent = "Welcome, New user!";
  document.getElementById("notMeRow").style.display = "none";
}


 
function rememberMeChanged() {
  var remember = document.getElementById("rememberMe").checked;
  if (remember) {
    saveFirstNameCookie();
    saveFormData();
  } else {
    deleteCookie(FIRST_NAME_COOKIE);
    localStorage.removeItem(STORAGE_KEY);
  }
}


 
var STORAGE_KEY = "bcmFormData";

// the single-value non-secure fields (no password, no SSN)
var savedFieldIds = ["firstName", "middleInitial", "lastName", "dob",
                     "address1", "address2", "city", "state", "zip",
                     "email", "phone", "symptoms", "userId", "health"];

// helper: return the chosen value of a radio group, or "" if none
function getRadioValue(groupName) {
  var radios = document.getElementsByName(groupName);
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) { return radios[i].value; }
  }
  return "";
}

// helper: tick the radio button in a group that matches value
function setRadioValue(groupName, value) {
  if (!value) { return; }
  var radios = document.getElementsByName(groupName);
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].value === value) { radios[i].checked = true; }
  }
}

/* Save every non-secure field to local storage. Only runs when Remember
   Me is checked. Fires on any change/typing in the form. */
function saveFormData() {
  if (!document.getElementById("rememberMe").checked) { return; }

  var data = {};

  // simple value fields
  for (var i = 0; i < savedFieldIds.length; i++) {
    var el = document.getElementById(savedFieldIds[i]);
    if (el) { data[savedFieldIds[i]] = el.value; }
  }

  // prior-illness checkboxes -> array of the ones that are checked
  var checked = [];
  var boxes = document.getElementsByName("priorIllness");
  for (var j = 0; j < boxes.length; j++) {
    if (boxes[j].checked) { checked.push(boxes[j].value); }
  }
  data.priorIllness = checked;

  // radio groups
  data.gender     = getRadioValue("gender");
  data.vaccinated = getRadioValue("vaccinated");
  data.insurance  = getRadioValue("insurance");

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* Read the saved data back into the form. Called for a returning user
   who has confirmed they are the same person. */
function loadFormData() {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) { return; }   // nothing stored yet

  var data = JSON.parse(saved);

  // simple value fields
  for (var i = 0; i < savedFieldIds.length; i++) {
    var el = document.getElementById(savedFieldIds[i]);
    if (el && data[savedFieldIds[i]] !== undefined) {
      el.value = data[savedFieldIds[i]];
    }
  }
  updateHealthValue();   // keep the slider number in sync

  // prior-illness checkboxes
  if (data.priorIllness) {
    var boxes = document.getElementsByName("priorIllness");
    for (var j = 0; j < boxes.length; j++) {
      boxes[j].checked = (data.priorIllness.indexOf(boxes[j].value) !== -1);
    }
  }

  // radio groups
  setRadioValue("gender", data.gender);
  setRadioValue("vaccinated", data.vaccinated);
  setRadioValue("insurance", data.insurance);
}


/* ----- run the start-up modules when the page finishes loading ----- */
window.onload = function () {
  showDate();
  updateHealthValue();
  loadGreeting();

  // save the non-secure fields whenever the user types or changes something
  var form = document.getElementById("registerForm");
  form.addEventListener("input", saveFormData);
  form.addEventListener("change", saveFormData);
};