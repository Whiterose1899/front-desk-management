import http from 'k6/http';
import {check,sleep} from 'k6';

const BASE_URL = 'http://localhost:8000';

function login() {
    const payload = {
        username: 'BK',
        password: 'BK'
    };
    const response = http.post(
        `${BASE_URL}/auth/login`,
        payload
    );
    if(response.status !== 200) {
        throw new Error(`Login failed with status ${response.status}`);
    }
    return response.json().access_token;
}

function getRooms(token) {
    const headers = {
        Authorization: `Bearer ${token}`
    };
    return http.get(
        `${BASE_URL}/room/allrooms`,
        { headers: headers }
    );
}

export const options = {
    vus: 17,
    duration: '60s',
}

export default function(){
    const token = login();

    const response = getRooms(token);
    
    check(response, {'Rooms loaded': (r) => r.status === 200,});
    
    sleep(Math.random()*2+0.5);
}