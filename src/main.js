//Blocks to display and interact with (images)
const VOID = 0;
const ROSHAN = 1;
const REAL_WALL = 2;
const WALL = 3;
const STAR = 4;
const CRATE = 5;
const CHECKBOX = 6;
const TEXT = 7;

//Properties to attribute/change
const P_YOU = ROSHAN + 100;
const P_WIN = STAR + 100;
const P_STOP = REAL_WALL + 100;
const P_PUSH = CRATE + 100;

//Nouns to point different blocks/images
const N_IS = 200;
const N_ROSHAN = ROSHAN + 200;
const N_WALL = WALL + 200;
const N_STAR = STAR + 200;
const N_CRATE = CRATE + 200;

//Global variables
var dicoID = {
    "N_IS": N_IS,

    "ROSHAN": ROSHAN,
    "N_ROSHAN": N_ROSHAN,
    "P_YOU": P_YOU,

    "REAL_WALL": REAL_WALL,
    "WALL": WALL,
    "N_WALL": N_WALL,
    "P_STOP": P_STOP,

    "STAR": STAR,
    "N_STAR": N_STAR,
    "P_WIN": P_WIN,

    "CRATE": CRATE,
    "N_CRATE": N_CRATE,
    "P_PUSH": P_PUSH,

    "CHECKBOX": CHECKBOX
};

var GameImg = {
};

var levels;


//Objects
function Entity(id, x_pos, y_pos, text = null) {
    this.self = this;
    this.id = id;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.property = id == REAL_WALL ? P_STOP : (id >= 100 ? P_PUSH : null);
    this.player = this.id == ROSHAN ? true : false;
    this.text = this.id == TEXT || this.id == CHECKBOX ? text : null;

    this.isBlock = function () {
        if (this.property == P_STOP || this.property == P_PUSH || this.id == REAL_WALL)
            return (true);
        return (false);
    }

    this.defaultProperty = function () {
        return (this.id == REAL_WALL ? P_STOP : (this.id >= 100 ? P_PUSH : null));
    }

    this.changeProperties = function (n_id) {
        if (n_id >= 200)
            this.id = n_id - 200;
        else if (n_id >= 100)
            this.property = n_id;
    }
}

