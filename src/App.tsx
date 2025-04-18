import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three'
import "./App.css"
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Character from './card/character';
import MusicPlayer from './audio/musicPlayer';
import TouchGamepad from './components/TouchGamepad'
function App() {
  /** render Window Container */
  const conntainerRef = useRef<HTMLHeadingElement>(null);

  /** renderer */
  const renderer = useRef<THREE.WebGLRenderer>();

  /** scene */
  const scene = useRef<THREE.Scene>();

  /** camera */
  const camera = useRef<THREE.PerspectiveCamera>();

  /** clock used for countting delta time */
  const clock = useRef<THREE.Clock>(new THREE.Clock());

  /** Date */
  const date = useRef<Date>(new Date());

  /** test box */
  const boxRef = useRef<THREE.Object3D>();

  const musicPlayer = useRef<MusicPlayer>(new MusicPlayer());

  const animationId = useRef<number>();

  const controls = useRef<OrbitControls>();

  const textureLoader = useRef<THREE.TextureLoader>(new THREE.TextureLoader());

  const character = useRef<Character>();

  const [startClick, setStartClick] = useState<boolean>(false)

  const gamepadController = useRef({
    up:false,
    down:false,
    left:false,
    right:false,
    run:false,
    action:false,
  });

  /** */
  // init a three.js renderer camera and scene
  useEffect(()=>{
    // init renderer
    const renderertemp = new THREE.WebGLRenderer({
      antialias:true
    })

    renderer.current = renderertemp;

    // init scene

    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(0.8,0.8,0.8);
    // init camera;
    camera.current = new THREE.PerspectiveCamera(45,(window.innerWidth/window.innerHeight),0.1, 100);
    camera.current.position.set(-50,5,10);
    camera.current.lookAt(new THREE.Vector3(-50,0,0));
    
    initBackGroudMusic();

    boxRef.current = initBox();
    //scene.current.add(boxRef.current);
    
    if(conntainerRef.current){
      conntainerRef.current.appendChild(renderer.current.domElement);
      window.addEventListener('resize',()=>{
        windowResize(window.innerWidth,window.innerHeight);
      })
    }

    const grassGround = initGround(120,20);
    scene.current.add(grassGround);

    const flowers = initFlowers(200,120,20,1);
    scene.current.add(flowers);
    
    const grass = initGrasses(6000,120,20,1);
    const grass2 = initGrasses(10000,120,20,2);
    scene.current.add(grass);
    scene.current.add(grass2);

    const trees = initTrees(10,120,20,1);
    const trees2 = initTrees(10,120,20,2);
    const trees3 = initTrees(10,120,20,3);
    
    scene.current.add(trees);
    scene.current.add(trees2);
    scene.current.add(trees3);

    character.current = new Character();
    scene.current.add(character.current.renderObj);
    character.current.renderObj.position.set(-50,0,0);


    windowResize(window.innerWidth,window.innerHeight);
    initEvent();
    initControls();
    animate();
    window.addEventListener("scroll",(e)=>{
      e.preventDefault();
    })
    return ()=>{
      disposeScene();
    }
  },[]);

  function initBackGroudMusic(){
    musicPlayer.current.addMusicFromFile('./assets/music/bluebonnet_in_b_major.mp3',{
      key:"normalBackGround1",
      volume:0.6,
      playWhenLoaded:false
    })
    if(camera.current){
      camera.current.add(musicPlayer.current.listener);
    }
  }

  // init orbit controller
  const initControls = () => {
    if(camera.current && renderer.current){
      //controls.current = new OrbitControls(camera.current,renderer.current.domElement);
      //controls.current.target = new THREE.Vector3(-50,0,0)
      //controls.current.update();
    }
  }

  // animation
  const animate = () => {
    if(clock.current){
      const delta = clock.current.getDelta();
      update(delta);
      if(character.current){
        character.current.movingUp = gamepadController.current.up;
        character.current.movingDown = gamepadController.current.down;
        character.current.movingLeft = gamepadController.current.left;
        character.current.movingRight = gamepadController.current.right;
        character.current.actionAttempt = gamepadController.current.action?'attack':'none';
        character.current.running = gamepadController.current.run;
        if(gamepadController.current.run){
          
        }
        character.current.update(delta);
        if(camera.current){
          const cameraPositionCurrent = camera.current.position.clone();
          const target = character.current.renderObj.position.clone().add(new Vector3(0,5,10));
          const direction = target.clone().sub(cameraPositionCurrent);
          camera.current.position.copy(cameraPositionCurrent.add(direction.multiplyScalar(0.04)));
        }
      }
    }

    
    render();
    animationId.current = requestAnimationFrame(animate)
  }

  // render scene function
  const render = () => {
    if(renderer.current && camera.current && scene.current){
      renderer.current.render(scene.current, camera.current);
    }
  }

  // logic update
  const update = (delta:number) => {
    boxUpdate(delta)
  }

  // disposeScene when component unmount
  function disposeScene(){
    if(renderer.current){
      if(!!animationId.current){
        // stop rendering
        cancelAnimationFrame(animationId.current);
      }
      // remove domelement
      if(conntainerRef.current) {
        conntainerRef.current.removeChild(renderer.current.domElement);
      }
      //
      renderer.current.dispose();
      renderer.current.forceContextLoss();
    }
  }

  const keydownFunction = (ev:KeyboardEvent) => {
    switch(ev.key){
      case 'a':
      case 'A':
        gamepadController.current.left = true;
        break;
      case 'w':
      case 'W':
        gamepadController.current.up = true;
        break;
      case 's':
      case 'S':
        gamepadController.current.down = true;
        break;
      case 'd':
      case 'D':
        gamepadController.current.right = true;
        break;
      case 'Shift':
        gamepadController.current.run = true;
        break;
      case 'j':
        gamepadController.current.action = true;
        break;
      default:
        console.log('default',ev.key);
        break;
    }
  }

  const keyupFunction = (ev:KeyboardEvent) => {
    switch(ev.key){
      case 'a':
      case 'A':
        gamepadController.current.left = false;
        break;
      case 'w':
      case 'W':
        gamepadController.current.up = false;
        break;
      case 's':
      case 'S':
        gamepadController.current.down = false;
        break;
      case 'd':
      case 'D':
        gamepadController.current.right = false;
        break;
      case 'Shift':
        gamepadController.current.run = false;
        break;
      case 'j':
      case 'J':
        gamepadController.current.action = false;
        break;
      default:
        break;
    }
  }


  // reset renderer size and canvas size
  function windowResize(width:number,height:number){
    if(conntainerRef.current &&  renderer.current){
      renderer.current.domElement.width = width;
      renderer.current.domElement.height = height;

      renderer.current.setSize(width,height);

      renderer.current.domElement.width = width;
      renderer.current.domElement.height = height;

      renderer.current.domElement.style.width = '100%';
      renderer.current.domElement.style.height = '100%';

      // update camera
      if(camera.current){
        camera.current.aspect = width/height;
        camera.current.updateProjectionMatrix();
      }

    }
  }

  function initEvent(){
    document.addEventListener('keydown',keydownFunction)
    document.addEventListener('keyup',keyupFunction)
  }

  function initBox(){
    const boxMesh = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color:0xff00ff
    })
    const box = new THREE.Mesh(boxMesh,material);
    return box;
  }

  function initTrees(number:number,w:number,h:number,type:number){
    const tree = initTreeCard(type);
    const treeGroup = new THREE.InstancedMesh(tree.geometry,tree.material,number);
    const dummy = new THREE.Object3D();
    for(let i = 0 ; i < number; i++){
      const positionx = Math.random()*w-(w/2);
      const positiony = 0;
      const positionz = Math.random()*h-(h/2);
      const position = new THREE.Vector3(positionx,positiony,positionz);
      dummy.position.copy(position);
      const scale = Math.random() +1;
      dummy.scale.set(scale,scale,scale)
      dummy.updateMatrix();
      treeGroup.setMatrixAt(i,dummy.matrix);
    }
    return treeGroup;
  }

  function initTreeCard(type:number):THREE.Mesh{
    
    const cardMesh = new THREE.PlaneGeometry(3,3);
    cardMesh.translate(0,1.5,0)
    const cardMaterial = new THREE.MeshBasicMaterial({
      map:textureLoader.current.load('./assets/images/plants/tree_'+type+'.png'),
      transparent:true,
      alphaTest:0.4,
      side:THREE.DoubleSide
    })
    const card = new THREE.Mesh(cardMesh,cardMaterial);
    return card;
  }

  function initFlowers(number:number,w:number,h:number,type:number){
    const flower = initFlowerCard(type);
    const flowerGroup = new THREE.InstancedMesh(flower.geometry, flower.material, number);
    const flowerDummy = new THREE.Object3D();
    for(let i = 0; i < number; i++){
      const positionx = Math.random() * w - ( w / 2 );
      const positiony = 0;
      const positionz = Math.random() * h - ( h / 2 );
      const position = new THREE.Vector3(positionx,positiony,positionz);
      flowerDummy.position.copy(position);
      flowerDummy.updateMatrix();
      flowerGroup.setMatrixAt(i, flowerDummy.matrix);
    }
    return flowerGroup;
  }

  function initFlowerCard(type:number):THREE.Mesh{
    const cardMesh = new THREE.PlaneGeometry(2,2);
    cardMesh.translate(0,1,0);
    const cardMaterial = new THREE.MeshBasicMaterial({
      map:textureLoader.current.load('./assets/images/plants/flower_'+type+'.png'),
      transparent:true,
      alphaTest:0.4,
      side:THREE.DoubleSide
    });
    const card = new THREE.Mesh(cardMesh, cardMaterial);
    return card;
  }

  function initGround(w:number,h:number):THREE.Mesh{
    const groundGeometry = new THREE.PlaneGeometry(w,h);
    const groundMeshMaterial = new THREE.MeshBasicMaterial({
      color:0x9a5204
    })
    const groundGrass = new THREE.Mesh(groundGeometry,groundMeshMaterial);
    groundGrass.rotation.x = -Math.PI/2;
    return groundGrass;
  }

  function initGrassCard(number:number):THREE.Mesh{
    const cardMesh = new THREE.PlaneGeometry(0.5,0.5);
    cardMesh.translate(0,0.25,0);
    const grassCardMaterial = new THREE.MeshBasicMaterial({
      map:textureLoader.current.load('./assets/images/plants/grass_'+number+'.png'),
      transparent:true,
      alphaTest:0.4,
      side:THREE.DoubleSide
    })
    const grassCard = new THREE.Mesh(cardMesh,grassCardMaterial);
    return grassCard;
  }

  function initGrasses(number:number,w:number,h:number,grassType:number){
    const grass = initGrassCard(grassType);
    const dummy = new THREE.Object3D();
    const grassGroup = new THREE.InstancedMesh(grass.geometry,grass.material,number);
    for(let i = 0; i < number; i++){

      const newPositionZ = h * Math.random() - (h/2);
      const newPositionX = w * Math.random() - (w/2);

      dummy.position.set(newPositionX,0,newPositionZ);
      dummy.updateMatrix();
      grassGroup.setMatrixAt(i,dummy.matrix);
    }
    return grassGroup;
  }

  const boxUpdate = (delta:number) => {
    if(boxRef.current){
      boxRef.current.rotation.x += delta * 1;
    }
  }

  return (
    <div className="renderContainer" style={
      {
        width:'100%',
        height:'100%',
        position:'fixed',
        top:0,
        left:0,
      }
    }
    >
      <div style={
      {
        width:'100%',
        height:'100%',
        position:'absolute',
        top:0,
        left:0,
      }}
        ref={conntainerRef}
      >
        <TouchGamepad touchControlEvent={(direction)=>{
          
          const length = direction.length();
          const bound = 0.2;
          gamepadController.current.left = false;
          gamepadController.current.right = false;
          gamepadController.current.up = false;
          gamepadController.current.down = false;
          if( direction.x < bound && direction.x > -bound && direction.y < bound && direction.y > -bound ){
            
          }
          if( length > 0.7 ) {
            gamepadController.current.run = true;
          } else {
            gamepadController.current.run = false;
          }
          if( direction.x > bound){
            gamepadController.current.right = true;
            gamepadController.current.left = false;
          }
          if( direction.x < -bound ){
            gamepadController.current.left = true;
            gamepadController.current.right = false;
          }
          if( direction.y > bound){
            gamepadController.current.up = true;
            gamepadController.current.down = false;
          }
          if( direction.y < -bound ){
            gamepadController.current.down = true;
            gamepadController.current.up = false;
          }
        }}/>
        
      </div>
      <button className="start" style={{display:startClick?"none":"block"}} onClick={()=>{
          setStartClick(true);
          musicPlayer.current.playByKey("normalBackGround1");
          window.document.body.requestFullscreen();
        }}>start</button>
    </div>
  );
}

export default App;
