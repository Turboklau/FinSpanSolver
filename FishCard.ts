import {DiveEnum} from "./Enums/DiveEnum";
import {Ability} from "./Ability";

export class FishCard {
    id: number;
    name : string;
    cardCost: number;
    eggCost: number;
    youngCost: number;
    consuming: boolean;
    schoolFishCost: number;
    dive : DiveEnum;
    points : number;
    length : number;
    ability: Ability | null;
    abilityString : string;
    abilityType : string;
    sunlight: number = 0; //2 for estuary
    twilight: number = 0;
    midnight: number = 0; //2 for deep
    group : string;
    //TODO tags

    constructor(id: number,
                name : string,
                points : number,
                length : number,
                abilityType: string,
                ability: string,
                band: string,
                group: string,
                sunlight: number = 0,
                twilight: number = 0,
                midnight: number = 0,
                cardCost: number = 0,
                eggCost: number = 0,
                youngCost: number = 0,
                consuming: boolean = false,
                schoolFishCost: number = 0,
                latin: string = "",
                Bioluminescent: boolean | null = null,
                Camouflage: boolean | null = null,
                Electric: boolean | null = null,
                Predator: boolean | null = null,
                Venomous: boolean | null = null,
                description: string | null = null) {
        this.id = id;
        this.name = name;
        this.sunlight = sunlight;
        this.twilight = twilight;
        this.midnight = midnight;
        this.points  = points;
        this.length = length;
        this.cardCost = cardCost;
        this.eggCost = eggCost;
        this.youngCost = youngCost;
        this.consuming = consuming;
        this.schoolFishCost = schoolFishCost;
        this.group = group;

        this.abilityString = ability;
        this.ability = null;
        this.abilityType = abilityType;

        this.dive = DiveEnum.None;
        if (band == "green") {
            this.dive = DiveEnum.Green;
        } else if (band == "blue") {
            this.dive = DiveEnum.Blue;
        } else if (band == "purple") {
            this.dive = DiveEnum.Purple;
        }
    }
}
