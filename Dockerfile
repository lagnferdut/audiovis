# 1. Obraz bazowy - system operacyjny z zainstalowanym Node.js
FROM node:20-slim

# 2. Ustawienie katalogu roboczego wewnątrz kontenera
WORKDIR /app

# 3. Kopiowanie plików z zależnościami i ich instalacja
COPY package*.json ./
RUN npm install --only=production

# 4. Kopiowanie reszty kodu aplikacji
COPY . .

# 5. Uruchomienie aplikacji
# Zmień "server.js" na plik startowy Twojej aplikacji
CMD [ "node", "server.js" ]