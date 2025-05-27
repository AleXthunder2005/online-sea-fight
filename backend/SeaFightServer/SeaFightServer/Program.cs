using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

const string FRONTEND_ORIGIN = "http://localhost:5174"; 

// Включите все возможные CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(FRONTEND_ORIGIN) 
              .AllowAnyMethod()                    
              .AllowAnyHeader();                    
    });
});

// Добавление сервисов Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SeaFight API", Version = "v1" });
});


var app = builder.Build();

app.UseCors("AllowFrontend");

// Включение middleware Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SeaFight API V1");
    });
}

app.MapGet("/", () => "API is running. Use /swagger for documentation");
app.Run();


