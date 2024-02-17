

let draggingTile = null;
let startX;
let tiles = [];
let xOffsetStart;
let yOffset;
let tileWidth;
let tileGap;
let tileSpacing;
let rackPadding;
let containerPadding;
let rackWidth;
let containerWidth;
let rackString;
let bevelRadius;
let clickOffset;
let leftBoundary;
let rightBoundary;

let rackContainerIsBeingDragged = false;

function getRackString() {
    const tileElements = rackContainer.querySelectorAll('.tile');
    return Array.from(tileElements).reduce((currentString, tile) => {
        const textElement = tile.querySelector('text');
        return textElement ? currentString + textElement.textContent : currentString;
    }, '');
}

function setMismatches(){
    const existingTiles = rackContainer.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.classList.remove('tile-mismatch'));
    mismatches.forEach(mismatch => {
            var tileElements = document.querySelectorAll('.tile[data-index="' + mismatch + '"]');
            tileElements.forEach(function(tileElement) {
                tileElement.classList.add('tile-mismatch');
            });
        });
}

function createTiles(str) {
    // Remove existing tiles
    const existingTiles = rackContainer.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.remove());

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    console.log('viewportWidth: ' + viewportWidth + "px");
    //todo: viewportDivision will probably need to be dynamic depending on device detected and landscape/portrait
    let viewportDivision = 11;
    let TILE_SIZE = viewportWidth / viewportDivision;
    let TILE_SPACE = TILE_SIZE / 3;

    tileWidth = TILE_SIZE;
    tileGap = 0;
    tileSpacing = tileWidth + tileGap;
    rackPadding = TILE_SPACE * 2; // Padding on either side of the tiles
    containerPadding = TILE_SPACE * 2;
    xOffsetStart = (TILE_SIZE / 2);
    //yOffset = TILE_SPACE / 2;
    yOffset = 0;
    bevelRadius = TILE_SIZE / 4;

    const TOTAL_TILE_SIZE = TILE_SIZE + tileGap;
    rackWidth = str.length * TOTAL_TILE_SIZE;
    containerWidth = rackWidth + TOTAL_TILE_SIZE; // add TOTAL_TILE_SIZE to account for 1 drag tab

    // Set the width of the rackContainer
    rackContainer.setAttribute('width', containerWidth.toString());

    //set the height of the rackContainer container
    rackContainer.setAttribute('height', tileSpacing.toString() * 2);

    //reset rackString
    rackString = '';

    tiles = [...str].map((char, index) => {
        rackString += char;
        const x = xOffsetStart + index * tileSpacing;

        const group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        group.classList.add('tile');
        group.setAttribute('transform', `translate(${x}, ${yOffset})`);
        group.dataset.index = index;

        const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect.setAttribute('width', tileWidth);
        rect.setAttribute('height', tileWidth);
        rect.setAttribute('rx', bevelRadius);
        rect.setAttribute('ry', bevelRadius);

        const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.setAttribute('x', tileWidth / 2);
        text.setAttribute('y', tileWidth / 2);
        text.setAttribute('class', 'tile-text');
        text.style.fontSize = (TILE_SIZE / 2).toString() + "px";
        text.textContent = char;

        group.appendChild(rect);
        group.appendChild(text);
        rackContainer.appendChild(group);

        return { element: group, x, char };
    });

    const dragTabBottom = document.getElementById('drag-tab-bottom');

    // set height and width of drag tabs and height of rackContainer
    const dragTabHeight = tileSpacing.toString() + "px";
    const calcDragTabWidth = (tileSpacing / 2);
    const dragTabWidth = calcDragTabWidth.toString() + "px";

    const rack = document.getElementById('rack');
    rack.setAttribute('height', dragTabHeight);
    rack.setAttribute('width', rackWidth.toString());
    rack.setAttribute('x', dragTabWidth);

    dragTabBottom.setAttribute('x', dragTabWidth);
    dragTabBottom.setAttribute('y', dragTabHeight);
    dragTabBottom.setAttribute('height', TILE_SIZE);
    dragTabBottom.setAttribute('width',rackWidth.toString());

    // Define the boundaries
    leftBoundary = tileSpacing / 4;
    rightBoundary = rack.getAttribute('width');
    
    console.log({tiles});
    console.log({rackString});
}

