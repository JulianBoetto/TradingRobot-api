const axios = require('axios');
const crypto = require('crypto')

const apiUrl = process.env.API_URL
const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;

async function privateCall(path, data = {}, method = 'GET') {
    const timestamp = Date.now();
    const signature = crypto.createHmac('sha256', apiSecret)
                    .update(`${new URLSearchParams({...data,timestamp}).toString()}`)
                    .digest('hex');
    
    const newData = { ...data, timestamp, signature };
    const qs = `?${new URLSearchParams(newData).toString()}`

    try {
        const result = await axios({
            method,
            url: `${apiUrl}${path}${qs}`,
            headers: { 'X-MBX-APIKEY': apiKey }
        })

        return result.data;
    } catch (error) {
        console.log(error)
    }
}

async function accountInfo() {
    return privateCall('/v3/account')
}

async function publicCall(path, data, method = 'GET') {
    try {
        const qs = data ? `?${new URLSearchParams(data).toString()}` :  '';
        const result = await axios({
            method,
            url: `${apiUrl}${path}${qs}`
        })
        return result.data
    } catch (error) {
        console.log(error)
    }
}

async function time() {
    return publicCall('/v3/time');
}

async function depth(symbol = 'BTCBRL', limit = 5) {
    return publicCall('/v3/depth', {symbol, limit})
}

async function exchangeInfo() {
    return publicCall('/v3/exchangeInfo')
}

module.exports = { time, depth, exchangeInfo, accountInfo }