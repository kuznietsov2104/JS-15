const API_URL = "https://www.omdbapi.com/?i=tt3896198&apikey=ec1e8e77";

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

  const poster = document.createElement("img");

  poster.src =
    movie.Poster !== "N/A"
      ? movie.Poster
      : "https://placehold.co/300x450?text=No+Poster";

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

async function searchMovies(query) {
  const currentRequest = ++requestNumber;

  try {
    showMessage("Searching...");

    const responce = await fetch(`${API_URL}&s=${encodeURIComponent(query)}`);

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
