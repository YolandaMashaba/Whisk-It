const BASE_URL = 'http://localhost:5001/api';

// Get all bakery items
export const getItems = async () => {
    try {
        const response = await fetch(`${BASE_URL}/items`);
        if (!response.ok) {
            throw new Error('Failed to fetch items');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
};

// Get server status
export const getStatus = async () => {
    try {
        const response = await fetch(`${BASE_URL}/status`);
        if (!response.ok) {
            throw new Error('Failed to fetch status');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching status:', error);
        throw error;
    }
};
