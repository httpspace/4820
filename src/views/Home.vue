<template>
  <div class="container">
    <div class="heading">
      <h1 @click="cnt++">2048!</h1>
      <div class="scores">
        <div class="score">
          <div class="name">BEST SCORE</div>
          <div class="value">{{ state.bestScore | round }}</div>
        </div>
        <div class="score">
          <div class="name">SCORE</div>
          <div class="value">{{ state.score | round }}</div>
        </div>
      </div>
    </div>
    <div class="menus">
      <div>
        <button @click="restart">restart</button>

        <button v-if="cnt > 10" @click="switchLeadboard">switch</button>
        <!--
        <button v-else @click="undo" :disabled="stack.length<2">undo({{stack.length-1}})</button>-->
      </div>
    </div>
    <div class="mid">
      <div class="grid" ref="grid">
        <span>
          <div v-for="y of game.size[1]" v-bind:key="y">
            <tile
              v-for="x of game.size[0]"
              :data="{ x: x - 1, y: y - 1 }"
              :key="x + ':' + y"
              :game="game"
            />
          </div>
        </span>
        <transition-group>
          <tile
            v-for="item of tiles"
            :data="item"
            :game="game"
            :key="item.id"
          />
        </transition-group>
        <div v-if="gameEnd" class="message" :class="state" ref="capture">
          <div v-if="state.gameover" class="text">
            Score: {{ state.score | round }} <br />Game over!
          </div>

          <div v-else-if="state.win" class="text">You win!</div>
          <div>
            <table class="table" style="font-size: large; display: initial">
              <tbody>
                <tr v-for="(item, index) in leaderboardView" v-bind:key="index">
                  <td>第 {{ item.rank }} 名</td>
                  <td><img :src="item.photo" style="width: 15px" /></td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.score }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="btns">
            <button class="share" @click="share">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="facebook-f"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
                style="width: 15px; padding: 3px"
              >
                <path
                  fill="currentColor"
                  d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
                  class
                />
              </svg>
              Share
            </button>
            <button @click="restart">Try again</button>
            <!--
            <button @click="updateLeadboardScore">add score</button>-->
            <button v-if="cnt > 10" @click="state.gameover = false">
              Keep going
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="btns">
      <button @click="move('←')">←</button>
      <button @click="move('↑')">↑</button>
      <button @click="move('↓')">↓</button>
      <button @click="move('→')">→</button>
    </div>

    <button v-show="cnt >= 10" @click="state.gameover = true">end</button>
  </div>
</template>

