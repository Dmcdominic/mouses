//check README.md for more information

/// <reference path="TSDef/p5.global-mode.d.ts" />

//create a socket connection
var socket;
var pointer;
//I send updates at the same rate as the server update
var UPDATE_TIME = 1000 / 10;

//setup is called when all the assets have been loaded
function preload() {
    //load the image and store it in pointer
    pointer = loadImage('assets/pointer.png');
}

function setup() {
    //create a canvas
    createCanvas(800, 600);
    //paint it white
    background(255, 255, 255);

    //I create socket but I wait to assign all the functions before opening a connection
    socket = io({
        autoConnect: false
    });

    //detects a server connection 
    socket.on('connect', onConnect);
    //handles the messages from the server, the parameter is a string
    socket.on('message', onMessage);
    //handles the user action broadcast by the server, the parameter is an object
    socket.on('state', updateState);

    socket.open();

    //every x time I update the server on my position
    setInterval(function () {
        socket.emit('clientUpdate', { x: mouseX, y: mouseY });
    }, UPDATE_TIME);
}

//this p5 function is called continuously 60 times per second by default
//we are not using it yet, we update the canvas only when we receive new updates, see below
function draw() {
}

//called by the server every 30 fps
function updateState(state) {

    //draw a white background
    background(255, 255, 255);

    //iterate through the players
    for (var playerId in state.players) {
        if (state.players.hasOwnProperty(playerId)) {
            //in this case I don't have to draw the pointer at my own position
            if (playerId != socket.id) {
                var playerState = state.players[playerId];

                //draw a pointer image for each player except for myself
                if (!playerState.dead) {
                    for (let i=0; i <= state.clicks; i++) {
                        image(pointer, playerState.x + i * 5, playerState.y + i * 3);
                    }
                }
            }
        }
    }

}

//p5 function called on mouse press - send coordinates to server
function mousePressed() {
    //make sure the connection is established
    if (socket.id) {
        console.log("Mouse pressed at " + mouseX + " " + mouseY);
        //send 
        socket.emit('clientClick', { x: mouseX, y: mouseY });
    }
}




//connected to the server
function onConnect() {
    if (socket.id) {
        console.log("Connected to the server");
        socket.emit('newPlayer', { x: mouseX, y: mouseY });
    }
}

//a message from the server
function onMessage(msg) {
    if (socket.id) {
        console.log("Message from server: " + msg);
    }
}