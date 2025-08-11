import Body from "~/models/body";

export abstract class Setup {
  abstract title: string;
  abstract bodies(): Body[];
}
