import { initEmbedder } from "@/transformersJs/transformersEmbedder";

let isInitialized = false;
let isInitializing = false;

export async function startLoadingModel(setPercentComplete:Function, setCurrenTask:Function):Promise<boolean> {
  if (isInitialized || isInitializing) return false;

  try {
    isInitializing = true;
    function _onStatusUpdate(status:string, percentComplete:number) {
      setPercentComplete(percentComplete);
      setCurrenTask(status);
    }
    await initEmbedder(_onStatusUpdate);
    isInitialized = true;
    return true;
  } catch(e) {
    console.error(e);
    return false;
  } finally {
    isInitializing = false;
  }
}