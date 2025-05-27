using System;
using System.Collections.Generic;

public class Battlefield
{
    const int FIELD_SIZE = 10;
    public enum CELL_STATES
    {
        EMPTY,
        SHIP,
        MISS,
        HIT,
        FORBIDDEN
    }

    public CELL_STATES[][] Field { get; private set; }

    public Battlefield()
    {
        Field = new CELL_STATES[FIELD_SIZE][];
        for (int i = 0; i < FIELD_SIZE; i++)
        {
            Field[i] = new CELL_STATES[FIELD_SIZE];
            for (int j = 0; j < FIELD_SIZE; j++)
            {
                Field[i][j] = CELL_STATES.EMPTY;
            }
        }
    }

    public bool Shoot(int row, int col)
    {
        if (row < 0 || row >= FIELD_SIZE || col < 0 || col >= FIELD_SIZE)
            return false;

        // Если уже стреляли в эту клетку или она запрещена
        if (Field[row][col] == CELL_STATES.MISS ||
            Field[row][col] == CELL_STATES.HIT ||
            Field[row][col] == CELL_STATES.FORBIDDEN)
            return false;

        if (Field[row][col] == CELL_STATES.SHIP)
        {
            Field[row][col] = CELL_STATES.HIT;

            // Проверяем, уничтожен ли корабль полностью
            if (IsShipDestroyed(row, col))
            {
                MarkDestroyedShipPerimeter(row, col);
            }
            else
            {
                // Помечаем углы как FORBIDDEN
                MarkCornersForbidden(row, col);
            }
            return true;
        }
        else // EMPTY
        {
            Field[row][col] = CELL_STATES.MISS;
            return false;
        }
    }
    public bool AreAllShipsDestroyed()
    {
        for (int i = 0; i < FIELD_SIZE; i++)
        {
            for (int j = 0; j < FIELD_SIZE; j++)
            {
                if (Field[i][j] == CELL_STATES.SHIP)
                    return false;
            }
        }
        return true;
    }

    public void AutoPlaceShips()
    {
        // Очищаем поле
        for (int i = 0; i < FIELD_SIZE; i++)
        {
            for (int j = 0; j < FIELD_SIZE; j++)
            {
                Field[i][j] = CELL_STATES.EMPTY;
            }
        }

        int[] shipsToPlace = { 4, 3, 3, 2, 2, 2, 1, 1, 1, 1 };

        foreach (int shipSize in shipsToPlace)
        {
            bool placed = false;
            int attempts = 0;

            while (!placed && attempts < 100)
            {
                attempts++;
                bool isHorizontal = new Random().Next(0, 2) == 0;
                int row = new Random().Next(0, FIELD_SIZE);
                int col = new Random().Next(0, FIELD_SIZE);

                if (CanPlaceShip(row, col, shipSize, isHorizontal))
                {
                    PlaceShip(row, col, shipSize, isHorizontal);
                    placed = true;
                }
            }
        }
    }














    private void MarkCornersForbidden(int row, int col)
    {
        // Левый верхний угол
        if (row > 0 && col > 0 && Field[row - 1][col - 1] == CELL_STATES.EMPTY)
            Field[row - 1][col - 1] = CELL_STATES.FORBIDDEN;

        // Правый верхний угол
        if (row > 0 && col < FIELD_SIZE - 1 && Field[row - 1][col + 1] == CELL_STATES.EMPTY)
            Field[row - 1][col + 1] = CELL_STATES.FORBIDDEN;

        // Левый нижний угол
        if (row < FIELD_SIZE - 1 && col > 0 && Field[row + 1][col - 1] == CELL_STATES.EMPTY)
            Field[row + 1][col - 1] = CELL_STATES.FORBIDDEN;

        // Правый нижний угол
        if (row < FIELD_SIZE - 1 && col < FIELD_SIZE - 1 && Field[row + 1][col + 1] == CELL_STATES.EMPTY)
            Field[row + 1][col + 1] = CELL_STATES.FORBIDDEN;
    }

