function overlay(element) {
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("overlay").classList.add("animate-fadein");
  //document.body.classList.add("overflow-hidden");
  document.getElementById("challenge_div").scrollTop = 0;
  const linkRegex = /\[([^\]]+)\]\([^\)]+\)/g;

  const data = JSON.parse(element.dataset.raw_data);
  Object.keys(data).forEach((attr) => {
    if (document.getElementById("challenge_div_" + attr)) {
      if (attr == "author") {
        data[attr] = "Author: " + data[attr];
      }
      if (attr == "description") {
        data[attr] = "<md-block>" + data[attr] + "</md-block>";
      }
      if (attr == "solved") {
        return;
      }
      document.getElementById("challenge_div_" + attr).innerHTML = data[attr];
    }
    document.getElementById("challenge_div_submit").dataset.challenge_id =
      data["_id"];
    var color = "bg-[#37E100]";
    switch (data.difficulty) {
      case "beginner":
        color = "bg-[#00A7E1]";
        break;
      case "easy":
        color = "bg-[#37E100]";
        break;
      case "medium":
        color = "bg-[#E13A00]";
        break;
      case "hard":
        color = "bg-[#AA00E1]";
        break;
      default:
        break;
    }
    document
      .getElementById("challenge_div_difficulty")
      .classList.remove(
        document.getElementById("challenge_div_difficulty").dataset
          .current_color
      );
    document.getElementById("challenge_div_difficulty").classList.add(color);
    document.getElementById("challenge_div_difficulty").dataset.current_color =
      color;
  });
}
document
  .getElementById("challenge_div")
  .addEventListener("click", function (event) {
    event.stopPropagation();
  });
var timeouts = [];
function closeOverlay() {
  document.getElementById("overlay").classList.remove("animate-fadein");
  document.getElementById("overlay").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  document
    .getElementById("challenge_div_response")
    .classList.remove("bg-rose-400");
  document
    .getElementById("challenge_div_response")
    .classList.remove("bg-emerald-400");
  document.getElementById("challenge_div_response").classList.add("hidden");
  document
    .getElementById("challenge_div_response")
    .classList.remove("animate-longerfadeout");

  document.getElementById("challenge_div_submit").disabled = false;
  document
    .getElementById("challenge_div_submit")
    .classList.remove("opacity-50");
  document
    .getElementById("challenge_div_submit")
    .classList.remove("cursor-not-allowed");
  document
    .getElementById("challenge_div_submit")
    .classList.remove("pointer-events-none");
  document
    .getElementById("challenge_div_difficulty")
    .classList.remove("hidden");
  document
    .getElementById("challenge_div_difficulty")
    .classList.remove("animate-longerfadein");
  document
    .getElementById("challenge_div_category")
    .classList.remove("animate-longerfadein");
  document
    .getElementById("challenge_div_response")
    .classList.remove("opacity-0");
  document.getElementById("challenge_div_category").classList.remove("hidden");
  document.getElementById("challenge_div_blocker").classList.add("hidden");
  timeouts.forEach((timeout) => {
    clearTimeout(timeout);
  });
  timeouts = [];
}
document.getElementById("overlay").addEventListener("click", function () {
  closeOverlay();
});
document
  .getElementById("challenge_div_close")
  .addEventListener("click", function () {
    closeOverlay();
  });

