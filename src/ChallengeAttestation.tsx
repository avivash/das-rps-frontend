import { Game, IncomingChallenge } from "./utils/types";
import styled from "styled-components";
import { ButtonStandard } from "./styles/buttons";
import { useNavigate } from "react-router";
import { useStore } from "./useStore";
import invariant from "tiny-invariant";
import {
  AttestationShareablePackageObject,
  EAS,
  SchemaEncoder,
  ZERO_ADDRESS,
} from "@ethereum-attestation-service/eas-sdk";
import {
  CUSTOM_SCHEMAS,
  EASContractAddress,
  RPS_GAME_UID,
  getENSName,
  submitSignedAttestation,
} from "./utils/utils";
import dayjs from "dayjs";
import { useSigner } from "./utils/wagmi-utils";
import PlayerCard from "./components/PlayerCard";

type Props = {
  game: IncomingChallenge;
  player1ENS: string;
};

const Container = styled.div`
  border-radius: 10px;
  background: #fff;
  width: 70%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`;
const UID = styled.div`
  font-size: 12px;
`;
const Challenger = styled.div`
  font-size: 12px;
  margin-bottom: 10px;
`;

const AcceptButton = styled.div`
  border-radius: 5px;
  border: 1px solid #00ebc7;
  background: #fff;
  width: 80%;
  height: 65px;
  flex-shrink: 0;
  color: #272343;
  text-align: center;
  font-family: "Space Grotesk";
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 20px;
`;

const DeclineLink = styled.div`
  color: #272343;
  font-family: "Space Grotesk";
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration-line: underline;
  cursor: pointer;
  margin-bottom: 20px;
`;

const LineBreak = styled.div`
  height: 1px;
  width: 80%;
  background: rgba(57, 53, 84, 0.15);
  margin: 10px;
`;

const BoldNumber = styled.div`
  color: #272343;
  text-align: right;
  font-family: "Space Grotesk";
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-left: 20px;
  margin-right: 10px;
`;

const NumberDescriptor = styled.div`
  color: #272343;
  font-family: "Space Grotesk";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-left: 10px;
  margin-right: 20px;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StakesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: left;
`;

const StakesDescriptor = styled.div`
  color: rgba(39, 35, 67, 0.4);
  font-family: Nunito;
  font-size: 14px;
  font-style: italic;
  font-weight: 400;
  line-height: normal;
`;

const Stakes = styled.div`
  color: #272343;
  font-family: Nunito;
  font-size: 18px;
  font-style: italic;
  font-weight: 700;
  line-height: normal;
`;

export function ChallengeAttestation({ game: g, player1ENS }: Props) {
  const navigate = useNavigate();
  const signer = useSigner();

  const decline = async (uid: string) => {
    try {
      const schemaEncoder = new SchemaEncoder("bool declineGameChallenge");

      const encoded = schemaEncoder.encodeData([
        { name: "declineGameChallenge", type: "bool", value: true },
      ]);

      const eas = new EAS(EASContractAddress);

      invariant(signer, "signer must be defined");
      eas.connect(signer);

      const offchain = await eas.getOffchain();

      const signedOffchainAttestation = await offchain.signOffchainAttestation(
        {
          schema: CUSTOM_SCHEMAS.DECLINE_GAME_CHALLENGE,
          recipient: ZERO_ADDRESS,
          refUID: uid,
          data: encoded,
          time: BigInt(dayjs().unix()),
          revocable: false,
          expirationTime: BigInt(0),
          version: 1,
          nonce: BigInt(0),
        },
        signer
      );

      const pkg: AttestationShareablePackageObject = {
        signer: signer.address!,
        sig: signedOffchainAttestation,
      };

      const res = await submitSignedAttestation(pkg);

      if (!res.data.error) {
        console.log(res);
        window.location.reload();
      } else {
        console.error(res.data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container>
      <PlayerCard
        address={g.player1Object.address}
        score={g.player1Object.elo}
        ensName={player1ENS || g.player1Object.address}
      />
      <LineBreak />
      <StatsContainer>
        <BoldNumber>{g.gameCount}</BoldNumber>
        <NumberDescriptor>Games Played</NumberDescriptor>
        <BoldNumber>{g.winstreak}</BoldNumber>
        <NumberDescriptor>Win Streak</NumberDescriptor>
      </StatsContainer>

      <LineBreak />
      {g.stakes && (
        <>
          <StakesContainer>
            <StakesDescriptor>What's at Stake...</StakesDescriptor>
            <Stakes>{g.stakes}</Stakes>
          </StakesContainer>
          <LineBreak />
        </>
      )}
      <AcceptButton
        onClick={() => {
          navigate(`/challenge/${g.uid}`);
        }}
      >
        Accept This Battle
      </AcceptButton>

      <DeclineLink
        onClick={async () => {
          await decline(g.uid);
        }}
      >
        Decline This Battle
      </DeclineLink>
    </Container>
  );
}
