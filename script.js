const $theaterSelect = $('#theaterSelect');
const $searchInput = $('#searchInput');
const $movieContainer = $('#movieContainer');
const $dateInput = $('#dateInput');

let moviesData = [];


function fetchXML(url) {
  return $.ajax({
    url: url,
    method: 'GET',
    dataType: 'xml',
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("Virhe ladattaessa XML-tiedostoa:", errorThrown);
    alert("Tietojen lataaminen epäonnistui.");
  });
}

function loadTheaters() {
  fetchXML('https://www.finnkino.fi/xml/TheatreAreas')
    .done(function (xml) {
      const $areas = $(xml).find('TheatreArea');
      $theaterSelect.empty().append('<option value="">Valitse teatteri</option>');

      $areas.each(function () {
        const id = $(this).find('ID').text();
        const name = $(this).find('Name').text();
        $theaterSelect.append(`<option value="${id}">${name}</option>`);
      });
    });
}


function loadMovies(theaterId, date) {
  if (!theaterId) return;

  const url = `https://www.finnkino.fi/xml/Schedule/?area=${theaterId}&dt=${date}`;
  fetchXML(url)
    .done(function (xml) {
      const $shows = $(xml).find('Show');

      moviesData = $shows.map(function () {
        return {
          title: $(this).find('Title').text(),
          image: $(this).find('EventLargeImagePortrait').text(),
          genres: $(this).find('Genres').text() || "Unknown",
          theater: $(this).find('Theatre').text(),
          startTime: new Date($(this).find('dttmShowStart').text()).toLocaleString(),
        };
      }).get();

      displayMovies(moviesData);
    });
}


function displayMovies(movies) {
  const searchTerm = $searchInput.val().toLowerCase();
  const filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(searchTerm));

  $movieContainer.fadeOut(200, function () {
    $movieContainer.empty();

    if (filteredMovies.length) {
      filteredMovies.forEach(movie => {
        const movieHTML = `
          <div class="movie">
            <img src="${movie.image}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p><strong>Genres:</strong> ${movie.genres}</p>
            <p><strong>Theater:</strong> ${movie.theater}</p>
            <p><strong>Showtime:</strong> ${movie.startTime}</p>
          </div>`;
        $movieContainer.append(movieHTML);
      });
    } else {
      $movieContainer.append('<p>No movies found.</p>');
    }

    $movieContainer.fadeIn(600);
  });
}

$(document).ready(function () {
  loadTheaters();

  $theaterSelect.on('change', function () {
    const theaterId = $(this).val();
    const selectedDate = $dateInput.val() || new Date().toISOString().split('T')[0];
    loadMovies(theaterId, selectedDate);
  });

  $dateInput.on('change', function () {
    const theaterId = $theaterSelect.val();
    const selectedDate = $(this).val();
    if (theaterId) {
      loadMovies(theaterId, selectedDate);
    }
  });

  $searchInput.on('input', function () {
    displayMovies(moviesData);
  });

  $dateInput.val(new Date().toISOString().split('T')[0]);
});
