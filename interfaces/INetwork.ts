export interface INetwork {
    id?: number; // Optional ID property for clarity (assuming auto-increment)
    ssid: string;
    bssid: string;
    channel?: number; // Optional channel property
    signal_level?: number; // Optional signal_level property
    security?: string; // Optional security property
    frequency?: number; // Optional frequency property
    collected_at: Date;
    latitude: number;
    longitude: number;
}