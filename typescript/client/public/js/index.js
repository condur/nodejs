// Code included inside $( document ).ready() will only run once
// the page Document Object Model (DOM) is ready for JavaScript code to execute.
$(document).ready(function () {
  $.get('/typescript/version', function (version) {
    $('#version').text(version)
  })
})
