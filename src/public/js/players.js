console.log("Players frontend javascript file");

$(function () {
  /* Swap list view <-> create-player view */
  $("#process-btn").on("click", () => {
    $("#playerListView").removeClass("active");
    $("#playerFormView").addClass("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#cancel-btn, #cancel-btn-bottom").on("click", () => {
    $("#playerFormView").removeClass("active");
    $("#playerListView").addClass("active");
    $(".player-form")[0].reset();
    resetPlayerImagePreviews();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

function resetPlayerImagePreviews() {
  for (let i = 1; i <= 5; i++) {
    $(`#player-image-section-${i}`).attr("src", "/img/upload.svg");
  }
}

function validatePlayerForm() {
  const playerNick = $(".player-nick").val();
  const playerPosition = $(".player-position").val();
  const playerNumber = $(".player-number").val();
  const playerDob = $(".player-dob").val();
  const playerHeight = $(".player-height").val();
  const teamId = $(".teams").val();
  const mainImage = $(".player-image-one").get(0).files[0];

  if (
    playerNick === "" ||
    playerPosition === "" ||
    playerNumber === "" ||
    playerDob === "" ||
    playerHeight === ""
  ) {
    alert("Please insert all required inputs");
    return false;
  }

  if (!mainImage) {
    alert("Please upload at least the main player image!");
    return false;
  }

  return true;
}

function previewPlayerImage(input, order) {
  const file = $(input).get(0).files[0];
  if (!file) return;

  const fileType = file["type"];
  const validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpeg, jpg and png!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    $(`#player-image-section-${order}`)
      .attr("src", reader.result)
      .css("opacity", 1);
  };
  reader.readAsDataURL(file);
}
