import AudienceMember, { duplicateAudienceMember } from "./AudienceMember"
import TellaStyle from "./TellaStyle";

type Level = {
  audienceMembers:AudienceMember[],
  happinessFunctionName:string|null,
  tellaStyle:TellaStyle
};

export function duplicateLevel(level:Level):Level {
  return {
    audienceMembers: level.audienceMembers.map(duplicateAudienceMember),
    happinessFunctionName: level.happinessFunctionName,
    tellaStyle: level.tellaStyle
  }
}

export default Level;