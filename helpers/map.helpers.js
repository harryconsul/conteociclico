export const reviewToArticles = (review) => {
    let totalToPush = null;
    const summary = review.reduce((previous,current)=>{
        if(current.isItem){
            totalToPush={...current};
        }else{
            totalToPush.qtyVariance=current.qtyVariance;
            totalToPush.qty  = Number(current.qtyVariance.replace("-",""))
            previous.push(totalToPush);
        }
        return previous;
    },[]);
    
    const articles = new Map();
    for (let item of summary) {
        
        if ( Number(item.qtyVariance)<0 || item.qtyVariance.indexOf("-")>=0) {
            articles.set(item.key, { ...item,price:0, });
        }
    }
    return articles;
}