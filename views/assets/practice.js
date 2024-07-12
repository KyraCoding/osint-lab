function overlay(element) {
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("overlay").classList.add("animate-fadein");
  document.body.classList.add("overflow-hidden");
  document.getElementById("challenge_div").scrollTop = 0;

  const data = JSON.parse(element.dataset.raw_data);
  console.log(data)
  Object.keys(data).forEach((attr) => {
    if (document.getElementById("challenge_div_" + attr)) {
      if (attr == "author") {
        data[attr] = "Author: " + data[attr];
      }
      document.getElementById("challenge_div_" + attr).innerHTML = data[attr];
    }
    document.getElementById("challenge_div_submit").dataset.challenge_id = data["_id"];
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
