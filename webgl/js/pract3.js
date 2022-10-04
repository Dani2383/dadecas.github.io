/** Robot para la práctica 3 */

import * as Three from "../lib/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js";

let renderer, scene, camera;
let planta;

// Variables globales
let robot, angulo = 0, cameraControls, L=100, normals = [];
//Acciones
init();
loadScene();
render();

function setTopCamera(ar){
    let camaraOrtografica;
    if (ar > 1) camaraOrtografica = new Three.OrthographicCamera(-L*ar, L*ar, L, -L, -10, 10000);
    else camaraOrtografica = new Three.OrthographicCamera(-L, L, L/ar, -L/ar, -10, 10000);

    planta = camaraOrtografica.clone();
    planta.position.set(0,L*3,0);
    planta.lookAt(0,0,0);
    planta.up = new Three.Vector3(0,0,-1);

}

function init(){
    console.log("asddsa");
    renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new Three.Scene();
    renderer.setClearColor(0xAAAAAA);
    renderer.autoClear = false;
    let ar = window.innerWidth / window.innerHeight;

    camera = new Three.PerspectiveCamera(75, ar, 0.1, 1000);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    
    //Camara lateral --> 
    camera.position.set(50, 90, 200);
    camera.lookAt(0,100,0);
    setTopCamera(ar);

    window.addEventListener('resize', updateAspectRatio );
}

