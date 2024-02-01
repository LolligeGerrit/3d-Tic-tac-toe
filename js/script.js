import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';

let game = [[["", "", ""], ["", "", ""], ["", "", ""]]
    , [["", "", ""], ["", "", ""], ["", "", ""]]
    , [["", "", ""], ["", "", ""], ["", "", ""]]
];

let positions = {
    "game_grid_square_1": [0, 0],
    "game_grid_square_2": [0, 1],
    "game_grid_square_3": [0, 2],
    "game_grid_square_4": [1, 0],
    "game_grid_square_5": [1, 1],
    "game_grid_square_6": [1, 2],
    "game_grid_square_7": [2, 0],
    "game_grid_square_8": [2, 1],
    "game_grid_square_9": [2, 2],
};

let turn = "red";
let game_running;

let moves = [];

let game_state_text = document.getElementById("game_state_text");
let restart_button = document.getElementById("restart_button");
let undo_button = document.getElementById("undo_button");

let first_move = true;

let spheres = [];

function init_page() {
    console.log("initializing game.")
    const loadtime_start = Date.now();

    // Add event listener to the restart button
    restart_button.addEventListener('click', function () {
        reset_game();
        game_running = true;
    });

    // Add event listener to the undo button
    undo_button.addEventListener('click', function () {
        if (moves.length === 0 || !game_running) {
            return;
        }

        let last_move = moves.pop();
        let last_move_square_key = "";

        // Find the square key
        for (let key in positions) {
            if (positions[key][0] === last_move[1] && positions[key][1] === last_move[2]) {
                last_move_square_key = key;
                break;
            }
        }

        // Update the game backend
        game[last_move[0]][last_move[1]][last_move[2]] = "";

        // Switch turns
        if (turn === "red") {
            turn = "blue";
        } else {
            turn = "red";
        }

        // Update the game frontend
        // 2D update
        let square = document.getElementById(last_move_square_key);
        square.innerHTML = "";

        // 3D update
        spheres[spheres.length - 1].material.dispose();
        spheres[spheres.length - 1].geometry.dispose();

        scene.remove(spheres[spheres.length - 1]);
        spheres.pop();

        game_state_text.innerHTML = `Current turn: <span class="text_${turn}">${turn}</span>`;
    });

    for (let i = 1; i < 10; i++) {
        let square = document.getElementById(`game_grid_square_${i}`);

        // Define the event listener
        square.addEventListener('click', function () {
            if (!game_running) {
                return;
            }

            let current_layer = 0;
            while (game[current_layer][positions[square.id][0]][positions[square.id][1]] !== "") {
                current_layer++;
                if (current_layer === 3) {
                    alert("This cell is full! Please choose another one.");
                    return;
                }
            }

            // Update the game backend
            let position = positions[square.id];

            if (first_move && square.id === "game_grid_square_5") {
                alert("That move is blocked");
                return;
            } else {
                game[current_layer][position[0]][position[1]] = turn;
                moves.push([current_layer, position[0], position[1]]);
                first_move = false;
            }


            // Update the game frontend
            square.innerHTML = `${square.innerHTML}<div class="circle_${current_layer} ${turn}"></div>`;
            draw_turn(turn, positions_3d[`square_${current_layer * 9 + parseInt(square.id[square.id.length - 1])}`]);

            // Check for a win
            if (check_win(turn)) {
                game_state_text.innerHTML = `<span class="text_${turn}">${turn}</span> wins!`;
                console.log("Game ended: " + turn + " wins!");
                game_running = false;

                return
            }

            // Check for a full board
            if (check_full_board()) {
                game_state_text.innerHTML = "Draw!";
                console.log("Game ended: draw")
                game_running = false;

                return
            }

            // Switch turns
            if (turn === "red") {
                turn = "blue";
            } else {
                turn = "red";
            }

            //Update the current turn on the frontend
            game_state_text.innerHTML = `Current turn: <span class="text_${turn}">${turn}</span>`

        })
    }

    init3D();
    game_running = true;
    console.log(`Done! (${Date.now() - loadtime_start}ms)`)
}

