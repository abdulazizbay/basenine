console.log("Games frontend javascript file");

$(function () {
  /* Swap list view <-> create-game view */
  $("#process-btn").on("click", () => {
    $("#gameListView").removeClass("active");
    $("#gameFormView").addClass("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#cancel-btn, #cancel-btn-bottom").on("click", () => {
    $("#gameFormView").removeClass("active");
    $("#gameListView").addClass("active");
    $(".game-form")[0].reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Status update */
  $(".game-status").on("change", async function (e) {
    const id = e.target.id;
    const gameStatus = $(`#${id}.game-status`).val();

    try {
      const response = await axios.post(`/admin/game/${id}`, {
        gameStatus: gameStatus,
      });
      const result = response.data;
      if (result) {
        $(`#${id}.game-status`)
          .removeClass("status-upcoming status-process status-finished")
          .addClass(`status-${gameStatus.toLowerCase()}`)
          .blur();
      } else alert("Game update failed");
    } catch (err) {
      console.log(err);
      alert("Game update failed");
    }
  });
});

function validateGameForm() {
  const teamAId = $(".team-a").val();
  const teamBId = $(".team-b").val();
  const gameDate = $(".game-date").val();
  const gameAddress = $(".game-address").val();

  if (
    teamAId === "" ||
    teamBId === "" ||
    gameDate === "" ||
    gameAddress === ""
  ) {
    alert("Please insert all required inputs");
    return false;
  }

  if (teamAId === teamBId) {
    alert("Team A and Team B must be different teams");
    return false;
  }

  return true;
}
