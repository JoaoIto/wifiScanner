import axios from "axios";

const getNetworks = async () => {
    try {
        const response = await axios.get("http://localhost:3000/networks");
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error fetching networks:", error.response?.data || error.message);
    }
};

getNetworks();
