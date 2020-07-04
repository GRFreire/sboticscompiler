const getJson = (path) => {
    const data = fs.existsSync(path) ? fs.readFileSync(path) : [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return undefined;      
    }
};
const saveJson = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, '\t'));

module.exports = { getJson, saveJson };
