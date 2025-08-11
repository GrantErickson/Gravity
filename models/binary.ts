import Body from "~/models/body";
import Vector from "~/models/vector";
import { Setup } from "~/models/setup";

export default class Binary extends Setup {
  title = "Binary";

  bodies(): Body[] {
    let result: Body[] = [];
    result.push(
      new Body(
        "Planet 1",
        new Vector(-5e8, 0, 0),
        new Vector(0, -550, 0),
        7.97219e24,
        6.378e6,
        0x1111ff
      ) // Not sure why it needs a negative y velocity to stay more centered.
    );
    result.push(
      new Body(
        "Planet 2",
        new Vector(5e8, 0, 0),
        new Vector(0, 550, 0),
        7.97219e24,
        6.378e6,
        0xff33aa
      ) // Not sure why it needs a negative y velocity to stay more centered.
    );
    result.push(
      new Body(
        "Center",
        new Vector(0, 0, 0),
        new Vector(0, 0, 0),
        7.97219e14,
        6.378e6,
        0x88ff44
      ) // Not sure why it needs a negative y velocity to stay more centered.
    );
    return result;
  }
}
