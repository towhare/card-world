/**
 * this file is about create a normal fram animation clip using time period
 * and frame position and width and height;
 * 
 * 一个用于创建帧动画的类， 描述一个帧动画
 */
interface AnimationClip{
  /** animation time period */
  timeperiod:{
    start:number,
    end:number
  },
  /** card position */
  position:{
    x:number,
    y:number,
    z:number
  }
  /**
   * animation area position
   */
  clipPosition:{
    x:number,
    y:number
  }
  
}
export default class animations{
  constructor(){

  }
}