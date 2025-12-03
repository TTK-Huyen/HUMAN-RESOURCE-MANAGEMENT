# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy toàn bộ source của HRMApi (vì Dockerfile đang nằm chung thư mục)
COPY . .

# restore & publish
RUN dotnet restore "HRMApi.csproj"
RUN dotnet publish "HRMApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# copy output đã publish sang image runtime
COPY --from=build /app/publish .

# run API
ENTRYPOINT ["dotnet", "HRMApi.dll"]
