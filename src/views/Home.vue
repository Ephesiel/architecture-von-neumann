<template>
    <div class="home">
        <!--<img alt="Vue logo" src="../assets/logo.png" />-->
        <Architecture />
        <!--<Debug />-->
    </div>
</template>

<script>
// @ is an alias to /src
import Architecture from '@/components/Architecture.vue'
//import Debug from '@/components/Debug.vue'

export default {
    name: 'Home',
    components: {
        Architecture,
    },
}
</script>
