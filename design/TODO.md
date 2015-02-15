@ HUD: Side panels tied to x+-1, no more than 64 units wide. Top panel, low height, with 2 MFDs and some navigation-related dials. Bottom panel, a bit taller, with scanner and combat-related dials. Exact layout ideally varies between ships but this will do as a default. Top/bottom panels hidden while on GUI screens.

@ Gui-settings and screen-backgrounds. General darkgreen/lightgreen colours, with red/yellow used as highlights. Basic overlays replacing the green lines.

@ Crosshairs: smaller middle zone

@ Planetinfo. Add seed values, random vectors, station roles and basic universal settings so that the core one can be excluded (for quicker startup)

@ Scenarios. In separate OXP. Copy the basic SOTW save for now.

@ Equipment:
 - refit needs to offer repairs
 - galdrive needs a no-consume flag
 - heat shielding added to refit
 - fuel scoop, cargo scoop, in-flight refueller items
   (all conditional on having a cargo hold)
 - escape pod
 - injectors at 2x
 - wormhole scanner just included

Core features:
 - multi-use missiles. There's bits already in it for that, though no counter.
 - scripted combat AI should unconditionally fire if the JS tells it to

Font:
 - adjust font plist
 - economy symbols
 - adjust gui-settings plist for colours
 - test galaxybuilder changes