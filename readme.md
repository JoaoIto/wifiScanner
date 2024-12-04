# WiFi Network Scanner

Aplicação em Nodejs, que descubra quais
Access Point's (AP's) estão disponíveis em uma determinada região. Em seguida,
exiba as informações inerentes as redes providas por estes AP's, sendo:

- a) Identificador de Conjunto de Serviços (SSID/ESSID);

- b) Endereço MAC do AP (Hexadecimal);

- c) Qualidade do Link (Quality Link - %);

- d) Nível de Sinal (Signal level – dBm);

- e) Canal utilizado;

- f) Frequência (GHz);

- g) Tempo do último frame de sincronismo (beacon) enviado pelo AP.

As informações devem ser disponibilizadas em tempo real para os usuários (por
exemplo, devem ser atualizadas a cada 01 minuto) e persistidas em banco de dados
MongoDB em um servidor Debian Linux 12.5+.

---

## **1. Rota: `/save-networks`**

### **Método:** `POST`

Esta rota é responsável por iniciar o processo de varredura das redes Wi-Fi e salvar as informações no banco de dados. Ao ser chamada, o servidor realiza a varredura das redes e armazena as redes encontradas de forma contínua.

#### **Requisição:**
- **Parâmetros:** Não há parâmetros necessários na requisição.
- **Body:** Não é necessário enviar um corpo na requisição.

#### **Resposta:**
- **Status 200:** Quando a varredura e o salvamento das redes são iniciados com sucesso.
  ```json
  {
    "message": "Networks scanning and saving initiated",
    "totalScanned": Número total de redes encontradas,
    "initialSavedCount": Número de redes inicialmente salvas,
    "status": "Continuous scanning started"
  }
  ```
- **Status 500:** Quando ocorre um erro na varredura ou ao iniciar o processo de salvamento das redes.
  ```json
  {
    "error": "Failed to scan networks",
    "details": "Detalhes do erro"
  }
  ```

---

## **2. Banco de Dados - Modelo de Rede Wi-Fi**

As redes Wi-Fi são armazenadas no MongoDB usando o modelo `Network`, que é uma coleção de documentos contendo as seguintes propriedades:

### **Estrutura do Documento `Network`:**
- **ssid**: `String` — O nome da rede Wi-Fi. (Obrigatório)
- **bssid**: `String` — O identificador único da rede. (Obrigatório e único)
- **channel**: `Number` — O canal utilizado pela rede.
- **signalLevel**: `Number` — A intensidade do sinal da rede.
- **security**: `String` — Tipo de segurança da rede, como WEP, WPA2, etc.
- **frequency**: `Number` — A frequência da rede.
- **collectedAt**: `Date` — Data e hora em que a rede foi coletada. (Valor padrão: Data e hora atual)
- **latitude**: `Number` — Latitude do local onde a rede foi encontrada.
- **longitude**: `Number` — Longitude do local onde a rede foi encontrada.

Exemplo de documento salvo no banco de dados:

```json
{
  "ssid": "MinhaRedeWiFi",
  "bssid": "00:14:22:01:23:45",
  "channel": 6,
  "signalLevel": -65,
  "security": "WPA2",
  "frequency": 2412,
  "collectedAt": "2024-12-04T12:00:00.000Z",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

---

## **3. Funções Importantes**

### **3.1. `prepareNetworkData(networks)`**

Esta função prepara os dados das redes para serem salvos no banco de dados. Ela mapeia os dados coletados da varredura e assegura que as redes tenham os campos necessários.

#### **Parâmetros:**
- **networks**: Um array de objetos representando as redes Wi-Fi detectadas.

#### **Retorno:**
- Um array de objetos com os dados das redes prontos para serem salvos no banco.

---

### **3.2. `saveNetworks(networks)`**

Esta função salva as redes Wi-Fi no banco de dados MongoDB.

#### **Parâmetros:**
- **networks**: Um array de redes Wi-Fi a ser salvo no banco de dados.

#### **Retorno:**
- Um array de documentos das redes Wi-Fi que foram salvas com sucesso.

#### **Exceções:**
- Caso não haja redes para salvar ou ocorra um erro, a função retorna um array vazio ou lança um erro.

---

### **3.3. `startContinuousNetworkScanning(networks)`**

Esta função inicia a varredura contínua de redes Wi-Fi, realizando uma varredura inicial e, em seguida, executando varreduras periódicas a cada 60 segundos. As redes detectadas são salvas no banco de dados de forma recorrente.

#### **Parâmetros:**
- **networks**: Um array de redes detectadas na varredura inicial.

#### **Retorno:**
- Uma Promise que resolve com um array de redes inicialmente salvas.

#### **Processo:**
- A função realiza um loop que:
    1. Realiza a varredura das redes.
    2. Prepara e salva as redes no banco de dados.
    3. Aguarda 60 segundos antes de realizar a próxima varredura.

A função continua executando indefinidamente até que o servidor seja interrompido.

---

## **4. Conexão com o Banco de Dados (MongoDB)**

A conexão com o banco de dados MongoDB é realizada utilizando o `mongoose`. A URL de conexão é:

```js
mongoose.connect('mongodb://localhost:27017/wifiScanner', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
```

Se a conexão for bem-sucedida, uma mensagem será exibida no console:

```
Conectado ao MongoDB
```

Se ocorrer um erro ao tentar conectar, o erro será registrado no console.

---

## **5. Tecnologias Utilizadas**

- **Node.js**: Ambiente de execução JavaScript.
- **Express**: Framework para construção de APIs.
- **Mongoose**: Biblioteca de ODM para MongoDB.
- **node-wifi**: Biblioteca para realizar varredura de redes Wi-Fi.
- **schedule**: Biblioteca para agendamento de tarefas periódicas.

---

## **6. Considerações Finais**

Este aplicativo permite a coleta e armazenamento contínuo de informações de redes Wi-Fi em um banco de dados MongoDB. Ele utiliza varreduras periódicas para manter um monitoramento constante das redes disponíveis, o que pode ser útil em casos como mapeamento de redes em determinada área.