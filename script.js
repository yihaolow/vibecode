/* Xiangqi Master: Universal JS - Fixed Parser & Chinese Support */

// --- 1. PIECE DEFINITIONS ---
const SVG_PIECES = {
  R: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#c0392b" text-anchor="middle">俥</text></g>`,
  N: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#c0392b" text-anchor="middle">傌</text></g>`,
  E: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#c0392b" text-anchor="middle">相</text></g>`,
  A: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#c0392b" text-anchor="middle">仕</text></g>`,
  K: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#c0392b" text-anchor="middle">帥</text></g>`,
  C: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#c0392b" text-anchor="middle">炮</text></g>`,
  P: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#c0392b" text-anchor="middle">兵</text></g>`,
  r: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#2d3436" text-anchor="middle">車</text></g>`,
  n: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#2d3436" text-anchor="middle">馬</text></g>`,
  e: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#2d3436" text-anchor="middle">象</text></g>`,
  a: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#2d3436" text-anchor="middle">士</text></g>`,
  k: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#2d3436" text-anchor="middle">將</text></g>`,
  c: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#2d3436" text-anchor="middle">砲</text></g>`,
  p: `<g transform="translate(10,10) scale(0.8)"><text x="50" y="70" font-size="65" font-family="KaiTi, SimKai, serif" font-weight="bold" fill="#2d3436" text-anchor="middle">卒</text></g>`,
};

const CN_NUMS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const CN_DIGITS = ["", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
const CN_PIECES = {
  rK: "帥",
  rA: "仕",
  rE: "相",
  rN: "傌",
  rR: "俥",
  rC: "炮",
  rP: "兵",
  bK: "将",
  bA: "士",
  bE: "象",
  bN: "馬",
  bR: "車",
  bC: "砲",
  bP: "卒",
};
const CN_DIR = { "+": "进", "-": "退", "=": "平" };

const STRINGS = {
  en: {
    tabGame: "Game",
    tabTools: "Tools",
    newGame: "New Game",
    undo: "Undo",
    flip: "Flip View",
    reflect: "Reflect",
    load: "Load",
    export: "Export",
    redMove: "Red to Move",
    blackMove: "Black to Move",
    check: " - Check!",
    win: " Wins (Checkmate)",
    stalemate: "Stalemate",
    confirmNew: "Start New Game?",
    copied: "Copied!",
    illegal: "Stopped: Illegal Move encountered at ",
    overwrite: "You are about to change history. Create new Branch?",
  },
  zh: {
    tabGame: "对弈",
    tabTools: "工具",
    newGame: "新对局",
    undo: "悔棋",
    flip: "翻转棋盘",
    reflect: "镜像显示",
    load: "导入",
    export: "导出",
    redMove: "红方走",
    blackMove: "黑方走",
    check: " - 将军!",
    win: " 胜 (绝杀)",
    stalemate: "困毙 (和棋)",
    confirmNew: "开始新对局?",
    copied: "已复制完整棋谱!",
    illegal: "停止: 遇到非法着法于 ",
    overwrite: "是否创建新变着?",
  },
};

// --- 2. SOUND ---
const sfx = {
  ctx: null,
  play(freq, type, decay = 0.1, vol = 0.1) {
    try {
      if (!this.ctx)
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        this.ctx.currentTime + decay
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + decay);
    } catch (e) {}
  },
};

class MoveNode {
  constructor(moveData, parent = null) {
    this.data = moveData;
    this.parent = parent;
    this.children = [];
    this.tempBranchId = null;
  }
}

// --- 3. TEXT PARSER (Fixed for Chinese & Ambiguity) ---
class TextParser {
  constructor() {
    this.PIECE_MAP = {
      // Standard
      兵: "P",
      卒: "p",
      炮: "C",
      砲: "c",
      車: "R",
      俥: "R",
      馬: "N",
      傌: "N",
      相: "E",
      象: "e",
      仕: "A",
      士: "a",
      帥: "K",
      将: "k",
      將: "k",
      // VIE / English
      B: "P",
      P: "C",
      X: "R",
      M: "N",
      T: "E",
      S: "A",
      Tg: "K",
      K: "K",
      C: "C",
      R: "R",
      N: "N",
      E: "E",
      A: "A",
    };
  }

  parseDigit(c) {
    const map = {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      "１": 1,
      "２": 2,
      "３": 3,
      "４": 4,
      "５": 5,
      "６": 6,
      "７": 7,
      "８": 8,
      "９": 9,
    };
    return map[c];
  }

