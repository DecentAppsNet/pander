import { useState, useEffect } from 'react';

import { getLevelIds } from '@/game/levelFileUtil';
import Selector from '../selector/Selector';
import { assertNonNullable } from 'decent-portal';

type Props = {
  onSelect:(levelId:string) => void,
  selectedLevelId:string|null
}

function LevelSelector({onSelect, selectedLevelId}:Props) {
  const [levelIds, setLevelIds] = useState<string[]|null>(null);

  useEffect(() => {
    getLevelIds().then(setLevelIds);
  }, []);

  if (!levelIds || !levelIds.length) return null;

  const selectedOptionNo = selectedLevelId ? levelIds.findIndex(id => id === selectedLevelId) : 0;

  function _onClick(optionNo:number) {
    assertNonNullable(levelIds);
    onSelect(levelIds[optionNo]);
  }

  return <Selector label='Levels' optionNames={levelIds} onClick={_onClick} selectedOptionNo={selectedOptionNo}/>;
}

export default LevelSelector;