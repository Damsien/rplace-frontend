import axios from 'axios';

export async function refreshToken(): Promise<boolean> {
    try {
        const res = await axios.post(`http://${import.meta.env.VITE_APP_BACKEND_API_URL}/refresh`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('REFRESH_TOKEN')}`
            }
        });
    
        localStorage.setItem('ACCESS_TOKEN', res.data['access_token']);
        localStorage.setItem('SECRET_TOKEN', res.data['secret_token']);

        return true;
        
    } catch(err) {
        return false;
    }
}