  parse(txt) {
    let tmpEng = new Engine();
    if (game.startFen) game.loadFenTo(game.startFen, tmpEng);
    let moves = "";

    let cleanTxt = txt
      .replace(/\//g, "b") // Support / as retreat
      .replace(/\\/g, "b")
      .replace(/(^|\s)(\d+)[.)]/g, " ") // Remove "1."
      .replace(/[()]/g, " ")
      .replace(/[\t,;]/g, " ")
      .trim();

    let tokens = cleanTxt.split(/\s+/).filter((t) => t.length >= 2);

    for (let t of tokens) {
      if (["0-1", "1-0", "1/2-1/2"].includes(t)) break;
      let move = this.parseToken(t, tmpEng);
      if (move) {
        moves += move;
        let fx = parseInt(move[0]),
          fy = parseInt(move[1]);
        let tx = parseInt(move[2]),
          ty = parseInt(move[3]);
        // Safety check
        if (tmpEng.board[fy] && tmpEng.board[fy][fx]) {
          let p = tmpEng.board[fy][fx];
          if (tmpEng.board[ty]) tmpEng.board[ty][tx] = p;
          tmpEng.board[fy][fx] = null;
          tmpEng.turn = tmpEng.turn === "r" ? "b" : "r";
        }
      } else {
        console.warn("Parser Skipped:", t);
      }
    }
    return moves;
  }

  parseToken(t, eng) {
    let offset = 0;

    // 1. PREFIX
    let prefixFront = t.startsWith("前");
    let prefixBack = t.startsWith("后") || t.startsWith("後");
    if (prefixFront || prefixBack) offset += 1;

    // 2. PIECE
    let pChar = t.substring(offset, offset + 2);
    let pKey = this.PIECE_MAP[pChar];
    if (pKey) {
      offset += 2;
    } else {
      pChar = t[offset];
      pKey = this.PIECE_MAP[pChar];
      if (!pKey) return null;
      offset++;
    }

    // 3. SOURCE / POSITION
    let srcFile = undefined;
    let isFront = prefixFront || (t.startsWith("Xt") && offset <= 2);
    let isBack = prefixBack || (t.startsWith("Xs") && offset <= 2);

    // Handle 'Xt'/'Xs'
    if (t.startsWith("Xt")) {
      isFront = true;
      if (offset < 2) offset = 2;
    }
    if (t.startsWith("Xs")) {
      isBack = true;
      if (offset < 2) offset = 2;
    }

    let nextChar = t[offset];
    let digit = this.parseDigit(nextChar);
    if (digit !== undefined) {
      srcFile = digit;
      offset++;
    } else if (["t", "前"].includes(nextChar)) {
      isFront = true;
      offset++;
    } else if (["s", "h", "后"].includes(nextChar)) {
      isBack = true;
      offset++;
    }

    // 4. DIRECTION
    let dirChar = t[offset];
    let direction = null;
    if (["+", ".", "进"].includes(dirChar)) {
      direction = "adv";
      offset++;
    } else if (["-", "=", "平", "–"].includes(dirChar)) {
      direction = "hor";
      offset++;
    } else if (["b", "B", "退", "/", "\\"].includes(dirChar)) {
      direction = "ret";
      offset++;
    }
    if (!direction) return null;

    // 5. DESTINATION
    let dstVal = this.parseDigit(t[offset]);
    if (dstVal === undefined) return null;

    let turn = eng.turn;
    let targetType = pKey.toUpperCase();
    let candidates = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        let p = eng.board[y][x];
        if (p && p[0] === turn && p[1] === targetType) {
          let file = turn === "r" ? 9 - x : x + 1;
          candidates.push({ x, y, file });
        }
      }
    }

    let finalCand = null;

    // --- AMBIGUITY HANDLING ---
    if (isFront || isBack) {
      let colGroups = {};
      candidates.forEach((c) => {
        if (!colGroups[c.x]) colGroups[c.x] = [];
        colGroups[c.x].push(c);
      });
      for (let xKey in colGroups) {
        let group = colGroups[xKey];
        if (group.length > 1) {
          group.sort((a, b) => a.y - b.y);
          if (turn === "r") {
            finalCand = isFront ? group[0] : group[group.length - 1];
          } else {
            finalCand = isFront ? group[group.length - 1] : group[0];
          }
          break;
        }
      }
    } else if (srcFile !== undefined) {
      // Filter candidates by File
      let fileCands = candidates.filter((c) => c.file === srcFile);
      if (fileCands.length === 1) {
        finalCand = fileCands[0];
      } else if (fileCands.length > 1) {
        // AMBIGUITY FOUND: Check which one can legally make the move
        for (let cand of fileCands) {
          let testY = this.calculateTargetY(
            cand.x,
            cand.y,
            dstVal,
            direction,
            turn,
            targetType
          );
          if (testY >= 0 && testY <= 9) {
            finalCand = cand;
            break;
          }
        }
        if (!finalCand) finalCand = fileCands[0];
      }
    } else {
      if (candidates.length === 1) finalCand = candidates[0];
    }

    if (!finalCand) return null;

    let fx = finalCand.x;
    let fy = finalCand.y;
    let tx, ty;

    let isDiagonal = ["N", "E", "A"].includes(targetType);

    if (direction === "hor") {
      tx = turn === "r" ? 9 - dstVal : dstVal - 1;
      ty = fy;
    } else {
      if (isDiagonal) {
        let tFile = dstVal;
        tx = turn === "r" ? 9 - tFile : tFile - 1;
        ty = this.calculateTargetY(fx, fy, dstVal, direction, turn, targetType);
      } else {
        tx = fx;
        ty = this.calculateTargetY(fx, fy, dstVal, direction, turn, targetType);
      }
    }

    return `${fx}${fy}${tx}${ty}`;
  }

  calculateTargetY(fx, fy, dstVal, direction, turn, targetType) {
    let isDiagonal = ["N", "E", "A"].includes(targetType);
    let ty;
    if (isDiagonal) {
      let tFile = dstVal;
      let tx = turn === "r" ? 9 - tFile : tFile - 1;
      let dx = Math.abs(tx - fx);
      let dy = 0;
      if (targetType === "N") dy = dx === 2 ? 1 : 2;
      if (targetType === "E") dy = 2;
      if (targetType === "A") dy = 1;
      if (turn === "r") ty = direction === "adv" ? fy - dy : fy + dy;
      else ty = direction === "adv" ? fy + dy : fy - dy;
    } else {
      let steps = dstVal;
      if (turn === "r") ty = direction === "adv" ? fy - steps : fy + steps;
      else ty = direction === "adv" ? fy + steps : fy - steps;
    }
    return ty;
  }
}

