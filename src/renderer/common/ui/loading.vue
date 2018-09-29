<template>
  <transition name="loading-fade">
    <div class="loading-wrapper" v-show="show">
      <div class="loading">
        <div>{{message}}</div>
        <v-progress ref="progress" @on-done="progressDone"></v-progress>
      </div>
    </div>
  </transition>
</template>

<script>
import Progress from '@/components/common/progress';

export default {
  name: 'loading',
  components: {
    VProgress: Progress,
  },
  data() {
    return {
      show: false,
      message: '加载中...',
      onClose: null,
    };
  },
  watch: {
    show(value) {
      if (!value) {
        this.$el.addEventListener('transitionend', this.destroyElement);
      } else {
        this.$nextTick(() => {
          this.$refs.progress.go(100, true);
        });
      }
    },
  },
  methods: {
    destroyElement() {
      this.$el.removeEventListener('transitionend', this.destroyElement);
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },
    progressDone() {
      setTimeout(() => {
        this.show = false;
        if (typeof this.onClose === 'function') {
          this.onClose(this);
        }
      }, 0);
    },
    close() {
      this.$refs.progress.done();
    },
  },
};
</script>

<style lang="less">
.loading-wrapper {
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
  background: #F5F5F5;
}

.loading {
  display: block;
  width: 360px;
  padding: 20px;
  background: #fff;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #ddd;
  font-size: 16px;

  .progress-wrapper {
    margin-top: 10px;
  }
}

.loading-fade-enter-active, .loading-fade-leave-active {
  transition: opacity .2s ease;
}

.loading-fade-enter, .loading-fade-leave-to {
  opacity: 0;
}
</style>
