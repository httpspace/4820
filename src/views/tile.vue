<template>
  <span v-if="data.id" class="wrap">
    <div class="tile" :class="[tileClass,{pulse}]" :style="style">
      <transition appear name="appear">
        <div class="inner">{{data.value}}</div>
      </transition>
      <transition name="combo">
        <div class="combo" v-if="combo">{{data.combo}} combo!</div>
      </transition>
    </div>
  </span>
  <div v-else class="tile grid-tile" :style="style">
    <div class="inner"></div>
  </div>
</template>

<script>
export default {
  name: "tile",
  props: ["data", "game"],
  data() {
    return { pulse: false, combo: false };
  },
  watch: {
    "data.value"() {
      if (this.pulse) this.pulse = false;
      this.$nextTick(() => {
        this.pulse = true;
      });
    },
    "data.combo"(v, o) {
      if (v < 2 || v < o) return;
      if (!this.combo) this.combo = true;
      this.$nextTick(() => {
        this.combo = false;
      });
    },
  },
  computed: {
    tileClass() {
      let { value } = this.data;
      return "tile-" + (value > 16384 ? "higher" : value);
    },
    style() {
      let { x, y } = this.data;
      let {
        size: [width, height],
      } = this.game;
      let ret = {
        transform: `translate3d(${x * 100}%,${y * 100}%,0)`,
        width: 100 / width + "%",
        height: 100 / height + "%",
      };
      return this.data.id
        ? Object.assign(ret, { zIndex: this.data.value })
        : ret;
    },
  },
};
</script>

<style scoped>
.tile,
.wrap {
  transition-duration: 80ms;
}
/*.wrap.v-leave-active {opacity: 0}*/
.tile {
  position: absolute;
  box-sizing: border-box;
  text-align: center;
  font-weight: bold;
  padding: 0.4em;
}
.tile.pulse .inner {
  animation: pulse 200s;
}
.tile.grid-tile .inner {
  background-color: #ccc1b4;
}
.tile .inner.appear-enter-active {
  animation: zoomIn2 160ms;
}
.tile .combo {
  position: absolute;
  width: calc(100% - 0.8em);
  text-align: center;
  top: 0.6em;
  font-size: 1em;
  white-space: nowrap;
  color: white;
  animation-fill-mode: forwards;
}
.tile .combo.combo-leave-active {
  animation: fadeOutUp 1000ms;
}
.tile .inner {
  transition-property: all;
  transition-duration: inherit;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #f9f6f2;
}
.tile.tile-2 .inner {
  color: #776e65;
  background: #eee4da;
  font-size: 5em;
}
.tile.tile-4 .inner {
  color: #776e65;
  background: #ede0c8;
  font-size: 5em;
}
.tile.tile-8 .inner {
  background: #f2b179;
  font-size: 5em;
}
.tile.tile-16 .inner {
  background: #f59563;
  font-size: 4em;
}
.tile.tile-32 .inner {
  background: #f67c5f;
  font-size: 4em;
}
.tile.tile-64 .inner {
  background: #f65e3b;
  font-size: 4em;
}
.tile.tile-128 .inner {
  background: #edcf72;
  font-size: 3em;
}
.tile.tile-256 .inner {
  background: #edcc61;
  font-size: 3em;
}
.tile.tile-512 .inner {
  background: #edc850;
  font-size: 3em;
}
.tile.tile-1024 .inner {
  background: #edc53f;
  font-size: 2.5em;
}
.tile.tile-2048 .inner {
  background: #edc22e;
  font-size: 2.5em;
}
.tile.tile-4096 .inner {
  background: #00bcd4;
  font-size: 2.5em;
}
.tile.tile-8192 .inner {
  background: #03a9f4;
  font-size: 2.5em;
}
.tile.tile-16384 .inner {
  background: #1e88e5;
  font-size: 2em;
}
.tile.tile-higher .inner {
  background: #3f51b5;
  font-size: 2em;
}
@keyframes zoomIn2 {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  75% {
    opacity: 1;
  }
}
</style>