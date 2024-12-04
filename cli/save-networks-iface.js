import axios from "axios";

const iface = process.argv[2]; // Pega o parâmetro passado no terminal

if (!iface) {
    console.error("Error: You must provide an interface as a parameter.");
    process.exit(1);
}

const saveNetworksWithIface = async () => {
    try {
        const response = await axios.post(`http://localhost:3000/save-networks/${iface}`);
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error saving networks for interface:", error.response?.data || error.message);
    }
};

saveNetworksWithIface();
