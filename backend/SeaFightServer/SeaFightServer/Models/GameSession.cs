namespace SeaFightServer.Models
{
    public class GameSession
    {
        public string SessionId { get; set; }
        public string Player1ConnectionId { get; set; }
        public string Player2ConnectionId { get; set; }
        public string CurrentTurnPlayerId { get; set; }
        public bool IsGameStarted { get; set; }
        public string[][] Player1Field { get; set; }
        public string[][] Player2Field { get; set; }
        public string Player1Name { get; set; }
        public string Player2Name { get; set; }
    }

}