// --- 4. ENGINE ---
class Engine {
  constructor() {
    this.reset();
  }
  reset() {
    this.board = Array(10)
      .fill(null)
      .map(() => Array(9).fill(null));
    const start = [
      ["bR", "bN", "bE", "bA", "bK", "bA", "bE", "bN", "bR"],
      [null, null, null, null, null, null, null, null, null],
      [null, "bC", null, null, null, null, null, "bC", null],
      ["bP", null, "bP", null, "bP", null, "bP", null, "bP"],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      ["rP", null, "rP", null, "rP", null, "rP", null, "rP"],
      [null, "rC", null, null, null, null, null, "rC", null],
      [null, null, null, null, null, null, null, null, null],
      ["rR", "rN", "rE", "rA", "rK", "rA", "rE", "rN", "rR"],
    ];
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 9; x++) this.board[y][x] = start[y][x];
    this.turn = "r";
    this.root = new MoveNode(null);
    this.cursor = this.root;
  }
  getPiece(x, y) {
    if (x < 0 || x > 8 || y < 0 || y > 9) return null;
    return this.board[y][x];
  }
  getHistory() {
    let hist = [];
    let curr = this.cursor;
    while (curr.parent) {
      hist.push(curr.data);
      curr = curr.parent;
    }
    return hist.reverse();
  }
  validate(fx, fy, tx, ty, p) {
    if (fx === tx && fy === ty) return false;
    const tgt = this.getPiece(tx, ty);
    if (tgt && tgt[0] === p[0]) return false;
    const dx = tx - fx,
      dy = ty - fy,
      adx = Math.abs(dx),
      ady = Math.abs(dy);
    const type = p[1],
      red = p[0] === "r";
    switch (type) {
      case "K":
        return (
          tx >= 3 && tx <= 5 && (red ? ty >= 7 : ty <= 2) && adx + ady === 1
        );
      case "A":
        return (
          tx >= 3 &&
          tx <= 5 &&
          (red ? ty >= 7 : ty <= 2) &&
          adx === 1 &&
          ady === 1
        );
      case "E":
        return (
          (red ? ty >= 5 : ty <= 4) &&
          adx === 2 &&
          ady === 2 &&
          !this.getPiece(fx + dx / 2, fy + dy / 2)
        );
      case "N":
        if (adx === 1 && ady === 2)
          return !this.getPiece(fx, fy + (dy > 0 ? 1 : -1));
        if (adx === 2 && ady === 1)
          return !this.getPiece(fx + (dx > 0 ? 1 : -1), fy);
        return false;
      case "R":
        return (dx === 0 || dy === 0) && this.count(fx, fy, tx, ty) === 0;
      case "C":
        const c = this.count(fx, fy, tx, ty);
        return (dx === 0 || dy === 0) && (tgt ? c === 1 : c === 0);
      case "P":
        const fwd = red ? -1 : 1,
          cross = red ? fy <= 4 : fy >= 5;
        return (dy === fwd && dx === 0) || (cross && dy === 0 && adx === 1);
    }
    return false;
  }
  count(x1, y1, x2, y2) {
    let c = 0,
      dx = Math.sign(x2 - x1),
      dy = Math.sign(y2 - y1),
      x = x1 + dx,
      y = y1 + dy,
      safe = 0;
    while ((x !== x2 || y !== y2) && safe++ < 20) {
      if (this.getPiece(x, y)) c++;
      x += dx;
      y += dy;
    }
    return c;
  }
  inCheck(turn) {
    let k = null,
      opp = turn === "r" ? "b" : "r";
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 9; x++)
        if (this.board[y][x] === turn + "K") k = { x, y };
    if (!k) return true;
    let ok = null;
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 9; x++)
        if (this.board[y][x] === opp + "K") ok = { x, y };
    if (ok && k.x === ok.x && this.count(k.x, k.y, ok.x, ok.y) === 0)
      return true;
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 9; x++) {
        let p = this.board[y][x];
        if (p && p[0] === opp && this.validate(x, y, k.x, k.y, p)) return true;
      }
    return false;
  }
  getLegalMoves() {
    let moves = [],
      turn = this.turn;
    for (let fy = 0; fy < 10; fy++)
      for (let fx = 0; fx < 9; fx++) {
        let p = this.board[fy][fx];
        if (p && p[0] === turn) {
          for (let ty = 0; ty < 10; ty++)
            for (let tx = 0; tx < 9; tx++) {
              if (this.validate(fx, fy, tx, ty, p)) {
                let cap = this.board[ty][tx];
                this.board[ty][tx] = p;
                this.board[fy][fx] = null;
                if (!this.inCheck(turn)) moves.push({ fx, fy, tx, ty, p, cap });
                this.board[fy][fx] = p;
                this.board[ty][tx] = cap;
              }
            }
        }
      }
    return moves;
  }
  move(fx, fy, tx, ty) {
    const mvStr = `${fx}${fy}${tx}${ty}`;
    let existingChild = this.cursor.children.find((c) => c.data.mv === mvStr);
    if (!existingChild && this.cursor.children.length > 0) {
      if (!confirm(ui.getText("overwrite"))) return false;
    }
    let p = this.board[fy][fx];
    if (!p || p[0] !== this.turn) return false;
    let cap = this.board[ty][tx];
    if (!this.validate(fx, fy, tx, ty, p)) return false;
    this.board[ty][tx] = p;
    this.board[fy][fx] = null;
    if (this.inCheck(this.turn)) {
      this.board[fy][fx] = p;
      this.board[ty][tx] = cap;
      return false;
    }
    if (existingChild) {
      this.cursor = existingChild;
    } else {
      let newNode = new MoveNode(
        { fx, fy, tx, ty, p, cap, mv: mvStr },
        this.cursor
      );
      this.cursor.children.push(newNode);
      this.cursor = newNode;
    }
    this.turn = this.turn === "r" ? "b" : "r";
    return cap;
  }
}

