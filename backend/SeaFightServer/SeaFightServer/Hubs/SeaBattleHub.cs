using Microsoft.AspNetCore.SignalR;
using SeaFightServer.Models;
using System.Collections.Concurrent;

namespace SeaFightServer.Hubs
{
    public class SeaBattleHub : Hub
    {
        private static readonly ConcurrentQueue<string> _waitingPlayers = new ConcurrentQueue<string>();
        private static readonly ConcurrentDictionary<string, GameSession> _gameSessions = new ConcurrentDictionary<string, GameSession>();

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Удаляем игрока из очереди, если он отключился
            if (_waitingPlayers.Contains(Context.ConnectionId))
            {
                _waitingPlayers.TryDequeue(out _);
            }

            // Завершаем игру, если один из игроков отключился
            var session = _gameSessions.Values.FirstOrDefault(s =>
                s.Player1ConnectionId == Context.ConnectionId ||
                s.Player2ConnectionId == Context.ConnectionId);

            if (session != null)
            {
                _gameSessions.TryRemove(session.SessionId, out _);
                var opponentId = session.Player1ConnectionId == Context.ConnectionId
                    ? session.Player2ConnectionId
                    : session.Player1ConnectionId;

                if (opponentId != null)
                {
                    await Clients.Client(opponentId).SendAsync("OpponentDisconnected");
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinQueue()
        {
            // Добавляем игрока в очередь
            _waitingPlayers.Enqueue(Context.ConnectionId);

            // Уведомляем клиента, что он в очереди
            await Clients.Caller.SendAsync("WaitingForOpponent");

            // Проверяем, можно ли начать игру
            if (_waitingPlayers.Count >= 2)
            {
                // Берем двух игроков из очереди
                if (_waitingPlayers.TryDequeue(out var player1) &&
                    _waitingPlayers.TryDequeue(out var player2))
                {
                    // Создаем новую игровую сессию
                    var sessionId = Guid.NewGuid().ToString();
                    var session = new GameSession
                    {
                        SessionId = sessionId,
                        Player1ConnectionId = player1,
                        Player2ConnectionId = player2,
                        CurrentTurnPlayerId = player1, // Первый игрок ходит первым
                        IsGameStarted = false
                    };

                    _gameSessions.TryAdd(sessionId, session);

                    // Уведомляем игроков о начале игры
                    await Clients.Clients(player1, player2).SendAsync("GameSessionCreated", sessionId);
                }
            }
        }

        public async Task SendBattlefield(string sessionId, string[][] battlefield)
        {
            if (_gameSessions.TryGetValue(sessionId, out var session))
            {
                // Сохраняем поле игрока и отправляем его сопернику
                if (Context.ConnectionId == session.Player1ConnectionId)
                {
                    session.Player1Field = battlefield;
                    await Clients.Client(session.Player2ConnectionId)
                        .SendAsync("ReceiveOpponentField", session.Player1Field);
                }
                else if (Context.ConnectionId == session.Player2ConnectionId)
                {
                    session.Player2Field = battlefield;
                    await Clients.Client(session.Player1ConnectionId)
                        .SendAsync("ReceiveOpponentField", session.Player2Field);
                }

                // Если оба игрока отправили свои поля, начинаем игру
                if (session.Player1Field != null && session.Player2Field != null && !session.IsGameStarted)
                {
                    session.IsGameStarted = true;
                    await Clients.Client(session.Player1ConnectionId).SendAsync("GameStarted", true);
                    await Clients.Client(session.Player2ConnectionId).SendAsync("GameStarted", false);
                }
            }
        }
      
        public async Task MakeMove(string sessionId, PlayerMove move)
        {
            if (_gameSessions.TryGetValue(sessionId, out var session))
            {
                // Определяем ID противника
                var opponentId = Context.ConnectionId == session.Player1ConnectionId
                    ? session.Player2ConnectionId
                    : session.Player1ConnectionId;

                // Передаем ход противнику
                await Clients.Client(opponentId).SendAsync("ReceiveOpponentMove", move);
            }
        }

        public async Task SendPlayerName(string sessionId, string name)
        {
            if (_gameSessions.TryGetValue(sessionId, out var session))
            {
                // Сохраняем имя игрока и отправляем его сопернику
                if (Context.ConnectionId == session.Player1ConnectionId)
                {
                    session.Player1Name = name;
                    await Clients.Client(session.Player2ConnectionId)
                        .SendAsync("ReceiveOpponentName", name);
                }
                else if (Context.ConnectionId == session.Player2ConnectionId)
                {
                    session.Player2Name = name;
                    await Clients.Client(session.Player1ConnectionId)
                        .SendAsync("ReceiveOpponentName", name);
                }
            }
        }

        public async Task SendChatMessage(string sessionId, string senderName, string message)
        {
            if (_gameSessions.TryGetValue(sessionId, out var session))
            {
                // Определяем ID противника
                var opponentId = Context.ConnectionId == session.Player1ConnectionId
                    ? session.Player2ConnectionId
                    : session.Player1ConnectionId;

                // Передаем сообщение противнику
                await Clients.Client(opponentId)
                    .SendAsync("ReceiveChatMessage", senderName, message);
            }
        }

    }
}
