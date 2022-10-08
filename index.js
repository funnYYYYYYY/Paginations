// const ulTag = document.querySelector("ul");
// let totalPages = 20;

// const refs = {
//   clickLeft: document.querySelector("direction-right"),
//   clickRight: document.querySelector("direction-left"),
// };

// function element(totalPages, page) {
//   let liTag = "";
//   let beforePages = page - 1;
//   let afterPages = page + 1;
//   let activeBtn;

//   if (page > 1) {
//     liTag += `<button onclick="element(totalPages, ${
//       page - 1
//     }" class="direction-movement direction-right">
//           <span><<i class="arrow right" > Prev</i></span>
//         </button>`;
//   }

//   for (
//     let pageLength = beforePages;
//     pageLength <= afterPages;
//     pageLength += 1
//   ) {
//     if (page === pageLength) {
//       activeBtn = "active";
//     } else {
//       activeBtn = "";
//     }
//     liTag += `<button class="numb ${activeBtn}"><span>${pageLength}</span></button>`;
//   }

//   if (page < totalPages) {
//     liTag += `<button onclick="element(totalPages, ${
//       page + 1
//     }" class="direction-movement direction-left">
//           <span>Next <i class="arrow left"> ></i></span>
//         </button>`;
//   }

//   ulTag.innerHTML = liTag;
// }

// element(totalPages, 5);

// function onClickRight() {
//   console.log("click Btn Right");
// }

// function onClickLeft() {
//   console.log("click Btn Left");
// }

// ----------------------------------------------------------------------------------------------------------------------------------------------------------

const pageNumber = (total, max, current) => {
  const half = Math.round(max / 2);
  let to = max;

  if (current + half >= total) {
    to = total;
  } else if (current > half) {
    to = current + half;
  }

  let from = to - max;
  return Array.from({ length: max }, (_, i) => i + 1 + from);
};

class PaginationButtons {
  constructor(totalPage, maxPageVisible = 10, currentPage = 1) {
    let pages = pageNumber(totalPage, maxPageVisible, currentPage);
    let currentPageBtn = null;
    const buttons = new Map();
    const fragment = document.createDocumentFragment();

    const disabled = {
      start: () => pages[0] == 1,
      prev: () => currentPage == 1,
      end: () => pages.slice(-1)[0] === totalPage,
      next: () => currentPage === totalPage,
    };

    const paginationButtonsContainer = document.createElement("div");
    paginationButtonsContainer.classList.add("pages");

    const createAndSetupButton = (
      label = "",
      cls = "",
      disabled = false,
      handleClick = () => {}
    ) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.className = `page-btn ${cls}`;
      button.disabled = disabled;
      button.addEventListener("click", (event) => {
        handleClick(event);
        this.update();
        paginationButtonsContainer.value = currentPage;
        paginationButtonsContainer.dispatchEvent(new Event("change"));
      });

      return button;
    };

    const onPageButtonClick = (e) =>
      (currentPage = Number(e.currentTarget.textContent));

    const onPageButtonUpdate = (index) => (btn) => {
      btn.textContent = pages[index];

      if (pages[index] === currentPage) {
        currentPageBtn.classList.remove("active");
        btn.classList.add("active");
        currentPageBtn = btn;
      }
    };

    buttons.set(
      createAndSetupButton(
        "Start",
        "start-page",
        disabled.start,
        () => (currentPage = 1)
      ),
      (btn) => (btn.disabled = disabled.start())
    );
    buttons.set(
      createAndSetupButton(
        "Prev",
        "prev-page",
        disabled.prev(),
        () => (currentPage -= 1)
      ),
      (btn) => (btn.disabled = disabled.prev())
    );

    pages.forEach((pageNumber, index) => {
      const isCurrentPage = pageNumber === currentPage;

      const button = createAndSetupButton(
        pageNumber,
        isCurrentPage ? "active" : "",
        false,
        onPageButtonClick
      );

      if (isCurrentPage) {
        currentPageBtn = button;
      }

      buttons.set(button, onPageButtonUpdate(index));
    });

    buttons.set(
      createAndSetupButton(
        "Next",
        "next-page",
        disabled.next(),
        () => (currentPage += 1)
      ),
      (btn) => (btn.disabled = disabled.next())
    );
    buttons.set(
      createAndSetupButton(
        "End",
        "end-page",
        disabled.end(),
        () => (currentPage = totalPage)
      ),
      (btn) => (btn.disabled = disabled.end())
    );

    buttons.forEach((_, btn) => fragment.appendChild(btn));

    this.render = (container = document.body) => {
      paginationButtonsContainer.appendChild(fragment);
      container.appendChild(paginationButtonsContainer);
    };
    this.update = (newPageNumbers = currentPage) => {
      currentPage = newPageNumbers;
      console.log("currentPage", currentPage);
      pages = pageNumber(totalPage, maxPageVisible, currentPage);
      buttons.forEach((updateButton, button) => updateButton(button));
    };

    this.onChange = (handler) => {
      paginationButtonsContainer.addEventListener("change", handler);
    };
  }
}

const paginationButtons = new PaginationButtons(100);

paginationButtons.render();

paginationButtons.onChange((e) => {
  console.log("change", e.target.value);
});
