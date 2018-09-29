<template>
  <transition name="dialog-fade">
    <div class="dialog-wrapper" v-show="show">
      <div class="dialog">
        <div class="panel">
          <div class="panel-header" v-if="title">{{title}}</div>
          <div class="panel-content">
            <slot>{{content}}</slot>
          </div>
          <div class="panel-footer">
            <button type="button" class="btn btn-primary" @click="_ok" v-if="ok">{{ok}}</button>
            <button type="button" class="btn btn-default cancel" @click="_cancel" v-if="cancel">{{cancel}}</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'u-dialog',
  data() {
    return {
      show: false,
      title: '',
      content: '',
      ok: '确定',
      onOk: () => {},
      cancel: '取消',
      onCancel: () => {},
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
    _ok() {
      this.show = false;
      if (typeof this.onOk === 'function') {
        this.onOk(this);
      }
    },
    _cancel() {
      this.show = false;
      if (typeof this.onCancel === 'function') {
        this.onCancel(this);
      }
    },
  },
};
</script>
