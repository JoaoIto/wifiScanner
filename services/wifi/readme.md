## Função: `scanNetworksPeriodically`

### **Resumo**
Esta função inicia a varredura das redes Wi-Fi periodicamente (a cada 1 minuto) e retorna os resultados de cada varredura junto com um conjunto de parâmetros adicionais, como a quantidade de redes encontradas e o status da varredura.

### **Parâmetros**
- **`iface`** (`String`): A interface de rede que será utilizada para realizar a varredura das redes Wi-Fi. A interface é configurada no `wifi.init({ iface })`.
- **`res`** (`Object`): O objeto de resposta da requisição HTTP. A função usa `res.json()` para retornar os resultados da varredura para o cliente.

### **O que faz**
1. Inicializa a biblioteca `node-wifi` com a interface fornecida (`wifi.init({ iface })`).
2. Executa a varredura de redes Wi-Fi utilizando a função `wifi.scan()`.
3. Se a varredura for bem-sucedida, envia uma resposta contendo:
    - **`message`**: Mensagem indicando que a varredura foi iniciada.
    - **`totalScanned`**: Quantidade total de redes encontradas.
    - **`status`**: Indicação de que a varredura contínua foi iniciada.
    - **`iface`**: A interface de rede utilizada.
    - **`networks`**: Lista de redes Wi-Fi encontradas.
4. Em seguida, a função se reinicia a cada 1 minuto (60.000 ms) chamando novamente a função de varredura (`scanLoop`), criando uma verificação contínua das redes Wi-Fi.

### **Exemplo de resposta**
```json
{
  "message": "Networks scanning and saving initiated",
  "totalScanned": 12,
  "status": "Continuous scanning started",
  "iface": "Adaptador de Rede sem Fio Conexão Local* 1",
  "networks": [
    {
      "ssid": "MyNetwork_1",
      "bssid": "00:11:22:33:44:55",
      "channel": 6,
      "signalLevel": -45,
      "security": "WPA2",
      "frequency": 2412
    },
    {
      "ssid": "MyNetwork_2",
      "bssid": "00:11:22:33:44:56",
      "channel": 11,
      "signalLevel": -60,
      "security": "WPA2",
      "frequency": 2452
    }
  ]
}
```

---

## Função: `prepareNetworkData`

### **Resumo**
Essa função é responsável por formatar e preparar os dados das redes Wi-Fi encontradas para serem salvos no banco de dados. Ela assegura que as redes tenham dados mínimos e formata corretamente os valores de cada rede.

### **Parâmetros**
- **`networks`** (`Array`): Um array de objetos representando as redes Wi-Fi encontradas na varredura. Cada objeto contém informações como SSID, BSSID, sinal, canal, etc.

### **O que faz**
1. Para cada rede na lista de redes, a função extrai e formata os dados:
    - **`ssid`**: Nome da rede (caso não tenha, o valor será `'Unknown'`).
    - **`bssid`**: Endereço MAC da rede (obrigatório).
    - **`channel`**: Canal da rede.
    - **`signalLevel`**: Nível do sinal da rede.
    - **`security`**: Tipo de segurança da rede (caso não tenha, o valor será `'Unknown'`).
    - **`frequency`**: Frequência utilizada pela rede.
2. A função retorna um array de objetos formatados, excluindo redes que não possuem um **`bssid`** válido.

### **Exemplo de retorno**
```json
[
  {
    "ssid": "MyNetwork_1",
    "bssid": "00:11:22:33:44:55",
    "channel": 6,
    "signalLevel": -45,
    "security": "WPA2",
    "frequency": 2412
  },
  {
    "ssid": "MyNetwork_2",
    "bssid": "00:11:22:33:44:56",
    "channel": 11,
    "signalLevel": -60,
    "security": "WPA2",
    "frequency": 2452
  }
]
```

---

## Função: `saveNetworks`

### **Resumo**
Esta função salva as redes Wi-Fi no banco de dados MongoDB. Ela recebe as redes formatadas pela função `prepareNetworkData`, tenta salvar essas redes na coleção `Network` do banco, e retorna o resultado.

