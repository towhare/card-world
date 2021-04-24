
/**
 * a audio player used for play backgrond music
 */

import {
  AudioListener,
  Audio,
  AudioLoader,
} from  'three'

interface AudioBufferSetting{
  key?:string,
  loop?:boolean,
  /** audio volume from 0 to 1? */
  volume?:number,
  playWhenLoaded?:boolean
}

interface SingleAudio{
  key:string,
  loop:boolean,
  volume:number,
  buffer?:AudioBuffer,
  loaded:boolean
}

export default class MusicPlayer{
  AudioPool:{[key:string]:SingleAudio};
  listener:AudioListener;
  sound:Audio;
  audioLoader:AudioLoader;
  defaultKey?:string;
  audioCount:number;
  constructor(){
    this.AudioPool = {

    };
    this.audioCount = 0;
    this.listener = new AudioListener();
    this.sound = new Audio(this.listener);
    this.audioLoader = new AudioLoader();
    
  }

  /** add a audio from file and then set a key */
  addMusicFromFile(audioUrl:string,{
    key = undefined,
    loop = false,
    volume = 1,
    playWhenLoaded = false
  }:AudioBufferSetting = {}){
    
    let mapKey = key || audioUrl;
    if(this.AudioPool[mapKey]){
      this.AudioPool[mapKey].loaded = false;
      this.audioLoader.load(audioUrl,(buffer)=>{
        this.AudioPool[mapKey].buffer = buffer;
        this.AudioPool[mapKey].loaded = true;
      })
    } else {
      let newAudio = {
        key:mapKey,
        loop,
        volume,
        loaded:false
      }
      this.AudioPool[mapKey] = newAudio;
      this.audioLoader.load(audioUrl,(buffer)=>{
        this.AudioPool[mapKey].buffer = buffer;
        this.AudioPool[mapKey].loaded = true;
        this.audioCount +=1;
        if(playWhenLoaded){
          this.playByKey(mapKey);
        }
      })
    }
    
  }

  setDefualtAudio(key?:string){
    if(this.defaultKey){

    }
  }

  playByKey(key:string){
    if(this.AudioPool[key] && this.AudioPool[key].loaded){
      const audio = this.AudioPool[key];
      if(audio.buffer){
        this.sound.setBuffer(audio.buffer);
        this.sound.play();
      }
    }
  }
}