import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from "gsap"
import FeatherScroll from 'scrollfeather';

const scroll = new FeatherScroll();
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 1000)

camera.position.z = 4

let canvas = document.querySelector("canvas")
let renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true})
const pmremGenerator = new THREE.PMREMGenerator(renderer);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1; // you can tweak this

const background = new RGBELoader();
  background.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/goegap_road_1k.hdr', function(texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture    
    scene.environment = envMap;
    texture.dispose(); // clean memory
    pmremGenerator.dispose();
});
let model;
const loader = new GLTFLoader();
loader.load("./DamagedHelmet.gltf", function(gltf){
    model = gltf.scene
    scene.add(gltf.scene)
})

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.002; // subtle shift
composer.addPass(rgbShiftPass);

window.addEventListener("resize", ()=>{
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
})
window.addEventListener("mousemove", (dets)=>{
    let rotationX = (dets.x/window.innerWidth -0.5)* Math.PI*0.4
    let rotationY = (dets.y/window.innerHeight -0.5)* Math.PI*0.4
    gsap.to(model.rotation , {
        x: rotationY,
        y: rotationX,
        ease: "power2",
        duration: 0.9
    })
})
function animate(){
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
    composer.render();
}
animate()
window.move = (destination)=> {
    scroll.scrollTo(destination)
}

if (window.innerWidth < 800) {
 camera.position.z = 7   
}
let contact = document.querySelector(".track")
let vertical = gsap.to(".track", {
    xPercent: -50, // move it halfway to simulate loop
    duration: 10,
    ease: "none",
    repeat: -1
});
contact.addEventListener("mouseenter", ()=>{
    vertical.pause()
})
contact.addEventListener("mouseleave", ()=>{
    vertical.play()
})