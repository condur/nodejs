// Code included inside $( document ).ready() will only run once
// the page Document Object Model (DOM) is ready for JavaScript code to execute.
$(document).ready(function () {
  $("input[type='submit']").click(function (event) {
    if ($("input[name='username']").val() === '') {
      $('#group-username').addClass('has-error')
      $('#group-username').find('span.has-error').show()
      event.preventDefault()
    }
    if ($("input[name='password']").val() === '') {
      $('#group-password').addClass('has-error')
      $('#group-password').find('span.has-error').show()
      event.preventDefault()
    }
  })

  $("input[name='username']").focus(function () {
    $('#group-username').removeClass('has-error')
    $('#group-username').find('span.has-error').hide()
  })

  $("input[name='password']").focus(function () {
    $('#group-password').removeClass('has-error')
    $('#group-password').find('span.has-error').hide()
  })
})
