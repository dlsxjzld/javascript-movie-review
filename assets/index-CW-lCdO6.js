(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function $(selector, scope = document) {
  if (!selector) throw new Error("No selector provided");
  return scope.querySelector(selector);
}
const createElementWithAttributes = ({
  tag,
  id = "",
  className = "",
  attributes = {},
  textContent = "",
  children = []
}) => {
  const element = document.createElement(tag);
  if (id) {
    element.setAttribute("id", id);
  }
  if (className) {
    element.classList.add(...className.split(" "));
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  if (textContent) {
    element.textContent = textContent;
  }
  if (Array.isArray(children) && children.length) {
    const fragment = document.createDocumentFragment();
    children.forEach(
      (child) => fragment.append(createElementWithAttributes(child))
    );
    element.append(fragment);
  }
  return element;
};
const backgroundContainer = () => {
  const $backgroundContainer = createElementWithAttributes({
    tag: "div",
    className: "background-container",
    children: [
      {
        tag: "div",
        className: "overlay overlay-background",
        attributes: {
          "aria-hidden": "true"
        }
      },
      {
        tag: "img",
        className: "overlay overlay-image",
        attributes: {
          src: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg",
          alt: "배너 이미지"
        }
      },
      {
        tag: "div",
        className: "top-rated-container",
        children: [
          {
            tag: "div",
            className: "top-rated-movie",
            children: [
              {
                tag: "div",
                className: "rate",
                children: [
                  {
                    tag: "img",
                    className: "star",
                    attributes: {
                      src: "./images/star_empty.png"
                    }
                  },
                  {
                    tag: "span",
                    className: "rate-value",
                    textContent: "9.5"
                  }
                ]
              },
              {
                tag: "div",
                className: "title",
                textContent: "인사이드 아웃2"
              },
              {
                tag: "button",
                className: "primary",
                textContent: "자세히 보기"
              }
            ]
          }
        ]
      }
    ]
  });
  return $backgroundContainer;
};
const showBackgroundContainer = ($targetElement) => {
  if (!$targetElement) {
    return;
  }
  const $backgroundContainer = backgroundContainer();
  $targetElement.append($backgroundContainer);
};
const hideBackgroundContainer = () => {
  const $backgroundContainer = $(".background-container");
  if (!$backgroundContainer) {
    return;
  }
  $backgroundContainer.remove();
};
const errorContainer = (error) => {
  const $errorContainer = createElementWithAttributes({
    tag: "div",
    className: "error-container",
    children: [
      { tag: "h1", textContent: `${error.message} 새로고침 해주세요!` }
    ]
  });
  return $errorContainer;
};
const showErrorContainer = (error) => {
  if (error instanceof Error) {
    hideBackgroundContainer();
    const $errorContainer = errorContainer(error);
    const $main = $("main");
    $main == null ? void 0 : $main.replaceChildren($errorContainer);
  }
};
const noImage = "/javascript-movie-review/images/no_image.png";
const movieItem = (movie) => {
  const $movieItem = createElementWithAttributes({
    tag: "li",
    id: movie.id.toString(),
    className: "item",
    children: [
      {
        tag: "img",
        className: "thumbnail",
        attributes: {
          src: movie.poster_path === null ? noImage : `https://image.tmdb.org/t/p/w440_and_h660_face${movie.poster_path}`,
          alt: movie.title
        }
      },
      {
        tag: "div",
        className: "item-desc",
        children: [
          {
            tag: "p",
            className: "rate",
            children: [
              {
                tag: "img",
                className: "star",
                attributes: {
                  src: `./images/star_empty.png`
                }
              },
              {
                tag: "span",
                textContent: movie.vote_average.toFixed(1).toString()
              }
            ]
          },
          { tag: "strong", textContent: movie.title }
        ]
      }
    ]
  });
  return $movieItem;
};
const showMovieDetailModal = () => {
  const $movieDetailModal = $("#movie-detail-modal");
  if (!$movieDetailModal || $movieDetailModal instanceof HTMLDialogElement === false) {
    return;
  }
  $movieDetailModal.showModal();
};
const api = async (baseURL, token, endpoint, method, params = {}) => {
  const url = new URL(`${baseURL}${endpoint}`);
  url.search = new URLSearchParams(params).toString();
  const options = {
    method,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  };
  const response = await fetch(url, options);
  return response.json();
};
const ERROR_MESSAGE = {
  3: "인증 실패: 서비스 접근 권한이 없습니다.",
  4: "잘못된 형식: 해당 형식의 서비스는 존재하지 않습니다.",
  5: "잘못된 매개변수: 요청 매개변수가 올바르지 않습니다.",
  7: "유효하지 않은 API 키: 유효한 키가 부여되어야 합니다.",
  9: "서비스 오프라인: 이 서비스는 일시적으로 오프라인 상태입니다. 나중에 다시 시도하세요.",
  10: "정지된 API 키: 귀하의 계정 접근이 정지되었습니다. TMDB에 문의하세요.",
  11: "내부 오류: 문제가 발생했습니다. TMDB에 문의하세요.",
  14: "인증 실패.",
  15: "실패했습니다.",
  18: "검증 실패.",
  19: "유효하지 않은 accept 헤더입니다.",
  22: "잘못된 페이지: 페이지는 1부터 500 사이의 정수여야 합니다.",
  24: "백엔드 서버 요청 시간이 초과되었습니다. 다시 시도하세요.",
  25: "요청 횟수 (#)가 허용 한도(40)를 초과했습니다.",
  31: "계정이 비활성화되었습니다. TMDB에 문의하세요.",
  33: "유효하지 않은 요청 토큰: 토큰이 만료되었거나 올바르지 않습니다.",
  34: "요청하신 리소스를 찾을 수 없습니다.",
  35: "유효하지 않은 토큰입니다.",
  42: "해당 리소스는 이 요청 메서드를 지원하지 않습니다.",
  43: "백엔드 서버에 연결할 수 없습니다.",
  46: "API가 유지보수 중입니다. 나중에 다시 시도하세요.",
  47: "입력이 올바르지 않습니다."
};
const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2NlOWYwOTc1NzY1ZjZkYjVmMzhlYWJkYTU3YmY4YyIsIm5iZiI6MTc0MjI2MjUwNi4yNjU5OTk4LCJzdWIiOiI2N2Q4ZDBlYTAwOWVhNjJiZGFlZWEwMDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.IaRoj_pm6ULc6XauMWFsROQxyJmjq8M029BDvv0H2Gc";
const isTmdbApiFetchFailResponse = (response) => {
  return typeof response === "object" && response !== null && "success" in response && response.success === false && "status_code" in response && typeof response.status_code === "number";
};
const tmdbApi = async (endpoint, method, params = {}) => {
  try {
    const response = await api(BASE_URL, TOKEN, endpoint, method, params);
    if (isTmdbApiFetchFailResponse(response)) {
      throw new Error(response.status_code.toString());
    }
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        ERROR_MESSAGE[Number(error.message)] ?? "네트워크 에러입니다."
      );
    } else {
      throw new Error("알 수 없는 에러입니다.");
    }
  }
};
const fetchMovieDetail = async (id) => {
  const response = await tmdbApi(`/movie/${id}`, "GET", {
    language: "ko-KR"
  });
  return response;
};
const createLocalStorage = (key) => {
  const myKey = key;
  const getDataFromLocalStorage = () => {
    const data = localStorage.getItem(myKey);
    if (data === null) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  };
  const setDataToLocalStorage = (data) => {
    localStorage.setItem(myKey, JSON.stringify(data));
  };
  return { getDataFromLocalStorage, setDataToLocalStorage };
};
const moviesRatingLocalStorage = createLocalStorage("moviesRate");
const COMMENTS = {
  2: "최악이예요",
  4: "별로예요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
const getComment = (rate) => {
  return COMMENTS[rate];
};
const getScoresArray = () => {
  return Object.keys(COMMENTS);
};
const movieRateComments = (myMovieRate) => {
  return createElementWithAttributes({
    tag: "div",
    id: "movie-rate-comments",
    className: "movie-rate-comments",
    textContent: `${myMovieRate === 0 ? "별점을 남겨주세요." : `${getComment(myMovieRate)} (${myMovieRate}/10)`}`
  });
};
const emptyStar = "/javascript-movie-review/images/star_empty.png";
const filledStar = "/javascript-movie-review/images/star_filled.png";
const starRatingElements = (myMovieRate) => {
  const $fragment = document.createDocumentFragment();
  getScoresArray().forEach((score, idx) => {
    const commonId = `rate-check-${idx}`;
    const $label = createElementWithAttributes({
      tag: "label",
      attributes: { for: commonId },
      children: [
        {
          tag: "img",
          id: `rate-img-${idx}`,
          className: "star",
          attributes: {
            src: myMovieRate >= Number.parseInt(score, 10) ? filledStar : emptyStar,
            alt: `${score}점`
          }
        }
      ]
    });
    const $input = createElementWithAttributes({
      tag: "input",
      id: commonId,
      className: "rate-check-input",
      attributes: {
        type: "radio",
        value: score,
        name: "rate"
      }
    });
    $fragment.append($label, $input);
  });
  return $fragment;
};
const handleMovieRateUpdate = ({
  movie,
  $movieRateStars,
  $movieRateBox
}) => {
  return (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const myMovieRates = moviesRatingLocalStorage.getDataFromLocalStorage() ?? {};
    const myMovieRate = myMovieRates[movie.id] || 0;
    const newMovieRate = Number.parseInt(event.target.value, 10);
    if (myMovieRate === newMovieRate) {
      return;
    }
    const newMovieRates = { ...myMovieRates, [movie.id]: newMovieRate };
    moviesRatingLocalStorage.setDataToLocalStorage(newMovieRates);
    const $images = $movieRateStars.querySelectorAll(".star");
    $images.forEach(($img, idx) => {
      $img.setAttribute(
        "src",
        newMovieRate >= (idx + 1) * 2 ? filledStar : emptyStar
      );
    });
    const $movieRateComments = $movieRateBox.querySelector(
      "#movie-rate-comments"
    );
    if (!$movieRateComments) {
      return;
    }
    $movieRateComments.textContent = `${getComment(
      newMovieRate
    )} (${newMovieRate}/10)`;
  };
};
const movieRateStars = (myMovieRate, movie, $movieRateBox) => {
  const $movieRateStars = createElementWithAttributes({
    tag: "div",
    className: "movie-rate-stars"
  });
  $movieRateStars.append(starRatingElements(myMovieRate));
  const updateMovieRate = handleMovieRateUpdate({
    movie,
    $movieRateStars,
    $movieRateBox
  });
  $movieRateStars.addEventListener("click", updateMovieRate);
  return $movieRateStars;
};
const movieRateBox = (movie) => {
  const $movieRateBox = createElementWithAttributes({
    tag: "div",
    className: "movie-rate-box"
  });
  const myMovieRates = moviesRatingLocalStorage.getDataFromLocalStorage() ?? {};
  const myMovieRate = myMovieRates[movie.id] || 0;
  const $movieRateStars = movieRateStars(myMovieRate, movie, $movieRateBox);
  const $movieRateComments = movieRateComments(myMovieRate);
  $movieRateBox.append($movieRateStars, $movieRateComments);
  return $movieRateBox;
};
const movieRateContainer = (movie) => {
  const $movieRateContainer = createElementWithAttributes({
    tag: "div",
    className: "movie-rate-container",
    children: [{ tag: "h3", textContent: "내 별점" }]
  });
  const $movieRateBox = movieRateBox(movie);
  $movieRateContainer.append($movieRateBox);
  return $movieRateContainer;
};
const movieDetailOverview = (movie) => {
  const $movieDetailOverview = createElementWithAttributes({
    tag: "div",
    className: "movie-detail-overview",
    children: [
      { tag: "hr" },
      { tag: "h3", textContent: "줄거리" },
      {
        tag: "p",
        className: "detail",
        textContent: movie.overview || "줄거리가 없습니다."
      }
    ]
  });
  return $movieDetailOverview;
};
const movieDetailDescription = (movie) => {
  const $movieDetailDescription = createElementWithAttributes({
    tag: "div",
    className: "modal-description",
    children: [
      {
        tag: "div",
        className: "modal-description-header",
        children: [
          { tag: "h2", textContent: movie.title },
          {
            tag: "p",
            className: "category",
            textContent: `${new Date(
              movie.release_date
            ).getFullYear()} · ${movie.genres.map((genre) => genre.name).join(", ")}`
          },
          {
            tag: "p",
            className: "rate",
            children: [
              {
                tag: "span",
                textContent: `평균`
              },
              {
                tag: "p",
                className: "average-rate-container",
                children: [
                  {
                    tag: "img",
                    className: "star",
                    attributes: { src: "./images/star_filled.png" }
                  },
                  {
                    tag: "span",
                    textContent: `${movie.vote_average.toFixed(1).toString()}`
                  }
                ]
              }
            ]
          },
          { tag: "hr" }
        ]
      }
    ]
  });
  $movieDetailDescription.append(
    movieRateContainer(movie),
    movieDetailOverview(movie)
  );
  return $movieDetailDescription;
};
const movieDetailInfo = (movie) => {
  const $movieDetailInfo = createElementWithAttributes({
    tag: "div",
    id: "modal-container",
    className: "modal-container",
    children: [
      {
        tag: "div",
        className: "modal-image",
        children: [
          {
            tag: "img",
            attributes: {
              src: movie.poster_path === null ? noImage : `https://image.tmdb.org/t/p/w440_and_h660_face${movie.poster_path}`
            }
          }
        ]
      }
    ]
  });
  $movieDetailInfo.append(movieDetailDescription(movie));
  return $movieDetailInfo;
};
const updateMovieDetailModal = async (event) => {
  if (!event.target || event.currentTarget === event.target) {
    return false;
  }
  if (event.target instanceof HTMLElement === false) {
    return false;
  }
  const $movieItem = event.target.closest("li");
  if (!$movieItem) {
    return false;
  }
  const movieDetail = await fetchMovieDetail($movieItem.id);
  const $newMovieDetailInfo = movieDetailInfo(movieDetail);
  const $movieDetailInfo = $("#modal-container");
  if (!$movieDetailInfo) {
    return false;
  }
  $movieDetailInfo.replaceWith($newMovieDetailInfo);
  return true;
};
const openMovieDetailInfo = async (event) => {
  const isUpdateCompleted = await updateMovieDetailModal(event);
  if (!isUpdateCompleted) {
    return;
  }
  showMovieDetailModal();
};
const movieList = (movies) => {
  const $movieList = createElementWithAttributes({
    tag: "ul",
    className: "thumbnail-list"
  });
  const $movieItems = movies.map((movie) => movieItem(movie));
  $movieList.append(...$movieItems);
  $movieList.addEventListener("click", openMovieDetailInfo);
  return $movieList;
};
const hideSkeletonContainer = () => {
  const $skeleton = $(".skeleton-container");
  if (!$skeleton) {
    return;
  }
  $skeleton.remove();
};
const skeletonContainer = (count) => {
  const $skeletonContainer = createElementWithAttributes({
    tag: "section",
    className: "skeleton-container",
    children: [
      {
        tag: "ul",
        className: "skeleton-thumbnail-list",
        children: Array.from({ length: count }, () => ({
          tag: "li",
          className: "skeleton-movie",
          children: [
            {
              tag: "div",
              className: "skeleton skeleton-thumbnail"
            },
            {
              tag: "div",
              className: "skeleton skeleton-desc"
            }
          ]
        }))
      }
    ]
  });
  return $skeletonContainer;
};
const skeletonContainerTitle = () => {
  return createElementWithAttributes({
    tag: "p",
    className: "skeleton-container-title-box",
    children: [
      {
        tag: "h2",
        className: "skeleton skeleton-container-title"
      }
    ]
  });
};
const showSkeletonContainer = ($targetElement, hasSkeletonTitle = false) => {
  if (!$targetElement) {
    return;
  }
  const $skeleton = skeletonContainer(20);
  if (hasSkeletonTitle) {
    $skeleton.prepend(skeletonContainerTitle());
  }
  $targetElement.append($skeleton);
};
const createObserver = ({ callback, options }) => {
  let observer = new IntersectionObserver(callback, options);
  const observeTarget = (target) => {
    if (!observer) return;
    observer.observe(target);
  };
  const unObserveTarget = (target) => {
    if (!observer) return;
    observer.unobserve(target);
  };
  const disconnect = () => {
    if (!observer) return;
    observer.disconnect();
  };
  return { observeTarget, unObserveTarget, disconnect };
};
const setupSeeMoreMoviesHandler = ({
  $movieList,
  $seeMoreButton,
  loadMoreCallback
}) => {
  const observer = createObserver({
    options: {
      root: document.querySelector(".movie-container"),
      rootMargin: "0px",
      threshold: 0.25
    },
    callback: async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        await seeMoreMovies();
      }
    }
  });
  observer.observeTarget($seeMoreButton);
  const MAX_PAGES = 500;
  let pageNumber = 1;
  const seeMoreMovies = async () => {
    pageNumber += 1;
    showSkeletonContainer($movieList);
    const { results, total_pages } = await loadMoreCallback(pageNumber);
    if (pageNumber === total_pages || pageNumber === MAX_PAGES) {
      observer.unObserveTarget($seeMoreButton);
      observer.disconnect();
      $seeMoreButton.removeEventListener("click", seeMoreMovies);
      $seeMoreButton.remove();
    }
    hideSkeletonContainer();
    const $newMovieList = movieList(results);
    $movieList.append(...$newMovieList.children);
  };
};
const seeMoreButton = ($movieList, loadMoreCallback) => {
  const $seeMoreButton = createElementWithAttributes({
    tag: "button",
    textContent: "더보기",
    className: "see-more"
  });
  setupSeeMoreMoviesHandler({
    $movieList,
    loadMoreCallback,
    $seeMoreButton
  });
  return $seeMoreButton;
};
const movieContainer = ({
  movieListTitle,
  movieData: { results, page, total_pages, total_results },
  loadMoreCallback
}) => {
  const $movieContainer = createElementWithAttributes({
    tag: "section",
    className: "movie-container",
    children: [
      {
        tag: "h2",
        textContent: movieListTitle
      }
    ]
  });
  if (total_results === 0) {
    const $noSearchContainer = createElementWithAttributes({
      tag: "div",
      className: "no_search_container",
      children: [
        {
          tag: "img",
          className: "no_search_result_img",
          attributes: {
            src: "./images/no_search_result.png",
            alt: "검색 결과가 없습니다."
          }
        },
        {
          tag: "h3",
          textContent: "검색 결과가 없습니다.",
          className: "no_search_result_text"
        }
      ]
    });
    $movieContainer.append($noSearchContainer);
    return $movieContainer;
  }
  const $movieList = movieList(results);
  const $seeMoreButton = seeMoreButton($movieList, loadMoreCallback);
  $movieContainer.append($movieList);
  if (page !== total_pages) {
    $movieContainer.append($seeMoreButton);
  }
  return $movieContainer;
};
const fetchPopularMovies = async (page = 1) => {
  const response = await tmdbApi("/movie/popular", "GET", {
    language: "ko-KR",
    page
  });
  return response;
};
const createMovieDisplay$1 = async ($main) => {
  const { results, page, total_pages, total_results } = await fetchPopularMovies();
  const loadMoreCallback = async (pageNumber) => await fetchPopularMovies(pageNumber);
  const $movieContainer = movieContainer({
    movieListTitle: "지금 인기 있는 영화",
    movieData: { results, page, total_pages, total_results },
    loadMoreCallback
  });
  $main == null ? void 0 : $main.append($movieContainer);
};
const initializeMovie = async () => {
  const $main = $("main");
  showSkeletonContainer($main, true);
  await createMovieDisplay$1($main);
  hideSkeletonContainer();
};
const fetchSearchedMovies = async (searchKeyword, page = 1) => {
  const response = await tmdbApi("/search/movie", "GET", {
    language: "ko-KR",
    page,
    query: searchKeyword
  });
  return response;
};
const handleSearchFormSubmit = (event) => {
  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  event.preventDefault();
  const formData = new FormData(event.target);
  const searchKeyword = formData.get("search-bar");
  if (typeof searchKeyword !== "string" || searchKeyword.trim() === "") {
    return null;
  }
  return searchKeyword;
};
const initializeSearchUI = ($main) => {
  var _a;
  hideBackgroundContainer();
  (_a = $(".container")) == null ? void 0 : _a.classList.add("no-background-container");
  $main == null ? void 0 : $main.replaceChildren();
};
const createMovieDisplay = async (searchKeyword, $main) => {
  const { results, page, total_pages, total_results } = await fetchSearchedMovies(searchKeyword);
  const loadMoreCallback = async (pageNumber) => await fetchSearchedMovies(searchKeyword, pageNumber);
  const $searchedMovieContainer = movieContainer({
    movieListTitle: `"${searchKeyword}" 검색 결과`,
    movieData: { results, page, total_pages, total_results },
    loadMoreCallback
  });
  $main == null ? void 0 : $main.append($searchedMovieContainer);
};
const searchMovie = async (event) => {
  try {
    const searchKeyword = handleSearchFormSubmit(event);
    if (!searchKeyword) {
      return;
    }
    const $main = $("main");
    initializeSearchUI($main);
    showSkeletonContainer($main, true);
    await createMovieDisplay(searchKeyword, $main);
    hideSkeletonContainer();
  } catch (error) {
    showErrorContainer(error);
  }
};
const closeMovieDetailModal = () => {
  const $movieDetailModal = $("#movie-detail-modal");
  if (!$movieDetailModal || $movieDetailModal instanceof HTMLDialogElement === false) {
    return;
  }
  $movieDetailModal.close();
};
const addCloseEventOnModalBackground = () => {
  const $movieDetailModal = $("#movie-detail-modal");
  const closeModal = (event) => {
    if (event.target === $movieDetailModal) {
      closeMovieDetailModal();
    }
  };
  if (!$movieDetailModal || $movieDetailModal instanceof HTMLDialogElement === false) {
    return;
  }
  $movieDetailModal.addEventListener("click", closeModal);
};
const addCloseEventOnModalButton = () => {
  const $closeMovieDetailModalButton = $("#close-modal");
  if ($closeMovieDetailModalButton) {
    $closeMovieDetailModalButton.addEventListener(
      "click",
      closeMovieDetailModal
    );
  }
};
const initializeCloseMovieDetailModal = () => {
  addCloseEventOnModalBackground();
  addCloseEventOnModalButton();
};
const main = async () => {
  try {
    const $header = $("header");
    showBackgroundContainer($header);
    await initializeMovie();
    const $searchBar = $("#search-bar-container");
    $searchBar == null ? void 0 : $searchBar.addEventListener("submit", searchMovie);
    initializeCloseMovieDetailModal();
  } catch (error) {
    showErrorContainer(error);
  }
};
main();
