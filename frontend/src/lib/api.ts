import axios from 'axios';
import { Trip, VehiclePosition, Alert } from '../types/subway';

const API_BASE_URL = 'http://localhost:8000/api/subway';

export class SubwayAPI {
    static async getLineGroups() {
        const response = await axios.get(`${API_BASE_URL}/lines`);
        return response.data.line_groups;
    }

    static async getActiveTrips(lineGroup: string = '1-2-3'): Promise<Trip[]> {
        const response = await axios.get(`${API_BASE_URL}/feed/${lineGroup}`);
        return response.data.trips || [];
    }

    static async getVehiclePositions(lineGroup: string = '1-2-3'): Promise<VehiclePosition[]> {
        const response = await axios.get(`${API_BASE_URL}/feed/${lineGroup}`);
        return response.data.vehicle_positions || [];
    }

    static async getActiveAlerts(lineGroup: string = '1-2-3'): Promise<Alert[]> {
        const response = await axios.get(`${API_BASE_URL}/feed/${lineGroup}`);
        return response.data.alerts || [];
    }

    static async getServiceStatus() {
        const response = await axios.get(`${API_BASE_URL}/status`);
        return response.data;
    }
}