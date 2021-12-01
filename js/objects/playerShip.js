class Ship {
    //---------------------------------------------
    baseWeight = 5500 //kg
    armor = 500
    armorMax = 500

    //---------------------------------------------
    speed = 0 //c
    weight = this.baseWeight

    atmosphere = {oxygen:21, nitrogen:78.96, carbonDioxide:0.04, volume:16/* m3 */, pressure:1/* bar */, temperature:293}

    //---------------------------------------------
    targetSpeed = 0 //c
    speedMode = "FTL"

    powerInput = 0
    powerOutput = 0
    
    //---------------------------------------------
    //TODO: water/food?
    //TODO: cooling?


    antennas = []
    batteries = []
    capacitors = []
    computers = []
    generators = []
    engines = []
    shields = []
    tanks = []
    weapons = []

//------------------------------------------------------------------------------------------------------------------
    everyFrame(fps) {
        let outputNeeded = this.powerOutput
        this.resetVars()

        this.chargeCapacitors(fps)

        //Generators
        let percent = 0
        let battery = this.checkBatteries()
        let charging = 0
        if ((battery[0]/battery[1])<0.98) {
            charging = 1
        }
        for(let i = 0; i<this.generators.length; i++) {
            percent = outputNeeded/this.generators[i].output
           if(this.generators[i].on===1 && (this.generators[i].output-outputNeeded)<0) {
               outputNeeded = outputNeeded-this.generators[i].output
           }
           if (charging===1) {
               percent = 1
           }
            this.generators[i].run(percent,fps)
        }
        //Update Weight
        this.updateWeight()
        //propulsion
        if (this.targetSpeed>0) {
            for(let i = 0; i<this.engines.length; i++) {
                if (this.engines[i].on===1 && this.engines[i].type===this.speedMode) {
                    let thrust = this.engines[i].run(0,fps,this.targetSpeed,this.speed)
                    this.speed += (((thrust*1000000)/this.weight)/299792458)/fps     //  MN-->N  kg  M/S->C
                }
            }

        }
    }
//------------------------------------------------------------------------------------------------------------------
    resetVars() {
        this.powerInput = 0
        this.powerOutput = 0
    }
    updateWeight() {
        this.weight = this.baseWeight
        //parts
        this.weight += this.getWeight("antennas")
        this.weight += this.getWeight("batteries")
        this.weight += this.getWeight("capacitors")
        this.weight += this.getWeight("computers")
        this.weight += this.getWeight("generators")
        this.weight += this.getWeight("engines")
        this.weight += this.getWeight("shields")
        this.weight += this.getWeight("tanks")
        this.weight += this.getWeight("weapons")
        //tanks
        for(let i = 0; i<this.tanks.length; i++) {
            let tank = this.tanks[i]

            if (tank.tankType==="gas") {
                this.weight+=(tank.pressure*tank.volume*tank.gasDensity)*(tank.capacity/tank.maxCapacity)
            } else if (tank.tankType==="fuel") {
                this.weight+=tank.fuelWeight*(tank.capacity/tank.maxCapacity)
            }
        }
    }
    getWeight(part) {
        let weight = 0
        for(let i = 0; i<this[part].length; i++) {
            weight+=this[part][i].weight
        }
        return weight
    }
//------------------------------------------------------------------------------------------------------------------
    checkTank(type) {
        let val = 0
        for (let i = 0; i<this.tanks.length; i++) {
            if (this.tanks[i].type === type) {
                val += this.tanks[i].capacity
            }
        }
        return val
    }

    useTank(type,val) {
        for (let i = 0; i<this.tanks.length; i++) {
            if (this.tanks[i].type === type) {
                if (this.tanks[i].capacity>val) {
                    this.tanks[i].capacity-=val
                    return true
                }
            }
        }
        return false
    }

    generatePower(val) { //MW
        this.powerInput += val*gameFPS
        for (let i = 0; i<this.batteries.length; i++) {
            this.batteries[i].charge+=val/60/60
            val=0
            if (this.batteries[i].charge>this.batteries[i].maxCharge) {
                val = this.batteries[i].charge - this.batteries[i].maxCharge
                this.batteries[i].charge = this.batteries[i].maxCharge
            }
        }
    }


    chargeCapacitors(fps) {
        let chargeNeeded = 0
        let chargeAvailable = 0
        let chargeArray = []

        for (let i = 0; i<this.capacitors.length; i++) {
            chargeArray[i] = 0
            if (this.capacitors[i].charge<this.capacitors[i].maxCharge) {
                chargeNeeded += this.capacitors[i].maxCharge-this.capacitors[i].charge
                chargeArray[i] = this.capacitors[i].maxCharge-this.capacitors[i].charge
            }
        }
        for (let i = 0; i<this.batteries.length; i++) {
            if (this.batteries[i].charge>chargeNeeded) {
                if ( this.batteries[i].maxDischargeSec > chargeNeeded) {
                    chargeAvailable += chargeNeeded/fps
                    this.batteries[i].charge -= chargeNeeded/fps
                } else {
                    chargeAvailable += this.batteries[i].maxDischargeSec/fps
                    this.batteries[i].charge -= this.batteries[i].maxDischargeSec/fps
                }
            } else if (this.batteries[i].charge>0) {
                let a = this.batteries[i].maxDischargeSec/fps
                if (this.batteries[i].charge < a) {
                    a = this.batteries[i].charge
                }
                chargeAvailable += a
                this.batteries[i].charge -= a

            }
        }
        for (let i = 0; i<this.capacitors.length; i++) {
            if (this.capacitors[i].charge<this.capacitors[i].maxCharge) {
                if (chargeArray[i]<=chargeAvailable) {
                    this.capacitors[i].charge += chargeArray[i]
                    chargeAvailable -= chargeArray[i]
                } else {
                    this.capacitors[i].charge += chargeAvailable
                    chargeAvailable = 0
                }

            }
        }
    }

    usePower(val) {
        this.powerOutput += val*gameFPS
        for (let i = 0; i<this.capacitors.length; i++) {
            if (this.capacitors[i].charge>=val / 3600) {
                    this.capacitors[i].charge -= val / 3600
                return true
            } else {
                val = val-this.capacitors[i].charge
                this.capacitors[i].charge -= val / 3600
                if (this.capacitors[i].charge<0) {
                    this.capacitors[i].charge=0
                }
            }
        }
        if (val!==0) {
            return false
        } else {
            return true
        }
    }

    checkBatteries() {
        let val = 0
        let valMax = 0
        for (let i = 0; i<this.batteries.length; i++) {
            valMax += this.batteries[i].maxCharge
            val += this.batteries[i].charge
        }
        return [val,valMax]
    }


    constructor(parts) {
        //this.antennas.push
        for (let i = 0 ; i < parts.batteries.length ; i++) {
            let part = parts.batteries[i]
            this.batteries.push(new Battery(part.weight || 0,part.name || "name", part.capacity, part.maxDischarge))
        }
        for (let i = 0 ; i < parts.capacitors.length ; i++) {
            let part = parts.capacitors[i]
            this.capacitors.push(new Capacitor(part.weight || 0,part.name || "name", part.capacity))
        }
        for (let i = 0 ; i < parts.generators.length ; i++) {
            let part = parts.generators[i]
            this.generators.push(new Generator(part.weight || 0,part.name || "name", part.type, part.output, part.defaultOn))
        }
        for (let i = 0 ; i < parts.tanks.length ; i++) {
            let part = parts.tanks[i]
            this.tanks.push(new Tank(part.weight || 0,part.name || "name", part.tankType, part.type, part.fuelWeight || 0, part.volume || 0, part.pressure || 0))
        }
        for (let i = 0 ; i < parts.engines.length ; i++) {
            let part = parts.engines[i]
            this.engines.push(new Engine(part.weight || 0,part.name || "name", part.fuelType, part.type, part.minSpeed, part.maxSpeed, part.thrust,
                part.consumptionFuel, part.consumptionPower))
        }
        //this.shields.push
        //this.weapons.push
    }
}


