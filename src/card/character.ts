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

interface ActionDescription{
  animationStateName:string,
  /** when the action start */
  startTime:number,
  /** when the action end  */
  endTime:number,
  /** if this action can be canceld */
  force:boolean,
  /** action small number actions first */
  priority:number
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
  animationState:string;
  animationStateQueue:Array<string>;
  animationClip:{[key:string]:AnimationStateClip};
  characterMesh:Mesh;
  clock:Clock;
  movingDirection:Vector3;
  movingUp:boolean;
  /** action attempt default is 'none', 'attack' */
  actionAttempt:string;
  /** default state is 'normal' 'attack'/anthing else is special action and can not be deniyd */
  public action:string;// 'normal' 'attack'
  actionSheet:{[key:string]:ActionDescription};
  movingDown:boolean;
  movingLeft:boolean;
  lastVertical:'left'|'right';
  movingRight:boolean;
  running:boolean;
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
    this.animationStateQueue = ['idle','idle'];

    this.characterTexture = new TextureLoader().load(this.cardUrl || '/assets/images/assets/sheets/DinoSprites - mort.png');
    this.characterTexture.magFilter = NearestFilter;
    this.characterTexture.minFilter = LinearFilter;
    this.characterTexture.repeat.x = 1/24;
    this.characterTexture.offset.x = 0/24;
    this.characterTexture.offset.y = 2/24;

    this.characterMesh = this.initRenderObj(this.characterTexture);
    this.renderObj = new Group();
    this.renderObj.add(this.characterMesh);
    this.clock = new Clock();
    this.movingDirection = new Vector3(0,0,0);
    this.movingUp = false;
    this.movingDown = false;
    this.movingLeft = false;
    this.running = false;
    this.lastVertical = 'right';
    this.action = 'normal';
    this.actionAttempt = 'none';
    this.actionSheet = {
      'attack':{
        animationStateName:'attack',
        startTime:0,
        endTime:0.4,
        force:true,
        priority:1,
      }
    };
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
            y:3/24
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
            y:3/24
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
            y:3/24
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
            y:3/24
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
            y:3/24
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
            y:3/24
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
            y:3/24
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
            y:3/24
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
            y:3/24
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
            y:3/24
          }
        }
      ],
        repeat:true,
        repeatDuration:1.2
      },
      'attack':{
        animationClip:[
          {
            timeperiod:{
              start:0,
              end:0.1
            },
            position:{
              x:0,
              y:0,
              z:0
            },
            textureOffset:{
              x:10/24,
              y:3/24
            }
          },
          {
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
              x:11/24,
              y:3/24
            }
          },
          {
            timeperiod:{
              start:0,
              end:0.3
            },
            position:{
              x:0,
              y:0,
              z:0
            },
            textureOffset:{
              x:12/24,
              y:3/24
            }
          },
          {
            timeperiod:{
              start:0,
              end:0.4
            },
            position:{
              x:0,
              y:0,
              z:0
            },
            textureOffset:{
              x:13/24,
              y:3/24
            }
          },
        ],
        repeat:false,
        repeatDuration:0.4
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
      side:DoubleSide,
      depthWrite:true
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
    
    
    
    

    this.updateMovingDirection();
    
    
    if(this.action === 'normal'){
      if(this.movingUp || this.movingDown || this.movingLeft || this.movingRight){
        this.animationStateQueue[0] = this.animationState;
        this.animationState = 'moving';
        this.animationStateQueue[1] = this.animationState;
      } else {
        this.animationStateQueue[0] = this.animationState
        this.animationState = 'idle';
        this.animationStateQueue[1] = this.animationState;
      }
    }
    

    // actions
    if(this.actionAttempt !== 'none'){
      //
      if(this.action !=='normal'){
        this.animationStateQueue[0] = this.animationStateQueue[1];
        this.animationStateQueue[1] = this.animationState;
      }
      if(this.action !== this.actionAttempt){
        this.action = this.actionAttempt;
        this.animationStateQueue[0] = this.animationState;//'idle' 'moving'd
        const actionInfo = this.actionSheet[this.action];
        this.animationState = actionInfo.animationStateName;//'attack'
        this.animationStateQueue[1] = this.animationState;

        // check if this action can be used


      }
    }
    if(this.action === 'normal'){
      this.renderObj.position.add(this.movingDirection.clone().multiplyScalar(delta));
    } else {

    }

    // reset Clock
    if(this.animationStateQueue[0] !== this.animationStateQueue[1]){
      this.clock.start();
    }
    const timeFromStart = this.clock.getElapsedTime();
    this.actionUpdate(timeFromStart);


    if(this.movingLeft){
      
      this.lastVertical = 'left';
    }else if (this.movingRight){
      this.lastVertical = 'right';
    }

    if(this.lastVertical === 'left'){
      this.characterMesh.rotation.y = Math.PI;
    } else {
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

            let currentClip = this._getCurrentClip(this.animationClip['idle'],currentTime);
            characterMeshPosition = currentClip.position;
            characterTextureOffset = currentClip.textureOffset;
          
        }
        break;
      case 'moving':
        if(this.animationClip.moving){
          const currentTime = timeFromStart % Number(this.animationClip['moving'].repeatDuration);
            let currentClip = this._getCurrentClip(this.animationClip['moving'],currentTime);
            characterMeshPosition = currentClip.position;
            characterTextureOffset = currentClip.textureOffset;
          
        }
        break;
      case 'attack':
        console.log('attack');
        let currentClip = this.getActionClip(timeFromStart);
        if(currentClip){
          characterMeshPosition = currentClip.position;
          characterTextureOffset = currentClip.textureOffset;
        }
        break;
      default:
        console.log('default')
        break;
    }

    this.characterMesh.position.x = characterMeshPosition.x;
    this.characterMesh.position.y = characterMeshPosition.y;
    this.characterMesh.position.z = characterMeshPosition.z;
    this.updateTextureState(characterTextureOffset)
  }

  actionUpdate(timeFromStart:number){
    if(this.action !== 'normal'){
      const action = this.action;// attack for example
      const actionInfo = this.actionSheet[action];
      const currentTime = timeFromStart;
      console.log('currentTime',currentTime)
      if(currentTime > actionInfo.endTime){
        console.log('action end')
        this.action = 'normal';
        this.animationState = 'idle';
      }
    }
  }

  getActionClip(timeFromStart:number){
    const action = this.action;
    const actionInfo = this.actionSheet[action];
    const currentTime = timeFromStart;
    let currentClip = this._getCurrentClip(this.animationClip[actionInfo.animationStateName],currentTime);
    return currentClip; 
  }
  private _getCurrentClip(animationClip:AnimationStateClip,currentTime:number):{
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
      if(item.timeperiod.start<=currentTime && item.timeperiod.end>currentTime){
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