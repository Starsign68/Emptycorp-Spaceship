function draw(progress) {





    //------------------------------------------------DEBUG---------------------------------------
    document.getElementById("debug1").innerText = "Battery: "+ (playerShip.batteries[0].charge*1000).toFixed(5) + " / " +  (playerShip.batteries[0].maxCharge*1000) +"kWh"
    let debug2text = ""
    for (let i = 0; i< playerShip.capacitors.length; i++) {
        debug2text += "capacitor["+playerShip.capacitors[i].powerGroup+"]:"+ (playerShip.capacitors[i].charge*1000).toFixed(2) +" / "+ (playerShip.capacitors[i].maxCharge*1000) +"<br/>"
    }
    document.getElementById("debug2").innerHTML = debug2text

    let debug4text = ""
    for (let i = 0; i< playerShip.tanks.length; i++) {
        debug4text += "tank["+i+"]: ("+ playerShip.tanks[i].type +") "+ playerShip.tanks[i].capacity +" / "+ playerShip.tanks[i].maxCapacity +"<br/>"
    }
    document.getElementById("debug4").innerHTML = debug4text
    document.getElementById("debug5").innerText = "-"+ (playerShip.powerOutput*1000).toFixed(2) +"kW / +"+  (playerShip.powerInput*1000).toFixed(2) +"kW"

    document.getElementById("debug8").innerText = playerShip.weight.toFixed(2) +" kg"
    document.getElementById("debug9").innerText = playerShip.speed +"c ("+(playerShip.speed/8765.812756).toFixed(2)+"ly/h)"+" / "+playerShip.targetSpeed+"c"+ "("+(playerShip.targetSpeed/8765.812756).toFixed(2)+"ly/h)"
    document.getElementById("debug10").innerText = (playerShip.speed*299792458).toFixed(4)+"m/s"

    document.getElementById("debug11").innerText = (playerShip.thrust).toFixed(2)+" MN"
}
