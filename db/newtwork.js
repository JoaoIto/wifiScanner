import mongoose from "mongoose";

mongoose.connect('mongodb://localhost:27017/wifiScanner', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const networkSchema = new mongoose.Schema({
    ssid: {
        type: String,
        required: true,
    },
    bssid: {
        type: String,
        required: true,
        unique: true,
    },
    channel: Number,
    signalLevel: Number,
    security: String,
    frequency: Number,
    collectedAt: {
        type: Date,
        default: Date.now,
    },
    latitude: Number,
    longitude: Number,
});

export const Network = mongoose.model('Network', networkSchema);