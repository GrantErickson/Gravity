# Gravity

Check out the site here: [https://nice-sea-04261f01e.1.azurestaticapps.net](https://nice-sea-04261f01e.1.azurestaticapps.net)

## Purpose

This was an attempt to create a simulation of orbital mechanics in order to demonstrate the '3-body problem' or in my case the 'n-body problem'. For those not familiar, if you have two bodies (planets, moons, stars, satelites, etc.), an equation in terms of time can be determined that accurately can predict the position, velocities, and forces on the bodies at any time. However, if you add a body (hench the name the 3-body problem), it becomes impossible in the general case to create a set of equations that can accurately predict future states of the system. This can be mitigated by for example making one the masses much greater than the others, a sun for example. This is why we can predict the solar system with good accuracy.

Check out a TED talk about it here: https://www.youtube.com/watch?v=D89ngRr4uZg

It was a fun Sunday project for a couple of hours. Since then I have added a few additional features that I thought would be fun.

The fascinating thing to me is how unstable orbital mechanics can be. It only take a slight variation to throw the whole system off. The simulation comes with four bodies, the Earth, the Moon and two other 'moons.'

## Features

1. Initial setup of four bodies
2. Force arrows (scaling still isn't quite right)
3. Option for trails
4. Option to center on one of the objects
5. Ability to change values and see changes reflected in the diagram
6. Ability to reset the simulation
7. Allow for various presets: earth/moon, earth/moon/sun, binary stars, cool stable and unstable examples
8. Separated the animation loop from the simulation loop to get much higher accuracy
9. Added basic collisions (check out Chaos for an example)
10. Option to change the time step

### Other potential features

1. Add/remove bodies
2. Allow saving groups of objects for others to view
3. Better model for collisions where new bodies could be formed.

### Discoveries

1. The Newtonian physics behind orbital mechanics is relatively simple. Throw in a little Pythagoras for the vector math and we end up with something that JavaScript can easily handle:

$$ \vec f=m \cdot \vec a $$

$$ \vec v= \vec a \cdot t $$

$$ f = G \cdot m_1 \cdot m_1 \over r^2 $$

$$ a^2+b^2=c^2 $$

2. Most of the orbits with more than two bodies are unstable at some point in the not too distant future. I am amazed at how unstable things are in other than the most basic of cases. It makes me wonder how our solar system got to such a finely tuned state with minimal debris floating around and lack of a high number of extinction events (large junk hitting our planet). The tendency over time for highly elliptical, non-circular orbits is high.
3. The simulation time step is very important and determines how accurate the simulation is. Orbital Mechanics are so fragile that this single variable will cause wildly different outcomes.
4. Collisions are highly dependent on the time step because the calculations for collisions are only done at the end of each frame with the current positions rather than either a cylindrical hit box or a slide of a toroid. I added a percentage error indicator in the upper left so that I could see how much the body is moving with respect to it's diameter each time. That number is fraction of movement in the last frame compared to the body's diameter. (Last Movement Distance/ Body Diameter) The number is the highest value of any body in any frame in the last second, the worst error in the last second.
5. The collision logic is simple. Collisions are currently are non-elastic and cause the combination of the mass of the less massive body into the more massive one. The momentum vector of the smaller body is consumed into the larger one. It would be cool to create a model where things broke apart a bit more and potentially created new bodies.
6. Separating the animation loop (and logic) from the simulation loop was key in getting a higher frame rate for the simulation. This allowed for much higher accuracy. I also decided to calculate many simulation frames during each simulation loop on the simulation timer. When it comes to optimization it is always best to build something simple first and then optimize it.
7. It would be neat to have a variable rate simulation that would slow down when the bodies sped up. The simulation gets the least accurate when it is important to be the most accurate. When a moon whips around a planet it has the highest velocity meaning that both the accuracy of the orbit the hit detection are at a maximum error state. It is important to be accurate during this time and dynamically slowing down the simulation could help.

## Tooling

Recently, I have been using NUXT for my little side experiments. Why NUXT? it gives an easy way to get started quickly. When it comes to doing small bits of code to solve problems that are intriguing to me, I want to get started fast and have a lot of tools at my disposal. Here are my criteria

1. Fast to get started
2. A language and ecosystem that I know a bit and don't have to struggle too much with syntax and tooling
3. Lots of community support and good Google-ability
4. Has a broad set of features
5. Has a broad set of extensions and community support for what I need to do
6. Allows for easy public deployment

NUXT provides many of these features. I was able to get started fast. The out of the box TypeScript support doesn't quite work right with GitHub Actions and Azure Static Web Site deployments, but it is close. Vue and Vuetify have decent documentation; it is easy to find info. I was able to use HTML/JS/CSS tools like [three.js](https://threejs.org/). While the Azure connection and automatic GitHub deployment didn't work out of the box, it wasn't hard to add the TS reference to the packages.json file to get it working. Also the Volar tooling for VSCode when using Vue is nice.

In the past I have defaulted to using something like C#, however with the introduction of Core the support for visualizations on the desktop side has been weak at best. Plus the external tooling for things like 3d isn't good. I guess Unity could have worked, but the learning curve seemed steeper. Maybe I'm wrong about that. Blazor maybe, but my friends that use it say that it has warts of its own.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how NUXT works, check out the [documentation](https://nuxtjs.org).
