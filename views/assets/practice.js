console.log("active")
function overlay(element) {
  document.getElementById("overlay").classList.remove("hidden")
  document.getElementById("overlay").classList.add("animate-fadein")
  document.body.classList.add("overflow-hidden")
}
document.getElementById('challenge_div').addEventListener('click', function(event) {
  event.stopPropagation();
});

document.getElementById("overlay").addEventListener('click', function() {
  document.getElementById("overlay").classList.remove("animate-fadein")
  document.getElementById("overlay").classList.add("hidden");
  document.body.classList.remove("overflow-hidden")
})
document.getElementById("challenge_div_close").addEventListener('click', function() {
  document.getElementById("overlay").classList.remove("animate-fadein")
  document.getElementById("overlay").classList.add("hidden");
  document.body.classList.remove("overflow-hidden")
})