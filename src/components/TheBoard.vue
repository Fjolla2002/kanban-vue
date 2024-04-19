<template>
  <div class="board-container">
    <div class="container">
      <div class="board-wrapper">
        <div class="board-content">
          <TheTable
            v-for="(table, tableIndex) in dataList"
            :key="table.id"
            :status="table.status"
            :tasks="table.tasks"
            :tableIndex="tableIndex"
            :dragging="dragging"
            :handleDragStart="handleDragStart"
            :handleDragEnter="handleDragEnter"
            :taskStyles="getTaskStyles"
            :tableStyles="table.styles"
          ></TheTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheTable from "./TheTable.vue";
import { Data, Task } from "../types";

export default defineComponent({
  name: "TheBoard",
  components: {
    TheTable,
  },
  props: {
    data: {
      type: Array as () => Data[],
      required: true,
    },
  },
  data() {
    return {
      dataList: this.data,
      dragging: false,
      draggedTask: null as {
        tableIndex: number;
        taskIndex: number;
        sourceTableIndex: number;
        sourceTaskIndex: number;
        sourceTask: Task;
        dragOffsetX: number;
        dragOffsetY: number;
      } | null,
      draggedTaskNode: null as HTMLDivElement | null,
      clonedTask: null as HTMLDivElement | null,
    };
  },
  methods: {
    handleDragStart(
      event: DragEvent,
      task: { tableIndex: number; taskIndex: number }
    ) {
      const offsetX =
        event.clientX -
        (event.target as HTMLElement).getBoundingClientRect().left;
      const offsetY =
        event.clientY -
        (event.target as HTMLElement).getBoundingClientRect().top;

      this.draggedTask = {
        tableIndex: task.tableIndex,
        taskIndex: task.taskIndex,
        sourceTableIndex: task.tableIndex,
        sourceTaskIndex: task.taskIndex,
        sourceTask: this.dataList[task.tableIndex].tasks[task.taskIndex],
        dragOffsetX: offsetX,
        dragOffsetY: offsetY,
      };

      this.draggedTaskNode = event.target as HTMLDivElement;

      if (this.draggedTaskNode) {
        this.draggedTaskNode.addEventListener("dragend", this.handleDragEnd);
      }

      // const clonedTaskDiv = this.draggedTaskNode.cloneNode(
      //   true
      // ) as HTMLDivElement;
      // const rect = this.draggedTaskNode.getBoundingClientRect();
      // clonedTaskDiv.style.position = "absolute";
      // clonedTaskDiv.style.zIndex = "9999";
      // clonedTaskDiv.style.width = rect.width + "px";
      // clonedTaskDiv.style.height = rect.height + "px";
      // clonedTaskDiv.style.pointerEvents = "none";
      // clonedTaskDiv.style.top = `${
      //   event.clientY - this.draggedTask.dragOffsetY
      // }px`;
      // clonedTaskDiv.style.left = `${
      //   event.clientX - this.draggedTask.dragOffsetX
      // }px`;
      // document.body.appendChild(clonedTaskDiv);
      // this.clonedTask = clonedTaskDiv;

      this.dragging = true;
    },
    handleDrag(event: DragEvent) {
      if (!this.draggedTaskNode || !this.clonedTask || !this.draggedTask) return;
      this.clonedTask.style.top = `${
        event.clientY - this.draggedTask.dragOffsetY
      }px`;
      this.clonedTask.style.left = `${
        event.clientX - this.draggedTask.dragOffsetX
      }px`;
    },
    handleDragEnter(
      event: DragEvent,
      task: { tableIndex: number; taskIndex: number }
    ) {
      const currentTask = this.draggedTask;

      if (event.target !== this.draggedTaskNode) {
        const newList = JSON.parse(JSON.stringify(this.dataList));

        newList[task.tableIndex].tasks.splice(
          task.taskIndex,
          0,
          newList[currentTask!.tableIndex].tasks.splice(
            currentTask!.taskIndex,
            1
          )[0]
        );

        this.dataList = newList;

        if (currentTask) {
          this.draggedTask = {
            sourceTableIndex: currentTask.sourceTableIndex,
            sourceTaskIndex: currentTask.sourceTaskIndex,
            tableIndex: task.tableIndex,
            taskIndex: task.taskIndex,
            sourceTask: currentTask.sourceTask,
            dragOffsetX: currentTask.dragOffsetX,
            dragOffsetY: currentTask.dragOffsetY,
          };
        }
      }
    },
    handleDragEnd() {
      this.dragging = false;

      if (this.draggedTask) {
        const dropTableIndex = this.draggedTask.tableIndex;
        const dropTaskIndex = this.draggedTask.taskIndex;
        const dropTable = this.dataList[dropTableIndex];
        const sourceTableIndex = this.draggedTask.sourceTableIndex;
        const sourceTaskIndex = this.draggedTask.sourceTaskIndex;
        const sourceTable = this.dataList[sourceTableIndex];
        const sourceTask = this.draggedTask.sourceTask;

        if (
          dropTable.status === "TESTING" &&
          sourceTask.id % 2 !== 0 &&
          sourceTable.status !== "TESTING"
        ) {
          const newList = JSON.parse(JSON.stringify(this.dataList));
          newList[sourceTableIndex].tasks.splice(
            sourceTaskIndex,
            0,
            newList[dropTableIndex].tasks.splice(dropTaskIndex, 1)[0]
          );
          this.dataList = newList;
        }
      }

      if (this.draggedTaskNode) {
        this.draggedTaskNode.removeEventListener("dragend", this.handleDragEnd);
      }
      // if (this.clonedTask) {
      //   document.body.removeChild(this.clonedTask);
      // }

      this.draggedTask = null;
      this.draggedTaskNode = null;
      this.clonedTask = null;
    },
    getTaskStyles(task: { tableIndex: number; taskIndex: number }) {
      const currentTask = this.draggedTask;
      if (
        currentTask &&
        currentTask.tableIndex === task.tableIndex &&
        currentTask.taskIndex === task.taskIndex
      ) {
        return "entered single-task";
      }
      return "single-task";
    },
  },
  // mounted() {
  //   document.body.addEventListener("drag", this.handleDrag);
  // },
  // beforeUnmount() {
  //   document.body.removeEventListener("drag", this.handleDrag);
  // },
});
</script>

<style scoped>
.board-container {
  background-color: #282c34;
}

.board-wrapper {
  padding: 5rem 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.board-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 2rem;
}
</style>