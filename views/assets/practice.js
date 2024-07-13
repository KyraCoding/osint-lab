function overlay(element) {
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("overlay").classList.add("animate-fadein");
  document.body.classList.add("overflow-hidden");
  document.getElementById("challenge_div").scrollTop = 0;

  const data = JSON.parse(element.dataset.raw_data);
  Object.keys(data).forEach((attr) => {
    if (document.getElementById("challenge_div_" + attr)) {
      if (attr == "author") {
        data[attr] = "Author: " + data[attr];
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

document.getElementById("overlay").addEventListener("click", function () {
  document.getElementById("overlay").classList.remove("animate-fadein");
  document.getElementById("overlay").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
});
document
  .getElementById("challenge_div_close")
  .addEventListener("click", function () {
    document.getElementById("overlay").classList.remove("animate-fadein");
    document.getElementById("overlay").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  });

document
  .getElementById("challenge_div_submit")
  .addEventListener("click", async function () {
    const flag = document.getElementById("challenge_div_input").value;
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
    document
      .getElementById("challenge_div_response")
      .classList.remove("hidden");
    document
      .getElementById("challenge_div_response")
      .classList.add("animate-longerfadein");
    document.getElementById("challenge_div_response").innerHTML = answer.msg;
    if (answer.success) {
      document
        .getElementById("challenge_div_response")
        .classList.add("bg-emerald-400");
    } else {
      document
        .getElementById("challenge_div_response")
        .classList.add("bg-rose-400");
    }
    setTimeout(function () {
      document
        .getElementById("challenge_div_response")
        .classList.remove("animate-longerfadein");
      document
        .getElementById("challenge_div_response")
        .classList.add("animate-longerfadeout");
      setTimeout(function () {
        document
          .getElementById("challenge_div_response")
          .classList.remove("bg-rose-400");
        document
          .getElementById("challenge_div_response")
          .classList.remove("bg-emerald-400");
        document
          .getElementById("challenge_div_response")
          .classList.add("hidden");
        document
        .getElementById("challenge_div_response")
        .classList.remove("animate-longerfadeout");
      }, 500);
    }, 5000);
  });
