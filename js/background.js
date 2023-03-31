import * as THREE from "../three.module.js";
import { ImprovedNoise } from "../js/ImprovedNoise.js";
import { FirstPersonControls } from "../js/FirstPersonControls.js";

let container, stats;
let camera, controls, scene, renderer;
let mesh, texture;

const worldWidth = 256,
  worldDepth = 256;
const clock = new THREE.Clock();

init();
animate();

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfff2f2);
  scene.fog = new THREE.FogExp2(0xfff2f2, 0.0025);

  const data = generateHeight(worldWidth, worldDepth);

  camera.position.set(100, 800, -800);
  camera.lookAt(-100, 810, -800);

  const geometry = new THREE.PlaneGeometry(
    7500,
    7500,
    worldWidth - 1,
    worldDepth - 1
  );
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array;

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * 10;
  }

  texture = new THREE.CanvasTexture(
    generateTexture(data, worldWidth, worldDepth)
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: texture })
  );
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 50;
  controls.lookSpeed = 0.01;
  controls.minPolarAngle = Math.PI / 8; // restrict camera from looking too far up
  controls.maxPolarAngle = -Math.PI / 4; // restrict camera from looking too far down
  controls.verticalMin = THREE.MathUtils.degToRad(-30);
  controls.verticalMax = THREE.MathUtils.degToRad(30);

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();
}

function generateHeight(width, height) {
  let seed = Math.PI / 4;
  window.Math.random = function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const size = width * height,
    data = new Uint8Array(size);
  const perlin = new ImprovedNoise(),
    z = Math.random() * 100;

  let quality = 1;

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width,
        y = ~~(i / width);
      data[i] += Math.abs(
        perlin.noise(x / quality, y / quality, z) * quality * 1.75
      );
    }

    quality *= 5;
  }

  return data;
}

function generateTexture(data, width, height) {
  let context, image, imageData, shade;

  const vector3 = new THREE.Vector3(0, 0, 0);

  const sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    shade = vector3.dot(sun);

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
    imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);

  // Scaled 4x

  const canvasScaled = document.createElement("canvas");
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext("2d");
  context.scale(4, 4);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  for (let i = 0, l = imageData.length; i < l; i += 4) {
    const v = ~~(Math.random() * 5);

    imageData[i] += v;
    imageData[i + 1] += v;
    imageData[i + 2] += v;
  }

  context.putImageData(image, 0, 0);

  var menu = document.createElement("main");
  menu.innerHTML = `
			<header>
			<div class="navbar-header">
				<div class="navbar-social">
				<div class="social-part">
					<a href="https://www.pinterest.com/maharjanelex"><i class="fa fa-pinterest" aria-hidden="true"></i></a>
					<a href="https://github.com/officiallx" target="_blank"><i class="fa fa-github" aria-hidden="true"></i></a>
					<a href="https://instagram.com/ob_nox_ious" target="_blank"><i class="fa fa-instagram" aria-hidden="true"></i></a>
					<a href="https://www.behance.net/elexmaharjan" target="_blank"><i class="fa fa-behance" aria-hidden="true"></i></a>
				</div>
				</div>
			</div>
			</header>
            <div class="mainImg">
                <img src="assets/img/logo-black.png"/>
            </div>
			<div class="col-md-12">
			<div class="navbar justify-content-center">
				<ul class="nav">
				<li class="nav-item">
					<a class="nav-link" href="about">.About_Me( )</a>
				</li>
				<span class="nav-link">/</span>
				<li class="nav-item">
					<a class="nav-link" href="portfolio">.Portfolio( )</a>
				</li>
				<span class="nav-link">/</span>
				<li class="nav-item">
					<a class="nav-link" href="experience">.Experience( )</a>
				</li>
				<span class="nav-link">/</span>
				<li class="nav-item">
					<a class="nav-link" href="resume">.Resume( )</a>
				</li>
				<span class="nav-link">/</span>
				<li class="nav-item">
					<a class="nav-link" href="contact">.Contact( )</a>
				</li>
				</ul>
				
			</div>
			</div>
			<footer> Haku Co. &#8482;</footer>
												`;
  container.appendChild(menu);

  return canvasScaled;
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  controls.update(clock.getDelta());
  renderer.render(scene, camera);
}
