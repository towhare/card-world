/**
 * A Character
 */

import { stringify } from 'node:querystring'
import {
  Mesh,
  Object3D,
  MeshBasicMaterial,
  Clock,
  PlaneGeometry,
  TextureLoader,
  DoubleSide,
  Group
} from 'three'

interface NewCharacterProperty{
  maxHP?:number,
  HP?:number,
  maxMP?:number,
  MP?:number,
  maxEP?:number,
  exp?:number,
  EP?:number,

  moveSpeed?:number,
  attack?:number,
  defence?:number,
  magic?:number,

  name?:string,
  type?:string,
  newCardUrl?:string | null
}

interface CharacterProperty {
  maxHP:number,
  HP:number,
  MP:number,
  EP:number,
  exp:number,
  maxMP:number,
  maxEP:number,

  moveSpeed: number,
  attack:number,
  defence:number,
  magic:number,

}

interface CurrentState {
  /** from state  to  to state */
  timeperiod:{
    start:number,
    end:number
  },
  position:{
    x:number,
    y:number,
    z:number
  }
}

interface AnimationStateClip{
  /** array */
  animationClip:Array<CurrentState>,
  // if this animation will repeat
  repeat:boolean,
  // repeatDuration se
  repeatDuration:number
}

export default class Character {
  state:CharacterProperty;
  name:string;
  type:string;
  cardUrl:string|null;
  renderObj:Group;
  animationState:'moving'|'idle';
  animationClip:{idle:AnimationStateClip};
  characterMesh:Mesh;
  clock:Clock;
  constructor({
    maxHP = 100,
    HP = 100,
    MP = 100,
    EP = 100,
    exp = 0,
    maxMP = 100,
    maxEP = 75,

    moveSpeed = 2,
    attack = 2,
    defence = 1,
    magic = 1,
    name = 'love',
    type = 'any',
    newCardUrl = null,
    
  }:NewCharacterProperty={}){
    this.state = this.initState();
    this.state.maxHP = maxHP;
    this.state.maxMP = maxMP;
    this.state.maxEP = maxEP;
    this.state.HP = HP;
    this.state.MP = MP;
    this.state.EP = EP;
    
    this.state.exp = exp;
    this.state.moveSpeed = moveSpeed;
    this.state.attack = attack;
    this.state.defence = defence;
    this.state.magic = magic;
    this.name = name;
    this.type = type;
    this.cardUrl = newCardUrl;
    this.animationState = 'idle';
    this.characterMesh = this.initRenderObj();
    this.renderObj = new Group();
    this.renderObj.add(this.characterMesh);
    this.clock = new Clock();

    this.animationClip = {
      'idle':{
        animationClip:[{
          timeperiod:{
            start:0,
            end:0.2
          },
          position:{
            x:0,
            y:0.2,
            z:0
          }
        },
        {
          timeperiod:{
            start:0.2,
            end:0.4
          },
          position:{
            x:0,
            y:0.3,
            z:0
          }
        },
        {
          timeperiod:{
            start:0.4,
            end:0.6
          },
          position:{
            x:0,
            y:0.2,
            z:0
          }
        },
        {
          timeperiod:{
            start:0.6,
            end:0.8
          },
          position:{
            x:0,
            y:0.1,
            z:0
          }
        }
      ],
        repeat:true,
        repeatDuration:1
      }
    }
    // this.clock.start();
  }

  initState():CharacterProperty{
    return {
      maxHP:1,
      HP:1,
      MP:1,
      EP:1,
      exp:0,
      maxMP:1,
      maxEP:1,

      moveSpeed:1,
      attack:1,
      defence:1,
      magic:1
    }
  }

  // build a character card
  initRenderObj():Mesh{
    const characterCardGeometry = new PlaneGeometry(2,2);
    characterCardGeometry.translate(0,1,0)
    const characterCardMaterial = new MeshBasicMaterial({
      map:new TextureLoader().load(this.cardUrl || '/assets/images/character/rabbit.png'),
      transparent:true,
      alphaTest:0.4,
      side:DoubleSide
    })

    const characterMesh = new Mesh(characterCardGeometry, characterCardMaterial);
    const characterGroup = new Group();
    this.characterMesh = characterMesh;
    characterGroup.add(characterMesh);
    return characterMesh;
  }

  animation(delta:number){
    if(this.animationState === 'idle'){

    }
  }

  update(delta?:number){
    const timeFromStart = this.clock.getElapsedTime();
    
    function _getCurrentClip(animationClip:AnimationStateClip,currentTime:number):{x:number,y:number,z:number}{
      let position = {
        x:0,
        y:0,
        z:0
      }
      for(let item of animationClip.animationClip ) {
        if(item.timeperiod.start<currentTime && item.timeperiod.end>currentTime){
          position.x = item.position.x;
          position.y = item.position.y;
          position.z = item.position.z;
          return position;
        }
      }
      console.log('position.y',position.y)
      return position;
    }
    switch(this.animationState){
      case 'idle':
        if(this.animationClip.idle)
        {
          const currentTime = timeFromStart % Number(this.animationClip['idle'].repeatDuration);
          //console.log('currentTime',currentTime)
          if(currentTime){

            let position = _getCurrentClip(this.animationClip['idle'],currentTime);
            this.characterMesh.position.x = position.x;
            this.characterMesh.position.y = position.y;
            this.characterMesh.position.z = position.z;
            //console.log(this.characterMesh.position.y)
          }
        }
        
        break;
      default:
        break;
    }
  }
}