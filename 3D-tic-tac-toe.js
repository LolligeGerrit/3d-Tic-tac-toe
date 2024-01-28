import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


function init3D(){
	//Set up the renderer and the camera
	const renderer = new THREE.WebGLRenderer();
	renderer.domElement.style.width = "50%";
	
	renderer.setSize( window.innerWidth/2,window.innerHeight);
	document.body.appendChild( renderer.domElement );
	
	

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 75, renderer.domElement.width / renderer.domElement.height, 0.1, 1000 );
	camera.position.z = 5;
	camera.position.y = 2;
	//Orbit controls for the camera
	const controls = new OrbitControls( camera, renderer.domElement );
	//Geometry for the spheres representing the players
	const sphere_geometry = new THREE.SphereGeometry( 0.5, 16, 16 );
	
	//Material for the shapes
	const material_line = new THREE.LineBasicMaterial( {transparent: true, opacity: 0.2} );
	const material_sphere = new THREE.MeshBasicMaterial( { color: 0x0000ff} );

	//Meshes for the shapes
	const sphere = new THREE.Mesh( sphere_geometry, material_sphere );

	sphere_geometry.translate(-1, -0.25, 1);
	
	//Function to add a line to the scene
	function Addline(start_x, start_y, start_z, end_x, end_y, end_z) {
		let points = [];
		points.push( new THREE.Vector3( start_x, start_y, start_z ) );
		points.push( new THREE.Vector3( end_x, end_y, end_z ) );
		const line_geometry = new THREE.BufferGeometry().setFromPoints( points );
		const line = new THREE.Line( line_geometry, material_line);
		
		scene.add( line );
	}
	
	//Function to add a cube to the scene
	function AddCubeLine(x, y, z){
		Addline(x, y, z, x+1, y, z);
		Addline(x, y, z, x, y+1, z);
		Addline(x, y, z, x, y, z+1);
		Addline(x+1, y, z, x+1, y+1, z);
		Addline(x+1, y, z, x+1, y, z+1);
		Addline(x, y+1, z, x+1, y+1, z);
		Addline(x, y+1, z, x, y+1, z+1);
		Addline(x, y, z+1, x+1, y, z+1);
		Addline(x, y, z+1, x, y+1, z+1);
		Addline(x, y+1, z+1, x+1, y+1, z+1);
		Addline(x+1, y, z+1, x+1, y+1, z+1);
		Addline(x+1, y+1, z, x+1, y+1, z+1);
		Addline(x+1, y+1, z, x+1, y+1, z+1);
	
	}
	
	//Loop to create the cube of cubes
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			for (let k = 0; k < 3; k++) {
				//The offset is there to make the camera focus on the middle of the cube of cubes
				AddCubeLine(i-1.5, j-0.75, k-1.5);
			}
		}
	}
	
	//Debug sphere
	scene.add( sphere );
	
	controls.update();
	
	function animate() {
		requestAnimationFrame( animate );
		
	
		renderer.render( scene, camera );
	}
	
	
	if ( WebGL.isWebGLAvailable() ) {
	
		// Initiate function or other initializations here
		animate();
	
	} else {
	
		const warning = WebGL.getWebGLErrorMessage();
		document.getElementById( 'container' ).appendChild( warning );
	
	}
	
}
init3D();
