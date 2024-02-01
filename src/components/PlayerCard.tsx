import { Identicon } from "./Identicon";
import styled from "styled-components";

const PlayerName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  overflow-wrap: anywhere;
`;

const PlayerScore = styled.div`
  color: #272343;
  font-family: "Space Grotesk";
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

const PlayerAddress = styled.div`
  font-size: 14px;
  color: #666;
  overflow-wrap: anywhere;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  margin: 10px 0;
  border-radius: 15px;
  width: 65%;
  background: #fff;
  justify-content: center;

  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  overflow-wrap: anywhere;
  max-width: 50%;
`;

type Props = {
  address: string;
  ensName: string;
  score: number;
};

export default function PlayerCard({ address, ensName, score }: Props) {
  return (
    <CardContainer>
      <Identicon address={address} size={56} />
      <PlayerInfo>
        <PlayerName>{ensName}</PlayerName>
        {ensName !== address ? <PlayerAddress>{address}</PlayerAddress> : null}
      </PlayerInfo>
      <PlayerScore>{score}</PlayerScore>
    </CardContainer>
  );
}
