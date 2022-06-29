import Body from "~/models/body";

export default interface Setup {
  title: string;
  bodies(): Body[];
}
