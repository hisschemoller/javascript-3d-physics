import { getPopulation } from './population.js';

let physicsWorld;
let tmpTrans;

/**
 * Create the physics world.
 */
export function setup() {
  return new Promise((resolve, reject) => {
    Ammo().then(() => {
      console.log('Ammo physics initialised.');
      setupPhysicsWorld();
      resolve(physicsWorld);
    });
  });
}

/**
 * Ammo physics world setup.
 */
function setupPhysicsWorld() {

  // full collision detection algorithm configuration
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();

  // dispatcher to register callbacks for collisions
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

  // bounding box collision detection algorithm 
  const overlappingPairCache = new Ammo.btDbvtBroadphase();

  // solver for collisions
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  // the world's gravity
  const gravity = new Ammo.btVector3(0, -9.8, 0);

  // the physics world
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  physicsWorld.setGravity(gravity);

  tmpTrans = new Ammo.btTransform();
}

/**
 * Step physics world.
 * @param {Number} deltaTime Elapsed time.
 */
export function step(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10);

  getPopulation().forEach(mesh => {
    const body = mesh.userData.physicsBody;
    const motionstate = body.getMotionState();
    if (motionstate) {
      motionstate.getWorldTransform(tmpTrans);
      const p = tmpTrans.getOrigin();
      const q = tmpTrans.getRotation();
      mesh.position.set( p.x(), p.y(), p.z() );
      mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
    }
  });
}
