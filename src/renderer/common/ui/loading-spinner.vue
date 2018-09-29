<template>
  <transition name="loading-fade">
    <div class="loading-spinner-wrapper" v-show="show">
      <div class="loading-spinner">
        <svg class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none"/>
        </svg>
        <div v-if="message">{{message}}</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'loading-spinner',
  data() {
    return {
      show: false,
      message: '',
      onClose: null,
    };
  },
  watch: {
    show(value) {
      if (!value) {
        this.$el.addEventListener('transitionend', this.destroyElement);
      }
    },
  },
  methods: {
    destroyElement() {
      this.$el.removeEventListener('transitionend', this.destroyElement);
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },
    close() {
      this.show = false;
      if (typeof this.onClose === 'function') {
        this.onClose(this);
      }
    },
  },
};
</script>

<style lang="less">
@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}

.loading-spinner-wrapper {
  position: fixed;
  top: 38px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: rgba(255, 255, 255, .8);
}

.loading-spinner {
  display: block;
  width: 100%;
  text-align: center;

  .circular {
    height: 42px;
    width: 42px;
    animation: loading-rotate 2s linear infinite;
  }

  .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90,150;
    stroke-dashoffset: 0;
    stroke-width: 2;
    stroke: #6eb4f7;
    stroke-linecap: round;
  }

  div {
    color: #6eb4f7;
    margin: 3px 0;
    font-size: 14px;
  }
}
</style>
