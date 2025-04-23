import { get } from 'https';
import { writeFile } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputFilePath = path.join(__dirname, 'accidents.json');


const fetchData = () => {
    // Filter by past 24 hours
    const url = `https://data.austintexas.gov/resource/dx9v-zd7x.json?$where=traffic_report_status_date_time>'${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}'`;

    get(url, (res) => {
        let data = '';

        // Collect data chunks
        res.on('data', (chunk) => {
            data += chunk;
        });

        // Write data to file once fully received
        res.on('end', () => {
            writeFile(outputFilePath, data, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    console.log('Data saved to', outputFilePath);
                }
            });
        });
    }).on('error', (err) => {
        console.error('Error fetching data:', err);
    });
};

fetchData();

setInterval(fetchData, 5 * 60 * 1000); // Fetch data every 5 minutes