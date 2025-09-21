import {Player} from "./Player";
import {Board} from "./Board";
import {FishCard} from "./FishCard";
import fish_cards from "./json/cards_alter.json";
import starter_cards from "./json/starter_cards_alter.json";
import {FishSlot} from "./FishSlot";
import {DiveEnum} from "./Enums/DiveEnum";
import {ZoneEnum} from "./Enums/ZoneEnum";
import * as readline from "readline";

const NUMBER_PLAYERS = 2;
let players: Player[] = [];
let active_player : number = 1;
let deck : FishCard[] = [];
let starter_deck : FishCard[] = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function draw(player_number: number, starter : boolean  = false) {
    if (starter) {
        let temp_fish_card = starter_deck.pop()
        if (temp_fish_card instanceof FishCard) {
            players[player_number].hand.push(temp_fish_card);
        }
    } else {
        let temp_fish_card = deck.pop()
        if (temp_fish_card instanceof FishCard) {
            players[player_number].hand.push(temp_fish_card);
        }
    }
}

function draw_from_discard(player_number: number, easy : boolean = true) {

    //draw if no cards in discard
    if (players[player_number].discard.length == 0) {
        draw(player_number)
    } else {
        /*
        easy way - choose a random fish from discard
        medium way (later) - choose a fish that is playable on the current board
        hard way (way later) - do logic tree
         */
        if (easy) {
            const indexOfDiscard: number = getRandomInt(1, players[player_number].discard.length) - 1;
            players[player_number].hand.push(players[player_number].discard[indexOfDiscard]);
            players[player_number].discard.splice(indexOfDiscard, 1);
        }
    }
}

function egg(player_number : number, easy : boolean = true) {
    if (easy) {
        let board :Board = players[player_number].board;

        outerloop : for (const col of board.board_fish_slots) {
            for (const fishslot of col) {
                if (fishslot.fish != null && !fishslot.egg) {
                    fishslot.egg = true;
                    break outerloop;
                }
            }
        }
    }
    else {
        //NOT IMPLEMENTED
    }
}

function hatch(player_number : number, easy : boolean = true) {
    if (easy) {
        let board :Board = players[player_number].board;

        outerloop : for (const col of board.board_fish_slots) {
            for (const fishSlot of col) {
                if (fishSlot.egg) {
                    fishSlot.egg = false;
                    fishSlot.young += 1;
                    checkSchool(fishSlot)
                    break outerloop;
                }
            }
        }
    }
    else {
        //NOT IMPLEMENTED
    }
}

function young(player_number : number) {

    const board :Board = players[player_number].board;
    let arr :any[] = [board.board_fish_slots[0].concat(board.board_fish_slots[1].concat(board.board_fish_slots[2]))];
    let idOfBestSlot:number = bestSlotForYoung(arr).id
    board.board_fish_slots[(idOfBestSlot%3) - 1][(idOfBestSlot % 6) - 1].young += 1
    checkSchool(board.board_fish_slots[(idOfBestSlot%3) - 1][(idOfBestSlot % 6) - 1])
    //it ain't pretty, but it works in theory. And what more do you really need?
}

function move(player_number : number) {

    let board : Board = players[player_number].board;
    let fromFishSlot : FishSlot | undefined =  chooseOriginSlot(board)

    if (fromFishSlot == undefined) {
        return
    }

    const eligibleSlots : FishSlot[] = getEligibleSlotsForMove(board, fromFishSlot)
    const bestSlotForMove : FishSlot = bestSlotForYoung(eligibleSlots);
    bestSlotForMove.young += 1;
    fromFishSlot.young -= 1;
    checkSchool(bestSlotForMove)
}

function chooseOriginSlot(board : Board) {
    /*
    choose from slot for move:
    1 - first slot with a single young
    2 - first slot with 2 young
     */
    for (const col of board.board_fish_slots) {
        for (const fishslot  of col) {
            if (fishslot.young == 1) {
                return fishslot;
            }
        }
    }

    for (const col of board.board_fish_slots) {
        for (const fishslot  of col) {
            if (fishslot.young == 2) {
                return fishslot;
            }
        }
    }

}

