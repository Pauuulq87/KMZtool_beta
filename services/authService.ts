import api from './api';

export interface User {
    id: string;
    email: string;
    name: string | null;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export const authService = {
    async register(email: string, password: string, name: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
    },

    getCurrentUser(): User | null {
        // This is a simple check, ideally we should validate with getMe() on app load
        // For now, we rely on the token being present and valid
        return null; // We will manage user state in React Context/State
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
};
