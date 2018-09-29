<template>
  <span>
    <input ref="trigger" class="popover-trigger" @blur="show = false"/>
    <transition name="popover-fade">
      <div ref="popper" class="popover-wrapper" @click="show = true" v-show="showPopover">
        <div class="popover" :class="[popperClass]">
          <div class="popover-content">
            <slot></slot>
          </div>
          <div x-arrow class="popper__arrow"></div>
        </div>
      </div>
    </transition>
  </span>
</template>

<script>
import Popper from 'popper.js';

export default {
  name: 'popover',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    reference: {
      type: String,
      required: true,
    },
    placement: {
      type: String,
      default: 'bottom',
    },
    popperClass: {
      type: String,
    },
    popperOptions: {
      type: Object,
      default() {
        return {
          gpuAcceleration: false,
          modifiers: {
            preventOverflow: {
              padding: 10,
              boundariesElement: 'viewport',
            },
          },
        };
      },
    },
  },
  data() {
    return {
      show: false,
      showPopover: false,
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

      if (value) {
        window.clearTimeout(this.timeout);
        this.showPopover = true;
        this.$refs.trigger.focus();
      } else {
        this.timeout = window.setTimeout(() => {
          this.showPopover = false;
        }, 160);
      }
    },
    showPopover(value) {
      if (value) {
        this.popper.update();
      }
    },
  },
  mounted() {
    this.$refs.reference = this.$parent.$refs[this.reference];
    this.createPopper();
  },
  methods: {
    createPopper() {
      const { reference, popper } = this.$refs;
      const options = this.popperOptions;
      options.placement = this.placement;
      this.popper = new Popper(reference, popper, options);
      this.popper.update();
    },
  },
};
</script>

<style lang="less">
.popover-wrapper {
  position: absolute;
  z-index: 1000;

  .popper__arrow {
    position: absolute;
    width: 22.5px;
    height: 22.5px;

    &:before, &:after {
      position: absolute;
      top: 12.5px;
      display: block;
      content: '';
      height: 20px;
      width: 45px;
      zoom: 0.5;
    }

    &:before {
      mask-image: url("~@/assets/images/tooltip/tooltip-bg-pointer@2x.png");
      background-color: #f6f6f6;
    }

    &:after {
      mask-image: url("~@/assets/images//tooltip/tooltip-bg-pointer-shadow@2x.png");
      background-color: rgba(35, 31, 32, 0.22);
    }
  }

  &[x-placement^='top'] {
    padding-bottom: 12px;
  }

  &[x-placement^='top'] .popper__arrow {
    bottom: -15.5px;
    transform: rotate(0);
  }

  &[x-placement^='bottom'] {
    padding-top: 12px;
  }

  &[x-placement^='bottom'] .popper__arrow {
    top: -15.5px;
    transform: rotate(180deg);
  }

  &[x-placement^='right'] {
    padding-left: 12px;
  }

  &[x-placement^='right'] .popper__arrow {
    left: -15.5px;
    transform: rotate(90deg);
  }

  &[x-placement^='left'] {
    padding-right: 12px;
  }

  &[x-placement^='left'] .popper__arrow {
    right: -15.5px;
    transform: rotate(-90deg);
  }
}

.popover-trigger {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.popover {
  position: relative;
}

.popover-content {
  padding: 10px;
  background-color: #f6f6f6;
  border-radius: 3px;
  box-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.15), 0 -0.5px 0 rgba(0, 0, 0, 0.15), 0.5px 0 0 rgba(0, 0, 0, 0.15), -0.5px 0 0 rgba(0, 0, 0, 0.15), 0 4px 7px rgba(0, 0, 0, 0.15);
}

.popover-fade-enter-active, .popover-fade-leave-active {
  transition: opacity .3s cubic-bezier(.56,.25,.25,1.56);

  .popover {
    transition: transform .3s cubic-bezier(.56,.25,.25,1.56);
  }
}

.popover-fade-enter, .popover-fade-leave-to {
  opacity: 0;

  .popover {
    transform: scale(0.8);
  }
}
</style>
