<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@src/lib/supabaseClient'

const countries = ref([])

async function getCountries() {
    let { data: productos, error } = await supabase
    .from('productos')
    .select('*')
          
  countries.value = productos
  console.log("HOLAAAA")
}

onMounted(() => {
  getCountries()
})
</script>

<template>
  <ul>
    <li v-for="country in countries" :key="country.id">{{ country.nombre }}</li>
  </ul>
</template>