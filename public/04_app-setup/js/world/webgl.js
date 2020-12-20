import { dispatch, getActions, STATE_CHANGE, } from '../store/store.js';
import { step, } from './physics.js';
import { populateWorld, } from './population.js';
import addWindowResizeCallback from '../view/windowresize.js';
import { 
  AmbientLight,
  DirectionalLight,
  Clock,
  Color,
  HemisphereLight,
  MathUtils,
  PCFShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer 
} from '../lib/three/build/three.module.js';
import { OrbitControls } from '../lib/three/examples/jsm/controls/OrbitControls.js';

let camera,
  canvasRect,
  clock,
  intersection,
  orbitControls,
  raycaster,
  renderer,
  rootEl,
  scene;
  
/**
 * Add event listeners.
 */
function addEventListeners() {
  document.addEventListener(STATE_CHANGE, onStateChange);
  addWindowResizeCallback(onWindowResize);
}

/**
 * Update the physics world and render the results in 3D.
 */
function draw() {
  const deltaTime = clock.getDelta();
  step(deltaTime);
  renderer.render(scene, camera);
  requestAnimationFrame(draw);
}

/**
 * App's state has changed.
 * @param {Object} e CustomEvent from Store when state has been updated.
 */
function onStateChange(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {

    case actions.POPULATE:
      console.log('webgl POPULATE');
      break;
  }
}

/**
 * Window resize event handler.
 * @param {Boolean} isFirstRun True if function is called as part of app setup.
 */
function onWindowResize(isFirstRun = false) {
  canvasRect = renderer.domElement.getBoundingClientRect();
  renderer.setSize(window.innerWidth, window.innerHeight - canvasRect.top);
  camera.aspect = window.innerWidth / (window.innerHeight - canvasRect.top);
  camera.updateProjectionMatrix();
  canvasRect = renderer.domElement.getBoundingClientRect();

  // move camera further back when viewport height increases so objects stay the same size 
  let scale = 0.01; // 0.15;
  let fieldOfView = camera.fov * (Math.PI / 180); // convert fov to radians
  let targetZ = canvasRect.height / (2 * Math.tan(fieldOfView / 2));
  camera.position.set(camera.position.x, camera.position.y, targetZ * scale);
  
  // orbitControls.saveState();

  // new viewport size in 3D units at a given distance from the camera.
  // @see https://stackoverflow.com/questions/13350875/three-js-width-of-view/13351534#13351534
  const dist = camera.position.z;
  const vFOV = MathUtils.degToRad(camera.fov); // convert vertical fov to radians
  const visibleHeight = 2 * Math.tan( vFOV / 2 ) * dist;
  const visibleWidth = visibleHeight * camera.aspect;
  dispatch(getActions().resize(visibleWidth, visibleHeight));

  if (!isFirstRun) {
    dispatch(getActions().populate());
  }
}

/**
 * General setup of the module.
 */
export function setup(physicsWorld) {
  setupWebGLWorld();
  populateWorld(scene, physicsWorld);
  addEventListeners();
  onWindowResize(true);
  draw();
}

/**
 * Create the 3D scene, lights, cameras.
 */
function setupWebGLWorld() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xbfd1e5);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap; // PCFSoftShadowMap

  rootEl = document.querySelector('#canvas-container');
  rootEl.appendChild(renderer.domElement);

  clock = new Clock();

  raycaster = new Raycaster();

  intersection = new Vector3();

  scene = new Scene();
  scene.background = new Color( 0xbfd1e5 );

  camera = new PerspectiveCamera(45, 1, 1, 500);
  camera.name = 'camera';
  camera.lookAt(new Vector3(0, 0, 0));
  scene.add(camera);

  // const ambientLight = new AmbientLight(0xffffff);
  // scene.add(ambientLight);

  const hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 0.1 );
  hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
  hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
  hemiLight.position.set( 0, 50, 0 );
  scene.add( hemiLight );

  const SHADOW_SIZE = 50;
  const SHADOW_FAR = 13500;
  const directionalLight = new DirectionalLight(0xffffff, 1);
  // directionalLight.position.set(-0.5, 0.5, -1.5).normalize();
  directionalLight.position.set(-1, 1.75, 1);
  directionalLight.position.multiplyScalar(100);
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.left = -SHADOW_SIZE;
  directionalLight.shadow.camera.right = SHADOW_SIZE;
  directionalLight.shadow.camera.top = SHADOW_SIZE;
  directionalLight.shadow.camera.bottom = -SHADOW_SIZE;
  directionalLight.shadow.camera.far = SHADOW_FAR;
  scene.add(directionalLight);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.update();
  orbitControls.saveState();
  orbitControls.enabled = true;

  // const control = new TransformControls(camera, renderer.domElement);
}
