const PUZZLE_HOVER_TINT = '#009900';
const canvas = document.getElementById('letters-canvas');
const stage = canvas.getContext("2d");
const img = new Image();

let difficulty = 6;
let pieces;
let puzzleWidth;
let puzzleHeight;
let pieceWidth;
let pieceHeight;
let currentPiece;
let currentDropPiece;
let intervalID = null;
let mouse;
let puzzleWord;
let testWord = "zpelzu";

function puzzle(word){
    puzzleWord = word;
    //todo: refactor dimension calculations into their own function
    pieceWidth = Math.floor(canvas.width / word.length);
    pieceHeight = Math.floor(canvas.height);
    puzzleWidth = canvas.width;
    puzzleHeight = canvas.height;
    setCanvas();
    initPuzzle(puzzleWord);
}

function setCanvas(){
    canvas.width = puzzleWidth;
    canvas.height = puzzleHeight;
    canvas.style.border = "1px solid red";
}

function initPuzzle() {
    pieces = [];
    mouse = {
        x: 0,
        y: 0
    };
    currentPiece = null;
    currentDropPiece = null;

    console.log(puzzleWidth,puzzleHeight);
    buildPieces();
}

//assign initial values to all pieces
function buildPieces() {
    let i;
    let piece;
    let xPos = 0;
    let yPos = 0;
    //iterate through total piece count
    //todo: refactor piece count calculator into its own function,
    //it's a magic number here
    for (i = 0; i < puzzleWord.length; i++){
        //create a new default piece
        //todo: piece should be a class and this is its constructor
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        piece.id = i;
        piece.content = puzzleWord.charAt(i);
        //add piece to array of pieces
        pieces.push(piece);
        //set xPos to piece's x position in original image
        xPos += pieceWidth;
        //check if x position brings us all the way to the right side of the image
        if (xPos >= puzzleWidth) {
            //reset x position to 0
            xPos = 0;
            //increment y position by 1 piece's worth of height
            yPos += pieceHeight;
        }
    }
    console.log({pieces});
    drawPuzzle();
}

//todo: pieces should be an obj with CRUD methods
//instead of an array (the array should be an object property),
//and this should be a method of that obj
//so we would call pieces.shuffle();

function drawPuzzle(){
    stage.clearRect(0,0,puzzleWidth,puzzleHeight);
    let xPos = 0;
    let yPos = 0;  
    let fontsize = 40;
    stage.font = `${fontsize}px Arial`
    for (const piece of pieces) {
        piece.xPos = xPos;
        piece.yPos = yPos;
        stage.strokeRect(xPos, yPos, pieceWidth, pieceHeight);
        console.log("filltext")
        stage.fillText(piece.content, xPos + 10, yPos+40);
        //todo: refactor to:
        //<incrementPiece(xPos,pieceWidth,yPos,pieceHeight)>
        xPos += pieceWidth;
        if (xPos >= puzzleWidth) {
            xPos = 0;
            yPos += pieceHeight;
        }
        //<incrementPiece>
    }
    document.onpointerdown = onPuzzleClick;
}

//
function setMouse(e){
    if (e.offsetX || e.offsetX === 0){
        //console.log([e.offsetX,e.offsetY,canvas.offsetLeft,canvas.offsetTop]);
        //getting relative position of click, minus position of canvas relative to its container
        mouse.x = e.offsetX - canvas.offsetLeft;
        mouse.y = e.offsetY - canvas.offsetTop;
        //console.log({mouse});
    }
}

function onPuzzleClick(e){
    console.log("puzzle click");
    console.log(e.srcElement.id);
    if(e.srcElement.id !== "letters-canvas"){
        return;
    }
    clearInterval(intervalID);
    setMouse(e);
    currentPiece = checkPieceClicked();
    if (currentPiece !== null) {
        console.log({currentPiece});
        stage.clearRect(
            currentPiece.xPos,
            currentPiece.yPos,
            pieceWidth,
            pieceHeight
        );
        stage.save();
        stage.globalAlpha = 0.9;
        stage.fillText(piece.content,mouse.x - pieceWidth / 2, mouse.y - pieceHeight / 2);
        stage.restore();
        document.onpointermove = updatePuzzle;
        document.onpointerup = pieceDropped;
    }
}

//TODO: reveal profile text as puzzle gets solved (@)

function checkPieceClicked() {
    //todo: is there a way to just calculate the piece's index via div/mod/quotient/etc?
    //iterate through pieces
    console.log(mouse.x,mouse.y);
    for (const piece of pieces) {
        //check if mouse click coordinates are outside the boundaries of this piece
        if (
            mouse.x < piece.xPos ||
            mouse.x > piece.xPos + pieceWidth ||
            mouse.y < piece.yPos ||
            mouse.y > piece.yPos + pieceHeight
        ) {
            //piece not clicked
        }
        //once we find a piece where the coordinates are in bounds, return that piece as clicked
        else {
            return piece;
        }
    }
    return null;
}

function updatePuzzle(e) {
    console.log("updatePuzzle");
    currentDropPiece = null;
    setMouse(e);
    stage.clearRect(0,0,puzzleWidth, puzzleHeight);
    for (const piece of pieces) {
        if (piece === currentPiece) {
            continue;
        }
        stage.strokeRect(piece.xPos,piece.yPos,pieceWidth,pieceHeight);
        stage.fillText(piece.content,piece.xPos,piece.yPos);
        if (currentDropPiece === null) {
            if (
                mouse.x < piece.xPos ||
                mouse.x > piece.xPos + pieceWidth ||
                mouse.y < piece.yPos ||
                mouse.y > piece.yPos + pieceHeight
            ) {
                //NOT OVER
            }
            else {
                currentDropPiece = piece;
                stage.save();
                stage.globalAlpha = 0.4;
                stage.fillStyle = PUZZLE_HOVER_TINT;
                stage.fillRect(
                    currentDropPiece.xPos,
                    currentDropPiece.yPos,
                    pieceWidth,
                    pieceHeight
                );
                stage.restore();
            }
        }
    }
    stage.save();
    stage.globalAlpha = 0.6;
    stage.fillText(piece.content,piece.xPos,piece.yPos);
    stage.restore();
    stage.strokeRect(
        mouse.x - pieceWidth / 2,
        mouse.y - pieceHeight / 2,
        pieceWidth,
        pieceHeight
    );
}

function pieceDropped(e){
    console.log("pieceDropped");
    document.onpointermove = null;
    document.onpointerup = null;
    if(currentDropPiece !== null){
        let tmp = {
            sx:currentPiece.sx,
            sy:currentPiece.sy,
            id:currentPiece.id
        };
        //setValuesFromSourcePiece(currentPiece,currentDropPiece);
        //setValuesFromSourcePiece(currentDropPiece,tmp);
        
        currentPiece.sx = currentDropPiece.sx;
        currentPiece.sy = currentDropPiece.sy;
        currentPiece.id = currentDropPiece.id;
        currentDropPiece.sx = tmp.sx;
        currentDropPiece.sy = tmp.sy;
        currentDropPiece.id = tmp.id;
    }
    currentPiece = null;
    currentDropPiece = null;
    console.log("resetting puzzle");
    console.log("resetting redraw");
}

function setValuesFromSourcePiece(destinationPiece,sourcePiece){
    destinationPiece.sx = sourcePiece.sx;
    destinationPiece.sy = sourcePiece.sy;
    destinationPiece.id = sourcePiece.id;
}

puzzle(testWord);




