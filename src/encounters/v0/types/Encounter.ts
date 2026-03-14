import Action from "./Action"
import AudienceMember from "./AudienceMember";
import CharacterTrigger from "./CharacterTrigger"
import Memory from "./Memory";

type EncounterV0 = {
  version:string,
  title:string,
  model:string,
  startActions:Action[],
  instructionActions:Action[],
  characterTriggers:CharacterTrigger[],
  memories:Memory[],
  audience:AudienceMember[]
}

export default EncounterV0;