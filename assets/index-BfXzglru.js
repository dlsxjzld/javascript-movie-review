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
const getPopularMovies = async (page = 1) => {
  const url = `https://api.themoviedb.org/3/movie/popular?language=ko-KR&page=${page}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2NlOWYwOTc1NzY1ZjZkYjVmMzhlYWJkYTU3YmY4YyIsIm5iZiI6MTc0MjI2MjUwNi4yNjU5OTk4LCJzdWIiOiI2N2Q4ZDBlYTAwOWVhNjJiZGFlZWEwMDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.IaRoj_pm6ULc6XauMWFsROQxyJmjq8M029BDvv0H2Gc"}`
    }
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error("성공적으로 받아오지 못했습니다.");
    }
    const response = await res.json();
    return response ?? {
      results: [],
      page: 1,
      total_pages: 1,
      total_results: 0
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
const getSearchedMovies = async (searchKeyword, pageNumber = 1) => {
  const query = encodeURIComponent(searchKeyword);
  const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=ko-KR&page=${pageNumber}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2NlOWYwOTc1NzY1ZjZkYjVmMzhlYWJkYTU3YmY4YyIsIm5iZiI6MTc0MjI2MjUwNi4yNjU5OTk4LCJzdWIiOiI2N2Q4ZDBlYTAwOWVhNjJiZGFlZWEwMDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.IaRoj_pm6ULc6XauMWFsROQxyJmjq8M029BDvv0H2Gc"}`
    }
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error("성공적으로 받아오지 못했습니다.");
    }
    const response = await res.json();
    return response ?? {
      results: [],
      page: 1,
      total_pages: 1,
      total_results: 0
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
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
const backgroundContainer = createElementWithAttributes({
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
              className: "primary detail",
              textContent: "자세히 보기"
            }
          ]
        }
      ]
    }
  ]
});
const noImage = "/javascript-movie-review/images/no_image.png";
const movieItem = (movie) => {
  return {
    tag: "li",
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
                textContent: String(movie.vote_average)
              }
            ]
          },
          { tag: "strong", textContent: movie.title }
        ]
      }
    ]
  };
};
const movieList = (movies) => {
  const $movieList = createElementWithAttributes({
    tag: "ul",
    className: "thumbnail-list",
    children: movies.map((movie) => movieItem(movie))
  });
  return $movieList;
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
const MAX_PAGES = 500;
const movieContainer = (movieListTitle, movieData, loadMoreCallback) => {
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
  const { results, total_pages, total_results } = movieData;
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
  const $seeMoreButton = createElementWithAttributes({
    tag: "button",
    textContent: "더보기",
    className: "see-more"
  });
  let pageNumber = 1;
  $seeMoreButton.addEventListener("click", async () => {
    pageNumber += 1;
    const $skeleton = skeletonContainer(20);
    $movieContainer.insertBefore($skeleton, $seeMoreButton);
    const { results: results2, total_pages: total_pages2 } = await loadMoreCallback(pageNumber);
    if (pageNumber === total_pages2 || pageNumber === MAX_PAGES) {
      $seeMoreButton.remove();
    }
    $skeleton.remove();
    const $newMovieList = movieList(results2);
    $movieList.append(...$newMovieList.children);
  });
  $movieContainer.append($movieList);
  if (pageNumber !== total_pages) {
    $movieContainer.append($seeMoreButton);
  }
  return $movieContainer;
};
const skeletonContainerTitle = () => {
  return createElementWithAttributes({
    tag: "h2",
    className: "skeleton skeleton-container-title"
  });
};
function $(selector, scope = document) {
  if (!selector) throw new Error("No selector provided");
  return scope.querySelector(selector);
}
const onSearch = async (event) => {
  var _a;
  if (!(event.target instanceof HTMLFormElement)) return;
  event.preventDefault();
  try {
    const formData = new FormData(event.target);
    const searchKeyword = formData.get("search-bar");
    if (typeof searchKeyword === "string") {
      const $main = $("main");
      (_a = $(".movie-container")) == null ? void 0 : _a.remove();
      const $skeleton = skeletonContainer(20);
      $skeleton.prepend(skeletonContainerTitle());
      $main == null ? void 0 : $main.append($skeleton);
      const { results, page, total_pages, total_results } = await getSearchedMovies(searchKeyword);
      $skeleton.remove();
      const loadMoreCallback = async (pageNumber) => await getSearchedMovies(searchKeyword, pageNumber);
      const $searchedMovieContainer = movieContainer(
        `"${searchKeyword}" 검색 결과`,
        { results, page, total_pages, total_results },
        loadMoreCallback
      );
      $main == null ? void 0 : $main.append($searchedMovieContainer);
    }
  } catch (error) {
    if (error instanceof Error) {
      const $main = $("main");
      $main == null ? void 0 : $main.replaceChildren();
      const $backgroundContainer = $(".background-container");
      $backgroundContainer == null ? void 0 : $backgroundContainer.remove();
      const $errorContainer = createElementWithAttributes({
        tag: "div",
        className: "error-container",
        children: [
          { tag: "h1", textContent: `${error.message} 새로고침 해주세요!` }
        ]
      });
      $main == null ? void 0 : $main.append($errorContainer);
    }
  }
};
const initializeMovie = async () => {
  const $main = $("main");
  const $skeleton = skeletonContainer(20);
  $skeleton.prepend(skeletonContainerTitle());
  $main == null ? void 0 : $main.append($skeleton);
  const { results, page, total_pages, total_results } = await getPopularMovies();
  $skeleton.remove();
  const loadMoreCallback = async (pageNumber) => await getPopularMovies(pageNumber);
  const $movieContainer = movieContainer(
    "지금 인기 있는 영화",
    { results, total_pages, total_results },
    loadMoreCallback
  );
  $main == null ? void 0 : $main.append($movieContainer);
};
const $header = $("header");
$header == null ? void 0 : $header.append(backgroundContainer);
try {
  initializeMovie();
  const $searchBar = $("#search-bar-container");
  $searchBar == null ? void 0 : $searchBar.addEventListener("submit", onSearch);
} catch (error) {
  if (error instanceof Error) {
    const $main = $("main");
    $main == null ? void 0 : $main.replaceChildren();
    const $backgroundContainer = $(".background-container");
    $backgroundContainer == null ? void 0 : $backgroundContainer.remove();
    const $errorContainer = createElementWithAttributes({
      tag: "div",
      className: "error-container",
      children: [
        { tag: "h1", textContent: `${error.message} 새로고침 해주세요!` }
      ]
    });
    $main == null ? void 0 : $main.append($errorContainer);
  }
}
