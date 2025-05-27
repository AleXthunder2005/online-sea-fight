import type {BattlefieldMatrix, ShipDirection, ShipSize} from "@/types/ship.types.ts";

const FIELD_SIZE = 10;

export class SeaFightEngine {
    private field: BattlefieldMatrix;

    constructor(initialField?: BattlefieldMatrix) {
        this.field = initialField || SeaFightEngine.createEmptyField();
    }

    public getField(): BattlefieldMatrix {
        return this.field.map(row => [...row]);
    }

    public shoot(row: number, col: number): boolean {
        if (row < 0 || row >= FIELD_SIZE || col < 0 || col >= FIELD_SIZE) {
            return false;
        }

        if (this.field[row][col] === 'ship') {
            this.field[row][col] = 'hit';

            // Проверяем, уничтожен ли корабль полностью
            if (this.isShipDestroyed(row, col)) {
                this.markDestroyedShipPerimeter(row, col);
            } else {
                // Помечаем углы как FORBIDDEN
                this.markCornersForbidden(row, col);
            }
            return true;
        } else {
            // Пустая клетка
            this.field[row][col] = 'miss';
            return false;
        }
    }

    public areAllShipsDestroyed(): boolean {
        for (let i = 0; i < FIELD_SIZE; i++) {
            for (let j = 0; j < FIELD_SIZE; j++) {
                if (this.field[i][j] === 'ship') {
                    return false;
                }
            }
        }
        return true;
    }

    public getEmptyAroundCells(row: number, col: number): number[] {
        const emptyCells: number[] = [];
        // Проверяем клетку слева
        if (col > 0 && this.isCellShootable(row, col-1)) {
            emptyCells.push(row * 10 + col - 1);
        }
        // Проверяем клетку справа
        if (col < FIELD_SIZE - 1 && this.isCellShootable(row, col+1)) {
            emptyCells.push(row * 10 + col + 1);
        }
        // Проверяем клетку сверху
        if (row > 0 && this.isCellShootable(row - 1, col)) {
            emptyCells.push((row - 1) * 10 + col);
        }
        // Проверяем клетку снизу
        if (row < FIELD_SIZE - 1 && this.isCellShootable(row+1, col)) {
            emptyCells.push((row + 1) * 10 + col);
        }

        return emptyCells;
    }

    public isCellShootable (row: number, col: number): boolean {
        return this.field[row][col] === 'empty' || this.field[row][col] === 'ship';
    }

    private markCornersForbidden(row: number, col: number): void {
        // Левый верхний угол
        if (row > 0 && col > 0 && this.field[row - 1][col - 1] === 'empty') {
            this.field[row - 1][col - 1] = 'forbidden';
        }

        // Правый верхний угол
        if (row > 0 && col < FIELD_SIZE - 1 && this.field[row - 1][col + 1] === 'empty') {
            this.field[row - 1][col + 1] = 'forbidden';
        }

        // Левый нижний угол
        if (row < FIELD_SIZE - 1 && col > 0 && this.field[row + 1][col - 1] === 'empty') {
            this.field[row + 1][col - 1] = 'forbidden';
        }

        // Правый нижний угол
        if (row < FIELD_SIZE - 1 && col < FIELD_SIZE - 1 && this.field[row + 1][col + 1] === 'empty') {
            this.field[row + 1][col + 1] = 'forbidden';
        }
    }

