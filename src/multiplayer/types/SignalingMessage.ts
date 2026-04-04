type SignalingMessageType =
  | 'CHALLENGE'
  | 'CHALLENGE_ACCEPT'
  | 'CHALLENGE_DECLINE'
  | 'SDP_OFFER'
  | 'SDP_ANSWER'
  | 'ICE_CANDIDATE';

type SignalingMessage = {
  type: SignalingMessageType;
  fromId: string;
  toId: string;
  payload: any;
  timestamp: number;
};

export type { SignalingMessageType };
export default SignalingMessage;
