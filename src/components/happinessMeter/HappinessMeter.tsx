import { clamp } from '@/common/mathUtil';
import styles from './HappinessMeter.module.css';
import ColorGradient from '@/drawing/types/ColorGradient';
import { calcGradientColor, colorToHexColor, createColorGradient } from '@/drawing/colorUtil';

type Props = {
  happiness: number; // 0..1
  targetHappiness: number; // optional 0..1
};

const BAR_GRADIENT:ColorGradient = createColorGradient(['#A84A3E', '#C4A652', '#5C8254']);

function HappinessMeter({ happiness, targetHappiness }:Props) {
  const value = clamp(happiness, 0, 1);
  const target = clamp(targetHappiness, 0, 1);

  const valueColor = calcGradientColor(value, BAR_GRADIENT);
  const cssColor = colorToHexColor(valueColor);

  const heightPercent = Math.max(value * 100, 1); // ensure visible at 0

  return (
    <div className={styles.container} role="img">
      <p>Happiness</p>
      <div className={styles.track}>
        <div className={styles.bar} style={{ height: `${heightPercent}%`, backgroundColor: cssColor }}/>
        <div className={styles.target} style={{ bottom: `${target * 100}%` }} aria-hidden />
      </div>
    </div>
  );
}

export default HappinessMeter;