    private isShipDestroyed(row: number, col: number): boolean {
        // Проверяем все клетки корабля (может быть горизонтальным или вертикальным)
        // Проверяем влево
        let r = row;
        let c = col;
        while (c >= 0 && (this.field[r][c] === 'ship' || this.field[r][c] === 'hit')) {
            if (this.field[r][c] === 'ship') return false;
            c--;
        }

        // Проверяем вправо
        c = col + 1;
        while (c < FIELD_SIZE && (this.field[r][c] === 'ship' || this.field[r][c] === 'hit')) {
            if (this.field[r][c] === 'ship') return false;
            c++;
        }

        // Проверяем вверх
        r = row - 1;
        c = col;
        while (r >= 0 && (this.field[r][c] === 'ship' || this.field[r][c] === 'hit')) {
            if (this.field[r][c] === 'ship') return false;
            r--;
        }

        // Проверяем вниз
        r = row + 1;
        while (r < FIELD_SIZE && (this.field[r][c] === 'ship' || this.field[r][c] === 'hit')) {
            if (this.field[r][c] === 'ship') return false;
            r++;
        }

        return true;
    }

    private markDestroyedShipPerimeter(row: number, col: number): void {
        // Находим все клетки корабля
        const shipCells: [number, number][] = [];
        this.findAllShipCells(row, col, shipCells);

        // Помечаем периметр
        for (const [r, c] of shipCells) {
            for (let i = Math.max(0, r - 1); i <= Math.min(FIELD_SIZE - 1, r + 1); i++) {
                for (let j = Math.max(0, c - 1); j <= Math.min(FIELD_SIZE - 1, c + 1); j++) {
                    if (this.field[i][j] === 'empty') {
                        this.field[i][j] = 'forbidden';
                    }
                }
            }
        }
    }

    private findAllShipCells(
        row: number,
        col: number,
        foundCells: [number, number][]
    ): void {
        if (
            row < 0 ||
            row >= FIELD_SIZE ||
            col < 0 ||
            col >= FIELD_SIZE ||
            this.field[row][col] !== 'hit' ||
            foundCells.some(([r, c]) => r === row && c === col)
        ) {
            return;
        }

        foundCells.push([row, col]);

        // Проверяем соседние клетки
        this.findAllShipCells(row - 1, col, foundCells); // вверх
        this.findAllShipCells(row + 1, col, foundCells); // вниз
        this.findAllShipCells(row, col - 1, foundCells); // влево
        this.findAllShipCells(row, col + 1, foundCells); // вправо
    }





    public static canPlaceShip = (row: number, col: number, size: ShipSize, direction: ShipDirection, matrix: BattlefieldMatrix): boolean => {
        // Проверяем границы поля
        if (direction === 'horizontal') {
            if (col + size > 10) return false;
        } else {
            if (row + size > 10) return false;
        }

        // Проверяем что все клетки свободны
        for (let i = 0; i < size; i++) {
            const cellRow = direction === 'horizontal' ? row : row + i;
            const cellCol = direction === 'horizontal' ? col + i : col;

            if (matrix[cellRow][cellCol] !== 'empty') return false;

            // Проверяем соседние клетки
            for (let r = Math.max(0, cellRow - 1); r <= Math.min(9, cellRow + 1); r++) {
                for (let c = Math.max(0, cellCol - 1); c <= Math.min(9, cellCol + 1); c++) {
                    if (matrix[r][c] === 'ship') return false;
                }
            }
        }

        return true;
    };
    public static generateField = ()=> {
        const newMatrix: BattlefieldMatrix = Array(10).fill(null).map(() => Array(10).fill('empty'));
        const shipsToPlace: ShipSize[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

        // Пытаемся расставить каждый корабль
        for (const shipSize of shipsToPlace) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                attempts++;
                const direction: ShipDirection = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);

                if (SeaFightEngine.canPlaceShip(row, col, shipSize, direction, newMatrix)) {
                    // Ставим корабль
                    for (let i = 0; i < shipSize; i++) {
                        if (direction === 'horizontal') {
                            newMatrix[row][col + i] = 'ship';
                        } else {
                            newMatrix[row + i][col] = 'ship';
                        }
                    }
                    placed = true;
                }
            }
        }

        return newMatrix;
    }

    public static createEmptyField(): BattlefieldMatrix {
        return Array(FIELD_SIZE)
            .fill(null)
            .map(() => Array(FIELD_SIZE).fill('empty'));
    }




}

