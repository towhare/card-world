import * as THREE from 'three';


export class Card{
  renderObj:THREE.Object3D
  constructor(){
    this.renderObj = new THREE.Mesh() 
  }
}