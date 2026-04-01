const rooms = {};

module.exports = rooms;

function generateRoomID(length = 5) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));      
    }
    return result;
} 
module.exports = {
    rooms,
    generateRoomID
}