<template>
  <transition name="message-fade">
    <div class="message-wrapper" v-show="show">
      <div class="message">
        <slot>{{message}}</slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'message',
  data() {
    return {
      show: false,
      duration: 3000,
      onClose: null,
      message: '',
    };
  },
  watch: {
    show(value) {
      if (!value) {
        this.$el.addEventListener('transitionend', this.destroyElement);
      }
    },
  },
  mounted() {
    this.startTimer();
  },
  methods: {
    destroyElement() {
      this.$el.removeEventListener('transitionend', this.destroyElement);
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },
    close() {
      clearTimeout(this.timer);
      this.show = false;
      if (typeof this.onClose === 'function') {
        this.onClose(this);
      }
    },
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (this.show) {
            this.close();
          }
        }, this.duration);
      }
    },
  },
};
</script>

<style lang="less">
.message-wrapper {
  position: fixed;
  z-index: 1010;
  width: 100%;
  top: 50px;
  left: 0;
  padding: 8px;
  font-size: 13px;
  text-align: center;
  pointer-events: none;
}


.message {
  display: inline-block;
  padding: 8px 16px;
  color: #fff;
  background: #0866dc;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
  pointer-events: auto;

  a {
    text-decoration: underline;
  }
}


.message-fade-enter-active, .message-fade-leave-active {
  transition: opacity .25s ease;

  .message {
    transition: transform .3s ease;
  }
}

.message-fade-enter, .message-fade-leave-to {
  opacity: 0;

  .message {
    transform: translateY(-30px);
  }
}
</style>
