import {AbilityTimingEnum} from "./Enums/AbilityTimingEnum";

type myFunctionType =(message : string) => void

export class Ability {

    all : boolean;
    type: AbilityTimingEnum;
    func: myFunctionType

    constructor(all : boolean, type: AbilityTimingEnum, func: myFunctionType) {
        this.all = all;
        this.type = type;
        this.func = func;
    }
}