function startTileDrag(evt) {
    if (!rackContainerIsBeingDragged){
        if (evt.target.classList.contains('tile') || evt.target.parentNode.classList.contains('tile')) {
            draggingTile = evt.target.classList.contains('tile') ? evt.target : evt.target.parentNode;
            if (evt.touches) {
                evt.preventDefault(); // Prevents additional mouse event
                startX = evt.touches[0].clientX;
            } else {
                startX = evt.clientX;
            }

            // Get the x-coordinate of the left side of the tile
            const tileLeft = draggingTile.getBoundingClientRect().left;
            
            // Determine the distance from the click to the left side of the tile
            clickOffset = startX - tileLeft;

            console.log({clickOffset});

            draggingTile.classList.add('dragging');     
            rackContainer.classList.add('no-select');
            // Move the dragging tile to the end of the SVG for higher stacking order
            draggingTile.parentNode.appendChild(draggingTile);
            
        }
    }
}

function tileDrag(evt) {
    if (draggingTile) {
        const draggingIndex = parseInt(draggingTile.dataset.index);
        let currentX;
        if (evt.touches) {
            evt.preventDefault(); // Prevents scrolling while dragging
            currentX = evt.touches[0].clientX;
        } else {
            currentX = evt.clientX;
        }
        let dx = currentX - startX;
        //don't let leftmost tile move further to the left
        if (draggingIndex === 0 && dx < 0){
        //    dx = 0;
        }
        const currentTransform = draggingTile.getAttribute('transform');
        let translateX = parseInt(currentTransform.split('(')[1]) + dx;
        
        

        // Enforce the boundaries
        if (translateX < leftBoundary) {
            translateX = leftBoundary;
        } else if (translateX > rightBoundary) {
            translateX = rightBoundary;
        }

        draggingTile.setAttribute('transform', `translate(${translateX}, ${yOffset})`);
        startX = currentX;
    }
}


function endTileDrag(evt) {
    if (draggingTile) {
        console.log("drag ended");
        draggingTile.classList.remove('dragging');
        reorderTiles();
        draggingTile = null;
        rackContainer.classList.remove('no-select');
    }  
}

function reorderTiles() {
    const draggingIndex = parseInt(draggingTile.dataset.index);
    const currentTransform = draggingTile.getAttribute('transform');
    const translateX = parseInt(currentTransform.split('(')[1]);
    console.log({draggingIndex},{currentTransform},{translateX});
    const leftXOfDraggedTile = translateX - clickOffset;
    console.log({leftXOfDraggedTile});
    const newIndex_preRound = leftXOfDraggedTile / tileSpacing;
    console.log({newIndex_preRound});
    let newIndex = Math.floor(leftXOfDraggedTile / tileSpacing);
    if(newIndex < draggingIndex){
        newIndex++;
        console.log("adjusted newIndex:",newIndex);
    }
    //check if tile has moved left of first tile
    if (newIndex <= 0){
        newIndex = 0
    }
    //check if tile has moved right of last tile
    if (newIndex > tiles.length - 1) {
        newIndex = tiles.length - 1;
    }
    console.log({newIndex});
    rackString = '';
    if (newIndex !== draggingIndex && newIndex >= 0 && newIndex < tiles.length) {
        // Remove the dragging tile from the array and splice it into the new position
        const [movedTile] = tiles.splice(draggingIndex, 1);
        tiles.splice(newIndex, 0, movedTile);
    }
    // Update positions of all tiles
    tiles.forEach((tile, index) => {
        const x = xOffsetStart + index * tileSpacing;
        tile.element.setAttribute('transform', `translate(${x}, ${yOffset})`);
        tile.element.dataset.index = index;
        rackString += tile.char;
    });
    console.log({rackString});
    
}

function touchStartHandler(evt){
    evt.preventDefault(); // Prevents additional mouse event
    startTileDrag(evt);
}

function touchMoveHandler(evt){
    evt.preventDefault(); // Prevents additional mouse event
    tileDrag(evt);
}

function touchEndHandler(evt){
    endTileDrag(evt);
}

function addRackEventListeners(){
        // Attach touch event listeners
        console.log("adding rack listeners...");
    rackContainer.addEventListener('touchstart', touchStartHandler);
    rackContainer.addEventListener('touchmove', touchMoveHandler);
    rackContainer.addEventListener('touchend', touchEndHandler);
}

function removeRackEventListeners(){
    try{
    rackContainer.removeEventListener('touchstart', touchStartHandler);
    rackContainer.removeEventListener('touchmove', touchMoveHandler);
    rackContainer.removeEventListener('touchend', touchEndHandler);
    }
    catch(err){
        console.log("error:",err)
    }

}