document
  .getElementById("challenge_div_submit")
  .addEventListener("click", async function () {
    const flag = document.getElementById("challenge_div_input").value;
    document.getElementById("challenge_div_input").value = "";
    const id = document.getElementById("challenge_div_submit").dataset
      .challenge_id;
    console.log(id);
    const response = await fetch("/verify/flag", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        flag: flag,
        id: id,
      }),
    });
    const answer = await response.json();
    // Unhide response div
    document
      .getElementById("challenge_div_response")
      .classList.remove("hidden");
    document
      .getElementById("challenge_div_response")
      .classList.add("animate-longerfadein");
    document.getElementById("challenge_div_response").innerHTML = answer.msg;

    document.getElementById("challenge_div").scrollTop =
      document.getElementById("challenge_div").scrollHeight;

    if (answer.success) {
      document
        .getElementById("challenge_div_response")
        .classList.add("bg-emerald-400");
    } else {
      document
        .getElementById("challenge_div_response")
        .classList.add("bg-rose-400");
    }
    // Ratelimit!
    document.getElementById("challenge_div_submit").disabled = true;
    document.getElementById("challenge_div_submit").classList.add("opacity-50");
    document
      .getElementById("challenge_div_submit")
      .classList.add("cursor-not-allowed");
    document
      .getElementById("challenge_div_submit")
      .classList.add("pointer-events-none");

    document.getElementById("challenge_div_blocker").classList.remove("hidden");
    document
      .getElementById("challenge_div_ratelimitbar")
      .classList.add("animate-slidetoleft");

    timeouts.push(
      setTimeout(function () {
        document
          .getElementById("challenge_div_response")
          .classList.remove("animate-longerfadein");
        if (!answer.celebrate) {
          document
            .getElementById("challenge_div_response")
            .classList.add("animate-longerfadeout");
        } else {
          document
            .getElementById("challenge_div_response")
            .classList.add("opacity-0");
          document
            .getElementById("challenge_div_difficulty")
            .classList.add("hidden");
          document
            .getElementById("challenge_div_category")
            .classList.add("hidden");

          var target = document.getElementById("challenge_div_response");
          var current = document.getElementById("challenge_div_solved");
          current.classList.remove("hidden");
          var topTarget = target.getBoundingClientRect().top;
          var leftTarget = target.getBoundingClientRect().left;
          var topCurrent = current.getBoundingClientRect().top;
          var leftCurrent = current.getBoundingClientRect().left;
          var initialWidth = current.getBoundingClientRect().width;
          var moveLeft = leftTarget - leftCurrent;
          var moveTop = topTarget - topCurrent;
          current.style.transform = `translate(${Math.round(
            moveLeft
          )}px, ${Math.round(moveTop)}px)`;
          current.classList.add("w-full");
          // Blink and you'll miss it
          current.style.transitionDuration = "0.001s";
          current.addEventListener(
            "transitionend",
            function () {
              current.style.transitionDuration = "3s";
              current.style.transitionTimingFunction = "linear";
              current.style.transform = `translate(0px,0px)`;
              current.style.width = initialWidth;
              timeouts.push(
                setTimeout(function () {
                  document
                    .getElementById("challenge_div_difficulty")
                    .classList.remove("hidden");
                  document
                    .getElementById("challenge_div_category")
                    .classList.remove("hidden");
                  document
                    .getElementById("challenge_div_difficulty")
                    .classList.add("animate-longerfadein");
                  document
                    .getElementById("challenge_div_category")
                    .classList.add("animate-longerfadein");
                  document
                    .getElementById("challenge_div_response")
                    .classList.remove("opacity-0");
                  document
                    .getElementById("challenge_div_response")
                    .classList.add("hidden");
                }, 3000)
              );
            },
            { once: true }
          );
        }
        timeouts.push(
          setTimeout(function () {
            document
              .getElementById("challenge_div_response")
              .classList.remove("bg-rose-400");
            if (!answer.celebrate) {
              document
                .getElementById("challenge_div_response")
                .classList.add("hidden");
            }
            document
              .getElementById("challenge_div_response")
              .classList.remove("animate-longerfadeout");

            document.getElementById("challenge_div_submit").disabled = false;
            document
              .getElementById("challenge_div_submit")
              .classList.remove("opacity-50");
            document
              .getElementById("challenge_div_submit")
              .classList.remove("cursor-not-allowed");
            document
              .getElementById("challenge_div_submit")
              .classList.remove("pointer-events-none");
            document
              .getElementById("challenge_div_blocker")
              .classList.add("hidden");
          }, 500)
        );
      }, 5000)
    );
  });
