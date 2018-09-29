import TWEEN from '@tweenjs/tween.js';

export default {
  methods: {
    animation(name, oldValue, newValue, callback = () => true) {
      const acreage = document.body.offsetWidth * document.body.offsetHeight;
      // 如果分辨率太大则做降级处理
      if (acreage < 3 * 1024 * 1024) {
        let animationFrame;

        const animate = (time) => {
          TWEEN.update(time);
          animationFrame = requestAnimationFrame(animate);
        };

        const animateValue = { value: oldValue };
        new TWEEN.Tween(animateValue)
          .easing(TWEEN.Easing.Quadratic.Out)
          .to({ value: newValue }, 300)
          .onUpdate(() => {
            this[name] = animateValue.value;
          })
          .onComplete(() => {
            callback();
            cancelAnimationFrame(animationFrame);
          })
          .start();

        animationFrame = requestAnimationFrame(animate);
      } else {
        this[name] = newValue;
        callback();
      }
    },
  },
};
