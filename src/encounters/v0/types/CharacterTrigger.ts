import Code from "@/spielCode/types/Code";
import Action from "./Action"

type CharacterTrigger = {
  criteria:string,
  triggerCode:string,
  actions:Action[],
  isEnabled:boolean,
  enabledCriteria:Code|null
}

export default CharacterTrigger;