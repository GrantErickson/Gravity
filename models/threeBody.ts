import Body from "~/models/body";
import Vector from "~/models/vector";
import { Setup } from "~/models/setup";

export default class ThreeBody extends Setup {
  title = "Three Body Problem";

  bodies(): Body[] {
    let result: Body[] = [];

    // Three suns positioned in a roughly triangular configuration
    // Based on the Three Body Problem novels - three suns of similar mass creating chaotic system
    const sunMass = 1.989e30; // Solar mass
    const sunRadius = 6.96e8; // Solar radius
    const baseDistance = 1.5e11; // 1 AU for separation

    // Sun 1 - positioned at origin initially
    result.push(
      new Body(
        "Alpha Centauri A",
        new Vector(0, 0, 0),
        new Vector(5000, 8000, 0),
        sunMass,
        sunRadius,
        0xFFDD44 // Yellow sun
      )
    );

    // Sun 2 - positioned to the right
    result.push(
      new Body(
        "Alpha Centauri B", 
        new Vector(baseDistance * 1.2, 0, 0),
        new Vector(-2500, 6000, 0),
        sunMass * 0.9, // Slightly smaller
        sunRadius * 0.9,
        0xFF6644 // Orange sun
      )
    );

    // Sun 3 - positioned to form triangle
    result.push(
      new Body(
        "Proxima Centauri",
        new Vector(baseDistance * 0.6, baseDistance * 0.8, 0),
        new Vector(-3000, -7000, 0),
        sunMass * 0.8, // Smaller red dwarf
        sunRadius * 0.7,
        0xFF4444 // Red sun
      )
    );

    // Three planets at different distances showing chaotic orbital behavior
    // Planet 1 - Trisolaris (the main planet from the novels)
    result.push(
      new Body(
        "Trisolaris",
        new Vector(baseDistance * 2.1, baseDistance * 0.3, 0),
        new Vector(-8000, 12000, 0),
        5.97219e24, // Earth mass
        6.378e6, // Earth radius
        0x4488FF // Blue planet
      )
    );

    // Planet 2 - Inner chaotic planet
    result.push(
      new Body(
        "Chaotic Inner",
        new Vector(baseDistance * 0.9, -baseDistance * 1.1, 0),
        new Vector(15000, 5000, 0),
        3.97219e24, // Smaller than Earth
        5.378e6,
        0x44FF88 // Green planet
      )
    );

    // Planet 3 - Outer planet with more stable but still chaotic orbit
    result.push(
      new Body(
        "Distant World",
        new Vector(-baseDistance * 2.8, baseDistance * 1.2, 0),
        new Vector(4000, -6000, 0),
        7.97219e24, // Larger than Earth
        7.378e6,
        0xFF8844 // Orange planet
      )
    );

    return result;
  }
}