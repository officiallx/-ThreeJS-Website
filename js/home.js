import { OrbitControls } from "./OrbitControls.js";
import { RoomEnvironment } from "./RoomEnvironment.js";

// Create a Three.js scene and camera
var scene = new THREE.Scene();

// Create a Three.js renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

scene.background = new THREE.Color(0xecf9ff);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

var camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

var minZoom = 2; // set the minimum zoom distance
var maxZoom = 10; // set the maximum zoom distance
var zoomSpeed = 0.5; // set the speed of the zoom
var model;
let mixer;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const clock = new THREE.Clock();
const container = document.getElementById("container");

camera.position.set(0, 1, 5);

// Load the glTF model using the GLTFLoader
var loader = new THREE.GLTFLoader();
var pointLight = new THREE.PointLight(0xfaf193, 1, 50);
pointLight.position.set(50, 50, 50); // set the position of the light
pointLight.castShadow = true; // default false
scene.add(pointLight);

//Set up shadow properties for the light
pointLight.shadow.mapSize.width = 512; // default
pointLight.shadow.mapSize.height = 512; // default
pointLight.shadow.camera.near = 0.5; // default
pointLight.shadow.camera.far = 500; // default

loader.load(
  "models/scene.gltf",
  function (gltf) {
    model = gltf.scene;
    model.position.set(1, 1, 0);
    model.scale.set(0.01, 0.01, 0.01);
    model.castShadow = true; //default is false
    model.receiveShadow = true; //default
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();

    animate();
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("wheel", function (event) {
  var delta = event.wheelDelta ? event.wheelDelta : -event.deltaY;

  // Calculate the new camera position
  if (delta > 0 && camera.position.z > minZoom) {
    // Zoom in
    camera.position.z -= zoomSpeed;
  } else if (delta < 0 && camera.position.z < maxZoom) {
    // Zoom out
    camera.position.z += zoomSpeed;
  }

  // Update the camera
  camera.updateProjectionMatrix();
});
