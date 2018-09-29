<template>
  <transition name="dialog-fade">
    <div class="dialog-wrapper" @click.self="clickMark" v-if="show">
      <div class="dialog">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'v-dialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    closeOnClickMark: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  watch: {
    visible(value) {
      this.show = value;
    },
    show(value) {
      if (this.value !== value) {
        this.$emit('update:visible', value);
      }
    },
  },
  methods: {
    clickMark() {
      if (this.closeOnClickMark) {
        this.show = false;
      }
    },
  },
};
</script>
