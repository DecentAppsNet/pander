type AudienceMember = {
  characterId:string,
  count:number,
  happiness:number,
  likes:string[],
  dislikes:string[],
  loves:string[],
  hates:string[]
}

export function duplicateAudienceMember(from:AudienceMember):AudienceMember {
  return {
    characterId: from.characterId,
    count: from.count,
    happiness: from.happiness,
    likes: [...from.likes],
    dislikes: [...from.dislikes],
    loves: [...from.loves],
    hates: [...from.hates],
  };
}

export default AudienceMember;