type AudienceMember = {
  characterId:string,
  likes:string[],
  count:number,     // how many audience members of this type there are
  happiness:number  // 0-1, where 0 is very unhappy and 1 is very happy.
}

export default AudienceMember;