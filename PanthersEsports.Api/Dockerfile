# ==============================================================================
# Build Stage (official Microsoft .NET 10 SDK)
# ==============================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and restore NuGet dependencies
COPY PanthersEsports.Api.csproj ./
RUN dotnet restore

# Copy all remaining source files
COPY . ./

# Publish release binaries (framework-dependent for fast builds and small image)
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# ==============================================================================
# Runtime Stage (official Microsoft ASP.NET Core 10 runtime)
# ==============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Render defaults to port 10000
ENV PORT=10000
ENV ASPNETCORE_HTTP_PORTS=10000
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 10000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "PanthersEsports.Api.dll"]
