<script setup lang="ts">
import CalendarView from '../../components/CalendarView.vue'
import DayDetailPanel from '../../components/DayDetailPanel.vue'
</script>

<template>
  <div class="page">
    <div class="page-header card">
      <h2>月历视图</h2>
      <p>点击日期查看当日事项，点击标签可编辑或删除</p>
    </div>
    <div class="calendar-layout">
      <CalendarView expanded interactive />
      <DayDetailPanel />
    </div>
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

.calendar-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1100px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }
}
</style>
