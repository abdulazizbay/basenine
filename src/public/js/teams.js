console.log("Team frontend javascript file");

$(function () {
  /* Swap list view <-> create-team view */
  $("#process-btn").on("click", () => {
    $("#teamListView").removeClass("active");
    $("#teamFormView").addClass("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#cancel-btn, #cancel-btn-bottom").on("click", () => {
    $("#teamFormView").removeClass("active");
    $("#teamListView").addClass("active");
    $(".team-form")[0].reset();
    resetTeamImagePreviews();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

function resetTeamImagePreviews() {
  for (let i = 1; i <= 5; i++) {
    $(`#team-image-section-${i}`).attr("src", "/img/upload.svg");
  }
}

function validateTeamForm() {
  const teamNick = $(".team-nick").val();
  const teamAddress = $(".team-address").val();
  const mainImage = $(".team-image-one").get(0).files[0];

  if (teamNick === "" || teamAddress === "") {
    alert("Please insert all required inputs");
    return false;
  }

  if (!mainImage) {
    alert("Please upload at least the main team image!");
    return false;
  }

  return true;
}

function previewTeamImage(input, order) {
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
    $(`#team-image-section-${order}`)
      .attr("src", reader.result)
      .css("opacity", 1);
  };
  reader.readAsDataURL(file);
}
