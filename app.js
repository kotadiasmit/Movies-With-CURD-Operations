const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Running server http://localhost:3000"));
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get/Return a list of all movie names in the movie table//
app.get("/movies/", async (request, response) => {
  const allMoviesNameQuery = `
    SELECT movie_name FROM movie`;
  const allMoviesNames = await db.all(allMoviesNameQuery);
  console.log(allMoviesNames);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };

  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = allMoviesNames.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});

//Create new movie in movie table.`movie_id` is auto-incremented//
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},"${movieName}", "${leadActor}")`;
  const addMovieDetail = await db.run(addMovieQuery);
  console.log(addMovieDetail);
  response.send("Movie Successfully Added");
});

//GeT/Return a movie based on the movie ID//
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieDetailQuery = `
    SELECT * 
    FROM movie
    WHERE 
    movie_id = ${movieId}`;
  const movieDetail = await db.get(getMovieDetailQuery);
  let camelCaseDetails = {
    movieId: movieDetail.movie_id,
    directorId: movieDetail.director_id,
    movieName: movieDetail.movie_name,
    leadActor: movieDetail.lead_actor,
  };
  response.send(camelCaseDetails);
});

//Update the movie details in movie table based on movie ID//
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updateMovieDetails;
  const updateMovieQuery = `
   UPDATE movie
    SET 
        director_id = ${directorId},
        movie_name = "${movieName}",
        lead_actor = "${leadActor}"
    WHERE movie_id=${movieId}
    `;
  const updatedMovieDetail = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie from movie table based on movie Id//
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}`;
  const deletedMovie = await db.run(deleteQuery);
  response.send("Movie Removed");
});

//Return a list of all directors in the director table//
app.get("/directors/", async (request, response) => {
  const listOfAllDirectors = `
    SELECT * 
    FROM director;`;
  const allDirectorArray = await db.all(listOfAllDirectors);

  /*Convert this database object into the response 
  object by the function convertDbObjectToResponseObject*/
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };

  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = allDirectorArray.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});

//Return a list of all movie names directed by a specific director//
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const allMoviesNameQuery = `
    SELECT movie_name FROM movie NATURAL JOIN director
    WHERE director_id=${directorId}
    `;
  const allMoviesNames = await db.all(allMoviesNameQuery);
  console.log(allMoviesNames);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = allMoviesNames.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});
module.exports = app;
