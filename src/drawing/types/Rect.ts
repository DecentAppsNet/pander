type Rect = {
  x:number, y:number, w:number, h:number
}

export const UNSPECIFIED_RECT = {x:0, y:0, w:0, h:0} as const;

export default Rect;