function check_win() {
    // Check if there is a win position present

    for (let current_layer = 0; current_layer < 3; current_layer++) {
        if (
            // Top down
            areEqual(game[current_layer][0][0], game[current_layer][0][1], game[current_layer][0][2]) || // Row
            areEqual(game[current_layer][1][0], game[current_layer][1][1], game[current_layer][1][2]) || // Row
            areEqual(game[current_layer][2][0], game[current_layer][2][1], game[current_layer][2][2]) || // Row

            areEqual(game[current_layer][0][0], game[current_layer][1][0], game[current_layer][2][0]) || // Conlumn
            areEqual(game[current_layer][0][1], game[current_layer][1][1], game[current_layer][2][1]) || // Conlumn
            areEqual(game[current_layer][0][2], game[current_layer][1][2], game[current_layer][2][2])    // Conlumn

        ) {
            return true
        }
    }
    if (
        //Columns through layers (y-axis)
        areEqual(game[0][0][0], game[1][0][0], game[2][0][0]) ||
        areEqual(game[0][0][1], game[1][0][1], game[2][0][1]) ||
        areEqual(game[0][0][2], game[1][0][2], game[2][0][2]) ||

        areEqual(game[0][1][0], game[1][1][0], game[2][1][0]) ||
        areEqual(game[0][1][1], game[1][1][1], game[2][1][1]) ||
        areEqual(game[0][1][2], game[1][1][2], game[2][1][2]) ||

        areEqual(game[0][2][0], game[1][2][0], game[2][2][0]) ||
        areEqual(game[0][2][1], game[1][2][1], game[2][2][1]) ||
        areEqual(game[0][2][2], game[1][2][2], game[2][2][2])
    ) {
        return true
    }

    // Diagonals
    for (let i = 0; i < 3; i++) {
        if (
            areEqual(game[i][0][0], game[i][1][1], game[i][2][2]) ||
            areEqual(game[i][0][2], game[i][1][1], game[i][2][0]) ||

            areEqual(game[0][i][0], game[1][i][1], game[2][i][2]) ||
            areEqual(game[0][i][2], game[1][i][1], game[2][i][0]) ||

            areEqual(game[0][0][i], game[1][1][i], game[2][2][i]) ||
            areEqual(game[0][2][i], game[1][1][i], game[2][0][i])

        ) {
            return true
        }
    }

    // last 4 diagonals
    if (
        areEqual(game[0][2][0], game[1][1][1], game[2][0][2]) ||
        areEqual(game[2][2][0], game[1][1][1], game[0][0][2]) ||

        areEqual(game[0][0][0], game[1][1][1], game[2][2][2]) ||
        areEqual(game[2][0][0], game[1][1][1], game[0][2][2])
    ) {
        return true
    }
}


function check_full_board() {
    let empty_cells = 0
    for (let board = 0; board < 3; board++) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (game[board][i][j] === "") {
                    empty_cells++;
                }
            }
        }
    }


    if (empty_cells === 0) {
        return true
    }
}

function reset_game() {
    console.log("Restarting.")
    const loadtime_restart = Date.now();

    // Update backend
    game = [[["", "", ""], ["", "", ""], ["", "", ""]]
        , [["", "", ""], ["", "", ""], ["", "", ""]]
        , [["", "", ""], ["", "", ""], ["", "", ""]]

    ];
    turn = "red"
    first_move = true;
    moves = [];

    // Update frontend
    for (let i = 1; i < 10; i++) {
        let square = document.getElementById(`game_grid_square_${i}`);
        square.innerHTML = "";
    }
    game_state_text.innerHTML = `Current turn: <span class="text_${turn}">${turn}</span>`;

    // Remove the spheres
    for (let i = 0; i < spheres.length; i++) {

        spheres[i].material.dispose();
        spheres[i].geometry.dispose();

        scene.remove(spheres[i]);
    }
    spheres = [];
    console.log(`Done! (${Date.now() - loadtime_restart}ms)`)
}

function areEqual() {
    // Thanks! | https://stackoverflow.com/a/9973399/18337178

    let len = arguments.length;
    for (let i = 1; i < len; i++) {
        if (arguments[i] === "" || arguments[i] !== arguments[i - 1])
            return false;
    }
    return true;
}


// 3D
const scene = new THREE.Scene();
let container_3d = document.getElementById("container_3d");

let positions_3d = {};

let count = 1;
for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
        for (let x = 0; x < 3; x++) {

            positions_3d[`square_${count}`] = [x - 1, y, z - 1];
            count++;
        }
    }
}

