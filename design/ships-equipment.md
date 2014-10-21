# Ship classes

## Fighters (named after melee weapons)

### Space Superiority (named after swords)

#### Firangi
(Mamba)

#### Kaskari
(Sidewinder)

#### Espadon
(Viper)

### Assault/Bomber (named after axes)

#### Labrys
(Gecko)

#### Tabarzin
(Asp)

### Interceptors (named after spears)

#### Menaulion
(Fer-de-lance)

#### Atgeir
(Staer9 Mussurana)

## Transports (named after rivers)

### Lena
(Transporter, scaled up)

### Kolyma
(Staer9 Ghavial)

### Araguaia Staryacht
(Staer9 Ophidian)

## Freighters (named after breeds of draught animal)

### Tarpan
(Adder, scaled up a lot)

### Tabapua
(Python, scaled up)

### Charolais
(Boa, scaled up)

E### Garvonesa
(Staer9 Monitor, scaled up)

### Alentejana
(Staer9 Monitor II, scaled up)

## Multi-role (named after carnivores)

### Piratical (named after canines)
Heavy fighters with cargo capacity

#### Jackal
(Krait)

#### Coyote
(Staer9 Iguana, scaled up, single gun)

#### Corsac
(Staer9 Cat II, single gun)

### Freelancer (named after bears)
Transports with decent self-defence

#### Atlas
(Cobra I, scaled up)

#### Kodiak
(Cobra III)

#### Helarctos
(Staer9 Salamander)

## Light Warships (named after concepts)

### Endurance-class Corvette
(Boa II)

### Valor-class Frigate
(Anaconda, scaled up)

## Exploration (named after bright stars)

### Shaula
(Moray)

### Toliman
(Staer9 Chameleon)

## Shuttles/Miners (named after insects)

### Lacewing
(Shuttle)

### Grasshopper
(Worm)

# Equipment

Band 1..x

Mass baseline: 2000 for Kodiak

## Drives

1. ES:18, T:24, EN:0.02
2. ES:80, T:120, EN:0.05
3. ES:350, T:600, EN:0.2
4. ES:1600, T:3000, EN:0.75

    LM = total T / ship mass

## Thrusters

1. ES:15, R:40, EN:0.02
2. ES:60, R:200, EN:0.05
3. ES:250, R:1000, EN:0.2
4. ES:1200, R:5000, EN:0.75 (prototype)

    pitch = total R / ship mass
    roll = pitch*2
    yaw = pitch*2/3

## Shields

1. ES: 20, S: 25, EN: 0.1
2. ES: 85, S: 100, EN: 0.4
3. ES: 350, S: 500, EN: 1.5
4. ES: 1600, S: 2500, EN: 7.5

    Shield strength = 640 * total S / ship mass

## Generators

1. ES: 40, G: 0.4
2. ES: 135, G: 1.5
3. ES: 500, G: 6.0
4. ES: 1250, G: 17.5

## Capacitors

1. ES: 30, C: 16
2. ES: 100, C: 64
3. ES: 375, C: 256
4. ES: 1400, C: 1024

## Lasers

* Mining     : ES 20
* Light pulse: ES 60
* Heavy pulse: ES 200
* Light beam : ES 150
* Heavy beam : ES 500
* Spinal beam: ES 2000

## Other large equipment

* ECM System: ES: 200
* Fuel/Cargo Scoop: ES: 200
* Injectors: ES: 350
* Witchdrive: ES: 400

## Sample loads

Kodiak: mass 2000
Drive max ES: 450
ES setups:
2500 / High cargo
3500 / Medium cargo
4500 / Low cargo

Kodiak: mass 2000, standard fittings
* Witchdrive
* 2x Light beam
* 5x band 2 drive (0.3 LM)
* 5x band 2 thruster (0.5 P)
* 4x band 2 shield (128)
* 4x band 2 generator (4.0)
* 4x band 2 capacitor (256)

ES use: 400 + 300 + 400 + 300 + 340 + 540 + 400 => 2680
EN surplus: 6.0 - 0.25 - 0.25 - 1.6 => 3.9

Kodiak: mass 2000, combat fittings (risky - drive/thruster redundancy is poor)
* Witchdrive
* Injectors
* ECM
* Heavy Beam
* 1x band 3 drive, 5x band 1 drive (0.36 LM)
* 1x band 3 thruster, 2x band 1 thruster (0.54 P)
* 2x band 3 shield (320)
* 2x band 3 generator (12.0)
* 1x band 3 capacitor, 2x band 2 capacitor (384)

ES use: 400 + 350 + 200 + 500 + 450 + 280 + 700 + 1000 + 575 => 4455
EN surplus: 12.0 - 0.3 - 0.3 - 3.0 => 8.4

