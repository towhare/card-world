import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

  const animationId = useRef<number>();

  const controls = useRef<OrbitControls>();


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
    scene.current.background = new THREE.Color(0.1,0.2,0.8);;

    // init camera;
    camera.current = new THREE.PerspectiveCamera(45,(window.innerWidth/window.innerHeight),0.1, 1000);
    camera.current.position.set(0,0,20);
    camera.current.lookAt(scene.current.position);

    boxRef.current = initBox();
    //scene.current.add(boxRef.current);
    
    if(conntainerRef.current){
      conntainerRef.current.appendChild(renderer.current.domElement);
      window.addEventListener('resize',()=>{
        windowResize(window.innerWidth,window.innerHeight);
      })
    }

    const trees = initTrees();
    scene.current.add(trees);



    windowResize(window.innerWidth,window.innerHeight);
    initControls();
    animate();
    return ()=>{
      disposeScene();
    }
  });

  // init orbit controller
  const initControls = () => {
    if(camera.current && renderer.current){
      controls.current = new OrbitControls(camera.current,renderer.current.domElement);
    }
  }

  // animation
  const animate = () => {
    if(clock.current){
      const delta = clock.current.getDelta();
      update(delta);
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

  function initBox(){
    const boxMesh = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color:0xff00ff
    })
    const box = new THREE.Mesh(boxMesh,material);
    return box;
  }

  function initTrees(){
    const treeGroup = new THREE.Group();
    const tree = initTreeCard();
    for(let i = 0 ; i < 30; i++){
      const positionx = Math.random()*20-10;
      const positiony = 0;
      const positionz = Math.random()*3-1.5;
      const position = new THREE.Vector3(positionx,positiony,positionz);
      const newTree = tree.clone();
      const scaleFector = 1 * (1 +  Math.random()*0.1);
      newTree.scale.set(scaleFector,scaleFector,scaleFector);
      if(newTree instanceof THREE.Mesh){
        if(newTree.material){
          const numb = Math.random()*0.1+0.9;
          newTree.material.color = new THREE.Color(numb,numb,numb);
        }
      }
      newTree.position.copy(position);
      treeGroup.add(newTree);
    }
    return treeGroup;
  }


  function initTreeCard():THREE.Mesh{
    const textureLoader = new THREE.TextureLoader();
    const cardMesh = new THREE.PlaneGeometry(3,3);
    cardMesh.translate(0,1.5,0)
    const cardMaterial = new THREE.MeshBasicMaterial({
      map:textureLoader.load('/assets/images/plants/tree_1.png'),
      transparent:true,
      alphaTest:0.4,
      side:THREE.DoubleSide
    })
    const card = new THREE.Mesh(cardMesh,cardMaterial);
    return card;
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
    ref={conntainerRef}
    >
    </div>
  );
}

export default App;
