export class Tags {
    predator: boolean = false;
    camouflage: boolean = false;
    bioluminescent: boolean = false;
    electric: boolean = false;
    venomous: boolean = false;

    constructor(predator: boolean = false, camouflage: boolean = false, bioluminescent: boolean = false, electric: boolean = false, venomous: boolean = false) {
        this.predator = predator;
        this.camouflage = camouflage;
        this.bioluminescent = bioluminescent;
        this.electric = electric;
        this.venomous = venomous;
    }
}