// --- 5. UI & INIT ---
const ui = {
  flip: false,
  reflect: false,
  sel: null,
  lang: "en",
  init() {
    this.render();
    this.updateInfo();
    this.updateText();
  },
  toggleLang() {
    this.lang = this.lang === "en" ? "zh" : "en";
    this.updateText();
    this.updateInfo();
  },
  getText(key) {
    return STRINGS[this.lang][key] || key;
  },
  updateText() {
    document.querySelectorAll("[data-key]").forEach((el) => {
      el.innerText = this.getText(el.dataset.key);
    });
    document.title = "Xiangqi Master: Universal";
  },
  switchTab(t) {
    document
      .querySelectorAll(".tab")
      .forEach((e) => e.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((e) => e.classList.remove("active"));
    event.target.classList.add("active");
    document.getElementById("tab-" + t).classList.add("active");
  },
  doFlip() {
    this.flip = !this.flip;
    this.render();
  },
  doReflect() {
    this.reflect = !this.reflect;
    this.render();
    this.updateInfo();
  },
  toPx(x, y) {
    let rx = this.reflect ? 8 - x : x,
      ry = y;
    if (this.flip) {
      rx = 8 - rx;
      ry = 9 - y;
    }
    return { left: rx * 11.1111, top: ry * 10 };
  },
  toLog(cx, cy) {
    const rect = document.getElementById("boardFrame").getBoundingClientRect();
    let x = Math.floor((cx - rect.left) / (rect.width / 9)),
      y = Math.floor((cy - rect.top) / (rect.height / 10));
    if (x < 0 || x > 8 || y < 0 || y > 9) return null;
    if (this.flip) {
      x = 8 - x;
      y = 9 - y;
    }
    if (this.reflect) x = 8 - x;
    return { x, y };
  },
  click(e) {
    if (game.isGameOver) return;
    const c = this.toLog(e.clientX, e.clientY);
    if (!c) return;
    const p = game.eng.getPiece(c.x, c.y);
    const handleMove = () => {
      const cap = game.eng.move(this.sel.x, this.sel.y, c.x, c.y);
      if (cap !== false) {
        sfx.play(cap ? 600 : 300, cap ? "triangle" : "square");
        this.sel = null;
        this.render();
        this.updateInfo();
        game.checkGameOver();
      } else if (p && p[0] === game.eng.turn) {
        this.sel = c;
        requestAnimationFrame(() => this.render());
      } else {
        this.sel = null;
        requestAnimationFrame(() => this.render());
      }
    };
    if (this.sel) handleMove();
    else if (p && p[0] === game.eng.turn) {
      this.sel = c;
      requestAnimationFrame(() => this.render());
    }
  },
  render() {
    const pL = document.getElementById("pieceLayer"),
      mL = document.getElementById("markerLayer");
    if (!pL) return;
    pL.innerHTML = "";
    mL.innerHTML = "";
    let hist = game.eng.getHistory();
    let tmp = new Engine();
    if (game.startFen) game.loadFenTo(game.startFen, tmp);
    hist.forEach((m) => {
      tmp.board[m.ty][m.tx] = tmp.board[m.fy][m.fx];
      tmp.board[m.fy][m.fx] = null;
    });
    let board = tmp.board;
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 9; x++) {
        let p = board[y][x];
        let pos = this.toPx(x, y);
        let last = hist[hist.length - 1];
        if (
          last &&
          ((last.fx === x && last.fy === y) || (last.tx === x && last.ty === y))
        ) {
          let m = document.createElement("div");
          m.className = "marker last";
          m.style.left = pos.left + "%";
          m.style.top = pos.top + "%";
          mL.appendChild(m);
        }
        if (this.sel && this.sel.x === x && this.sel.y === y) {
          let m = document.createElement("div");
          m.className = "marker select";
          m.style.left = pos.left + "%";
          m.style.top = pos.top + "%";
          mL.appendChild(m);
          tmp.turn = game.eng.turn;
          tmp
            .getLegalMoves()
            .filter((m) => m.fx === x && m.fy === y)
            .forEach((m) => {
              let dPos = this.toPx(m.tx, m.ty),
                d = document.createElement("div");
              d.className = "marker dot";
              d.style.left = dPos.left + "%";
              d.style.top = dPos.top + "%";
              mL.appendChild(d);
            });
        }
        if (p) {
          let d = document.createElement("div");
          d.className = `piece ${p[0] === "r" ? "red" : "black"}`;
          let key = p[1];
          if (p[0] === "b") key = key.toLowerCase();
          d.innerHTML = `<div class="piece-inner"><svg viewBox="0 0 100 100">${SVG_PIECES[key]}</svg></div>`;
          d.style.left = pos.left + "%";
          d.style.top = pos.top + "%";
          pL.appendChild(d);
        }
      }
  },
  updateInfo() {
    const list = document.getElementById("history"),
      statusEl = document.getElementById("status");
    const branchCtrl = document.getElementById("branchCtrl"),
      varInfo = document.getElementById("varInfo");
    document.getElementById("playBtn").innerText = game.isPlaying ? "||" : "▶";
    if (game.isGameOver) {
      statusEl.style.color = "yellow";
      statusEl.innerText = game.gameOverStatus;
    } else {
      statusEl.style.color = game.eng.turn === "r" ? "#ff6b6b" : "#aaa";
      statusEl.innerText = this.getText(
        game.eng.turn === "r" ? "redMove" : "blackMove"
      );
      if (game.eng.inCheck(game.eng.turn))
        statusEl.innerText += this.getText("check");
    }
    if (game.eng.cursor.parent && game.eng.cursor.parent.children.length > 1) {
      branchCtrl.classList.add("active");
      let sibs = game.eng.cursor.parent.children;
      let idx = sibs.indexOf(game.eng.cursor);
      varInfo.innerText = `Var: ${idx + 1}/${sibs.length}`;
    } else {
      branchCtrl.classList.remove("active");
    }
    list.innerHTML = "";
    let tmp = new Engine();
    if (game.startFen) game.loadFenTo(game.startFen, tmp);
    let hist = game.eng.getHistory();
    for (let i = 0; i < hist.length; i += 2) {
      let h1 = hist[i],
        h2 = hist[i + 1];
      let not1 = game.genNotation(tmp, h1, this.reflect);
      tmp.board[h1.ty][h1.tx] = tmp.board[h1.fy][h1.fx];
      tmp.board[h1.fy][h1.fx] = null;
      let not2 = h2 ? game.genNotation(tmp, h2, this.reflect) : "";
      if (h2) {
        tmp.board[h2.ty][h2.tx] = tmp.board[h2.fy][h2.fx];
        tmp.board[h2.fy][h2.fx] = null;
      }
      let div = document.createElement("div");
      let isCurr =
        game.eng.cursor.data === h1 || (h2 && game.eng.cursor.data === h2);
      div.className = "row" + (isCurr ? " current" : "");
      div.innerHTML = `<span>${i / 2 + 1}.</span><span onclick="game.goto(${
        i + 1
      })">${not1}</span><span onclick="game.goto(${i + 2})">${not2}</span>`;
      list.appendChild(div);
      if (isCurr) div.scrollIntoView({ block: "nearest" });
    }
  },
  splash(txt) {
    let el = document.getElementById("splash");
    el.innerText = txt;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
    sfx.play(440, "sine", 0.5, 0.4);
  },
};

