class Capacitor extends Part {
    charge = 0 //MWh
    maxCharge = 0 //MWh
    powerGroup = "everything"

    run() {
        this.charge-=(0.00000075*this.maxCharge)*((this.charge/this.maxCharge)+0.5) /gameFPS
    }


    discharge(val) {
        if ((this.charge-val)<0) {
            return false
        } else {
            this.charge-=val
            return true
        }
    }

    recharge(val) {
        if ((this.charge+val)>this.maxCharge) {
            return false
        } else {
            this.charge+=val
            return true
        }
    }

    constructor(id,weight,name,charge,powerGroup) {
        super(weight,name,"capacitor",id)
        this.charge = charge
        this.maxCharge = charge
        this.powerGroup = powerGroup

    }


}