function Level(name = null) {
    this.items = [];
    this.initialItems = [];
    this.name = name;
    this.x_max = 1;
    this.y_max = 1;

    this.addEntity = function (id, x_pos, y_pos, text = null) {
        this.items.push(new Entity(id, x_pos, y_pos, text));
        this.initialItems.push(new Entity(id, x_pos, y_pos, text));
    }
    
    this.getOn = function (x, y) {
        var i;

        for (i = 0; i < this.items.length; i++) {
            if (this.items[i].x_pos == x && this.items[i].y_pos == y)
                return (this.items[i]);
        }
        return (new Entity(VOID, -1, -1));
    }

    this.findIs = function () {
        var res = [];
        var current;

        for (i = 0; i < this.items.length; i++) {
            current = this.items[i];
            if (current.id == N_IS)
                res.push(current);
        }
        return (res);
    }

    this.changeProperties = function (idChanging, nProp) {
        var current;

        if (nProp != 200) {
            for (i = 0; i < this.items.length; i++) {
                current = this.items[i];
                if (current.id == idChanging)
                    current.changeProperties(nProp);
            }
        }
    }

    this.resetProperties = function () {
        var i;
        
        for (i = 0; i < this.items.length; i++) {
            this.items[i].property = this.items[i].defaultProperty();
        }
    }

    this.updateProperties = function () {
        var i, x, y;
        var previous;
        var next;
        var isList = this.findIs();

        this.resetProperties();
        for (i = 0; i < isList.length; i++) {
            x = isList[i].x_pos;
            y = isList[i].y_pos;
            previous = [];
            next = [];
            previous.push(this.getOn(x - 1, y).id);
            previous.push(this.getOn(x, y - 1).id);
            next.push(this.getOn(x + 1, y).id);
            next.push(this.getOn(x, y + 1).id);
            if (previous[0] >= 200 && next[0] >= 100)
                this.changeProperties(previous[0] - 200, next[0]);
            if (previous[1] >= 200 && next[1] >= 100)
                this.changeProperties(previous[1] - 200, next[1]);
        }
    }

    this.moveBlock = function (x, y, item) {
        if (!item.isBlock())
            return (true);
        else if (item.property == P_PUSH) {
            if (this.moveBlock(x, y, this.getOn(item.x_pos + x, item.y_pos + y))) {
                item.x_pos += x;
                item.y_pos += y;
                return (true);
            }
        }
        return (false);
    }

    this.movePlayer = function (x, y, view) {
        var current, i;
        var change = false;

        for (i = 0; i < this.items.length; i++) {
            current = this.items[i];
            if (current.property == P_YOU) {
                if (this.moveBlock(x, y, this.getOn(current.x_pos + x, current.y_pos + y))) {
                    current.x_pos += x;
                    current.y_pos += y;
                    change = true;
                }
            }
        }
        this.updateProperties();
        return (change);
    }

    this.getMiddlePos = function () {
        var i, res = {};
        var moy_x = 0;
        var moy_y = 0;
        var cpt = 0;

        for (i = 0; i < this.items.length; i++) {
            if (this.items[i].property == P_YOU) {
                moy_x += this.items[i].x_pos;
                moy_y += this.items[i].y_pos;
                cpt++;
            }
        }
        if (cpt > 0) {
            res['x'] = Math.floor(moy_x / cpt);
            res['y'] = Math.floor(moy_y / cpt);
        } else
            res = null;
        return (res);
    }

    this.getPlayerMinPos = function () {
        var res = {x: null, y: null};
        var i;
        
        for (i = 0; i < this.items.length; i++) {
            if (this.items[i].property == P_YOU && (this.items[i].x_pos < res['x'] || res['x'] == null))
                res['x'] = this.items[i].x_pos;
            if (this.items[i].property == P_YOU && (this.items[i].y_pos < res['y'] || res['y'] == null))
                res['y'] = this.items[i].y_pos;
        }
        return (res);
    }

    this.getPlayerMaxPos = function () {
        var res = {x: null, y: null};
        var i;
        
        for (i = 0; i < this.items.length; i++) {
            if (this.items[i].property == P_YOU && (this.items[i].x_pos > res['x'] || res['x'] == null))
                res['x'] = this.items[i].x_pos;
            if (this.items[i].property == P_YOU && (this.items[i].y_pos > res['y'] || res['y'] == null))
                res['y'] = this.items[i].y_pos;
        }
        return (res);

    }

    this.getSpan = function () {
        var minPos = this.getPlayerMinPos();
        var maxPos = this.getPlayerMaxPos();
        var res = {};
        res['x'] = maxPos['x'] - minPos['x'] + 1;
        res['y'] = maxPos['y'] - minPos['y'] + 1;
        return (res);
    }

    this.resetLevel = function () {
        var i, current;

        this.items = [];
        for (i= 0; i < this.initialItems.length; i++) {
            current = this.initialItems[i];
            this.items.push(new Entity(current.id, current.x_pos, current.y_pos, current.text));
        }
        this.updateProperties()
    }

    this.pWinList = function () {
        var i;
        var res = [];

        for (i = 0; i < this.items.length; i++) {
            if (this.items[i].property == P_WIN)
                res.push(this.items[i]);
        }
        return (res);
    }

    this.pYouList = function () {
        var i;
        var res = [];

        for (i = 0; i < this.items.length; i++) {
            if (this.items[i].property == P_YOU)
                res.push(this.items[i]);
        }
        return (res);
    }

    this.isWin = function () {
        var i, j;
        var pYou = this.pYouList();
        var pWin = this.pWinList();

        for (i = 0; i < pYou.length; i++) {
            for (j = 0; j < pWin.length; j++) {
                if (pYou[i].x_pos == pWin[j].x_pos && pYou[i].y_pos == pWin[j].y_pos)
                    return (true);
            }
        }
        return (false);
    }
};


//General functions
function waitLoadImg() {
    var keys, len, i;
    var cpt = 0;

    GameImg[N_IS] = new Image();
    GameImg[N_IS].src = "./images/is.png";

    GameImg[REAL_WALL] = new Image();
    GameImg[REAL_WALL].src = "./images/orange.png";


    GameImg[ROSHAN] = new Image();
    GameImg[ROSHAN].src = "./images/roshan.png";
    GameImg[N_ROSHAN] = new Image();
    GameImg[N_ROSHAN].src = "./images/NRoshan.png";

    GameImg[WALL] = new Image();
    GameImg[WALL].src = "./images/darkgray.png";
    GameImg[N_WALL] = new Image();
    GameImg[N_WALL].src = "./images/NWall.png";

    GameImg[CRATE] = new Image();
    GameImg[CRATE].src = "./images/woodenCrate.png";
    GameImg[N_CRATE] = new Image();
    GameImg[N_CRATE].src = "./images/NCrate.png";

    GameImg[STAR] = new Image();
    GameImg[STAR].src = "./images/atmosphere.png";
    GameImg[N_STAR] = new Image();
    GameImg[N_STAR].src = "./images/NStar.png";


    GameImg[P_WIN] = new Image();
    GameImg[P_WIN].src = "./images/PWin.png";

    GameImg[P_YOU] = new Image();
    GameImg[P_YOU].src = "./images/PYou.png";

    GameImg[P_PUSH] = new Image();
    GameImg[P_PUSH].src = "./images/PPush.png";

    GameImg[P_STOP] = new Image();
    GameImg[P_STOP].src = "./images/PStop.png";


    GameImg["background"] = new Image();
    GameImg["background"].src = "./images/background_empty_space.png";

    GameImg[CHECKBOX] = new Image();
    GameImg[CHECKBOX].src = "./images/checkBox.png";

    keys = Object.keys(GameImg)
    len = keys.length;
    for (i = 0; i < len; i++) {
        GameImg[keys[i]].onload = function () {
            cpt++;
            if (cpt == len)
                loadLevels();
        }
    }
}

