class Computer extends Part {
    on = 1
    mode = 0 //0 = 0%  1 = 100% usage
    memorySize = 4
    time = 0
    tab = "main"
    data = {engineThrust:0, engineThrottle:0, engineThrustString: "0N", shipDirection: 0, inputSpeed:0, targetSpeed:0, speed:0, cooling:0, heating:0, antennaRX:0, antennaTX:0, fuelConsumptionAvg:0, fuelRange:0}

    //network
    listeningPort = []
    receivedData = new Array(65536).fill([])

    //display
    mapScaling = 60 //px per ly  SUPPORTED(3.75, 7.5, 15, 30, 60) //TODO FIX

    run() {
        if(this.on===1) {
            if (playerShip.usePower(this.consumption[0] / gameFPS, this.group)) { //todo:fix power consumption
                for (let i = 0; i < this.modules.length; i++) {
                    if (this.modules[i].on === 1) {
                        if (playerShip.usePower(this.modules[i].consumption / gameFPS, this.group)) {
                            this.modules[i].run()
                        }
                    }
                }
                this.drawUi()
                this.time += 1000 / gameFPS
            }
            //network
            if (this.listeningPort.length>0) {
                for (let i = 0; i<this.listeningPort.length; i++) {
                    if (this.receivedData[this.listeningPort[i]]!==undefined && this.receivedData[this.listeningPort[i]].length>0) {
                        for (let j = 0; j<this.receivedData[this.listeningPort[i]].length; j++) {
                            let data = this.receivedData[this.listeningPort[i]][0]
                            if (data.data.type==="var") {
                                //time
                                if (data.data.var==="time") {
                                    this.time = data.data.time
                                }
                                //....
                            }
                            this.receivedData[this.listeningPort[i]].shift()
                        }
                    }
                }
            }
            this.data.antennaRX = playerShip.antennas[0].rx[0]
            this.data.antennaTX = playerShip.antennas[0].tx[0]
            //-----
        //OFF
        } else {
            if (this.display) {
                this.display.reset()
            }
        }
    }

    functions = {
        receiveTime: ()=> {
            this.comm.transmitData([0.002, 2, 2, {data:"time", senderAddress:playerShip.myAddress}, playerShip.myAddress])
            this.listeningPort.push(2)
        },

    }


    getTimeString(time) {
        time = time/1000
        if (time>31536000) {
            return (time/31536000).toFixed(1)+"y"
        } else if (time>86400) {
            return (time/86400).toFixed(1)+"d"
        } else if (time>3600) {
            return (time/3600).toFixed(1)+"h"
        } else if (time>=60) {
            return (time/60).toFixed(1)+"m"
        } else {
            return time.toFixed(1)+"s"
        }
    }

