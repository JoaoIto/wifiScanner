import express from 'express';
const app = express();
import wifi from 'node-wifi'
import * as bodyParser from "express";
import {scanNetworksPeriodically, startContinuousNetworkScanning} from "./services/wifi/index.js";

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
// Utilizar o middleware para analisar o corpo da requisição
app.use(bodyParser.json());

wifi.init({ iface: 'Adaptador de Rede sem Fio Conexão Local* 1' });

app.get('/', (req, res) => {
    // Teste de run API

    return res.json({ message: "Hello World "});
});

app.post('/save-networks', (req, res) => {
    // Specify the network interface (adjust as needed)
    wifi.init({ iface: 'Adaptador de Rede sem Fio Conexão Local* 1' });

    wifi.scan((error, networks) => {
        if (error) {
            console.error('WiFi Scan Error:', error);
            return res.status(500).json({
                error: 'Failed to scan networks',
                details: error.message
            });
        }

        // Save scanned networks
        startContinuousNetworkScanning(networks)
            .then(savedNetworks => {
                res.status(200).json({
                    message: 'Networks scanning and saving initiated',
                    totalScanned: networks.length,
                    initialSavedCount: savedNetworks.length,
                    status: 'Continuous scanning started',
                    networks: savedNetworks
                });
            })
            .catch(saveError => {
                console.error('Error saving networks:', saveError);
                res.status(500).json({
                    error: 'Failed to initiate network scanning',
                    details: saveError.message
                });
            });
    });
});

// Rota para iniciar a varredura de redes com uma interface personalizada
app.post('/save-networks/:iface', (req, res) => {
    const iface = req.params.iface; // Pega a interface passada como parâmetro

    if (!iface) {
        return res.status(400).json({
            error: 'Interface not provided'
        });
    }

    wifi.init({ iface: iface });

    wifi.scan((error, networks) => {
        if (error) {
            console.error('WiFi Scan Error:', error);
            return res.status(500).json({
                error: 'Failed to scan networks',
                details: error.message
            });
        }

        startContinuousNetworkScanning(networks)
            .then(savedNetworks => {
                res.status(200).json({
                    message: 'Networks scanning and saving initiated',
                    totalScanned: networks.length,
                    initialSavedCount: savedNetworks.length,
                    status: 'Continuous scanning started',
                    networks: savedNetworks
                });
            })
            .catch(saveError => {
                console.error('Error saving networks:', saveError);
                res.status(500).json({
                    error: 'Failed to initiate network scanning',
                    details: saveError.message
                });
            });
    });
});

// Rota POST para iniciar a varredura na interface especificada
app.post('/networks-myapp', (req, res) => {
    const { iface } = req.body;

    try {
        // Validação básica da interface
        if (!iface) {
            return res.status(400).json({ error: 'A interface é obrigatória' });
        }

        console.log(`Iniciando varredura na interface: ${iface}`);

        scanNetworksPeriodically(iface, res); // Chama a função de verificação contínua
    } catch (error) {
        console.error('Erro inesperado:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota GET para varrer a rede na interface padrão
app.get('/networks', (req, res) => {
    const ifaceWifi = 'Adaptador de Rede sem Fio Conexão Local* 1'; // Interface padrão

    console.log(`Iniciando varredura na interface padrão: ${ifaceWifi}`);
    scanNetworksPeriodically(ifaceWifi, res); // Chama a função de verificação contínua
});
