# Song of the Labyrinth

Song of the Labyrinth is a set of experimental Oolite OXPs.

## Altmap

A collection of various bits of experimental code used to test the new
1.82 features while they were being developed, including:

* scenario definition and core exclusion features
* alternative economic system and trade goods
* planetinfo rewriting and additional feature usage
* GUI settings
* equipment 'provides' keys and other equipment-based ship customisation
* data_source HUD dials
* during its development... the new OXP verifier features

Additionally there's a few "just for fun" features (not all of which
actually make for particularly fun gameplay)

* large cargo ships too big to dock having cargo loaded and unloaded
  by shuttles, before going off on multi-system trade routes
* NPC torus drive (and bigger system scales to make use of it), as
  well as some prototype AIs to use it.
* uninhabited systems
* unique detailed procedural descriptions for all 2048 systems based
  on a generated history

## Exploration

This is an OXP which tries to use the Oolite engine to make a game
based on exploration rather than on combat and trading. The player
starts off in the centre of the map and explores the surrounding
systems visually and with a range of sensor tools.

Implemented so far:

* Basic multi-planet system maps (much more to do here)
* Hyperspace is its own thing rather than a cut-scene tunnel
* More realistic (though still somewhat adjusted) system scale
* Basic planetary detection and parallax searches
* Gravitational sensors to measure planetary mass, and detect planets
  beyond visual range

## Scenario

This OXP contains the loaders for the other OXPs.