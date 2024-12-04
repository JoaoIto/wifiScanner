import express from 'express';
const app = express();
import wifi from 'node-wifi'
import schedule from 'node-schedule'
import Sequelize from 'sequelize'
import * as bodyParser from "express";
import {saveNetworks, startContinuousNetworkScanning} from "./services/wifi/index.js";
const port = 3000;

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
                    status: 'Continuous scanning started'
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

app.post('/networks-myapp', (req, res) => {
    const { iface } = req.body;

    try {
        // Validação básica da interface
        if (!iface) {
            return res.status(400).json({ error: 'A interface é obrigatória' });
        }

        console.log(`Iniciando varredura na interface: ${iface}`);

        wifi.init({ iface });

        wifi.scan((error, networks) => {
            if (error) {
                console.error('Erro ao varrer redes:', error);
                res.status(500).json({ error: 'Erro ao varrer redes' });
            } else {
                console.log('Varredura concluída com sucesso\n');
                console.log({
                    iface,
                    networks
                });

                res.json({
                    iface,
                    networks
                });
            }
        });
    } catch (error) {
        console.error('Erro inesperado:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/networks', (req, res) => {
    const ifaceWifi = { iface: 'Adaptador de Rede sem Fio Conexão Local* 1' };
    // LVarrer a rede e retornar os resultados em JSON
    wifi.scan((error, networks) => {
        if (error) {
            res.status(500).json({ error: 'Erro ao varrer redes' });
        } else {
            console.log('Varredura concluída com sucesso\n');
            console.log({
                ifaceWifi,
                networks
            });

            res.json({
                ifaceWifi,
                networks
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
