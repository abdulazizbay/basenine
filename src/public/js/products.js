
console.log("Products frontend javascript file");

$(function () {
  /* Swap list view <-> create-product view */
  $("#process-btn").on("click", () => {
    $("#productListView").removeClass("active");
    $("#productFormView").addClass("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#cancel-btn, #cancel-btn-bottom").on("click", () => {
    $("#productFormView").removeClass("active");
    $("#productListView").addClass("active");
    $(".dish-container")[0].reset();
    resetImagePreviews();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Status update */
  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id;
    const productStatus = $(`#${id}.new-product-status`).val();

    try {
      const response = await axios.post(`/admin/product/${id}`, {
        productStatus: productStatus,
      });
      const result = response.data;
      if (result) {
        $(`#${id}.new-product-status`)
          .removeClass("status-pause status-process status-delete")
          .addClass(`status-${productStatus.toLowerCase()}`)
          .blur();
      } else alert("Product update failed");
    } catch (err) {
      console.log(err);
      alert("Product update failed");
    }
  });
});

function resetImagePreviews() {
  for (let i = 1; i <= 5; i++) {
    $(`#image-section-${i}`).attr("src", "/img/upload.svg");
  }
}

function validateForm() {
  const productName = $(".product-name").val();
  const productPrice = $(".product-price").val();
  const productLeftCount = $(".product-left-count").val();
  const productCollection = $(".product-collection").val();
  const productDesc = $(".product-desc").val();
  const productStatus = $(".product-status").val();

  if (
    productName === "" ||
    productPrice === "" ||
    productLeftCount === "" ||
    productCollection === "" ||
    productDesc === "" ||
    productStatus === ""
  ) {
    alert("Please insert all required inputs");
    return false;
  } else return true;
}

function previewFileHandler(input, order) {
  const imgClassName = input.className;

  const file = $(`.${imgClassName}`).get(0).files[0];
  const fileType = file["type"];
  const validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpeg, jpg and png!");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
