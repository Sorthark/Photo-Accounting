<script setup lang="ts">
import CalendarView from '../../components/CalendarView.vue'
import EntryForm from '../../components/EntryForm.vue'
import RecordsTable from '../../components/RecordsTable.vue'
</script>

<template>
  <div class="page">
    <CalendarView />
    <EntryForm />
    <RecordsTable :limit="5" />
  </div>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
}
</style>
