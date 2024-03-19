// --- Styles --- //
const body = document.querySelector('body'),
      sidebar = body.querySelector('nav'),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".search-box"),
      modeSwitch = body.querySelector(".toggle-switch"),
      modeText = body.querySelector(".mode-text");


toggle.addEventListener("click" , () =>{
    sidebar.classList.toggle("close");
})

searchBtn.addEventListener("click" , () =>{
    sidebar.classList.remove("close");
})

modeSwitch.addEventListener("click" , () =>{
    body.classList.toggle("dark");
    
    if(body.classList.contains("dark")){
        modeText.innerText = "Light mode";
    }else{
        modeText.innerText = "Dark mode";
        
    }
});

// --- Moviedb --- //
const API_KEY = '98e245972c9741a999d5af3d7a0b0526';
const API_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API = `${API_URL}/search/movie?api_key=${API_KEY}&query=`;
const NO_IMAGE_PATH = 'img/noimageavailable.png';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const pagination = document.getElementById('pagination');
const genreDropdown = document.getElementById('genre');
const videoContainer = document.getElementById('video-container');
let currentPage = 1;

// Function to get videos for a specific movie
async function getVideos(movieId) {
  try {
      const videoUrl = `${API_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`;
      const response = await fetch(videoUrl);
      const videoData = await response.json();

        // Check if there are videos available
        if (videoData.results && videoData.results.length > 0) {
          const videoKey = videoData.results.length > 0 ? videoData.results[0].key : null;

          if (videoKey) {
              const videoFrame = document.createElement('iframe');
              videoFrame.src = `https://www.youtube.com/embed/${videoKey}?rel=0`;
              videoFrame.width = '560';
              videoFrame.height = '315';
              videoFrame.frameBorder = '0';
              videoFrame.allowFullscreen = true;
          
              videoContainer.innerHTML = ''; // Clear previous content
              videoContainer.appendChild(videoFrame);
          } else {
              console.log('No videos available for this movie.');
          }          

            // Create video player
            videoContainer.innerHTML = `
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoKey}" frameborder="0" allowfullscreen></iframe>
            `;
        } else {
          console.log('Video Data:', videoData); // Log the videoData
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
    }
}
  
// Function to fetch genre data and populate dropdown
async function fetchGenres() {
  try {
    const genreUrl = `${API_URL}/genre/movie/list?api_key=${API_KEY}&language=en`;
    const response = await fetch(genreUrl);
    const genreData = await response.json();
    populateGenreDropdown(genreData.genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

// Function to get movies
async function getMovies(page = 1, searchTerm = '', genreId = '') {
  try {
    let apiUrl = `${API_URL}/discover/movie?api_key=${API_KEY}&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&page=${page}`;

    if (searchTerm) {
      apiUrl = `${API_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}&page=${page}`;
    }

    if (genreId) {
      apiUrl += `&with_genres=${genreId}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    showMovies(data.results);
    showPagination(data.total_pages);

    // Fetch videos for each movie and display them
    for (const movie of data.results) {
      await displayMovieWithVideo(movie);
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
}

// Function to display a movie along with its video
async function displayMovieWithVideo(movie) {
  try {
    // Get videos for the current movie
    const videoKey = await getFirstVideoKey(movie.id);

    // Display the movie
    showSingleMovie(movie, videoKey);
  } catch (error) {
    console.error('Error displaying movie with video:', error);
  }
}

// Function to show a single movie along with its video
function showSingleMovie(movie, videoKey) {
  // (your existing code for displaying movies)

  // If there's a video key, attach a click event to the movie element
  if (videoKey) {
    const movieElement = document.getElementById(`movie-${movie.id}`);
    if (movieElement) {
      movieElement.addEventListener('click', () => {
        openTrailerPopup(videoKey);
      });
    }
  }

  // Add the call to getVideos here if you want to display videos on the main page
  getVideos(movie.id);
}

// Function to populate genre dropdown
function populateGenreDropdown(genres) {
  // Iterate over each genre in the provided array
  genreDropdown.innerHTML = '<option value="">Select Genre</option>';
  genres.forEach(genre => {
    // Create a new 'option' element
    const option = document.createElement('option');

    // Set the 'value' attribute of the option to the genre's id
    option.value = genre.id;

    // Set the text content of the option to the genre's name
    option.text = genre.name;

    // Append the newly created option to the genreDropdown
    genreDropdown.appendChild(option);
  });
}


// Function to show movies on the page
function showMovies(movies) {
  main.innerHTML = '';
  movies.forEach(movie => {
    const { id, title, poster_path, vote_average, overview } = movie;
    const roundedVote = parseFloat(vote_average).toFixed(1);

    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.id = `movie-${id}`; // Set the id attribute

    const imgTag = document.createElement('img');
    imgTag.alt = title;
    imgTag.src = poster_path ? `${IMG_PATH + poster_path}` : NO_IMAGE_PATH;

    imgTag.onerror = function () {
      imgTag.src = NO_IMAGE_PATH;
      imgTag.alt = 'No Image';
    };

    movieEl.innerHTML = `
      <div class="image-container">
        ${imgTag.outerHTML}
      </div>
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getClassByRate(roundedVote)}">${roundedVote}</span>
      </div>
      <div class="overview">
        <h3>Summary</h3>
        ${overview}
      </div>
    `;

    main.appendChild(movieEl);
  });
}

// Function to get the first video key for a movie
async function getFirstVideoKey(movieId) {
  try {
      const videoUrl = `${API_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`;
      const response = await fetch(videoUrl);
      const videoData = await response.json();

      if (videoData.results && videoData.results.length > 0) {
          return videoData.results[0].key;
      } else {
          return null;
      }
  } catch (error) {
      console.error('Error fetching video key:', error);
      return null;
  }
}

// Function to determine vote class
function getClassByRate(vote) {
  const voteNumber = parseFloat(vote);
  if (voteNumber >= 8) {
    return 'green';
  } else if (voteNumber >= 5) {
    return 'orange';
  } else {
    return 'red';
  }
}

// Function to create pagination button
function createPaginationButton(content) {
  const pageBtn = document.createElement('button');
  pageBtn.classList.add('pagination-btn');
  pageBtn.innerText = content;
  return pageBtn;
}

// Function to show pagination
function showPagination(totalPages) {
  pagination.innerHTML = '';

  const prevBtn = createPaginationButton('Previous');
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      getMovies(currentPage, search.value, genreDropdown.value);
    }
  });
  prevBtn.disabled = currentPage === 1;
  if (currentPage === 1) {
    prevBtn.classList.add('disabled');
  }
  pagination.appendChild(prevBtn);

  const maxVisiblePages = 5;
  const startPage = Math.max(1, currentPage - maxVisiblePages);
  const endPage = Math.min(totalPages, currentPage + maxVisiblePages);

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createPaginationButton(i);
    if (i === currentPage) {
      pageBtn.classList.add('current-page');
    }
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      getMovies(currentPage, search.value, genreDropdown.value);
    });
    pagination.appendChild(pageBtn);
  }

  const nextBtn = createPaginationButton('Next');
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      getMovies(currentPage, search.value, genreDropdown.value);
    }
  });

  // Disable the "Next" button if on the last page of search results
  nextBtn.disabled = currentPage === totalPages;
  if (currentPage === totalPages) {
    nextBtn.classList.add('disabled');
  }

  pagination.appendChild(nextBtn);
}

// Event listener for form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();
  const selectedGenre = genreDropdown.value;
  
  // Check if either the search term or genre is provided
  if (searchTerm || selectedGenre) {
      currentPage = 1;
      await getMovies(currentPage, searchTerm, selectedGenre);
  } else {
      getMovies(currentPage);
  }
});

// Function to open the trailer popup
function openTrailerPopup(videoKey) {
  const popupContainer = document.getElementById('popup-container');
  const videoFrame = document.getElementById('video-frame');
  const closePopupBtn = document.getElementById('close-popup');
  const body = document.body;

  videoFrame.src = `https://www.youtube.com/embed/${videoKey}?rel=0`;
  popupContainer.style.display = 'flex';
  body.classList.add('popup-open');

  // Close the popup when the close button is clicked
  closePopupBtn.addEventListener('click', () => {
      videoFrame.src = ''; // Clear the video source
      popupContainer.style.display = 'none';
      body.classList.remove('popup-open');
  });
}

// Attach click event listener to each movie element
main.addEventListener('click', (e) => {
  const movieElement = e.target.closest('.movie');

  if (movieElement) {
      const videoKey = movieElement.dataset.videoKey;

      if (videoKey) {
          openTrailerPopup(videoKey);
      } else {
          console.log('No trailer available for this movie.');
      }
  }
});

// Event listener for genre dropdown change
genreDropdown.addEventListener('change', () => {
  currentPage = 1;
  search.value = ''; // Reset the search input when the genre changes
  getMovies(currentPage, '', genreDropdown.value);
});

// Initial setup on page load
fetchGenres();
getMovies(currentPage);

// Back to Top Button Functionality
const backToTopBtn = document.getElementById('back-to-top-btn');

// Show or hide the button based on the user's scroll position
window.addEventListener('scroll', () => {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopBtn.style.display = 'block';
  } else {
    backToTopBtn.style.display = 'none';
  }
});

// Variable to track the requestAnimationFrame
let scrollAnimationId;

// Scroll to the top when the button is clicked
backToTopBtn.addEventListener('click', () => {
  if (!scrollAnimationId) {
    scrollAnimationId = requestAnimationFrame(function scrollToTop() {
      const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;

      if (currentScroll > 0) {
        window.scrollTo(0, currentScroll - 30);
        scrollAnimationId = requestAnimationFrame(scrollToTop);
      } else {
        cancelAnimationFrame(scrollAnimationId);
        scrollAnimationId = null;
      }
    });
  }
});

// Sticky Button Functionality
const stickyButton = document.getElementById('stickyButton');
const stickyImagePopup = document.getElementById('stickyImagePopup');
const closeStickyImage = document.getElementById('closeStickyImage');

stickyButton.addEventListener('click', () => {
    stickyImagePopup.style.display = 'block';
});

closeStickyImage.addEventListener('click', () => {
    stickyImagePopup.style.display = 'none';
});
