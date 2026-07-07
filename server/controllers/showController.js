import axios from 'axios';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

// ----------------------------------------------------------
// GET NOW PLAYING MOVIES (TMDB)
// ----------------------------------------------------------
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.themoviedb.org/3/movie/now_playing',
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );

    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------
// ADD SHOW
// ----------------------------------------------------------
export const addShow = async (req, res) => {
  try {
    const { movieId, showInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    // If movie does not exist in DB → fetch from TMDB
    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      movie = await Movie.create({
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || '',
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      });
    }

    // Format show timings
    const showsToCreate = [];

    showInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movie._id,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: 'Show added successfully.' });
  } catch (error) {
    console.error('Error adding show:', error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------
// GET ALL UPCOMING SHOWS (UNIQUE MOVIES)
// ----------------------------------------------------------
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .sort({ showDateTime: 1 })
      .populate('movie');

    // Remove duplicate movies
    const uniqueMoviesMap = new Map();

    shows.forEach((show) => {
      const movieId = show.movie._id.toString();
      if (!uniqueMoviesMap.has(movieId)) {
        uniqueMoviesMap.set(movieId, show.movie);
      }
    });

    res.json({
      success: true,
      shows: Array.from(uniqueMoviesMap.values()),
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------
// GET SINGLE MOVIE & ITS SHOWS
// ----------------------------------------------------------
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);

    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split('T')[0];

      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
