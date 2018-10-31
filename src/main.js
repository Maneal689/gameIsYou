//Blocks to display and interact with (images)
const IS = -1;
const VOID = 0;
const BABA = 1;
const REAL_WALL = 2;
const WALL = 3;
const FLAG = 4;
const ROCK = 5;

//Properties to attribute/change
const P_YOU = BABA + 100;
const P_WIN = FLAG + 100;
const P_STOP = REAL_WALL + 100;
const P_PUSH = ROCK + 100;

//Nouns to point different blocks/images
const N_BABA = BABA + 200;
const N_WALL = WALL + 200;
const N_FLAG = FLAG + 200;

var dicoID = {
    "IS": IS,
    "BABA": BABA,
    "REAL_WALL": REAL_WALL,
    "WALL": WALL,
    "FLAG": FLAG,
    "ROCK": ROCK,
    "P_YOU": P_YOU,
    "P_WIN": P_WIN,
    "P_STOP": P_STOP,
    "P_PUSH": P_PUSH,
    "N_BABA": N_BABA,
    "N_WALL": N_WALL,
    "N_FLAG": N_FLAG
};

var levels;

var GameImg = {
};

function Entity(id, x_pos, y_pos) {
    this.self = this;
    this.id = id;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.property = id < 100 ? id + 100 : P_PUSH;
    this.player = this.id == BABA ? true : false;
    this.block = null;

    this.updateBlock = function () {
        this.block = false;
        if (this.property == P_STOP || this.property == P_PUSH || this.id == REAL_WALL)
            this.block = true;
    }

    this.changeProperties = function (n_id) {
        if (n_id >= 200)
            this.id = n_id - 200;
        else if (n_id >= 100)
            this.property = n_id;
        this.updateBlock();
    }
    this.updateBlock();
}

function Level(name = null) {
    this.items= [];
    this.name = name;
    this.x_max = 1;
    this.y_max = 1;

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
            if (current.id == IS)
                res.append(current);
        }
        return (res);
    }

    this.changeProperties = function (idChanging, nProp) {
        var current;

        for (i = 0; i < this.items.length; i++) {
            current = this.items[i];
            if (current.id == idChanging)
                current.changeProperties(n_Prop);
        }
    }

    this.updateProperty = function () {
        var i, x, y;
        var previous = [];
        var next = [];
        var isList = this.findIs();

        for (i = 0; i < isList.length; i++) {
            x = isList[i].x_pos;
            y = isList[i].y_pos;
            previous.push(this.getOn(x - 1, y).id);
            previous.push(this.getOn(x, y - 1).id);
            next.push(this.getOn(x + 1, y).id);
            next.push(this.getOn(x, y + 1).id);
            if (previous[0] >= 200 && next[0] >= 100)
                this.changeProperties(previous[0].id, next[0].id);
            if (previous[1] >= 200 && next[1] >= 100)
                this.changeProperties(previous[1].id, next[1].id);
        }
    }

    this.moveBlock = function (x, y, item) {
        console.log("item: ");
        console.log(item);
        if (item.block == false)
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

    this.movePlayer = function (x, y) {
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
        this.updateProperty();
        return (change);
    }
};


function waitLoadImg() {
    var keys, len, i;
    var cpt = 0;

    GameImg[BABA] = new Image();
    GameImg[BABA].src = "../images/roshan.png";

    GameImg[REAL_WALL] = new Image();
    GameImg[REAL_WALL].src = "../images/orange.png";

    GameImg[ROCK] = new Image();
    GameImg[ROCK].src = "../images/darkgray.png";

    GameImg["background"] = new Image();
    GameImg["background"].src = "../images/Space-Background-2.jpg";

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

function parseJsonLevels(levels) {
    var res = [];
    var j, i, keys, currentLvl;

    keys = Object.keys(levels);
    for (i = 0; i < keys.length; i++) {
        currentLvl = levels[keys[i]];
        res.push(new Level(keys[i]));
        for (j = 0; j < currentLvl.items.length; j++) {
            res[i].items.push(new Entity(dicoID[currentLvl.items[j].id], currentLvl.items[j].x_pos, currentLvl.items[j].y_pos));
            if (currentLvl.items[j].x_pos > res[i].x_max)
                res[i].x_max = currentLvl.items[j].x_pos;
            if (currentLvl.items[j].y_pos > res[i].y_max)
                res[i].y_max = currentLvl.items[j].y_pos;
        }
    }
    return (res);
}

function loadLevels() {
    var request = new XMLHttpRequest();
    request.open('GET', "./levels.json");
    request.responseType = "json";
    request.send();

    request.onload = function() {
        levels = request.response;
        levels = parseJsonLevels(levels.levels);
        startGame();
    }
}


window.onload = waitLoadImg();

function drawLevel(level, ctx, maxWidth, maxHeight) {
    var i, currentImg, c_x, c_y;
    var x_size = Math.floor(maxWidth / (level.x_max + 1));
    var y_size = Math.floor(maxHeight / (level.y_max + 1));
    console.log(level);

    ctx.drawImage(GameImg["background"], 0, 0, GameImg["background"].width, GameImg["background"].height, 0, 0, maxWidth, maxHeight);
    for (i = 0; i < level.items.length; i++) {
        currentImg = GameImg[level.items[i].id];
        c_x = level.items[i].x_pos;
        c_y = level.items[i].y_pos;
        //console.log("current item:");
        //console.log(level.items[i]);
        //console.log("current img:");
        //console.log(currentImg);
        ctx.drawImage(currentImg, 0, 0, currentImg.width, currentImg.height, c_x * x_size, c_y * y_size, x_size, y_size);
    }
}

function startGame() {
    var canva = document.getElementById(("canvas"));
    var maxWidth = canva.getAttribute("width");
    var maxHeight = canva.getAttribute("height");
    var ctx = canva.getContext("2d");
    drawLevel(levels[0], ctx, maxWidth, maxHeight);

    document.body.onkeypress = function (e) {
        if (e.key == "ArrowUp")
            levels[0].movePlayer(0, -1);
        else if (e.key == "ArrowDown")
            levels[0].movePlayer(0, 1);
        else if (e.key == "ArrowRight")
            levels[0].movePlayer(1, 0);
        else if (e.key == "ArrowLeft")
            levels[0].movePlayer(-1, 0);
        drawLevel(levels[0], ctx, maxWidth, maxHeight);
    }
}