function play_fish(player_number : number, fishCard : FishCard) {

    /*
    playing a fish card:
    1 - pay the cost of the fish. If you can't, nothing happens and no diver consumed
    2 - place the fish in a fish slot. If it is invalid, nothing happens and no diver consumed
    3 - diver consumed
    4 - ability triggers
     */

    let board :Board = players[player_number].board;

    //get number of eggs and young and schools and array of lengths from board
    let numberEggs : number = 0;
    let numberYoung : number = 0;
    let numberSchool : number = 0;
    let validEatAvailable : boolean = false;

    for (const col of board.board_fish_slots) {
        for (const fishSlot of col) {
            if (fishSlot.egg) {
                numberEggs += 1;
            }
            if (fishSlot.school) {
                numberSchool += 1;
            }
            numberYoung += fishSlot.young;
            if (fishSlot.fish && fishSlot.fish.length < fishCard.cardCost) {
                validEatAvailable = true;
            }
        }
    }

    //check all costs can be paid
    //check card cost
    if (fishCard.cardCost > players[player_number].hand.length) {
        throw new Error("Costs more cards than you have")
    }

    //check egg cost
    if (fishCard.eggCost > numberEggs) {
        throw new Error("Costs more eggs than you have")
    }

    //check young cost
    if (fishCard.youngCost > numberYoung) {
        throw new Error("Costs more young than you have")
    }

    //check school cost
    if (fishCard.schoolFishCost > numberSchool) {
        throw new Error("Costs more schools than you have")
    }

    //check eat 'cost'
    if (fishCard.consuming && !validEatAvailable) {
        throw new Error("Needs to eat a longer fish than you have available")
    }

    //get list of valid fish slots
    const eligiblePlayFishSlots: FishSlot[] = []

    //estuary fish and deep fish (there aren't any estuary fish)
    if (fishCard.sunlight > 0) {
        if (fishCard.dive == DiveEnum.None) {
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Blue][0])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Purple][0])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Green][0])
        } else {
            eligiblePlayFishSlots.push(board.board_fish_slots[fishCard.dive][0])
        }
    } else if (fishCard.midnight > 0) {
        if (fishCard.dive == DiveEnum.None) {
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Blue][5])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Purple][5])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Green][5])
        } else {
            eligiblePlayFishSlots.push(board.board_fish_slots[fishCard.dive][5])
        }
    }

    //sunlight less than 2 then can have non-estuary sunlight slots
    if (fishCard.sunlight == 1.0) {
        if (fishCard.dive == DiveEnum.None) {
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Blue][1])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Purple][1])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Green][1])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Blue][2])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Purple][2])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Green][2])
        } else {
            eligiblePlayFishSlots.push(board.board_fish_slots[fishCard.dive][1])
            eligiblePlayFishSlots.push(board.board_fish_slots[fishCard.dive][2])
        }
    }

    if (fishCard.twilight == 1.0) {
        if (fishCard.dive == DiveEnum.None) {
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Blue][3])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Purple][3])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Green][3])
        } else {
            eligiblePlayFishSlots.push(board.board_fish_slots[fishCard.dive][3])
        }
    }

    //midnight less than 2 then can have non-deep midnight slots
    if (fishCard.midnight == 1.0) {
        if (fishCard.dive == DiveEnum.None) {
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Blue][4])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Purple][4])
            eligiblePlayFishSlots.push(board.board_fish_slots[DiveEnum.Green][4])
        } else {
            eligiblePlayFishSlots.push(board.board_fish_slots[fishCard.dive][4])
        }
    }

    let filteredFishPlaySlots : FishSlot[] = []

    //filter eligible slots based on if fish are there and if the played fish is a consumer or not
    if (fishCard.consuming) {
        for (const fishSlot of eligiblePlayFishSlots) {
            if (fishSlot.fish && fishSlot.fish.length < fishCard.length) {
                filteredFishPlaySlots.push(fishSlot)
            }
        }
    } else {
        for (const fishSlot of eligiblePlayFishSlots) {
            if (!fishSlot.fish) {
                filteredFishPlaySlots.push(fishSlot)
            }
        }
    }

    //if there are no valid fish slots to play this fish in, reject
    if (filteredFishPlaySlots.length == 0) {
        throw new Error("There are no valid slots to play this fish in")
    }

    //pay card cost
    if (fishCard.cardCost > 0) {
        //easy mode: discard the top card of the hand
        let cardCost = fishCard.cardCost;
        while (cardCost > 0) {
            players[player_number].discard.push(<FishCard>players[player_number].hand.pop());
            cardCost--;
        }
    }

    //pay egg cost (lazy way)
    //TODO - pay eggs where there are no young, then pay eggs where eggs can be laid in future
    if (fishCard.eggCost > 0) {
        let eggCost : number = fishCard.eggCost;
        outerloop : for (const col of board.board_fish_slots) {
            for (const fishSlot of col) {
                if (fishSlot.egg) {
                    fishSlot.egg = false;
                    eggCost --;
                    if (eggCost == 0) {
                        break outerloop;
                    }
                }
            }
        }
    }

    //pay young cost (lazy way)
    //TODO - pay single youngs, prioritising youngs with no good moves
    if (fishCard.youngCost > 0) {
        let youngCost : number = fishCard.youngCost;
        outerloop : for (const col of board.board_fish_slots) {
            for (const fishSlot of col) {
                if (fishSlot.young > 0) {
                    if (fishSlot.young >= youngCost) {
                        fishSlot.young -= youngCost;
                        youngCost = 0;
                        break outerloop;
                    } else {
                        youngCost -= fishSlot.young;
                        fishSlot.young = 0;
                    }
                }
            }
        }
    }

    //pay school cost (lazy way)
    //TODO could improve by paying schools that could be in the way, eg on slots with young/eggs
    if (fishCard.schoolFishCost > 0) {
        let schoolCost : number = fishCard.eggCost;
        outerloop : for (const col of board.board_fish_slots) {
            for (const fishSlot of col) {
                if (fishSlot.school) {
                    fishSlot.school = false;
                    schoolCost --;
                    if (schoolCost == 0) {
                        break outerloop;
                    }
                }
            }
        }
    }

    //put fish in valid fish slot (taking into account eating or not eating)
    //lazy way! proper way needs to take into account future dives, existing fish, and abilities, maybe more

    const fishPlayChosenSlot :FishSlot = filteredFishPlaySlots[0]
    if (fishCard.consuming) {
        fishPlayChosenSlot.consumedFish ++;
    }
    fishPlayChosenSlot.fish = fishCard

    //check and activate when played ability
    abilityWhenSwitch(fishPlayChosenSlot)
}

