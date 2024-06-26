<template>
  <div
    class="table"
    :style="{
      border: isDraggingOver
        ? '5px solid #49505e'
        : `3px solid ${tableStyles.background}`,
    }"
    @dragenter="
      dragging && !tasks.length
        ? handleDragEnter($event, { tableIndex, taskIndex: 0 })
        : undefined
    "
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div
      class="table__title"
      :style="{ backgroundColor: `${tableStyles.background}` }"
    >
      <h2>{{ status }} - ({{ tasks.length }})</h2>
    </div>
    <div class="table__content">
      <the-task
        v-for="(task, taskIndex) in tasks.slice(0, getDisplayedTasksCount())"
        :key="taskIndex"
        :task="task"
        :tableIndex="tableIndex"
        :taskIndex="taskIndex"
        :dragging="dragging"
        :handleDragEnter="handleDragEnter"
        :handleDragStart="handleDragStart"
        :taskStyles="taskStyles"
      ></the-task>
      <button
        v-if="getDisplayedTasksCount() < tasks.length"
        @click="handleLoadMore"
        type="button"
        class="load__more"
      >
        Load More
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { Status, Task, Styles } from "../types";
import TheTask from "../components/TheTask.vue";

export default defineComponent({
  name: "TheTableComponent",
  components: {
    TheTask,
  },
  props: {
    tasks: {
      type: Array as () => Task[],
      required: true,
    },
    status: {
      type: String as () => Status,
      required: true,
    },
    tableStyles: {
      type: Object as () => Styles,
      required: true,
    },
    dragging: {
      type: Boolean,
      required: true,
    },
    tableIndex: {
      type: Number,
      required: true,
    },
    handleDragStart: {
      type: Function as unknown as () => (
        e: DragEvent,
        task: { tableIndex: number; taskIndex: number }
      ) => void,
      required: true,
    },
    handleDragEnter: {
      type: Function as unknown as () => (
        e: DragEvent,
        task: { tableIndex: number; taskIndex: number }
      ) => void,
      required: true,
    },
    taskStyles: {
      type: Function as unknown as () => (task: {
        tableIndex: number;
        taskIndex: number;
      }) => string,
      required: true,
    },
    draggedTask: {
      type: Object as () => {
        currentTableIndex: number;
        currentTaskIndex: number;
        sourceTableIndex: number;
        sourceTaskIndex: number;
        sourceTask: Task;
        dragOffsetX: number;
        dragOffsetY: number;
      },
      required: true,
      default: () => ({}),
    },
  },
  data() {
    return {
      displayedTasks: {} as Record<number, number>,
      isDraggingOver: false,
    };
  },
  methods: {
    handleLoadMore() {
      this.displayedTasks = {
        ...this.displayedTasks,
        [this.tableIndex]: (this.displayedTasks[this.tableIndex] || 4) + 2,
      };
    },
    getDisplayedTasksCount(): number {
      return this.displayedTasks[this.tableIndex] || 4;
    },
    isLoadMoreVisible(): boolean {
      const tableContent = document.querySelector(
        `.table:nth-child(${this.tableIndex + 1}) .table__content`
      ) as HTMLDivElement;
      if (tableContent) {
        const loadMoreButton = tableContent.querySelector(
          ".load__more"
        ) as HTMLButtonElement;
        
        return loadMoreButton !== null;
      }
      return false;
    },
    handleDragOver(e: DragEvent): void {
      e.preventDefault();
      this.isDraggingOver = true;

      const targetElement = e.target as HTMLDivElement;
      if (
        targetElement &&
        targetElement.classList.contains("table__content") &&
        this.isDraggingOver &&
        this.dragging
      ) {
        const rect = targetElement.getBoundingClientRect();
        const isAtEnd = e.clientY >= rect.height / 2;

        if (
          isAtEnd &&
          this.draggedTask &&
          this.tasks.length > 0 &&
          !this.isLoadMoreVisible()
        ) {
          this.handleDragEnter(e, {
            tableIndex: this.tableIndex,
            taskIndex: this.tasks.length - 1,
          });
        }
      }
    },

    handleDragLeave(e: DragEvent): void {
      const relatedTarget = e.relatedTarget as HTMLDivElement;
      const tableElement = e.currentTarget as HTMLDivElement;

      if (!tableElement.contains(relatedTarget)) {
        this.isDraggingOver = false;
      }
    },
    handleDrop(): void {
      this.isDraggingOver = false;
    },
  },
});
</script>

<style scoped>
.table {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
  height: fit-content;
  border: 2px solid;
}

.table__title {
  padding: 1rem;
  text-align: center;
  color: #ccc;
}

.table__content {
  padding: 1rem;
  background-color: #a4a5a9;
  overflow-y: scroll;
  max-height: 40rem;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 40rem;
}

.table__content .load__more {
  border: 1px solid transparent;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.load__more:hover {
  border: 1px solid #49505e;
  transform: scale(0.98);
}
</style>
