import {
  BoxBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  SphereBufferGeometry,
} from '../lib/three/build/three.module.js';

const rigidBodies = [];
const colGroupPlane = 1;
const colGroupRedBall = 2;
const colGroupGreenBall = 4;

/**
 * 
 * @param {*} scene 
 * @param {*} physicsWorld 
 */
function createBall(scene, physicsWorld) { 
  const pos = {x: 0, y: 20, z: -50};
  const radius = 1;
  const quat = {x: 0, y: 0, z: 0, w: 1};
  const mass = 1;

  // threeJS Section
  const ball = new Mesh(new SphereBufferGeometry(radius), new MeshPhongMaterial({color: 0xff0505}));
  ball.position.set(pos.x, pos.y, pos.z);
  ball.castShadow = true;
  ball.receiveShadow = true;
  scene.add(ball);

  // Ammojs Section
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin( new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
  const motionState = new Ammo.btDefaultMotionState( transform );

  const colShape = new Ammo.btSphereShape(radius);
  colShape.setMargin( 0.05 );

  const localInertia = new Ammo.btVector3(0, 0, 0);
  colShape.calculateLocalInertia(mass, localInertia);

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);
  body.setRestitution(0.8);

  physicsWorld.addRigidBody( body, colGroupRedBall, colGroupPlane | colGroupGreenBall );
  
  ball.userData.physicsBody = body;
  rigidBodies.push(ball);
}

/**
 * 
 * @param {*} scene 
 * @param {*} physicsWorld 
 */
function createBlock(scene, physicsWorld) {
  const pos = {x: 0, y: -10, z: -50};
  const scale = {x: 50, y: 0.2, z: 50};
  const quat = {x: 0, y: 0, z: 0, w: 1};
  const mass = 0;

  //threeJS Section
  const blockPlane = new Mesh(new BoxBufferGeometry(), new MeshPhongMaterial({color: 0xa0afa4}));
  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);
  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;
  scene.add(blockPlane);

  //Ammojs Section
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
  transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
  const motionState = new Ammo.btDefaultMotionState( transform );

  const colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
  colShape.setMargin( 0.05 );

  const localInertia = new Ammo.btVector3( 0, 0, 0 );
  colShape.calculateLocalInertia( mass, localInertia );

  const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
  const body = new Ammo.btRigidBody(rbInfo);
  body.setRestitution(0.8);

  physicsWorld.addRigidBody( body, colGroupPlane, colGroupRedBall );
}

/**
 * Get the list of bodies in the physics world.
 * @returns {Array} 
 */
export function getPopulation() {
  return rigidBodies;
}

/**
 * Create the physics and 3D world population.
 * @param {Object} scene 3D scene.
 * @param {Object} physicsWorld Ammo world.
 */
export function populateWorld(scene, physicsWorld) {
  createBall(scene, physicsWorld);
  createBlock(scene, physicsWorld);
}