function loadScene() {
    const matRobot = new Three.MeshNormalMaterial();
    const matSuelo = new Three.MeshNormalMaterial();

    //suelo
    const suelo = new Three.Mesh( new Three.PlaneGeometry(1000, 1000, 10, 10), matSuelo);
    suelo.rotation.x = -Math.PI/2;
    scene.add(suelo);
    suelo.position.y = -0.2;

    //Partes del robot:
    robot = new Three.Object3D();
    robot.position.x = 0;
    robot.position.y = 1;

    //Base del robot:
    const base = new Three.Mesh(new Three.CylinderGeometry(50, 50, 15, 20, 10), matRobot);

    // Brazo:

    const brazo = new Three.Object3D();

    const eje = new Three.Mesh(new Three.CylinderGeometry(20, 20, 18, 10, 10), matRobot);
    eje.rotation.x = Math.PI/2;

    const esparrago = new Three.Mesh(new Three.BoxGeometry(18, 120, 12), matRobot);
    esparrago.position.y = 60;

    const rotula = new Three.Mesh(new Three.SphereGeometry(20, 10, 10), matRobot);
    rotula.position.y = 120;

    //Antebrazo:

    const antebrazo = new Three.Object3D();

    const disco = new Three.Mesh(new Three.CylinderGeometry(22, 22, 6, 10, 10), matRobot);
    const nervios = new Three.Object3D();

    const nervio1 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio1.position.x = 5;
    nervio1.position.z = 5;
    const nervio2 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio2.position.x = -5;
    nervio2.position.z = 5;
    const nervio3 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio3.position.x = 5;
    nervio3.position.z = -5;
    const nervio4 = new Three.Mesh(new Three.BoxGeometry(4, 80, 4), matRobot);
    nervio4.position.x = -5;
    nervio4.position.z = -5;

    nervios.add(nervio1);
    nervios.add(nervio2);
    nervios.add(nervio3);
    nervios.add(nervio4);
    nervios.position.y = 43;

    //Mano:

    const mano = new Three.Object3D();
    const palma = new Three.Mesh(new Three.CylinderGeometry(15, 15, 40, 10, 5), matRobot);
    palma.rotation.x = Math.PI/2;

    const pinza1 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    const pinza2 = new Three.Mesh(new Three.BoxGeometry(19,20,4), matRobot);
    pinza1.position.z = -10;
    pinza2.position.z = 10;
    pinza1.position.x = 14;
    pinza2.position.x = 14;

    //Malla personalizada:

    const malla = new Three.BufferGeometry();

    const coord = [

        23,10,12, 23,10,8, 42,6,8, 42,6,10, // Arriba  0-3
        23,10,12, 23,10,8, 23,-10,8, 23,-10,12, // Detras 4-7
        23,-10,8, 23,-10,12, 42,-6,10, 42,-6,8, // Debajo 8 - 11
        42,6,8, 42,6,10, 42,-6,10, 42,-6,8, // Delante 12-15
        23,10,8, 42,6,8, 23,-10,8, 42,-6,8, // Izquierda 16-19

        23,10,12, 42,6,10, 23,-10,12, 42,-6,10 // Derecha 20-23

    ]
    
    
    // const coord = [23,10,12, 23,10,8, 42,6,8, 42,6,10,           0-3
    //                 23,-10,8, 23,-10,12, 42,-6,10, 42,-6,8];     4-7

    // const colors = [1,0,0, 1,0,1, 1,1,1, 1,1,0,
    //                 0,1,0, 0,1,1, 0,0,1, 0,0,0];

    malla.setAttribute( 'position', new Three.Float32BufferAttribute(coord, 3));
    let vectorPositions = [];

    for(let i = 0;i < coord.length / 3; i++){
        const v = new Three.Vector3( );
        v.fromBufferAttribute(malla.getAttribute('position'),i)
        vectorPositions.push(v)
    }

    getNormalVector(vectorPositions[3], vectorPositions[1], vectorPositions[0]); getNormalVector(vectorPositions[0], vectorPositions[2], vectorPositions[1]); // Arriba
    getNormalVector(vectorPositions[1], vectorPositions[3], vectorPositions[2]); getNormalVector(vectorPositions[2], vectorPositions[0], vectorPositions[3]); // Arriba

    getNormalVector(vectorPositions[5], vectorPositions[7], vectorPositions[4]); getNormalVector(vectorPositions[6], vectorPositions[4], vectorPositions[5]); // Detras
    getNormalVector(vectorPositions[7], vectorPositions[5], vectorPositions[6]); getNormalVector(vectorPositions[4], vectorPositions[6], vectorPositions[7]); // Detras

    getNormalVector(vectorPositions[11], vectorPositions[9], vectorPositions[8]); getNormalVector(vectorPositions[8], vectorPositions[10], vectorPositions[9]); // Debajo
    getNormalVector(vectorPositions[9], vectorPositions[11], vectorPositions[10]); getNormalVector(vectorPositions[10], vectorPositions[8], vectorPositions[11]); // Debajo

    getNormalVector(vectorPositions[13], vectorPositions[15], vectorPositions[12]); getNormalVector(vectorPositions[14], vectorPositions[12], vectorPositions[13]); // Delante
    getNormalVector(vectorPositions[15], vectorPositions[13], vectorPositions[14]); getNormalVector(vectorPositions[12], vectorPositions[14], vectorPositions[15]); // Delante

    getNormalVector(vectorPositions[17], vectorPositions[18], vectorPositions[16]); getNormalVector(vectorPositions[19], vectorPositions[16], vectorPositions[17]); // Izquierda
    getNormalVector(vectorPositions[16], vectorPositions[19], vectorPositions[18]); getNormalVector(vectorPositions[18], vectorPositions[17], vectorPositions[19]); // Izquierda

    getNormalVector(vectorPositions[22], vectorPositions[21], vectorPositions[20]); getNormalVector(vectorPositions[20], vectorPositions[23], vectorPositions[21]); // Derecha
    getNormalVector(vectorPositions[23], vectorPositions[20], vectorPositions[22]); getNormalVector(vectorPositions[21], vectorPositions[22], vectorPositions[23]); // Derecha
    
    // const normals = [0,1,-2, 0,1,-2, -1,0,0, -1,0,0, // Top back
    //                 0,-1,-2, 0,-1,-2, 1,0,0, 1,0,0, //Bot front
    //                 0,0,-1, 0,0,-1, 0,0,1, 0,0,1]; //Left right

    // const indices = [1,0,3, 1,3,2, 0,1,5, 1,4,5, // Top, Back
    //                 5,4,7, 6,5,7, 2,3,6, 2,6,7, // Bot, Front
    //                 1,2,4, 2,7,4, 0,5,3, 3,5,6]; // Left, Right

    const indices = [1,0,3, 1,3,2, 4,5,7, 5,6,7, // Top, Back
                    9,8,11, 10,9,11, 12,13,14, 12,14,15, // Bot, Front
                    16,17,18, 17,19,18, 20,22,21, 21,22,23]; // Left, Right
                    
    malla.setIndex(indices);
    //malla.setAttribute( 'color', new Three.Float32BufferAttribute(colors, 3));
    malla.setAttribute( 'normal', new Three.Float32BufferAttribute(normals, 3));
    const dedo2 = new Three.Mesh(malla, matRobot);
    const dedo1 = new Three.Mesh(malla, matRobot);
    dedo1.rotation.x = Math.PI;


    mano.add(palma);
    mano.add(pinza1);
    mano.add(pinza2);
    mano.add(dedo1);
    mano.add(dedo2);
    mano.position.y = 80;

    antebrazo.add(disco);
    antebrazo.add(nervios);
    antebrazo.add(mano);

    antebrazo.position.y = 120;

    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    brazo.add(antebrazo);


    base.add(brazo);
    robot.add(base);
    scene.add(robot);

}

function render() {
    requestAnimationFrame( render );
    update();
    renderer.clear();
    
    renderer.setViewport(0,0,window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);

    renderer.setViewport(0, 0, window.innerWidth / 4, window.innerHeight / 4)
    renderer.render(scene, planta);
}

function update() {
    angulo += 0.005;
    robot.rotation.y = angulo;
}

function updateAspectRatio()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    let ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;

    if (ar > 1) {
        planta.left = -L*ar;
        planta.right = L*ar;
        planta.top = L;
        planta.bottom = -L;
    } else {
        planta.left = -L;
        planta.right = L;
        planta.top = L/ar;
        planta.bottom = -L/ar;
    }

    planta.updateProjectionMatrix();
    camera.updateProjectionMatrix();
}

function getNormalVector(pos1, pos2, posNormal){
    const normal = new Three.Vector3();
    const x = new Three.Vector3();
    const y = new Three.Vector3();
    x.subVectors(pos1, posNormal);
    y.subVectors(pos2, posNormal);
    normal.crossVectors(x, y);
    normals.push(normal.x, normal.y, normal.z);
}