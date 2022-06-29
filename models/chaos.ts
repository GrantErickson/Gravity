import Body from "~/models/body";
import Vector from "~/models/vector";
import Setup from "~/models/setup";

export default class Chaos implements Setup {
  title = "Chaos";

  bodies(): Body[] {
    let result: Body[] = [];
    result.push(
      new Body(
        "Planet",
        new Vector(0.0, 0.0),
        new Vector(0.0, 0),
        5.97219e24,
        6.378e6,
        0x443322
      ) // Not sure why it needs a negative y velocity to stay more centered.
    );
    result.push(
      new Body(
        "Moon 1",
        new Vector(384399861, 3000000),
        new Vector(0, 1028.192),
        4.34767309e22,
        4237000,
        0x444444
      )
    );
    result.push(
      new Body(
        "Moon 2",
        new Vector(434399861, 0),
        new Vector(0, -1028.192),
        4.34767309e22,
        4237000,
        0xaa2222
      )
    );
    result.push(
      new Body(
        "Moon 3",
        new Vector(-434399861, 0),
        new Vector(0, -978.181),
        3.34767309e22,
        4237000,
        0x33bb66
      )
    );
    result.push(
      new Body(
        "Moon 4",
        new Vector(34399861, -334399861),
        new Vector(-1000, -300.181),
        3.34767309e22,
        4237000,
        0x66bbaa
      )
    );
    return result;
  }
}
