import axios from "axios";

const saveNetworks = async () => {
    try {
        const response = await axios.post("http://localhost:3000/save-networks", {
            iface: "default_iface"
        });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error saving networks:", error.response?.data || error.message);
    }
};

saveNetworks();
