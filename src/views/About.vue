<template>
    <div class="about">
        <!--<h1>This is an about page</h1>-->
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
