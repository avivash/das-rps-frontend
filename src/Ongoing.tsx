import React, { useEffect, useState } from "react";
import styled from "styled-components";
import GradientBar from "./components/GradientBar";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router";
import { ChallengeAttestation } from "./ChallengeAttestation";
import axios from "axios";
import { baseURL, gameLinks, getENSName } from "./utils/utils";
import {
  Game,
  GameWithPlayers,
  IncomingChallenge,
  MyStats,
} from "./utils/types";
import Page from "./Page";
import MiniHeader from "./MiniHeader";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fef6e4;
  min-height: 100vh;
  margin: 20px;
  box-sizing: border-box;
`;

const Title = styled.div`
  color: #272343;
  text-align: center;
  font-family: Ubuntu;
  font-size: 36px;
  font-style: normal;
  font-weight: 700;
  line-height: 34px; /* 94.444% */
  padding: 30px;
`;

function Ongoing() {
  const { address } = useAccount();
  const [challengeObjects, setChallengeObjects] = useState<IncomingChallenge[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!address) {
      return navigate("/");
    }

    async function getAtts() {
      setChallengeObjects([]);

      setLoading(true);
      const newChallenges = await axios.post<GameWithPlayers[]>(
        `${baseURL}/ongoing`,
        {
          address: address,
        }
      );

      console.log(newChallenges.data);

      setChallengeObjects(
        newChallenges.data.map((game) => ({
          uid: game.uid,
          stakes: game.stakes,
          player1Object: {
            address: address === game.player1 ? game.player2 : game.player1,
            elo:
              address === game.player1
                ? game.player2Object.elo
                : game.player1Object.elo,
          },
          gameCount: 0,
          winstreak: 0,
        }))
      );
      setLoading(false);
    }

    getAtts();
  }, [address]);

  return (
    <Page>
      <Container>
        <MiniHeader links={gameLinks} selected={0} />

        <Title>Ongoing Battles</Title>
        {loading && <div>Loading...</div>}
        {challengeObjects.length > 0 || loading ? (
          challengeObjects.map((gameObj) => (
            <ChallengeAttestation game={gameObj} />
          ))
        ) : (
          <div>No one here yet</div>
        )}
      </Container>
    </Page>
  );
}

export default Ongoing;