<script>
import tile from "./tile.vue";
import Hammer from "hammerjs";
import _ from "lodash";
import html2canvas from "html2canvas";
export default {
  // name: "game2048",
  components: {
    tile,
  },
  data() {
    return {
      mode: "solo",
      contextID: null,
      LEADERBOARD_NAME: "test_leadboard",
      // LEADERBOARD_NAME: "global_leaderboard",
      contextlastID: 3209143299139857,
      leaderboard: {},
      leaderboardView: [],
      cnt: 5,
      game: { size: [4, 4], maxStack: 5 },
      state: null,
      tiles: null,
      tileMap: null,
      stack: null,
      lock: null,
      share_image: null,
    };
  },
  created() {
    this._APPINIT(() => {
      console.log("callback");
      this.contextID = window.FBInstant.context.getID();
      // this.contextID = 3209143299139857;
      if (this.contextID !== null) {
        this.fetchLeaderboard();
        this.mode = "social";
      }
    });
    this.reset();
    window.localStorage.stack ? this.restore() : this.generate();
  },
  mounted() {
    document.addEventListener("keydown", this.onKeyDown);
    let {
      DIRECTION_LEFT: left,
      DIRECTION_RIGHT: right,
      DIRECTION_UP: up,
      DIRECTION_DOWN: down,
      DIRECTION_ALL: all,
    } = Hammer;
    let directions = { [left]: "←", [up]: "↑", [down]: "↓", [right]: "→" };
    let hm = new Hammer(this.$refs.grid);
    hm.get("swipe").set({ direction: all, threshold: 5 });
    hm.on("swipe", (ev) => {
      let direction = directions[ev.direction];
      direction && this.move(direction);
    });
  },
  computed: {
    Profile() {
      return this.$store.state.Profile;
    },
    gameEnd() {
      var state =
        (this.state.win && !this.state.keepGoing) || this.state.gameover;
      // if (state) {
      //   this.updateLeadboardScore();
      //   this.toCanvas();
      // }
      return state;
    },
  },
  watch: {
    state: {
      handler: function (data) {
        if ((data.win && !data.keepGoing) || data.gameover) {
          console.log(this.mode);
          if (this.mode == "solo") {
            this.toCanvas();
          } else {
            console.log("update leadboard");
            this.updateLeadboardScore();
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    switchLeadboard() {
      window.FBInstant.context.switchAsync("3627131757332617").then(() => {
        this.contextID = window.FBInstant.context.getID();
        this.fetchLeaderboard();
        this.mode = "social";
      });
    },
    getLeaderboardName() {
      // console.log(this.contextID);
      if (this.contextID != null) {
        return this.LEADERBOARD_NAME + "." + this.contextID;
      }
      // if (this.contextlastID != null) {
      //   return this.LEADERBOARD_NAME + "." + this.contextlastID;
      // }
      return this.LEADERBOARD_NAME;
    },
    fetchLeaderboard() {
      var b = this.getLeaderboardName();
      console.log(b);
      window.FBInstant.getLeaderboardAsync(b)
        .then((result) => {
          this.leaderboard = result;
          return this.leaderboard.getEntriesAsync(10, 0);
          // return this.leaderboard.getPlayerEntryAsync();
        })
        .then(this.updateLeaderboardEntries)
        .catch(function (error) {
          console.log("Leaderboard is not found in app configuration" + error);
        });
    },
    updateLeadboardScore() {
      var score = parseInt(this.state.score, 10);
      if (this.contextID == null) return;
      console.log("update score: " + score);
      this.state.score + 1;
      this.leaderboard
        .setScoreAsync(score)
        .then(this.fetchLeaderboard)
        .catch((error) => {
          this.fetchLeaderboard();
          console.log("Error sending score: " + error.message);
        });
    },
    getPlayerEntry() {
      var b = this.getLeaderboardName();
      window.FBInstant.getLeaderboardAsync(b)

        .then(function (leaderboard) {
          return leaderboard.getPlayerEntryAsync();
        })

        .then(function (entry) {
          console.log(entry.getRank()); // 2

          console.log(entry.getScore()); // 42

          console.log(entry.getExtraData()); // '{race: "elf", level: 3}'
        });
    },
    updateLeaderboardEntries: function (entries) {
      this.leaderboardView = [];
      entries.forEach((entry) => {
        this.leaderboardView.push({
          rank: entry.getRank(),
          photo: entry.getPlayer().getPhoto(),
          name: entry.getPlayer().getName(),
          score: entry.getFormattedScore(),
        });
      });
      this.toCanvas();
    },
    toCanvas: function () {
      setTimeout(() => {
        window.scrollTo(0, 0);
        html2canvas(this.$refs.capture).then((canvas) => {
          this.share_image = canvas.toDataURL();
        });
      }, 300);
    },
    share: function () {
      // console.log(this.Profile);
      window.FBInstant.shareAsync({
        intent: "SHARE",
        image: this.share_image,
        text: this.Profile.name + "的分享內容",
        data: {},
      }).then(() => {
        console.log("分享");
      });
    },
    reset() {
      Object.assign(this, {
        tiles: [],
        tileMap: {},
        stack: [],
        lock: false,
        state: {
          win: false,
          gameover: false,
          score: 0,
          keepGoing: false,
          tileId: 1,
          bestScore: +window.localStorage.bestScore || 0,
        },
      });
    },
    key(x, y) {
      return `${x}:${y}`;
    },
    restart() {
      this.reset();
      // this.state.keepGoing = ;
      this.generate();
    },
    keepGoing() {
      this.state.keepGoing = true;
    },
    increaseScore(value, combo) {
      this.state.score +=
        combo > 1 ? value * (Math.pow(combo, 1.4) / 2) : value;
      if (this.state.score > this.state.bestScore)
        this.state.bestScore = this.state.score;
    },
    generate() {
      let [width, height] = this.game.size;
      for (let x of _(0).range(width).shuffle().value()) {
        for (let y of _(0).range(height).shuffle().value()) {
          let key = this.key(x, y);
          if (this.tileMap[key]) continue;
          this.tiles.push(
            (this.tileMap[key] = {
              id: this.state.tileId++,
              combo: 0,
              x,
              y,
              value: 2,
            })
          );
          if (this.tiles.length === width * height) this.gameoverCheck();
          this.remember();
          this.save();
          return;
        }
      }
    },
    *moveUp(tileX, tileY) {
      for (let y = tileY - 1; y >= 0; y--) yield [tileX, y];
    },
    *moveDown(tileX, tileY) {
      for (let y = tileY + 1; y < this.game.size[1]; y++) yield [tileX, y];
    },
    *moveLeft(tileX, tileY) {
      for (let x = tileX - 1; x >= 0; x--) yield [x, tileY];
    },
    *moveRight(tileX, tileY) {
      for (let x = tileX + 1; x < this.game.size[0]; x++) yield [x, tileY];
    },
    move(direction) {
      if (this.gameEnd) return;
      let directions = {
        "↑": [this.moveUp, ["x", "y"], ["asc", "asc"]],
        "↓": [this.moveDown, ["x", "y"], ["asc", "desc"]],
        "←": [this.moveLeft, ["y", "x"], ["asc", "asc"]],
        "→": [this.moveRight, ["y", "x"], ["asc", "desc"]],
      };
      let [iterator, ...orderBy] = directions[direction];

      let [toRemove, comboRecord, combined] = [[], [], {}];
      let tryCombine = (to, tile) => {
        if (combined[to.id] || to.value !== tile.value) return;
        combined[to.id] = combined[tile.id] = true;
        to.value += tile.value;
        let combo = Math.max(to.combo, tile.combo) + 1;
        comboRecord.push([to, combo]);
        this.increaseScore(to.value, combo);
        Object.assign(tile, { x: to.x, y: to.y });
        if (to.value === 2048) this.state.win = true;
      };
      let moved = false;
      let tryMove = (tile) => {
        let movedKey = null;
        let key = this.key(tile.x, tile.y);
        for (let [x, y] of iterator(tile.x, tile.y)) {
          let toKey = this.key(x, y);
          let to = this.tileMap[toKey];
          if (to) {
            tryCombine(to, tile);
            break;
          } else {
            movedKey = toKey;
            Object.assign(tile, { x, y });
          }
        }
        let tileMoved = combined[tile.id] || movedKey;
        if (!tileMoved) return;
        delete this.tileMap[key];
        moved = true;
        if (combined[tile.id]) toRemove.push(tile);
        else if (movedKey) this.tileMap[movedKey] = tile;
      };
      _(this.tiles)
        .filter(({ x, y }) => this.tileMap[this.key(x, y)])
        .orderBy(...orderBy)
        .forEach(tryMove);

      if (!moved) return;
      this.tiles.forEach((tile) => {
        tile.combo = 0;
      });
      comboRecord.forEach(([tile, combo]) => {
        tile.combo = combo;
      });
      this.$nextTick(() => {
        _.pullAll(this.tiles, toRemove);
        this.generate();
      });
    },
    gameoverCheck() {
      let [width, height] = this.game.size;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          let tile = _.get(this.tileMap, [this.key(x, y), "value"]);
          let right = _.get(this.tileMap, [this.key(x + 1, y), "value"]);
          let down = _.get(this.tileMap, [this.key(x, y + 1), "value"]);
          if (tile === right || tile === down) return;
        }
      }
      this.state.gameover = true;
    },
    save: _.throttle(function () {
      window.localStorage.stack = JSON.stringify(this.stack);
      window.localStorage.bestScore = this.state.bestScore;
    }, 2000),
    restore() {
      this.reset();
      let stack = JSON.parse(window.localStorage.stack || "null");
      if (!stack) return;
      let [state, tiles] = _.last(stack);
      let tileMap = _.keyBy(tiles, ({ x, y }) => this.key(x, y));
      Object.assign(this, { tiles, tileMap, state, stack });
    },
    remember() {
      if (!this.tiles.length) return;
      let state = Object.assign({}, this.state);
      let tiles = this.tiles.map((x) => Object.assign({}, x));
      this.stack.push([state, tiles]);
      if (this.stack.length - 1 > this.game.maxStack) this.stack.shift();
    },
    undo() {
      if (this.stack.length < 2) return;
      this.stack.pop();
      let [lastState, lastTiles] = _.last(this.stack);
      let tiles = lastTiles.map((x) => Object.assign({}, x));
      let tileMap = _.keyBy(tiles, ({ x, y }) => this.key(x, y));
      let state = Object.assign({}, lastState);
      Object.assign(this, { tiles, tileMap, state });
      this.save();
    },
    onKeyDown(evt) {
      let keyCode = { 38: "↑", 40: "↓", 37: "←", 39: "→" };
      let direction = keyCode[evt.keyCode];
      if (!direction) return;
      this.move(direction);
      evt.preventDefault();
    },
  },
  detroyed() {
    document.removeEventListener("keydown", this.onKeyDown);
  },
};
</script>

<style lang="scss" scoped>
</style>