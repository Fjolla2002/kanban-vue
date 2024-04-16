export type Status = "TO DO" | "IN PROGRESS" | "DONE" | "TESTING";

export type Styles = {
  background: string;
};

export type Task = {
  id: number;
  title: string;
  desc: string;
};

export type Data = {
  id: number;
  status: Status;
  tasks: Task[];
  styles: Styles;
};
