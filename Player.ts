import {Board} from "./Board";
import {FishCard} from "./FishCard";

export class Player {

    id : number;
    board : Board;
    hand : FishCard[] = [];
    discard : FishCard[] = [];
    score : number = 0;
    turns: number = 6;

    constructor(id: number, board: Board) {
        this.id = id;
        this.board = board;
        this.hand = [];
        this.discard = [];
    }

}