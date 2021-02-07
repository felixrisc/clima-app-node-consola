require('dotenv').config();
require('colors');

const {leerInput,inquirerMenu,pausa,listarLugares} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async() => {

    const busquedas = new Busquedas();
    let opt = '';

    busquedas.leerDB();
    
    do{
        opt = await inquirerMenu();
        switch (opt) {
            case 1:
                // Mostrar mensaje
                const busqueda = await leerInput('Ciudad: ');
                
                // Buscar ciudad
                const lugares = await busquedas.ciudad(busqueda);

                // Seleccionar lugar
                const idSel = await listarLugares(lugares);
                if(idSel==='0') continue;

                //Guardar en DB
                const lugarSel = lugares.find(l => l.id === idSel);
                busquedas.agregarHistorial(lugarSel.nombre);
                
                // Clima
                const clima = await busquedas.climaLugar(lugarSel.lat,lugarSel.lng);

                // Mostrar resultados
                console.clear();
                console.log('\nInformacion de la ciudad'.green);
                console.log('Ciudad: ',lugarSel.nombre.green);
                console.log('Lat:    ',lugarSel.lat);
                console.log('Long:   ',lugarSel.lng);
                console.log('Temp.:  ',clima.temp);
                console.log('Min:    ',clima.min);
                console.log('Max:    ',clima.max);
                console.log('Clima:  ',clima.desc.green);
                break;
            case 2:
                // Historial
                // busquedas.historialCapitalizado.forEach...
                busquedas.historialCapitalizado.forEach((lugar,i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${lugar}`);
                })
                break;
            
        }

        
        if(opt !== 0) await pausa();
    } while(opt !== 0);
};

main();