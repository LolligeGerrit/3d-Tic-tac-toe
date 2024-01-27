let game = [["", "", ""], ["", "", ""], ["", "", ""]];

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

let turn = "X";
let game_timeout_time = 2000;
let block_game = false;

let game_state_text = document.getElementById("game_state_text");

function init_game() {
    console.log("initializing game.")
    const loadtime_start = Date.now();


    for (let i = 1; i < 10; i++) {
        let square = document.getElementById(`game_grid_square_${i}`);

        // Define the event listener
        square.addEventListener('click', function () {
            if (block_game) {
                return;
            }


            // Check if the cell is already occupied
            if (square.innerHTML !== "") {
                alert("This cell is already occupied, please choose another one.")
                return;
            }


            // Update the game backend
            position = positions[square.id];
            game[position[0]][position[1]] = turn;

            // Update the game frontend
            square.innerHTML = turn;

            // Check for a win
            if (check_win(turn)) {
                game_state_text.innerHTML = `${turn} wins!`;
                console.log("Game ended: " + turn + " wins!")
                block_game = true;
                setTimeout(end_game, game_timeout_time);

                return
            }

            // Check for a full board
            if (check_full_board()) {
                game_state_text.innerHTML = "Draw!";
                console.log("Game ended: draw")
                block_game = true;
                setTimeout(end_game, game_timeout_time);

                return
            }

            // Switch turns
            if (turn === "X") {
                turn = "O";
            } else {
                turn = "X";
            }

            //Update the current turn on the frontend
            game_state_text.innerHTML = `Current turn: ${turn}`;

        })
    }

    console.log(`Done! (${Date.now() - loadtime_start}ms)`)
}

function check_win(turn) {
    // Check if there is a win position present

    if (
        // Check these for all layers (vertical)
        game[0][0] === turn && game[0][1] === turn && game[0][2] === turn || // Row
        game[1][0] === turn && game[1][1] === turn && game[1][2] === turn || // Row
        game[2][0] === turn && game[2][1] === turn && game[2][2] === turn || // Row

        game[0][0] === turn && game[1][0] === turn && game[2][0] === turn || // Conlumn
        game[0][1] === turn && game[1][1] === turn && game[2][1] === turn || // Conlumn
        game[0][2] === turn && game[1][2] === turn && game[2][2] === turn || // Conlumn

        game[0][0] === turn && game[1][1] === turn && game[2][2] === turn || // Diagonal
        game[0][2] === turn && game[1][1] === turn && game[2][0] === turn)  //Diagonal
        // End of checking all layers (vertical)

    {
        return true
    }
}


function check_full_board() {
    let empty_cells = 0

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (game[i][j] === "") {
                empty_cells++;
            }
        }
    }

    if (empty_cells === 0) {
        return true
    }
}

function end_game() {

    console.log("The game has ended, restarting.")

    // Update frontend
    for (let i = 1; i < 10; i++) {
        let square = document.getElementById(`game_grid_square_${i}`);
        square.innerHTML = "";
    }
    // Update backend
    game = [["", "", ""], ["", "", ""], ["", "", ""]];
    turn = "X"

    block_game = false;
    game_state_text.innerHTML = "Current turn: X";
}