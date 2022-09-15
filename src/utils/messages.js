const generateMessage = (text, user = 'Server') => {
    return {
        text,
        user,
        createdAt: new Date().getTime(),
    }
}

const generateLocationMessage = (location, user = 'Server') => {
    return {
        url: `https://google.com/maps?q=${location.latitude},${location.longitude}`,
        user,
        createdAt: new Date().getTime(),
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage,
}