    drawUi() {
        if (this.display && this.display.on===1) {
            let width = this.display.resolution.w
            let height = this.display.resolution.h

            //main
            let color1 = "#d7d7d7"
            let font1 = "16px Consolas"
            let fontBtn = "24px Consolas"
            let colorBtnText = "#424242"
            //current Tab
            let color2 = "#7e97d7"
            let font2 = "18px Consolas"
            //fps,time
            let color3 = "#d7d7d7"
            let font3 = "12px Consolas"
            //vals
            let color4 = "#7aff82"
            let colorTT = "#80d9ff"
            let color5 = "#b8a8ff"
            let colorSpeed = "#ffb9c5"
            let colorHeat = "#ffa5a0"
            let colorCold = "#a2fffc"
            //ship
            let colorShip = "#3b57da"
            //error
            let colorError = "#da4f57"


            if (this.tab==="main") {
                //------------------------------------------------------------------------Main Tab
                //thrust and throttle
                this.display.drawText(5, 20, "Thrust: ", font1, color1, 'left')
                this.display.drawText(90, 20, this.data.engineThrustString, font1, colorTT, 'left')
                this.display.drawText(5, 40, "Throttle: ", font1, color1, 'left')
                this.display.drawText(90, 40, (this.data.engineThrottle*100).toFixed(1) + "%", font1, colorTT, 'left')
                //Fuel Consumption Tab
                if (this.fuelCons.on===1) {
                    this.display.drawText(5,60,"Fuel Consumption: ",font1,color1,'left')
                    if (this.fuelCons.fuelConsumptionAvg<1000) {
                        this.display.drawText(160,60,this.data.fuelConsumptionAvg.toFixed(1)+"g/h",font1,color4,'left')
                    } else {
                        this.display.drawText(160,60,(this.data.fuelConsumptionAvg/1000).toFixed(1)+"kg/h",font1,color4,'left')
                    }
                    this.display.drawText(5,80,"Range: ",font1,color1,'left')
                    this.display.drawText(160,80,this.data.fuelRange.toFixed(1)+"ly",font1,color4,'left')
                } else {
                    this.display.drawText(5,60,"Off",font1,colorError,'left')
                }
                //Direction Tab
                this.display.drawText(5, 100, "Direction: ", font1, color1, 'left')
                this.display.drawText(100, 100, this.data.shipDirection.toFixed(1)+"°", font1, color5, 'left')
                //Speed Tab
                this.display.drawText(5, 120, "Speed: ", font1, color1, 'left')
                this.display.drawText(130, 120, getSpeedText(this.data.speed), font1, colorSpeed, 'left')
                this.display.drawText(5, 140, "Target Speed: ", font1, color1, 'left')
                this.display.drawText(130, 140, getSpeedText(this.data.targetSpeed), font1, colorSpeed, 'left')
                this.display.drawText(5, 160, "Input Speed: ", font1, color1, 'left')
                this.display.drawText(130, 160, getSpeedText(this.data.inputSpeed), font1, colorSpeed, 'left')

                this.display.drawText(5, 180, "Heating: ", font1, color1, 'left')
                this.display.drawText(80, 180, this.data.heating.toFixed(1)+"% ("+((this.data.heating/100)*playerShip.lifeSupport[1].heatConsumption*1000).toFixed(1)+"kW)", font1, colorHeat, 'left')
                this.display.drawText(5, 200, "Cooling: ", font1, color1, 'left')
                this.display.drawText(80, 200, this.data.cooling.toFixed(1)+"% ("+((this.data.cooling/100)*playerShip.lifeSupport[1].coldConsumption*1000).toFixed(1)+"kW)", font1, colorCold, 'left')

                this.display.drawRect(250,250,50,50,"#77f2ff") //UPDATE TIME
                this.display.drawRect(350,250,50,50,"#77f2ff") //UPDATE POSITION

                this.display.drawText(10, 220, "RX:"+(this.data.antennaRX*1000).toFixed(0)+"kB/s", font1, color1, 'left')
                this.display.drawText(10, 240, "TX:"+(this.data.antennaTX*1000).toFixed(0)+"kB/s", font1, color1, 'left')
                //DEBUG
                this.display.drawText(10, 290, "DEBUG: dir:"+playerShip.position.direction.toFixed(8)+"°", font1, color1, 'left')
                this.display.drawText(10, 310, "DEBUG: t:"+playerShip.position.targetDirection.toFixed(8)+"", font1, color1, 'left')
                this.display.drawText(10, 330, "DEBUG: as:"+playerShip.position.angularSpeed.toFixed(8)+"", font1, color1, 'left')

            } else if (this.tab==="2") {
                //------------------------------------------------------------------------

                this.display.drawRect(100,100,50,50,"#00ff00") //test

            } else if (this.tab==="nav") {
                //------------------------------------------------------------------------Navigation Tab
                if (this.nav.on===1) {
                    //map
                    this.drawMap()
                    //ship
                    this.display.drawCircle(300, 180, 5, colorShip)
                    //x,y,distance
                    this.display.drawText(5, 20, "x: ", font1, color1, 'left')
                    this.display.drawText(25, 20, this.nav.position.x.toFixed(2) + "ly", font1, color4, 'left')
                    this.display.drawText(5, 40, "y: ", font1, color1, 'left')
                    this.display.drawText(25, 40, this.nav.position.y.toFixed(2) + "ly", font1, color4, 'left')
                    this.display.drawText(5, 60, "d: ", font1, color1, 'left')
                    this.display.drawText(25, 60, this.nav.distanceTraveled.toFixed(1) + "ly", font1, color4, 'left')


                } else {
                    this.display.drawText(5,20,"Off",font1,colorError,'left')
                }
            }


            //bottom
            this.display.drawRect(0,height-40,width,height,"#000000") //test
            this.display.drawLine(0,height-40,width,height-40,2,color1)
            this.display.drawText(50,height-15,"Main",font1,color1,'center')
            this.display.drawLine(100,height-40,100,height,2,color1)
            this.display.drawText(125,height-15,"Nav",font1,color1,'center')
            this.display.drawLine(150,height-40,150,height,2,color1)
            this.display.drawText(175,height-15,"Comm",font1,color1,'center')
            this.display.drawLine(200,height-40,200,height,2,color1)
            this.display.drawText(250,height-15,"2",font1,color1,'center')

            this.display.drawLine(300,height-40,300,height,2,color1)
            this.display.drawText(350,height-15,"1",font1,color1,'center')
            this.display.drawLine(400,height-40,400,height,2,color1)
            this.display.drawText(450,height-15,this.tab,font2,color2,'center')
            this.display.drawLine(500,height-40,500,height,2,color1)
            this.display.drawText(550,height-10,"Time:"+this.getTimeString(this.time),font3,color3,'center')
            this.display.drawText(550,height-25,"Fps:"+gameFPS.toFixed(0)+"FPS",font3,color3,'center')

        }
    }