### **Parâmetros**
- **`networks`** (`Array`): Um array de redes Wi-Fi a serem salvas, geralmente retornado da função `scanNetworksPeriodically`.

### **O que faz**
1. Verifica se a lista de redes está vazia. Caso esteja, a função simplesmente retorna um array vazio.
2. Se houver redes, a função prepara os dados com a função `prepareNetworkData()`.
3. Usa o método `insertMany` do mongoose para salvar as redes na coleção `Network`. O parâmetro `ordered: false` garante que o MongoDB não interrompa a operação se houver um erro ao tentar inserir uma rede (ou seja, redes válidas continuam sendo salvas, mesmo que outras falhem).
4. Retorna o resultado da operação, que contém o número de redes salvas.

### **Exemplo de retorno**
```json
[
  {
    "_id": "63fbd8b1a4b5c79f3cdab7a5",
    "ssid": "MyNetwork_1",
    "bssid": "00:11:22:33:44:55",
    "channel": 6,
    "signalLevel": -45,
    "security": "WPA2",
    "frequency": 2412,
    "collectedAt": "2024-02-23T17:44:01.836Z",
    "__v": 0
  },
  {
    "_id": "63fbd8b1a4b5c79f3cdab7a6",
    "ssid": "MyNetwork_2",
    "bssid": "00:11:22:33:44:56",
    "channel": 11,
    "signalLevel": -60,
    "security": "WPA2",
    "frequency": 2452,
    "collectedAt": "2024-02-23T17:44:01.836Z",
    "__v": 0
  }
]
```

---

## Função: `startContinuousNetworkScanning`

### **Resumo**
Esta função inicia a varredura de redes Wi-Fi de forma contínua e as salva no banco de dados em intervalos regulares. Ela realiza a varredura a cada 1 minuto e tenta salvar as novas redes detectadas.

### **Parâmetros**
- **`networks`** (`Array`): A lista de redes Wi-Fi encontradas inicialmente, geralmente retornada pela função `scanNetworksPeriodically`.

### **O que faz**
1. Verifica se há redes para salvar. Se a lista estiver vazia, a função resolve com um array vazio.
2. Chama a função `prepareNetworkData` para formatar as redes.
3. Usa `insertMany` para salvar as redes no banco de dados.
4. Inicia um loop contínuo que, a cada 1 minuto, refaz a varredura (`wifi.scan()`) para buscar novas redes.
    - Se houver novas redes, estas também são salvas no banco de dados.
    - Caso ocorra um erro ao tentar salvar as redes, o processo é continuado, mas com uma mensagem de erro no console.
5. A função resolve com as redes salvas inicialmente.

### **Exemplo de retorno**
```json
[
  {
    "_id": "63fbd8b1a4b5c79f3cdab7a5",
    "ssid": "MyNetwork_1",
    "bssid": "00:11:22:33:44:55",
    "channel": 6,
    "signalLevel": -45,
    "security": "WPA2",
    "frequency": 2412,
    "collectedAt": "2024-02-23T17:44:01.836Z",
    "__v": 0
  },
  {
    "_id": "63fbd8b1a4b5c79f3cdab7a6",
    "ssid": "MyNetwork_2",
    "bssid": "00:11:22:33:44:56",
    "channel": 11,
    "signalLevel": -60,
    "security": "WPA2",
    "frequency": 2452,
    "collectedAt": "2024-02-23T17:44:01.836Z",
    "__v": 0
  }
]
```

---

### Conclusão

Este código implementa uma série de funções relacionadas à varredura e salvamento de redes Wi-Fi. Ele utiliza a biblioteca `node-wifi` para varrer as redes e o MongoDB para armazená-las. A funcionalidade

de varredura contínua permite que novas redes sejam constantemente detectadas e salvas no banco de dados, fornecendo uma solução robusta para monitoramento de redes Wi-Fi em tempo real.

---