function loadLevels() {
    var jsonRes, request = new XMLHttpRequest();
    request.open("GET", "./src/levels.json");
    request.responseType = "json";
    request.send();
    request.onload = function() {
        jsonRes = request.response;
        levels = parseJsonLevels(jsonRes.levels);
        startMenu(levels);
    };
}
function parseJsonLevels(jsonLvl) {
    var res = [];
    var j, i, keys, currentLvl;

    keys = Object.keys(jsonLvl);
    for (i = 0; i < keys.length; i++) {
        currentLvl = jsonLvl[keys[i]];
        res.push(new Level(keys[i]));
        for (j = 0; j < currentLvl.items.length; j++) {
            res[i].addEntity(dicoID[currentLvl.items[j].id], currentLvl.items[j].x_pos, currentLvl.items[j].y_pos);
            if (currentLvl.items[j].x_pos > res[i].x_max)
                res[i].x_max = currentLvl.items[j].x_pos;
            if (currentLvl.items[j].y_pos > res[i].y_max)
                res[i].y_max = currentLvl.items[j].y_pos;
        }
    }
    return (res);
}

function getSelectedLvl(menu) {
    var xPos, yPos, i;
    
    for (i = 0; i < menu.items.length; i++) {
        if (menu.items[i].property == P_YOU) {
            xPos = menu.items[i].x_pos;
            yPos = menu.items[i].y_pos;
        }
    }
    for (i = 0; i < menu.items.length; i++) {
        if (menu.items[i].x_pos == xPos && menu.items[i].y_pos == yPos && menu.items[i].id == CHECKBOX){
            return (parseInt(menu.items[i].text));
        }
    }
    return (null);
}

function startMenu() {
    var docInfo = {};

    docInfo["gameCanva"] = document.getElementById(("gameCanva"));
    docInfo["gameMaxWidth"] = docInfo["gameCanva"].getAttribute("width");
    docInfo["gameMaxHeight"] = docInfo["gameCanva"].getAttribute("height");
    docInfo["gameCtx"] = docInfo["gameCanva"].getContext("2d");

    docInfo["previewCanva"] = document.getElementById(("preview"));
    docInfo["previewMaxWidth"] = docInfo["previewCanva"].getAttribute("width");
    docInfo["previewMaxHeight"] = docInfo["previewCanva"].getAttribute("height");
    docInfo["previewCtx"] = docInfo["previewCanva"].getContext("2d");

    console.log(levels);
    var menu = new Level("Menu");
    createMenu(menu, levels, docInfo["gameCtx"], docInfo["previewCtx"]);
    menu.updateProperties();
    drawLevel(menu, docInfo["gameCtx"], docInfo["gameMaxWidth"], docInfo["gameMaxHeight"], true);

    document.body.onkeypress = function (e) {
        var change;
        var selected = null;
        switch(e.key) {
            case "Escape":
                return (0);
            case "Enter":
                selected = getSelectedLvl(menu);
                if (selected != null)
                    startGame(levels[selected], docInfo["gameCtx"], docInfo["gameMaxWidth"], docInfo["gameMaxHeight"]);
                break;
            case "ArrowUp":
                change = menu.movePlayer(0, -1, true);
                break;
            case "ArrowDown":
                change = menu.movePlayer(0, 1, true);
                break;
            case "ArrowRight":
                change = menu.movePlayer(1, 0, true);
                break;
            case "ArrowLeft":
                change = menu.movePlayer(-1, 0, true);
                break;
            case "r":
                menu.resetLevel();
                change = true;
                break;
        }
        if (change) {
            selected = getSelectedLvl(menu);
            if (selected != null)
                drawLevel(levels[selected], docInfo["previewCtx"], docInfo["previewMaxWidth"], docInfo["previewMaxHeight"], false);
            drawLevel(menu, docInfo["gameCtx"], docInfo["gameMaxWidth"], docInfo["gameMaxHeight"], true);
        }
    }
}

