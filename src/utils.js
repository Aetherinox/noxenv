module.exports = compare;

function compare(obj) { 
    return obj && obj.__esModule ? obj : { default: obj }; 
}