function decideFishplay() {

}

function eat(player_number : number, fishSlot : FishSlot) {
    //ability that puts a fish card from hand with a shorter length under the fish that has this ability
    //1 - find a fish card with shorter length than the activating fish
    //2 - destroy the card from hand and + consumed fish on the activating fishes fishslot
    //LAZY WAYYYY
    if (fishSlot.fish) {
        let hand: FishCard[] = players[player_number].hand
        for (let i = 0; i < hand.length; i++) {
            if (hand[i].length < fishSlot.fish.length) {
                hand.splice(i, 1);
                fishSlot.consumedFish ++;
            }
        }
    }
}

function dive(player_number : number, dive : string) {
    let board = players[player_number].board;

    if (dive == "blue") {
        diveBlue(board.board_fish_slots[0], board.blue_bonus_claimed);
        board.blue_bonus_claimed = true;
    }
    else if (dive == "purple") {
        divePurple(board.board_fish_slots[1], board.purple_bonus_claimed);
        board.purple_bonus_claimed = true;
    }
    else if (dive == "green") {
         diveGreen(board.board_fish_slots[2], board.green_bonus_claimed);
         board.green_bonus_claimed = true;
    }
}

function diveBlue(fishSlots : FishSlot[], blueBonusClaimed : boolean) {

    let sunBonusClaimed : boolean = false;
    let twiBonusClaimed : boolean = false;
    let midBonusClaimed : boolean = false;

    for (const fishSlot of fishSlots) {
        if (fishSlot.fish != null) {
            //get bonus for having fish in that zone
            if (fishSlot.zone == ZoneEnum.Sunlight && !sunBonusClaimed) {
                sunBonusClaimed = true;
                draw(active_player)
            } else if (fishSlot.zone == ZoneEnum.Twilight && !twiBonusClaimed) {
                twiBonusClaimed = true;
                draw(active_player)
            } else if (fishSlot.zone == ZoneEnum.Midnight && !midBonusClaimed) {
                midBonusClaimed = true;
                draw_from_discard(active_player)
            }

            //activate fishes ability if it is that type of ability
            abilityActivateSwitch(fishSlot)
        }
    }

    if (!blueBonusClaimed) {
        draw_from_discard(active_player)
    }

}

function divePurple(fishSlots : FishSlot[], purpleBonusClaimed : boolean) {

    let sunBonusClaimed : boolean = false;
    let twiBonusClaimed : boolean = false;
    let midBonusClaimed : boolean = false;

    for (const fishSlot of fishSlots) {
        if (fishSlot.fish != null) {
            //get bonus for having fish in that zone
            if (fishSlot.zone == ZoneEnum.Sunlight && !sunBonusClaimed) {
                sunBonusClaimed = true;
                egg(active_player)
            } else if (fishSlot.zone == ZoneEnum.Twilight && !twiBonusClaimed) {
                twiBonusClaimed = true;
                egg(active_player)
            } else if (fishSlot.zone == ZoneEnum.Midnight && !midBonusClaimed) {
                midBonusClaimed = true;
                egg(active_player)
            }

            //activate fishes ability if it is that type of ability
            abilityActivateSwitch(fishSlot)
        }
    }

    if (!purpleBonusClaimed) {
        egg(active_player)
    }

}