    drawMap() {
        //map
        let colorMap = "#a1a1a1"
        let colorMapText = "#b4b169"
        let font = "12px Consolas"
        let bottom = 40 //px

        let a = []
        let pos = {x: playerShip.computers[0].nav.position.x % 1, y: playerShip.computers[0].nav.position.y % 1}
        let posR = {x: playerShip.computers[0].nav.position.x, y: playerShip.computers[0].nav.position.y}

        let topLeft = {x: posR.x+((this.display.resolution.w/this.mapScaling)/2),
            y: posR.y+(((this.display.resolution.h-bottom)/this.mapScaling)/2)
        } //ly
        let topRight = {x: posR.x-((this.display.resolution.w/this.mapScaling)/2),
            y: posR.y+(((this.display.resolution.h-bottom)/this.mapScaling)/2)
        }  //ly
        let bottomLeft = {x: posR.x+((this.display.resolution.w/this.mapScaling)/2),
            y: posR.y-(((this.display.resolution.h-bottom)/this.mapScaling)/2)
        } //ly
        let bottomRight = {x: posR.x-((this.display.resolution.w/this.mapScaling)/2),
            y: posR.y-(((this.display.resolution.h-bottom)/this.mapScaling)/2)
        }  //ly


        //TODO:FIX
        for(let i = 0; i<((this.display.resolution.w)/this.mapScaling); i++) {
            let x = i*this.mapScaling+(pos.x*this.mapScaling)
            this.display.drawLine(x,0,x,this.display.resolution.h-bottom,1,colorMap)

            let xval =  Math.floor((((posR.x))+(this.display.resolution.w/this.mapScaling)/2)-i)
            this.display.drawText(x,this.display.resolution.h-bottom,xval,font,colorMapText,'center')
        }

        for(let i = 0; i<((this.display.resolution.h-bottom)/this.mapScaling); i++) {
            let y = i*this.mapScaling+(pos.y*this.mapScaling)
            this.display.drawLine(0,y,this.display.resolution.w,y,1,colorMap)

            let yval = Math.floor(((((posR.y))+((this.display.resolution.h-bottom)/this.mapScaling)/2))-i)
            this.display.drawText(599,y,yval,font,colorMapText,'right')
        }


        //----------------------------------------------------TEST
        let scaling = this.mapScaling/60
        let testt = {x:2.5,y:1.5}
        let testx = (posR.x*this.mapScaling)+((this.display.resolution.w)/2)-(testt.x*this.mapScaling)
        let testy = (posR.y*this.mapScaling)+((this.display.resolution.h-bottom)/2)-(testt.y*this.mapScaling)
        if (testx>0 && testx<this.display.resolution.w && testy>0 && testy<this.display.resolution.h-bottom) {
            this.display.drawCircle(testx,testy,10*scaling,colorMap)
        }
        /*this.display.drawText(300,50,testx,font,colorMapText,'center')
        this.display.drawText(300,70,testy,font,colorMapText,'center')*/
        //--------------------------------------------------------

        //x:0 y:0
        /*let x0 = (posR.x*this.mapScaling)+((this.display.resolution.w)/2)
        let y0 = (posR.y*this.mapScaling)+(((this.display.resolution.h-40))/2)*/
        //this.display.drawCircle(x0,y0,5,"#b47ca0")

        return a
    }


   /* this.display.drawRect(10,110,30,30,color1)
    this.display.drawRect(50,110,30,30,color1)*/

    touchScreen(x,y) {
        let buttons = [
            {x1:0, y1:360,x2:100,y2:400,function: () => {this.tab = "main"}},
            {x1:100, y1:360,x2:150,y2:400,function: () => {this.tab = "nav"}},
            {x1:150, y1:360,x2:200,y2:400,function: () => {this.tab = "comm"}},

            {x1:250, y1:250,x2:300,y2:300,function: () => {this.functions.receiveTime()}},
            {x1:350, y1:250,x2:400,y2:300,function: () => {this.nav.start.recalcPosition()}},
        ]
        for (let i = 0; i<buttons.length; i++) {
            let b = buttons[i]
            if (x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2) {
                b.function()
                break
            }
        }
    }



    constructor(id,weight,name,modules,consumption,memorySize) {
        super(weight,name,"computer",id)
        this.consumption = consumption

        this.comm = new CommunicationModule()
        this.fuelCons = new FuelConsumptionModule()
        this.display = new DisplayModule()
        this.nav = new NavigationModule()

        this.modules = [this.comm,this.fuelCons,this.display,this.nav]

        this.memorySize = memorySize
    }
}