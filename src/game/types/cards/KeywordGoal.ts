type KeywordGoal = {
  keyword:string,
  isComplete:boolean
}

export function duplicateKeywordGoal(from:KeywordGoal):KeywordGoal {
  return {
    keyword: from.keyword,
    isComplete: from.isComplete
  }
}

export default KeywordGoal;