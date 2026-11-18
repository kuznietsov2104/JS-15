// const API_URL = "https://www.omdbapi.com/?i=tt3896198&apikey=ec1e8e77";
const API_URL = "https://www.omdbapi.com/";
const API_KEY = "ec1e8e77";

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

let debounceTimeout;
let requestNumber = 0;

function showMessage(message) {
  results.innerHTML = "";

  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  paragraph.classList.add("message");

  results.appendChild(paragraph);
}

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.classList.add("movie-card");
  card.dataset.imdbId = movie.imdbID;
  card.style.cursor = "pointer";

  const poster = document.createElement("img");

  poster.src =
    movie.Poster !== "N/A"
      ? movie.Poster
      : "https://placehold.co/300x450?text=No+Poster";

  poster.onerror = () => {
    poster.onerror = null;
    poster.src = "https://placehold.co/300x450?text=No+Poster";
  };

  poster.alt = movie.Title;

  const info = document.createElement("div");
  info.classList.add("movie-info");

  const title = document.createElement("h3");
  title.textContent = movie.Title;

  const year = document.createElement("p");
  year.textContent = `Year: ${movie.Year}`;

  const type = document.createElement("p");
  type.textContent = `Type: ${movie.Type}`;

  info.append(title, year, type);
  card.append(poster, info);

  return card;
}

function renderMovies(movies) {
  results.innerHTML = "";

  movies.forEach((movie) => {
    const card = createMovieCard(movie);
    results.appendChild(card);
  });
}

results.addEventListener("click", (event) => {
  const card = event.target.closest(".movie-card");

  if (!card) return;

  const imdbID = card.dataset.imdbId;

  const title = card.querySelector("h3").textContent;

  getMovieDetails(imdbID);
});

const modal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModalButton = document.getElementById("closeModal");

function renderMovieDetails(movie) {
  modalBody.innerHTML = "";

  const details = document.createElement("div");
  details.classList.add("movie-details");

  const poster = document.createElement("img");

  poster.src =
    movie.Poster !== "N/A"
      ? movie.Poster
      : "https://placehold.co/300x450?text=No+Poster";

  // poster.onerror = () => {
  //   poster.onerror = null;
  //   poster.src = "https://placehold.co/300x450?text=No+Poster";
  // };

  poster.alt = movie.Title;

  const info = document.createElement("div");
  info.classList.add("details-info");

  const title = document.createElement("h2");
  title.textContent = movie.Title;

  function createDetail(label, value) {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;

    paragraph.append(
      strong,
      document.createTextNode(value || "No data available"),
    );

    return paragraph;
  }

  info.append(
    title,
    createDetail("Year", movie.Year),
    createDetail("Genre", movie.Genre),
    createDetail("Director", movie.Director),
    createDetail("Actors", movie.Actors),
    createDetail("Runtime", movie.Runtime),
    createDetail("IMDb Rating", movie.imdbRating),
    createDetail("Plot", movie.Plot),
  );

  details.append(poster, info);
  modalBody.append(details);
}

async function getMovieDetails(imdbID) {
  try {
    modal.classList.add("active");
    modalBody.textContent = "Loading...";

    const params = new URLSearchParams({
      apikey: API_KEY,
      i: imdbID,
      plot: "full",
    });

    const url = `${API_URL}?${params}`;

    const response = await fetch(url);

    const movie = await response.json();

    if (movie.Response === "False") {
      throw new Error(movie.Error);
    }

    renderMovieDetails(movie);
  } catch (error) {
    console.error("Error:", error);
    modalBody.textContent = `Error: ${error.message}`;
  }
}

function hideModal() {
  modal.classList.remove("active");
}

closeModalButton.addEventListener("click", hideModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    hideModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideModal();
  }
});

async function searchMovies(query) {
  const currentRequest = ++requestNumber;

  try {
    showMessage("Searching...");

    const responce = await fetch(
      `${API_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`,
    );

    if (!responce.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await responce.json();

    if (currentRequest !== requestNumber) return;

    if (data.Response === "False") {
      showMessage("No movies found.");
      return;
    }

    renderMovies(data.Search);
  } catch (error) {
    if (currentRequest !== requestNumber) return;

    console.error(error);
    showMessage("An error occurred while searching for movies.");
  }
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  clearTimeout(debounceTimeout);

  if (query.length < 2) {
    requestNumber++;
    showMessage("Please enter at least 2 characters.");
    return;
  }

  debounceTimeout = setTimeout(() => {
    searchMovies(query);
  }, 400);
});

showMessage("Let's find a movie!");
