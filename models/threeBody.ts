import Body from "~/models/body";
import Vector from "~/models/vector";
import { Setup } from "~/models/setup";

export default class ThreeBody extends Setup {
  title = "Three Body Problem";

  bodies(): Body[] {
    let result: Body[] = [];

    // Three suns positioned in a roughly triangular configuration
    // Based on the Three Body Problem novels - three suns of similar mass creating chaotic system
    // Scaled down by 100x for closer observation
    const sunMass = 1.989e30; // Solar mass (kept same for realistic physics)
    const sunRadius = 6.96e6; // Solar radius scaled down 100x
    const baseDistance = 1.5e9; // 1/100 AU for separation (scaled down 100x)

    // Sun 1 - positioned at origin initially
    result.push(
      new Body(
        "Alpha Centauri A",
        new Vector(0, 0, 0),
        new Vector(500, 800, 0), // Velocities scaled down by 10x
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
        new Vector(-250, 600, 0), // Velocities scaled down by 10x
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
        new Vector(-300, -700, 0), // Velocities scaled down by 10x
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
        new Vector(-800, 1200, 0), // Velocities scaled down by 10x
        5.97219e24, // Earth mass
        6.378e4, // Earth radius scaled down 100x
        0x4488FF // Blue planet
      )
    );

    // Planet 2 - Inner chaotic planet
    result.push(
      new Body(
        "Chaotic Inner",
        new Vector(baseDistance * 0.9, -baseDistance * 1.1, 0),
        new Vector(1500, 500, 0), // Velocities scaled down by 10x
        3.97219e24, // Smaller than Earth
        5.378e4, // Radius scaled down 100x
        0x44FF88 // Green planet
      )
    );

    // Planet 3 - Outer planet with more stable but still chaotic orbit
    result.push(
      new Body(
        "Distant World",
        new Vector(-baseDistance * 2.8, baseDistance * 1.2, 0),
        new Vector(400, -600, 0), // Velocities scaled down by 10x
        7.97219e24, // Larger than Earth
        7.378e4, // Radius scaled down 100x
        0xFF8844 // Orange planet
      )
    );

    return result;
  }
}