<template>
  <div class="board-container">
    <div class="container">
      <div class="board-wrapper">
        <div class="board-content">
          <the-table
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
          ></the-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, Ref } from "vue";
import TheTable from "./TheTable.vue";
import { Data, Task } from "../types";

type Props = {
  data: Data[];
}

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
  setup(props: Props) {
    const dataList: Ref<Data[]> = ref<Data[]>(props.data);
    const dragging: Ref<boolean> = ref<boolean>(false);
    let draggedTask: Ref<{
      tableIndex: number;
      taskIndex: number;
      sourceTableIndex: number;
      sourceTaskIndex: number;
      sourceTask: Task;
      dragOffsetX: number;
      dragOffsetY: number;
    } | null> = ref<{
      tableIndex: number;
      taskIndex: number;
      sourceTableIndex: number;
      sourceTaskIndex: number;
      sourceTask: Task;
      dragOffsetX: number;
      dragOffsetY: number;
    } | null>(null);
    let draggedTaskNode: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null);
    let clonedTask: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null);

    const handleDragStart = (
      event: DragEvent,
      task: { tableIndex: number; taskIndex: number }
    ) => {
      const offsetX =
        event.clientX -
        (event.target as HTMLElement).getBoundingClientRect().left;
      const offsetY =
        event.clientY -
        (event.target as HTMLElement).getBoundingClientRect().top;

      draggedTask.value = {
        tableIndex: task.tableIndex,
        taskIndex: task.taskIndex,
        sourceTableIndex: task.tableIndex,
        sourceTaskIndex: task.taskIndex,
        sourceTask: dataList.value[task.tableIndex].tasks[task.taskIndex],
        dragOffsetX: offsetX,
        dragOffsetY: offsetY,
      };

      draggedTaskNode.value = event.target as HTMLDivElement;

      if (draggedTaskNode.value) {
        draggedTaskNode.value.addEventListener("dragend", handleDragEnd);
      }

      dragging.value = true;
    };

    const handleDrag = (event: DragEvent) => {
      if (!draggedTaskNode.value || !clonedTask.value) return;
      clonedTask.value.style.top = `${
        event.clientY - draggedTask.value!.dragOffsetY
      }px`;
      clonedTask.value.style.left = `${
        event.clientX - draggedTask.value!.dragOffsetX
      }px`;
    };

    const handleDragEnter = (
      event: DragEvent,
      task: { tableIndex: number; taskIndex: number }
    ) => {
      const currentTask = draggedTask.value;

      if (event.target !== draggedTaskNode.value) {
        const newList = JSON.parse(JSON.stringify(dataList.value));

        newList[task.tableIndex].tasks.splice(
          task.taskIndex,
          0,
          newList[currentTask!.tableIndex].tasks.splice(
            currentTask!.taskIndex,
            1
          )[0]
        );

        dataList.value = newList;

        draggedTask.value = {
          sourceTableIndex: currentTask!.sourceTableIndex,
          sourceTaskIndex: currentTask!.sourceTaskIndex,
          tableIndex: task.tableIndex,
          taskIndex: task.taskIndex,
          sourceTask: currentTask!.sourceTask,
          dragOffsetX: currentTask!.dragOffsetX,
          dragOffsetY: currentTask!.dragOffsetY,
        };
      }
    };

    const handleDragEnd = () => {
      dragging.value = false;

      if (draggedTask.value) {
        const dropTableIndex = draggedTask.value.tableIndex;
        const dropTaskIndex = draggedTask.value.taskIndex;
        const dropTable = dataList.value[dropTableIndex];
        const sourceTableIndex = draggedTask.value.sourceTableIndex;
        const sourceTaskIndex = draggedTask.value.sourceTaskIndex;
        const sourceTable = dataList.value[sourceTableIndex];
        const sourceTask = draggedTask.value.sourceTask;

        if (
          dropTable.status === "TESTING" &&
          sourceTask.id % 2 !== 0 &&
          sourceTable.status !== "TESTING"
        ) {
          const newList = JSON.parse(JSON.stringify(dataList.value));
          newList[sourceTableIndex].tasks.splice(
            sourceTaskIndex,
            0,
            newList[dropTableIndex].tasks.splice(dropTaskIndex, 1)[0]
          );
          dataList.value = newList;
        }
      }

      if (draggedTaskNode.value) {
        draggedTaskNode.value.removeEventListener("dragend", handleDragEnd);
      }

      draggedTask.value = null;
      draggedTaskNode.value = null;
      clonedTask.value = null;
    };

    const getTaskStyles = (task: { tableIndex: number; taskIndex: number }) => {
      const currentTask = draggedTask.value;
      if (
        currentTask &&
        currentTask.tableIndex === task.tableIndex &&
        currentTask.taskIndex === task.taskIndex
      ) {
        return "entered single-task";
      }
      return "single-task";
    };

    onMounted(() => {
      document.body.addEventListener("drag", handleDrag);
    });

    onUnmounted(() => {
      document.body.removeEventListener("drag", handleDrag);
    });

    return {
      dataList,
      dragging,
      handleDragStart,
      handleDragEnter,
      getTaskStyles,
    };
  },
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
