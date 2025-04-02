import { useEffect, useState, useRef } from 'react';
import {Vector2, Vector3} from "three"
import './touchGamepad.css';
type TouchControlEvent = (direction:Vector2) => void;
function TouchGamepad({
  touchControlEvent
}:{
  touchControlEvent?:TouchControlEvent
}){
  const [testvalue,setTestValue] = useState(0);
  const position = useRef(new Vector2(0,0));
  const directionValue = useRef(new Vector2(0, 0));
  return <div className='gamepadContainer' onTouchMove={(e)=>{
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    if( e.target instanceof HTMLDivElement ) {
      const rect = e.target.getBoundingClientRect();
      const top = rect.top;
      const left = rect.left;
      const width = rect.width;
      const height = rect.height;
      const center = new Vector2(width/2,height/2);
      if( e.nativeEvent instanceof TouchEvent ){
        if( e.nativeEvent.touches.length > 0 ){
          const first = e.nativeEvent.touches[0];
          const x = first.clientX - left;
          const y = first.clientY - top;
          position.current.x = x;
          position.current.y = y;
          const point = new Vector2(x,y);
          const direction = point.clone().sub(center);
          const length = direction.length();
          if( length > 100 ) {
            direction.multiplyScalar(100/length);
            
          }
          direction.multiplyScalar(0.01);
          directionValue.current.x = direction.x;
          directionValue.current.y = -direction.y;
          console.log('directionValue.current',directionValue.current.x,directionValue.current.y)
          if( touchControlEvent ) {
            touchControlEvent(directionValue.current)
          }
          
          setTestValue(first.clientY);
        }
      }
    }
    
  }}
  onTouchEnd={(e)=>{
    console.log("ontouchend",e.target)
    if( e.target instanceof HTMLDivElement ) {
      const rect = e.target.getBoundingClientRect();
      const top = rect.top;
      const left = rect.left;
      const width = rect.width;
      const height = rect.height;
      position.current.x = width/2;
      position.current.y = height/2;
      if( touchControlEvent ) {
        touchControlEvent(new Vector2(0,0))
      }
      setTestValue(0);
    }
  }}
  >
    <div className="pad" style={{left: position.current.x+"px", top: position.current.y+"px"}}></div>
  </div>
}

export default TouchGamepad;