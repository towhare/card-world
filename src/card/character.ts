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
  Group,
  Vector3,
  NearestFilter,
  LinearFilter,
  Texture
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
  textureOffset?:{
    x:number,
    y:number
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
  animationClip:{idle:AnimationStateClip,moving:AnimationStateClip};
  characterMesh:Mesh;
  clock:Clock;
  movingDirection:Vector3;
  movingUp:boolean;
  movingDown:boolean;
  movingLeft:boolean;
  movingRight:boolean;
  characterTexture:Texture;
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

    this.characterTexture = new TextureLoader().load(this.cardUrl || '/assets/images/assets/sheets/DinoSprites - doux.png');
    this.characterTexture.magFilter = NearestFilter;
    this.characterTexture.minFilter = LinearFilter;
    this.characterTexture.repeat.x = 1/24;
    this.characterTexture.offset.x = 0/24;

    this.characterMesh = this.initRenderObj(this.characterTexture);
    this.renderObj = new Group();
    this.renderObj.add(this.characterMesh);
    this.clock = new Clock();
    this.movingDirection = new Vector3(0,0,0);
    this.movingUp = false;
    this.movingDown = false;
    this.movingLeft = false;
    this.movingRight = false;
    this.animationClip = {
      'idle':{
        animationClip:[{
          timeperiod:{
            start:0,
            end:0.2
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:0,
            y:0
          }
        },
        {
          timeperiod:{
            start:0.2,
            end:0.4
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:1/24,
            y:0
          }
        },
        {
          timeperiod:{
            start:0.4,
            end:0.6
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:2/24,
            y:0
          }
        },
        {
          timeperiod:{
            start:0.6,
            end:0.8
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:3/24,
            y:0
          }
        }
      ],
        repeat:true,
        repeatDuration:0.8
      },
      'moving':{
        animationClip:[{
          timeperiod:{
            start:0,
            end:0.2
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:4/24,
            y:0
          }
        },
        {
          timeperiod:{
            start:0.2,
            end:0.4
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:5/24,
            y:0
          }
        },
        {
          timeperiod:{
            start:0.4,
            end:0.6
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:6/24,
            y:0
          }
        },
        {
          timeperiod:{
            start:0.6,
            end:0.8
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:7/24,
            y:0
          }
        },
        {
          timeperiod:{
            start:0.8,
            end:1
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:8/24,
            y:0
          }
        },
        {
          timeperiod:{
            start:1,
            end:1.2
          },
          position:{
            x:0,
            y:0,
            z:0
          },
          textureOffset:{
            x:9/24,
            y:0
          }
        }
      ],
        repeat:true,
        repeatDuration:1.2
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

      moveSpeed:3,
      attack:1,
      defence:1,
      magic:1
    }

  }

  // build a character card
  initRenderObj(texture:Texture):Mesh{
    const characterCardGeometry = new PlaneGeometry(2,2);
    characterCardGeometry.translate(0,1,0)
    

    const characterCardMaterial = new MeshBasicMaterial({
      map:texture,
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

  updateMovingDirection(){
    this.movingDirection.x = 0;
    this.movingDirection.z = 0;
    if(this.movingUp){
      this.movingDirection.z -=this.state.moveSpeed;
    }
    if(this.movingDown){
      this.movingDirection.z += this.state.moveSpeed;
    }
    if(this.movingLeft){
      this.movingDirection.x -= this.state.moveSpeed;
    }
    if(this.movingRight){
      this.movingDirection.x += this.state.moveSpeed ;
    }
  }

  update(delta:number = 0.016){
    
    const timeFromStart = this.clock.getElapsedTime();
    
    function _getCurrentClip(animationClip:AnimationStateClip,currentTime:number):{
      position:{
        x:number,
        y:number,
        z:number
      },
      textureOffset:{
        x:number,
        y:number
      }
    }{
      let position = {
        x:0,
        y:0,
        z:0
      }
      let textureOffset = {
        x:0,
        y:0
      }
      for(let item of animationClip.animationClip ) {
        if(item.timeperiod.start<currentTime && item.timeperiod.end>currentTime){
          position.x = item.position.x;
          position.y = item.position.y;
          position.z = item.position.z;

          if(item.textureOffset){
            textureOffset = item.textureOffset;
          }
          return {
            position,
            textureOffset
          };
        }
      }
      return {
        position,
        textureOffset
      };
    }

    this.updateMovingDirection();
    this.renderObj.position.add(this.movingDirection.clone().multiplyScalar(delta));
    
    if(this.movingUp || this.movingDown || this.movingLeft || this.movingRight){
      this.animationState = 'moving';
    } else {
      this.animationState = 'idle';
    }
    if(this.movingLeft){
      this.characterMesh.rotation.y = Math.PI;
    }else{
      this.characterMesh.rotation.y = 0;
    }
    let characterMeshPosition = {
      x:0,
      y:0,
      z:0
    }
    let characterTextureOffset = {
      x:0,
      y:0
    }
    switch(this.animationState){
      case 'idle':
        if(this.animationClip.idle)
        {
          const currentTime = timeFromStart % Number(this.animationClip['idle'].repeatDuration);
          //console.log('currentTime',currentTime)
          if(currentTime){

            let currentClip = _getCurrentClip(this.animationClip['idle'],currentTime);
            characterMeshPosition = currentClip.position;
            characterTextureOffset = currentClip.textureOffset;
          }
        }
        break;
      case 'moving':
        if(this.animationClip.moving){
          const currentTime = timeFromStart % Number(this.animationClip['moving'].repeatDuration);
          if(currentTime){
            let currentClip = _getCurrentClip(this.animationClip['moving'],currentTime);
            characterMeshPosition = currentClip.position;
            characterTextureOffset = currentClip.textureOffset;
          }
        }
        break;
      default:
        break;
    }

    this.characterMesh.position.x = characterMeshPosition.x;
    this.characterMesh.position.y = characterMeshPosition.y;
    this.characterMesh.position.z = characterMeshPosition.z;

    this.updateTextureState(characterTextureOffset)
  }

  updateTextureState(textureOffset:{x:number,y:number}){
    if(this.characterTexture){
      this.characterTexture.offset.x = textureOffset.x;
      this.characterTexture.offset.y = textureOffset.y
    }
  }

  /** get current texture offset */
  getCurrentOffset(current:CurrentState){
    if(current.textureOffset){
      return current.textureOffset
    } else{
      return {
        x:0,
        y:0
      }
    }
  }
}