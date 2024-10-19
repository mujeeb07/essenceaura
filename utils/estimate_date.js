
function get_estimated_date() {
    const today = new Date();

    
    const deliveryDays = Math.floor(Math.random() * 5) + 8;

    
    today.setDate(today.getDate() + deliveryDays);


    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-GB', options);
}


module.exports = { get_estimated_date }  
