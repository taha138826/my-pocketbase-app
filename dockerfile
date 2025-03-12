FROM debian:bullseye-slim
WORKDIR /app

# نصب ابزارها و دانلود PocketBase نسخه 0.25.9
RUN apt-get update && apt-get install -y wget unzip && \
    wget https://github.com/pocketbase/pocketbase/releases/download/v0.25.9/pocketbase_0.25.9_linux_amd64.zip && \
    unzip pocketbase_0.25.9_linux_amd64.zip -d /app && \
    chmod +x /app/pocketbase && \
    rm pocketbase_0.25.9_linux_amd64.zip

EXPOSE 8090
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090"]