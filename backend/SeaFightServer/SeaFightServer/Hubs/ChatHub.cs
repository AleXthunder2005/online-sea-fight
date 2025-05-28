using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace SeaFightServer.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _chatSessions = new ConcurrentDictionary<string, string>();

        public async Task JoinChat(string sessionId)
        {
            // Добавляем пользователя в чат-группу сессии
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            _chatSessions.TryAdd(Context.ConnectionId, sessionId);
        }

        public async Task SendMessage(string sessionId, string message)
        {
            // Отправляем сообщение всем участникам чата сессии
            await Clients.Group(sessionId).SendAsync("ReceiveMessage", message);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Удаляем пользователя из чат-группы при отключении
            if (_chatSessions.TryRemove(Context.ConnectionId, out var sessionId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}