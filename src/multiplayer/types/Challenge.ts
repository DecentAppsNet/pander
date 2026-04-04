type CrowdComposition = {
  characterId: string;
  count: number;
};

type Challenge = {
  challengerId: string;
  challengerName: string;
  defenderId: string;
  defenderName: string;
  crowdComposition: CrowdComposition[];
  timestamp: number;
};

export type { CrowdComposition };
export default Challenge;
