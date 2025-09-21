import {DiveEnum} from "./Enums/DiveEnum";
import {FishCard} from "./FishCard";
import {ZoneEnum} from "./Enums/ZoneEnum";

export class FishSlot {

    id: number;
    zone: ZoneEnum;
    dive: DiveEnum;
    fish: FishCard | null = null;
    egg: boolean = false;
    young: number = 0;
    school: boolean = false;
    consumedFish: number = 0;

    constructor(id: number, zone: ZoneEnum, dive: DiveEnum, fish: FishCard | null = null, egg: boolean = false, young: number = 0) {
        this.id = id;
        this.zone = zone;
        this.dive = dive;
        this.fish = fish;
        this.egg = egg;
        this.young = young;
    }
}