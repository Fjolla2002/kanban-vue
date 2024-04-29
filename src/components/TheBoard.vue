<template>
  <div class="board-container">
    <div class="container">
      <div class="board-wrapper">
        <div class="board-content">
          <the-table
            v-for="(table, index) in datas"
            :key="table.id"
            :status="table.status"
            :tasks="table.tasks"
            :tableIndex="index"
            :dragging="isDragging"
            :handleDragStart="handleDragStart"
            :draggedTask="draggedTask"
            :handleDragEnter="handleDragEnter"
            :taskStyles="getTaskStyles"
            :tableStyles="table.styles"
          ></the-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheTable from "./TheTable.vue";
import { Data, Task } from "@/types";

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
      datas: this.loadDataFromLocalStorage(),
      isDragging: false,
      draggedTask: {} as {
        currentTableIndex: number;
        currentTaskIndex: number;
        sourceTableIndex: number;
        sourceTaskIndex: number;
        sourceTask: Task;
        dragOffsetX: number;
        dragOffsetY: number;
      },
      draggedTaskNode: null as HTMLDivElement | null,
      clonedTask: null as HTMLDivElement | null,
    };
  },
  methods: {
    loadDataFromLocalStorage() {
      const lsData = localStorage.getItem("data");
      return lsData ? JSON.parse(lsData) : this.data;
    },
    saveDataToLocalStorage() {
      localStorage.setItem("data", JSON.stringify(this.datas));
    },
    handleDragStart(
      event: DragEvent,
      draggingTask: { tableIndex: number; taskIndex: number }
    ) {
      const offsetX =
        event.clientX -
        (event.target as HTMLElement).getBoundingClientRect().left;
      const offsetY =
        event.clientY -
        (event.target as HTMLElement).getBoundingClientRect().top;

      this.draggedTask = {
        currentTableIndex: draggingTask.tableIndex,
        currentTaskIndex: draggingTask.taskIndex,
        sourceTableIndex: draggingTask.tableIndex,
        sourceTaskIndex: draggingTask.taskIndex,
        sourceTask: this.datas[draggingTask.tableIndex].tasks[draggingTask.taskIndex],
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

      this.isDragging = true;
    },
    handleDrag(event: DragEvent) {
      if (!this.draggedTaskNode || !this.clonedTask || !this.draggedTask)
        return;
      this.clonedTask.style.top = `${
        event.clientY - this.draggedTask.dragOffsetY
      }px`;
      this.clonedTask.style.left = `${
        event.clientX - this.draggedTask.dragOffsetX
      }px`;
    },
    handleDragEnter(
      event: DragEvent,
      enteredTask: { tableIndex: number; taskIndex: number }
    ) {
      const currentDraggingTask = this.draggedTask;

      if (event.target !== this.draggedTaskNode) {
        const newDatas = JSON.parse(JSON.stringify(this.datas));

        newDatas[enteredTask.tableIndex].tasks.splice(
          enteredTask.taskIndex,
          0,
          newDatas[currentDraggingTask!.currentTableIndex].tasks.splice(
            currentDraggingTask!.currentTaskIndex,
            1
          )[0]
        );

        this.datas = newDatas;

        if (currentDraggingTask) {
          this.draggedTask = {
            sourceTableIndex: currentDraggingTask.sourceTableIndex,
            sourceTaskIndex: currentDraggingTask.sourceTaskIndex,
            currentTableIndex: enteredTask.tableIndex,
            currentTaskIndex: enteredTask.taskIndex,
            sourceTask: currentDraggingTask.sourceTask,
            dragOffsetX: currentDraggingTask.dragOffsetX,
            dragOffsetY: currentDraggingTask.dragOffsetY,
          };
        }
      }
    },
    handleDragEnd() {
      this.isDragging = false;

      if (this.draggedTask) {
        const dropTableIndex = this.draggedTask.currentTableIndex;
        const dropTaskIndex = this.draggedTask.currentTaskIndex;
        const dropTable = this.datas[dropTableIndex];
        const sourceTableIndex = this.draggedTask.sourceTableIndex;
        const sourceTaskIndex = this.draggedTask.sourceTaskIndex;
        const sourceTable = this.datas[sourceTableIndex];
        const sourceTask = this.draggedTask.sourceTask;

        if (
          dropTable.status === "TESTING" &&
          sourceTask.id % 2 !== 0 &&
          sourceTable.status !== "TESTING"
        ) {
          const newDatas = JSON.parse(JSON.stringify(this.datas));
          newDatas[sourceTableIndex].tasks.splice(
            sourceTaskIndex,
            0,
            newDatas[dropTableIndex].tasks.splice(dropTaskIndex, 1)[0]
          );
          this.datas = newDatas;
        }
      }
      this.saveDataToLocalStorage();

      if (this.draggedTaskNode) {
        this.draggedTaskNode.removeEventListener("dragend", this.handleDragEnd);
      }
      if (this.clonedTask) {
        document.body.removeChild(this.clonedTask);
      }

      (this.draggedTask = {
        currentTableIndex: 0,
        currentTaskIndex: 0,
        sourceTableIndex: 0,
        sourceTaskIndex: 0,
        sourceTask: {} as Task,
        dragOffsetX: 0,
        dragOffsetY: 0,
      }),
        (this.draggedTaskNode = null);
      this.clonedTask = null;
    },
    getTaskStyles(task: { tableIndex: number; taskIndex: number }) {
      const currentTask = this.draggedTask;
      if (
        currentTask &&
        currentTask.currentTableIndex === task.tableIndex &&
        currentTask.currentTaskIndex === task.taskIndex
      ) {
        return "entered single-task";
      }
      return "single-task";
    },
  },
  mounted() {
    // document.body.addEventListener("drag", this.handleDrag);
    this.saveDataToLocalStorage()
  },
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
