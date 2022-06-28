# Gravity

Check out the site here: https://nice-sea-04261f01e.1.azurestaticapps.net/gravity

## Purpose

This was an attempt to create a simulation of orbital mechanics in order to demonstrate the 'n body problem'. For those not familiar, if you have two bodies, an equation in terms of time can be created that accurately can predict the position, velocities, and forces on the bodies at any time. However, if you add a body (hench the name the 3 body problem), it becomes impossible in the general case to create a set of equations that can accurately predict future states of the system. This can be mitigated by for example making on the masses much greater than the others, a sun for example. 

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

### Other potential features
1. Change the time step
2. Add/remove bodies
3. Allow for various presets: earth/moon, earth/moon/sun, binary stars, cool stable and unstable examples
4. Allow saving groups of objects for others to view

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

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).


### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).
