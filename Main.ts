import {FishCard} from "./FishCard";
import {Cost} from "./Cost";
import {Zone} from "./Zone";
import {Ability} from "./Ability";

function main() {
    var myCost = new Cost(2, 0, 0);
    var myZone = new Zone(true, false, false);
    var myAbility = new Ability();

    var myFishCard = new FishCard("Saddleback Butterflyfish", myCost, myZone, 0, 5, 30, myAbility, 1)
    console.log(myFishCard)
}

main()