console.log("Games frontend javascript file");

$(function () {
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

  $(".spec-score").on("change", async function (e) {
    const $input = $(e.target);
    const id = $input.data("id");
    const rawA = $(`.score-a[data-id="${id}"]`).val();
    const rawB = $(`.score-b[data-id="${id}"]`).val();

    const teamAScore = rawA === "" ? null : Number(rawA);
    const teamBScore = rawB === "" ? null : Number(rawB);

    if (teamAScore < 0 || teamBScore < 0) {
      alert("Scores cannot be negative");
      return;
    }

    try {
      if (teamAScore !== null && teamBScore !== null) {
        const response = await axios.post(`/admin/game/${id}`, {
          teamAScore,
          teamBScore,
        });

        if (response.data) {
          $input.addClass("saved");
          setTimeout(() => $input.removeClass("saved"), 1200);
        } else {
          alert("Score update failed");
        }
      }
    } catch (err) {
      console.log(err);
      alert("Score update failed");
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
