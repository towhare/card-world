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
  DoubleSide
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

export default class Character {
  state:CharacterProperty;
  name:string;
  type:string;
  cardUrl:string|null;
  renderObj:Mesh;
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
    newCardUrl = null
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
    this.renderObj = this.initRenderObj();
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
    return characterMesh;
  }
}