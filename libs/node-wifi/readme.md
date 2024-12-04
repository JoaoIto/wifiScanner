### Documentação do `node-wifi`

#### O que é a lib `node-wifi`?

A `node-wifi` é uma biblioteca para o Node.js que permite interagir com interfaces Wi-Fi em sistemas baseados em Linux, macOS e Windows. Ela facilita a detecção de redes Wi-Fi disponíveis, a conexão a redes e a desconexão de redes Wi-Fi, permitindo que você gerencie conexões Wi-Fi diretamente a partir do seu código Node.js.

#### Como foi utilizada no projeto?

No projeto, a `node-wifi` foi utilizada para realizar a varredura periódica de redes Wi-Fi e processar os resultados. As principais funções utilizadas da biblioteca foram:

1. **`wifi.init({ iface })`**: Inicializa a biblioteca `node-wifi` e especifica a interface de rede (`iface`) que será utilizada para realizar a varredura das redes Wi-Fi. Essa interface pode ser configurada dinamicamente em diferentes pontos do projeto.

2. **`wifi.scan(callback)`**: Inicia a varredura de redes Wi-Fi na interface especificada. A função retorna um array de redes Wi-Fi detectadas, com informações como SSID, BSSID, canal, intensidade do sinal, segurança e frequência. A varredura é realizada periodicamente no projeto, permitindo a detecção constante de novas redes.

    - Exemplo de uso:
      ```javascript
      wifi.scan((error, networks) => {
          if (error) {
              console.error('Erro ao varrer redes:', error);
          } else {
              console.log('Redes Wi-Fi encontradas:', networks);
          }
      });
      ```

3. **`wifi.scan()` com `setTimeout()`**: No projeto, a varredura é realizada de forma contínua, sendo chamada a cada 1 minuto. Isso é feito utilizando o `setTimeout()` para reiniciar o processo de varredura após cada execução, garantindo que as redes Wi-Fi sejam monitoradas em intervalos regulares.

4. **Interação com o Banco de Dados**: Após a varredura das redes, os dados coletados (como SSID, BSSID, sinal, etc.) são formatados e salvos em um banco de dados MongoDB para monitoramento e análise a longo prazo.

#### Instalação

Para instalar a `node-wifi`, você pode usar o comando npm:

```bash
npm install node-wifi
```

#### Link para a lib no npm

Você pode acessar a documentação completa da `node-wifi` no [npm](https://www.npmjs.com/package/node-wifi).

---