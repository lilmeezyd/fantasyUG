import React, { useMemo, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useGetQuery as useGetTeamsQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import usePlayerHistory from "../hooks/usePlayerHistory";
import useSafeFixtures from "../hooks/useSafeFixtures";
import { getPm, getPmString } from "../utils/getPm";

const PlayerInfo = (props) => {
  const { showPInfo, handleCloseInfo, player } = props;

  // Local UI state
  const [selectedFixtureId, setSelectedFixtureId] = useState(null);

  // Static data (can be hoisted to App for global loading/caching)
  const { data: teams } = useGetTeamsQuery(undefined, { skip: false });
  const { data: elementTypes } = useGetPositionsQuery(undefined, {
    skip: false,
  });
  const { data: matchdays } = useGetMatchdaysQuery(undefined, { skip: false });

  // Player-specific data
  const history = usePlayerHistory(player?._id);

  // Safe, memoized sorted fixtures array
  const fixtures = useSafeFixtures(player?.fixtures);

  // Derive player team and position safely
  const playerTeamName = useMemo(() => {
    if (!teams || !player) return "";
    return teams.find((t) => t._id === player.playerTeam)?.name || "";
  }, [teams, player]);

  const playerShortTeam = useMemo(() => {
    if (!teams || !player) return "";
    return teams.find((t) => t._id === player.playerTeam)?.shortName || "";
  }, [teams, player]);

  const playerPosition = useMemo(() => {
    if (!elementTypes || !player) return "";
    return (
      elementTypes.find((p) => p._id === player.playerPosition)?.singularName ||
      ""
    );
  }, [elementTypes, player]);

  // default selected fixture: first upcoming fixture or the first fixture from the list
  useEffect(() => {
    if (!fixtures || fixtures.length === 0) {
      setSelectedFixtureId(null);
      return;
    }

    // pick the first fixture that has a kickoff in the future, fallback to first fixture
    const upcoming = fixtures.find((f) => new Date(f.kickOffTime) > new Date());
    setSelectedFixtureId(
      upcoming?._id?.toString() || fixtures[0]._id?.toString()
    );
  }, [fixtures]);

  // Merge fixture + history for the selected fixture
  const selectedFixtureWithHistory = useMemo(() => {
    if (!selectedFixtureId) return null;
    const fixture =
      fixtures.find(
        (f) => f._id?.toString() === selectedFixtureId?.toString()
      ) || null;
    const hist =
      history?.find(
        (h) => h.fixture?.toString() === selectedFixtureId?.toString()
      ) || null;
    // prefer history values when available
    return fixture ? { ...fixture, ...(hist || {}) } : hist || null;
  }, [selectedFixtureId, fixtures, history]);

  // defensive rendering helpers
  const getTeamShortName = (teamId) =>
    teams?.find((t) => t._id === teamId)?.shortName || "";
  const getTeamFullName = (teamId) =>
    teams?.find((t) => t._id === teamId)?.name || "";

  return (
    <>
      <Modal show={showPInfo} onHide={handleCloseInfo}>
        <Modal.Header style={{ background: "aquamarine" }} closeButton>
          <Modal.Title style={{ fontWeight: 500 }}>
            <div className="namesection">
              <span>
                {player?.firstName} {player?.secondName}
              </span>
              <span>{playerPosition}</span>
              <div className="player-info-img">
                <div className="ticker-image">
                  {playerShortTeam && (
                    <img src={`../${playerShortTeam}.png`} alt="logo" />
                  )}
                </div>
                <span>{playerTeamName}</span>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="player-info-data">
            <div className="player-info-data-t">
              <div className="player-info-data-h">Selected By</div>
              <div>{player?.ownership}%</div>
            </div>
            <div className="player-info-data-t">
              <div className="player-info-data-h">Total</div>
              <div>{player?.totalPoints}pts</div>
            </div>
            <div className="player-info-data-t">
              <div className="player-info-data-h">Price</div>
              <div>{player?.nowCost?.toFixed(1)}</div>
            </div>
          </div>
          <div className="player-info-wrapper">
            <div className="games-info-fixtures">
              <div className="playerInfoFix">
                {fixtures.map((f, idx) => {
                  const teamImg =
                    player?.playerTeam === f.teamAway
                      ? getTeamShortName(f.teamHome)
                      : getTeamShortName(f.teamAway);
                  const isSelected =
                    selectedFixtureId?.toString() === f._id?.toString();
                  return (
                    <div
                      key={f._id ?? idx}
                      className="playerFix"
                      onClick={() => setSelectedFixtureId(f._id?.toString())}
                      style={{
                        border: isSelected ? "none" : undefined,
                        background: isSelected ? "aquamarine" : undefined,
                      }}
                    >
                      <div className="ticker-image">
                        {teamImg && (
                          <img src={`../${teamImg}.png`} alt="logo" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedFixtureWithHistory && (
              <div className="player-info-3">
                <>
                  <div>
                    {matchdays?.find(
                      (m) => m._id === selectedFixtureWithHistory.matchday
                    )?.name || ""}
                  </div>
                  <div className="pf">
                    <div>
                      {player?.playerTeam ===
                      selectedFixtureWithHistory?.teamAway
                        ? getTeamFullName(selectedFixtureWithHistory?.teamHome)
                        : getTeamFullName(selectedFixtureWithHistory?.teamAway)}
                    </div>
                    <div>
                      {player?.playerTeam ===
                      selectedFixtureWithHistory?.teamHome
                        ? "Home"
                        : "Away"}
                    </div>
                  </div>
                  {(typeof selectedFixtureWithHistory?.teamHomeScore === 'number' && typeof selectedFixtureWithHistory?.teamAwayScore === 'number') && (
                <div>
                  <div>
                    {selectedFixtureWithHistory.teamHomeScore} : {selectedFixtureWithHistory.teamAwayScore}
                  </div>
                </div>
              )}
                  {selectedFixtureWithHistory?.kickOffTime && (
                <div>
                  <div>{new Date(selectedFixtureWithHistory.kickOffTime).toDateString()}</div>
                  <div>{getPmString(selectedFixtureWithHistory.kickOffTime)}{getPm(selectedFixtureWithHistory.kickOffTime)}</div>
                </div>
              )}
                </>

                {selectedFixtureWithHistory?.stats?.length > 0 && (
                  <div className="player-info-1">
                    <div className="player-info-2">
                      <div>Points</div>
                      <div>{selectedFixtureWithHistory.totalPoints ?? 0}</div>
                    </div>
                    {selectedFixtureWithHistory.goalsScored ? (
                    <div className="player-info-2">
                      <div>Goals</div>
                      <div>{selectedFixtureWithHistory.goalsScored}</div>
                    </div>
                  ) : null}
                    {selectedFixtureWithHistory.assists ? (
                    <div className="player-info-2">
                      <div>Assists</div>
                      <div>{selectedFixtureWithHistory.assists}</div>
                    </div>
                  ) : null}
                    {selectedFixtureWithHistory.bestPlayer ? (
                    <div className="player-info-2">
                      <div>Man of the match</div>
                      <div>{selectedFixtureWithHistory.bestPlayer}</div>
                    </div>
                  ) : null}
                    {selectedFixtureWithHistory.yellowCards ? (
                    <div className="player-info-2">
                      <div>Yellow card</div>
                      <div>{selectedFixtureWithHistory.yellowCards}</div>
                    </div>
                  ) : null}
                    {selectedFixtureWithHistory.redCards ? (
                    <div className="player-info-2">
                      <div>Red card</div>
                      <div>{selectedFixtureWithHistory.redCards}</div>
                    </div>
                  ) : null}

                  {selectedFixtureWithHistory.ownGoals ? (
                    <div className="player-info-2">
                      <div>Own goals</div>
                      <div>{selectedFixtureWithHistory.ownGoals}</div>
                    </div>
                  ) : null}

                  {selectedFixtureWithHistory.penaltiesMissed ? (
                    <div className="player-info-2">
                      <div>Penalties missed</div>
                      <div>{selectedFixtureWithHistory.penaltiesMissed}</div>
                    </div>
                  ) : null}

                  {selectedFixtureWithHistory.penaltiesSaved ? (
                    <div className="player-info-2">
                      <div>Penalties saved</div>
                      <div>{selectedFixtureWithHistory.penaltiesSaved}</div>
                    </div>
                  ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlayerInfo;
