import Body from "~/models/body";
import Vector from "~/models/vector";
import Setup from "~/models/setup";

export default class EarthMoonAndOthers implements Setup {
  title = "Earth, Moon and Others";

  bodies(): Body[] {
    let result: Body[] = [];
    result.push(
      new Body(
        "Earth",
        new Vector(0.0, 0.0),
        new Vector(0.0, 0),
        5.97219e24,
        6.378e6,
        0x1111ff
      ) // Not sure why it needs a negative y velocity to stay more centered.
    );
    result.push(
      new Body(
        "Moon",
        new Vector(384399861, 0),
        new Vector(0, 1028.192),
        7.34767309e22,
        1737000,
        0x444444
      )
    );
    result.push(
      new Body(
        "Moon 2",
        new Vector(434399861, 0),
        new Vector(0, -1128.192),
        7.34767309e22,
        1737000,
        0xaa2222
      )
    );
    result.push(
      new Body(
        "Moon 3",
        new Vector(-334399861, 0),
        new Vector(0, -978.181),
        3.34767309e21,
        737000,
        0x33bb66
      )
    );
    return result;
  }
}