//Function to add a line to the scene
function Addline(start_x, start_y, start_z, end_x, end_y, end_z) {
    let points = [];
    points.push(new THREE.Vector3(start_x, start_y, start_z));
    points.push(new THREE.Vector3(end_x, end_y, end_z));
    const line_geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material_line = new THREE.LineBasicMaterial({transparent: true, opacity: 0.3, color: 0x000000});
    const line = new THREE.Line(line_geometry, material_line);

    scene.add(line);
}

//Function to add a cube to the scene
function AddCubeLine(x, y, z) {
    Addline(x, y, z, x + 1, y, z);
    Addline(x, y, z, x, y + 1, z);
    Addline(x, y, z, x, y, z + 1);
    Addline(x + 1, y, z, x + 1, y + 1, z);
    Addline(x + 1, y, z, x + 1, y, z + 1);
    Addline(x, y + 1, z, x + 1, y + 1, z);
    Addline(x, y + 1, z, x, y + 1, z + 1);
    Addline(x, y, z + 1, x + 1, y, z + 1);
    Addline(x, y, z + 1, x, y + 1, z + 1);
    Addline(x, y + 1, z + 1, x + 1, y + 1, z + 1);
    Addline(x + 1, y, z + 1, x + 1, y + 1, z + 1);
    Addline(x + 1, y + 1, z, x + 1, y + 1, z + 1);
    Addline(x + 1, y + 1, z, x + 1, y + 1, z + 1);

}


function createBoard() {
    //Loop to create the cube of cubes
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                // The offset is there to make the camera focus on the middle of the board
                AddCubeLine(i - 1.5, j - 1.3, k - 1.5);
            }
        }
    }
}

function draw_turn(turn, position) {
    // Materials
    const material_red = new THREE.MeshStandardMaterial({color: 0xff0000});

    const material_blue = new THREE.MeshStandardMaterial({transparent: false, color: 0x0048ff});

    // Geometry
    const sphere_geometry = new THREE.SphereGeometry(0.5, 16, 16);

    let material_sphere;

    if (turn === "red") {
        material_sphere = material_red;
    } else {
        material_sphere = material_blue;
    }

    //Meshes for the shapes
    const sphere = new THREE.Mesh(sphere_geometry, material_sphere);
    sphere_geometry.translate(position[0], position[1] - 0.8, position[2]);

    sphere.castShadow = true; //default is false
    sphere.receiveShadow = true; //default

    spheres.push(sphere);
    scene.add(sphere);

}


function init3D() {
    //Set up the renderer and the camera
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container_3d.offsetWidth - 3, container_3d.offsetHeight - 3);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    RectAreaLightUniformsLib.init();


    // Add the renderer to the container
    container_3d.appendChild(renderer.domElement);

    // Create the right scene background
    scene.background = new THREE.Color("white");

    const camera = new THREE.PerspectiveCamera(80, renderer.domElement.width / renderer.domElement.height, 0.1, 1000);
    camera.position.z = 3.5;
    camera.position.y = 1;

    // Orbit controls for the camera
    const controls = new OrbitControls(camera, renderer.domElement);

    // Restrict the camera movement
    // zoom
    controls.maxDistance = 7;
    controls.minDistance = 3;
    // damping (smoothing motion when rotating)
    controls.enableDamping = true;
    // panning
    controls.enablePan = false;

    // Light properties
    const color = 0xFFFFFF;
    const width = 10;
    const height = 10;

    // Main light (top left)
    const light = new THREE.RectAreaLight(color, 2, width, height);
    light.position.set(5, 5, 0);
    light.rotation.x = THREE.MathUtils.degToRad(-45);

    // Secondary light (bottom)
    const light_2 = new THREE.RectAreaLight(color, 0.2, width, height);
    light_2.position.set(0, -5, 0)
    light_2.rotation.x = THREE.MathUtils.degToRad(90);

    // Add the lights to the scene
    scene.add(light);
    scene.add(light_2)


    //Create the board
    createBoard();


    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();

    }

    if (WebGL.isWebGLAvailable()) {
        // Initiate function or other initializations here

        animate();

    } else {
        document.getElementById("container_3d").innerHTML = "3D view can't be loaded, webGL is not available."
        const warning = WebGL.getWebGLErrorMessage();
        alert(warning);
    }

}

init_page();