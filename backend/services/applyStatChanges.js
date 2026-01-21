import Player from "../models/playerModel.js";
import PlayerHistory from "../models/playerHistoryModel.js";
import Fixture from "../models/fixtureModel.js";
import Position from "../models/positionModel.js";
async function applyStatChanges(
  fixture,
  identifier,
  homeAway,
  player,
  newValue
) {
  let { teamHomeScore, teamAwayScore, matchday, _id } = fixture;
  // Score tracking to prevent over-counting
  let homeGoalDelta = 0;
  let awayGoalDelta = 0;
  let oldFixture = fixture;
  // Arrays for rollbacks
  let playerHistoryArray = [];
  let playerArray = [];
  let message = null;

  // Utility function for weighted points
  const getWeight = (identifier, code) => {
    const weightMap = {
      goalsScored: [10, 6, 5, 4, 0],
      cleansheets: [4, 4, 1, 0, 0],
      assists: 3,
      ownGoals: -2,
      penaltiesSaved: 5,
      penaltiesMissed: -2,
      yellowCards: -1,
      redCards: -3,
      saves: 0.5,
      starts: 2,
      bench: 1,
      bestPlayer: 3,
    };
    const value = weightMap[identifier];
    return Array.isArray(value) ? value[code - 1] || 0 : value || 0;
  };
  try {
    for (const playerId of player) {
      const playerFound = await Player.findById(playerId);
      if (!playerFound) {
        throw new Error("Player not found");
      }

      if (
        (homeAway === "home" &&
          playerFound.playerTeam.toString() !== fixture.teamHome.toString()) ||
        (homeAway === "away" &&
          playerFound.playerTeam.toString() !== fixture.teamAway.toString())
      ) {
        throw new Error("Player does not belong to the selected team");
      }

      const position = await Position.findOne(playerFound.playerPosition);
      const code = position.code;
      const retrievedPlayer = playerFound._id;
      const statArray = statBlock[homeAway];
      const playerIndex = statArray.findIndex(
        (x) => x.player.toString() === retrievedPlayer.toString()
      );
      const weight = getWeight(identifier, code);

      let totalPoints = weight * newValue;

      if (playerIndex !== -1) {
        const currentVal = +statArray[playerIndex].value;
        const updatedVal = currentVal + newValue;

        if (updatedVal < 0) {
          throw new Error("Stat value cannot be negative");
        }

        if (updatedVal === 0) {
          statArray.splice(playerIndex, 1);
        } else {
          statArray[playerIndex].value = updatedVal;
        }

        await PlayerHistory.findOneAndUpdate(
          { player: retrievedPlayer, fixture: _id },
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true, upsert: true }
        );
        playerHistoryArray.push(retrievedPlayer);

        await Player.findByIdAndUpdate(
          retrievedPlayer,
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true }
        );

        playerArray.push(retrievedPlayer);
      } else {
        if (newValue <= 0) {
          throw new Error("Stat value cannot be negative or 0");
        }

        statArray.push({ player: retrievedPlayer, value: newValue });

        await PlayerHistory.findOneAndUpdate(
          { player: retrievedPlayer, fixture: _id },
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true, upsert: true }
        );

        playerHistoryArray.push(retrievedPlayer);

        await Player.findByIdAndUpdate(
          retrievedPlayer,
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true }
        );
        playerArray.push(retrievedPlayer);
      }

      if (identifier === "goalsScored") {
        if (homeAway === "home") homeGoalDelta += newValue;
        if (homeAway === "away") awayGoalDelta += newValue;
      }

      if (identifier === "ownGoals") {
        if (homeAway === "home") awayGoalDelta += newValue;
        if (homeAway === "away") homeGoalDelta += newValue;
      }
    }

    fixture.teamHomeScore = teamHomeScore + homeGoalDelta;
    fixture.teamAwayScore = teamAwayScore + awayGoalDelta;

    const updatedFixture = await Fixture.findByIdAndUpdate(
      _id,
      fixture,
      {
        new: true,
      }
    );
   /* message = await setInitialPoints(
      req,
      res,
      "normal",
      _id,
      matchday,
      player
    );
    res.status(200).json({
      message: `Player Points Added and ${message.message}`,
      updatedFixture,
    });*/
  } catch (error) {
    let negativeValue = -newValue;
    if (playerHistoryArray.length) {
      for (const playerId of player) {
        const playerFound = await Player.findById(playerId);
        const position = await Position.findOne(playerFound.playerPosition);
        const code = position.code;
        const weight = getWeight(identifier, code);
        let totalPoints = weight * negativeValue;
        await PlayerHistory.findOneAndUpdate(
          { player: playerId, fixture: _id },
          { $inc: { [identifier]: negativeValue, totalPoints } },
          { new: true, upsert: true }
        );
      }
    }
    if (playerArray.length) {
      for (const playerId of player) {
        const playerFound = await Player.findById(playerId);
        const position = await Position.findOne(playerFound.playerPosition);
        const code = position.code;
        const weight = getWeight(identifier, code);
        let totalPoints = weight * negativeValue;
        await Player.findByIdAndUpdate(
          playerId,
          { $inc: { [identifier]: negativeValue, totalPoints } },
          { new: true }
        );
      }
    }

    /*if (message) {
      await setInitialPoints(req, res, "normal", _id, matchday);
    }*/

    await Fixture.findByIdAndUpdate(_id, oldFixture, {
      new: true,
    });
    /*res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });*/
  }
}

export { applyStatChanges };
