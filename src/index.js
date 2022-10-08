import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

axios.defaults.baseURL = 'https://pixabay.com/api/';

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
  constructor(totalPage, maxPageVisible = 7, currentPage = 1) {
    let pages = pageNumber(totalPage, maxPageVisible, currentPage);
    // console.log(pages);
    let currentPageBtn = null;
    const buttons = new Map();
    // console.log(buttons);
    const fragment = document.createDocumentFragment();

    const disabled = {
      start: () => pages[0] == 1,
      prev: () => currentPage == 1,
      end: () => pages.slice(-1)[0] === totalPage,
      next: () => currentPage === totalPage,
    };

    const paginationButtonsContainer = document.createElement('div');
    paginationButtonsContainer.classList.add('pages');

    const createAndSetupButton = (
      label = '',
      cls = '',
      disabled = false,
      handleClick = () => {}
    ) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.className = `page-btn number ${cls}`;
      button.disabled = disabled;
      button.addEventListener('click', event => {
        handleClick(event);
        this.update();
        paginationButtonsContainer.value = currentPage;
        paginationButtonsContainer.dispatchEvent(new Event('change'));
      });

      return button;
    };

    const onPageButtonClick = e =>
      (currentPage = Number(e.currentTarget.textContent));

    const onPageButtonUpdate = index => btn => {
      btn.textContent = pages[index];

      if (pages[index] === currentPage) {
        currentPageBtn.classList.remove('active');
        btn.classList.add('active');
        currentPageBtn = btn;
        currentPageBtn.focus();
      }
    };

    buttons.set(
      createAndSetupButton(
        'Start',
        'start-page',
        disabled.start,
        () => (currentPage = 1)
      ),
      btn => (btn.disabled = disabled.start())
    );
    buttons.set(
      createAndSetupButton(
        'Previous',
        'prev-page',
        disabled.prev(),
        () => (currentPage -= 1)
      ),
      btn => (btn.disabled = disabled.prev())
    );

    pages.forEach((pageNumber, index) => {
      const isCurrentPage = pageNumber === currentPage;

      const button = createAndSetupButton(
        pageNumber,
        isCurrentPage ? 'active' : '',
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
        'Next',
        'next-page',
        disabled.next(),
        () => (currentPage += 1)
      ),
      btn => (btn.disabled = disabled.next())
    );
    buttons.set(
      createAndSetupButton(
        'End',
        'end-page',
        disabled.end(),
        () => (currentPage = totalPage)
      ),
      btn => (btn.disabled = disabled.end())
    );

    buttons.forEach((_, btn) => fragment.appendChild(btn));

    this.render = (container = document.body) => {
      paginationButtonsContainer.appendChild(fragment);
      container.appendChild(paginationButtonsContainer);
    };
    this.update = (newPageNumbers = currentPage) => {
      currentPage = newPageNumbers;
      console.log('currentPage', currentPage);
      pages = pageNumber(totalPage, maxPageVisible, currentPage);
      buttons.forEach((updateButton, button) => updateButton(button));
    };

    this.onChange = handler => {
      paginationButtonsContainer.addEventListener('change', handler);
    };
  }
}

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  // loadMore: document.querySelector('.load-more'),
};

const lightBox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionType: 'attr',
  captionPosition: 'bottom',
  captionDelay: 250,
  captionsData: 'alt',
  docClose: true,
});

let value = '';
let currentPage = 1;
// const HITS_PER_PAGE = 40;
let totalPages = 0;

let items = [];
refs.form.addEventListener('submit', onSearchItems);

function onSearchItems(e) {
  e.preventDefault();
  value = e.currentTarget.elements.searchQuery.value;
  if (value.trim() === '') {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  currentPage = 1;
  refs.gallery.innerHTML = '';

  getPicture(value.trim());
}

const getPicture = async () => {
  try {
    const { data } = await axios.get(
      `?q=${value}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&key=30191539-d56ffab2c88cb867d9bceaf74`
    );
    items = [...items, ...data.hits];
    renderList(data.hits);

    if (data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    totalPages = Math.ceil(data.totalHits / 40);
    let paginationButtons = new PaginationButtons(`${totalPages}`);

    paginationButtons.render();

    const pagesClick = document.querySelector('.pages');

    pagesClick.addEventListener('click', onClickBtn);

    function onClickBtn(e) {
      console.log(e.currentTarget.value);
      currentPage = e.currentTarget.value;

      getPicture();
      // console.log('click');
    }

    if (currentPage >= totalPages) {
      // refs.loadMore.classList.remove('visible');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
  } catch (error) {
    Notify.failure(error);
  }
};

const renderList = items => {
  const list = items
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
      <a class="gallery__item" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b class = "info-team-general-color">Likes: <b class  = "info-team-second-color">${likes}</b> </b>
    </p>
    <p class="info-item">
      <b class = "info-team-general-color">Views: <b class  = "info-team-second-color">${views}</b></b>
    </p>
    <p class="info-item">
      <b class = "info-team-general-color">Comments: <b class = "info-team-second-color">${comments}</b></b>
    </p>
    <p class="info-item">
      <b class = "info-team-general-color">Downloads: <b class  = "info-team-second-color">${downloads}</b></b>
    </p>
  </div>
</div>`
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', list);
  lightBox.refresh();
};

// refs.buttonClick.addEventListener('click', onClickLoadMore);

// paginationButtons.onChange(e => {
//   console.log('change', e.target.value);
// });
