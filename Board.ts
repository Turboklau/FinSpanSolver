import {FishSlot} from "./FishSlot";
import {DiveEnum} from "./Enums/DiveEnum";
import {FishCard} from "./FishCard";
import {ZoneEnum} from "./Enums/ZoneEnum";

export class Board {

    board_fish_slots : FishSlot[][];
    blue_bonus_claimed: boolean = false;
    green_bonus_claimed : boolean = false;
    purple_bonus_claimed: boolean = false;

    constructor() {

        let forage_fish_1 = new FishCard(1001, "Glasshead Grenadier", 0, 9, "", "", "blue", "forage")
        let forage_fish_2 = new FishCard(1002, "Showy Bristlemouth", 0, 3, "", "", "purple", "forage");
        let forage_fish_3 = new FishCard(1003, "Catalina Goby", 0, 1, "", "", "green", "forage");

        this.board_fish_slots = [
            [
                new FishSlot(1, ZoneEnum.Sunlight, DiveEnum.Blue),
                new FishSlot(2, ZoneEnum.Sunlight, DiveEnum.Blue),
                new FishSlot(3, ZoneEnum.Sunlight, DiveEnum.Blue),
                new FishSlot(4, ZoneEnum.Twilight, DiveEnum.Blue),
                new FishSlot(5, ZoneEnum.Midnight, DiveEnum.Blue, forage_fish_1, true),
                new FishSlot(6, ZoneEnum.Midnight, DiveEnum.Blue)
            ],
            [
                new FishSlot(7, ZoneEnum.Sunlight, DiveEnum.Purple),
                new FishSlot(8, ZoneEnum.Sunlight, DiveEnum.Purple),
                new FishSlot(9, ZoneEnum.Sunlight, DiveEnum.Purple),
                new FishSlot(10, ZoneEnum.Twilight, DiveEnum.Purple, forage_fish_2, false, 1),
                new FishSlot(11, ZoneEnum.Midnight, DiveEnum.Purple),
                new FishSlot(12, ZoneEnum.Midnight, DiveEnum.Purple)
            ], [
                new FishSlot(13, ZoneEnum.Sunlight, DiveEnum.Green),
                new FishSlot(14, ZoneEnum.Sunlight, DiveEnum.Green, forage_fish_3, true),
                new FishSlot(15, ZoneEnum.Sunlight, DiveEnum.Green),
                new FishSlot(16, ZoneEnum.Twilight, DiveEnum.Green),
                new FishSlot(17, ZoneEnum.Midnight, DiveEnum.Green),
                new FishSlot(18, ZoneEnum.Midnight, DiveEnum.Green)
            ]];
    }
}