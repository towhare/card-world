
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
  AudioPool:Map<string,{loaded?:boolean,buffer?:AudioBuffer}>;
  listener:AudioListener;
  sound:Audio;
  audioLoader:AudioLoader;
  defaultKey?:string;
  audioCount:number;
  constructor(){
    this.AudioPool = new Map();
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
    const audio = this.AudioPool.get(mapKey);
    if(audio){
      audio.loaded = false;
      this.audioLoader.load(audioUrl,(buffer)=>{
        audio.buffer = buffer;
        audio.loaded = true;
        
      })
    } else {
      let newAudio = {
        key:mapKey,
        loop,
        volume,
        loaded:false
      }

      this.AudioPool.set(mapKey,newAudio);
      console.log('set key',this.AudioPool)
      this.audioLoader.load(audioUrl,(buffer)=>{
        const audioSetting = this.AudioPool.get(mapKey);
        if( audioSetting ) {
          console.log('add buffer',)
          audioSetting.buffer = buffer;
          audioSetting.loaded = true;
          this.audioCount +=1;
          if(playWhenLoaded){
            this.playByKey(mapKey);
          }
        }
      })
    }
    
  }

  setDefualtAudio(key?:string){
    if(this.defaultKey){

    }
  }

  playByKey(key:string){
    const audiosetting = this.AudioPool.get(key);
    if(audiosetting && audiosetting.loaded){
      const audio = audiosetting;
      if(audio.buffer){
        console.log('play',key)
        this.sound.setBuffer(audio.buffer);
        this.sound.setLoop(true);
        if( this.sound.isPlaying ) {
          console.log('is playing')
        } else {
          console.log('play')
          this.sound.play()
        }
        
        
      }
    } else {
      console.log('not load or can not find key')
      console.log('this.AudioPool', this.AudioPool, key);
      console.log('audiosetting', this.AudioPool.get(key));
    }
  }
}