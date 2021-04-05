export const reviewToArticles = (review,isWareHouse) => {
    let totalToPush = null;
    let safetyStock = null;
    let qtyCounted = 0 ;
    let qtyOnHand = 0 ;  
    const summary = review.reduce((previous,current)=>{
        if(current.isItem){
            totalToPush={...current};
            qtyCounted  += Number(totalToPush.qtyCounted);
            if(safetyStock===null){
                safetyStock  = Number(totalToPush.safetyStock);
            }
            //summary QtyVariance =
            qtyOnHand += Number(totalToPush.qtyOnHand);
           

        }else{
            totalToPush.qtyVariance= isWareHouse ? qtyCounted - safetyStock : qtyCounted - qtyOnHand  ;
            totalToPush.qty  = Math.abs(totalToPush.qtyVariance);
            totalToPush.qtyFromStockVariance = qtyCounted - safetyStock;
            totalToPush.qtyFromStock =  Math.abs(totalToPush.qtyFromStockVariance);
            previous.push(totalToPush);
            qtyCounted=0;
            qtyOnHand = 0;
            safetyStock = null;
        }
        return previous;
    },[]);
    
    const articlesToOrder = new Map();
    const articlesToTransfer = new Map();
    for (let item of summary) {
        
        if ( item.qtyVariance<0) {
            articlesToOrder.set(item.key, { ...item,price:0, });
        }

        if ( item.qtyFromStockVariance<0) {
            articlesToTransfer.set(item.key, { ...item,qty:item.qtyFromStock,price:0, });
        }
    }
    return {articlesToOrder,articlesToTransfer};
}