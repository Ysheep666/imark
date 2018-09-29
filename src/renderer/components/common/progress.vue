<template>
  <div class="progress-wrapper">
    <div ref="range" class="range" :class="{'going': width > 0}" :style="{'width': width + '%'}" v-if="show"></div>
  </div>
</template>

<script>
export default {
  name: 'iProgress',
  methods: {
    // 需要走到的进度
    go(change, reset = false) {
      if (reset) {
        this.show = true;
        this.range = 0;
        this.width = 0;
      }
      const width = this.width + this.range;
      if (change > width) {
        this.status = 0;
        this.oldWidth = width;
        this.range = change - width;
        this.set(0);
      }
    },
    // 完成进度加载
    done() {
      clearTimeout(this.incTimeout);
      this.$refs.range.addEventListener('transitionend', () => this.$emit('on-done'));
      this.width = 100;
    },
    // 执行改变
    set(position) {
      this.width = this.oldWidth + (position * this.range);
      this.status = position;
      clearTimeout(this.incTimeout);
      this.incTimeout = setTimeout(() => this.inc(), 200);
    },
    // 每次改变的变化值
    inc() {
      if (this.status < 1) {
        let change = 0;
        if (this.status >= 0 && this.status < 0.3) {
          change = ((Math.random() * 4) + 5) / 100;
        } else if (this.status >= 0.3 && this.status < 0.6) {
          change = (Math.random() * 3) / 100;
        } else if (this.status >= 0.6 && this.status < 0.9) {
          change = (Math.random() * 2) / 100;
        } else if (this.status >= 0.9 && this.status < 0.99) {
          change = 0.005;
        } else {
          change = 0;
        }
        if (change) {
          this.set(this.status + change);
        }
      }
    },
  },
  data() {
    return {
      show: false,
      width: 0,
      oldWidth: 0,
      status: 0,
      range: 0,
    };
  },
};
</script>

<style>
.progress-wrapper {
  position: relative;
  height: 8px;
  background: #ddd;
  border-radius: 100px;
  overflow: hidden;
  vertical-align: middle;
}

.progress-wrapper .range {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #0071FA;
  transform-origin: left center;
  border-radius: 100px;
}

.progress-wrapper .range.going {
  transition: width .3s ease;
}
</style>