const game = {
  eng: new Engine(),
  startFen:
    "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
  isGameOver: false,
  gameOverStatus: "",
  isPlaying: false,
  playTimer: null,
  newGame() {
    if (!confirm(ui.getText("confirmNew"))) return;
    this.eng.reset();
    this.startFen =
      "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
    document.getElementById("fenBox").value = "";
    this.stopPlay();
    ui.sel = null;
    ui.flip = false;
    ui.reflect = false;
    this.isGameOver = false;
    this.gameOverStatus = "";
    ui.init();
    sfx.play(400, "sawtooth");
  },
  reset() {
    this.newGame();
  },
  undo() {
    this.stopPlay();
    if (this.eng.cursor.parent) {
      let p = this.eng.cursor.data;
      this.eng.board[p.fy][p.fx] = p.p;
      this.eng.board[p.ty][p.tx] = p.cap;
      this.eng.cursor = this.eng.cursor.parent;
      this.eng.turn = this.eng.turn === "r" ? "b" : "r";
      this.isGameOver = false;
      ui.sel = null;
      ui.render();
      ui.updateInfo();
    }
  },
  goto(i) {
    this.stopPlay();
    if (i < 0) i = 0;
    while (this.eng.cursor.parent) {
      let p = this.eng.cursor.data;
      this.eng.board[p.fy][p.fx] = p.p;
      this.eng.board[p.ty][p.tx] = p.cap;
      this.eng.cursor = this.eng.cursor.parent;
      this.eng.turn = this.eng.turn === "r" ? "b" : "r";
    }
    for (let k = 0; k < i; k++) {
      if (this.eng.cursor.children.length > 0) {
        let next = this.eng.cursor.children[0];
        let n = next.data;
        this.eng.board[n.ty][n.tx] = n.p;
        this.eng.board[n.fy][n.fx] = null;
        this.eng.cursor = next;
        this.eng.turn = this.eng.turn === "r" ? "b" : "r";
      } else break;
    }
    ui.sel = null;
    ui.render();
    ui.updateInfo();
  },
  nextVar() {
    if (this.eng.cursor.parent) {
      let sibs = this.eng.cursor.parent.children;
      let idx = sibs.indexOf(this.eng.cursor);
      let next = sibs[(idx + 1) % sibs.length];
      this.swapToSibling(next);
    }
  },
  prevVar() {
    if (this.eng.cursor.parent) {
      let sibs = this.eng.cursor.parent.children;
      let idx = sibs.indexOf(this.eng.cursor);
      let prev = sibs[(idx - 1 + sibs.length) % sibs.length];
      this.swapToSibling(prev);
    }
  },
  swapToSibling(node) {
    let p = this.eng.cursor.data;
    this.eng.board[p.fy][p.fx] = p.p;
    this.eng.board[p.ty][p.tx] = p.cap;
    let n = node.data;
    this.eng.board[n.ty][n.tx] = n.p;
    this.eng.board[n.fy][n.fx] = null;
    this.eng.cursor = node;
    ui.render();
    ui.updateInfo();
  },
  step(d) {
    if (d === -1) {
      this.undo();
      return;
    }
    if (this.eng.cursor.children.length > 0) {
      let next = this.eng.cursor.children[0];
      let n = next.data;
      this.eng.board[n.ty][n.tx] = n.p;
      this.eng.board[n.fy][n.fx] = null;
      this.eng.cursor = next;
      this.eng.turn = this.eng.turn === "r" ? "b" : "r";
      ui.render();
      ui.updateInfo();
    }
  },
  togglePlay() {
    if (this.isPlaying) this.stopPlay();
    else {
      this.isPlaying = true;
      ui.updateInfo();
      this.playTimer = setInterval(() => {
        if (this.eng.cursor.children.length > 0) this.step(1);
        else this.stopPlay();
      }, 1000);
    }
  },
  stopPlay() {
    clearInterval(this.playTimer);
    this.isPlaying = false;
    ui.updateInfo();
  },

  load() {
    let txt = document.getElementById("fenBox").value.trim();
    if (!txt) return;
    this.stopPlay();
    let fen =
      "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
    let mainMoveStr = "";
    let branches = [];

    if (txt.includes("[DhtmlXQ]")) {
      let f = txt.match(/\[DhtmlXQ_fen\](.*?)\[\/DhtmlXQ_fen\]/);
      if (f) fen = f[1];
      let m = txt.match(/\[DhtmlXQ_movelist\](.*?)\[\/DhtmlXQ_movelist\]/);
      if (m) mainMoveStr = m[1];
      const regex = /\[DhtmlXQ_move_(\d+)_(\d+)_(\d+)\](.*?)\[/g;
      let match;
      while ((match = regex.exec(txt)) !== null) {
        branches.push({
          pid: parseInt(match[1]),
          idx: parseInt(match[2]),
          id: parseInt(match[3]),
          moves: match[4],
        });
      }
    } else if (/^[\d\s]+$/.test(txt) && txt.replace(/\s/g, "").length > 6) {
      mainMoveStr = txt.replace(/\s/g, "");
    } else if (txt.includes("/") && txt.split(" ").length >= 4) {
      fen = txt;
    } else {
      let parser = new TextParser();
      this.startFen = fen;
      mainMoveStr = parser.parse(txt);
    }

    this.eng.reset();
    this.loadFenTo(fen, this.eng);
    this.startFen = fen;
    this.isGameOver = false;
    this.gameOverStatus = "";

    const processMoves = (node, moveStr, branchId) => {
      let curr = node;
      for (let i = 0; i < moveStr.length; i += 4) {
        let fx = parseInt(moveStr[i]),
          fy = parseInt(moveStr[i + 1]);
        let tx = parseInt(moveStr[i + 2]),
          ty = parseInt(moveStr[i + 3]);

        let tmpEng = new Engine();
        this.loadFenTo(this.startFen, tmpEng);
        let path = [];
        let pNode = curr;
        while (pNode.parent) {
          path.push(pNode.data);
          pNode = pNode.parent;
        }
        path.reverse().forEach((m) => {
          tmpEng.board[m.ty][m.tx] = m.p;
          tmpEng.board[m.fy][m.fx] = null;
          tmpEng.turn = tmpEng.turn === "r" ? "b" : "r";
        });

        let p = tmpEng.getPiece(fx, fy);
        if (!p) break;
        let cap = tmpEng.board[ty][tx];
        let mvStr = `${fx}${fy}${tx}${ty}`;
        let existing = curr.children.find((c) => c.data.mv === mvStr);
        if (existing) {
          curr = existing;
        } else {
          let newNode = new MoveNode(
            { fx, fy, tx, ty, p, cap, mv: mvStr },
            curr
          );
          newNode.tempBranchId = branchId;
          curr.children.push(newNode);
          curr = newNode;
        }
      }
      return curr;
    };

    if (mainMoveStr) processMoves(this.eng.root, mainMoveStr, 0);

    if (branches.length > 0) {
      branches.sort((a, b) => a.pid - b.pid);
    }

    this.eng.cursor = this.eng.root;
    this.goto(9999);
    this.checkGameOver();
    ui.init();
    sfx.play(500, "square");
  },
  loadFenTo(fen, engine) {
    let rows = fen.split(" ")[0].split("/");
    engine.board = Array(10)
      .fill(null)
      .map(() => Array(9).fill(null));
    rows.forEach((r, y) => {
      let x = 0;
      for (let c of r) {
        if (!isNaN(c)) x += parseInt(c);
        else {
          let color = c === c.toUpperCase() ? "r" : "b",
            t = c.toUpperCase();
          if (t === "H") t = "N";
          if (t === "B") t = "E";
          engine.board[y][x] = color + t;
          x++;
        }
      }
    });
    engine.turn = fen.split(" ")[1] || "r";
    if (engine.turn === "w") engine.turn = "r";
  },
  checkGameOver() {
    const moves = this.eng.getLegalMoves();
    const winTxt =
      ui
        .getText(this.eng.turn === "r" ? "blackMove" : "redMove")
        .split(" ")[0] + ui.getText("win");
    if (moves.length === 0) {
      this.isGameOver = true;
      if (this.eng.inCheck(this.eng.turn)) {
        this.gameOverStatus = winTxt;
        ui.splash("绝 杀");
      } else {
        this.gameOverStatus = ui.getText("stalemate");
        ui.splash("闷 宫");
      }
    } else if (this.eng.inCheck(this.eng.turn)) ui.splash("將 軍");
    ui.updateInfo();
  },
  genNotation(tempEng, move, isReflect) {
    const { fx, fy, tx, ty, p } = move;
    if (!p) return "";
    const red = p[0] === "r",
      type = p[1];
    let name = CN_PIECES[p];
    let srcF, dstF;
    if (!isReflect) {
      srcF = red ? 9 - fx : fx + 1;
      dstF = red ? 9 - tx : tx + 1;
    } else {
      srcF = red ? fx + 1 : 9 - fx;
      dstF = red ? tx + 1 : 9 - tx;
    }
    let sameCol = [];
    if (!["A", "E", "K"].includes(type)) {
      for (let y = 0; y < 10; y++)
        if (tempEng.board[y][fx] === p) sameCol.push(y);
    }
    let otherColHasStack = false;
    if (!["A", "E", "K"].includes(type)) {
      for (let x = 0; x < 9; x++) {
        if (x === fx) continue;
        let count = 0;
        for (let y = 0; y < 10; y++) if (tempEng.board[y][x] === p) count++;
        if (count > 1) {
          otherColHasStack = true;
          break;
        }
      }
    }
    let prefix = "",
      useFileInsteadOfName = false;
    if (sameCol.length > 1) {
      if (red) sameCol.sort((a, b) => a - b);
      else sameCol.sort((a, b) => b - a);
      let idx = sameCol.indexOf(fy);
      if (sameCol.length === 2) prefix = idx === 0 ? "前" : "后";
      else if (sameCol.length === 3)
        prefix = idx === 0 ? "前" : idx === 1 ? "中" : "后";
      else {
        const P_MAP = ["前", "二", "三", "四", "五"];
        prefix = idx === sameCol.length - 1 ? "后" : P_MAP[idx];
      }
      if (otherColHasStack && type === "P") useFileInsteadOfName = true;
      name = useFileInsteadOfName
        ? prefix + (red ? CN_NUMS[srcF] : CN_DIGITS[srcF])
        : prefix + name;
    }
    const dy = ty - fy;
    let dir = fy === ty ? "=" : (red ? dy < 0 : dy > 0) ? "+" : "-";
    let dest = "";
    if (["R", "C", "P", "K"].includes(type) && dir !== "=") {
      let dist = Math.abs(dy);
      dest = red ? CN_NUMS[dist] : CN_DIGITS[dist];
    } else dest = red ? CN_NUMS[dstF] : CN_DIGITS[dstF];
    if (sameCol.length > 1) return name + CN_DIR[dir] + dest;
    let fChar = red ? CN_NUMS[srcF] : CN_DIGITS[srcF];
    return name + fChar + CN_DIR[dir] + dest;
  },
  export() {
    const type = document.getElementById("exportFormat").value;
    let fen = "";
    for (let y = 0; y < 10; y++) {
      let e = 0;
      for (let x = 0; x < 9; x++) {
        let p = this.eng.board[y][x];
        if (!p) e++;
        else {
          if (e) fen += e;
          e = 0;
          let c = p[1];
          if (c === "N") c = "H";
          if (c === "E") c = "B";
          fen += p[0] === "r" ? c.toUpperCase() : c.toLowerCase();
        }
      }
      if (e) fen += e;
      if (y < 9) fen += "/";
    }
    fen += ` ${this.eng.turn} - - 0 1`;
    let tmp = new Engine();
    if (this.startFen) this.loadFenTo(this.startFen, tmp);
    let binitStr = "";
    for (let y = 9; y >= 0; y--)
      for (let x = 0; x < 9; x++) if (tmp.board[y][x]) binitStr += `${x}${y}`;
    let mainMoveStr = "";
    let branchTags = "";
    let branchIdCounter = 1;
    let pending = [
      { startNode: this.eng.root, bid: 0, parentBid: 0, parentDepth: 0 },
    ];
    let nodeMap = new Map();
    nodeMap.set(this.eng.root, { bid: 0, depth: 0 });
    let activePathSet = new Set();
    let p = this.eng.cursor;
    while (p) {
      activePathSet.add(p);
      p = p.parent;
    }
    while (pending.length) {
      let task = pending.shift();
      let str = "";
      let ptr = task.startNode;
      if (task.startNode !== this.eng.root) str += ptr.data.mv;
      let d = task.startNode === this.eng.root ? 0 : task.parentDepth + 1;
      nodeMap.set(ptr, { bid: task.bid, depth: d });
      while (true) {
        let mainChild = null;
        if (activePathSet.has(ptr)) {
          mainChild = ptr.children.find((c) => activePathSet.has(c));
        }
        if (!mainChild && ptr.children.length > 0) mainChild = ptr.children[0];
        if (!mainChild) break;
        str += mainChild.data.mv;
        d++;
        nodeMap.set(mainChild, { bid: task.bid, depth: d });
        ptr.children.forEach((c) => {
          if (c !== mainChild) {
            pending.push({
              startNode: c,
              bid: branchIdCounter++,
              parentBid: task.bid,
              parentDepth: d - 1,
            });
          }
        });
        ptr = mainChild;
      }
      if (task.bid === 0) mainMoveStr = str;
      else {
        let tagIdx = task.parentDepth + 1;
        branchTags += `[DhtmlXQ_move_${task.parentBid}_${tagIdx}_${task.bid}]${str}[/DhtmlXQ_move_${task.parentBid}_${tagIdx}_${task.bid}]\n`;
      }
    }
    let tmpNot = new Engine();
    if (this.startFen) this.loadFenTo(this.startFen, tmpNot);
    let movesTxt = "";
    let hist = this.eng.getHistory();
    hist.forEach((h, i) => {
      let not = this.genNotation(tmpNot, h, false);
      movesTxt += i % 2 === 0 ? `${i / 2 + 1}. ${not} ` : `${not}\n`;
      tmpNot.board[h.ty][h.tx] = tmpNot.board[h.fy][h.fx];
      tmpNot.board[h.fy][h.fx] = null;
    });
    let output = "";
    if (type === "text") {
      output = `开始局面: ${this.startFen}\n着法:\n${movesTxt}`;
    } else {
      output = `[DhtmlXQ]\n[DhtmlXQ_fen]${this.startFen}[/DhtmlXQ_fen]\n[DhtmlXQ_binit]${binitStr}[/DhtmlXQ_binit]\n[DhtmlXQ_movelist]${mainMoveStr}[/DhtmlXQ_movelist]\n${branchTags}[/DhtmlXQ]`;
    }
    document.getElementById("fenBox").value = output;
    navigator.clipboard.writeText(output);
    alert(ui.getText("copied"));
  },
};

ui.init();
