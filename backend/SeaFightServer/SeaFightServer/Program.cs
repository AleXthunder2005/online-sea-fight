using Microsoft.OpenApi.Models;
using SeaFightServer.Hubs;

var builder = WebApplication.CreateBuilder(args);

const string FRONTEND_ORIGIN = "http://192.168.0.106:5174";

// Добавление сервисов
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(FRONTEND_ORIGIN)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Добавлено для SignalR
    });
});

// Добавление сервисов Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SeaFight API", Version = "v1" });
});

// Добавление SignalR
builder.Services.AddSignalR();

// Configure Kestrel to listen on all interfaces (0.0.0.0)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5293); // Replace 5293 with your desired port if different
});

var app = builder.Build();

// Настройка middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SeaFight API V1");
    });
}

app.UseCors("AllowFrontend");

// Настройка маршрутов
app.MapGet("/", () => "API is running. Use /swagger for documentation");
app.MapGet("/hub-test", async context =>
{
    await context.Response.WriteAsync("Hub is reachable");
});
app.MapHub<SeaBattleHub>("/seabattlehub");

app.Run();