    private bool IsShipDestroyed(int row, int col)
    {
        // Проверяем все клетки корабля (может быть горизонтальным или вертикальным)
        // Проверяем влево
        int r = row, c = col;
        while (c >= 0 && (Field[r][c] == CELL_STATES.SHIP || Field[r][c] == CELL_STATES.HIT))
        {
            if (Field[r][c] == CELL_STATES.SHIP) return false;
            c--;
        }

        // Проверяем вправо
        c = col + 1;
        while (c < FIELD_SIZE && (Field[r][c] == CELL_STATES.SHIP || Field[r][c] == CELL_STATES.HIT))
        {
            if (Field[r][c] == CELL_STATES.SHIP) return false;
            c++;
        }

        // Проверяем вверх
        r = row - 1;
        c = col;
        while (r >= 0 && (Field[r][c] == CELL_STATES.SHIP || Field[r][c] == CELL_STATES.HIT))
        {
            if (Field[r][c] == CELL_STATES.SHIP) return false;
            r--;
        }

        // Проверяем вниз
        r = row + 1;
        while (r < FIELD_SIZE && (Field[r][c] == CELL_STATES.SHIP || Field[r][c] == CELL_STATES.HIT))
        {
            if (Field[r][c] == CELL_STATES.SHIP) return false;
            r++;
        }

        return true;
    }

    private void MarkDestroyedShipPerimeter(int row, int col)
    {
        // Находим все клетки корабля и помечаем периметр
        var shipCells = new List<(int, int)>();
        FindAllShipCells(row, col, shipCells);

        foreach (var (r, c) in shipCells)
        {
            // Помечаем все соседние клетки как FORBIDDEN
            for (int i = Math.Max(0, r - 1); i <= Math.Min(FIELD_SIZE - 1, r + 1); i++)
            {
                for (int j = Math.Max(0, c - 1); j <= Math.Min(FIELD_SIZE - 1, c + 1); j++)
                {
                    if (Field[i][j] == CELL_STATES.EMPTY)
                    {
                        Field[i][j] = CELL_STATES.FORBIDDEN;
                    }
                }
            }
        }
    }

    private void FindAllShipCells(int row, int col, List<(int, int)> shipCells)
    {
        if (row < 0 || row >= FIELD_SIZE || col < 0 || col >= FIELD_SIZE)
            return;

        if (Field[row][col] != CELL_STATES.HIT || shipCells.Contains((row, col)))
            return;

        shipCells.Add((row, col));

        // Рекурсивно проверяем соседние клетки
        FindAllShipCells(row - 1, col, shipCells); // вверх
        FindAllShipCells(row + 1, col, shipCells); // вниз
        FindAllShipCells(row, col - 1, shipCells); // влево
        FindAllShipCells(row, col + 1, shipCells); // вправо
    }

    

    private bool CanPlaceShip(int row, int col, int size, bool isHorizontal)
    {
        // Проверяем границы поля
        if (isHorizontal)
        {
            if (col + size > FIELD_SIZE) return false;
        }
        else
        {
            if (row + size > FIELD_SIZE) return false;
        }

        // Проверяем что все клетки свободны и вокруг них тоже
        for (int i = 0; i < size; i++)
        {
            int r = isHorizontal ? row : row + i;
            int c = isHorizontal ? col + i : col;

            if (Field[r][c] != CELL_STATES.EMPTY) return false;

            // Проверяем соседние клетки
            for (int x = Math.Max(0, r - 1); x <= Math.Min(FIELD_SIZE - 1, r + 1); x++)
            {
                for (int y = Math.Max(0, c - 1); y <= Math.Min(FIELD_SIZE - 1, c + 1); y++)
                {
                    if (Field[x][y] == CELL_STATES.SHIP) return false;
                }
            }
        }

        return true;
    }

    private void PlaceShip(int row, int col, int size, bool isHorizontal)
    {
        for (int i = 0; i < size; i++)
        {
            int r = isHorizontal ? row : row + i;
            int c = isHorizontal ? col + i : col;
            Field[r][c] = CELL_STATES.SHIP;
        }
    }

}