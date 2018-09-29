<template>
  <div class="sash" :style="style" @mousedown="dragStart"></div>
</template>

<script>
export default {
  name: 'sash',
  props: {
    value: {
      type: Number,
    },
    startValue: {
      type: Number,
      default: 0,
    },
    minValue: {
      type: Number,
      default: 160,
    },
    maxValue: {
      type: Number,
      default: 300,
    },
  },
  computed: {
    style() {
      return {
        left: `${this.startValue + this.value}px`,
      };
    },
  },
  mounted() {
    this.$parent.$el.addEventListener('mousemove', this.dragMove);
    this.$parent.$el.addEventListener('mouseup', this.dragEnd);
    this.$parent.$el.addEventListener('mouseleave', this.dragEnd);
  },
  methods: {
    dragStart() {
      this.dragging = true;
      this.$parent.$el.classList.add('dragging');
    },
    dragMove(ev) {
      if (this.dragging) {
        let value = ev.pageX - this.startValue;
        if (value < this.minValue) {
          value = this.minValue;
        }
        if (value > this.maxValue) {
          value = this.maxValue;
        }

        if (value !== this.value) {
          this.$emit('on-change', value);
        }
      }
    },
    dragEnd() {
      this.dragging = false;
      this.$parent.$el.classList.remove('dragging');
    },
  },
};
</script>

<style>
.sash {
  position: absolute;
  top: 0;
  height: 100%;
  width: 5px;
  margin-left: -3px;
  z-index: 90;
  cursor: ew-resize;
  touch-action: none;
}
</style>
