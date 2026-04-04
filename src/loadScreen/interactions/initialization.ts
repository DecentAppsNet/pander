import { findBestModel, predictModelDeviceProblems } from "decent-portal";

import { connect } from "@/llm/llmUtil.ts";

let isInitialized = false;
let isInitializing = false;

// Format: Blah blah [3/45] blah blah
function _findPercentCompleteFromStatus(status:string):number|null {
  const leftBracketPos = status.indexOf('[');
  if (leftBracketPos === -1) return null;
  const divisorPos = status.indexOf('/', leftBracketPos+1);
  if (divisorPos === -1) return null;
  const rightBracketPos = status.indexOf(']', divisorPos+1);
  if (rightBracketPos === -1) return null;
  const leftValue = parseInt(status.substring(leftBracketPos+1, divisorPos));
  const rightValue = parseInt(status.substring(divisorPos+1, rightBracketPos));
  if (isNaN(leftValue) || isNaN(rightValue) || rightValue === 0) return null;
  return leftValue / rightValue;
}

// Returns true if model is ready to load, false if there are problems.
export async function init(setModelId:Function, _setProblems:Function, _setModalDialogName:Function):Promise<boolean> {
  const modelId = await findBestModel();
  if (modelId === 'None') {
    setModelId(modelId);
    return true;
  }
  const problems = await predictModelDeviceProblems(modelId);
  if (!problems) {
    setModelId(modelId);
    return true;
  }
  // Skip model loading entirely if there are problems — game doesn't require an LLM.
  setModelId('None');
  return true;
}

export async function startLoadingModel(modelId:string, setPercentComplete:Function, setCurrenTask:Function):Promise<boolean> {
  if (isInitialized || isInitializing) return false;

  try {
    isInitializing = true;
    function _onStatusUpdate(status:string, percentComplete:number) {
      const statusPercentComplete = _findPercentCompleteFromStatus(status); // For WebLLM, it's better to parse from status text.
      percentComplete = Math.max(percentComplete, statusPercentComplete || 0);
      setPercentComplete(percentComplete);
      setCurrenTask(status);
    }

    await connect(modelId, _onStatusUpdate);
    isInitialized = true;
    return true;
  } catch(e) {
    console.error(e);
    return false;
  } finally {
    isInitializing = false;
  }
}