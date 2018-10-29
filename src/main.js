const VOID = 0;
const BABA = 1;
const REAL_WALL = 2;
const WALL = 3;
const FLAG = 4;

const P_PLAYER = BABA + 100;
const P_WIN = FLAG + 100;
const P_STOP = REAL_WALL + 100;

const N_BABA = BABA + 200;
const N_WALL = WALL + 200;
const N_FLAG = FLAG + 200;

function Entity(id, x_pos, y_pos) {
    this.self = this;
    this.id=id;
    this.property=id + 100;
    this.player = this.id == BABA ? true : false;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.movable = true;
    this.block = true;

    var changeProperties = function (n_id) {
        this.property = id < 100 ? id + 100 : id;
    }
}

function initMap(ligne, col) {
    var res = [];
    var i;
    var j;
    for (i = 0; i < ligne; i++) {
        res.push([]);
        for (j = 0; j < col; j++) {
            res[i].push(new Entity(VOID, j, i));
        }
    }
    return (res);
}

function consoleMapStr(map) {
    var i;
    var j;
    var res = "";

    for (i = 0; i < map.length; i++) {
        for (j = 0; j < map[i].length; j++) {
            res += map[i][j].id + ", ";
        }
        res += "\n";
    }
    return (res);
}

var map = initMap(15, 12);

console.log("Map:\n" + consoleMapStr(map));
