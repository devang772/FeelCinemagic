import axios from 'axios';
import Movie from '../models/Movie.js';
import { verifyToken } from '@clerk/express';

export const getNowPlayingMovies = async (req, res) => {
  try {
    const {data} = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
      },
    })

    const movies = data.results;
    res.json({success: true, movies: movies});
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    res.json({success: false, message: error.message});
  }
}

//API to add a new show to a database
export const addShow = async (req, res) => {
   try {
     const {movieId, showInput, showPrice} = req.body;

     let movie = await Movie.findById(movieId);

      if(!movie) {
        const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
          }),

          axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
          })
        ]);

        const movieApiData = movieDetailsResponse.data;
        const movieCreditsData = movieCreditsResponse.data;

        const movieDetails = {
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
        }

        // Add movie to the database
        movie = await Movie.create(movieDetails);
      }

      const showToCreate = [];
      showInput.forEach((show) => {
        const showData = show.date;
        show.time.forEach((time)=>{
          const dateTimeString = `${showData}T${time}`;
          showToCreate.push({
            movie: movie._id,
            showDateTime: new Date(dateTimeString),
          })
        })
      });


   } catch (error) {
      console.error('Error fetching now playing movies:', error);
      res.json({success: false, message: error.message});
   }
}