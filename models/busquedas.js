const fs = require('fs');

const axios = require('axios');

class Busquedas {
    historial = [];
    dbPath ='./db/database.json';

    constructor(){
        this.leerDB();
    }

    get historialCapitalizado(){
        // Capitalizar cada palabra
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        });
    }

    get paramsMapBox(){
        return {
            access_token: process.env.MAPBOX_KEY,
            limit: 5,
            language: 'es'
        }
    }

    async ciudad(lugar=''){
        try {
            // petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox
            })
            //console.log('Ciudad: ',lugar);
            const resp = await instance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        } catch (error) {
            return [];
        }
    }

    get paramsOpenWeather(){
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async climaLugar(lat, lon){
        try {
            // Instanciar axios
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            })
            // resp.data
            const resp = await instance.get();
            const desc = resp.data.weather[0].description;
            const {temp,temp_min,temp_max} = resp.data.main;
            
            return {
                desc,
                min: temp_min,
                max: temp_max,
                temp
            }
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar=''){
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLocaleLowerCase());

        // Grabar en BD
        this.guardasrDB();
    }

    guardasrDB(){
        const payload={
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath,JSON.stringify(payload));
    }

    leerDB(){
        // Validar si existe BD
        if (!fs.existsSync(this.dbPath)) {
            return null;
        }
    

        const info = fs.readFileSync(this.dbPath,{encoding: 'utf-8'});
        const data = JSON.parse(info);
    
        this.historial = data.historial;

    }
}


module.exports = Busquedas;