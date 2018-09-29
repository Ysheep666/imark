<template>
  <div class="window-controls">
    <button tabindex="-1" class="close" @click="close"></button>
    <button tabindex="-1" class="minimize" @click="minimize"></button>
    <button tabindex="-1" class="fullscreen" @click="fullscreen"></button>
  </div>
</template>

<script>
export default {
  name: 'window-controls',
  methods: {
    close() {
      __application.commands.dispatch('imark-app', 'application:hide');
    },
    minimize() {
      __application.commands.dispatch('imark-app', 'application:minimize');
    },
    fullscreen() {
      __application.commands.dispatch('imark-app', 'application:fullscreen');
    },
  },
};
</script>

<style lang="less">
.window-controls {
  position: absolute;
  top: 50%;
  left: 7px;
  z-index: 9000;
  order: -1000;
  min-width: 72px;
  width: 72px;
  transform: translateY(-50%);

  button {
    -webkit-app-region: no-drag;
    display: inline-block;
    padding: 0;
    width: 12px;
    height: 12px;
    margin: 4px;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-size: 12px 48px;
    border: 0;

    &:active {
      background-position: 0 -24px;
    }
  }

  .close {
    background-image: url("~@/assets/images/application-frame/close.png");
  }

  .minimize {
    background-image: url("~@/assets/images/application-frame/minimize.png");
  }

  .fullscreen {
    background-image: url("~@/assets/images/application-frame/fullscreen.png");
  }

  &:hover button {
    background-position: 0 -12px;
  }
}
</style>
