import Body from "~/models/body";
import Vector from "~/models/vector";
import Setup from "~/models/setup";

export default class EarthMoon implements Setup {
  title = "Earth and Moon";

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
    return result;
  }
}
