import AudienceMember, { duplicateAudienceMember } from "./AudienceMember"

type Level = {
  audienceMembers:AudienceMember[],
  happinessFunctionName:string|null
};

export function duplicateLevel(level:Level):Level {
  return {
    audienceMembers: level.audienceMembers.map(duplicateAudienceMember),
    happinessFunctionName: level.happinessFunctionName
  }
}

export default Level;