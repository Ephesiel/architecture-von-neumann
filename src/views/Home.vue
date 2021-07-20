<template>
    <div class="home">
        <!--<img alt="Vue logo" src="../assets/logo.png" />-->
        <Debug />
    </div>
</template>

<script>
// @ is an alias to /src
import Debug from '@/components/Debug.vue'

export default {
    name: 'Home',
    components: {
        Debug,
    },
}
</script>
