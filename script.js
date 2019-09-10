$(document).ready(() => {
  $("#input-start").click(() => {
    let me = $("#input-me").val();
    let other = $("#input-other").val();

    window.location.href = `./chat.html?me=${me}&other=${other}`;
  });
});
