<template>
  <div
    :class="className"
    draggable="true"
    @dragstart="onDragStartHandler"
    @dragenter="onDragEnterHandler"
  >
    <div>
      <h5 class="task__title">{{ task.title }}</h5>
      <p class="task__desc">{{ task.desc }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { Task } from "../types";

export default defineComponent({
  props: {
    task: {
      type: Object as () => Task,
      required: true,
    },
    tableIndex: {
      type: Number,
      required: true,
    },
    taskIndex: {
      type: Number,
      required: true,
    },
    dragging: {
      type: Boolean,
      required: true,
    },
    handleDragEnter: {
      type: Function as unknown as () => (
        event: DragEvent,
        task: { tableIndex: number; taskIndex: number }
      ) => void,
      required: true,
    },
    handleDragStart: {
      type: Function as unknown as () => (
        event: DragEvent,
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
  },
  computed: {
    className(): string {
      return this.dragging
        ? this.taskStyles({
            tableIndex: this.tableIndex,
            taskIndex: this.taskIndex,
          })
        : "task";
    },
  },
  methods: {
    onDragStartHandler(event: DragEvent): void {
      this.handleDragStart(event, {
        tableIndex: this.tableIndex,
        taskIndex: this.taskIndex,
      });
    },
    onDragEnterHandler(event: DragEvent): void {
      if (this.dragging) {
        this.handleDragEnter(event, {
          tableIndex: this.tableIndex,
          taskIndex: this.taskIndex,
        });
      }
    },
  },
});
</script>

<style scoped>
.task {
  width: 100%;
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  cursor: pointer;
  background-color: #e3e2db;
  transition: all 0.3s ease-in-out;
}

.task:last-child {
  margin-bottom: 0;
}

.task__title {
  font-size: 1.3rem;
  color: #282c34;
}

.task__desc {
  margin-top: 1rem;
  font-size: 1rem;
  color: #282c34;
}

.entered {
  background-color: #282c34;
  box-shadow: 0px 0px 16px -2px rgba(0, 0, 0, 0.75);
}

/* .entered .task-title {
  opacity: 0;
}

.entered .task-desc {
  opacity: 0;
} */
</style>
