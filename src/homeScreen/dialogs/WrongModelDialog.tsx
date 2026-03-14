import OkayDialog from "@/components/modalDialogs/OkayDialog";
import { getConnectionModelId } from "@/llm/llmUtil";

type Props = {
  isOpen:boolean,
  expectedModelId:string,
  onClose:() => void
}

function WrongModelDialog({isOpen, expectedModelId, onClose}:Props) {
  if (!isOpen) return null;
  const currentModelId = getConnectionModelId();
  return (
    <OkayDialog
      isOpen={isOpen}
      onOkay={onClose}
      title="Model Mismatch"
      description={`You have the ${currentModelId} model loaded, but the expected model for this encounter is ${expectedModelId}. The encounter might not work as intended, but you can try it. Or you could change your model in settings.`}
    />
  );
}

export default WrongModelDialog;