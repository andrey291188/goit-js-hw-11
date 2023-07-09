import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '38138945-239ee90dc614073476176d6fe';
const BASE_URL = 'https://pixabay.com/api/';
const axios = require('axios').default;

const inputForm = document.querySelector('.search-form');
const galleryForm = document.querySelector('.gallery');
const target = document.querySelector('.js-target');

let lightbox = new SimpleLightbox('.gallery a');
let inputValue = null;
let currentPage = 1;

inputForm.addEventListener('submit', submitForm);
inputForm.addEventListener('input', inputData);

let options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      searchApiRequest(currentPage);
    };
  });
};

async function searchApiRequest() {
  
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${inputValue}&page=${currentPage}&per_page=40&image_type=photo&orientation=horizontal&safesearch=true`
    );

    if (!response.data.totalHits) {
      throw new Error();
    };

    if (!galleryForm.children.length) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    };
    galleryForm.insertAdjacentHTML(
      'beforeend',
      creatMarkup(response.data.hits)
    );

    lightbox.refresh();
    observer.observe(target);

    if (galleryForm.children.length >= response.data.totalHits) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      observer.unobserve(target);
    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  };
};

function submitForm(evt) {
  evt.preventDefault();

  if (galleryForm.children.length) {
    observer.unobserve(target);
    galleryForm.innerHTML = '';
  }
  currentPage = 1;
  searchApiRequest(inputValue);
  inputForm.reset();
};

function inputData(evt) {
  inputValue = evt.target.value;
};

function creatMarkup(arr) {
  return arr
    .map(
      ({
        comments,
        webformatURL,
        likes,
        downloads,
        views,
        tags,
        largeImageURL,
      }) => `<div class="photo-card">
    <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="200"/></a>
    <div class="info">
      <p class="info-item">
      <b>Likes</b>
      ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
  </div>`
    )
    .join('');
};
