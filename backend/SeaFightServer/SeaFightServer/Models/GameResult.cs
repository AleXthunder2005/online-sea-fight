namespace SeaFightServer.Models
{
    public class GameResult
    {
        public bool IsHit { get; set; }
        public bool IsShipDestroyed { get; set; }
        public bool IsGameOver { get; set; }
        public int[,] DestroyedShipCells { get; set; }
    }
}
