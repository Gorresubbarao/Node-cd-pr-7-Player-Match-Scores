const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketMatchDetails.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertPlayerDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}

const convertMatchDetailsDbObjectToResponseObject = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT
      *
    FROM
      player_details;`
  const playersArray = await database.all(getPlayerQuery)
  response.send(
    playersArray.map(eachPlayer =>
      convertPlayerDbObjectToResponseObject(eachPlayer),
    ),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      player_details 
    WHERE 
      player_id = ${playerId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertPlayerDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name ='${playerName}'
  WHERE
    player_id = ${playerId};`

  await database.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const matchDetailsQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id = ${matchId};`
  const matchDetails = await database.get(matchDetailsQuery)
  response.send(convertMatchDetailsDbObjectToResponseObject(matchDetails))
})

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerMatchesQuery = `
    SELECT
      *
    FROM player_match_score 
      NATURAL JOIN match_details
    WHERE
      player_id = ${playerId};`
  const playerMatches = await database.all(getPlayerMatchesQuery)
  response.send(
    playerMatches.map(eachMatch =>
      convertMatchDetailsDbObjectToResponseObject(eachMatch),
    ),
  )
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getMatchPlayersQuery = `
    SELECT
      *
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      match_id = ${matchId};`
  const playersArray = await database.all(getMatchPlayersQuery)
  response.send(
    playersArray.map(eachPlayer =>
      convertPlayerDbObjectToResponseObject(eachPlayer),
    ),
  )
})

app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const getmatchPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`
  const playersMatchDetails = await database.get(getmatchPlayersQuery)
  response.send(playersMatchDetails)
})

module.exports = app

// const express = require('express')
// const app = express()
// const sqlite3 = require('sqlite3')
// const {open} = require('sqlite')
// const path = require('path')
// const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
// app.use(express.json())

// let db = null

// const incializeDbAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     })
//     app.listen(3000, () => {
//       console.log('server started')
//     })
//   } catch (e) {
//     console.log(`DB error ${e.message}`)
//     process.exit(1)
//   }
// }
// incializeDbAndServer()

// // conver snakeCAse to CameCase OF PlayerDetailes
// function converSnakeCAseToCameCase(dbObject) {
//   return {
//     playerId: dbObject.player_id,
//     playerName: dbObject.player_name,
//   }
// }

// // conver snakeCAse to CameCase Of matchDetailes
// function converSnakeCAseToCameCaseOfMatchDetails(dbObject) {
//   return {
//     matchId: dbObject.match_id,
//     match: dbObject.match,
//     year: dbObject.year,
//   }
// }

// //Returns a list of all the players in the player table API 1
// app.get('/players/', async (request, response) => {
//   const getplayersQuery = `SELECT * FROM player_details ORDER BY player_id`
//   const players = await db.all(getplayersQuery)
//   console.log(players)
//   response.send(
//     players.map(eachPlayer => converSnakeCAseToCameCase(eachPlayer)),
//   )
// })

// //Returns a specific player based on the player ID Api 2
// app.get('/players/:playerId/', async (request, response) => {
//   const {playerId} = request.params
//   const getplayerQuery = `SELECT * FROM player_details WHERE player_id=${playerId}`
//   const player = await db.get(getplayerQuery)
//   console.log(player)
//   response.send(converSnakeCAseToCameCase(player))
// })

// //Updates the details of a specific player based on the player ID API 3
// app.put('/players/:playerId/', async (request, response) => {
//   const {playerId} = request.params
//   const playerDetails = request.body
//   const {playerName} = playerDetails
//   const udatePlayerQuery = `UPDATE player_details
//   SET
//   player_name='${playerName}'
//   WHERE player_id=${playerId}`
//   const player = await db.run(udatePlayerQuery)
//   console.log(player)
//   response.send('Player Details Updated')
// })

// //Returns the match details of a specific match Api 4
// app.get('/matches/:matchId/', async (request, response) => {
//   const {matchId} = request.params
//   const getMatchQuery = `SELECT * FROM match_details WHERE match_id = ${matchId}`
//   const matchDetails = await db.get(getMatchQuery)
//   console.log(matchDetails)
//   response.send(converSnakeCAseToCameCaseOfMatchDetails(matchDetails))
// })

// //Returns a list of all the matches of a player API 5
// app.get('/players/:playerId/matches', async (request, response) => {
//   const {playerId} = request.params
//   const getMatchesOfPlayerQuery = `SELECT * FROM player_match_score
//   NATURAL JOIN match_details
//   WHERE player_id = ${playerId}`
//   const playerMatches = await db.all(getMatchesOfPlayerQuery)
//   console.log(playerMatches)
//   response.send(
//     playerMatches.map(eachPlayer =>
//       converSnakeCAseToCameCaseOfMatchDetails(eachPlayer),
//     ),
//   )
// })

// // Returns a list of players of a specific match API 6
// app.get('/matches/:matchId/players', async (request, response) => {
//   const {matchId} = request.params
//   const getPlayersOfMatch = `SELECT * FROM player_match_score NATURAL JOIN player_details WHERE match_id=${matchId}`
//   const playersOfMatch = await db.all(getPlayersOfMatch)
//   console.log(playersOfMatch)
//   response.send(
//     playersOfMatch.map(eachPlayer => converSnakeCAseToCameCase(eachPlayer)),
//   )
// })
// /* Returns the statistics of the total score, fours,
// sixes of a specific player based on the player ID API 7 */
// app.get('/players/:playerId/playerScores', async (request, response) => {
//   const {playerId} = request.params
//   const getStatistictsQuery = `SELECT
//   player_details.player_id AS playerId,
//   player_details.player_name AS playerName,
//   SUM(player_match_score.score) AS totalScore,
//   SUM(player_match_score.fours) AS totalFours,
//   SUM(player_match_score.sixes) AS totalSixes
//   FROM player_match_score
//   INNER JOIN player_details
//   ON player_match_score.player_id =player_details.player_id
//   WHERE player_match_score.player_id = ${playerId}`
//   const stats = await db.get(getStatistictsQuery)
//   console.log(stats)
//   response.send(stats)
// })

// module.exports = app
