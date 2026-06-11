<script setup lang="ts">
import EntryForm from '../../components/EntryForm.vue'
import RecordsTable from '../../components/RecordsTable.vue'
</script>

<template>
  <div class="page">
    <div class="page-header card">
      <h2>事项录入</h2>
      <p>录入摄影事项，支持编辑与批量删除</p>
    </div>
    <EntryForm />
    <RecordsTable title="全部事项" :selectable="true" :max-height="520" />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;

.page-header {
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  p {
    font-size: 13px;
    color: $color-text-secondary;
  }
}
</style>
