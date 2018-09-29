<template>
  <imark-app>
    <transition name="page-fade">
      <router-view></router-view>
    </transition>
  </imark-app>
</template>

<script>
export default {
  name: 'app',
};
</script>
