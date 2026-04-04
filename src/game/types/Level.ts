import AudienceMember, { duplicateAudienceMember } from "./AudienceMember"

type Level = {
  audienceMembers:AudienceMember[],
  cardIds:string[]
};

export function duplicateLevel(level:Level):Level {
  return {
    audienceMembers: level.audienceMembers.map(duplicateAudienceMember),
    cardIds:[...level.cardIds]
  }
}

export default Level;