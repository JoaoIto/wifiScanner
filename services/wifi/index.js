import wifi from "node-wifi";
import schedule from "node-schedule";
import {Network} from "../../db/newtwork.js";


// Função para verificar redes Wi-Fi periodicamente
export const scanNetworksPeriodically = (iface, res) => {
    wifi.init({ iface });

    const scanLoop = () => {
        wifi.scan((error, networks) => {
            if (error) {
                console.error('Erro ao varrer redes:', error);
                res.status(500).json({ error: 'Erro ao varrer redes' });
            } else {
                console.log(`Varredura na interface ${iface} concluída com sucesso.\n`);

                // Preparar dados da resposta
                const response = {
                    message: "Networks scanning and saving initiated",
                    totalScanned: networks.length,  // Total de redes encontradas
                    status: "Continuous scanning started",  // Status da varredura contínua
                    iface,
                    networks  // Redes encontradas
                };

                // Enviar a resposta com as informações adicionais
                res.json(response);

                // Continuar verificando a cada 1 minuto (60000ms)
                setTimeout(scanLoop, 60000);
            }
        });
    };

    scanLoop();
};

// Função para varrer as redes e salvar no banco de dados

// Prepare network data for saving
const prepareNetworkData = (networks) => {
    return networks.map(network => ({
        ssid: network.ssid || 'Unknown',
        bssid: network.bssid,
        channel: network.channel,
        signalLevel: network.signal_level,
        security: network.security || 'Unknown',
        frequency: network.frequency
    })).filter(network => network.bssid);
};

// Save networks to database
export const saveNetworks = async (networks) => {
    if (!networks || networks.length === 0) {
        console.warn('No networks to save');
        return [];
    }

    try {
        const networkDocuments = prepareNetworkData(networks);

        const result = await Network.insertMany(networkDocuments, {
            ordered: false
        });

        console.log(`Successfully saved ${result.length} networks`);
        return result;
    } catch (error) {
        console.error('Error saving networks:', error);
        throw error;
    }
};


export const startContinuousNetworkScanning = (networks) => {
    return new Promise((resolve, reject) => {
        // Check if networks are available
        if (!networks || networks.length === 0) {
            console.warn('No networks to save');
            return resolve([]);
        }

        // Prepare for recursive saving with delay
        const saveNetworksWithDelay = async () => {
            try {
                // Prepare network documents
                const networkDocuments = prepareNetworkData(networks);

                // Save networks to database
                const savedNetworks = await Network.insertMany(networkDocuments, {
                    ordered: false
                });

                console.log(`Successfully saved ${savedNetworks.length} networks`);

                // Recursive loop with 5-second delay
                const saveLoop = () => {
                    setTimeout(async () => {
                        try {
                            // Rescan networks
                            wifi.scan((error, newNetworks) => {
                                if (error) {
                                    console.error('WiFi Scan Error:', error);
                                    // Continue the loop even on error
                                    saveLoop();
                                    return;
                                }

                                // Prepare and save new networks
                                const newNetworkDocuments = prepareNetworkData(newNetworks);

                                Network.insertMany(newNetworkDocuments, {
                                    ordered: false
                                })
                                    .then(additionalSavedNetworks => {
                                        console.log(`Additionally saved ${additionalSavedNetworks.length} networks`);
                                        // Continue the loop
                                        saveLoop();
                                    })
                                    .catch(saveError => {
                                        console.error('Error saving additional networks:', saveError);
                                        // Continue the loop even on save error
                                        saveLoop();
                                    });
                            });
                        } catch (loopError) {
                            console.error('Error in save loop:', loopError);
                            // Continue the loop
                            saveLoop();
                        }
                    }, 60000); // 1 minute delay
                };

                // Start the recursive loop
                saveLoop();

                // Resolve the promise with initially saved networks
                resolve(savedNetworks);

            } catch (error) {
                console.error('Error saving networks:', error);
                reject(error);
            }
        };

        // Start the initial save process
        saveNetworksWithDelay();
    });


};