function createMenu(level, lvlList, gameCtx, previewCtx) {
    var i, j;

    level.x_max = 10;
    level.y_max = lvlList.length + 5;

    for (i = 0; i < lvlList.length; i++) {
        level.addEntity(CHECKBOX, 3, 3 + i, "" + i);
        level.addEntity(TEXT, 4, 3 + i, lvlList[i].name);
    }

    level.addEntity(N_ROSHAN, 1, 1);
    level.addEntity(N_IS, 2, 1);
    level.addEntity(P_YOU, 3, 1);

    level.addEntity(ROSHAN, 1, 2);

    for (i = 0; i < level.y_max; i++) {
        for (j = 0; j < level.x_max; j++) {
            if (i == 0 || j == 0 || i == level.y_max - 1 || j == level.x_max - 1) {
                level.addEntity(REAL_WALL, j, i);
            }
        }
    }
}

function startGame(level, ctx, maxWidth, maxHeight) {
    //canva.setAttribute("width", document.body.getAttribute("clientWidth"));
    //canva.setAttribute("heigth", document.body.getAttribute("clientHeigth"));
    var change;
    level.updateProperties();
    drawLevel(level, ctx, maxWidth, maxHeight, true);

    document.body.onkeypress = function (e) {
        if (e.key == "ArrowUp")
            change = level.movePlayer(0, -1, true);
        else if (e.key == "ArrowDown")
            change = level.movePlayer(0, 1, true);
        else if (e.key == "ArrowRight")
            change = level.movePlayer(1, 0, true);
        else if (e.key == "ArrowLeft")
            change = level.movePlayer(-1, 0, true);
        else if (e.key == "r") {
            level.resetLevel();
            change = true;
        }
        else if (e.key == "Escape") {
            level.resetLevel();
            startMenu();
        }
        if (change && e.key != "Escape")
            drawLevel(level, ctx, maxWidth, maxHeight, true);
        if (level.isWin()) {
            level.resetLevel();
            startMenu();
        }
    }
}

function my_random(nb) {
    "use strict";
    return (Math.floor(Math.random() * nb));
}

function drawLevel(level, ctx, maxWidth, maxHeight, view) {
    var i, currentImg, c_x, c_y;
    var x_size, y_size, middlePos = level.getMiddlePos();
    var spans = level.getSpan();
    var x_span = spans['x'];
    var y_span = spans['y'];
    if (!view || middlePos == null) {
    x_size = Math.floor(maxWidth / (level.x_max + 1));
    y_size = Math.floor(maxHeight / (level.y_max + 1));
    }
    else {
        x_size = Math.floor(maxWidth / (x_span + 14));
        y_size = Math.floor(maxHeight / (y_span + 9));
    }

    ctx.drawImage(GameImg["background"], 0, 0, GameImg["background"].width, GameImg["background"].height, 0, 0, maxWidth, maxHeight);

    for (i = 0; i < level.items.length; i++) {
        if (level.items[i].id != TEXT) {
            currentImg = GameImg[level.items[i].id];
            if (!view || middlePos == null) {
                c_x = level.items[i].x_pos;
                c_y = level.items[i].y_pos;
                ctx.drawImage(currentImg, 0, 0, currentImg.width, currentImg.height, c_x * x_size, c_y * y_size, x_size, y_size);
            } else {
                c_x = level.items[i].x_pos - middlePos['x'];
                c_y = level.items[i].y_pos - middlePos['y'];
                ctx.drawImage(currentImg, 0, 0, currentImg.width, currentImg.height, c_x * x_size + maxWidth / 2, c_y * y_size + maxHeight / 2, x_size, y_size);
            }
        } else {
            ctx.fillStyle = "rgb(" + my_random(255) + "," + my_random(255) + "," + my_random(255) + ")";
            ctx.font = x_size + "px Helvetica";
            if (!view || middlePos == null) {
                c_x = level.items[i].x_pos;
                c_y = level.items[i].y_pos;
                ctx.fillText(level.items[i].text, c_x * x_size, c_y * y_size);
            } else {
                c_x = level.items[i].x_pos - middlePos['x'];
                c_y = level.items[i].y_pos - middlePos['y'];
                ctx.fillText(level.items[i].text, c_x * x_size + maxWidth / 2, c_y * y_size + x_size + maxHeight / 2);
            }
        }
    }
}


window.onload = waitLoadImg();
