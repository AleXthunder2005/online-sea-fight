import {SeaFightEngine} from "@/engines/seaFightEngine.ts";
import type {BattlefieldMatrix} from "@/types/ship.types.ts";

export class Bot {
    public userEngine: SeaFightEngine;
    private unshootingCells: number[] = [];
    private priorityCells: number[] = [];
    private setUserField;

    // @ts-ignore
    constructor(userField : BattlefieldMatrix, setField) {
        this.userEngine = new SeaFightEngine(userField);
        for (let i = 0; i < 100; i++) {
            this.unshootingCells.push(i);
        }
        this.setUserField = setField;
    }

    public makeShoot(): boolean {
            this.priorityCells = this.priorityCells.filter(cell => this.userEngine.isCellShootable(...this.convertCoords(cell)));

            let currCellPair : [number, number];
            if (this.priorityCells.length === 0) {
                currCellPair = this.chooseShootCoords(this.unshootingCells)
            }
            else {
                currCellPair = this.chooseShootCoords(this.priorityCells)
            }

            const [row, col] = currCellPair;
            const wasHit = this.userEngine.shoot(row, col);
            this.setUserField(this.userEngine.getField() as BattlefieldMatrix);

            if (wasHit) {
                const potentialPriorityCells = this.userEngine.getEmptyAroundCells(row, col);
                this.unshootingCells = this.unshootingCells.filter(
                    cell => !potentialPriorityCells.includes(cell) && this.userEngine.isCellShootable(...this.convertCoords(cell))
                );
                this.priorityCells = [...this.priorityCells, ...potentialPriorityCells];
            }

        return wasHit; //Если победили - значит точно попали
    }

    public isWin(): boolean {
        return this.unshootingCells.length === 0 || this.userEngine.areAllShipsDestroyed();
    }


    private chooseShootCoords (coordinates: number[]): [number, number] {
        const randomIndex = Math.floor(Math.random() * coordinates.length);
        const cellNumber = coordinates[randomIndex];
        const coordsPair = this.convertCoords(cellNumber);
        coordinates.splice(randomIndex, 1);

        return coordsPair;
    }

    // private refactorPriorityCells(): void {
    //     for (let i = 0; i < this.priorityCells.length; i++) {
    //         const [row, col] = this.convertCoords(this.priorityCells[i]);
    //         if (!this.userEngine.isCellShootable(row, col)) {
    //             this.priorityCells.splice(i, 1);
    //         }
    //     }
    // }

    // private refactorCells(): void {
    //     for (let i = 0; i < this.unshootingCells.length; i++) {
    //         const [row, col] = this.convertCoords(this.unshootingCells[i]);
    //         if (!this.userEngine.isCellEmpty(row, col)) {
    //             this.unshootingCells.splice(i, 1);
    //         }
    //     }
    // }

    private convertCoords (coords: number) : [number, number] {
        return [Math.floor(coords / 10), coords % 10];
    }

}