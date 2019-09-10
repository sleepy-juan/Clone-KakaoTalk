$(document).ready(() => {
  var me = getParameter("me");
  var other = getParameter("other");
  if (!me || !other) {
    $(".container").html("<h1>Tell me who you are and who the other is</h1>");
  }
  $("#name").text(other);
  $("title").text(other);

  // watch input
  $("#input").on("propertychange change keyup paste input", () => {
    if ($("#input").val() && $("#input").val().length > 0) {
      $("#send").prop("disabled", false);
    } else {
      $("#send").prop("disabled", true);
    }
  });

  $("#input").keypress(e => {
    if (e.which === 13) {
      sendMessage(me, other);

      return false;
    }
  });

  // register send
  $("#send").click(() => {
    sendMessage(me, other);
  });

  // check profile & watch database
  var profile = null;
  firebase
    .database()
    .ref(`/profiles/${other}`)
    .once("value", snapshot => {
      if (snapshot.val()) {
        $("#profile").attr("src", snapshot.val());
        profile = snapshot.val();
      }
    })
    .then(() => {
      firebase
        .database()
        .ref("/messages")
        .on("value", snapshot => {
          var messages = snapshot.val() ? Object.values(snapshot.val()) : [];
          messages = messages.filter(
            msg =>
              (msg.me === me && msg.other === other) ||
              (msg.me === other && msg.other === me)
          );
          messages = messages.sort((a, b) => a.timestamp - b.timestamp);

          $(".message").html("");
          for (var i = 0; i < messages.length; i++) {
            // for sender info
            if (
              messages[i].me === other &&
              (i === 0 || messages[i - 1].me !== messages[i].me)
            ) {
              $(".message").append(
                `<img class="profile" src="${profile}"></img>`
              );
              $(".message").append(
                `<div class="other"><span class="sender">${messages[i].me}</span></div>`
              );
            }

            // for time
            if (
              i === messages.length - 1 ||
              messages[i].me !== messages[i + 1].me
            ) {
              var time = new Date(messages[i].timestamp);
              var str_time = `${time.getHours()}:${time.getMinutes()}`;

              if (messages[i].me === me) {
                $(".message").append(
                  `<div class="my"><span class="msg">${messages[i].msg}</span><span class="time">${str_time}</span></div>`
                );
              } else {
                $(".message").append(
                  `<div class="other"><span class="msg">${messages[i].msg}</span><span class="time">${str_time}</span></div>`
                );
              }
            } else {
              if (messages[i].me === me) {
                $(".message").append(
                  `<div class="my"><span class="msg">${messages[i].msg}</span></div>`
                );
              } else {
                $(".message").append(
                  `<div class="other"><span class="msg">${messages[i].msg}</span></div>`
                );
              }
            }
          }

          const scrollHeight = $(".message").prop("scrollHeight");
          const height = $(".message").height();
          const scrollTop = $(".message").scrollTop();

          if (scrollTop < scrollHeight - height * 3) {
            $(".message").scrollTop(scrollHeight - height * 3);
          }

          $(".message").animate(
            { scrollTop: $(".message").prop("scrollHeight") },
            1000
          );
        });
    });
});

// get parameter from URL
function getParameter(key) {
  // url parse
  var parser = document.createElement("a");
  parser.href = window.location.href;
  var parameters = parser.search.slice(1).split("&");
  parameters = parameters.map(param => ({
    key: param.split("=")[0],
    value: param.split("=")[1]
  }));

  var filtered = parameters.filter(param => param.key === key)[0];
  return filtered ? decodeURI(filtered.value) : null;
}

// send message
function sendMessage(me, other) {
  var msg = $("#input").val();
  firebase
    .database()
    .ref("messages")
    .push({
      timestamp: new Date().getTime(),
      me,
      other,
      msg
    });

  $("#input").val("");
}