let shipDefaultParts = {
    antennas: [{weight:3, minSpeed:0.064, maxSpeed:100 /* mbit */, consumptionPower:[0.05, 1, 42]/* kW */, consumptionFuel:[0.001, 0.32, 10]/* g/hour*/,}], //0 = listening, 1-min speed, 2-max speed
    batteries: [{weight:500, capacity: 1, /* MWh */maxDischarge:1 /* MWh */,name:"Battery 1MWh",},], //1
    computers: [{}], //TODO: Navigation, engineControl, Communication, LifeSupport ?
    capacitors: [{weight:50, capacity: 0.05, /* MWh */name:"Capacitor 180MWs"},  //0.05
                {weight:10, capacity: 0.012, /* MWh */name:"Capacitor 54MWs"},], //0.012
    generators: [{weight:500, type:"H2FuelCell", output: 0.0027 /* MW */,defaultOn:1},
        {weight:1000, type:"UraniumReactor", output: 0.15 /* MW */,defaultOn:0},], //
    engines: [{weight:1500, fuelType:"fuel1", type:"FTL", minSpeed:1.4 /* c */, thrust: 17987520000,/* MN */ maxSpeed:12*8765.812756 /* c */, consumptionFuel:[0,40,150] /* kg/h */ , consumptionPower:[0.008,0.13] /* MW*/},
        {weigth:500, fuelType:"fuel1", type:"Sublight", maxSpeed:215000000/299792458 /* c */ , thrust: 1 /* MN */, consumptionFuel:[0,1,3] /* kg/h */ , consumptionPower:[0.0004,0.1] /* MW*/  }],
    shields: [{capacity:1000, rechargeRate:3.8 /* per sec */, consumption:[0.1,1.5] /*MWh 0-maintaining 1-charging*/}],
    tanks: [{weight:110,tankType:"gas",type:"N2",volume:200 /* Litres */,pressure:150 /* bar */},
        {weight:110,tankType:"gas",type:"O2",volume:100 /* Litres */,pressure:150 /* bar */},
        {weight:100,tankType:"gas",type:"H2",volume:80 ,pressure:680 },
        {weight:120,tankType:"gas",type:"O2",volume:160 ,pressure:170 },
        {weight:300,tankType:"fuel",type:"fuel1",fuelWeight:500 /* kg */ },
        {weight:300,tankType:"fuel",type:"fuel1",fuelWeight:500 /* kg */ },
        {weight:300,tankType:"fuel",type:"fuel1",fuelWeight:500 /* kg */ },
        {weight:300,tankType:"fuel",type:"fuel1",fuelWeight:500 /* kg */ },
        {weight:100,tankType:"fuel",type:"uranium",fuelWeight:10 /* kg */ },
    ],
    weapons: [{type:"laser", power:20/* MW */, length:0.1 /*seconds*/}]
}



let playerShip = new Ship(shipDefaultParts)

