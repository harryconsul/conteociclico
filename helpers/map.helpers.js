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
            previous.push(totalToPush);
            qtyCounted=0;
            qtyOnHand = 0;
            safetyStock = null;
        }
        return previous;
    },[]);
    
    const articles = new Map();
    for (let item of summary) {
        
        if ( item.qtyVariance<0) {
            articles.set(item.key, { ...item,price:0, });
        }
    }
    return articles;
}