
import productsJson from "@assets/bd-productos.json"

export const useApi = () => {

    const getProductsList = () => {
        return productsJson
    };

    const getProductById = (id) => {
        const product = productsJson.find((item) => item.id == id);
        return product
    };

    
    const editProductList = (data) => { 
        // Write the JSON file 
        const fs = require('fs');
        fs.writeFileSync(productsJson, JSON.stringify(data)); 

        console.log(productsJson)
        return productsJson
    };

    return {
        getProductsList,
        getProductById,
        editProductList
    };
};