function diveGreen(fishSlots : FishSlot[], greenBonusClaimed : boolean) {

    let sunBonusClaimed : boolean = false;
    let twiBonusClaimed : boolean = false;
    let midBonusClaimed : boolean = false;

    for (const fishSlot of fishSlots) {
        if (fishSlot.fish != null) {
            //get bonus for having fish in that zone
            if (fishSlot.zone == ZoneEnum.Sunlight && !sunBonusClaimed) {
                sunBonusClaimed = true;
                hatch(active_player)
            } else if (fishSlot.zone == ZoneEnum.Twilight && !twiBonusClaimed) {
                twiBonusClaimed = true;
                hatch(active_player)
            } else if (fishSlot.zone == ZoneEnum.Midnight && !midBonusClaimed) {
                midBonusClaimed = true;
                move(active_player)
            }

            //activate fishes ability if it is that type of ability
            abilityActivateSwitch(fishSlot)
        }
    }

    if (!greenBonusClaimed) {
        move(active_player)
    }
}

function gainPointsIfSchool() {

}

function gainPointsIfConsumed(){

}

function gainPointsIfNoToken(){

}

function gainPointsIfDeep(){

}

function gainPointsIf3Tokens() {

}

function gainPointsIf2Young() {

}

function getRandomInt(min: number, max: number): number {
    const minCeiled: number = Math.ceil(min);
    const maxFloored: number = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function getEligibleSlotsForMove(board : Board, fromFishSlot : FishSlot) : FishSlot[] {
    //get eligible slots for move
    let col : number = fromFishSlot.zone - 1;
    let row : number = (fromFishSlot.id % 6) - 1;

    let eligibleSlots : FishSlot[] = []

    let cols = [0,1,2]
    cols.splice(cols.indexOf(col), 1)

    for (const other_col of cols) {
        eligibleSlots.push(board.board_fish_slots[other_col][row])
    }

    let rows = [0,1,2,3,4,5]
    rows.splice(rows.indexOf(row), 1)

    for (const other_row of rows) {
        //don't consider slots with schools as eligible slots
        //TODO - move schools around to get them out of the way
        if (!board.board_fish_slots[col][other_row].school) {
            eligibleSlots.push(board.board_fish_slots[col][other_row])
        }
    }

    return eligibleSlots;
}

function bestSlotForYoung(fishSlots : FishSlot[]) {

    /*
    decide best slot:
    1 - if there is 2 young on a slot, move to there
    2 - if there is 1 young on a slot, move to there
    3 - if there is 1 egg on a slot, move to there
    4 - otherwise don't move (for ease of programmer)
    TODO : moves could consider whole board for best move, moving to a row or column where there is another young/egg
    in that row/column
     */

    for (const fishSlot of fishSlots) {
        if (fishSlot.young == 2) {
            return fishSlot
        }
    }

    for (const fishSlot of fishSlots) {
        if (fishSlot.young == 1) {
            return fishSlot
        }
    }

    for (const fishSlot of fishSlots) {
        if (fishSlot.egg) {
            return fishSlot
        }
    }

    return fishSlots[0] //return first slot if in doubt
}

function checkSchool(fishSlot: FishSlot) {
    if (fishSlot.young == 3 && !fishSlot.school) {
        fishSlot.school = true;
        fishSlot.young = 0;
    }
}

function abilityActivateSwitch(fishSlot : FishSlot) {
    if (fishSlot.fish) {
        if (fishSlot.fish.abilityType == "IfActivated") {
            executeAbility(fishSlot)
        } else if (fishSlot.fish.abilityType == "IfActivatedA") {
            executeAbility(fishSlot, true)
        }
    }
}

function abilityWhenSwitch(fishSlot : FishSlot) {
    if (fishSlot.fish) {
        if (fishSlot.fish.abilityType == "WhenPlayed") {
            executeAbility(fishSlot);
        } else if (fishSlot.fish.abilityType == "WhenPlayedA") {
            executeAbility(fishSlot, true);
        }
    }
}

function executeAbility(fishSlot : FishSlot, allPlayers : boolean = false) {
    if (fishSlot.fish == null) {
        throw new Error("the fish is null help us oh god please")
    }

    const abilities = fishSlot.fish.abilityString.split(']')
        .filter(Boolean)
        .map(item => item.slice(1));

    let action_players:Player[] = []
    if (allPlayers) {
        action_players = players
    } else {
        action_players.push(players[active_player])
    }

    if ("ArrowDown" in abilities) {
        //TODO special things
    } else {
        for (let player of action_players) {
            for (const action of abilities) {
                if (action == "FishHatch") {
                    hatch(player.id)
                } else if (action == "DrawCard") {
                    draw(player.id);
                } else if (action == "Discard") {
                    draw_from_discard(player.id);
                } else if (action == "FishEgg") {
                    egg(player.id)
                } else if (action == "SchoolFeederMove") {
                    move(player.id);
                } else if (action == "YoungFish") {
                    young(player.id);
                } else if (action == "ConsumeFish1") {
                    eat(player.id, fishSlot)
                }
            }
        }
    }
}

function setupGame() {

    for (let i = 0; i < NUMBER_PLAYERS; i++) {
        let board = new Board();
        players.push(new Player(i, board))
    }
    console.log(players)
}

function makeStarterDeck() {
    const starter_deck_raw = JSON.parse(JSON.stringify(starter_cards));
    for (const starter_card_raw of starter_deck_raw) {
        starter_deck.push(parseCard(starter_card_raw));
    }
    console.log(starter_deck);
}

function makeDeck(simple : boolean = true) {
    const deck_raw = JSON.parse(JSON.stringify(fish_cards));
    for (const card_raw of deck_raw) {
        const newFishCard : FishCard = parseCard(card_raw);
        const ability = newFishCard.abilityString.split(']')
            .filter(Boolean)
            .map(item => item.slice(1));
        if (simple && newFishCard.ability && (newFishCard.abilityType == "GameEnd" || ("ArrowDown" in newFishCard.ability))) {
         //don't add to deck
        } else {
            deck.push(parseCard(newFishCard));
        }
    }
    console.log(deck);
}

function parseCard(jsonItem : any) : FishCard {
    let id : number = jsonItem.id;
    let name : string = jsonItem.name;
    let points : number = jsonItem.points;
    let length : number = jsonItem.length;
    let abilityType : string = jsonItem.abilityType;
    let ability : string = jsonItem.ability;
    let band : string = jsonItem.band;
    let group : string = jsonItem.group;
    let sunlight : number = jsonItem.sunlight;
    let twilight : number = jsonItem.twilight;
    let midnight : number = jsonItem.midnight;
    let cardCost : number = jsonItem.cardCost;
    let eggCost : number = jsonItem.eggCost;
    let youngCost : number = jsonItem.youngCost;
    let consuming : boolean = jsonItem.consuming;
    let schoolFishCost : number = jsonItem.schoolFishCost;

    return new FishCard(id, name, points, length, abilityType, ability, band, group, sunlight, twilight, midnight, cardCost, eggCost, youngCost, consuming, schoolFishCost);
}

function dealStartingCards() {

    for (const player of players) {
        draw(player.id, true)
        draw(player.id, true)
        draw(player.id, false)
        draw(player.id, false)
        draw(player.id, false)
    }

}

function tryPlayFish(player_number : number) {

    for (const fishCard of players[player_number].hand) {
        try {
            play_fish(player_number, fishCard);
            console.log(fishCard);
            console.log("played fish :)")
            break;
        } catch (e) {
            console.log(fishCard);
            console.error(e);
        }
    }
}

function changeActivePlayer() {
    active_player = (active_player + 1) % players.length;
}

//Temporary input section

function handleInput(input : string) {

    switch (input) {
        case "board":
            console.log(players[active_player].board);
            break;
        case "hand":
            console.log(players[active_player].hand);
            break;
        case "discard":
            console.log(players[active_player].discard);
            break;
        case "playfish":
            tryPlayFish(active_player)
            changeActivePlayer()
            break;
        case "diveB":
            dive(active_player, "blue")
            changeActivePlayer()
            break;
        case "diveP":
            dive(active_player, "purple")
            changeActivePlayer()
            break;
        case "diveG":
            dive(active_player, "green")
            changeActivePlayer()
            break;
    }

    nextTurn()
}

function showOptions() {
    console.log("Showing options-----");
    console.log("board, hand, discard - these will show you more info")
    console.log("playfish - play a fish from hand")
    console.log("diveB, diveP, diveG - these will do the respective dives")
}

function nextTurn() {
    showOptions();
    rl.question("> ", handleInput)
}

setupGame()
makeStarterDeck()
makeDeck()
dealStartingCards()
nextTurn()