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

let game_state_text = document.getElementById("game_state_text");
let restart_button = document.getElementById("restart_button")

function init_game() {
    console.log("initializing game.")
    const loadtime_start = Date.now();

    // Add event listener to the restart button
    restart_button.addEventListener('click', function () {
        reset_game();
        game_running = true;
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
                    alert("This cell is full! Please choose another one.")
                    return;
                }
            }


            // Update the game backend
            let position = positions[square.id];
            game[current_layer][position[0]][position[1]] = turn;

            // Update the game frontend
            square.innerHTML = `${square.innerHTML}<div class="circle_${current_layer} ${turn}"></div>`;

            // Check for a win
            if (check_win(turn)) {
                game_state_text.innerHTML = `${turn} wins!`;
                console.log("Game ended: " + turn + " wins!")
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
            game_state_text.innerHTML = `Current turn: ${turn}`;
            console.info(game)

        })
    }
    game_running = true;
    console.log(`Done! (${Date.now() - loadtime_start}ms)`)
}

function check_win(turn) {
    const checkwin_loadtime_start = Date.now();
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

    console.log(`Done! (${Date.now() - checkwin_loadtime_start}ms)`)
}


function check_full_board() {
    let empty_cells = 0
    for (let board = 0; board < 3; board ++) {
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
    console.log("The game has ended, restarting.")

    // Update backend
    game = [[["", "", ""], ["", "", ""], ["", "", ""]]
        , [["", "", ""], ["", "", ""], ["", "", ""]]
        , [["", "", ""], ["", "", ""], ["", "", ""]]

    ];
    turn = "red"

    // Update frontend
    for (let i = 1; i < 10; i++) {
        let square = document.getElementById(`game_grid_square_${i}`);
        square.innerHTML = "";
    }
    game_state_text.innerHTML = `Current turn: ${turn}`;

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